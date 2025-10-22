import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	ArrowRight,
	Database,
	Key,
	Settings,
	Shield,
	User,
	Zap,
} from "lucide-react";
import Link from "next/link";

export default function FirstStepsPage() {
	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<div className="border-b bg-muted/50">
				<div className="container mx-auto px-4 py-16">
					<div className="max-w-4xl mx-auto">
						<div className="flex items-center gap-2 mb-4">
							<Zap className="h-6 w-6 text-primary" />
							<Badge variant="secondary" className="text-sm font-medium">
								First Steps
							</Badge>
						</div>
						<h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
							Your First Steps with{" "}
							<span className="text-primary">Financbase</span>
						</h1>
						<p className="text-xl text-muted-foreground mb-8">
							Complete these essential setup tasks to get your financial management platform up and running.
						</p>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-16">
				<div className="max-w-4xl mx-auto">
					{/* Setup Checklist */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">Setup Checklist</h2>
						<div className="space-y-6">
							<Card>
								<CardContent className="p-6">
									<div className="flex items-start gap-4">
										<div className="p-2 rounded-lg bg-green-500/10 text-green-600">
											<CheckCircle className="h-5 w-5" />
										</div>
										<div className="flex-1">
											<h3 className="font-semibold mb-2">1. Create Your Account</h3>
											<p className="text-muted-foreground mb-4">
												Set up your administrator account to access the Financbase dashboard.
											</p>
											<Button variant="outline" asChild>
												<Link href="/dashboard">
													Go to Dashboard
													<ArrowRight className="h-4 w-4 ml-2" />
												</Link>
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className="p-6">
									<div className="flex items-start gap-4">
										<div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
											<User className="h-5 w-5" />
										</div>
										<div className="flex-1">
											<h3 className="font-semibold mb-2">2. Configure Your Profile</h3>
											<p className="text-muted-foreground mb-4">
												Add your personal information and company details to personalize your experience.
											</p>
											<Button variant="outline" asChild>
												<Link href="/docs/account-setup">
													Setup Account
													<ArrowRight className="h-4 w-4 ml-2" />
												</Link>
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className="p-6">
									<div className="flex items-start gap-4">
										<div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
											<Database className="h-5 w-5" />
										</div>
										<div className="flex-1">
											<h3 className="font-semibold mb-2">3. Connect Your Database</h3>
											<p className="text-muted-foreground mb-4">
												Link your existing database or set up a new one to store your financial data.
											</p>
											<Button variant="outline" asChild>
												<Link href="/docs/dashboard">
													Configure Database
													<ArrowRight className="h-4 w-4 ml-2" />
												</Link>
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className="p-6">
									<div className="flex items-start gap-4">
										<div className="p-2 rounded-lg bg-orange-500/10 text-orange-600">
											<Key className="h-5 w-5" />
										</div>
										<div className="flex-1">
											<h3 className="font-semibold mb-2">4. Set Up API Keys</h3>
											<p className="text-muted-foreground mb-4">
												Generate API keys for integrating Financbase with your applications.
											</p>
											<Button variant="outline" asChild>
												<Link href="/docs/api/auth">
													Generate API Keys
													<ArrowRight className="h-4 w-4 ml-2" />
												</Link>
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className="p-6">
									<div className="flex items-start gap-4">
										<div className="p-2 rounded-lg bg-green-500/10 text-green-600">
											<Shield className="h-5 w-5" />
										</div>
										<div className="flex-1">
											<h3 className="font-semibold mb-2">5. Configure Security</h3>
											<p className="text-muted-foreground mb-4">
												Set up security policies and access controls for your organization.
											</p>
											<Button variant="outline" asChild>
												<Link href="/docs/help/security">
													Security Setup
													<ArrowRight className="h-4 w-4 ml-2" />
												</Link>
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</section>

					{/* Next Steps */}
					<section className="mb-16">
						<Card className="bg-primary/5 border-primary/20">
							<CardContent className="p-8 text-center">
								<h3 className="text-2xl font-semibold mb-4">Ready to Explore?</h3>
								<p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
									Once you've completed these first steps, you'll be ready to start using all of Financbase's powerful features.
								</p>
								<div className="flex flex-col sm:flex-row gap-4 justify-center">
									<Button asChild>
										<Link href="/dashboard">
											<Settings className="h-4 w-4 mr-2" />
											Go to Dashboard
										</Link>
									</Button>
									<Button variant="outline" asChild>
										<Link href="/docs">
											Back to Documentation
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
