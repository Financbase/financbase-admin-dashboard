/**
 * White Label Service Integration Tests
 * Tests the complete white label implementation
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { WhiteLabelService } from '@/lib/services/white-label-service';
import { getDbOrThrow } from '@/lib/db';
import { workspaces } from '@/drizzle/schema/workspaces';
import { eq } from 'drizzle-orm';

describe('White Label Service', () => {
	let service: WhiteLabelService;
	let testWorkspaceId: string;
	const db = getDbOrThrow();

	beforeAll(async () => {
		service = new WhiteLabelService();
		testWorkspaceId = `ws_test_${Date.now()}`;

		// Create test workspace
		await db.insert(workspaces).values({
			workspaceId: testWorkspaceId,
			name: 'Test Enterprise Workspace',
			slug: `test-${Date.now()}`,
			plan: 'enterprise',
			domain: 'test-enterprise.example.com',
			settings: JSON.stringify({
				whiteLabel: {
					logo: '/test-logo.png',
					companyName: 'Test Company',
					primaryColor: '#FF5733',
					secondaryColor: '#33FF57',
					fontFamily: 'Arial, sans-serif',
					supportEmail: 'support@testcompany.com',
					supportUrl: 'https://testcompany.com/support',
					customDomain: 'app.testcompany.com',
					hideFinancbaseBranding: true,
				},
			}),
			ownerId: 'test-owner-id',
		});
	});

	afterAll(async () => {
		// Cleanup test workspace
		await db.delete(workspaces).where(eq(workspaces.workspaceId, testWorkspaceId));
	});

	describe('getBranding', () => {
		it('should return branding for enterprise workspace', async () => {
			const branding = await service.getBranding(testWorkspaceId);

			expect(branding).toBeDefined();
			expect(branding.companyName).toBe('Test Company');
			expect(branding.primaryColor).toBe('#FF5733');
			expect(branding.logo).toBe('/test-logo.png');
			expect(branding.hideFinancbaseBranding).toBe(true);
		});

		it('should return default branding for non-existent workspace', async () => {
			const branding = await service.getBranding('non-existent-workspace');

			expect(branding).toBeDefined();
			expect(branding.companyName).toBe('Financbase');
		});

		it('should return default branding for non-enterprise workspace', async () => {
			// Create a non-enterprise workspace
			const freeWorkspaceId = `ws_free_${Date.now()}`;
			await db.insert(workspaces).values({
				workspaceId: freeWorkspaceId,
				name: 'Free Workspace',
				plan: 'free',
				ownerId: 'test-owner',
			});

			const branding = await service.getBranding(freeWorkspaceId);
			expect(branding.companyName).toBe('Financbase');

			// Cleanup
			await db.delete(workspaces).where(eq(workspaces.workspaceId, freeWorkspaceId));
		});
	});

	describe('getBrandingByDomain', () => {
		it('should find workspace by exact domain match', async () => {
			const result = await service.getBrandingByDomain('test-enterprise.example.com');

			expect(result).toBeDefined();
			expect(result?.workspaceId).toBe(testWorkspaceId);
			expect(result?.branding.companyName).toBe('Test Company');
		});

		it('should find workspace by custom domain in settings', async () => {
			const result = await service.getBrandingByDomain('app.testcompany.com');

			expect(result).toBeDefined();
			expect(result?.workspaceId).toBe(testWorkspaceId);
		});

		it('should return null for non-existent domain', async () => {
			const result = await service.getBrandingByDomain('nonexistent.example.com');

			expect(result).toBeNull();
		});
	});

	describe('updateBranding', () => {
		it('should update branding settings', async () => {
			const updatedBranding = await service.updateBranding(testWorkspaceId, {
				companyName: 'Updated Test Company',
				primaryColor: '#0000FF',
			});

			expect(updatedBranding.companyName).toBe('Updated Test Company');
			expect(updatedBranding.primaryColor).toBe('#0000FF');
			// Other fields should be preserved
			expect(updatedBranding.logo).toBe('/test-logo.png');
		});

		it('should throw error for non-existent workspace', async () => {
			await expect(
				service.updateBranding('non-existent', {
					companyName: 'Test',
				})
			).rejects.toThrow();
		});
	});

	describe('validateBranding', () => {
		it('should validate correct branding settings', () => {
			expect(() => {
				service.validateBranding({
					companyName: 'Valid Company',
					primaryColor: '#FF5733',
				});
			}).not.toThrow();
		});

		it('should reject invalid color format', () => {
			expect(() => {
				service.validateBranding({
					primaryColor: 'invalid-color',
				});
			}).toThrow();
		});

		it('should reject empty company name', () => {
			expect(() => {
				service.validateBranding({
					companyName: '',
				});
			}).toThrow();
		});
	});
});

