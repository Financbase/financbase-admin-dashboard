/**
 * Organization Service
 * Business logic for multi-organization management
 * 
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from '@/lib/db';
import { 
	organizations, 
	organizationMembers, 
	organizationInvitations,
	organizationSettings,
	organizationSubscriptions,
	type Organization,
	type OrganizationMember,
	type OrganizationInvitation,
	type OrganizationSettings,
} from '@/lib/db/schemas';
import { users } from '@/lib/db/schemas';
import { eq, and, or, desc, sql } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { randomBytes } from 'crypto';

export interface CreateOrganizationInput {
	name: string;
	description?: string;
	slug?: string;
	logo?: string;
	billingEmail?: string;
	taxId?: string;
	address?: string;
	phone?: string;
}

export interface UpdateOrganizationInput extends Partial<CreateOrganizationInput> {
	id: string;
}

export interface OrganizationWithMembership extends Organization {
	membership?: OrganizationMember;
	role?: 'owner' | 'admin' | 'member' | 'viewer';
	memberCount?: number;
}

export interface UserOrganization {
	organization: Organization;
	membership: OrganizationMember;
	role: 'owner' | 'admin' | 'member' | 'viewer';
}

/**
 * Get all organizations a user belongs to
 */
export async function getUserOrganizations(userId: string): Promise<UserOrganization[]> {
	try {
		const result = await db
			.select({
				organization: organizations,
				membership: organizationMembers,
			})
			.from(organizationMembers)
			.innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
			.where(
				and(
					eq(organizationMembers.userId, userId),
					eq(organizations.isActive, true)
				)
			)
			.orderBy(desc(organizationMembers.joinedAt));

		return result.map((row) => ({
			organization: row.organization,
			membership: row.membership,
			role: row.membership.role as 'owner' | 'admin' | 'member' | 'viewer',
		}));
	} catch (error) {
		logger.error('[OrganizationService] Error getting user organizations', { error, userId });
		throw error;
	}
}

/**
 * Get organization by ID with membership check
 */
export async function getOrganizationById(
	organizationId: string,
	userId: string
): Promise<OrganizationWithMembership | null> {
	try {
		const result = await db
			.select({
				organization: organizations,
				membership: organizationMembers,
			})
			.from(organizations)
			.leftJoin(
				organizationMembers,
				and(
					eq(organizationMembers.organizationId, organizations.id),
					eq(organizationMembers.userId, userId)
				)
			)
			.where(
				and(
					eq(organizations.id, organizationId),
					eq(organizations.isActive, true)
				)
			)
			.limit(1);

		if (result.length === 0) {
			return null;
		}

		const row = result[0];
		const memberCount = await db
			.select({ count: sql<number>`count(*)` })
			.from(organizationMembers)
			.where(eq(organizationMembers.organizationId, organizationId));

		return {
			...row.organization,
			membership: row.membership || undefined,
			role: row.membership?.role as 'owner' | 'admin' | 'member' | 'viewer' | undefined,
			memberCount: Number(memberCount[0]?.count || 0),
		};
	} catch (error) {
		logger.error('[OrganizationService] Error getting organization by ID', { error, organizationId, userId });
		throw error;
	}
}

/**
 * Create a new organization
 */
export async function createOrganization(
	input: CreateOrganizationInput,
	userId: string
): Promise<Organization> {
	try {
		// Generate slug if not provided
		let slug = input.slug || input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
		
		// Ensure slug is unique
		const existing = await db
			.select()
			.from(organizations)
			.where(eq(organizations.slug, slug))
			.limit(1);
		
		if (existing.length > 0) {
			slug = `${slug}-${randomBytes(4).toString('hex')}`;
		}

		// Create organization
		const [organization] = await db
			.insert(organizations)
			.values({
				name: input.name,
				description: input.description,
				slug,
				logo: input.logo,
				billingEmail: input.billingEmail,
				taxId: input.taxId,
				address: input.address,
				phone: input.phone,
				ownerId: userId,
				isActive: true,
				settings: {},
			})
			.returning();

		// Add creator as owner
		await db.insert(organizationMembers).values({
			organizationId: organization.id,
			userId,
			role: 'owner',
		});

		// Create default settings
		await db.insert(organizationSettings).values({
			organizationId: organization.id,
			settings: {},
			branding: {},
			integrations: {},
			features: {},
			notifications: {},
			security: {},
			compliance: {},
		});

		logger.info('[OrganizationService] Created organization', { organizationId: organization.id, userId });
		return organization;
	} catch (error) {
		logger.error('[OrganizationService] Error creating organization', { error, input, userId });
		throw error;
	}
}

