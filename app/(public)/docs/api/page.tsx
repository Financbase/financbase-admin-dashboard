import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Code, Zap, Shield, Users, ArrowRight, BookOpen, Terminal, HelpCircle } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
	title: "API Documentation | Financbase",
	description: "Build custom integrations with our powerful API and developer tools",
};

const features = [
	{
		icon: Code,
		title: "RESTful API",
		description: "Clean, intuitive REST API with comprehensive endpoints for all platform features"
	},
	{
		icon: Zap,
		title: "Real-time Webhooks",
		description: "Get instant notifications when events occur in your account with webhook support"
	},
	{
		icon: Shield,
		title: "Enterprise Security",
		description: "OAuth 2.0, API keys, and rate limiting to keep your integrations secure"
	},
	{
		icon: Users,
		title: "SDKs & Libraries",
		description: "Official SDKs for popular languages including JavaScript, Python, PHP, and more"
	},
	{
		icon: BookOpen,
		title: "Interactive Docs",
		description: "Try API endpoints directly in your browser with our interactive documentation"
	},
	{
		icon: Terminal,
		title: "CLI Tools",
		description: "Command-line tools to manage your integrations and automate deployments"
	}
];

const codeExamples = [
	{
		language: "JavaScript",
		code: `// Get accounts
const response = await fetch('https://api.financbase.com/api/accounts', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});
const { accounts } = await response.json();`
	},
	{
		language: "Python",
		code: `import requests

# Get transactions
response = requests.get(
    'https://api.financbase.com/api/transactions',
    headers={'Authorization': 'Bearer YOUR_API_KEY'}
)
data = response.json()`
	},
	{
		language: "cURL",
		code: `curl -X GET https://api.financbase.com/api/analytics \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -G -d "period=30d"`
	}
];

const pricingPlans = [
	{
		name: "Developer",
		price: "$0",
		period: "/month",
		description: "Perfect for developers",
		features: [
			"1,000 API calls/month",
			"Basic documentation",
			"Community support",
			"Sandbox environment",
			"Webhook support"
		],
		cta: "Get Started Free",
		popular: false
	},
	{
		name: "Professional",
		price: "$49",
		period: "/month",
		description: "Ideal for growing apps",
		features: [
			"50,000 API calls/month",
			"Priority support",
			"Advanced webhooks",
			"SDK access",
			"Rate limit increases"
		],
		cta: "Start Free Trial",
		popular: true
	},
	{
		name: "Enterprise",
		price: "$199",
		period: "/month",
		description: "For large applications",
		features: [
			"Unlimited API calls",
			"Dedicated support",
			"Custom integrations",
			"SLA guarantee",
			"White-label options"
		],
		cta: "Contact Sales",
		popular: false
	}
];

