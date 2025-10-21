import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { EducationalTooltip } from "@/components/ui/educational-tooltip";
import { FeedbackWidget } from "@/components/ui/feedback-widget";
import { StatsWidget } from "@/components/ui/stats-widget";
import { TestimonialCard } from "@/components/ui/testimonial-card-1";
import { motion } from "framer-motion";
import {
	ArrowRight,
	ArrowUp,
	Banknote,
	BarChart3,
	Briefcase,
	Building2,
	Check,
	Clock,
	CreditCard,
	Crown,
	DollarSign,
	Headphones,
	HelpCircle,
	Key,
	Landmark,
	MessageCircle,
	PhoneCall,
	PiggyBank,
	Rocket,
	Shield,
	Sparkles,
	Star,
	Users,
	Zap,
} from "lucide-react";

// ISR configuration
export const revalidate = 3600; // Revalidate every hour

// Server-side data fetching
async function getPricingPageData() {
	// Simulate database fetch - in production this would come from CMS/database
	await new Promise((resolve) => setTimeout(resolve, 100));

	return {
		pricingTiers: [
			{
				name: "Starter",
				price: { monthly: 29, yearly: 290 },
				description: "Perfect for freelancers and small businesses",
				icon: <Zap className="w-6 h-6" />,
				features: [
					{
						name: "Basic financial tracking",
						description: "Track income, expenses, and cash flow",
						included: true,
					},
					{
						name: "Monthly reports",
						description: "Automated monthly financial reports",
						included: true,
					},
					{
						name: "Email support",
						description: "24/7 email support with 24h response time",
						included: true,
					},
					{
						name: "1 user",
						description: "Single user account",
						included: true,
					},
					{
						name: "API Access",
						description: "Limited API access for basic integrations",
						included: false,
					},
					{
						name: "Advanced Analytics",
						description: "Deep insights and custom reports",
						included: false,
					},
				],
				buttonText: "Start Free Trial",
				buttonVariant: "outline" as const,
			},
			{
				name: "Professional",
				price: { monthly: 99, yearly: 990 },
				description: "Ideal for growing businesses and agencies",
				icon: <Star className="w-6 h-6" />,
				highlight: true,
				badge: "Most Popular",
				features: [
					{
						name: "Everything in Starter",
						description: "All Starter features included",
						included: true,
					},
					{
						name: "AI-powered insights",
						description: "Personalized recommendations powered by AI",
						included: true,
					},
					{
						name: "Advanced reporting",
						description: "Custom reports and analytics",
						included: true,
					},
					{
						name: "5 users",
						description: "Up to 5 team members",
						included: true,
					},
					{
						name: "Priority support",
						description: "24/7 priority email and chat support",
						included: true,
					},
					{
						name: "Full API Access",
						description: "Complete API access with higher rate limits",
						included: true,
					},
				],
				buttonText: "Start Free Trial",
				buttonVariant: "default" as const,
			},
			{
				name: "Enterprise",
				price: { monthly: 299, yearly: 2990 },
				description: "For large organizations with complex needs",
				icon: <Crown className="w-6 h-6" />,
				features: [
					{
						name: "Everything in Professional",
						description: "All Professional features included",
						included: true,
					},
					{
						name: "Custom integrations",
						description: "Tailored integrations for your business",
						included: true,
					},
					{
						name: "Dedicated account manager",
						description: "Personal account manager",
						included: true,
					},
					{
						name: "Unlimited users",
						description: "No limit on team members",
						included: true,
					},
					{
						name: "24/7 phone support",
						description: "Round-the-clock phone support",
						included: true,
					},
					{
						name: "White-label solution",
						description: "Custom branding and deployment",
						included: true,
					},
				],
				buttonText: "Contact Sales",
				buttonVariant: "outline" as const,
			},
		],
		faqs: [
			{
				question: "Can I change plans anytime?",
				answer:
					"Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate any differences.",
			},
			{
				question: "Is there a free trial?",
				answer:
					"Yes, we offer a 14-day free trial for all plans. No credit card required to start, and you can cancel anytime.",
			},
			{
				question: "What payment methods do you accept?",
				answer:
					"We accept all major credit cards, PayPal, and bank transfers for annual plans. Enterprise customers can also pay via invoice.",
			},
			{
				question: "Do you offer discounts for annual billing?",
				answer:
					"Yes, save 20% when you pay annually for any plan. Enterprise customers may qualify for additional volume discounts.",
			},
			{
				question: "What happens to my data if I cancel?",
				answer:
					"Your data remains accessible for 30 days after cancellation. You can export all your data in standard formats during this period.",
			},
			{
				question: "Do you offer custom enterprise solutions?",
				answer:
					"Yes, we provide custom solutions for large enterprises including on-premise deployment, custom integrations, and dedicated support.",
			},
		],
		pricingTestimonials: [
			{
				name: "Sarah Chen",
				role: "CFO at TechStart",
				content:
					"The Professional plan has been perfect for our growing team. The AI insights have helped us save 20+ hours per week on financial analysis.",
				rating: 5,
				avatar:
					"https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
			},
			{
				name: "Michael Rodriguez",
				role: "CEO at GrowthCorp",
				content:
					"Enterprise plan gave us the custom integrations we needed. The dedicated support team is incredible and response time is under 1 hour.",
				rating: 5,
				avatar:
					"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
			},
			{
				name: "Emily Johnson",
				role: "Founder at StartupHub",
				content:
					"Started with the Starter plan and upgraded as we grew. The pricing is transparent and the value is incredible for what we get.",
				rating: 5,
				avatar:
					"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
			},
		],
	};
}