/**
 * Update organization
 */
export async function updateOrganization(
	input: UpdateOrganizationInput,
	userId: string
): Promise<Organization> {
	try {
		// Verify user has permission (owner or admin)
		const membership = await db
			.select()
			.from(organizationMembers)
			.where(
				and(
					eq(organizationMembers.organizationId, input.id),
					eq(organizationMembers.userId, userId),
					or(
						eq(organizationMembers.role, 'owner'),
						eq(organizationMembers.role, 'admin')
					)
				)
			)
			.limit(1);

		if (membership.length === 0) {
			throw new Error('Insufficient permissions to update organization');
		}

		const updateData: Partial<Organization> = {};
		if (input.name !== undefined) updateData.name = input.name;
		if (input.description !== undefined) updateData.description = input.description;
		if (input.logo !== undefined) updateData.logo = input.logo;
		if (input.billingEmail !== undefined) updateData.billingEmail = input.billingEmail;
		if (input.taxId !== undefined) updateData.taxId = input.taxId;
		if (input.address !== undefined) updateData.address = input.address;
		if (input.phone !== undefined) updateData.phone = input.phone;
		updateData.updatedAt = new Date();

		const [updated] = await db
			.update(organizations)
			.set(updateData)
			.where(eq(organizations.id, input.id))
			.returning();

		if (!updated) {
			throw new Error('Organization not found');
		}

		logger.info('[OrganizationService] Updated organization', { organizationId: input.id, userId });
		return updated;
	} catch (error) {
		logger.error('[OrganizationService] Error updating organization', { error, input, userId });
		throw error;
	}
}

/**
 * Delete organization (soft delete)
 */
export async function deleteOrganization(
	organizationId: string,
	userId: string
): Promise<void> {
	try {
		// Verify user is owner
		const membership = await db
			.select()
			.from(organizationMembers)
			.where(
				and(
					eq(organizationMembers.organizationId, organizationId),
					eq(organizationMembers.userId, userId),
					eq(organizationMembers.role, 'owner')
				)
			)
			.limit(1);

		if (membership.length === 0) {
			throw new Error('Only organization owners can delete organizations');
		}

		// Soft delete
		await db
			.update(organizations)
			.set({ isActive: false, updatedAt: new Date() })
			.where(eq(organizations.id, organizationId));

		logger.info('[OrganizationService] Deleted organization', { organizationId, userId });
	} catch (error) {
		logger.error('[OrganizationService] Error deleting organization', { error, organizationId, userId });
		throw error;
	}
}

/**
 * Check if user is member of organization
 */
export async function isUserMemberOfOrganization(
	userId: string,
	organizationId: string
): Promise<boolean> {
	try {
		const result = await db
			.select()
			.from(organizationMembers)
			.where(
				and(
					eq(organizationMembers.userId, userId),
					eq(organizationMembers.organizationId, organizationId)
				)
			)
			.limit(1);

		return result.length > 0;
	} catch (error) {
		logger.error('[OrganizationService] Error checking membership', { error, userId, organizationId });
		return false;
	}
}

/**
 * Get user's role in organization
 */
export async function getUserRoleInOrganization(
	userId: string,
	organizationId: string
): Promise<'owner' | 'admin' | 'member' | 'viewer' | null> {
	try {
		const result = await db
			.select({ role: organizationMembers.role })
			.from(organizationMembers)
			.where(
				and(
					eq(organizationMembers.userId, userId),
					eq(organizationMembers.organizationId, organizationId)
				)
			)
			.limit(1);

		if (result.length === 0) {
			return null;
		}

		return result[0].role as 'owner' | 'admin' | 'member' | 'viewer';
	} catch (error) {
		logger.error('[OrganizationService] Error getting user role', { error, userId, organizationId });
		return null;
	}
}

/**
 * Verify user has required permission level
 */
export async function hasPermission(
	userId: string,
	organizationId: string,
	requiredRole: 'owner' | 'admin' | 'member' | 'viewer'
): Promise<boolean> {
	const role = await getUserRoleInOrganization(userId, organizationId);
	if (!role) return false;

	const roleHierarchy = { owner: 4, admin: 3, member: 2, viewer: 1 };
	return roleHierarchy[role] >= roleHierarchy[requiredRole];
}

/**
 * Get active organization ID from session or user preference
 * This implements the fallback logic: session -> preference -> primary organization
 */
