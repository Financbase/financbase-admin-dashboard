/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { and, desc, eq, or } from "drizzle-orm";
import {
	CheckCircle,
	Clock,
	Key,
	MessageCircle,
	Puzzle,
	Shield,
	Trash2,
	XCircle,
} from "lucide-react";
import {
	type Folder,
	type FolderInvitation,
	type FolderPermission,
	type NewFolder,
	type NewFolderInvitation,
	type NewFolderPermission,
	type PermissionLevel,
	folderInvitations,
	folderPermissions,
	folders,
} from "../../../drizzle/schema/folder-sharing";
import { workspaces } from "../../../drizzle/schema/workspaces";
import { db } from "../db";
import { resend } from "../email";
import { EmailTemplates } from "../email-templates";
import { generateSecureToken } from "../lib/security-utils";

export class FolderSharingService {
	/**
	 * Permission level configurations - customizable per use case
	 */
	private static readonly PERMISSION_CONFIGS: Record<
		PermissionLevel,
		{
			canView: boolean;
			canEdit: boolean;
			canDelete: boolean;
			canShare: boolean;
			canInvite: boolean;
			canComment: boolean;
			canApprove: boolean;
			canCreateSubfolders: boolean;
			canDownload: boolean;
			canUpload: boolean;
		}
	> = {
		owner: {
			canView: true,
			canEdit: true,
			canDelete: true,
			canShare: true,
			canInvite: true,
			canComment: true,
			canApprove: true,
			canCreateSubfolders: true,
			canDownload: true,
			canUpload: true,
		},
		editor: {
			canView: true,
			canEdit: true,
			canDelete: false,
			canShare: true,
			canInvite: false,
			canComment: true,
			canApprove: false,
			canCreateSubfolders: true,
			canDownload: true,
			canUpload: true,
		},
		viewer: {
			canView: true,
			canEdit: false,
			canDelete: false,
			canShare: false,
			canInvite: false,
			canComment: false,
			canApprove: false,
			canCreateSubfolders: false,
			canDownload: true,
			canUpload: false,
		},
		commenter: {
			canView: true,
			canEdit: false,
			canDelete: false,
			canShare: false,
			canInvite: false,
			canComment: true,
			canApprove: false,
			canCreateSubfolders: false,
			canDownload: true,
			canUpload: false,
		},
		approver: {
			canView: true,
			canEdit: false,
			canDelete: false,
			canShare: false,
			canInvite: false,
			canComment: true,
			canApprove: true,
			canCreateSubfolders: false,
			canDownload: true,
			canUpload: false,
		},
	};

	/**
	 * Custom permission configurations for specific workflows
	 */
	static readonly CUSTOM_PERMISSION_PRESETS = {
		// For content review workflows
		contentReviewer: {
			canView: true,
			canEdit: false,
			canDelete: false,
			canShare: false,
			canInvite: false,
			canComment: true,
			canApprove: true,
			canCreateSubfolders: false,
			canDownload: true,
			canUpload: false,
		},

		// For collaborative editing
		collaborator: {
			canView: true,
			canEdit: true,
			canDelete: false,
			canShare: true,
			canInvite: false,
			canComment: true,
			canApprove: false,
			canCreateSubfolders: true,
			canDownload: true,
			canUpload: true,
		},

		// For external sharing (limited permissions)
		externalViewer: {
			canView: true,
			canEdit: false,
			canDelete: false,
			canShare: false,
			canInvite: false,
			canComment: false,
			canApprove: false,
			canCreateSubfolders: false,
			canDownload: true,
			canUpload: false,
		},

		// For project managers
		projectManager: {
			canView: true,
			canEdit: true,
			canDelete: true,
			canShare: true,
			canInvite: true,
			canComment: true,
			canApprove: true,
			canCreateSubfolders: true,
			canDownload: true,
			canUpload: true,
		},

		// For auditors (read-only with special audit access)
		auditor: {
			canView: true,
			canEdit: false,
			canDelete: false,
			canShare: false,
			canInvite: false,
			canComment: false,
			canApprove: false,
			canCreateSubfolders: false,
			canDownload: true,
			canUpload: false,
		},

		// For legal compliance workflows
		legalReviewer: {
			canView: true,
			canEdit: false,
			canDelete: false,
			canShare: false,
			canInvite: false,
			canComment: true,
			canApprove: true,
			canCreateSubfolders: false,
			canDownload: true,
			canUpload: false,
		},

		// For creative teams (design/media workflows)
		creativeContributor: {
			canView: true,
			canEdit: true,
			canDelete: false,
			canShare: true,
			canInvite: false,
			canComment: true,
			canApprove: false,
			canCreateSubfolders: true,
			canDownload: true,
			canUpload: true,
		},

		// For executive oversight
		executiveViewer: {
			canView: true,
			canEdit: false,
			canDelete: false,
			canShare: false,
			canInvite: false,
			canComment: true,
			canApprove: false,
			canCreateSubfolders: false,
			canDownload: true,
			canUpload: false,
		},

		// For contractors/temporary access
		contractor: {
			canView: true,
			canEdit: true,
			canDelete: false,
			canShare: false,
			canInvite: false,
			canComment: false,
			canApprove: false,
			canCreateSubfolders: false,
			canDownload: true,
			canUpload: true,
		},

		// For quality assurance
		qaTester: {
			canView: true,
			canEdit: false,
			canDelete: false,
			canShare: false,
			canInvite: false,
			canComment: true,
			canApprove: false,
			canCreateSubfolders: false,
			canDownload: true,
			canUpload: false,
		},
	} as const;

