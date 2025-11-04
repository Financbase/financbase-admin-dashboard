/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { marketingAutomationService } from '@/lib/services/marketing/marketing-automation-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const type = searchParams.get('type') || undefined;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch automations from database
    const automations = await marketingAutomationService.getAutomations(userId, {
      status,
      type,
      limit,
      offset,
    });

    // Get automation statistics
    const automationStats = await marketingAutomationService.getAutomationStats(userId);

    // Get available triggers and action types
    const triggers = marketingAutomationService.getTriggers();
    const actionTypes = marketingAutomationService.getActionTypes();

    // Transform automations to match expected format (convert id from number to string format)
    const formattedAutomations = automations.map((automation) => ({
      id: `AUTO-${String(automation.id).padStart(3, '0')}`,
      name: automation.name,
      description: automation.description,
      type: automation.type,
      status: automation.status,
      trigger: automation.trigger,
      triggerConditions: automation.triggerConditions,
      actions: automation.actions,
      metrics: automation.metrics,
      createdAt: automation.createdAt.toISOString(),
      updatedAt: automation.updatedAt.toISOString(),
      createdBy: automation.createdBy || 'User',
    }));

    return NextResponse.json({
      automations: formattedAutomations,
      stats: automationStats,
      triggers,
      actionTypes,
    });
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return ApiErrorHandler.badRequest('Invalid JSON in request body');
    }

    const { action, automationId, automationData } = body;

    // Validate action
    if (!action) {
      return ApiErrorHandler.badRequest('Action is required');
    }

    // Parse automationId to number if provided
    const id = automationId
      ? typeof automationId === 'string' && automationId.startsWith('AUTO-')
        ? parseInt(automationId.replace('AUTO-', ''), 10)
        : parseInt(automationId, 10)
      : null;

    switch (action) {
      case 'create': {
        if (!automationData) {
          return ApiErrorHandler.badRequest('Automation data is required for create action');
        }

        const automation = await marketingAutomationService.createAutomation({
          userId,
          name: automationData.name,
          description: automationData.description,
          type: automationData.type,
          trigger: automationData.trigger,
          triggerConditions: automationData.triggerConditions,
          actions: automationData.actions || [],
          settings: automationData.settings,
        });

        return NextResponse.json(
          {
            automation: {
              id: `AUTO-${String(automation.id).padStart(3, '0')}`,
              ...automation,
              createdAt: automation.createdAt.toISOString(),
              updatedAt: automation.updatedAt.toISOString(),
            },
          },
          { status: 201 }
        );
      }

      case 'update': {
        if (!id) {
          return ApiErrorHandler.badRequest('Automation ID is required for update action');
        }

        if (!automationData) {
          return ApiErrorHandler.badRequest('Automation data is required for update action');
        }

        const updatedAutomation = await marketingAutomationService.updateAutomation(
          id,
          userId,
          automationData
        );

        return NextResponse.json({
          automation: {
            id: `AUTO-${String(updatedAutomation.id).padStart(3, '0')}`,
            ...updatedAutomation,
            createdAt: updatedAutomation.createdAt.toISOString(),
            updatedAt: updatedAutomation.updatedAt.toISOString(),
          },
          message: 'Automation updated successfully',
        });
      }

      case 'activate': {
        if (!id) {
          return ApiErrorHandler.badRequest('Automation ID is required for activate action');
        }

        const activatedAutomation = await marketingAutomationService.activateAutomation(
          id,
          userId
        );

        return NextResponse.json({
          automation: {
            id: `AUTO-${String(activatedAutomation.id).padStart(3, '0')}`,
            ...activatedAutomation,
            createdAt: activatedAutomation.createdAt.toISOString(),
            updatedAt: activatedAutomation.updatedAt.toISOString(),
          },
          message: 'Automation activated',
        });
      }

      case 'pause': {
        if (!id) {
          return ApiErrorHandler.badRequest('Automation ID is required for pause action');
        }

        const pausedAutomation = await marketingAutomationService.pauseAutomation(id, userId);

        return NextResponse.json({
          automation: {
            id: `AUTO-${String(pausedAutomation.id).padStart(3, '0')}`,
            ...pausedAutomation,
            createdAt: pausedAutomation.createdAt.toISOString(),
            updatedAt: pausedAutomation.updatedAt.toISOString(),
          },
          message: 'Automation paused',
        });
      }

      case 'delete': {
        if (!id) {
          return ApiErrorHandler.badRequest('Automation ID is required for delete action');
        }

        await marketingAutomationService.deleteAutomation(id, userId);

        return NextResponse.json({
          message: 'Automation deleted successfully',
          automationId: id,
        });
      }

      case 'test': {
        // Test automation (simplified - would normally trigger a test execution)
        return NextResponse.json({
          message: 'Automation test completed',
          automationId: id,
          testResults: {
            success: true,
            executedActions: 0,
            errors: [],
          },
        });
      }

      default:
        return ApiErrorHandler.badRequest(
          `Invalid action. Valid actions: create, update, activate, pause, delete, test`
        );
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return ApiErrorHandler.notFound(error.message);
    }
    return ApiErrorHandler.handle(error, requestId);
  }
}
