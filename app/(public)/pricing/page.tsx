"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Zap, Shield, Users, BarChart3, CheckCheck, Briefcase, Database, Server } from "lucide-react";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";
import { useRef, useState } from "react";

const plans = [
	{
		name: "Starter",
		description: "Perfect for small businesses getting started",
		price: 29,
		yearlyPrice: 249,
		buttonText: "Get started",
		buttonVariant: "outline" as const,
		features: [
			{ text: "Up to 5 users", icon: <Users size={20} /> },
			{ text: "Basic financial tracking", icon: <BarChart3 size={20} /> },
			{ text: "Monthly reports", icon: <Database size={20} /> },
		],
		includes: [
			"Free includes:",
			"Email support",
			"Mobile app access",
			"Basic analytics",
			"Export to PDF/Excel",
			"Standard security"
		],
		popular: false,
	},
	{
		name: "Professional",
		description: "Ideal for growing businesses",
		price: 79,
		yearlyPrice: 639,
		buttonText: "Get started",
		buttonVariant: "default" as const,
		popular: true,
		features: [
			{ text: "Up to 25 users", icon: <Users size={20} /> },
			{ text: "Advanced analytics", icon: <BarChart3 size={20} /> },
			{ text: "Real-time reporting", icon: <Server size={20} /> },
		],
		includes: [
			"Everything in Starter, plus:",
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
	},
	{
		name: "Enterprise",
		description: "For large organizations",
		price: 199,
		yearlyPrice: 1599,
		buttonText: "Get started",
		buttonVariant: "outline" as const,
		features: [
			{ text: "Unlimited users", icon: <Users size={20} /> },
			{ text: "Advanced AI insights", icon: <Zap size={20} /> },
			{ text: "Custom dashboards", icon: <Briefcase size={20} /> },
		],
		includes: [
			"Everything in Professional, plus:",
			"Dedicated support",
			"White-label options",
			"API rate limits",
			"Custom integrations",
			"Advanced compliance",
			"Priority onboarding",
			"Custom training",
			"SLA guarantee"
		],
		popular: false,
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

const PricingSwitch = ({
  onSwitch,
  className,
}: {
  onSwitch: (value: string) => void;
  className?: string;
}) => {
  const [selected, setSelected] = useState("0");

  const handleSwitch = (value: string) => {
    setSelected(value);
    onSwitch(value);
  };

  return (
    <div className={cn("flex justify-center", className)}>
      <div className="relative z-10 mx-auto flex w-fit rounded-xl bg-neutral-50 border border-gray-200 p-1">
        <button
          type="button"
          onClick={() => handleSwitch("0")}
          className={cn(
            "relative z-10 w-fit cursor-pointer h-12 rounded-xl sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors sm:text-base text-sm",
            selected === "0"
              ? "text-white"
              : "text-muted-foreground hover:text-black",
          )}
        >
          {selected === "0" && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 h-12 w-full rounded-xl border-4 shadow-sm"
              style={{
                borderColor: 'var(--brand-primary)',
                backgroundColor: 'var(--brand-primary)',
                boxShadow: '0 0 0 1px var(--brand-primary)',
              }}
              transition={{ type: "spring" }}
            />
          )}
          <span className="relative">Monthly Billing</span>
        </button>

        <button
          type="button"
          onClick={() => handleSwitch("1")}
          className={cn(
            "relative z-10 w-fit cursor-pointer h-12 flex-shrink-0 rounded-xl sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors sm:text-base text-sm",
            selected === "1"
              ? "text-white"
              : "text-muted-foreground hover:text-black",
          )}
        >
          {selected === "1" && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 h-12 w-full rounded-xl border-4 shadow-sm"
              style={{
                borderColor: 'var(--brand-primary)',
                backgroundColor: 'var(--brand-primary)',
                boxShadow: '0 0 0 1px var(--brand-primary)',
              }}
              transition={{ type: "spring" }}
            />
          )}
          <span className="relative flex items-center gap-2">
            Yearly Billing
            <span 
              className="rounded-full px-2 py-0.5 text-xs font-medium text-black"
              style={{ backgroundColor: 'oklch(0.95 0.05 271.13)' }}
            >
              Save 20%
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default function PricingPage() {
	const [isYearly, setIsYearly] = useState(false);
	const pricingRef = useRef<HTMLDivElement>(null);

	const revealVariants = {
		visible: (i: number) => ({
			y: 0,
			opacity: 1,
			filter: "blur(0px)",
			transition: {
				delay: i * 0.4,
				duration: 0.5,
			},
		}),
		hidden: {
			filter: "blur(10px)",
			y: -20,
			opacity: 0,
		},
	};

	const togglePricingPeriod = (value: string) =>
		setIsYearly(Number.parseInt(value) === 1);
	return (
		<div
			className="px-4 pt-20 min-h-screen max-w-7xl mx-auto relative"
			ref={pricingRef}
			style={{
				'--brand-primary': 'oklch(0.388 0.1423 271.13)',
				'--brand-primary-light': 'oklch(0.45 0.1423 271.13)',
				'--brand-primary-dark': 'oklch(0.32 0.1423 271.13)',
			} as React.CSSProperties}
		>
			<article className="text-left mb-6 space-y-4 max-w-2xl">
				<h2 className="md:text-6xl text-4xl capitalize font-medium text-gray-900 mb-4">
					<VerticalCutReveal
						splitBy="words"
						staggerDuration={0.15}
						staggerFrom="first"
						reverse={true}
						containerClassName="justify-start"
					>
						We've got a plan that's perfect for you
					</VerticalCutReveal>
				</h2>

				<TimelineContent
					as="p"
					animationNum={0}
					timelineRef={pricingRef}
					customVariants={revealVariants}
					className="md:text-base text-sm text-gray-600 w-[80%]"
				>
					Trusted by businesses worldwide, We help teams all around the world, Explore which
					option is right for you.
				</TimelineContent>

				<TimelineContent
					as="div"
					animationNum={1}
					timelineRef={pricingRef}
					customVariants={revealVariants}
				>
					<PricingSwitch onSwitch={togglePricingPeriod} className="w-fit" />
				</TimelineContent>
			</article>

			<div className="grid md:grid-cols-3 gap-4 py-6">
				{plans.map((plan, index) => (
					<TimelineContent
						key={plan.name}
						as="div"
						animationNum={2 + index}
						timelineRef={pricingRef}
						customVariants={revealVariants}
					>
							<Card
							className={`relative border border-neutral-200 ${
								plan.popular
									? "ring-2 bg-opacity-10"
									: "bg-white "
							}`}
							style={plan.popular ? {
								'--tw-ring-color': 'var(--brand-primary)',
								backgroundColor: 'oklch(0.95 0.05 271.13)',
							} as React.CSSProperties : {}}
						>
							<CardHeader className="text-left ">
								<div className="flex justify-between">
									<h3 className="xl:text-3xl md:text-2xl text-3xl font-semibold text-gray-900 mb-2">
										{plan.name} Plan
									</h3>
									{plan.popular && (
										<div className="">
											<span 
												className="text-white px-3 py-1 rounded-full text-sm font-medium"
												style={{ backgroundColor: 'var(--brand-primary)' }}
											>
												Popular
											</span>
										</div>
									)}
									</div>
								<p className="xl:text-sm md:text-xs text-sm text-gray-600 mb-4">
										{plan.description}
									</p>
								<div className="flex items-baseline">
									<span className="text-4xl font-semibold text-gray-900">
										$
										<NumberFlow
											format={{
												currency: "USD",
											}}
											value={isYearly ? plan.yearlyPrice : plan.price}
											className="text-4xl font-semibold"
										/>
									</span>
									<span className="text-gray-600 ml-1">
										/{isYearly ? "year" : "month"}
									</span>
								</div>
								</CardHeader>

								<CardContent className="pt-0">
								<button
									type="button"
									className={`w-full mb-6 p-4 text-xl rounded-xl ${
										plan.popular
											? "text-white shadow-lg border"
											: plan.buttonVariant === "outline"
												? "bg-gradient-to-t from-neutral-900 to-neutral-600  shadow-lg shadow-neutral-900 border border-neutral-700 text-white"
												: ""
									}`}
									style={plan.popular ? {
										background: `linear-gradient(to bottom, var(--brand-primary-light), var(--brand-primary))`,
										borderColor: 'var(--brand-primary)',
										boxShadow: '0 10px 15px -3px var(--brand-primary)',
									} : {}}
								>
									{plan.buttonText}
								</button>
								<button
									type="button"
									className={`w-full mb-6 p-4 text-xl rounded-xl bg-white text-black border border-gray-200 shadow-lg shadow-gray-200`}
								>
									Click to Sale
								</button>

								<div className="space-y-3 pt-4 border-t border-neutral-200">
									<h2 className="text-xl font-semibold uppercase text-gray-900 mb-3">
										Features
									</h2>
									<h4 className="font-medium text-base text-gray-900 mb-3">
										{plan.includes[0]}
									</h4>
									<ul className="space-y-2 font-semibold">
										{plan.includes.slice(1).map((feature, featureIndex) => (
											<li key={`${plan.name}-${feature}-${featureIndex}`} className="flex items-center">
												<span 
													className="h-6 w-6 bg-white border rounded-full grid place-content-center mt-0.5 mr-3"
													style={{ borderColor: 'var(--brand-primary)' }}
												>
													<CheckCheck 
														className="h-4 w-4" 
														style={{ color: 'var(--brand-primary)' }}
													/>
												</span>
												<span className="text-sm text-gray-600">{feature}</span>
											</li>
										))}
									</ul>
								</div>
								</CardContent>
							</Card>
					</TimelineContent>
						))}
					</div>

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
									<th className="text-center p-4 font-semibold" style={{ backgroundColor: 'oklch(0.95 0.05 271.13)' }}>Professional</th>
									<th className="text-center p-4 font-semibold">Enterprise</th>
								</tr>
							</thead>
							<tbody>
								<tr className="border-b">
									<td className="p-4 font-medium">Users</td>
									<td className="text-center p-4">Up to 5</td>
									<td className="text-center p-4" style={{ backgroundColor: 'oklch(0.95 0.05 271.13)' }}>Up to 25</td>
									<td className="text-center p-4">Unlimited</td>
								</tr>
								<tr className="border-b">
									<td className="p-4 font-medium">Basic Analytics</td>
									<td className="text-center p-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
									<td className="text-center p-4" style={{ backgroundColor: 'oklch(0.95 0.05 271.13)' }}><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
									<td className="text-center p-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
								</tr>
								<tr className="border-b">
									<td className="p-4 font-medium">Advanced Analytics</td>
									<td className="text-center p-4"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
									<td className="text-center p-4" style={{ backgroundColor: 'oklch(0.95 0.05 271.13)' }}><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
									<td className="text-center p-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
								</tr>
								<tr className="border-b">
									<td className="p-4 font-medium">AI Insights</td>
									<td className="text-center p-4"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
									<td className="text-center p-4" style={{ backgroundColor: 'oklch(0.95 0.05 271.13)' }}><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
									<td className="text-center p-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
								</tr>
								<tr className="border-b">
									<td className="p-4 font-medium">Custom Dashboards</td>
									<td className="text-center p-4"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
									<td className="text-center p-4" style={{ backgroundColor: 'oklch(0.95 0.05 271.13)' }}><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
									<td className="text-center p-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
								</tr>
								<tr className="border-b">
									<td className="p-4 font-medium">Priority Support</td>
									<td className="text-center p-4"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
									<td className="text-center p-4" style={{ backgroundColor: 'oklch(0.95 0.05 271.13)' }}><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
									<td className="text-center p-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
								</tr>
								<tr className="border-b">
									<td className="p-4 font-medium">API Access</td>
									<td className="text-center p-4"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
									<td className="text-center p-4" style={{ backgroundColor: 'oklch(0.95 0.05 271.13)' }}><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
									<td className="text-center p-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
								</tr>
								<tr className="border-b">
									<td className="p-4 font-medium">Advanced Security</td>
									<td className="text-center p-4"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
									<td className="text-center p-4" style={{ backgroundColor: 'oklch(0.95 0.05 271.13)' }}><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
									<td className="text-center p-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
								</tr>
								<tr className="border-b">
									<td className="p-4 font-medium">White-label Options</td>
									<td className="text-center p-4"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
									<td className="text-center p-4" style={{ backgroundColor: 'oklch(0.95 0.05 271.13)' }}><X className="h-5 w-5 text-red-500 mx-auto" /></td>
									<td className="text-center p-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
								</tr>
								<tr className="border-b">
									<td className="p-4 font-medium">SLA Guarantee</td>
									<td className="text-center p-4"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
									<td className="text-center p-4" style={{ backgroundColor: 'oklch(0.95 0.05 271.13)' }}><X className="h-5 w-5 text-red-500 mx-auto" /></td>
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
									<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
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
			<section 
				className="py-20"
				style={{
					background: `linear-gradient(to right, var(--brand-primary), var(--brand-primary-dark))`,
				}}
			>
				<div className="max-w-4xl mx-auto px-6 text-center">
					<h2 className="text-3xl font-bold text-white mb-4">
						Ready to Get Started?
					</h2>
					<p className="text-xl mb-8" style={{ color: 'oklch(0.9 0.05 271.13)' }}>
						Join businesses already using Financbase to manage their finances.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button 
							size="lg" 
							className="bg-white hover:bg-gray-100"
							style={{ color: 'var(--brand-primary)' }}
						>
							Start Your Free Trial
						</Button>
						<Button 
							size="lg" 
							variant="outline" 
							className="border-white text-white hover:bg-white"
							style={{ 
								'--hover-text-color': 'var(--brand-primary)',
							} as React.CSSProperties}
						>
							Contact Sales
						</Button>
					</div>
				</div>
			</section>
		</div>
	);
}