	/**
	 * Hierarchical permission inheritance logic
	 */
	private static async getInheritedPermissions(
		folderId: string,
		userId: string,
	): Promise<{
		explicitPermissions:
			| (typeof FolderSharingService.PERMISSION_CONFIGS)[PermissionLevel]
			| null;
		inheritedPermissions: Array<{
			folderId: string;
			permissionLevel: PermissionLevel;
			permissions: (typeof FolderSharingService.PERMISSION_CONFIGS)[PermissionLevel];
		}>;
		effectivePermissions: (typeof FolderSharingService.PERMISSION_CONFIGS)[PermissionLevel];
	}> {
		// Get explicit permissions for this folder
		const explicitPermissionsResult = await db
			.select()
			.from(folderPermissions)
			.where(
				and(
					eq(folderPermissions.folderId, folderId),
					or(
						eq(folderPermissions.userId, userId),
						eq(folderPermissions.email, userId),
					),
					eq(folderPermissions.isPending, false),
				),
			)
			.limit(1);

		const explicitPermissions = explicitPermissionsResult[0]
			? FolderSharingService.PERMISSION_CONFIGS[
					explicitPermissionsResult[0].permissionLevel as PermissionLevel
				]
			: null;

		// Get all parent folders and their permissions
		const inheritedPermissions = [];
		let currentFolderId = folderId;

		while (currentFolderId) {
			const [parentFolder] = await db
				.select({ parentFolderId: folders.parentFolderId })
				.from(folders)
				.where(eq(folders.id, currentFolderId))
				.limit(1);

			if (!parentFolder?.parentFolderId) break;

			const parentPermissionsResult = await db
				.select()
				.from(folderPermissions)
				.where(
					and(
						eq(folderPermissions.folderId, parentFolder.parentFolderId),
						or(
							eq(folderPermissions.userId, userId),
							eq(folderPermissions.email, userId),
						),
						eq(folderPermissions.isPending, false),
					),
				)
				.limit(1);

			if (parentPermissionsResult[0]) {
				const parentPerms =
					FolderSharingService.PERMISSION_CONFIGS[
						parentPermissionsResult[0].permissionLevel as PermissionLevel
					];
				inheritedPermissions.push({
					folderId: parentFolder.parentFolderId,
					permissionLevel: parentPermissionsResult[0]
						.permissionLevel as PermissionLevel,
					permissions: parentPerms,
				});
			}

			currentFolderId = parentFolder.parentFolderId;
		}

		// Calculate effective permissions (explicit overrides inherited)
		const effectivePermissions = explicitPermissions
			? explicitPermissions
			: inheritedPermissions.length > 0
				? inheritedPermissions[0].permissions // Use highest level inherited permission
				: FolderSharingService.PERMISSION_CONFIGS.viewer; // Default to viewer if no permissions

		return {
			explicitPermissions,
			inheritedPermissions,
			effectivePermissions,
		};
	}

