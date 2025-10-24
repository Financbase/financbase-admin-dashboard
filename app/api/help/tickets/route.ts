import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DocumentationService } from '@/lib/services/documentation-service';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch support tickets',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
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
      return NextResponse.json({ 
        error: 'Missing required fields: subject, description, category' 
      }, { status: 400 });
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
    console.error('Error creating support ticket:', error);
    return NextResponse.json({ 
      error: 'Failed to create support ticket',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
