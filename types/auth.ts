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
	conditions?: Record<string, any>;
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

export const DEFAULT_ROLES: Record<string, FinancialPermission[]> = {
	admin: Object.values(FINANCIAL_PERMISSIONS),
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
	],
	user: [
		FINANCIAL_PERMISSIONS.INVOICES_VIEW,
		FINANCIAL_PERMISSIONS.INVOICES_CREATE,
		FINANCIAL_PERMISSIONS.EXPENSES_VIEW,
		FINANCIAL_PERMISSIONS.EXPENSES_CREATE,
		FINANCIAL_PERMISSIONS.REPORTS_VIEW,
	],
	viewer: [
		FINANCIAL_PERMISSIONS.INVOICES_VIEW,
		FINANCIAL_PERMISSIONS.EXPENSES_VIEW,
		FINANCIAL_PERMISSIONS.REPORTS_VIEW,
	],
};

