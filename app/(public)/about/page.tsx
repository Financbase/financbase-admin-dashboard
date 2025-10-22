import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	ArrowRight,
	Building2,
	Heart,
	Shield,
	Star,
	Target,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react";
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
				label: "Expert Support",
			},
		],
		testimonials: [
			{
				name: "Sarah Johnson",
				role: "CEO",
				company: "TechStart Inc.",
				content:
					"Financbase transformed how we manage our finances. The AI insights are incredible and have helped us make better decisions faster.",
				avatar: "SJ",
				rating: 5,
			},
			{
				name: "Mike Chen",
				role: "CFO",
				company: "GrowthCorp",
				content:
					"Finally, a financial platform that actually understands our business needs. The automation features saved us countless hours.",
				avatar: "MC",
				rating: 5,
			},
			{
				name: "Emily Davis",
				role: "Founder",
				company: "StartupHub",
				content:
					"The real-time analytics helped us identify opportunities we never knew existed. Our revenue increased by 30% in just 6 months.",
				avatar: "ED",
				rating: 5,
			},
		],
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
				<div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
				<div className="max-w-6xl mx-auto px-6 relative">
					<div className="text-center text-white">
						<h1 className="text-4xl md:text-6xl font-bold mb-6">
							About Financbase
						</h1>
						<p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
							We're on a mission to democratize financial intelligence and empower
							businesses of all sizes to make smarter financial decisions.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button
								asChild
								size="lg"
								className="bg-white text-blue-600 hover:bg-gray-100"
							>
								<Link href="/auth/sign-up">Start Free Trial</Link>
							</Button>
							<Button
								asChild
								size="lg"
								className="border-white text-white hover:bg-white hover:text-blue-600"
							>
								<Link href="/contact">Contact Sales</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* Mission Section */}
			<section className="py-20">
				<div className="max-w-6xl mx-auto px-6">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
							Our Mission
						</h2>
						<p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
							To provide businesses with the financial intelligence they need to
							thrive in an increasingly complex world.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{data.values.map((value, index) => (
							<Card
								key={value.title}
								className="p-8 text-center hover:shadow-lg transition-all duration-300 bg-card border"
							>
								<CardContent className="p-0">
									<div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
										{index === 0 && <Zap className="w-8 h-8" />}
										{index === 1 && <Users className="w-8 h-8" />}
										{index === 2 && <Target className="w-8 h-8" />}
									</div>
									<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
										{value.title}
									</h3>
									<p className="text-gray-600 dark:text-gray-400">
										{value.description}
									</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Testimonials Section */}
			<section className="py-20 bg-muted/30">
				<div className="max-w-6xl mx-auto px-6">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
							What Our Customers Say
						</h2>
						<p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
							Join thousands of businesses who trust Financbase for their financial
							management needs.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{data.testimonials.map((testimonial) => (
							<Card
								key={`${testimonial.name}-${testimonial.company}`}
								className="p-8 hover:shadow-lg transition-all duration-300 bg-card border"
							>
								<CardContent className="p-0">
									<div className="flex items-center gap-1 mb-4">
										{[...Array(testimonial.rating)].map((_, starIndex) => (
											<Star
												key={`${testimonial.name}-${testimonial.company}-star-${starIndex}`}
												className="w-5 h-5 fill-yellow-400 text-yellow-400"
											/>
										))}
									</div>
									<p className="text-gray-600 dark:text-gray-400 mb-6 italic">
										"{testimonial.content}"
									</p>
									<div className="flex items-center gap-3">
										<div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
											{testimonial.avatar}
										</div>
										<div>
											<p className="font-semibold text-gray-900 dark:text-white">
												{testimonial.name}
											</p>
											<p className="text-sm text-gray-600 dark:text-gray-400">
												{testimonial.role}, {testimonial.company}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="py-20">
				<div className="max-w-6xl mx-auto px-6">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
							By the Numbers
						</h2>
						<p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
							Trusted by businesses worldwide for reliable financial management
							solutions.
						</p>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
						{data.stats.map((stat) => (
							<div key={stat.label} className="text-center group">
								<Card className="h-full p-6 hover:shadow-lg transition-all duration-300 bg-card border">
									<CardContent className="p-0">
										<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors duration-300">
											{stat.icon}
										</div>
										<div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
											{stat.value}
										</div>
										<p className="text-gray-600 dark:text-gray-400 text-sm">
											{stat.label}
										</p>
										<div className="w-10 h-0.5 bg-primary mx-auto mt-3 group-hover:w-16 transition-all duration-300" />
									</CardContent>
								</Card>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
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
