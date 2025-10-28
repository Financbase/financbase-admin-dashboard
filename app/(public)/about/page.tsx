import { PublicPageTemplate } from "@/components/layout/public-templates";
import { PublicSection, PublicCard, PublicGrid } from "@/components/layout/public-section";
import {
	Building2,
	Heart,
	Shield,
	Star,
	Target,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react";

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
		<PublicPageTemplate
			hero={{
				title: "About Financbase",
				description: "We're on a mission to democratize financial intelligence and empower businesses of all sizes to make smarter financial decisions.",
				primaryAction: {
					text: "Start Free Trial",
					href: "/auth/sign-up",
				},
				secondaryAction: {
					text: "Contact Sales",
					href: "/contact",
				},
			}}
			cta={{
				title: "Join the Financbase Community",
				description: "Start your journey towards smarter financial management today. Experience the power of AI-driven insights.",
				primaryAction: {
					text: "Get Started Free",
					href: "/auth/sign-up",
				},
			}}
		>
			{/* Mission Section */}
			<PublicSection
				title="Our Mission"
				description="To provide businesses with the financial intelligence they need to thrive in an increasingly complex world."
			>
				<PublicGrid columns={3}>
					{data.values.map((value, index) => (
						<PublicCard key={value.title}>
							<div className="text-center">
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
							</div>
						</PublicCard>
					))}
				</PublicGrid>
			</PublicSection>

			{/* Testimonials Section */}
			<PublicSection
				title="What Our Customers Say"
				description="Join thousands of businesses who trust Financbase for their financial management needs."
				background="muted"
			>
				<PublicGrid columns={3}>
					{data.testimonials.map((testimonial) => (
						<PublicCard key={`${testimonial.name}-${testimonial.company}`}>
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
						</PublicCard>
					))}
				</PublicGrid>
			</PublicSection>

			{/* Stats Section */}
			<PublicSection
				title="By the Numbers"
				description="Trusted by businesses worldwide for reliable financial management solutions."
			>
				<PublicGrid columns={4}>
					{data.stats.map((stat) => (
						<PublicCard key={stat.label} className="text-center group">
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
						</PublicCard>
					))}
				</PublicGrid>
			</PublicSection>
		</PublicPageTemplate>
	);
}