	/**
	 * Role-Based Access Control (RBAC) integration
	 */
	private static readonly RBAC_CONFIG = {
		// Define role hierarchies and permissions
		roles: {
			super_admin: {
				inherits: [],
				permissions: ["*"], // All permissions
			},
			admin: {
				inherits: ["manager"],
				permissions: ["folder.*", "user.*", "workspace.*"],
			},
			manager: {
				inherits: ["editor"],
				permissions: [
					"folder.create",
					"folder.update",
					"folder.share",
					"user.invite",
				],
			},
			editor: {
				inherits: ["contributor"],
				permissions: ["folder.edit", "folder.comment", "folder.upload"],
			},
			contributor: {
				inherits: ["viewer"],
				permissions: ["folder.view", "folder.download"],
			},
			viewer: {
				inherits: [],
				permissions: ["folder.view"],
			},
		},

		// Permission patterns
		patterns: {
			"folder.*": /folder\.(create|update|delete|share|invite)/,
			"folder.create": /folder\.create/,
			"folder.edit": /folder\.(edit|update)/,
			"folder.view": /folder\.view/,
			"user.*": /user\.(create|update|delete|invite)/,
			"workspace.*": /workspace\.(create|update|delete|manage)/,
		},
	};

	/**
	 * Check RBAC permissions for a user
	 */
	async checkRBACPermission(
		userId: string,
		permission: string,
		resource?: string,
	): Promise<boolean> {
		// Get user's roles from RBAC system
		// This would integrate with your existing RBAC implementation
		const userRoles = await this.getUserRoles(userId);

		for (const role of userRoles) {
			if (await this.roleHasPermission(role, permission)) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Get user roles (placeholder - integrate with your RBAC system)
	 */
	private async getUserRoles(userId: string): Promise<string[]> {
		// TODO: Integrate with your actual RBAC system
		// This should return roles like ['admin', 'manager', 'editor']
		return ["viewer"]; // Placeholder
	}

	/**
	 * Check if a role has a specific permission
	 */
	private async roleHasPermission(
		role: string,
		permission: string,
	): Promise<boolean> {
		const roleConfig =
			FolderSharingService.RBAC_CONFIG.roles[
				role as keyof typeof FolderSharingService.RBAC_CONFIG.roles
			];

		if (!roleConfig) return false;

		// Check direct permissions
		if (roleConfig.permissions.includes("*")) return true;
		if (roleConfig.permissions.includes(permission)) return true;

		// Check pattern matching
		for (const perm of roleConfig.permissions) {
			const pattern =
				FolderSharingService.RBAC_CONFIG.patterns[
					perm as keyof typeof FolderSharingService.RBAC_CONFIG.patterns
				];
			if (pattern?.test(permission)) {
				return true;
			}
		}

		// Check inherited roles
		for (const inheritedRole of roleConfig.inherits) {
			if (await this.roleHasPermission(inheritedRole, permission)) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Create folder with RBAC role assignment
	 */
	async createFolderWithRBAC(
		data: NewFolder,
		assignedRoles: string[] = [],
	): Promise<Folder> {
		const folder = await this.createFolder(data);

		// Assign RBAC roles to folder (if supported by your RBAC system)
		for (const role of assignedRoles) {
			await this.assignFolderRole(folder.id, role);
		}

		return folder;
	}

	/**
	 * Assign RBAC role to folder (placeholder - integrate with your RBAC system)
	 */
	private async assignFolderRole(
		folderId: string,
		role: string,
	): Promise<void> {
		// TODO: Integrate with your actual RBAC system to assign roles to resources
		console.log(`Assigning role ${role} to folder ${folderId}`);
	}

	/**
	 * Extended permission levels including custom presets
	 */
	static getExtendedPermissionLevels(): Array<{
		level:
			| PermissionLevel
			| keyof typeof FolderSharingService.CUSTOM_PERMISSION_PRESETS;
		name: string;
		description: string;
		isCustom: boolean;
	}> {
		const baseLevels: Array<{
			level: PermissionLevel;
			name: string;
			description: string;
			isCustom: false;
		}> = [
			{
				level: "owner",
				name: "Owner",
				description: "Full control over the folder",
				isCustom: false,
			},
			{
				level: "editor",
				name: "Editor",
				description: "Can edit and share content",
				isCustom: false,
			},
			{
				level: "viewer",
				name: "Viewer",
				description: "Read-only access",
				isCustom: false,
			},
			{
				level: "commenter",
				name: "Commenter",
				description: "Can view and comment",
				isCustom: false,
			},
			{
				level: "approver",
				name: "Approver",
				description: "Can approve changes",
				isCustom: false,
			},
		];

		const customLevels = Object.entries(
			FolderSharingService.CUSTOM_PERMISSION_PRESETS,
		).map(([key, config]) => ({
			level: key as keyof typeof FolderSharingService.CUSTOM_PERMISSION_PRESETS,
			name: key.charAt(0).toUpperCase() + key.slice(1),
			description: `Custom role with ${Object.values(config).filter(Boolean).length} permissions`,
			isCustom: true,
		}));

		return [...baseLevels, ...customLevels];
	}

	/**
	 * Create a new folder
	 */
	async createFolder(data: NewFolder): Promise<Folder> {
		const [folder] = await db.insert(folders).values(data).returning();
		return folder;
	}

	/**
	 * Get folders for a workspace with user permissions
	 */
	async getFoldersForWorkspace(
		workspaceId: string,
		userId?: string,
		options?: {
			includePermissions?: boolean;
			folderType?: string;
			parentFolderId?: string;
		},
	): Promise<Folder[]> {
		const conditions = [];

		if (options?.parentFolderId) {
			conditions.push(eq(folders.parentFolderId, options.parentFolderId));
		}

		if (options?.folderType) {
			conditions.push(eq(folders.folderType, options.folderType));
		}

		// If user is not provided, return only public folders
		if (!userId) {
			conditions.push(eq(folders.isPublic, true));
		}

		const query = db
			.select()
			.from(folders)
			.where(and(eq(folders.workspaceId, workspaceId), ...conditions));

		const foldersList = await query;

		// Filter by user permissions if user is provided
		if (userId) {
			const accessibleFolders = [];

			for (const folder of foldersList) {
				const hasPermission = await this.checkUserFolderPermission(
					folder.id,
					userId,
				);

				if (hasPermission) {
					accessibleFolders.push(folder);
				}
			}

			return accessibleFolders;
		}

		return foldersList;
	}

	/**
	 * Check if user has permission for a folder
	 */
	async checkUserFolderPermission(
		folderId: string,
		userId: string,
	): Promise<boolean> {
		const [permission] = await db
			.select()
			.from(folderPermissions)
			.where(
				and(
					eq(folderPermissions.folderId, folderId),
					or(
						eq(folderPermissions.userId, userId),
						eq(folderPermissions.email, userId),
					), // userId could be email
					eq(folderPermissions.isPending, false),
				),
			)
			.limit(1);

		return !!permission;
	}

	/**
	 * Get folder permissions for a specific folder
	 */
	async getFolderPermissions(folderId: string): Promise<FolderPermission[]> {
		return await db
			.select()
			.from(folderPermissions)
			.where(eq(folderPermissions.folderId, folderId))
			.orderBy(desc(folderPermissions.createdAt));
	}

	/**
	 * Get user's specific permissions for a folder
	 */
	async getUserPermissionsForFolder(
		folderId: string,
		userId: string,
	): Promise<{
		permissionLevel: PermissionLevel;
		permissions: {
			canView: boolean;
			canEdit: boolean;
			canDelete: boolean;
			canShare: boolean;
			canInvite: boolean;
			canComment: boolean;
			canApprove: boolean;
			canCreateSubfolders: boolean;
			canDownload: boolean;
			canUpload: boolean;
		};
	} | null> {
		const [permission] = await db
			.select()
			.from(folderPermissions)
			.where(
				and(
					eq(folderPermissions.folderId, folderId),
					or(
						eq(folderPermissions.userId, userId),
						eq(folderPermissions.email, userId),
					),
					eq(folderPermissions.isPending, false),
				),
			)
			.limit(1);

		if (!permission) return null;

		const config =
			FolderSharingService.PERMISSION_CONFIGS[
				permission.permissionLevel as PermissionLevel
			];

		if (!config) {
			throw new Error(
				`Invalid permission level: ${permission.permissionLevel}`,
			);
		}

		return {
			permissionLevel: permission.permissionLevel as PermissionLevel,
			permissions: config,
		};
	}

	/**
	 * Add or update folder permission for a user with granular controls
	 */
	async setFolderPermission(
		folderId: string,
		userId: string,
		permissionLevel: PermissionLevel,
		options?: {
			email?: string;
			invitedBy?: string;
			isPending?: boolean;
			customPermissions?: Partial<
				(typeof FolderSharingService.PERMISSION_CONFIGS)[PermissionLevel]
			>;
		},
	): Promise<FolderPermission> {
		// Check if permission already exists
		const [existingPermission] = await db
			.select()
			.from(folderPermissions)
			.where(
				and(
					eq(folderPermissions.folderId, folderId),
					or(
						eq(folderPermissions.userId, userId),
						eq(folderPermissions.email, options?.email || userId),
					),
				),
			)
			.limit(1);

		// Get default permissions for the role, then apply custom overrides
		const defaultPermissions =
			FolderSharingService.PERMISSION_CONFIGS[permissionLevel];

		if (!defaultPermissions) {
			throw new Error(`Invalid permission level: ${permissionLevel}`);
		}

		const customPermissions = options?.customPermissions || {};

		const permissionData: NewFolderPermission = {
			folderId,
			userId,
			email: options?.email,
			permissionLevel,
			canView: customPermissions.canView ?? defaultPermissions.canView,
			canEdit: customPermissions.canEdit ?? defaultPermissions.canEdit,
			canDelete: customPermissions.canDelete ?? defaultPermissions.canDelete,
			canShare: customPermissions.canShare ?? defaultPermissions.canShare,
			canInvite: customPermissions.canInvite ?? defaultPermissions.canInvite,
			canComment: customPermissions.canComment ?? defaultPermissions.canComment,
			canApprove: customPermissions.canApprove ?? defaultPermissions.canApprove,
			canCreateSubfolders:
				customPermissions.canCreateSubfolders ??
				defaultPermissions.canCreateSubfolders,
			canDownload:
				customPermissions.canDownload ?? defaultPermissions.canDownload,
			canUpload: customPermissions.canUpload ?? defaultPermissions.canUpload,
			isPending: options?.isPending || false,
			invitedBy: options?.invitedBy,
			invitedAt: options?.isPending ? new Date() : undefined,
		};

		if (existingPermission) {
			// Update existing permission
			const [updated] = await db
				.update(folderPermissions)
				.set(permissionData)
				.where(eq(folderPermissions.id, existingPermission.id))
				.returning();
			return updated;
		}
		// Create new permission
		const [created] = await db
			.insert(folderPermissions)
			.values(permissionData)
			.returning();
		return created;
	}

	/**
	 * Create a folder invitation and send email
	 */
	async createFolderInvitation(
		folderId: string,
		email: string,
		permissionLevel: PermissionLevel,
		invitedBy: string,
		options?: {
			message?: string;
			expiresInDays?: number;
			customPermissions?: Partial<
				(typeof FolderSharingService.PERMISSION_CONFIGS)[PermissionLevel]
			>;
		},
	): Promise<FolderInvitation> {
		// Get folder and workspace details for the email
		const [folder] = await db
			.select({
				id: folders.id,
				name: folders.name,
				workspaceId: folders.workspaceId,
			})
			.from(folders)
			.where(eq(folders.id, folderId))
			.limit(1);

		if (!folder) {
			throw new Error("Folder not found");
		}

		const [workspace] = await db
			.select({
				id: workspaces.id,
				name: workspaces.name,
			})
			.from(workspaces)
			.where(eq(workspaces.id, folder.workspaceId))
			.limit(1);

		if (!workspace) {
			throw new Error("Workspace not found");
		}

		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + (options?.expiresInDays || 7));

		const token = generateSecureToken();

		const invitationData: NewFolderInvitation = {
			folderId,
			email,
			permissionLevel,
			message: options?.message,
			token,
			expiresAt,
			status: "pending",
			invitedBy,
		};

		const [invitation] = await db
			.insert(folderInvitations)
			.values(invitationData)
			.returning();

		// Send invitation email
		try {
			await this.sendInvitationEmail({
				inviterName: "Team Member", // TODO: Get actual inviter name from user data
				folderName: folder.name,
				workspaceName: workspace.name,
				permissionLevel,
				invitationToken: token,
				invitationUrl: `${process.env.NEXT_PUBLIC_API_URL || "https://financbase.com"}/folders/${folderId}/accept-invitation`,
				message: options?.message,
			});
		} catch (emailError) {
			console.error("Failed to send invitation email:", emailError);
			// Don't fail the invitation if email fails
		}

		return invitation;
	}

	/**
	 * Send invitation email using Resend
	 */
	private async sendInvitationEmail(props: {
		inviterName: string;
		folderName: string;
		workspaceName: string;
		permissionLevel: PermissionLevel;
		invitationToken: string;
		invitationUrl: string;
		message?: string;
	}): Promise<void> {
		const html = EmailTemplates.renderFolderInvitation(props);
		const text = EmailTemplates.renderFolderInvitationText(props);

		await resend.emails.send({
			from: process.env.EMAIL_FROM || "noreply@financbase.com",
			to: [
				props.invitationUrl.includes("?token=")
					? "test@example.com"
					: props.invitationUrl,
			], // Extract email from invitation URL or use test email
			subject: `You're invited to collaborate on ${props.folderName}`,
			html,
			text,
		});
	}

	/**
	 * Get pending invitations for a folder
	 */
	async getFolderInvitations(folderId: string): Promise<FolderInvitation[]> {
		return await db
			.select()
			.from(folderInvitations)
			.where(
				and(
					eq(folderInvitations.folderId, folderId),
					eq(folderInvitations.status, "pending"),
				),
			)
			.orderBy(desc(folderInvitations.createdAt));
	}

	/**
	 * Accept a folder invitation
	 */
	async acceptFolderInvitation(
		token: string,
		userId: string,
		email: string,
	): Promise<{ success: boolean; folderId?: string; error?: string }> {
		// Find the invitation
		const [invitation] = await db
			.select()
			.from(folderInvitations)
			.where(
				and(
					eq(folderInvitations.token, token),
					eq(folderInvitations.email, email),
					eq(folderInvitations.status, "pending"),
				),
			)
			.limit(1);

		if (!invitation) {
			return { success: false, error: "Invalid or expired invitation" };
		}

		if (invitation.expiresAt < new Date()) {
			return { success: false, error: "Invitation has expired" };
		}

		// Create folder permission
		await this.setFolderPermission(
			invitation.folderId,
			userId,
			invitation.permissionLevel as PermissionLevel,
			{
				email,
				invitedBy: invitation.invitedBy,
				isPending: false,
			},
		);

		// Mark invitation as accepted
		await db
			.update(folderInvitations)
			.set({
				status: "accepted",
				acceptedAt: new Date(),
			})
			.where(eq(folderInvitations.id, invitation.id));

		return { success: true, folderId: invitation.folderId };
	}

	/**
	 * Remove user permission from folder
	 */
	async removeFolderPermission(
		folderId: string,
		userId: string,
	): Promise<boolean> {
		const result = await db
			.delete(folderPermissions)
			.where(
				and(
					eq(folderPermissions.folderId, folderId),
					eq(folderPermissions.userId, userId),
				),
			);

		return result.rowCount > 0;
	}

	/**
	 * Update folder details
	 */
	async updateFolder(
		folderId: string,
		updates: Partial<Omit<Folder, "id" | "createdAt">>,
	): Promise<Folder | null> {
		const [updated] = await db
			.update(folders)
			.set({ ...updates, updatedAt: new Date() })
			.where(eq(folders.id, folderId))
			.returning();

		return updated || null;
	}

	/**
	 * Delete a folder (soft delete)
	 */
	async deleteFolder(folderId: string): Promise<boolean> {
		const result = await db
			.update(folders)
			.set({ deletedAt: new Date() })
			.where(eq(folders.id, folderId));

		return result.rowCount > 0;
	}

	/**
	 * Get folder with full details including permissions
	 */
	async getFolderWithDetails(folderId: string): Promise<{
		folder: Folder;
		permissions: FolderPermission[];
		invitations: FolderInvitation[];
	} | null> {
		const [folder] = await db
			.select()
			.from(folders)
			.where(eq(folders.id, folderId))
			.limit(1);

		if (!folder) return null;

		const permissions = await this.getFolderPermissions(folderId);
		const invitations = await this.getFolderInvitations(folderId);

		return {
			folder,
			permissions,
			invitations,
		};
	}

	/**
	 * Get all available permission levels
	 */
	static getPermissionLevels(): PermissionLevel[] {
		return ["owner", "editor", "viewer", "commenter", "approver"];
	}

	/**
	 * Get permission configuration for a level
	 */
	static getPermissionConfig(level: PermissionLevel) {
		return FolderSharingService.PERMISSION_CONFIGS[level];
	}
}
