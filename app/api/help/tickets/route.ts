import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DocumentationService } from '@/lib/services/documentation-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const tickets = await DocumentationService.getUserTickets(
      userId,
      status || undefined,
      limit,
      offset
    );

    return NextResponse.json({ tickets });
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
      return ApiErrorHandler.badRequest('Invalid JSON in request body', requestId);
    }

    const {
      subject,
      description,
      category,
      priority = 'medium',
      organizationId,
      attachments = [],
      tags = [],
      customFields = {}
    } = body;

    if (!subject || !description || !category) {
      return ApiErrorHandler.badRequest(
        'Missing required fields: subject, description, category',
        requestId
      );
    }

    const ticket = await DocumentationService.createSupportTicket(
      userId,
      subject,
      description,
      category,
      priority,
      organizationId,
      attachments,
      tags,
      customFields
    );

    return NextResponse.json(ticket);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
