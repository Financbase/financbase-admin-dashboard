import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, X, Zap, Shield, Users, BarChart3 } from "lucide-react";

const plans = [
	{
		name: "Starter",
		price: "$29",
		period: "/month",
		description: "Perfect for small businesses getting started",
		features: [
			"Up to 5 users",
			"Basic financial tracking",
			"Monthly reports",
			"Email support",
			"Mobile app access",
			"Basic analytics",
			"Export to PDF/Excel",
			"Standard security"
		],
		popular: false,
		cta: "Start Free Trial"
	},
	{
		name: "Professional",
		price: "$79",
		period: "/month",
		description: "Ideal for growing businesses",
		features: [
			"Up to 25 users",
			"Advanced analytics",
			"Real-time reporting",
			"Priority support",
			"API access",
			"Custom integrations",
			"Advanced security",
			"Custom dashboards",
			"AI-powered insights",
			"Multi-currency support",
			"Budget planning tools",
			"Team collaboration"
		],
		popular: true,
		cta: "Start Free Trial"
	},
	{
		name: "Enterprise",
		price: "$199",
		period: "/month",
		description: "For large organizations",
		features: [
			"Unlimited users",
			"Advanced AI insights",
			"Custom dashboards",
			"Dedicated support",
			"White-label options",
			"Advanced security",
			"API rate limits",
			"Custom integrations",
			"Advanced compliance",
			"Priority onboarding",
			"Custom training",
			"SLA guarantee"
		],
		popular: false,
		cta: "Contact Sales"
	}
];

const addOns = [
	{
		name: "Advanced Analytics",
		price: "$49",
		period: "/month",
		description: "Deep insights with custom reporting",
		icon: BarChart3
	},
	{
		name: "Premium Support",
		price: "$99",
		period: "/month",
		description: "24/7 phone and priority support",
		icon: Shield
	},
	{
		name: "API Access",
		price: "$29",
		period: "/month",
		description: "Full API access with webhooks",
		icon: Zap
	},
	{
		name: "Team Training",
		price: "$199",
		period: "/session",
		description: "Custom training for your team",
		icon: Users
	}
];

