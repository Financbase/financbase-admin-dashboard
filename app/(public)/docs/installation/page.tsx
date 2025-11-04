/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	ArrowRight,
	CheckCircle,
	Database,
	Package,
	Server,
	Terminal,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useId } from "react";

export default function InstallationPage() {
	const quickStartId = useId();
	const requirementsId = useId();
	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<div className="border-b bg-muted/50">
				<div className="container mx-auto px-4 py-16">
					<div className="max-w-4xl mx-auto">
						<div className="flex items-center gap-2 mb-4">
							<Package className="h-6 w-6 text-primary" />
							<Badge variant="secondary" className="text-sm font-medium">
								Installation Guide
							</Badge>
						</div>
						<h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
							Get Started with{" "}
							<span className="text-primary">Financbase</span>
						</h1>
						<p className="text-xl text-muted-foreground mb-8">
							Set up your financial management platform in minutes with our comprehensive installation guide.
						</p>
						<div className="flex flex-wrap gap-4">
							<Button size="lg" asChild>
								<Link href={`#${quickStartId}`}>
									<Zap className="h-4 w-4 mr-2" />
									Quick Start
								</Link>
							</Button>
							<Button variant="outline" size="lg" asChild>
								<Link href={`#${requirementsId}`}>
									<CheckCircle className="h-4 w-4 mr-2" />
									System Requirements
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-16">
				<div className="max-w-4xl mx-auto">
					{/* Quick Start */}
					<section id={quickStartId} className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">Quick Start</h2>
						<Card className="hover:shadow-lg transition-all duration-300 bg-card border">
							<CardContent className="p-8">
								<div className="space-y-6">
									<div className="flex items-start gap-4">
										<div className="p-2 rounded-lg bg-primary/10 text-primary">
											<Terminal className="h-5 w-5" />
										</div>
										<div className="flex-1">
											<h3 className="font-semibold mb-2">1. Install Dependencies</h3>
											<div className="bg-muted p-4 rounded-lg font-mono text-sm mb-4">
												npm install financbase
											</div>
											<p className="text-muted-foreground">
												Install the Financbase package using your preferred package manager.
											</p>
										</div>
									</div>

									<div className="flex items-start gap-4">
										<div className="p-2 rounded-lg bg-primary/10 text-primary">
											<Database className="h-5 w-5" />
										</div>
										<div className="flex-1">
											<h3 className="font-semibold mb-2">2. Set Up Database</h3>
											<div className="bg-muted p-4 rounded-lg font-mono text-sm mb-4">
												npx financbase init --database
											</div>
											<p className="text-muted-foreground">
												Initialize your database with the required schema and tables.
											</p>
										</div>
									</div>

									<div className="flex items-start gap-4">
										<div className="p-2 rounded-lg bg-primary/10 text-primary">
											<Server className="h-5 w-5" />
										</div>
										<div className="flex-1">
											<h3 className="font-semibold mb-2">3. Start Development Server</h3>
											<div className="bg-muted p-4 rounded-lg font-mono text-sm mb-4">
												npm run dev
											</div>
											<p className="text-muted-foreground">
												Start the development server and access your application.
											</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</section>

					{/* Installation Methods */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">Installation Methods</h2>
						<Tabs defaultValue="npm" className="w-full">
							<TabsList className="grid w-full grid-cols-3">
								<TabsTrigger value="npm">npm</TabsTrigger>
								<TabsTrigger value="yarn">Yarn</TabsTrigger>
								<TabsTrigger value="pnpm">pnpm</TabsTrigger>
							</TabsList>

							<TabsContent value="npm" className="space-y-4">
								<Card>
									<CardContent className="p-6">
										<h3 className="font-semibold mb-4">Using npm</h3>
										<div className="bg-muted p-4 rounded-lg font-mono text-sm mb-4">
											npm install financbase
										</div>
										<p className="text-muted-foreground">
											Install Financbase using npm, the most popular Node.js package manager.
										</p>
									</CardContent>
								</Card>
							</TabsContent>

							<TabsContent value="yarn" className="space-y-4">
								<Card>
									<CardContent className="p-6">
										<h3 className="font-semibold mb-4">Using Yarn</h3>
										<div className="bg-muted p-4 rounded-lg font-mono text-sm mb-4">
											yarn add financbase
										</div>
										<p className="text-muted-foreground">
											Install Financbase using Yarn for faster, reliable dependency management.
										</p>
									</CardContent>
								</Card>
							</TabsContent>

							<TabsContent value="pnpm" className="space-y-4">
								<Card>
									<CardContent className="p-6">
										<h3 className="font-semibold mb-4">Using pnpm</h3>
										<div className="bg-muted p-4 rounded-lg font-mono text-sm mb-4">
											pnpm add financbase
										</div>
										<p className="text-muted-foreground">
											Install Financbase using pnpm for efficient disk space usage and faster installs.
										</p>
									</CardContent>
								</Card>
							</TabsContent>
						</Tabs>
					</section>

					{/* System Requirements */}
					<section id={requirementsId} className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">System Requirements</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Server className="h-5 w-5 text-primary" />
										Server Requirements
									</CardTitle>
								</CardHeader>
								<CardContent>
									<ul className="space-y-2 text-sm">
										<li className="flex items-center gap-2">
											<CheckCircle className="h-4 w-4 text-green-500" />
											Node.js 18.0 or higher
										</li>
										<li className="flex items-center gap-2">
											<CheckCircle className="h-4 w-4 text-green-500" />
											4GB RAM minimum
										</li>
										<li className="flex items-center gap-2">
											<CheckCircle className="h-4 w-4 text-green-500" />
											2GB free disk space
										</li>
										<li className="flex items-center gap-2">
											<CheckCircle className="h-4 w-4 text-green-500" />
											Modern web browser
										</li>
									</ul>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Database className="h-5 w-5 text-primary" />
										Database Requirements
									</CardTitle>
								</CardHeader>
								<CardContent>
									<ul className="space-y-2 text-sm">
										<li className="flex items-center gap-2">
											<CheckCircle className="h-4 w-4 text-green-500" />
											PostgreSQL 13+ or MySQL 8.0+
										</li>
										<li className="flex items-center gap-2">
											<CheckCircle className="h-4 w-4 text-green-500" />
											SSL/TLS encryption enabled
										</li>
										<li className="flex items-center gap-2">
											<CheckCircle className="h-4 w-4 text-green-500" />
											Connection pooling recommended
										</li>
									</ul>
								</CardContent>
							</Card>
						</div>
					</section>

					{/* Next Steps */}
					<section className="mb-16">
						<Card className="bg-primary/5 border-primary/20">
							<CardContent className="p-8 text-center">
								<h3 className="text-2xl font-semibold mb-4">Ready to Get Started?</h3>
								<p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
									Once you've completed the installation, follow our first steps guide to configure your Financbase instance.
								</p>
								<Button asChild>
									<Link href="/docs/first-steps">
										<ArrowRight className="h-4 w-4 mr-2" />
										Continue to First Steps
									</Link>
								</Button>
							</CardContent>
						</Card>
					</section>
				</div>
			</div>
		</div>
	);
}
