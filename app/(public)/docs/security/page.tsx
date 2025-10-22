import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, Key, Eye } from "lucide-react";

export const metadata = {
	title: "Security & Compliance - Financbase",
	description: "Data protection and compliance guidelines for Financbase",
};

export default function SecurityPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
			<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="text-center mb-12">
					<div className="flex items-center justify-center gap-3 mb-4">
						<Shield className="h-8 w-8 text-blue-600" />
						<h1 className="text-4xl font-bold text-gray-900">Security & Compliance</h1>
					</div>
					<p className="text-xl text-gray-600">
						Data protection and compliance guidelines for Financbase
					</p>
				</div>

				<div className="grid gap-6 md:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Lock className="h-5 w-5 text-red-500" />
								Data Protection
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-gray-600 mb-4">
								Learn how we protect your financial data.
							</p>
							<Button variant="outline" className="w-full">
								View Guide
							</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Key className="h-5 w-5 text-blue-500" />
								Authentication
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-gray-600 mb-4">
								Secure authentication and access control.
							</p>
							<Button variant="outline" className="w-full">
								View Guide
							</Button>
						</CardContent>
					</Card>
				</div>

				<div className="text-center mt-12">
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
