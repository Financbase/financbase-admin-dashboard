/**
 * Folder Sharing Service - Inviter Name Tests
 * Tests for inviter name extraction in folder sharing service
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FolderSharingService } from '@/lib/services/business/folder-sharing.service';
import { getUserFromDatabase } from '@/lib/db/rls-context';

// Mock dependencies - use hoisted mocks to ensure they're available before imports
const { mockEmailTemplates, mockResend } = vi.hoisted(() => ({
	mockEmailTemplates: {
		renderFolderInvitation: vi.fn().mockReturnValue('<html>Email</html>'),
		renderFolderInvitationText: vi.fn().mockReturnValue('Email text'),
	},
	mockResend: {
		emails: {
			send: vi.fn().mockResolvedValue({ id: 'email_123' }),
		},
	},
}));

vi.mock('@/lib/db/rls-context');
vi.mock('@/lib/db', () => ({
	db: {
		select: vi.fn(),
		insert: vi.fn(),
	},
}));
vi.mock('@/lib/db/schemas/folder-roles.schema', () => ({
	folderRoles: {},
}));
vi.mock('@/drizzle/schema/workspaces', () => ({
	workspaces: {},
}));
vi.mock('@/lib/email/service', () => ({
	resend: mockResend,
}));
vi.mock('@/lib/email', () => ({
	resend: mockResend,
}));
vi.mock('@/lib/services/email-templates', () => ({
	EmailTemplates: mockEmailTemplates,
}));
vi.mock('@/lib/lib/security-utils', () => ({
	generateSecureToken: vi.fn().mockReturnValue('secure_token_123'),
}));

describe('FolderSharingService - Inviter Name', () => {
	let folderSharingService: FolderSharingService;

	beforeEach(() => {
		vi.clearAllMocks();
		folderSharingService = new FolderSharingService();
	});

	it('should use full name when first_name and last_name are available', async () => {
		const mockClerkId = 'clerk_user_123';
		const mockUser = {
			id: 'user_uuid_123',
			clerk_id: mockClerkId,
			organization_id: 'org_uuid_456',
			email: 'test@example.com',
			first_name: 'John',
			last_name: 'Doe',
		};

		vi.mocked(getUserFromDatabase).mockResolvedValue(mockUser as any);

		const { db } = await import('@/lib/db');
		vi.mocked(db.select).mockReturnValue({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({
					limit: vi.fn().mockResolvedValue([
						{
							id: 'folder_123',
							name: 'Test Folder',
							workspaceId: 'workspace_123',
						},
						{
							id: 'workspace_123',
							name: 'Test Workspace',
						},
					]),
				}),
			}),
		} as any);

		vi.mocked(db.insert).mockReturnValue({
			values: vi.fn().mockReturnValue({
				returning: vi.fn().mockResolvedValue([
					{
						id: 'invitation_123',
						folderId: 'folder_123',
						email: 'invitee@example.com',
						invitedBy: mockClerkId,
					},
				]),
			}),
		} as any);

		// Mock resend is already set up, just verify the call
		const emailModule = await import('@/lib/email');
		const resend = (emailModule as any).resend;
		const sendSpy = resend ? vi.spyOn(resend.emails, 'send') : vi.fn();

		await folderSharingService.createFolderInvitation(
			'folder_123',
			'invitee@example.com',
			'viewer',
			mockClerkId
		);

		// Verify that EmailTemplates was called with the correct inviter name
		expect(mockEmailTemplates.renderFolderInvitation).toHaveBeenCalled();
		const callArgs = mockEmailTemplates.renderFolderInvitation.mock.calls[0][0];
		expect(callArgs.inviterName).toBe('John Doe');
	});

	it('should use first_name only when last_name is not available', async () => {
		const mockClerkId = 'clerk_user_456';
		const mockUser = {
			id: 'user_uuid_456',
			clerk_id: mockClerkId,
			organization_id: 'org_uuid_789',
			email: 'test2@example.com',
			first_name: 'Jane',
			last_name: null,
		};

		vi.mocked(getUserFromDatabase).mockResolvedValue(mockUser as any);

		const { db } = await import('@/lib/db');
		vi.mocked(db.select).mockReturnValue({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({
					limit: vi.fn().mockResolvedValue([
						{
							id: 'folder_456',
							name: 'Test Folder 2',
							workspaceId: 'workspace_456',
						},
						{
							id: 'workspace_456',
							name: 'Test Workspace 2',
						},
					]),
				}),
			}),
		} as any);

		vi.mocked(db.insert).mockReturnValue({
			values: vi.fn().mockReturnValue({
				returning: vi.fn().mockResolvedValue([
					{
						id: 'invitation_456',
						folderId: 'folder_456',
						email: 'invitee2@example.com',
						invitedBy: mockClerkId,
					},
				]),
			}),
		} as any);

		await folderSharingService.createFolderInvitation(
			'folder_456',
			'invitee2@example.com',
			'editor',
			mockClerkId
		);

		expect(mockEmailTemplates.renderFolderInvitation).toHaveBeenCalled();
		const callArgs = mockEmailTemplates.renderFolderInvitation.mock.calls[0][0];
		expect(callArgs.inviterName).toBe('Jane');
	});

	it('should use email as fallback when name is not available', async () => {
		const mockClerkId = 'clerk_user_789';
		const mockUser = {
			id: 'user_uuid_789',
			clerk_id: mockClerkId,
			organization_id: 'org_uuid_012',
			email: 'test3@example.com',
			first_name: null,
			last_name: null,
		};

		vi.mocked(getUserFromDatabase).mockResolvedValue(mockUser as any);

		const { db } = await import('@/lib/db');
		vi.mocked(db.select).mockReturnValue({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({
					limit: vi.fn().mockResolvedValue([
						{
							id: 'folder_789',
							name: 'Test Folder 3',
							workspaceId: 'workspace_789',
						},
						{
							id: 'workspace_789',
							name: 'Test Workspace 3',
						},
					]),
				}),
			}),
		} as any);

		vi.mocked(db.insert).mockReturnValue({
			values: vi.fn().mockReturnValue({
				returning: vi.fn().mockResolvedValue([
					{
						id: 'invitation_789',
						folderId: 'folder_789',
						email: 'invitee3@example.com',
						invitedBy: mockClerkId,
					},
				]),
			}),
		} as any);

		await folderSharingService.createFolderInvitation(
			'folder_789',
			'invitee3@example.com',
			'commenter',
			mockClerkId
		);

		expect(mockEmailTemplates.renderFolderInvitation).toHaveBeenCalled();
		const callArgs = mockEmailTemplates.renderFolderInvitation.mock.calls[0][0];
		expect(callArgs.inviterName).toBe('test3@example.com');
	});

	it('should use default "Team Member" when user fetch fails', async () => {
		const mockClerkId = 'clerk_user_fail';
		
		// Mock getUserFromDatabase to throw an error
		vi.mocked(getUserFromDatabase).mockRejectedValue(new Error('Database error'));

		const { db } = await import('@/lib/db');
		vi.mocked(db.select).mockReturnValue({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({
					limit: vi.fn().mockResolvedValue([
						{
							id: 'folder_fail',
							name: 'Test Folder Fail',
							workspaceId: 'workspace_fail',
						},
						{
							id: 'workspace_fail',
							name: 'Test Workspace Fail',
						},
					]),
				}),
			}),
		} as any);

		vi.mocked(db.insert).mockReturnValue({
			values: vi.fn().mockReturnValue({
				returning: vi.fn().mockResolvedValue([
					{
						id: 'invitation_fail',
						folderId: 'folder_fail',
						email: 'invitee_fail@example.com',
						invitedBy: mockClerkId,
					},
				]),
			}),
		} as any);

		await folderSharingService.createFolderInvitation(
			'folder_fail',
			'invitee_fail@example.com',
			'viewer',
			mockClerkId
		);

		expect(mockEmailTemplates.renderFolderInvitation).toHaveBeenCalled();
		const callArgs = mockEmailTemplates.renderFolderInvitation.mock.calls[0][0];
		expect(callArgs.inviterName).toBe('Team Member');
	});
});
