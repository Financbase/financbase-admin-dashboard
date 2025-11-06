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
import {
	ArrowRight,
	Clock,
	Headphones,
	Mail,
	MessageCircle,
	Phone,
	Search,
	Zap,
} from "lucide-react";
import Link from "next/link";

export default function HelpSupportPage() {
	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<div className="border-b bg-gradient-to-br from-background via-background to-muted/20">
				<div className="container mx-auto px-4 py-16">
					<div className="max-w-4xl mx-auto">
						<div className="flex items-center gap-2 mb-4">
							<Headphones className="h-6 w-6 text-primary" />
							<Badge variant="secondary" className="text-sm font-medium">
								Support Center
							</Badge>
						</div>
						<h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
							Get Help &{" "}
							<span className="text-primary">Support</span>
						</h1>
						<p className="text-xl text-muted-foreground mb-8">
							We're here to help you succeed with Financbase. Get the support you need, when you need it.
						</p>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-16">
				<div className="max-w-4xl mx-auto">
					{/* Support Options */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">Support Options</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Card className="group hover:shadow-md transition-all duration-200">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<MessageCircle className="h-5 w-5 text-blue-600" />
										Live Chat Support
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground mb-4">
										Get instant help from our support team through live chat.
									</p>
									<div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
										<Clock className="h-4 w-4" />
										<span>Available 24/7</span>
									</div>
									<Button className="w-full" asChild>
										<Link href="/support">
											Contact Support
											<ArrowRight className="h-4 w-4 ml-2" />
										</Link>
									</Button>
								</CardContent>
							</Card>

							<Card className="group hover:shadow-md transition-all duration-200">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Mail className="h-5 w-5 text-green-600" />
										Email Support
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground mb-4">
										Send us a detailed message and we'll respond within 24 hours.
									</p>
									<div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
										<Clock className="h-4 w-4" />
										<span>Response within 24 hours</span>
									</div>
									<Button variant="outline" className="w-full" asChild>
										<Link href="mailto:support@financbase.com">
											Send Email
											<ArrowRight className="h-4 w-4 ml-2" />
										</Link>
									</Button>
								</CardContent>
							</Card>

							<Card className="group hover:shadow-md transition-all duration-200">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Phone className="h-5 w-5 text-purple-600" />
										Phone Support
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground mb-4">
										Speak directly with our support specialists for urgent issues.
									</p>
									<div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
										<Clock className="h-4 w-4" />
										<span>Mon-Fri, 9 AM - 6 PM PST</span>
									</div>
									<Button variant="outline" className="w-full" asChild>
										<Link href="tel:+1-555-FINANCE">
											Call Now
											<ArrowRight className="h-4 w-4 ml-2" />
										</Link>
									</Button>
								</CardContent>
							</Card>

							<Card className="group hover:shadow-md transition-all duration-200">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Search className="h-5 w-5 text-orange-600" />
										Self-Service Help
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground mb-4">
										Find answers in our comprehensive documentation and guides.
									</p>
									<div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
										<Zap className="h-4 w-4" />
										<span>Instant access to all guides</span>
									</div>
									<Button variant="outline" className="w-full" asChild>
										<Link href="/docs">
											Browse Documentation
											<ArrowRight className="h-4 w-4 ml-2" />
										</Link>
									</Button>
								</CardContent>
							</Card>
						</div>
					</section>

					{/* Response Times */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">Response Times</h2>
						<Card>
							<CardContent className="p-8">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
									<div className="text-center">
										<div className="w-12 h-12 rounded-lg bg-green-500/10 text-green-600 flex items-center justify-center mx-auto mb-4">
											<MessageCircle className="h-6 w-6" />
										</div>
										<h3 className="font-semibold mb-2">Live Chat</h3>
										<p className="text-sm text-muted-foreground mb-2">
											Instant response during business hours
										</p>
										<p className="text-lg font-bold text-green-600">&lt; 2 minutes</p>
									</div>

									<div className="text-center">
										<div className="w-12 h-12 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto mb-4">
											<Mail className="h-6 w-6" />
										</div>
										<h3 className="font-semibold mb-2">Email</h3>
										<p className="text-sm text-muted-foreground mb-2">
											Detailed responses to complex issues
										</p>
										<p className="text-lg font-bold text-blue-600">&lt; 24 hours</p>
									</div>

									<div className="text-center">
										<div className="w-12 h-12 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center mx-auto mb-4">
											<Phone className="h-6 w-6" />
										</div>
										<h3 className="font-semibold mb-2">Phone</h3>
										<p className="text-sm text-muted-foreground mb-2">
											Urgent issues requiring immediate attention
										</p>
										<p className="text-lg font-bold text-purple-600">&lt; 5 minutes</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</section>

					{/* Support Resources */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">Support Resources</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Card>
								<CardHeader>
									<CardTitle>Documentation</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground mb-4">
										Comprehensive guides covering all Financbase features and functionality.
									</p>
									<Button variant="outline" asChild>
										<Link href="/docs">
											View Documentation
											<ArrowRight className="h-4 w-4 ml-2" />
										</Link>
									</Button>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Video Tutorials</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground mb-4">
										Step-by-step video guides to help you master Financbase features.
									</p>
									<Button variant="outline" asChild>
										<Link href="/docs">
											Watch Tutorials
											<ArrowRight className="h-4 w-4 ml-2" />
										</Link>
									</Button>
								</CardContent>
							</Card>
						</div>
					</section>

					{/* Contact Information */}
					<section className="mb-16">
						<Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
							<CardContent className="p-8 text-center">
								<h3 className="text-2xl font-semibold mb-4">Need Immediate Help?</h3>
								<p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
									Our support team is standing by to assist you with any questions or issues.
								</p>
								<div className="flex flex-col sm:flex-row gap-4 justify-center">
									<Button asChild>
										<Link href="/support">
											<MessageCircle className="h-4 w-4 mr-2" />
											Contact Support
										</Link>
									</Button>
									<Button variant="outline" asChild>
										<Link href="mailto:support@financbase.com">
											<Mail className="h-4 w-4 mr-2" />
											Send Email
										</Link>
									</Button>
								</div>
							</CardContent>
						</Card>
					</section>
				</div>
			</div>
		</div>
	);
}
