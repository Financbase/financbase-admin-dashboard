import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	AlertTriangle,
	ArrowRight,
	CheckCircle,
	HelpCircle,
	MessageCircle,
	RefreshCw,
	Search,
	Settings,
	Shield,
	Wifi,
	Zap,
} from "lucide-react";
import Link from "next/link";

export default function HelpIssuesPage() {
	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<div className="border-b bg-gradient-to-br from-background via-background to-muted/20">
				<div className="container mx-auto px-4 py-16">
					<div className="max-w-4xl mx-auto">
						<div className="flex items-center gap-2 mb-4">
							<HelpCircle className="h-6 w-6 text-primary" />
							<Badge variant="secondary" className="text-sm font-medium">
								Troubleshooting
							</Badge>
						</div>
						<h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
							Common Issues &{" "}
							<span className="text-primary">Solutions</span>
						</h1>
						<p className="text-xl text-muted-foreground mb-8">
							Find solutions to frequently encountered problems and get back to managing your finances.
						</p>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-16">
				<div className="max-w-4xl mx-auto">
					{/* Common Issues */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">Common Issues</h2>
						<div className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Wifi className="h-5 w-5 text-red-600" />
										Connection Issues
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div>
											<h4 className="font-medium mb-2">Problem: Unable to connect to bank accounts</h4>
											<p className="text-muted-foreground mb-3">
												Bank connections failing or showing "connection error" messages.
											</p>
											<div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
												<h5 className="font-medium mb-2">Solutions:</h5>
												<ul className="text-sm space-y-1">
													<li>• Check your internet connection</li>
													<li>• Verify bank credentials are correct</li>
													<li>• Contact your bank if MFA is required</li>
													<li>• Wait 5-10 minutes and try again</li>
												</ul>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<RefreshCw className="h-5 w-5 text-orange-600" />
										Sync Problems
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div>
											<h4 className="font-medium mb-2">Problem: Transactions not updating</h4>
											<p className="text-muted-foreground mb-3">
												New transactions not appearing or sync stuck in progress.
											</p>
											<div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
												<h5 className="font-medium mb-2">Solutions:</h5>
												<ul className="text-sm space-y-1">
													<li>• Check connection status in dashboard</li>
													<li>• Manually trigger sync from account settings</li>
													<li>• Verify bank hasn't changed their API</li>
													<li>• Contact support if issue persists</li>
												</ul>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Settings className="h-5 w-5 text-purple-600" />
										Configuration Issues
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div>
											<h4 className="font-medium mb-2">Problem: Dashboard not loading properly</h4>
											<p className="text-muted-foreground mb-3">
												Blank screen, loading errors, or missing data in dashboard.
											</p>
											<div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
												<h5 className="font-medium mb-2">Solutions:</h5>
												<ul className="text-sm space-y-1">
													<li>• Clear browser cache and cookies</li>
													<li>• Try incognito/private browsing mode</li>
													<li>• Check browser console for errors</li>
													<li>• Ensure JavaScript is enabled</li>
												</ul>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Shield className="h-5 w-5 text-green-600" />
										Security Concerns
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div>
											<h4 className="font-medium mb-2">Problem: Suspicious activity or unauthorized access</h4>
											<p className="text-muted-foreground mb-3">
												Unusual login attempts or unexpected account changes.
											</p>
											<div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
												<h5 className="font-medium mb-2">Immediate Actions:</h5>
												<ul className="text-sm space-y-1">
													<li>• Change your password immediately</li>
													<li>• Enable two-factor authentication</li>
													<li>• Review recent login activity</li>
													<li>• Contact support for account lockout</li>
												</ul>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</section>

					{/* Self-Service Tools */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">Self-Service Tools</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<Card className="group hover:shadow-md transition-all duration-200">
								<CardContent className="p-6 text-center">
									<div className="w-12 h-12 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto mb-4">
										<Search className="h-6 w-6" />
									</div>
									<h3 className="font-semibold mb-2">Search Documentation</h3>
									<p className="text-sm text-muted-foreground mb-4">
										Find answers in our comprehensive documentation.
									</p>
									<Button variant="outline" size="sm" asChild>
										<Link href="/docs">
											Search Docs
											<ArrowRight className="h-4 w-4 ml-2" />
										</Link>
									</Button>
								</CardContent>
							</Card>

							<Card className="group hover:shadow-md transition-all duration-200">
								<CardContent className="p-6 text-center">
									<div className="w-12 h-12 rounded-lg bg-green-500/10 text-green-600 flex items-center justify-center mx-auto mb-4">
										<RefreshCw className="h-6 w-6" />
									</div>
									<h3 className="font-semibold mb-2">Connection Reset</h3>
									<p className="text-sm text-muted-foreground mb-4">
										Reconnect your bank accounts if sync fails.
									</p>
									<Button variant="outline" size="sm" asChild>
										<Link href="/dashboard/accounts">
											Manage Accounts
											<ArrowRight className="h-4 w-4 ml-2" />
										</Link>
									</Button>
								</CardContent>
							</Card>

							<Card className="group hover:shadow-md transition-all duration-200">
								<CardContent className="p-6 text-center">
									<div className="w-12 h-12 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center mx-auto mb-4">
										<MessageCircle className="h-6 w-6" />
									</div>
									<h3 className="font-semibold mb-2">Contact Support</h3>
									<p className="text-sm text-muted-foreground mb-4">
										Get help from our support team.
									</p>
									<Button variant="outline" size="sm" asChild>
										<Link href="/support">
											Get Support
											<ArrowRight className="h-4 w-4 ml-2" />
										</Link>
									</Button>
								</CardContent>
							</Card>
						</div>
					</section>

					{/* Still Need Help */}
					<section className="mb-16">
						<Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
							<CardContent className="p-8 text-center">
								<h3 className="text-2xl font-semibold mb-4">Still Need Help?</h3>
								<p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
									If you can't find a solution to your issue, our support team is here to help.
								</p>
								<Button asChild>
									<Link href="/support">
										<MessageCircle className="h-4 w-4 mr-2" />
										Contact Support
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
