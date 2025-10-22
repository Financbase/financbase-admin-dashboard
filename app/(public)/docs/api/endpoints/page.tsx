import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	ArrowRight,
	Code,
	Database,
	DollarSign,
	Settings,
	Users,
	Wallet,
	BarChart3,
	TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default function ApiEndpointsPage() {
	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<div className="border-b bg-gradient-to-br from-background via-background to-muted/20">
				<div className="container mx-auto px-4 py-16">
					<div className="max-w-4xl mx-auto">
						<div className="flex items-center gap-2 mb-4">
							<Code className="h-6 w-6 text-primary" />
							<Badge variant="secondary" className="text-sm font-medium">
								API Endpoints
							</Badge>
						</div>
						<h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
							Complete API{" "}
							<span className="text-primary">Reference</span>
						</h1>
						<p className="text-xl text-muted-foreground mb-8">
							Explore all available API endpoints and their specifications.
						</p>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-16">
				<div className="max-w-6xl mx-auto">
					{/* API Categories */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">API Categories</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							<Card className="group hover:shadow-md transition-all duration-200">
								<CardHeader>
									<div className="flex items-center gap-3 mb-2">
										<div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
											<Wallet className="h-5 w-5" />
										</div>
										<CardTitle className="text-lg">Accounts</CardTitle>
									</div>
									<p className="text-sm text-muted-foreground">
										Manage bank accounts and financial connections.
									</p>
								</CardHeader>
								<CardContent>
									<Button variant="outline" size="sm" className="w-full" asChild>
										<Link href="#accounts">
											View Endpoints
											<ArrowRight className="h-4 w-4 ml-2" />
										</Link>
									</Button>
								</CardContent>
							</Card>

							<Card className="group hover:shadow-md transition-all duration-200">
								<CardHeader>
									<div className="flex items-center gap-3 mb-2">
										<div className="p-2 rounded-lg bg-green-500/10 text-green-600">
											<DollarSign className="h-5 w-5" />
										</div>
										<CardTitle className="text-lg">Transactions</CardTitle>
									</div>
									<p className="text-sm text-muted-foreground">
										Handle financial transactions and payments.
									</p>
								</CardHeader>
								<CardContent>
									<Button variant="outline" size="sm" className="w-full" asChild>
										<Link href="#transactions">
											View Endpoints
											<ArrowRight className="h-4 w-4 ml-2" />
										</Link>
									</Button>
								</CardContent>
							</Card>

							<Card className="group hover:shadow-md transition-all duration-200">
								<CardHeader>
									<div className="flex items-center gap-3 mb-2">
										<div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
											<BarChart3 className="h-5 w-5" />
										</div>
										<CardTitle className="text-lg">Analytics</CardTitle>
									</div>
									<p className="text-sm text-muted-foreground">
										Access financial analytics and insights.
									</p>
								</CardHeader>
								<CardContent>
									<Button variant="outline" size="sm" className="w-full" asChild>
										<Link href="#analytics">
											View Endpoints
											<ArrowRight className="h-4 w-4 ml-2" />
										</Link>
									</Button>
								</CardContent>
							</Card>
						</div>
					</section>

					{/* Account Endpoints */}
					<section id="accounts" className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">Account Endpoints</h2>
						<Card>
							<CardContent className="p-8">
								<div className="space-y-6">
									<div className="border-l-4 border-blue-500 pl-4">
										<h3 className="font-semibold mb-2">GET /api/v1/accounts</h3>
										<p className="text-muted-foreground mb-4">
											Retrieve all connected accounts for the authenticated user.
										</p>
										<div className="bg-muted p-4 rounded-lg font-mono text-sm">
											Response: Array of account objects
										</div>
									</div>

									<div className="border-l-4 border-green-500 pl-4">
										<h3 className="font-semibold mb-2">POST /api/v1/accounts</h3>
										<p className="text-muted-foreground mb-4">
											Create a new account connection.
										</p>
										<div className="bg-muted p-4 rounded-lg font-mono text-sm">
											Body: {"{ institution_id, credentials }"}
										</div>
									</div>

									<div className="border-l-4 border-red-500 pl-4">
										<h3 className="font-semibold mb-2">DELETE /api/v1/accounts/{`{id}`}</h3>
										<p className="text-muted-foreground mb-4">
											Remove an account connection.
										</p>
										<div className="bg-muted p-4 rounded-lg font-mono text-sm">
											Path Parameter: account_id
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</section>

					{/* Transaction Endpoints */}
					<section id="transactions" className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">Transaction Endpoints</h2>
						<Card>
							<CardContent className="p-8">
								<div className="space-y-6">
									<div className="border-l-4 border-blue-500 pl-4">
										<h3 className="font-semibold mb-2">GET /api/v1/transactions</h3>
										<p className="text-muted-foreground mb-4">
											Get all transactions with optional filtering.
										</p>
										<div className="bg-muted p-4 rounded-lg font-mono text-sm">
											Query Parameters: account_id, start_date, end_date, limit
										</div>
									</div>

									<div className="border-l-4 border-green-500 pl-4">
										<h3 className="font-semibold mb-2">GET /api/v1/transactions/{`{id}`}</h3>
										<p className="text-muted-foreground mb-4">
											Get detailed information about a specific transaction.
										</p>
										<div className="bg-muted p-4 rounded-lg font-mono text-sm">
											Path Parameter: transaction_id
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</section>

					{/* Analytics Endpoints */}
					<section id="analytics" className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">Analytics Endpoints</h2>
						<Card>
							<CardContent className="p-8">
								<div className="space-y-6">
									<div className="border-l-4 border-blue-500 pl-4">
										<h3 className="font-semibold mb-2">GET /api/v1/analytics/summary</h3>
										<p className="text-muted-foreground mb-4">
											Get financial summary and key metrics.
										</p>
										<div className="bg-muted p-4 rounded-lg font-mono text-sm">
											Query Parameters: period (daily, weekly, monthly)
										</div>
									</div>

									<div className="border-l-4 border-green-500 pl-4">
										<h3 className="font-semibold mb-2">GET /api/v1/analytics/trends</h3>
										<p className="text-muted-foreground mb-4">
											Get spending and income trends over time.
										</p>
										<div className="bg-muted p-4 rounded-lg font-mono text-sm">
											Query Parameters: start_date, end_date, category
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</section>

					{/* Next Steps */}
					<section className="mb-16">
						<Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
							<CardContent className="p-8 text-center">
								<h3 className="text-2xl font-semibold mb-4">Ready to Start Building?</h3>
								<p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
									Explore our SDKs and client libraries to get started quickly.
								</p>
								<Button asChild>
									<Link href="/docs/api/sdks">
										<Settings className="h-4 w-4 mr-2" />
										View SDKs
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
