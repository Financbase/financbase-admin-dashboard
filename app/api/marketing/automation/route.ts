import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const type = searchParams.get('type') || undefined;

    // Mock automation data - in production, this would come from your automation service
    const automations = [
      {
        id: 'AUTO-001',
        name: 'Welcome Email Sequence',
        description: 'New subscriber welcome email series',
        type: 'email_sequence',
        status: 'active',
        trigger: 'user_signup',
        triggerConditions: {
          source: 'website',
          country: 'US'
        },
        actions: [
          {
            id: 'action-1',
            type: 'send_email',
            delay: 0,
            template: 'welcome_email',
            subject: 'Welcome to our platform!'
          },
          {
            id: 'action-2',
            type: 'send_email',
            delay: 86400, // 24 hours
            template: 'getting_started',
            subject: 'Getting started with our platform'
          },
          {
            id: 'action-3',
            type: 'send_email',
            delay: 259200, // 3 days
            template: 'feature_showcase',
            subject: 'Discover our key features'
          }
        ],
        metrics: {
          totalRuns: 1250,
          successRate: 98.5,
          averageEngagement: 12.3,
          conversionRate: 8.7
        },
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-20T14:30:00Z',
        createdBy: 'Marketing Team'
      },
      {
        id: 'AUTO-002',
        name: 'Abandoned Cart Recovery',
        description: 'Recover abandoned shopping carts with targeted emails',
        type: 'cart_recovery',
        status: 'active',
        trigger: 'cart_abandoned',
        triggerConditions: {
          cartValue: { min: 50 },
          timeSinceLastActivity: 1800 // 30 minutes
        },
        actions: [
          {
            id: 'action-1',
            type: 'send_email',
            delay: 1800, // 30 minutes
            template: 'cart_reminder_1',
            subject: 'Don\'t forget your items!'
          },
          {
            id: 'action-2',
            type: 'send_email',
            delay: 86400, // 24 hours
            template: 'cart_reminder_2',
            subject: 'Complete your purchase with 10% off'
          },
          {
            id: 'action-3',
            type: 'send_email',
            delay: 259200, // 3 days
            template: 'cart_reminder_3',
            subject: 'Last chance - 15% off your order'
          }
        ],
        metrics: {
          totalRuns: 890,
          successRate: 95.2,
          averageEngagement: 18.7,
          conversionRate: 12.4
        },
        createdAt: '2024-01-10T09:00:00Z',
        updatedAt: '2024-01-18T16:45:00Z',
        createdBy: 'E-commerce Team'
      },
      {
        id: 'AUTO-003',
        name: 'Lead Nurturing Campaign',
        description: 'Nurture leads through the sales funnel',
        type: 'lead_nurturing',
        status: 'paused',
        trigger: 'lead_created',
        triggerConditions: {
          leadScore: { min: 30 },
          source: ['website', 'social_media']
        },
        actions: [
          {
            id: 'action-1',
            type: 'send_email',
            delay: 0,
            template: 'lead_welcome',
            subject: 'Thanks for your interest!'
          },
          {
            id: 'action-2',
            type: 'add_to_crm',
            delay: 0,
            crmField: 'status',
            value: 'nurturing'
          },
          {
            id: 'action-3',
            type: 'send_email',
            delay: 604800, // 7 days
            template: 'case_study',
            subject: 'How we helped [Company] achieve success'
          },
          {
            id: 'action-4',
            type: 'schedule_follow_up',
            delay: 1209600, // 14 days
            taskType: 'sales_call',
            assignedTo: 'sales_team'
          }
        ],
        metrics: {
          totalRuns: 2100,
          successRate: 92.8,
          averageEngagement: 15.2,
          conversionRate: 6.3
        },
        createdAt: '2024-01-05T11:00:00Z',
        updatedAt: '2024-01-22T10:15:00Z',
        createdBy: 'Sales Team'
      },
      {
        id: 'AUTO-004',
        name: 'Customer Onboarding',
        description: 'Guide new customers through onboarding process',
        type: 'onboarding',
        status: 'draft',
        trigger: 'customer_signup',
        triggerConditions: {
          plan: ['premium', 'enterprise']
        },
        actions: [
          {
            id: 'action-1',
            type: 'send_email',
            delay: 0,
            template: 'onboarding_welcome',
            subject: 'Welcome! Let\'s get you started'
          },
          {
            id: 'action-2',
            type: 'create_task',
            delay: 0,
            taskType: 'onboarding_call',
            assignedTo: 'customer_success'
          },
          {
            id: 'action-3',
            type: 'send_email',
            delay: 86400, // 24 hours
            template: 'onboarding_tips',
            subject: '5 tips to maximize your success'
          }
        ],
        metrics: {
          totalRuns: 0,
          successRate: 0,
          averageEngagement: 0,
          conversionRate: 0
        },
        createdAt: '2024-01-25T14:00:00Z',
        updatedAt: '2024-01-25T14:00:00Z',
        createdBy: 'Customer Success Team'
      }
    ];

    const automationStats = {
      totalAutomations: automations.length,
      activeAutomations: automations.filter(a => a.status === 'active').length,
      pausedAutomations: automations.filter(a => a.status === 'paused').length,
      draftAutomations: automations.filter(a => a.status === 'draft').length,
      totalRuns: automations.reduce((sum, a) => sum + a.metrics.totalRuns, 0),
      averageSuccessRate: automations.reduce((sum, a) => sum + a.metrics.successRate, 0) / automations.length,
      averageConversionRate: automations.reduce((sum, a) => sum + a.metrics.conversionRate, 0) / automations.length
    };

    const triggers = [
      { id: 'user_signup', name: 'User Signup', description: 'Triggered when a new user signs up' },
      { id: 'cart_abandoned', name: 'Cart Abandoned', description: 'Triggered when a cart is abandoned' },
      { id: 'lead_created', name: 'Lead Created', description: 'Triggered when a new lead is created' },
      { id: 'customer_signup', name: 'Customer Signup', description: 'Triggered when a customer signs up' },
      { id: 'email_opened', name: 'Email Opened', description: 'Triggered when an email is opened' },
      { id: 'link_clicked', name: 'Link Clicked', description: 'Triggered when a link is clicked' },
      { id: 'form_submitted', name: 'Form Submitted', description: 'Triggered when a form is submitted' },
      { id: 'page_visited', name: 'Page Visited', description: 'Triggered when a page is visited' }
    ];

    const actionTypes = [
      { id: 'send_email', name: 'Send Email', description: 'Send an email to the contact' },
      { id: 'add_to_crm', name: 'Add to CRM', description: 'Add or update contact in CRM' },
      { id: 'schedule_follow_up', name: 'Schedule Follow-up', description: 'Schedule a follow-up task' },
      { id: 'create_task', name: 'Create Task', description: 'Create a new task' },
      { id: 'add_tag', name: 'Add Tag', description: 'Add a tag to the contact' },
      { id: 'remove_tag', name: 'Remove Tag', description: 'Remove a tag from the contact' },
      { id: 'update_field', name: 'Update Field', description: 'Update a contact field' },
      { id: 'wait', name: 'Wait', description: 'Wait for a specified time' }
    ];

    const filteredAutomations = automations.filter(automation => {
      if (status && automation.status !== status) return false;
      if (type && automation.type !== type) return false;
      return true;
    });

    return NextResponse.json({
      automations: filteredAutomations,
      stats: automationStats,
      triggers,
      actionTypes
    });
  } catch (error) {
    console.error('Error fetching marketing automation data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch marketing automation data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, automationId, automationData } = body;

    switch (action) {
      case 'create':
        // Create new automation
        const newAutomation = {
          id: `AUTO-${Date.now()}`,
          ...automationData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: userId,
          metrics: {
            totalRuns: 0,
            successRate: 0,
            averageEngagement: 0,
            conversionRate: 0
          }
        };
        return NextResponse.json({ automation: newAutomation });

      case 'update':
        // Update existing automation
        return NextResponse.json({ 
          message: 'Automation updated successfully',
          automationId,
          updatedAt: new Date().toISOString()
        });

      case 'activate':
        // Activate automation
        return NextResponse.json({ 
          message: 'Automation activated',
          automationId,
          status: 'active'
        });

      case 'pause':
        // Pause automation
        return NextResponse.json({ 
          message: 'Automation paused',
          automationId,
          status: 'paused'
        });

      case 'delete':
        // Delete automation
        return NextResponse.json({ 
          message: 'Automation deleted',
          automationId
        });

      case 'test':
        // Test automation
        return NextResponse.json({ 
          message: 'Automation test completed',
          automationId,
          testResults: {
            success: true,
            executedActions: 3,
            errors: []
          }
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing marketing automation action:', error);
    return NextResponse.json(
      { error: 'Failed to process marketing automation action' },
      { status: 500 }
    );
  }
}
