/**
 * Extended Authentication Types for Financbase
 * Integrates with Clerk authentication while adding financial-specific permissions
 */

export interface FinancbaseUserMetadata {
	role: 'admin' | 'manager' | 'user' | 'viewer';
	permissions: string[];
	organizationId?: string;
	financialAccess: {
		viewRevenue: boolean;
		editInvoices: boolean;
		approveExpenses: boolean;
		manageReports: boolean;
		accessAuditLogs: boolean;
	};
	preferences?: {
		timezone?: string;
		currency?: string;
		dateFormat?: string;
	};
}

export interface Permission {
	id: string;
	name: string;
	description: string;
	category: 'financial' | 'admin' | 'content' | 'user';
	scope: 'read' | 'write' | 'delete' | 'manage';
}

export interface Role {
	id: string;
	name: string;
	description: string;
	permissions: Permission[];
	isSystem: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface RBACPolicy {
	resource: string;
	action: string;
	effect: 'allow' | 'deny';
	conditions?: Record<string, unknown>;
}

export const FINANCIAL_PERMISSIONS = {
	INVOICES_VIEW: 'invoices:view',
	INVOICES_CREATE: 'invoices:create',
	INVOICES_EDIT: 'invoices:edit',
	INVOICES_DELETE: 'invoices:delete',
	EXPENSES_VIEW: 'expenses:view',
	EXPENSES_CREATE: 'expenses:create',
	EXPENSES_EDIT: 'expenses:edit',
	EXPENSES_APPROVE: 'expenses:approve',
	REPORTS_VIEW: 'reports:view',
	REPORTS_CREATE: 'reports:create',
	REPORTS_EXPORT: 'reports:export',
	REVENUE_VIEW: 'revenue:view',
	AUDIT_LOGS_VIEW: 'audit:view',
	SETTINGS_MANAGE: 'settings:manage',
	USERS_MANAGE: 'users:manage',
	ROLES_MANAGE: 'roles:manage',
} as const;

export type FinancialPermission = typeof FINANCIAL_PERMISSIONS[keyof typeof FINANCIAL_PERMISSIONS];

/**
 * Extended Authentication Types for Financbase
 * Integrates with Clerk authentication while adding financial-specific permissions
 */

export interface FinancbaseUserMetadata {
	role: 'admin' | 'manager' | 'user' | 'viewer';
	permissions: string[];
	organizationId?: string;
	financialAccess: {
		viewRevenue: boolean;
		editInvoices: boolean;
		approveExpenses: boolean;
		manageReports: boolean;
		accessAuditLogs: boolean;
	};
	preferences?: {
		timezone?: string;
		currency?: string;
		dateFormat?: string;
	};
}

export interface Permission {
	id: string;
	name: string;
	description: string;
	category: 'financial' | 'admin' | 'content' | 'user';
	scope: 'read' | 'write' | 'delete' | 'manage';
}

export interface Role {
	id: string;
	name: string;
	description: string;
	permissions: Permission[];
	isSystem: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export const WORKSPACE_PERMISSIONS = {
  WORKSPACES_VIEW: 'workspaces:view',
  WORKSPACES_CREATE: 'workspaces:create',
  WORKSPACES_EDIT: 'workspaces:edit',
  WORKSPACES_DELETE: 'workspaces:delete',
  WORKSPACES_MANAGE: 'workspaces:manage',
  CLIENTS_VIEW: 'clients:view',
  CLIENTS_CREATE: 'clients:create',
  CLIENTS_EDIT: 'clients:edit',
  CLIENTS_DELETE: 'clients:delete',
  CLIENTS_MANAGE: 'clients:manage',
  APPROVALS_VIEW: 'approvals:view',
  APPROVALS_CREATE: 'approvals:create',
  APPROVALS_REVIEW: 'approvals:review',
  APPROVALS_MANAGE: 'approvals:manage',
  DOCUMENTS_VIEW: 'documents:view',
  DOCUMENTS_CREATE: 'documents:create',
  DOCUMENTS_EDIT: 'documents:edit',
  DOCUMENTS_DELETE: 'documents:delete',
  DOCUMENTS_SHARE: 'documents:share',
  COMMENTS_VIEW: 'comments:view',
  COMMENTS_CREATE: 'comments:create',
  COMMENTS_EDIT: 'comments:edit',
  COMMENTS_DELETE: 'comments:delete',
  COMMENTS_MODERATE: 'comments:moderate',
} as const;

export const COLLABORATION_PERMISSIONS = {
  ...FINANCIAL_PERMISSIONS,
  ...WORKSPACE_PERMISSIONS,
} as const;

export type WorkspacePermission = typeof WORKSPACE_PERMISSIONS[keyof typeof WORKSPACE_PERMISSIONS];
export type CollaborationPermission = typeof COLLABORATION_PERMISSIONS[keyof typeof COLLABORATION_PERMISSIONS];

export const DEFAULT_ROLES: Record<string, CollaborationPermission[]> = {
  admin: Object.values(COLLABORATION_PERMISSIONS),
  manager: [
    FINANCIAL_PERMISSIONS.INVOICES_VIEW,
    FINANCIAL_PERMISSIONS.INVOICES_CREATE,
    FINANCIAL_PERMISSIONS.INVOICES_EDIT,
    FINANCIAL_PERMISSIONS.EXPENSES_VIEW,
    FINANCIAL_PERMISSIONS.EXPENSES_CREATE,
    FINANCIAL_PERMISSIONS.EXPENSES_EDIT,
    FINANCIAL_PERMISSIONS.EXPENSES_APPROVE,
    FINANCIAL_PERMISSIONS.REPORTS_VIEW,
    FINANCIAL_PERMISSIONS.REPORTS_CREATE,
    FINANCIAL_PERMISSIONS.REPORTS_EXPORT,
    FINANCIAL_PERMISSIONS.REVENUE_VIEW,
    WORKSPACE_PERMISSIONS.WORKSPACES_VIEW,
    WORKSPACE_PERMISSIONS.WORKSPACES_CREATE,
    WORKSPACE_PERMISSIONS.WORKSPACES_EDIT,
    WORKSPACE_PERMISSIONS.CLIENTS_VIEW,
    WORKSPACE_PERMISSIONS.CLIENTS_CREATE,
    WORKSPACE_PERMISSIONS.CLIENTS_EDIT,
    WORKSPACE_PERMISSIONS.CLIENTS_MANAGE,
    WORKSPACE_PERMISSIONS.APPROVALS_VIEW,
    WORKSPACE_PERMISSIONS.APPROVALS_CREATE,
    WORKSPACE_PERMISSIONS.APPROVALS_REVIEW,
    WORKSPACE_PERMISSIONS.APPROVALS_MANAGE,
    WORKSPACE_PERMISSIONS.DOCUMENTS_VIEW,
    WORKSPACE_PERMISSIONS.DOCUMENTS_CREATE,
    WORKSPACE_PERMISSIONS.DOCUMENTS_EDIT,
    WORKSPACE_PERMISSIONS.DOCUMENTS_SHARE,
    WORKSPACE_PERMISSIONS.COMMENTS_VIEW,
    WORKSPACE_PERMISSIONS.COMMENTS_CREATE,
    WORKSPACE_PERMISSIONS.COMMENTS_EDIT,
    WORKSPACE_PERMISSIONS.COMMENTS_MODERATE,
  ],
  user: [
    FINANCIAL_PERMISSIONS.INVOICES_VIEW,
    FINANCIAL_PERMISSIONS.INVOICES_CREATE,
    FINANCIAL_PERMISSIONS.EXPENSES_VIEW,
    FINANCIAL_PERMISSIONS.EXPENSES_CREATE,
    FINANCIAL_PERMISSIONS.REPORTS_VIEW,
    WORKSPACE_PERMISSIONS.WORKSPACES_VIEW,
    WORKSPACE_PERMISSIONS.CLIENTS_VIEW,
    WORKSPACE_PERMISSIONS.APPROVALS_VIEW,
    WORKSPACE_PERMISSIONS.APPROVALS_CREATE,
    WORKSPACE_PERMISSIONS.DOCUMENTS_VIEW,
    WORKSPACE_PERMISSIONS.DOCUMENTS_CREATE,
    WORKSPACE_PERMISSIONS.DOCUMENTS_EDIT,
    WORKSPACE_PERMISSIONS.COMMENTS_VIEW,
    WORKSPACE_PERMISSIONS.COMMENTS_CREATE,
    WORKSPACE_PERMISSIONS.COMMENTS_EDIT,
  ],
  viewer: [
    FINANCIAL_PERMISSIONS.INVOICES_VIEW,
    FINANCIAL_PERMISSIONS.EXPENSES_VIEW,
    FINANCIAL_PERMISSIONS.REPORTS_VIEW,
    WORKSPACE_PERMISSIONS.WORKSPACES_VIEW,
    WORKSPACE_PERMISSIONS.CLIENTS_VIEW,
    WORKSPACE_PERMISSIONS.DOCUMENTS_VIEW,
    WORKSPACE_PERMISSIONS.COMMENTS_VIEW,
  ],
};

// Workspace and Practice Management Types
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  type: 'accounting_firm' | 'client_workspace' | 'practice_group';
  organizationId: string;
  ownerId: string;
  members: WorkspaceMember[];
  settings: WorkspaceSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  role: 'owner' | 'admin' | 'manager' | 'accountant' | 'client' | 'viewer';
  permissions: CollaborationPermission[];
  joinedAt: Date;
  invitedBy?: string;
  isActive: boolean;
}

export interface WorkspaceSettings {
  allowClientInvites: boolean;
  requireApprovalForExpenses: boolean;
  autoCategorizeTransactions: boolean;
  defaultCurrency: string;
  fiscalYearStart: number;
  timezone: string;
  features: {
    documentCollaboration: boolean;
    approvalWorkflows: boolean;
    clientPortal: boolean;
    auditTrail: boolean;
  };
}

export interface Client {
  id: string;
  workspaceId: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  taxId?: string;
  industry?: string;
  engagementType: 'monthly' | 'quarterly' | 'annual' | 'project';
  status: 'active' | 'inactive' | 'prospect';
  assignedAccountant?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalWorkflow {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  type: 'expense_approval' | 'invoice_approval' | 'document_review' | 'client_onboarding';
  steps: ApprovalStep[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalStep {
  id: string;
  name: string;
  order: number;
  approvers: string[]; // User IDs
  conditions?: Record<string, unknown>;
  requiresAllApprovers: boolean;
  timeoutHours?: number;
  notifyOnTimeout: boolean;
}

export interface ApprovalRequest {
  id: string;
  workflowId: string;
  workspaceId: string;
  title: string;
  description?: string;
  requestedBy: string;
  currentStep: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  workspaceId: string;
  entityType: 'invoice' | 'expense' | 'document' | 'client' | 'approval' | 'transaction';
  entityId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  parentId?: string; // For threaded comments
  mentions: string[]; // User IDs
  isInternal: boolean; // Internal notes vs client-facing
  status: 'active' | 'resolved' | 'archived';
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PracticeMetrics {
  workspaceId: string;
  totalClients: number;
  activeClients: number;
  monthlyRevenue: number;
  pendingApprovals: number;
  overdueTasks: number;
  avgResponseTime: number;
  clientSatisfactionScore: number;
  updatedAt: Date;
}
