/**
 * OpenAPI 3.0 Configuration
 * Base configuration for API documentation
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


export const swaggerDefinition = {
	openapi: '3.0.0',
	info: {
		title: 'Financbase Admin Dashboard API',
		version: '2.0.0',
		description: 'A comprehensive financial management platform with advanced automation, integrations, and analytics capabilities.',
		contact: {
			name: 'API Support',
			email: 'support@financbase.com',
		},
		license: {
			name: 'Proprietary',
			url: 'https://financbase.com/legal',
		},
	},
	servers: [
		{
			url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
			description: 'Development server',
		},
		{
			url: 'https://api.financbase.com',
			description: 'Production server',
		},
	],
	components: {
		securitySchemes: {
			BearerAuth: {
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
				description: 'Clerk authentication token',
			},
		},
		schemas: {
			Error: {
				type: 'object',
				properties: {
					error: {
						type: 'object',
						properties: {
							code: {
								type: 'string',
								description: 'Error code',
								example: 'VALIDATION_ERROR',
							},
							message: {
								type: 'string',
								description: 'Error message',
								example: 'Invalid request data',
							},
							details: {
								type: 'object',
								description: 'Additional error details',
							},
							timestamp: {
								type: 'string',
								format: 'date-time',
								description: 'Error timestamp',
							},
							requestId: {
								type: 'string',
								description: 'Request ID for tracking',
								example: 'req_1234567890_abc123',
							},
						},
						required: ['code', 'message', 'timestamp'],
					},
				},
				required: ['error'],
			},
			ValidationError: {
				allOf: [
					{ $ref: '#/components/schemas/Error' },
					{
						type: 'object',
						properties: {
							error: {
								type: 'object',
								properties: {
									code: {
										type: 'string',
										example: 'VALIDATION_ERROR',
									},
									details: {
										type: 'array',
										items: {
											type: 'object',
											properties: {
												path: { type: 'array', items: { type: 'string' } },
												message: { type: 'string' },
											},
										},
									},
								},
							},
						},
					},
				],
			},
		},
		responses: {
			Unauthorized: {
				description: 'Authentication required',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/Error',
						},
						example: {
							error: {
								code: 'UNAUTHORIZED',
								message: 'Unauthorized access',
								timestamp: '2025-01-28T12:00:00Z',
							},
						},
					},
				},
			},
			Forbidden: {
				description: 'Insufficient permissions',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/Error',
						},
					},
				},
			},
			NotFound: {
				description: 'Resource not found',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/Error',
						},
					},
				},
			},
			ValidationError: {
				description: 'Validation error',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/ValidationError',
						},
					},
				},
			},
			InternalServerError: {
				description: 'Internal server error',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/Error',
						},
					},
				},
			},
		},
	},
	security: [
		{
			BearerAuth: [],
		},
	],
	tags: [
		{ name: 'Invoices', description: 'Invoice management endpoints' },
		{ name: 'Expenses', description: 'Expense tracking endpoints' },
		{ name: 'Clients', description: 'Client management endpoints' },
		{ name: 'Transactions', description: 'Transaction management endpoints' },
		{ name: 'Leads', description: 'Lead management endpoints' },
		{ name: 'Projects', description: 'Project management endpoints' },
		{ name: 'Workflows', description: 'Workflow automation endpoints' },
		{ name: 'Webhooks', description: 'Webhook management endpoints' },
		{ name: 'Integrations', description: 'Integration management endpoints' },
		{ name: 'Analytics', description: 'Analytics and reporting endpoints' },
		{ name: 'Dashboard', description: 'Dashboard data endpoints' },
		{ name: 'Search', description: 'Search endpoints' },
		{ name: 'Feature Flags', description: 'Feature flag management endpoints' },
		{ name: 'Admin', description: 'Admin-only endpoints' },
	],
};

export const swaggerOptions = {
	definition: swaggerDefinition,
	apis: ['./app/api/**/*.ts'], // Path to the API files
};

