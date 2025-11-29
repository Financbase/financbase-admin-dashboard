/**
 * White Label Service Integration Tests
 * Tests the complete white label implementation
 * 
 * Uses testDb from test-db.ts which supports neon-serverless driver for transaction support
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { WhiteLabelService } from '@/lib/services/white-label-service';
import { testDb } from './test-db';
import { TestDatabase } from './test-db';
import { workspaces } from '@/drizzle/schema/workspaces';
import { eq } from 'drizzle-orm';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock getDbOrThrow to return testDb so service uses the same connection
// This ensures both test and service use the same database instance
vi.mock('@/lib/db', async () => {
	const actual = await vi.importActual<typeof import('@/lib/db')>('@/lib/db');
	// Import testDb here to avoid hoisting issues
	const { testDb } = await import('./test-db');
	return {
		...actual,
		getDbOrThrow: () => testDb,
	};
});

describe('White Label Service', () => {
	let service: WhiteLabelService;
	let testWorkspaceId: string;
	let testDatabase: ReturnType<typeof TestDatabase.getInstance>;
	const db = testDb;

	beforeAll(async () => {
		// Use TestDatabase for proper test setup
		testDatabase = TestDatabase.getInstance();
		await testDatabase.setup();
		
		// Clean up any existing test workspaces
		try {
			await db.delete(workspaces).where(eq(workspaces.workspaceId, `ws_test_${Date.now()}`));
		} catch (error) {
			// Ignore cleanup errors
		}
		
		testWorkspaceId = `ws_test_${Date.now()}`;

		// Create test workspace using testDb (supports neon-serverless with transactions)
		// Use a transaction to ensure the workspace is committed before service queries
		const [inserted] = await db.insert(workspaces).values({
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
		}).returning();

		// Verify workspace was created
		if (!inserted) {
			throw new Error('Failed to create test workspace');
		}

		// Verify workspace is immediately accessible (testDb should handle this correctly)
		// Retry a few times to handle any connection/timing issues
		let verifyWorkspace = await db.select().from(workspaces).where(eq(workspaces.workspaceId, testWorkspaceId)).limit(1);
		let retries = 5;
		while (!verifyWorkspace[0] && retries > 0) {
			await new Promise(resolve => setTimeout(resolve, 100));
			verifyWorkspace = await db.select().from(workspaces).where(eq(workspaces.workspaceId, testWorkspaceId)).limit(1);
			retries--;
		}
		
		if (!verifyWorkspace[0]) {
			// Debug: check what workspaces exist
			const allWorkspaces = await db.select({ workspaceId: workspaces.workspaceId, name: workspaces.name }).from(workspaces).limit(10);
			throw new Error(`Workspace ${testWorkspaceId} was not found after creation. Found ${allWorkspaces.length} workspaces total.`);
		}

		// Create service AFTER workspace is created and verified
		// The mock ensures getDbOrThrow returns testDb, so service uses same connection
		service = new WhiteLabelService();
		
		// Verify service can see the workspace
		const serviceWorkspace = await service.getBranding(testWorkspaceId);
		if (!serviceWorkspace || serviceWorkspace.companyName === 'Financbase') {
			// Service can't see the workspace - this indicates a connection issue
			console.warn('Service cannot see test workspace - this may indicate a database connection issue');
		}
	});

	afterAll(async () => {
		// Cleanup test workspace
		try {
			await db.delete(workspaces).where(eq(workspaces.workspaceId, testWorkspaceId));
		} catch (error) {
			// Ignore cleanup errors
		}
		await testDatabase?.teardown();
	});

	describe('getBranding', () => {
		it('should return branding for enterprise workspace', async () => {
			// Verify workspace exists in database - query all workspaces to debug
			const allWorkspaces = await db.select().from(workspaces).limit(10);
			const workspaceResult = await db
				.select({
					settings: workspaces.settings,
					logo: workspaces.logo,
					name: workspaces.name,
					plan: workspaces.plan,
					workspaceId: workspaces.workspaceId,
				})
				.from(workspaces)
				.where(eq(workspaces.workspaceId, testWorkspaceId))
				.limit(1);
			
			if (!workspaceResult || workspaceResult.length === 0) {
				// Debug: check if workspace exists with different query
				const debugResult = await db.select().from(workspaces).where(eq(workspaces.name, 'Test Enterprise Workspace')).limit(5);
				throw new Error(`Test workspace ${testWorkspaceId} was not found. Found ${workspaceResult?.length || 0} workspaces. Debug: ${debugResult.length} workspaces with name match.`);
			}
			
			// Verify the workspace has the expected plan and settings
			expect(workspaceResult[0].plan).toBe('enterprise');
			const settings = JSON.parse(workspaceResult[0].settings as string);
			expect(settings.whiteLabel?.companyName).toBe('Test Company');
			
			// Recreate service to ensure it uses fresh DB connection that can see the workspace
			service = new WhiteLabelService();
			
			// Wait a bit more to ensure transaction is fully committed
			await new Promise(resolve => setTimeout(resolve, 300));
			
			const branding = await service.getBranding(testWorkspaceId);

			expect(branding).toBeDefined();
			// The service may merge with defaults, so check that it contains our custom values
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

