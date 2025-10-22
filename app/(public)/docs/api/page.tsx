import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
	ArrowLeft,
	ArrowRight,
	BookOpen,
	Code,
	Copy,
	ExternalLink,
	Key,
	Lock,
	Shield,
	Zap,
} from "lucide-react";

export const metadata = {
	title: "API Documentation - Financbase",
	description: "Complete API reference for Financbase financial management platform",
};

export default function APIDocsPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				{/* Header */}
				<div className="text-center mb-12">
					<div className="flex items-center justify-center gap-3 mb-4">
						<Code className="h-8 w-8 text-blue-600" />
						<h1 className="text-4xl font-bold text-gray-900">API Documentation</h1>
					</div>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto">
						Complete API reference for building financial applications with Financbase
					</p>
				</div>

				{/* Quick Start */}
				<Card className="mb-8">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Zap className="h-5 w-5 text-yellow-500" />
							Quick Start
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm">
							<div className="flex items-center justify-between mb-2">
								<span className="text-gray-400">curl</span>
								<Button size="sm" variant="ghost">
									<Copy className="h-4 w-4" />
								</Button>
							</div>
							<code>
								curl -X GET "https://api.financbase.com/v1/accounts" \<br />
								&nbsp;&nbsp;-H "Authorization: Bearer YOUR_API_KEY" \<br />
								&nbsp;&nbsp;-H "Content-Type: application/json"
							</code>
						</div>
					</CardContent>
				</Card>

				{/* API Sections */}
				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Key className="h-5 w-5 text-blue-500" />
								Authentication
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-gray-600 mb-4">
								Learn how to authenticate your requests and manage API keys.
							</p>
							<Link href="/docs/api/auth">
								<Button variant="outline" className="w-full">
									View Guide
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</Link>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<BookOpen className="h-5 w-5 text-green-500" />
								Endpoints
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-gray-600 mb-4">
								Complete reference for all available API endpoints.
							</p>
							<Link href="/docs/api/endpoints">
								<Button variant="outline" className="w-full">
									View Reference
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</Link>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Shield className="h-5 w-5 text-purple-500" />
								Security
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-gray-600 mb-4">
								Best practices for secure API integration.
							</p>
							<Link href="/docs/security">
								<Button variant="outline" className="w-full">
									View Guide
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</Link>
						</CardContent>
					</Card>
				</div>

				{/* Back to Docs */}
				<div className="mt-12 text-center">
					<Link href="/docs">
						<Button variant="outline">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Documentation
						</Button>
					</Link>
				</div>
			</main>
		</div>
	);
}