export async function getActiveOrganizationId(
	userId: string,
	sessionOrgId?: string | null
): Promise<string | null> {
	try {
		// 1. Check session (if provided)
		if (sessionOrgId) {
			const isMember = await isUserMemberOfOrganization(userId, sessionOrgId);
			if (isMember) {
				return sessionOrgId;
			}
		}

		// 2. Check user preference
		const userPrefs = await db
			.select({ customPreferences: sql<{ activeOrganizationId?: string }>`custom_preferences` })
			.from(sql`user_preferences`)
			.where(sql`user_id = ${userId}`)
			.limit(1);

		if (userPrefs.length > 0 && userPrefs[0].customPreferences?.activeOrganizationId) {
			const prefOrgId = userPrefs[0].customPreferences.activeOrganizationId;
			const isMember = await isUserMemberOfOrganization(userId, prefOrgId);
			if (isMember) {
				return prefOrgId;
			}
		}

		// 3. Fallback to primary organization (first organization user is owner of, or first organization)
		const userOrgs = await getUserOrganizations(userId);
		if (userOrgs.length > 0) {
			// Prefer organization where user is owner
			const ownerOrg = userOrgs.find((uo) => uo.role === 'owner');
			return ownerOrg ? ownerOrg.organization.id : userOrgs[0].organization.id;
		}

		return null;
	} catch (error) {
		logger.error('[OrganizationService] Error getting active organization', { error, userId });
		return null;
	}
}

/**
 * Switch active organization
 * Updates both session (via return value) and user preference
 */
export async function switchOrganization(
	userId: string,
	organizationId: string
): Promise<Organization> {
	try {
		// Verify membership
		const isMember = await isUserMemberOfOrganization(userId, organizationId);
		if (!isMember) {
			throw new Error('User is not a member of this organization');
		}

		// Get organization
		const org = await db
			.select()
			.from(organizations)
			.where(
				and(
					eq(organizations.id, organizationId),
					eq(organizations.isActive, true)
				)
			)
			.limit(1);

		if (org.length === 0) {
			throw new Error('Organization not found or inactive');
		}

		// Update user preference
		await db.execute(sql`
			INSERT INTO user_preferences (user_id, custom_preferences, updated_at)
			VALUES (${userId}, jsonb_build_object('activeOrganizationId', ${organizationId}), now())
			ON CONFLICT (user_id) 
			DO UPDATE SET 
				custom_preferences = jsonb_set(
					COALESCE(user_preferences.custom_preferences, '{}'::jsonb),
					'{activeOrganizationId}',
					to_jsonb(${organizationId})
				),
				updated_at = now()
		`);

		logger.info('[OrganizationService] Switched organization', { userId, organizationId });
		return org[0];
	} catch (error) {
		logger.error('[OrganizationService] Error switching organization', { error, userId, organizationId });
		throw error;
	}
}

/**
 * Get organization members
 */
export async function getOrganizationMembers(organizationId: string, userId: string) {
	try {
		// Verify user has permission
		const hasAccess = await hasPermission(userId, organizationId, 'viewer');
		if (!hasAccess) {
			throw new Error('Insufficient permissions to view members');
		}

		const members = await db
			.select({
				member: organizationMembers,
				user: users,
			})
			.from(organizationMembers)
			.innerJoin(users, eq(organizationMembers.userId, users.id))
			.where(eq(organizationMembers.organizationId, organizationId))
			.orderBy(desc(organizationMembers.joinedAt));

		return members.map((row) => ({
			...row.member,
			user: {
				id: row.user.id,
				email: row.user.email,
				firstName: row.user.firstName,
				lastName: row.user.lastName,
			},
		}));
	} catch (error) {
		logger.error('[OrganizationService] Error getting members', { error, organizationId });
		throw error;
	}
}

/**
 * Update member role
 */
export async function updateMemberRole(
	organizationId: string,
	memberId: string,
	newRole: 'owner' | 'admin' | 'member' | 'viewer',
	userId: string
) {
	try {
		// Verify user has permission (admin or owner)
		const hasAccess = await hasPermission(userId, organizationId, 'admin');
		if (!hasAccess) {
			throw new Error('Insufficient permissions to update member roles');
		}

		// Cannot change owner role unless current user is owner
		const currentRole = await getUserRoleInOrganization(userId, organizationId);
		if (currentRole !== 'owner') {
			const memberRole = await db
				.select({ role: organizationMembers.role })
				.from(organizationMembers)
				.where(
					and(
						eq(organizationMembers.id, memberId),
						eq(organizationMembers.organizationId, organizationId)
					)
				)
				.limit(1);

			if (memberRole.length > 0 && memberRole[0].role === 'owner') {
				throw new Error('Only organization owners can modify owner roles');
			}
		}

		const [updated] = await db
			.update(organizationMembers)
			.set({ role: newRole, updatedAt: new Date() })
			.where(
				and(
					eq(organizationMembers.id, memberId),
					eq(organizationMembers.organizationId, organizationId)
				)
			)
			.returning();

		if (!updated) {
			throw new Error('Member not found');
		}

		return updated;
	} catch (error) {
		logger.error('[OrganizationService] Error updating member role', { error, organizationId, memberId });
		throw error;
	}
}

