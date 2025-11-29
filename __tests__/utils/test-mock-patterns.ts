/**
 * Standard Test Mock Patterns for Next.js 16
 * 
 * Reusable mock patterns for testing API routes
 */

import { vi } from 'vitest';

/**
 * Create a mock for a service class
 * Use this pattern when the route creates new instances of a service
 */
export function createServiceClassMock(methods: Record<string, ReturnType<typeof vi.fn>>) {
	return class {
		constructor() {
			// Copy all methods to the instance
			Object.keys(methods).forEach(key => {
				(this as any)[key] = methods[key];
			});
		}
	};
}

/**
 * Standard withRLS mock pattern
 */
export function createWithRLSMock(mockUserId: string = 'user-123') {
	return {
		withRLS: async (fn: any) => {
			return await fn(mockUserId);
		},
	};
}

/**
 * Standard Clerk auth mock pattern
 */
export function createClerkAuthMock(mockUserId: string = 'user-123') {
	return {
		auth: vi.fn().mockResolvedValue({ userId: mockUserId }),
		currentUser: vi.fn().mockResolvedValue({
			id: mockUserId,
			emailAddresses: [{ emailAddress: 'test@example.com' }],
		}),
	};
}

/**
 * Create validation schema mock that throws ZodError for invalid data
 */
export function createValidationSchemaMock(
	schemaName: string,
	validateFn: (data: any) => boolean
) {
	return async () => {
		const { z } = await import('zod');
		const actual = await vi.importActual('@/lib/validation-schemas');
		return {
			...actual,
			[schemaName]: {
				parse: vi.fn((data: any) => {
					if (!validateFn(data)) {
						const error = new z.ZodError([
							{
								code: 'custom',
								path: [],
								message: 'Validation failed',
							},
						]);
						throw error;
					}
					return data;
				}),
			},
		};
	};
}

/**
 * Complete test setup for a route using withRLS
 */
export function setupRouteTest(options: {
	mockUserId?: string;
	serviceClass: any;
	serviceMethods: Record<string, ReturnType<typeof vi.fn>>;
	validationSchema?: {
		name: string;
		validate: (data: any) => boolean;
	};
}) {
	const mockUserId = options.mockUserId || 'user-123';
	const mockMethods = options.serviceMethods;

	// Create service class mock
	const ServiceMock = createServiceClassMock(mockMethods);
	vi.mock(options.serviceClass, () => ({
		[options.serviceClass.name || 'Service']: ServiceMock,
	}));

	// Mock withRLS
	vi.mock('@/lib/api/with-rls', () => createWithRLSMock(mockUserId));

	// Mock Clerk auth
	vi.mock('@clerk/nextjs/server', () => createClerkAuthMock(mockUserId));

	// Mock validation schema if provided
	if (options.validationSchema) {
		vi.mock('@/lib/validation-schemas', createValidationSchemaMock(
			options.validationSchema.name,
			options.validationSchema.validate
		));
	}

	return {
		mockUserId,
		mockMethods,
	};
}

