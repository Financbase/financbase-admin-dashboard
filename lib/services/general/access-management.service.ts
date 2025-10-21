import {
	CheckCircle,
	Clock,
	MessageCircle,
	Minus,
	Trash2,
	XCircle,
} from "lucide-react";
import { getClient, query } from "../db-cms";
import { AppError } from "../middleware/error-handler";
import {
	type AccessFolder,
	type AccessInvitation,
	AccessLog,
	type AccessMember,
	type AccessRole,
	type CreateFolderRequest,
	type FolderWithAccess,
	type InviteMemberRequest,
	ROLE_PERMISSIONS,
	type ServiceResponse,
	UpdateMemberRoleRequest,
} from "../types/access-management";

export class AccessManagementService {
	/**
	 * Get folder with all access information
	 */
	async getFolderWithAccess(
		folderId: number,
		userId: number,
	): Promise<ServiceResponse<FolderWithAccess>> {
		try {
			// Get folder details
			const folderResult = await query(
				"SELECT * FROM access_folders WHERE id = $1 AND is_active = true",
				[folderId],
			);

			if (folderResult.rows.length === 0) {
				throw new AppError("Folder not found", 404, "FOLDER_NOT_FOUND");
			}

			const folder = folderResult.rows[0] as AccessFolder;

			// Get user access for this folder
			const userAccessResult = await query(
				"SELECT * FROM user_access WHERE folder_id = $1 AND user_id = $2 AND is_active = true",
				[folderId, userId],
			);

			if (userAccessResult.rows.length === 0) {
				throw new AppError("Access denied", 403, "ACCESS_DENIED");
			}

			const userAccess = userAccessResult.rows[0];

			// Get all members
			const membersResult = await query(
				`
        SELECT
          ua.id,
          ua.role,
          ua.accepted_at,
          u.first_name,
          u.last_name,
          u.email,
          u.clerk_user_id,
          COALESCE(u.first_name || ' ' || u.last_name, u.email) as name
        FROM user_access ua
        JOIN cms_users u ON ua.user_id = u.id
        WHERE ua.folder_id = $1 AND ua.is_active = true
        ORDER BY ua.created_at ASC
      `,
				[folderId],
			);

			const members: AccessMember[] = membersResult.rows.map((row) => ({
				id: row.id.toString(),
				name: row.name,
				email: row.email,
				role: row.role as AccessRole,
				avatar: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000000)}?w=150&h=150&fit=crop&crop=face`,
			}));

			// Get pending invitations
			const invitationsResult = await query(
				`
        SELECT * FROM access_invitations
        WHERE folder_id = $1 AND status = 'pending' AND expires_at > NOW()
        ORDER BY invited_at DESC
      `,
				[folderId],
			);

			const invitations: AccessInvitation[] = invitationsResult.rows.map(
				(row) => ({
					id: row.id,
					folderId: row.folder_id,
					email: row.email,
					role: row.role,
					invitedBy: row.invited_by,
					invitedAt: row.invited_at,
					expiresAt: row.expires_at,
					status: row.status,
					message: row.message,
				}),
			);

			// Get user permissions based on their role
			const userRole = userAccess.role as AccessRole;
			const userPermissions = ROLE_PERMISSIONS[userRole];

			return {
				success: true,
				data: {
					folder,
					members,
					invitations,
					userPermissions,
				},
			};
		} catch (error) {
			console.error("Error getting folder with access:", error);
			return {
				success: false,
				error:
					error instanceof AppError
						? error.message
						: "Failed to get folder access information",
			};
		}
	}

	/**
	 * Create a new folder
	 */
	async createFolder(
		data: CreateFolderRequest,
		createdBy: number,
	): Promise<ServiceResponse<AccessFolder>> {
		try {
			const result = await query(
				`INSERT INTO access_folders (name, description, thumbnail_url, created_by)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
				[data.name, data.description, data.thumbnailUrl, createdBy],
			);

			// Add owner access for the creator
			await query(
				`INSERT INTO user_access (folder_id, user_id, role, invited_by)
         VALUES ($1, $2, $3, $4)`,
				[result.rows[0].id, createdBy, "Owner", createdBy],
			);

			// Log the creation
			await this.logAction(
				result.rows[0].id,
				createdBy,
				"create_folder",
				createdBy,
			);

			return {
				success: true,
				data: result.rows[0] as AccessFolder,
			};
		} catch (error) {
			console.error("Error creating folder:", error);
			return {
				success: false,
				error:
					error instanceof AppError ? error.message : "Failed to create folder",
			};
		}
	}

	/**
	 * Invite a member to a folder
	 */
	async inviteMember(
		folderId: number,
		data: InviteMemberRequest,
		invitedBy: number,
	): Promise<ServiceResponse<AccessInvitation>> {
		try {
			// Check if inviter has permission to invite
			const inviterAccess = await this.getUserAccess(folderId, invitedBy);
			if (
				!inviterAccess ||
				!ROLE_PERMISSIONS[inviterAccess.role as AccessRole].canInvite
			) {
				throw new AppError(
					"Insufficient permissions to invite members",
					403,
					"INSUFFICIENT_PERMISSIONS",
				);
			}

			// Check if user already has access
			const existingAccess = await query(
				"SELECT * FROM user_access WHERE folder_id = $1 AND user_id = (SELECT id FROM cms_users WHERE email = $2 LIMIT 1)",
				[folderId, data.email],
			);

			if (existingAccess.rows.length > 0) {
				throw new AppError(
					"User already has access to this folder",
					400,
					"USER_ALREADY_HAS_ACCESS",
				);
			}

			// Check for existing pending invitation
			const existingInvitation = await query(
				"SELECT * FROM access_invitations WHERE folder_id = $1 AND email = $2 AND status = $3",
				[folderId, data.email, "pending"],
			);

			if (existingInvitation.rows.length > 0) {
				throw new AppError(
					"Invitation already pending for this email",
					400,
					"INVITATION_ALREADY_PENDING",
				);
			}

			// Create invitation
			const result = await query(
				`INSERT INTO access_invitations (folder_id, email, role, invited_by, expires_at, message)
         VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days', $5)
         RETURNING *`,
				[folderId, data.email, data.role, invitedBy, data.message],
			);

			// Log the invitation
			await this.logAction(
				folderId,
				invitedBy,
				"invite_member",
				null,
				data.email,
				null,
				data.role,
			);

			return {
				success: true,
				data: result.rows[0] as AccessInvitation,
			};
		} catch (error) {
			console.error("Error inviting member:", error);
			return {
				success: false,
				error:
					error instanceof AppError ? error.message : "Failed to invite member",
			};
		}
	}