/**
 * Remove member from organization
 */
export async function removeMember(
	organizationId: string,
	memberId: string,
	userId: string
) {
	try {
		// Verify user has permission (admin or owner)
		const hasAccess = await hasPermission(userId, organizationId, 'admin');
		if (!hasAccess) {
			throw new Error('Insufficient permissions to remove members');
		}

		// Cannot remove owner unless current user is owner
		const currentRole = await getUserRoleInOrganization(userId, organizationId);
		if (currentRole !== 'owner') {
			const memberRole = await db
				.select({ role: organizationMembers.role })
				.from(organizationMembers)
				.where(
					and(
						eq(organizationMembers.id, memberId),
						eq(organizationMembers.organizationId, organizationId)
					)
				)
				.limit(1);

			if (memberRole.length > 0 && memberRole[0].role === 'owner') {
				throw new Error('Only organization owners can remove owners');
			}
		}

		await db
			.delete(organizationMembers)
			.where(
				and(
					eq(organizationMembers.id, memberId),
					eq(organizationMembers.organizationId, organizationId)
				)
			);

		logger.info('[OrganizationService] Removed member', { organizationId, memberId, userId });
	} catch (error) {
		logger.error('[OrganizationService] Error removing member', { error, organizationId, memberId });
		throw error;
	}
}

/**
 * Create organization invitation
 */
export async function createInvitation(
	organizationId: string,
	email: string,
	role: 'owner' | 'admin' | 'member' | 'viewer',
	invitedBy: string,
	message?: string
): Promise<OrganizationInvitation> {
	try {
		// Verify inviter has permission
		const hasAccess = await hasPermission(invitedBy, organizationId, 'admin');
		if (!hasAccess) {
			throw new Error('Insufficient permissions to invite members');
		}

		// Check if user already exists and is a member
		const existingUser = await db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1);

		if (existingUser.length > 0) {
			const isMember = await isUserMemberOfOrganization(existingUser[0].id, organizationId);
			if (isMember) {
				throw new Error('User is already a member of this organization');
			}
		}

		// Check for existing pending invitation
		const existingInvitation = await db
			.select()
			.from(organizationInvitations)
			.where(
				and(
					eq(organizationInvitations.organizationId, organizationId),
					eq(organizationInvitations.email, email),
					eq(organizationInvitations.status, 'pending')
				)
			)
			.limit(1);

		if (existingInvitation.length > 0) {
			throw new Error('Invitation already sent to this email');
		}

		// Generate token
		const token = randomBytes(32).toString('hex');
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

		const [invitation] = await db
			.insert(organizationInvitations)
			.values({
				organizationId,
				email,
				role,
				invitedBy,
				token,
				expiresAt,
				status: 'pending',
				message,
			})
			.returning();

		return invitation;
	} catch (error) {
		logger.error('[OrganizationService] Error creating invitation', { error, organizationId, email });
		throw error;
	}
}

/**
 * Get organization invitations
 */
export async function getOrganizationInvitations(organizationId: string, userId: string) {
	try {
		// Verify user has permission
		const hasAccess = await hasPermission(userId, organizationId, 'viewer');
		if (!hasAccess) {
			throw new Error('Insufficient permissions to view invitations');
		}

		const invitations = await db
			.select()
			.from(organizationInvitations)
			.where(eq(organizationInvitations.organizationId, organizationId))
			.orderBy(desc(organizationInvitations.createdAt));

		return invitations;
	} catch (error) {
		logger.error('[OrganizationService] Error getting invitations', { error, organizationId });
		throw error;
	}
}

/**
 * Accept invitation
 */
