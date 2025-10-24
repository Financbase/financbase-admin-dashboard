import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
 ArrowRight,
 Code,
 Download,
 Github,
 Package as Npm,
 FileCode as Python,
 Repeat as React,
 Smartphone,
 Terminal,
} from "lucide-react";
import Link from "next/link";

export default function ApiSdksPage() {
	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<div className="border-b bg-gradient-to-br from-background via-background to-muted/20">
				<div className="container mx-auto px-4 py-16">
					<div className="max-w-4xl mx-auto">
						<div className="flex items-center gap-2 mb-4">
							<Code className="h-6 w-6 text-primary" />
							<Badge variant="secondary" className="text-sm font-medium">
								SDKs & Libraries
							</Badge>
						</div>
						<h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
							Client Libraries &{" "}
							<span className="text-primary">SDKs</span>
						</h1>
						<p className="text-xl text-muted-foreground mb-8">
							Accelerate your development with our official SDKs and community libraries.
						</p>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-16">
				<div className="max-w-6xl mx-auto">
					{/* Official SDKs */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">Official SDKs</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Card className="group hover:shadow-md transition-all duration-200">
								<CardHeader>
									<div className="flex items-center gap-3 mb-2">
										<div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
											<React className="h-5 w-5" />
										</div>
										<CardTitle className="text-lg">JavaScript/TypeScript</CardTitle>
									</div>
									<p className="text-sm text-muted-foreground">
										Official SDK for web applications and Node.js environments.
									</p>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										<div className="flex items-center gap-2">
											<Npm className="h-4 w-4 text-red-500" />
											<span className="text-sm font-mono">npm install @financbase/js</span>
										</div>
										<Button variant="outline" size="sm" className="w-full" asChild>
											<Link href="https://github.com/financbase/js-sdk">
												<Github className="h-4 w-4 mr-2" />
												View on GitHub
											</Link>
										</Button>
									</div>
								</CardContent>
							</Card>

							<Card className="group hover:shadow-md transition-all duration-200">
								<CardHeader>
									<div className="flex items-center gap-3 mb-2">
										<div className="p-2 rounded-lg bg-green-500/10 text-green-600">
											<Python className="h-5 w-5" />
										</div>
										<CardTitle className="text-lg">Python</CardTitle>
									</div>
									<p className="text-sm text-muted-foreground">
										Official Python SDK for data analysis and automation.
									</p>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										<div className="flex items-center gap-2">
											<Terminal className="h-4 w-4 text-orange-500" />
											<span className="text-sm font-mono">pip install financbase</span>
										</div>
										<Button variant="outline" size="sm" className="w-full" asChild>
											<Link href="https://github.com/financbase/python-sdk">
												<Github className="h-4 w-4 mr-2" />
												View on GitHub
											</Link>
										</Button>
									</div>
								</CardContent>
							</Card>

							<Card className="group hover:shadow-md transition-all duration-200">
								<CardHeader>
									<div className="flex items-center gap-3 mb-2">
										<div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
											<Smartphone className="h-5 w-5" />
										</div>
										<CardTitle className="text-lg">Mobile (iOS/Android)</CardTitle>
									</div>
									<p className="text-sm text-muted-foreground">
										Native mobile SDKs for iOS and Android applications.
									</p>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										<div className="flex items-center gap-2">
											<Download className="h-4 w-4 text-blue-500" />
											<span className="text-sm">Available via CocoaPods & Maven</span>
										</div>
										<Button variant="outline" size="sm" className="w-full" asChild>
											<Link href="/docs/mobile">
												<ArrowRight className="h-4 w-4 mr-2" />
												Mobile Documentation
											</Link>
										</Button>
									</div>
								</CardContent>
							</Card>

							<Card className="group hover:shadow-md transition-all duration-200">
								<CardHeader>
									<div className="flex items-center gap-3 mb-2">
										<div className="p-2 rounded-lg bg-orange-500/10 text-orange-600">
											<Code className="h-5 w-5" />
										</div>
										<CardTitle className="text-lg">REST API</CardTitle>
									</div>
									<p className="text-sm text-muted-foreground">
										Direct HTTP API access for any programming language.
									</p>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										<div className="bg-muted p-3 rounded-lg">
											<p className="text-sm font-mono">https://api.financbase.com/v1/</p>
										</div>
										<Button variant="outline" size="sm" className="w-full" asChild>
											<Link href="/docs/api/endpoints">
												<ArrowRight className="h-4 w-4 mr-2" />
												API Reference
											</Link>
										</Button>
									</div>
								</CardContent>
							</Card>
						</div>
					</section>

					{/* Quick Start */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">Quick Start Examples</h2>
						<Tabs defaultValue="javascript" className="w-full">
							<TabsList className="grid w-full grid-cols-3">
								<TabsTrigger value="javascript">JavaScript</TabsTrigger>
								<TabsTrigger value="python">Python</TabsTrigger>
								<TabsTrigger value="curl">cURL</TabsTrigger>
							</TabsList>

							<TabsContent value="javascript" className="space-y-4">
								<Card>
									<CardContent className="p-6">
										<h3 className="font-semibold mb-4">JavaScript/TypeScript Example</h3>
										<div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
											<div className="text-blue-400">import</div> {"{ Financbase }"} <div className="text-blue-400">from</div> <div className="text-green-400">'@financbase/js'</div>
											<br /><br />
											<div className="text-blue-400">const</div> client = <div className="text-blue-400">new</div> Financbase({"{ apiKey: 'your_key' }"});
											<br /><br />
											<div className="text-blue-400">const</div> transactions = <div className="text-blue-400">await</div> client.transactions.list();
										</div>
									</CardContent>
								</Card>
							</TabsContent>

							<TabsContent value="python" className="space-y-4">
								<Card>
									<CardContent className="p-6">
										<h3 className="font-semibold mb-4">Python Example</h3>
										<div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
											<div className="text-blue-400">from</div> financbase <div className="text-blue-400">import</div> Client
											<br /><br />
											client = Client(api_key=<div className="text-green-400">"your_key"</div>)
											<br /><br />
											transactions = client.transactions.list()
										</div>
									</CardContent>
								</Card>
							</TabsContent>

							<TabsContent value="curl" className="space-y-4">
								<Card>
									<CardContent className="p-6">
										<h3 className="font-semibold mb-4">cURL Example</h3>
										<div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
											curl -H <div className="text-green-400">"Authorization: Bearer your_api_key"</div> \<br />
											&nbsp;&nbsp;&nbsp;&nbsp;-H <div className="text-green-400">"Content-Type: application/json"</div> \<br />
											&nbsp;&nbsp;&nbsp;&nbsp;https://api.financbase.com/v1/transactions
										</div>
									</CardContent>
								</Card>
							</TabsContent>
						</Tabs>
					</section>

					{/* Next Steps */}
					<section className="mb-16">
						<Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
							<CardContent className="p-8 text-center">
								<h3 className="text-2xl font-semibold mb-4">Ready to Start Building?</h3>
								<p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
									Choose your preferred SDK and start integrating Financbase into your application.
								</p>
								<Button asChild>
									<Link href="/docs/api/endpoints">
										<Code className="h-4 w-4 mr-2" />
										View API Endpoints
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
