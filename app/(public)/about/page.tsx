import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	ArrowRight,
	Building2,
	Heart,
	Shield,
	Target,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
	const data = {
		values: [
			{
				title: "Innovation",
				description:
					"Leveraging AI and machine learning to transform financial management and decision-making processes.",
			},
			{
				title: "Accessibility",
				description:
					"Making enterprise-grade financial tools available to businesses of all sizes and industries.",
			},
			{
				title: "Growth",
				description:
					"Empowering businesses to scale with confidence, clarity, and data-driven insights.",
			},
		],
		stats: [
			{
				icon: <Building2 />,
				value: "10,000+",
				label: "Active Businesses",
			},
			{
				icon: <TrendingUp />,
				value: "$2B+",
				label: "Financial Data Processed",
			},
			{ icon: <Shield />, value: "99.9%", label: "Uptime" },
			{
				icon: <Heart />,
				value: "24/7",
				label: "Support Available",
			},
		],
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
			{/* Hero Section */}
			<section className="py-20 md:py-32">
				<div className="max-w-6xl mx-auto px-6">
					<div className="text-center mb-16">
						<span className="text-blue-600 font-medium mb-4 flex items-center justify-center gap-2">
							<Zap className="w-4 h-4" />
							DISCOVER OUR STORY
						</span>
						<h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
							About <span className="text-blue-600">Financbase</span>
						</h1>
						<div className="w-24 h-1 bg-blue-600 mx-auto" />
						<p className="text-xl text-gray-600 dark:text-gray-300 mt-8 max-w-3xl mx-auto">
							Empowering businesses with intelligent financial management
							through cutting-edge AI technology and user-centric design.
						</p>
					</div>

					{/* Hero Image */}
					<div className="relative mb-16">
						<div className="relative rounded-2xl overflow-hidden shadow-2xl">
							<Image
								src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop"
								alt="Financial dashboard"
								width={1200}
								height={600}
								className="w-full h-[400px] md:h-[500px] object-cover"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
							<div className="absolute bottom-6 left-6 text-white">
								<h3 className="text-2xl font-bold mb-2">
									Transforming Finance with AI
								</h3>
								<p className="text-white/90">
									Real-time insights, intelligent automation, and data-driven
									decisions
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Mission Section */}
			<section className="py-20 bg-white dark:bg-gray-900">
				<div className="max-w-6xl mx-auto px-6">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
							Our Mission
						</h2>
						<p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
							To democratize access to sophisticated financial intelligence,
							making it possible for businesses of all sizes to make data-driven
							decisions that drive growth and success.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{data.values.map((value) => (
							<div key={value.title} className="group">
								<Card className="h-full p-6 hover:shadow-lg transition-all duration-300">
									<CardContent className="p-0">
										<div className="flex items-center gap-3 mb-4">
											<div className="text-blue-600 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg transition-colors duration-300 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30">
												<Target className="w-6 h-6" />
											</div>
											<h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors duration-300">
												{value.title}
											</h3>
										</div>
										<p className="text-gray-600 dark:text-gray-400 leading-relaxed">
											{value.description}
										</p>
									</CardContent>
								</Card>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="py-20">
				<div className="max-w-6xl mx-auto px-6">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
							Our Impact
						</h2>
						<p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
							Numbers that speak to our commitment and success
						</p>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
						{data.stats.map((stat) => (
							<div key={stat.label} className="text-center group">
								<Card className="h-full p-6 hover:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm">
									<CardContent className="p-0">
										<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors duration-300">
											{stat.icon}
										</div>
										<div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
											{stat.value}
										</div>
										<p className="text-gray-600 dark:text-gray-400 text-sm">
											{stat.label}
										</p>
										<div className="w-10 h-0.5 bg-blue-600 mx-auto mt-3 group-hover:w-16 transition-all duration-300" />
									</CardContent>
								</Card>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 bg-blue-600">
				<div className="max-w-4xl mx-auto px-6 text-center">
					<h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
						Join the Financbase Community
					</h2>
					<p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
						Start your journey towards smarter financial management today.
						Experience the power of AI-driven insights.
					</p>
					<Button
						asChild
						size="lg"
						className="bg-white text-blue-600 hover:bg-gray-100"
					>
						<Link href="/auth/sign-up" className="flex items-center gap-2">
							Get Started Free
							<ArrowRight className="w-4 h-4" />
						</Link>
					</Button>
				</div>
			</section>
		</div>
	);
}
