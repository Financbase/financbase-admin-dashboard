import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Smartphone, Code, Download, BookOpen } from "lucide-react";

export const metadata = {
	title: "Mobile SDK - Financbase",
	description: "iOS and Android development with Financbase Mobile SDK",
};

export default function MobileSDKPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
			<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="text-center mb-12">
					<div className="flex items-center justify-center gap-3 mb-4">
						<Smartphone className="h-8 w-8 text-blue-600" />
						<h1 className="text-4xl font-bold text-gray-900">Mobile SDK</h1>
					</div>
					<p className="text-xl text-gray-600">
						iOS and Android development with Financbase Mobile SDK
					</p>
				</div>

				<div className="grid gap-6 md:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Download className="h-5 w-5 text-blue-500" />
								Installation
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-gray-600 mb-4">
								Get started with our mobile SDKs for iOS and Android.
							</p>
							<Button variant="outline" className="w-full">
								View Guide
							</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Code className="h-5 w-5 text-green-500" />
								Quick Start
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-gray-600 mb-4">
								Learn how to integrate Financbase into your mobile app.
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
