import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { WorkflowEngine } from '@/lib/services/workflow-engine';

export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Mock workflows data
		const workflows = [
			{
				id: 1,
				name: 'Invoice Approval Process',
				description: 'Automatically route invoices over $1000 for manager approval',
				category: 'invoice',
				type: 'sequential',
				status: 'active',
				isActive: true,
				steps: [
					{
						id: 'check_amount',
						name: 'Check Invoice Amount',
						type: 'condition',
						configuration: { threshold: 1000 }
					},
					{
						id: 'send_approval',
						name: 'Send for Approval',
						type: 'notification',
						configuration: {
							title: 'Invoice Requires Approval',
							message: 'Invoice {{invoiceNumber}} for ${{amount}} requires your approval'
						}
					},
					{
						id: 'log_approval',
						name: 'Log Approval',
						type: 'action',
						configuration: { action: 'log_approval' }
					}
				],
				triggers: [
					{
						id: 1,
						type: 'invoice_created',
						conditions: { amount: { operator: 'greater_than', value: 1000 } }
					}
				],
				executionCount: 15,
				successRate: 95.5,
				lastExecutionAt: '2024-11-15T10:30:00Z',
				createdAt: '2024-11-01T00:00:00Z',
			},
			{
				id: 2,
				name: 'Overdue Invoice Reminders',
				description: 'Send automated reminders for overdue invoices',
				category: 'invoice',
				type: 'sequential',
				status: 'active',
				isActive: true,
				steps: [
					{
						id: 'check_overdue',
						name: 'Check Overdue Status',
						type: 'condition',
						configuration: { daysOverdue: { operator: 'greater_than', value: 0 } }
					},
					{
						id: 'send_reminder',
						name: 'Send Reminder Email',
						type: 'email',
						configuration: {
							subject: 'Overdue Invoice Reminder - {{invoiceNumber}}',
							template: 'overdue_reminder'
						}
					}
				],
				triggers: [
					{
						id: 2,
						type: 'schedule',
						conditions: { schedule: '0 9 * * 1' } // Every Monday at 9 AM
					}
				],
				executionCount: 8,
				successRate: 100,
				lastExecutionAt: '2024-11-11T09:00:00Z',
				createdAt: '2024-10-15T00:00:00Z',
			},
		];

		return NextResponse.json(workflows);
	} catch (error) {
		console.error('Error fetching workflows:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { name, description, category, type, steps, triggers } = body;

		if (!name || !category || !type) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Mock new workflow creation
		const newWorkflow = {
			id: Date.now(),
			name,
			description: description || '',
			category,
			type,
			status: 'draft',
			isActive: false,
			steps: steps || [],
			triggers: triggers || [],
			executionCount: 0,
			successRate: 0,
			createdAt: new Date().toISOString(),
		};

		return NextResponse.json(newWorkflow, { status: 201 });
	} catch (error) {
		console.error('Error creating workflow:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