interface PricingPageProps {
	searchParams: {
		yearly?: string;
	};
}

export default async function PricingPage({ searchParams }: PricingPageProps) {
	const data = await getPricingPageData();
	const resolvedSearchParams = await searchParams;
	const isYearly = resolvedSearchParams.yearly === "true";

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.2,
				delayChildren: 0.3,
			},
		},
	};

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: { duration: 0.6, ease: "easeOut" },
		},
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
			{/* Hero Section */}
			<motion.section
				className="py-20 md:py-32"
				initial="hidden"
				animate="visible"
				variants={containerVariants}
			>
				<div className="max-w-6xl mx-auto px-6">
					<motion.div className="text-center mb-16" variants={itemVariants}>
						<motion.span
							className="text-blue-600 font-medium mb-4 flex items-center justify-center gap-2"
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
						>
							<Sparkles className="w-4 h-4" />
							PRICING
						</motion.span>
						<h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
							Simple, Transparent <span className="text-blue-600">Pricing</span>
						</h1>
						<motion.div
							className="w-24 h-1 bg-blue-600 mx-auto"
							initial={{ width: 0 }}
							animate={{ width: 96 }}
							transition={{ duration: 1, delay: 0.5 }}
						/>
						<p className="text-xl text-gray-600 dark:text-gray-300 mt-8 max-w-3xl mx-auto">
							Choose the plan that fits your business needs. Start free, scale
							as you grow.
						</p>
					</motion.div>

					{/* Billing Toggle */}
					<motion.div
						className="flex justify-center mb-16"
						variants={itemVariants}
					>
						<div className="inline-flex items-center p-1.5 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
							{["Monthly", "Yearly"].map((period) => (
								<form
									key={period}
									action="/pricing"
									method="GET"
									className="inline"
								>
									<input
										type="hidden"
										name="yearly"
										value={period === "Yearly" ? "true" : "false"}
									/>
									<button
										type="submit"
										className={`px-8 py-2.5 text-sm font-medium rounded-full transition-all duration-300 ${
											(period === "Yearly") === isYearly
												? "bg-blue-600 text-white shadow-lg"
												: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
										}`}
									>
										{period}
										{period === "Yearly" && (
											<Badge className="ml-2 bg-green-500 text-white text-xs">
												Save 20%
											</Badge>
										)}
									</button>
								</form>
							))}
						</div>
					</motion.div>
				</div>
			</motion.section>

			{/* Value Metrics Section */}
			<motion.section
				className="py-20 bg-white dark:bg-gray-900"
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true }}
				variants={containerVariants}
			>
				<div className="max-w-6xl mx-auto px-6">
					<motion.div className="text-center mb-16" variants={itemVariants}>
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
							The Value is Clear
						</h2>
						<p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
							See why thousands of businesses choose Financbase over competitors
						</p>
					</motion.div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
						<StatsWidget
							title="Cost Savings"
							amount={45}
							change={8.2}
							autoUpdate={true}
						/>
						<StatsWidget
							title="Time Saved"
							amount={12}
							change={15.3}
							autoUpdate={true}
						/>
						<StatsWidget
							title="ROI Increase"
							amount={340}
							change={22.1}
							autoUpdate={true}
						/>
					</div>

					<motion.div className="text-center" variants={itemVariants}>
						<EducationalTooltip
							title="Real Business Impact"
							content="These metrics are based on actual customer data showing the tangible benefits of using Financbase."
							level="intermediate"
						>
							<div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-full text-green-700 dark:text-green-300 cursor-help">
								<BarChart3 className="w-4 h-4" />
								<span className="text-sm font-medium">
									Based on Customer Data
								</span>
							</div>
						</EducationalTooltip>
					</motion.div>
				</div>
			</motion.section>

			{/* Pricing Cards */}
			<motion.section
				className="py-20"
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true }}
				variants={containerVariants}
			>
				<div className="max-w-6xl mx-auto px-6">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{data.pricingTiers.map((tier) => (
							<motion.div
								key={tier.name}
								className="relative group"
								variants={itemVariants}
								whileHover={{ y: -10, transition: { duration: 0.3 } }}
							>
								{tier.badge && tier.highlight && (
									<div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
										<Badge className="bg-blue-600 text-white px-4 py-1.5 text-sm font-medium">
											{tier.badge}
										</Badge>
									</div>
								)}

								<Card
									className={`h-full transition-all duration-300 ${
										tier.highlight
											? "bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-900/20 border-blue-200 dark:border-blue-800 shadow-xl scale-105"
											: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl"
									}`}
								>
									<CardHeader className="p-8">
										<div className="flex items-center justify-between mb-4">
											<div
												className={`p-3 rounded-xl ${
													tier.highlight
														? "bg-blue-100 dark:bg-blue-900/30 text-blue-600"
														: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
												}`}
											>
												{tier.icon}
											</div>
											<h3 className="text-2xl font-bold text-gray-900 dark:text-white">
												{tier.name}
											</h3>
										</div>

										<div className="mb-6">
											<div className="flex items-baseline gap-2">
												<span className="text-4xl font-bold text-gray-900 dark:text-white">
													${isYearly ? tier.price.yearly : tier.price.monthly}
												</span>
												<span className="text-sm text-gray-500 dark:text-gray-400">
													/{isYearly ? "year" : "month"}
												</span>
											</div>
											<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
												{tier.description}
											</p>
										</div>
									</CardHeader>

									<CardContent className="p-8 pt-0">
										<div className="space-y-4 mb-8">
											{tier.features.map((feature) => (
												<div key={feature.name} className="flex gap-4">
													<div
														className={`mt-1 p-0.5 rounded-full transition-colors duration-200 ${
															feature.included
																? "text-green-600 dark:text-green-400"
																: "text-gray-400 dark:text-gray-600"
														}`}
													>
														<Check className="w-4 h-4" />
													</div>
													<div>
														<div className="text-sm font-medium text-gray-900 dark:text-white">
															{feature.name}
														</div>
														<div className="text-sm text-gray-500 dark:text-gray-400">
															{feature.description}
														</div>
													</div>
												</div>
											))}
										</div>

										<Button
											className={`w-full ${
												tier.highlight
													? "bg-blue-600 hover:bg-blue-700 text-white"
													: "bg-gray-900 hover:bg-gray-800 text-white"
											}`}
											variant={tier.buttonVariant}
										>
											<span className="flex items-center justify-center gap-2">
												{tier.buttonText}
												<ArrowRight className="w-4 h-4" />
											</span>
										</Button>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>
				</div>
			</motion.section>

			{/* Social Proof Section */}
			<motion.section
				className="py-20 bg-white dark:bg-gray-900"
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true }}
				variants={containerVariants}
			>
				<div className="max-w-6xl mx-auto px-6">
					<motion.div className="text-center mb-16" variants={itemVariants}>
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
							What Our Customers Say About Our Pricing
						</h2>
						<p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
							See how businesses of all sizes benefit from our transparent
							pricing
						</p>
					</motion.div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{data.pricingTestimonials.map((testimonial) => (
							<motion.div
								key={testimonial.name}
								variants={itemVariants}
								whileHover={{ y: -5, transition: { duration: 0.2 } }}
							>
								<TestimonialCard
									name={testimonial.name}
									role={testimonial.role}
									content={testimonial.content}
									rating={testimonial.rating}
									avatar={testimonial.avatar}
									autoPlay={false}
									showRating={true}
								/>
							</motion.div>
						))}
					</div>
				</div>
			</motion.section>

			{/* Stats Section */}
			<motion.section
				className="py-20 bg-gray-50 dark:bg-gray-800"
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true }}
				variants={containerVariants}
			>
				<div className="max-w-6xl mx-auto px-6">
					<motion.div className="text-center mb-16" variants={itemVariants}>
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
							Pricing Transparency
						</h2>
						<p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
							No hidden fees, no surprises. Just clear, honest pricing that
							scales with your business.
						</p>
					</motion.div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<StatsWidget
							title="Customer Satisfaction"
							amount={98}
							change={2.1}
							autoUpdate={true}
						/>
						<StatsWidget
							title="Average ROI"
							amount={340}
							change={15.7}
							autoUpdate={true}
						/>
						<StatsWidget
							title="Time Saved (hrs/week)"
							amount={25}
							change={8.3}
							autoUpdate={true}
						/>
					</div>
				</div>
			</motion.section>

			{/* FAQ Section */}
			<motion.section
				className="py-20 bg-white dark:bg-gray-900"
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true }}
				variants={containerVariants}
			>
				<div className="max-w-4xl mx-auto px-6">
					<motion.div className="text-center mb-16" variants={itemVariants}>
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
							Frequently Asked Questions
						</h2>
						<p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
							Everything you need to know about our pricing and plans
						</p>
					</motion.div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{data.faqs.map((faq) => (
							<motion.div
								key={faq.question}
								className="group"
								variants={itemVariants}
								whileHover={{ y: -2, transition: { duration: 0.2 } }}
							>
								<Card className="h-full p-6 hover:shadow-lg transition-all duration-300">
									<CardContent className="p-0">
										<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 transition-colors duration-300">
											{faq.question}
										</h3>
										<p className="text-gray-600 dark:text-gray-400 leading-relaxed">
											{faq.answer}
										</p>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>
				</div>
			</motion.section>

			{/* CTA Section */}
			<motion.section
				className="py-20 bg-blue-600"
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true }}
				variants={containerVariants}
			>
				<div className="max-w-4xl mx-auto px-6 text-center">
					<motion.div variants={itemVariants}>
						<h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
							Ready to transform your business finances?
						</h2>
						<p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
							Join thousands of businesses already using Financbase to make
							smarter financial decisions.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<motion.div
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								<Button
									asChild
									size="lg"
									className="bg-white text-blue-600 hover:bg-gray-100"
								>
									<a href="/auth/sign-up" className="flex items-center gap-2">
										Start Your Free Trial
										<ArrowRight className="w-4 h-4" />
									</a>
								</Button>
							</motion.div>
							<motion.div
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								<Button
									asChild
									size="lg"
									variant="outline"
									className="border-white text-white hover:bg-white hover:text-blue-600"
								>
									<a href="/contact" className="flex items-center gap-2">
										Schedule Demo
										<PhoneCall className="w-4 h-4" />
									</a>
								</Button>
							</motion.div>
						</div>
					</motion.div>
				</div>
			</motion.section>

			{/* Enhanced Feedback and Support */}
			<div className="fixed bottom-4 right-4 z-50 space-y-4">
				<FeedbackWidget
					category="pricing"
					placeholder="Need help choosing a plan?"
				/>
				<EducationalTooltip
					title="Plan Comparison"
					content="Compare our plans side-by-side to find the perfect fit for your business needs and budget."
					level="intermediate"
				>
					<div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-purple-700 transition-colors">
						<span className="text-sm font-semibold">?</span>
					</div>
				</EducationalTooltip>
			</div>
		</div>
	);
}
