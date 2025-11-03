/**
 * API Documentation Page
 * Interactive Swagger UI for API documentation
 */

'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
	ssr: false,
	loading: () => (
		<div className="flex items-center justify-center min-h-screen">
			<Loader2 className="h-8 w-8 animate-spin" />
		</div>
	),
});

import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocsPage() {
	const [spec, setSpec] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function loadSpec() {
			try {
				const response = await fetch('/api/docs');
				if (!response.ok) {
					throw new Error('Failed to load API documentation');
				}
				const data = await response.json();
				setSpec(data);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to load documentation');
			} finally {
				setLoading(false);
			}
		}

		loadSpec();
	}, []);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto py-8">
				<div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
					Error: {error}
				</div>
			</div>
		);
	}

	if (!spec) {
		return null;
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto py-6">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">API Documentation</h1>
					<p className="text-muted-foreground mt-2">
						Interactive API documentation for all endpoints
					</p>
				</div>
				<div className="border rounded-lg overflow-hidden">
					<SwaggerUI spec={spec} />
				</div>
			</div>
		</div>
	);
}

