/**
 * Workspace Management Service
 * Handles CRUD operations for workspaces, clients, approvals, and collaboration features
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { Workspace, WorkspaceMember, Client, ApprovalWorkflow, ApprovalRequest, Comment, PracticeMetrics } from '@/types/auth';
import { CollaborationPermission } from '@/types/auth';

export class WorkspaceService {
	private baseUrl: string;

	constructor(baseUrl: string = '/api/workspaces') {
		this.baseUrl = baseUrl;
	}

	// Workspace Management
	async createWorkspace(workspace: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workspace> {
		const response = await fetch(`${this.baseUrl}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(workspace),
		});

		if (!response.ok) throw new Error('Failed to create workspace');
		return response.json();
	}

	async getWorkspaces(organizationId?: string): Promise<Workspace[]> {
		const url = organizationId
			? `${this.baseUrl}?organizationId=${organizationId}`
			: this.baseUrl;

		const response = await fetch(url);
		if (!response.ok) throw new Error('Failed to fetch workspaces');
		return response.json();
	}

	async getWorkspace(workspaceId: string): Promise<Workspace> {
		const response = await fetch(`${this.baseUrl}/${workspaceId}`);
		if (!response.ok) throw new Error('Failed to fetch workspace');
		return response.json();
	}

	async updateWorkspace(workspaceId: string, updates: Partial<Workspace>): Promise<Workspace> {
		const response = await fetch(`${this.baseUrl}/${workspaceId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(updates),
		});

		if (!response.ok) throw new Error('Failed to update workspace');
		return response.json();
	}

	async deleteWorkspace(workspaceId: string): Promise<void> {
		const response = await fetch(`${this.baseUrl}/${workspaceId}`, {
			method: 'DELETE',
		});

		if (!response.ok) throw new Error('Failed to delete workspace');
	}

	// Workspace Members Management
	async addWorkspaceMember(
		workspaceId: string,
		member: Omit<WorkspaceMember, 'id' | 'joinedAt'>
	): Promise<WorkspaceMember> {
		const response = await fetch(`${this.baseUrl}/${workspaceId}/members`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(member),
		});

		if (!response.ok) throw new Error('Failed to add workspace member');
		return response.json();
	}

	async updateWorkspaceMember(
		workspaceId: string,
		memberId: string,
		updates: Partial<WorkspaceMember>
	): Promise<WorkspaceMember> {
		const response = await fetch(`${this.baseUrl}/${workspaceId}/members/${memberId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(updates),
		});

		if (!response.ok) throw new Error('Failed to update workspace member');
		return response.json();
	}

	async removeWorkspaceMember(workspaceId: string, memberId: string): Promise<void> {
		const response = await fetch(`${this.baseUrl}/${workspaceId}/members/${memberId}`, {
			method: 'DELETE',
		});

		if (!response.ok) throw new Error('Failed to remove workspace member');
	}

	async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
		const response = await fetch(`${this.baseUrl}/${workspaceId}/members`);
		if (!response.ok) throw new Error('Failed to fetch workspace members');
		return response.json();
	}

	// Client Management
	async createClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
		const response = await fetch(`${this.baseUrl}/${client.workspaceId}/clients`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(client),
		});

		if (!response.ok) throw new Error('Failed to create client');
		return response.json();
	}

	async getClients(workspaceId: string, filters?: {
		status?: Client['status'];
		assignedAccountant?: string;
		engagementType?: Client['engagementType'];
	}): Promise<Client[]> {
		const params = new URLSearchParams();
		if (filters?.status) params.append('status', filters.status);
		if (filters?.assignedAccountant) params.append('assignedAccountant', filters.assignedAccountant);
		if (filters?.engagementType) params.append('engagementType', filters.engagementType);

		const url = `${this.baseUrl}/${workspaceId}/clients${params.toString() ? `?${params.toString()}` : ''}`;
		const response = await fetch(url);

		if (!response.ok) throw new Error('Failed to fetch clients');
		return response.json();
	}

	async getClient(workspaceId: string, clientId: string): Promise<Client> {
		const response = await fetch(`${this.baseUrl}/${workspaceId}/clients/${clientId}`);
		if (!response.ok) throw new Error('Failed to fetch client');
		return response.json();
	}

	async updateClient(workspaceId: string, clientId: string, updates: Partial<Client>): Promise<Client> {
		const response = await fetch(`${this.baseUrl}/${workspaceId}/clients/${clientId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(updates),
		});

		if (!response.ok) throw new Error('Failed to update client');
		return response.json();
	}

	async deleteClient(workspaceId: string, clientId: string): Promise<void> {
		const response = await fetch(`${this.baseUrl}/${workspaceId}/clients/${clientId}`, {
			method: 'DELETE',
		});

		if (!response.ok) throw new Error('Failed to delete client');
	}

	// Approval Workflows
	async createApprovalWorkflow(
		workflow: Omit<ApprovalWorkflow, 'id' | 'createdAt' | 'updatedAt'>
	): Promise<ApprovalWorkflow> {
		const response = await fetch(`${this.baseUrl}/${workflow.workspaceId}/workflows`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(workflow),
		});

		if (!response.ok) throw new Error('Failed to create approval workflow');
		return response.json();
	}

	async getApprovalWorkflows(workspaceId: string): Promise<ApprovalWorkflow[]> {
		const response = await fetch(`${this.baseUrl}/${workspaceId}/workflows`);
		if (!response.ok) throw new Error('Failed to fetch approval workflows');
		return response.json();
	}

	async updateApprovalWorkflow(
		workspaceId: string,
		workflowId: string,
		updates: Partial<ApprovalWorkflow>
	): Promise<ApprovalWorkflow> {
		const response = await fetch(`${this.baseUrl}/${workspaceId}/workflows/${workflowId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(updates),
		});

		if (!response.ok) throw new Error('Failed to update approval workflow');
		return response.json();
	}

	// Approval Requests
	async createApprovalRequest(
		request: Omit<ApprovalRequest, 'id' | 'createdAt' | 'updatedAt' | 'currentStep'>
	): Promise<ApprovalRequest> {
		const response = await fetch(`${this.baseUrl}/${request.workspaceId}/approvals`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ ...request, currentStep: 1 }),
		});

		if (!response.ok) throw new Error('Failed to create approval request');
		return response.json();
	}

	async getApprovalRequests(workspaceId: string, filters?: {
		status?: ApprovalRequest['status'];
		requestedBy?: string;
		priority?: ApprovalRequest['priority'];
	}): Promise<ApprovalRequest[]> {
		const params = new URLSearchParams();
		if (filters?.status) params.append('status', filters.status);
		if (filters?.requestedBy) params.append('requestedBy', filters.requestedBy);
		if (filters?.priority) params.append('priority', filters.priority);

		const url = `${this.baseUrl}/${workspaceId}/approvals${params.toString() ? `?${params.toString()}` : ''}`;
		const response = await fetch(url);

		if (!response.ok) throw new Error('Failed to fetch approval requests');
		return response.json();
	}

	async approveRequest(workspaceId: string, requestId: string, approverId: string): Promise<ApprovalRequest> {
		const response = await fetch(`${this.baseUrl}/${workspaceId}/approvals/${requestId}/approve`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ approverId }),
		});

		if (!response.ok) throw new Error('Failed to approve request');
		return response.json();
	}

	async rejectRequest(workspaceId: string, requestId: string, approverId: string, reason?: string): Promise<ApprovalRequest> {
		const response = await fetch(`${this.baseUrl}/${workspaceId}/approvals/${requestId}/reject`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ approverId, reason }),
		});

		if (!response.ok) throw new Error('Failed to reject request');
		return response.json();
	}

	// Comments System
	async createComment(comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Comment> {
		const response = await fetch(`${this.baseUrl}/${comment.workspaceId}/comments`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(comment),
		});

		if (!response.ok) throw new Error('Failed to create comment');
		return response.json();
	}

	async getComments(
		workspaceId: string,
		entityType: Comment['entityType'],
		entityId: string
	): Promise<Comment[]> {
		const response = await fetch(
			`${this.baseUrl}/${workspaceId}/comments?entityType=${entityType}&entityId=${entityId}`
		);
		if (!response.ok) throw new Error('Failed to fetch comments');
		return response.json();
	}

	async updateComment(
		workspaceId: string,
		commentId: string,
		updates: Partial<Comment>
	): Promise<Comment> {
		const response = await fetch(`${this.baseUrl}/${workspaceId}/comments/${commentId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(updates),
		});

		if (!response.ok) throw new Error('Failed to update comment');
		return response.json();
	}

	async deleteComment(workspaceId: string, commentId: string): Promise<void> {
		const response = await fetch(`${this.baseUrl}/${workspaceId}/comments/${commentId}`, {
			method: 'DELETE',
		});

		if (!response.ok) throw new Error('Failed to delete comment');
	}

	// Practice Metrics
	async getPracticeMetrics(workspaceId: string): Promise<PracticeMetrics> {
		const response = await fetch(`${this.baseUrl}/${workspaceId}/metrics`);
		if (!response.ok) throw new Error('Failed to fetch practice metrics');
		return response.json();
	}

	// Real-time Collaboration
	async subscribeToWorkspaceUpdates(workspaceId: string, callback: (update: any) => void): Promise<() => void> {
		// WebSocket subscription logic would go here
		// This is a placeholder for the actual implementation
		return () => {};
	}

	async sendWorkspaceActivity(
		workspaceId: string,
		activity: {
			type: 'user_joined' | 'user_left' | 'document_updated' | 'approval_requested' | 'comment_added';
			userId: string;
			entityType?: string;
			entityId?: string;
			metadata?: Record<string, any>;
		}
	): Promise<void> {
		const response = await fetch(`${this.baseUrl}/${workspaceId}/activity`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(activity),
		});

		if (!response.ok) throw new Error('Failed to send workspace activity');
	}
}

// Export singleton instance
export const workspaceService = new WorkspaceService();
