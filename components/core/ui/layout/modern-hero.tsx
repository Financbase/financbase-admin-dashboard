"use client";

import { ErrorBoundary } from "@/components/error-boundary";
import {
	useAutoRotate,
	useEmailInput,
	useExpandableContent,
	useScrollVisibility,
} from "@/hooks/use-ui-patterns";
import { motion } from "framer-motion";
import {
	ArrowUpRight,
	BarChart3,
	Bell,
	CheckCircle,
	ChevronDown,
	CreditCard,
	DollarSign,
	Flag,
	Globe,
	Mail,
	MessageCircle,
	Play,
	Share2,
	ShieldCheck,
	Smartphone,
	Star,
	Target,
	TrendingUp,
	Zap,
} from "lucide-react";
import React from "react";

/** Financbase Financial Platform Landing Page */

const Stat = ({ label, value }: { label: string; value: string }) => (
	<div className="space-y-1">
		<div className="text-3xl font-semibold tracking-tight text-gray-900">
			{value}
		</div>
		<div className="text-sm text-gray-600">{label}</div>
	</div>
);

const SoftButton = ({
	children,
	className = "",
	...props
}: {
	children: React.ReactNode;
	className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
	<button
		className={`rounded-full px-5 py-2.5 text-sm font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 ${className}`}
		{...props}
	>
		{children}
	</button>
);

// Mock data for news feed
const newsItems = [
	{
		id: 1,
		title: "Market Update: S&P 500 Rises 2.3%",
		time: "2m ago",
		trending: true,
	},
	{
		id: 2,
		title: "Fed Signals Rate Cut in Q2",
		time: "15m ago",
		trending: false,
	},
	{
		id: 3,
		title: "Tech Stocks Rally on AI News",
		time: "1h ago",
		trending: true,
	},
	{ id: 4, title: "Crypto Market Stabilizes", time: "2h ago", trending: false },
	{
		id: 5,
		title: "Real Estate Investment Trends",
		time: "3h ago",
		trending: true,
	},
];

// Mock data for features
const features = [
	{
		id: 1,
		title: "AI Financial Insights",
		description: "Get personalized financial recommendations powered by AI",
		icon: Zap,
		color: "blue",
	},
	{
		id: 2,
		title: "Real-time Analytics",
		description: "Monitor your financial health with live dashboards",
		icon: BarChart3,
		color: "green",
	},
	{
		id: 3,
		title: "Automated Budgeting",
		description: "Smart budget allocation based on your spending patterns",
		icon: Target,
		color: "purple",
	},
	{
		id: 4,
		title: "Investment Tracking",
		description: "Track and optimize your investment portfolio",
		icon: TrendingUp,
		color: "orange",
	},
	{
		id: 5,
		title: "Expense Management",
		description: "Categorize and analyze your expenses automatically",
		icon: CreditCard,
		color: "red",
	},
	{
		id: 6,
		title: "Goal Setting",
		description: "Set and track your financial goals with AI guidance",
		icon: Flag,
		color: "indigo",
	},
];

// Mock data for testimonials
const testimonials = [
	{
		id: 1,
		name: "Sarah Johnson",
		role: "CEO, TechStart",
		content:
			"Financbase transformed how we manage our finances. The AI insights are incredible.",
		avatar: "SJ",
	},
	{
		id: 2,
		name: "Mike Chen",
		role: "CFO, GrowthCorp",
		content:
			"Finally, a financial platform that actually understands our business needs.",
		avatar: "MC",
	},
	{
		id: 3,
		name: "Emily Davis",
		role: "Founder, StartupHub",
		content: "The real-time analytics helped us make better decisions faster.",
		avatar: "ED",
	},
];

const FinancbaseLandingPage = () => {
	// Use custom hooks for better maintainability
	const [currentFeature, setCurrentFeature] = useAutoRotate(features);
	const [isNewsExpanded, toggleNewsExpansion] = useExpandableContent();
	const [email, , handleEmailChange] = useEmailInput();
	const [isFloatingNavVisible] = useScrollVisibility(300);

	return (
		<ErrorBoundary level="section">
			<div className="min-h-screen w-full bg-background">
				{/* Website Top Navigation with Announcement */}
				<div className="bg-blue-600 text-white text-center py-2 text-sm">
					<div className="flex items-center justify-center gap-2">
						<Bell className="h-4 w-4" />
						<span>
							🎉 New: AI-Powered Financial Insights Now Available - Try Free for
							14 Days
						</span>
					</div>
				</div>

				{/* Top Navigation */}
				<nav className="mx-auto flex w-full max-w-[1180px] items-center justify-between px-4 py-6 md:px-0">
					<div className="flex items-center gap-3">
						<img
							src="/financbase-logo.png"
							alt="Financbase Logo"
							className="h-9 w-auto"
						/>
					</div>
					<div className="hidden items-center gap-8 md:flex">
						{[
							"Financial Dashboard",
							"Business Intelligence",
							"Team Management",
							"Analytics",
						].map((item) => (
							<a
								key={item}
								href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
								className="text-sm text-gray-600 hover:text-gray-900"
							>
								{item}
							</a>
						))}
					</div>
					<div className="hidden gap-2 md:flex">
						<button
							type="button"
							className="rounded-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
						>
							Login
						</button>
						<SoftButton>Start Free Trial</SoftButton>
					</div>
				</nav>

				{/* Financbase Platform Hero with Animated News Feed */}
				<section className="relative mx-auto w-full max-w-[1180px] px-4 py-20 md:px-0">
					{/* Modern gradient background */}
					<div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl opacity-60" />
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-transparent to-transparent rounded-3xl" />

					<div className="relative grid grid-cols-1 gap-12 lg:grid-cols-2">
						{/* Hero Content */}
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8 }}
							className="flex flex-col justify-center space-y-8"
						>
							<div>
								<motion.div
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ delay: 0.2, duration: 0.6 }}
									className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6"
								>
									<div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
									AI-Powered Financial Intelligence
								</motion.div>

								<h1 className="text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight text-gray-900">
									Where Finance Meets
									<br />
									<span className="text-blue-600">Function.</span>
								</h1>
								<p className="mt-6 max-w-lg text-lg text-gray-600 leading-relaxed">
									Join over a thousand businesses who choose{" "}
									<span className="font-semibold text-gray-900">
										Financbase
									</span>{" "}
									for real-time financial intelligence and growth.
								</p>
							</div>

							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.4, duration: 0.6 }}
								className="flex items-center gap-4"
							>
								<SoftButton className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300">
									Start Your Financial Foundation{" "}
									<ArrowUpRight className="ml-1 inline h-4 w-4" />
								</SoftButton>
								<button
									type="button"
									className="group flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-gray-700 hover:bg-white hover:shadow-md transition-all duration-300 border border-gray-200"
								>
									<Play className="h-4 w-4 group-hover:scale-110 transition-transform" />
									Watch Demo
								</button>
							</motion.div>

							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.6, duration: 0.6 }}
								className="grid grid-cols-2 gap-8 pt-4 md:max-w-sm"
							>
								<div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20">
									<Stat label="Revenue Tracked" value="$2.8M" />
								</div>
								<div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20">
									<Stat label="Active Businesses" value="1,234" />
								</div>
							</motion.div>
						</motion.div>

						{/* Enhanced Animated News Feed */}
						<motion.div
							initial={{ opacity: 0, x: 30 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.3, duration: 0.8 }}
							className="relative"
						>
							<div className="relative rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-2xl ring-1 ring-white/20">
								{/* Floating elements */}
								<div className="absolute -top-4 -right-4 h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
								<div className="absolute -bottom-2 -left-2 h-6 w-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full animate-bounce" />

								<div className="flex items-center justify-between mb-6">
									<div className="flex items-center gap-3">
										<div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
										<h3 className="text-xl font-bold text-gray-900">
											Live Financial News
										</h3>
									</div>
									<div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
										<div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
										Live
									</div>
								</div>

								<div className="space-y-4">
									{newsItems
										.slice(0, isNewsExpanded ? newsItems.length : 3)
										.map((item, index) => (
											<motion.div
												key={item.id}
												initial={{ opacity: 0, x: 20 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ delay: 0.8 + index * 0.1 }}
												className="group flex items-center justify-between p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 border border-transparent hover:border-blue-200"
											>
												<div className="flex items-center gap-3">
													{item.trending && (
														<motion.div
															animate={{ rotate: [0, 5, -5, 0] }}
															transition={{
																duration: 2,
																repeat: Number.POSITIVE_INFINITY,
															}}
														>
															<TrendingUp className="h-4 w-4 text-green-500" />
														</motion.div>
													)}
													<span className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
														{item.title}
													</span>
												</div>
												<span className="text-xs text-gray-500 font-medium">
													{item.time}
												</span>
											</motion.div>
										))}
								</div>

								<motion.button
									onClick={toggleNewsExpansion}
									className="mt-6 w-full text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2 font-medium py-2 rounded-lg hover:bg-blue-50 transition-all duration-300"
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
								>
									{isNewsExpanded ? "Show Less" : "Show More"}
									<ChevronDown
										className={`h-4 w-4 transition-transform ${isNewsExpanded ? "rotate-180" : ""}`}
									/>
								</motion.button>
							</div>
						</motion.div>
					</div>
				</section>

				{/* Financbase App Feature Carousel */}
				<section className="relative py-20 overflow-hidden">
					{/* Modern background with gradients */}
					<div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" />
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-transparent" />

					<div className="relative mx-auto w-full max-w-[1180px] px-4 md:px-0">
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8 }}
							className="text-center mb-16"
						>
							<div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
								<Zap className="h-4 w-4" />
								Powerful Features
							</div>
							<h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
								Powerful Features for
								<span className="text-blue-600"> Modern Finance</span>
							</h2>
							<p className="text-xl text-gray-600 max-w-2xl mx-auto">
								Everything you need to manage your financial future with
								cutting-edge technology
							</p>
						</motion.div>

						<div className="relative">
							{/* Auto-rotation indicator */}
							<div className="flex justify-center mb-8">
								<div className="flex gap-2">
									{features.map((_, index) => (
										<motion.div
											key={features[index]?.id}
											className={`h-2 w-8 rounded-full transition-all duration-300 ${
												currentFeature === index ? "bg-blue-600" : "bg-gray-300"
											}`}
											animate={{
												scale: currentFeature === index ? 1.2 : 1,
												opacity: currentFeature === index ? 1 : 0.5,
											}}
										/>
									))}
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
								{features.map((feature, index) => (
									<motion.div
										key={feature.id}
										initial={{ opacity: 0, y: 30 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.1, duration: 0.6 }}
										whileHover={{ y: -5, scale: 1.02 }}
										className={`group relative p-8 rounded-2xl bg-white/80 backdrop-blur-sm shadow-xl ring-1 ring-white/20 transition-all duration-500 ${
											currentFeature === index
												? "ring-2 ring-blue-500 scale-105 shadow-2xl bg-blue-50"
												: "hover:shadow-2xl hover:bg-white/90"
										}`}
									>
										{/* Floating background elements */}
										<div className="absolute -top-2 -right-2 h-6 w-6 bg-blue-500 rounded-full opacity-20 group-hover:opacity-40 transition-opacity" />
										<div className="absolute -bottom-2 -left-2 h-4 w-4 bg-blue-400 rounded-full opacity-20 group-hover:opacity-40 transition-opacity" />

										<div className="relative">
											<motion.div
												className={`inline-flex p-4 rounded-2xl mb-6 ${
													currentFeature === index
														? "bg-blue-600 text-white shadow-lg"
														: `bg-${feature.color}-100 text-${feature.color}-600`
												}`}
												whileHover={{ rotate: 5, scale: 1.1 }}
												transition={{ type: "spring", stiffness: 300 }}
											>
												<feature.icon className="h-6 w-6" />
											</motion.div>

											<h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">
												{feature.title}
											</h3>
											<p className="text-gray-600 leading-relaxed">
												{feature.description}
											</p>

											{/* Progress indicator */}
											<div className="mt-6 h-1 bg-gray-200 rounded-full overflow-hidden">
												<motion.div
													className="h-full bg-blue-500 rounded-full"
													initial={{ width: 0 }}
													animate={{
														width: currentFeature === index ? "100%" : "0%",
													}}
													transition={{ duration: 0.5 }}
												/>
											</div>
										</div>
									</motion.div>
								))}
							</div>
						</div>
					</div>
				</section>

				{/* AI-Powered Financial News Feature Section */}
				<section className="py-16">
					<div className="mx-auto w-full max-w-[1180px] px-4 md:px-0">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
							<div>
								<h2 className="text-3xl font-bold text-gray-900 mb-6">
									AI-Powered Financial Intelligence
								</h2>
								<p className="text-lg text-gray-600 mb-8">
									Get personalized financial insights and market analysis
									powered by advanced AI. Stay ahead of market trends and make
									informed decisions.
								</p>

								<div className="space-y-4">
									<div className="flex items-center gap-3">
										<CheckCircle className="h-5 w-5 text-green-500" />
										<span className="text-gray-700">
											Real-time market analysis
										</span>
									</div>
									<div className="flex items-center gap-3">
										<CheckCircle className="h-5 w-5 text-green-500" />
										<span className="text-gray-700">
											Personalized investment recommendations
										</span>
									</div>
									<div className="flex items-center gap-3">
										<CheckCircle className="h-5 w-5 text-green-500" />
										<span className="text-gray-700">
											Automated risk assessment
										</span>
									</div>
									<div className="flex items-center gap-3">
										<CheckCircle className="h-5 w-5 text-green-500" />
										<span className="text-gray-700">
											Predictive financial modeling
										</span>
									</div>
								</div>
							</div>

							<div className="relative">
								<div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
									<div className="space-y-4">
										<div className="flex items-center gap-3">
											<div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
											<span className="text-sm font-medium text-gray-900">
												AI Analysis Active
											</span>
										</div>
										<div className="space-y-3">
											<div className="p-3 bg-white rounded-lg shadow-sm">
												<div className="text-sm text-gray-600">
													Portfolio Performance
												</div>
												<div className="text-lg font-semibold text-green-600">
													+12.4% this month
												</div>
											</div>
											<div className="p-3 bg-white rounded-lg shadow-sm">
												<div className="text-sm text-gray-600">
													Risk Assessment
												</div>
												<div className="text-lg font-semibold text-blue-600">
													Low Risk
												</div>
											</div>
											<div className="p-3 bg-white rounded-lg shadow-sm">
												<div className="text-sm text-gray-600">
													Next Recommendation
												</div>
												<div className="text-lg font-semibold text-purple-600">
													Diversify Tech Holdings
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Financbase App 14-Day Free Trial Section */}
				<section className="bg-blue-600 py-16">
					<div className="mx-auto w-full max-w-[1180px] px-4 md:px-0">
						<div className="text-center text-white">
							<h2 className="text-3xl font-bold mb-4">
								Start Your 14-Day Free Trial
							</h2>
							<p className="text-xl text-blue-100 mb-8">
								No credit card required. Full access to all features. Cancel
								anytime.
							</p>

							<div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
								<button
									type="button"
									className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
								>
									Start Free Trial
								</button>
								<button
									type="button"
									className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-colors"
								>
									Schedule Demo
								</button>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
								<div>
									<div className="text-2xl font-bold mb-2">14 Days</div>
									<div className="text-blue-100">Free trial period</div>
								</div>
								<div>
									<div className="text-2xl font-bold mb-2">$0</div>
									<div className="text-blue-100">No setup fees</div>
								</div>
								<div>
									<div className="text-2xl font-bold mb-2">24/7</div>
									<div className="text-blue-100">Support included</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Interactive Financbase App Feature Section */}
				<section className="py-16">
					<div className="mx-auto w-full max-w-[1180px] px-4 md:px-0">
						<div className="text-center mb-12">
							<h2 className="text-3xl font-bold text-gray-900 mb-4">
								Interactive Financial Dashboard
							</h2>
							<p className="text-lg text-gray-600">
								Experience the power of real-time financial management
							</p>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
							<div className="space-y-6">
								<div className="p-6 bg-white rounded-xl shadow-lg ring-1 ring-gray-200">
									<h3 className="text-xl font-semibold text-gray-900 mb-4">
										Real-time Portfolio
									</h3>
									<div className="space-y-3">
										<div className="flex justify-between items-center">
											<span className="text-gray-600">Total Balance</span>
											<span className="text-2xl font-bold text-green-600">
												$284,750
											</span>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-gray-600">Today's Change</span>
											<span className="text-lg font-semibold text-green-600">
												+$2,847
											</span>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-gray-600">Monthly Return</span>
											<span className="text-lg font-semibold text-blue-600">
												+12.4%
											</span>
										</div>
									</div>
								</div>

								<div className="p-6 bg-white rounded-xl shadow-lg ring-1 ring-gray-200">
									<h3 className="text-xl font-semibold text-gray-900 mb-4">
										Quick Actions
									</h3>
									<div className="grid grid-cols-2 gap-3">
										<button
											type="button"
											className="p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
										>
											<DollarSign className="h-5 w-5 mx-auto mb-1" />
											<div className="text-sm font-medium">Transfer</div>
										</button>
										<button
											type="button"
											className="p-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
										>
											<TrendingUp className="h-5 w-5 mx-auto mb-1" />
											<div className="text-sm font-medium">Invest</div>
										</button>
										<button
											type="button"
											className="p-3 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
										>
											<BarChart3 className="h-5 w-5 mx-auto mb-1" />
											<div className="text-sm font-medium">Analyze</div>
										</button>
										<button
											type="button"
											className="p-3 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
										>
											<Target className="h-5 w-5 mx-auto mb-1" />
											<div className="text-sm font-medium">Goals</div>
										</button>
									</div>
								</div>
							</div>

							<div className="relative">
								<div className="rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-white">
									<div className="flex items-center justify-between mb-6">
										<h3 className="text-xl font-semibold">Live Market Data</h3>
										<div className="flex items-center gap-2">
											<div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
											<span className="text-sm text-gray-300">Live</span>
										</div>
									</div>

									<div className="space-y-4">
										<div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
											<div>
												<div className="font-medium">S&P 500</div>
												<div className="text-sm text-gray-400">4,567.89</div>
											</div>
											<div className="text-right">
												<div className="text-green-400">+2.3%</div>
												<div className="text-sm text-gray-400">+$102.45</div>
											</div>
										</div>

										<div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
											<div>
												<div className="font-medium">NASDAQ</div>
												<div className="text-sm text-gray-400">14,234.56</div>
											</div>
											<div className="text-right">
												<div className="text-green-400">+1.8%</div>
												<div className="text-sm text-gray-400">+$251.23</div>
											</div>
										</div>

										<div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
											<div>
												<div className="font-medium">DOW</div>
												<div className="text-sm text-gray-400">34,567.89</div>
											</div>
											<div className="text-right">
												<div className="text-red-400">-0.5%</div>
												<div className="text-sm text-gray-400">-$172.34</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Weekly Insights Newsletter Section */}
				<section className="relative py-20 overflow-hidden">
					{/* Modern gradient background */}
					<div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50" />
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-100/30 via-transparent to-transparent" />

					<div className="relative mx-auto w-full max-w-[1180px] px-4 md:px-0">
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8 }}
							className="text-center mb-16"
						>
							<div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
								<Mail className="h-4 w-4" />
								Weekly Insights
							</div>
							<h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
								Weekly Financial
								<span className="text-blue-600"> Insights</span>
							</h2>
							<p className="text-xl text-gray-600 max-w-2xl mx-auto">
								Get expert analysis and market insights delivered to your inbox
							</p>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3, duration: 0.8 }}
							className="max-w-4xl mx-auto"
						>
							<div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl ring-1 ring-white/20 p-12">
								{/* Floating elements */}
								<div className="absolute -top-6 -right-6 h-12 w-12 bg-blue-500 rounded-full opacity-20 animate-pulse" />
								<div className="absolute -bottom-4 -left-4 h-8 w-8 bg-blue-400 rounded-full opacity-20 animate-bounce" />

								<div className="text-center mb-8">
									<motion.div
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
										className="inline-flex p-4 bg-blue-600 rounded-2xl mb-6"
									>
										<Mail className="h-8 w-8 text-white" />
									</motion.div>
									<h3 className="text-2xl font-bold text-gray-900 mb-3">
										Stay Informed
									</h3>
									<p className="text-gray-600 text-lg">
										Join 10,000+ subscribers getting weekly financial insights
									</p>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
									{[
										"Weekly market analysis",
										"Investment opportunities",
										"Economic trends",
										"Personal finance tips",
									].map((item, index) => (
										<motion.div
											key={`benefit-${item.toLowerCase().replace(/\s+/g, "-")}`}
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: 0.7 + index * 0.1 }}
											className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300"
										>
											<motion.div
												animate={{ rotate: [0, 5, -5, 0] }}
												transition={{
													duration: 2,
													repeat: Number.POSITIVE_INFINITY,
													delay: index * 0.5,
												}}
											>
												<CheckCircle className="h-5 w-5 text-green-500" />
											</motion.div>
											<span className="text-gray-700 font-medium">{item}</span>
										</motion.div>
									))}
								</div>

								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 1.2, duration: 0.6 }}
									className="space-y-4"
								>
									<div className="flex flex-col sm:flex-row gap-4">
										<div className="flex-1 relative">
											<input
												type="email"
												value={email}
												onChange={handleEmailChange}
												placeholder="Enter your email address"
												className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-lg transition-all duration-300"
											/>
											<Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
										</div>
										<motion.button
											type="button"
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
											className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
										>
											Subscribe Now
										</motion.button>
									</div>
									<p className="text-sm text-gray-500 text-center">
										No spam. Unsubscribe anytime. Join 10,000+ subscribers.
									</p>
								</motion.div>
							</div>
						</motion.div>
					</div>
				</section>

				{/* Floating Navigation Dock with Feature Description */}
				{isFloatingNavVisible && (
					<motion.div
						initial={{ opacity: 0, y: 100, scale: 0.8 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 100, scale: 0.8 }}
						transition={{ type: "spring", stiffness: 300, damping: 30 }}
						className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
					>
						<div className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl ring-1 ring-white/20 p-3">
							{/* Floating background elements */}
							<div className="absolute -top-2 -right-2 h-4 w-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-60 animate-pulse" />
							<div className="absolute -bottom-1 -left-1 h-3 w-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full opacity-60 animate-bounce" />

							<div className="flex items-center gap-1">
								{features.slice(0, 4).map((feature, index) => (
									<motion.button
										key={feature.id}
										onClick={() => setCurrentFeature(index)}
										whileHover={{ scale: 1.1, y: -2 }}
										whileTap={{ scale: 0.95 }}
										className={`relative p-4 rounded-xl transition-all duration-300 ${
											currentFeature === index
												? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
												: "text-gray-600 hover:bg-white/60 hover:text-blue-600"
										}`}
									>
										<feature.icon className="h-5 w-5" />

										{/* Tooltip */}
										<motion.div
											initial={{ opacity: 0, y: 10 }}
											animate={{
												opacity: currentFeature === index ? 1 : 0,
												y: currentFeature === index ? 0 : 10,
											}}
											className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap"
										>
											{feature.title}
											<div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
										</motion.div>
									</motion.button>
								))}
							</div>
						</div>
					</motion.div>
				)}

				{/* Financbase App Feature Showcase */}
				<section className="py-16">
					<div className="mx-auto w-full max-w-[1180px] px-4 md:px-0">
						<div className="text-center mb-12">
							<h2 className="text-3xl font-bold text-gray-900 mb-4">
								See Financbase in Action
							</h2>
							<p className="text-lg text-gray-600">
								Discover how our platform transforms financial management
							</p>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
							<div className="lg:col-span-2">
								<div className="relative bg-gray-900 rounded-xl overflow-hidden">
									<div className="absolute top-4 left-4 flex gap-2">
										<div className="h-3 w-3 bg-red-500 rounded-full" />
										<div className="h-3 w-3 bg-yellow-500 rounded-full" />
										<div className="h-3 w-3 bg-green-500 rounded-full" />
									</div>
									<div className="p-8 pt-12">
										<div className="text-white">
											<h3 className="text-2xl font-bold mb-4">
												Interactive Dashboard Demo
											</h3>
											<p className="text-gray-300 mb-6">
												Experience the power of real-time financial analytics
											</p>
											<button
												type="button"
												className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
											>
												<Play className="h-4 w-4" />
												Watch Demo
											</button>
										</div>
									</div>
								</div>
							</div>

							<div className="space-y-6">
								<div className="p-6 bg-white rounded-xl shadow-lg ring-1 ring-gray-200">
									<div className="flex items-center gap-3 mb-4">
										<div className="p-2 bg-blue-100 rounded-lg">
											<Smartphone className="h-5 w-5 text-blue-600" />
										</div>
										<h3 className="text-lg font-semibold text-gray-900">
											Mobile App
										</h3>
									</div>
									<p className="text-gray-600 mb-4">
										Access your finances anywhere with our mobile app
									</p>
									<div className="flex gap-2">
										<button
											type="button"
											className="flex-1 bg-black text-white px-4 py-2 rounded-lg text-sm"
										>
											App Store
										</button>
										<button
											type="button"
											className="flex-1 bg-black text-white px-4 py-2 rounded-lg text-sm"
										>
											Google Play
										</button>
									</div>
								</div>

								<div className="p-6 bg-white rounded-xl shadow-lg ring-1 ring-gray-200">
									<div className="flex items-center gap-3 mb-4">
										<div className="p-2 bg-green-100 rounded-lg">
											<ShieldCheck className="h-5 w-5 text-green-600" />
										</div>
										<h3 className="text-lg font-semibold text-gray-900">
											Bank-Level Security
										</h3>
									</div>
									<p className="text-gray-600">
										Your data is protected with enterprise-grade security
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Testimonials Section */}
				<section className="relative py-20 overflow-hidden">
					{/* Modern gradient background */}
					<div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" />
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-100/20 via-transparent to-transparent" />

					<div className="relative mx-auto w-full max-w-[1180px] px-4 md:px-0">
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8 }}
							className="text-center mb-16"
						>
							<div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full text-sm font-medium mb-6">
								<Star className="h-4 w-4" />
								Customer Stories
							</div>
							<h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
								Trusted by Financial
								<span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
									{" "}
									Leaders
								</span>
							</h2>
							<p className="text-xl text-gray-600 max-w-2xl mx-auto">
								See what our customers say about Financbase
							</p>
						</motion.div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
							{testimonials.map((testimonial, index) => (
								<motion.div
									key={testimonial.id}
									initial={{ opacity: 0, y: 30 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.2, duration: 0.6 }}
									whileHover={{ y: -5, scale: 1.02 }}
									className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl ring-1 ring-white/20 hover:shadow-2xl transition-all duration-500"
								>
									{/* Floating background elements */}
									<div className="absolute -top-3 -right-3 h-6 w-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 group-hover:opacity-40 transition-opacity" />
									<div className="absolute -bottom-2 -left-2 h-4 w-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full opacity-20 group-hover:opacity-40 transition-opacity" />

									<div className="relative">
										<div className="flex items-center gap-4 mb-6">
											<motion.div
												whileHover={{ rotate: 5, scale: 1.1 }}
												className="h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
											>
												{testimonial.avatar}
											</motion.div>
											<div>
												<div className="font-bold text-gray-900 text-lg">
													{testimonial.name}
												</div>
												<div className="text-sm text-gray-600 font-medium">
													{testimonial.role}
												</div>
											</div>
										</div>

										<motion.p
											className="text-gray-700 leading-relaxed mb-6 text-lg"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ delay: 0.5 + index * 0.1 }}
										>
											"{testimonial.content}"
										</motion.p>

										<motion.div
											className="flex items-center gap-1"
											initial={{ opacity: 0, scale: 0.8 }}
											animate={{ opacity: 1, scale: 1 }}
											transition={{ delay: 0.7 + index * 0.1 }}
										>
											{[...Array(5)].map((_, i) => (
												<motion.div
													key={`star-${testimonial.id}-${i}`}
													initial={{ opacity: 0, scale: 0 }}
													animate={{ opacity: 1, scale: 1 }}
													transition={{ delay: 0.8 + index * 0.1 + i * 0.1 }}
												>
													<Star className="h-5 w-5 text-yellow-400 fill-current" />
												</motion.div>
											))}
										</motion.div>
									</div>
								</motion.div>
							))}
						</div>
					</div>
				</section>

				{/* Footer */}
				<footer className="bg-gray-900 text-white py-12">
					<div className="mx-auto w-full max-w-[1180px] px-4 md:px-0">
						<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
							<div>
								<img
									src="/financbase-logo-white.png"
									alt="Financbase Logo"
									className="h-8 w-auto mb-4 no-filter"
									style={{ filter: "none", WebkitFilter: "none" }}
								/>
								<p className="text-gray-400 mb-4">
									The financial foundation of modern business. Where finance
									meets function.
								</p>
								<div className="flex gap-4">
									<button
										type="button"
										className="text-gray-400 hover:text-white transition-colors"
									>
										<Globe className="h-5 w-5" />
									</button>
									<button
										type="button"
										className="text-gray-400 hover:text-white transition-colors"
									>
										<MessageCircle className="h-5 w-5" />
									</button>
									<button
										type="button"
										className="text-gray-400 hover:text-white transition-colors"
									>
										<Share2 className="h-5 w-5" />
									</button>
								</div>
							</div>

							<div>
								<h3 className="font-semibold mb-4">Product</h3>
								<div className="space-y-2">
									<a
										href="/features"
										className="block text-gray-400 hover:text-white transition-colors"
									>
										Features
									</a>
									<a
										href="/pricing"
										className="block text-gray-400 hover:text-white transition-colors"
									>
										Pricing
									</a>
									<a
										href="/api"
										className="block text-gray-400 hover:text-white transition-colors"
									>
										API
									</a>
									<a
										href="/integrations"
										className="block text-gray-400 hover:text-white transition-colors"
									>
										Integrations
									</a>
								</div>
							</div>

							<div>
								<h3 className="font-semibold mb-4">Company</h3>
								<div className="space-y-2">
									<a
										href="/about"
										className="block text-gray-400 hover:text-white transition-colors"
									>
										About
									</a>
									<a
										href="/blog"
										className="block text-gray-400 hover:text-white transition-colors"
									>
										Blog
									</a>
									<a
										href="/careers"
										className="block text-gray-400 hover:text-white transition-colors"
									>
										Careers
									</a>
									<a
										href="/contact"
										className="block text-gray-400 hover:text-white transition-colors"
									>
										Contact
									</a>
								</div>
							</div>

							<div>
								<h3 className="font-semibold mb-4">Support</h3>
								<div className="space-y-2">
									<a
										href="/help"
										className="block text-gray-400 hover:text-white transition-colors"
									>
										Help Center
									</a>
									<a
										href="/docs"
										className="block text-gray-400 hover:text-white transition-colors"
									>
										Documentation
									</a>
									<a
										href="/status"
										className="block text-gray-400 hover:text-white transition-colors"
									>
										Status
									</a>
									<a
										href="/security"
										className="block text-gray-400 hover:text-white transition-colors"
									>
										Security
									</a>
								</div>
							</div>
						</div>

						<div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
							<p className="text-gray-400 text-sm">
								© {new Date().getFullYear()} Financbase, Inc. All rights
								reserved.
							</p>
							<div className="flex gap-6 mt-4 md:mt-0">
								<a
									href="/privacy"
									className="text-gray-400 hover:text-white text-sm transition-colors"
								>
									Privacy
								</a>
								<a
									href="/terms"
									className="text-gray-400 hover:text-white text-sm transition-colors"
								>
									Terms
								</a>
								<a
									href="/cookies"
									className="text-gray-400 hover:text-white text-sm transition-colors"
								>
									Cookies
								</a>
							</div>
						</div>
					</div>
				</footer>
			</div>
		</ErrorBoundary>
	);
};

export default React.memo(FinancbaseLandingPage);
