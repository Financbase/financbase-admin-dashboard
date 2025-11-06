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

// Mock dependencies
vi.mock('@/lib/db/rls-context');
vi.mock('@/lib/db', () => ({
	db: {
		select: vi.fn(),
		insert: vi.fn(),
	},
}));
vi.mock('@/lib/email/service', () => ({
	resend: {
		emails: {
			send: vi.fn().mockResolvedValue({ id: 'email_123' }),
		},
	},
}));
vi.mock('@/lib/email', () => ({
	resend: {
		emails: {
			send: vi.fn().mockResolvedValue({ id: 'email_123' }),
		},
	},
}));
vi.mock('@/lib/email-templates', () => ({
	EmailTemplates: {
		renderFolderInvitation: vi.fn().mockReturnValue('<html>Email</html>'),
		renderFolderInvitationText: vi.fn().mockReturnValue('Email text'),
	},
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

		expect(getUserFromDatabase).toHaveBeenCalledWith(mockClerkId);
		expect(sendSpy).toHaveBeenCalled();
		const callArgs = sendSpy.mock.calls[0][0];
		expect(callArgs.html).toContain('John Doe');
	});

	it('should use first_name only when last_name is not available', async () => {
		const mockClerkId = 'clerk_user_123';
		const mockUser = {
			id: 'user_uuid_123',
			clerk_id: mockClerkId,
			organization_id: 'org_uuid_456',
			email: 'test@example.com',
			first_name: 'John',
			last_name: null,
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

		expect(getUserFromDatabase).toHaveBeenCalledWith(mockClerkId);
		expect(sendSpy).toHaveBeenCalled();
		const callArgs = sendSpy.mock.calls[0][0];
		expect(callArgs.html).toContain('John');
	});

	it('should use email as fallback when name is not available', async () => {
		const mockClerkId = 'clerk_user_123';
		const mockUser = {
			id: 'user_uuid_123',
			clerk_id: mockClerkId,
			organization_id: 'org_uuid_456',
			email: 'test@example.com',
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

		expect(getUserFromDatabase).toHaveBeenCalledWith(mockClerkId);
		expect(sendSpy).toHaveBeenCalled();
		const callArgs = sendSpy.mock.calls[0][0];
		expect(callArgs.html).toContain('test@example.com');
	});

	it('should use default "Team Member" when user fetch fails', async () => {
		const mockClerkId = 'clerk_user_123';

		vi.mocked(getUserFromDatabase).mockRejectedValue(new Error('Database error'));

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

		expect(getUserFromDatabase).toHaveBeenCalledWith(mockClerkId);
		expect(sendSpy).toHaveBeenCalled();
		const callArgs = sendSpy.mock.calls[0][0];
		expect(callArgs.html).toContain('Team Member');
	});
});