export async function acceptInvitation(token: string, userId: string): Promise<Organization> {
	try {
		const invitation = await db
			.select()
			.from(organizationInvitations)
			.where(
				and(
					eq(organizationInvitations.token, token),
					eq(organizationInvitations.status, 'pending')
				)
			)
			.limit(1);

		if (invitation.length === 0) {
			throw new Error('Invitation not found or already used');
		}

		const inv = invitation[0];

		// Check expiry
		if (new Date() > inv.expiresAt) {
			await db
				.update(organizationInvitations)
				.set({ status: 'expired' })
				.where(eq(organizationInvitations.id, inv.id));
			throw new Error('Invitation has expired');
		}

		// Verify user email matches invitation
		const user = await db
			.select()
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (user.length === 0 || user[0].email !== inv.email) {
			throw new Error('Invitation email does not match your account');
		}

		// Add user to organization (check if already exists first)
		const existingMember = await db
			.select()
			.from(organizationMembers)
			.where(
				and(
					eq(organizationMembers.organizationId, inv.organizationId),
					eq(organizationMembers.userId, userId)
				)
			)
			.limit(1);

		if (existingMember.length === 0) {
			await db.insert(organizationMembers).values({
				organizationId: inv.organizationId,
				userId,
				role: inv.role,
			});
		}

		// Update invitation status
		await db
			.update(organizationInvitations)
			.set({ status: 'accepted', acceptedAt: new Date() })
			.where(eq(organizationInvitations.id, inv.id));

		// Get organization
		const org = await db
			.select()
			.from(organizations)
			.where(eq(organizations.id, inv.organizationId))
			.limit(1);

		if (org.length === 0) {
			throw new Error('Organization not found');
		}

		return org[0];
	} catch (error) {
		logger.error('[OrganizationService] Error accepting invitation', { error, token });
		throw error;
	}
}

/**
 * Decline invitation
 */
export async function declineInvitation(token: string): Promise<void> {
	try {
		const invitation = await db
			.select()
			.from(organizationInvitations)
			.where(
				and(
					eq(organizationInvitations.token, token),
					eq(organizationInvitations.status, 'pending')
				)
			)
			.limit(1);

		if (invitation.length === 0) {
			throw new Error('Invitation not found');
		}

		await db
			.update(organizationInvitations)
			.set({ status: 'declined', declinedAt: new Date() })
			.where(eq(organizationInvitations.id, invitation[0].id));
	} catch (error) {
		logger.error('[OrganizationService] Error declining invitation', { error, token });
		throw error;
	}
}

/**
 * Get organization settings
 */
export async function getOrganizationSettings(organizationId: string, userId: string) {
	try {
		// Verify user has permission
		const hasAccess = await hasPermission(userId, organizationId, 'viewer');
		if (!hasAccess) {
			throw new Error('Insufficient permissions to view settings');
		}

		const settings = await db
			.select()
			.from(organizationSettings)
			.where(eq(organizationSettings.organizationId, organizationId))
			.limit(1);

		if (settings.length === 0) {
			// Create default settings if they don't exist
			const [newSettings] = await db
				.insert(organizationSettings)
				.values({
					organizationId,
					settings: {},
					branding: {},
					integrations: {},
					features: {},
					notifications: {},
					security: {},
					compliance: {},
				})
				.returning();
			return newSettings;
		}

		return settings[0];
	} catch (error) {
		logger.error('[OrganizationService] Error getting settings', { error, organizationId });
		throw error;
	}
}

/**
 * Update organization settings
 */
export async function updateOrganizationSettings(
	organizationId: string,
	settings: Partial<OrganizationSettings>,
	userId: string
) {
	try {
		// Verify user has permission (admin or owner)
		const hasAccess = await hasPermission(userId, organizationId, 'admin');
		if (!hasAccess) {
			throw new Error('Insufficient permissions to update settings');
		}

		const updateData: Partial<OrganizationSettings> = {
			updatedAt: new Date(),
		};
		if (settings.settings !== undefined) updateData.settings = settings.settings;
		if (settings.branding !== undefined) updateData.branding = settings.branding;
		if (settings.integrations !== undefined) updateData.integrations = settings.integrations;
		if (settings.features !== undefined) updateData.features = settings.features;
		if (settings.notifications !== undefined) updateData.notifications = settings.notifications;
		if (settings.security !== undefined) updateData.security = settings.security;
		if (settings.compliance !== undefined) updateData.compliance = settings.compliance;

		const [updated] = await db
			.update(organizationSettings)
			.set(updateData)
			.where(eq(organizationSettings.organizationId, organizationId))
			.returning();

		if (!updated) {
			// Create if doesn't exist
			const [created] = await db
				.insert(organizationSettings)
				.values({
					organizationId,
					...updateData,
				})
				.returning();
			return created;
		}

		return updated;
	} catch (error) {
		logger.error('[OrganizationService] Error updating settings', { error, organizationId });
		throw error;
	}
}