export default function PricingPage() {
	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
				<div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
				<div className="max-w-6xl mx-auto px-6 relative">
					<div className="text-center text-white">
						<h1 className="text-4xl md:text-6xl font-bold mb-6">
							Simple, Transparent Pricing
						</h1>
						<p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
							Choose the plan that's right for your business. All plans include our core features with no hidden fees.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
								Calculate Your Savings
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* Pricing Cards */}
			<section className="py-20">
				<div className="max-w-7xl mx-auto px-6">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{plans.map((plan) => (
							<Card
								key={plan.name}
								className={`relative ${plan.popular ? 'ring-2 ring-blue-500 shadow-xl scale-105' : 'hover:shadow-lg'} transition-all duration-300`}
							>
								{plan.popular && (
									<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
										<Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1">
											<Star className="h-4 w-4 mr-1" />
											Most Popular
										</Badge>
									</div>
								)}

								<CardHeader className="text-center pb-8">
									<CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
									<div className="mt-4">
										<span className="text-4xl font-bold">{plan.price}</span>
										<span className="text-gray-500">{plan.period}</span>
									</div>
									<p className="text-gray-600 dark:text-gray-400 mt-2">
										{plan.description}
									</p>
								</CardHeader>

								<CardContent className="pt-0">
									<ul className="space-y-3 mb-8">
										{plan.features.map((feature) => (
											<li key={`${plan.name}-${feature}`} className="flex items-center">
												<Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
												<span className="text-gray-700 dark:text-gray-300">{feature}</span>
											</li>
										))}
									</ul>

									<Button
										className={`w-full ${plan.popular ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : ''}`}
										variant={plan.popular ? 'default' : 'outline'}
										size="lg"
									>
										{plan.cta}
									</Button>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Comparison Table */}
			<section className="py-20 bg-muted/30">
				<div className="max-w-7xl mx-auto px-6">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
							Compare All Features
						</h2>
						<p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
							See exactly what's included in each plan to make the best choice for your business.
						</p>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full border-collapse bg-card rounded-lg shadow-lg">
							<thead>
								<tr className="border-b">
									<th className="text-left p-4 font-semibold">Features</th>
									<th className="text-center p-4 font-semibold">Starter</th>
									<th className="text-center p-4 font-semibold bg-primary/10">Professional</th>
									<th className="text-center p-4 font-semibold">Enterprise</th>
								</tr>
							</thead>
							<tbody>
								<tr className="border-b">
									<td className="p-4 font-medium">Users</td>
									<td className="text-center p-4">Up to 5</td>
									<td className="text-center p-4 bg-primary/10">Up to 25</td>
									<td className="text-center p-4">Unlimited</td>
								</tr>
								<tr className="border-b">
									<td className="p-4 font-medium">Basic Analytics</td>
									<td className="text-center p-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
									<td className="text-center p-4 bg-primary/10"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
									<td className="text-center p-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
								</tr>
								<tr className="border-b">
									<td className="p-4 font-medium">Advanced Analytics</td>
									<td className="text-center p-4"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
									<td className="text-center p-4 bg-primary/10"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
									<td className="text-center p-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
								</tr>
								<tr className="border-b">
									<td className="p-4 font-medium">AI Insights</td>
									<td className="text-center p-4"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
									<td className="text-center p-4 bg-primary/10"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
									<td className="text-center p-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
								</tr>
								<tr className="border-b">
									<td className="p-4 font-medium">Custom Dashboards</td>
									<td className="text-center p-4"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
									<td className="text-center p-4 bg-primary/10"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
									<td className="text-center p-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
								</tr>
								<tr className="border-b">
									<td className="p-4 font-medium">Priority Support</td>
									<td className="text-center p-4"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
									<td className="text-center p-4 bg-primary/10"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
									<td className="text-center p-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
								</tr>
								<tr className="border-b">
									<td className="p-4 font-medium">API Access</td>
									<td className="text-center p-4"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
									<td className="text-center p-4 bg-primary/10"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
									<td className="text-center p-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
								</tr>
								<tr className="border-b">
									<td className="p-4 font-medium">Advanced Security</td>
									<td className="text-center p-4"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
									<td className="text-center p-4 bg-primary/10"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
									<td className="text-center p-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
								</tr>
								<tr className="border-b">
									<td className="p-4 font-medium">White-label Options</td>
									<td className="text-center p-4"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
									<td className="text-center p-4 bg-primary/10"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
									<td className="text-center p-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
								</tr>
								<tr className="border-b">
									<td className="p-4 font-medium">SLA Guarantee</td>
									<td className="text-center p-4"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
									<td className="text-center p-4 bg-primary/10"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
									<td className="text-center p-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</section>

			{/* Add-on Services */}
			<section className="py-20">
				<div className="max-w-6xl mx-auto px-6">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
							Enhance Your Plan
						</h2>
						<p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
							Add premium features and services to supercharge your financial management.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{addOns.map((addon) => (
							<Card key={addon.name} className="text-center hover:shadow-lg transition-all duration-300">
								<CardHeader>
									<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
										<addon.icon className="w-8 h-8" />
									</div>
									<CardTitle className="text-lg">{addon.name}</CardTitle>
									<div className="mt-2">
										<span className="text-2xl font-bold">{addon.price}</span>
										<span className="text-gray-500">{addon.period}</span>
									</div>
								</CardHeader>
								<CardContent>
									<p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
										{addon.description}
									</p>
									<Button variant="outline" size="sm" className="w-full">
										Add to Plan
									</Button>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* FAQ Section */}
			<section className="py-20 bg-muted/30">
				<div className="max-w-4xl mx-auto px-6">
					<h2 className="text-3xl font-bold text-center mb-12">
						Frequently Asked Questions
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div className="space-y-6">
							<div>
								<h3 className="text-lg font-semibold mb-2">Can I change plans anytime?</h3>
								<p className="text-gray-600 dark:text-gray-400">
									Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold mb-2">Is there a free trial?</h3>
								<p className="text-gray-600 dark:text-gray-400">
									Yes, we offer a 14-day free trial for all plans. No credit card required.
								</p>
							</div>
						</div>

						<div className="space-y-6">
							<div>
								<h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
								<p className="text-gray-600 dark:text-gray-400">
									We accept all major credit cards, PayPal, and bank transfers for enterprise plans.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold mb-2">Do you offer refunds?</h3>
								<p className="text-gray-600 dark:text-gray-400">
									Yes, we offer a 30-day money-back guarantee for all plans.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
				<div className="max-w-4xl mx-auto px-6 text-center">
					<h2 className="text-3xl font-bold text-white mb-4">
						Ready to Get Started?
					</h2>
					<p className="text-xl text-blue-100 mb-8">
						Join thousands of businesses already using Financbase to manage their finances.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
							Start Your Free Trial
						</Button>
						<Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
							Contact Sales
						</Button>
					</div>
				</div>
			</section>
		</div>
	);
}