	/**
	 * Update member role
	 */
	async updateMemberRole(
		folderId: number,
		memberId: string,
		newRole: AccessRole,
		updatedBy: number,
	): Promise<ServiceResponse<void>> {
		try {
			// Check if updater has permission to change roles
			const updaterAccess = await this.getUserAccess(folderId, updatedBy);
			if (
				!updaterAccess ||
				!ROLE_PERMISSIONS[updaterAccess.role as AccessRole].canChangeRoles
			) {
				throw new AppError(
					"Insufficient permissions to change roles",
					403,
					"INSUFFICIENT_PERMISSIONS",
				);
			}

			// Get current member access
			const memberAccessResult = await query(
				"SELECT * FROM user_access WHERE id = $1 AND folder_id = $2",
				[memberId, folderId],
			);

			if (memberAccessResult.rows.length === 0) {
				throw new AppError(
					"Member not found in folder",
					404,
					"MEMBER_NOT_FOUND",
				);
			}

			const oldRole = memberAccessResult.rows[0].role;

			// Update role
			await query(
				"UPDATE user_access SET role = $1, updated_at = NOW() WHERE id = $2",
				[newRole, memberId],
			);

			// Log the role change
			await this.logAction(
				folderId,
				updatedBy,
				"role_change",
				Number.parseInt(memberId),
				null,
				oldRole,
				newRole,
			);

			return {
				success: true,
				message: "Member role updated successfully",
			};
		} catch (error) {
			console.error("Error updating member role:", error);
			return {
				success: false,
				error:
					error instanceof AppError
						? error.message
						: "Failed to update member role",
			};
		}
	}

	/**
	 * Remove member from folder
	 */
	async removeMember(
		folderId: number,
		memberId: string,
		removedBy: number,
	): Promise<ServiceResponse<void>> {
		try {
			// Check if remover has permission to remove members
			const removerAccess = await this.getUserAccess(folderId, removedBy);
			if (
				!removerAccess ||
				!ROLE_PERMISSIONS[removerAccess.role as AccessRole].canRemove
			) {
				throw new AppError(
					"Insufficient permissions to remove members",
					403,
					"INSUFFICIENT_PERMISSIONS",
				);
			}

			// Get member details for logging
			const memberAccessResult = await query(
				"SELECT ua.*, u.email FROM user_access ua JOIN cms_users u ON ua.user_id = u.id WHERE ua.id = $1",
				[memberId],
			);

			if (memberAccessResult.rows.length === 0) {
				throw new AppError("Member not found", 404, "MEMBER_NOT_FOUND");
			}

			const memberData = memberAccessResult.rows[0];

			// Don't allow removing the owner
			if (memberData.role === "Owner") {
				throw new AppError(
					"Cannot remove folder owner",
					400,
					"CANNOT_REMOVE_OWNER",
				);
			}

			// Soft delete the access record
			await query(
				"UPDATE user_access SET is_active = false, updated_at = NOW() WHERE id = $1",
				[memberId],
			);

			// Log the removal
			await this.logAction(
				folderId,
				removedBy,
				"remove_member",
				Number.parseInt(memberId),
				memberData.email,
			);

			return {
				success: true,
				message: "Member removed successfully",
			};
		} catch (error) {
			console.error("Error removing member:", error);
			return {
				success: false,
				error:
					error instanceof AppError ? error.message : "Failed to remove member",
			};
		}
	}

	/**
	 * Get user's access to a folder
	 */
	private async getUserAccess(folderId: number, userId: number) {
		const result = await query(
			"SELECT * FROM user_access WHERE folder_id = $1 AND user_id = $2 AND is_active = true",
			[folderId, userId],
		);
		return result.rows[0];
	}

	/**
	 * Log access management actions
	 */
	private async logAction(
		folderId: number,
		userId: number,
		action: string,
		targetUserId?: number | null,
		targetEmail?: string | null,
		oldRole?: string | null,
		newRole?: string | null,
	) {
		await query(
			`INSERT INTO access_logs (folder_id, user_id, action, target_user_id, target_email, old_role, new_role)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
			[folderId, userId, action, targetUserId, targetEmail, oldRole, newRole],
		);
	}

	/**
	 * Get all folders for a user
	 */
	async getUserFolders(
		userId: number,
	): Promise<ServiceResponse<AccessFolder[]>> {
		try {
			const result = await query(
				`
        SELECT DISTINCT f.*
        FROM access_folders f
        JOIN user_access ua ON f.id = ua.folder_id
        WHERE ua.user_id = $1 AND ua.is_active = true AND f.is_active = true
        ORDER BY f.created_at DESC
      `,
				[userId],
			);

			return {
				success: true,
				data: result.rows as AccessFolder[],
			};
		} catch (error) {
			console.error("Error getting user folders:", error);
			return {
				success: false,
				error: "Failed to get user folders",
			};
		}
	}
}