export default function APIDocumentationPage() {
	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<div className="border-b bg-gradient-to-br from-background via-background to-muted/20">
				<div className="container mx-auto px-4 py-16">
					<div className="max-w-4xl mx-auto text-center">
						<div className="flex items-center justify-center gap-2 mb-4">
							<Code className="h-6 w-6 text-primary" />
							<Badge variant="secondary" className="text-sm font-medium">
						API Documentation
					</Badge>
						</div>
						<h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
							Build Custom Integrations with{" "}
							<span className="text-primary">Our API</span>
					</h1>
					<p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
						Powerful REST API with comprehensive documentation, SDKs, and developer tools. 
						Build amazing integrations in minutes, not hours.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button size="lg" className="text-lg px-8" asChild>
								<Link href="/developer">
							Get API Key
							<ArrowRight className="ml-2 h-5 w-5" />
								</Link>
						</Button>
							<Button variant="outline" size="lg" className="text-lg px-8" asChild>
								<Link href="/docs/api/endpoints">
							View Documentation
								</Link>
						</Button>
							<Button variant="outline" size="lg" className="text-lg px-8" asChild>
								<Link href="/docs/api/openapi.yaml" target="_blank">
							OpenAPI Spec
								</Link>
						</Button>
					</div>
					<p className="text-sm text-muted-foreground mt-4">
						Free developer plan • No credit card required
					</p>
				</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-16">
				<div className="max-w-6xl mx-auto">
			{/* Features Section */}
					<section className="mb-16">
						<div className="text-center mb-12">
							<h2 className="text-3xl font-semibold mb-4">Developer-Friendly Features</h2>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
						Everything you need to build powerful integrations quickly and efficiently.
					</p>
				</div>
				
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{features.map((feature, index) => (
						<Card key={index} className="text-center hover:shadow-lg transition-shadow">
							<CardHeader>
								<div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
									<feature.icon className="h-6 w-6 text-primary" />
								</div>
								<CardTitle className="text-xl">{feature.title}</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription className="text-base">
									{feature.description}
								</CardDescription>
							</CardContent>
						</Card>
					))}
				</div>
			</section>

			{/* Code Examples */}
					<section className="mb-16">
						<div className="text-center mb-12">
							<h2 className="text-3xl font-semibold mb-4">Quick Start Examples</h2>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
						Get started with our API in just a few lines of code.
					</p>
				</div>
				
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{codeExamples.map((example, index) => (
						<Card key={index} className="hover:shadow-lg transition-shadow">
							<CardHeader>
								<CardTitle className="text-lg">{example.language}</CardTitle>
							</CardHeader>
							<CardContent>
								<pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
									<code className="text-foreground">{example.code}</code>
								</pre>
							</CardContent>
						</Card>
					))}
				</div>
			</section>

			{/* Pricing Section */}
					<section className="mb-16">
						<div className="text-center mb-12">
							<h2 className="text-3xl font-semibold mb-4">Simple, Transparent Pricing</h2>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
						Start free and scale as your application grows.
					</p>
				</div>
						
						<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
							{pricingPlans.map((plan, index) => (
								<Card key={index} className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
									{plan.popular && (
										<div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
											<Badge className="bg-primary">Most Popular</Badge>
										</div>
									)}
									<CardHeader className="text-center">
										<CardTitle className="text-2xl">{plan.name}</CardTitle>
										<div className="mt-4">
											<span className="text-4xl font-bold">{plan.price}</span>
											<span className="text-muted-foreground">{plan.period}</span>
										</div>
										<CardDescription className="mt-2">{plan.description}</CardDescription>
									</CardHeader>
									<CardContent>
										<ul className="space-y-3 mb-6">
											{plan.features.map((feature, featureIndex) => (
												<li key={featureIndex} className="flex items-center">
													<CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
													<span>{feature}</span>
												</li>
											))}
										</ul>
										<Button 
											className="w-full" 
											variant={plan.popular ? "default" : "outline"}
											size="lg"
										>
											{plan.cta}
										</Button>
									</CardContent>
								</Card>
							))}
						</div>
			</section>

					{/* CTA Section */}
					<section className="mb-16">
						<Card className="bg-gradient-to-r from-primary/90 to-primary text-white border-0">
							<CardContent className="text-center py-16">
								<h2 className="text-3xl font-bold mb-4">Ready to Build?</h2>
								<p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
									Join thousands of developers building amazing integrations with our API.
								</p>
								<div className="flex flex-col sm:flex-row gap-4 justify-center">
									<Button 
										size="lg" 
										className="text-lg px-8 bg-white text-primary hover:bg-white/90 border-white" 
										asChild
									>
										<Link href="/developer">
											Get Your API Key
										</Link>
									</Button>
									<Button 
										size="lg" 
										variant="outline" 
										className="text-lg px-8 border-white text-white hover:bg-white hover:text-primary" 
										asChild
									>
										<Link href="/docs/api/endpoints">
											View Full Documentation
										</Link>
									</Button>
								</div>
							</CardContent>
						</Card>
					</section>

					{/* Support Section */}
					<Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
						<CardContent className="p-8 text-center">
							<div className="max-w-2xl mx-auto">
								<h3 className="text-2xl font-semibold mb-4">Need Help?</h3>
								<p className="text-muted-foreground mb-6">
									Can't find what you're looking for? Our support team is here
									to help you get the most out of Financbase.
								</p>
								<div className="flex flex-col sm:flex-row gap-4 justify-center">
									<Button asChild>
										<Link href="/support">
											<HelpCircle className="h-4 w-4 mr-2" />
											Contact Support
										</Link>
									</Button>
									<Button variant="outline" asChild>
										<Link href="/docs/help">
											<BookOpen className="h-4 w-4 mr-2" />
											Browse Help Center
										</Link>
									</Button>
									<Button variant="outline" asChild>
										<Link href="/docs/api/openapi.yaml" target="_blank">
											<Code className="h-4 w-4 mr-2" />
											OpenAPI Spec
										</Link>
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}