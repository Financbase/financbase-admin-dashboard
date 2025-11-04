/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Key, Lock, Shield } from "lucide-react";

export const metadata = {
	title: "API Authentication - Financbase",
	description: "Learn how to authenticate your requests with Financbase API",
};

export default function APIAuthPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
			<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="text-center mb-12">
					<div className="flex items-center justify-center gap-3 mb-4">
						<Key className="h-8 w-8 text-blue-600" />
						<h1 className="text-4xl font-bold text-gray-900">API Authentication</h1>
					</div>
					<p className="text-xl text-gray-600">
						Learn how to authenticate your requests with Financbase API
					</p>
				</div>

				<Card className="mb-8">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Shield className="h-5 w-5 text-green-500" />
							API Keys
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-gray-600 mb-4">
							All API requests require authentication using your API key. Include it in the Authorization header:
						</p>
						<div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm">
							<code>Authorization: Bearer YOUR_API_KEY</code>
						</div>
					</CardContent>
				</Card>

				<div className="text-center">
					<Link href="/docs/api">
						<Button variant="outline">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to API Documentation
						</Button>
					</Link>
				</div>
			</main>
		</div>
	);
}
