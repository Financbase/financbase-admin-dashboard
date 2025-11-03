/**
 * OpenAPI Documentation Endpoint
 * Returns the OpenAPI 3.0 specification as JSON
 */

import { NextResponse } from 'next/server';
import swaggerJsdoc from 'swagger-jsdoc';
import { swaggerOptions } from '@/lib/openapi/config';

export async function GET() {
	try {
		const swaggerSpec = swaggerJsdoc(swaggerOptions);
		
		return NextResponse.json(swaggerSpec, {
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
			},
		});
	} catch (error) {
		console.error('Error generating OpenAPI spec:', error);
		return NextResponse.json(
			{
				error: 'Failed to generate API documentation',
				message: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}

