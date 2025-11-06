/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { PublicPageTemplate } from "@/components/layout/public-templates";
import { PublicSection, PublicCard, PublicGrid } from "@/components/layout/public-section";
import { CompanyTimeline } from "@/components/ui/company-timeline";
import { CompanyLogos } from "@/components/ui/company-logos";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import {
	Building2,
	Heart,
	Shield,
	Star,
	Target,
	TrendingUp,
	Users,
	Zap,
	Brain,
	Sparkles,
	Globe,
} from "lucide-react";
import {
	timelineData,
	companyStory,
	partnerLogos,
	values,
	testimonials,
	innovations,
} from "./data";

// Create icon components for stats
const stats = [
	{
		icon: <Building2 className="w-6 h-6" />,
		value: "10,000+",
		label: "Active Businesses",
	},
	{
		icon: <TrendingUp className="w-6 h-6" />,
		value: "$2B+",
		label: "Financial Data Processed",
	},
	{ icon: <Shield className="w-6 h-6" />, value: "99.9%", label: "Uptime" },
	{
		icon: <Heart className="w-6 h-6" />,
		value: "24/7",
		label: "Expert Support",
	},
];

// Animation variants
const fadeInUp = {
	hidden: { opacity: 0, y: 30 },
	visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
};

export default function AboutPage() {

	const storyRef = useRef<HTMLDivElement>(null);
	const innovationsRef = useRef<HTMLDivElement>(null);
	const missionRef = useRef<HTMLDivElement>(null);
	const testimonialsRef = useRef<HTMLDivElement>(null);
	const statsRef = useRef<HTMLDivElement>(null);

	const storyInView = useInView(storyRef, { once: true, margin: "-100px" });
	const innovationsInView = useInView(innovationsRef, {
		once: true,
		margin: "-100px",
	});
	const missionInView = useInView(missionRef, { once: true, margin: "-100px" });
	const testimonialsInView = useInView(testimonialsRef, {
		once: true,
		margin: "-100px",
	});
	const statsInView = useInView(statsRef, { once: true, margin: "-100px" });

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
			{/* Company Story Section */}
			<PublicSection
				ref={storyRef}
				title={companyStory.title}
				description={companyStory.subtitle}
				padding="lg"
			>
				<motion.div
					initial="hidden"
					animate={storyInView ? "visible" : "hidden"}
					variants={staggerContainer}
					className="grid md:grid-cols-2 gap-8 md:gap-12 items-center"
				>
					<motion.div
						variants={fadeInUp}
						className="order-2 md:order-1"
					>
						{companyStory.image && (
							<div className="relative rounded-xl overflow-hidden shadow-lg">
								<Image
									src={companyStory.image.src}
									alt={companyStory.image.alt}
									width={800}
									height={600}
									className="w-full h-auto object-cover"
									priority
								/>
							</div>
						)}
					</motion.div>
					<motion.div
						variants={fadeInUp}
						className="order-1 md:order-2 space-y-6"
					>
						{companyStory.content.map((paragraph, index) => (
							<p
								key={index}
								className="text-base md:text-lg text-muted-foreground leading-relaxed"
							>
								{paragraph}
							</p>
						))}
					</motion.div>
				</motion.div>
			</PublicSection>

			{/* Timeline Section */}
			<PublicSection
				title="Our Journey"
				description="From a simple idea to a global platform serving thousands of teams worldwide. Follow our story of innovation, growth, and the amazing people who made it possible."
				background="muted"
				padding="lg"
			>
				<CompanyTimeline items={timelineData} />
			</PublicSection>

			{/* Partners/Logos Section */}
			<CompanyLogos
				logos={partnerLogos}
				title="Valued by clients worldwide"
				description="Trusted by leading companies across industries"
			/>

			{/* Innovations Section */}
			<PublicSection
				ref={innovationsRef}
				title="Our AI Innovations"
				description="Pioneering the future of Finance AI with cutting-edge technology and a commitment to accessibility"
				background="accent"
			>
				<motion.div
					initial="hidden"
					animate={innovationsInView ? "visible" : "hidden"}
					variants={staggerContainer}
				>
					<PublicGrid columns={3}>
						{innovations.map((innovation, index) => {
							const icons = [Brain, Sparkles, Globe];
							const IconComponent = icons[index] || Brain;
							return (
								<motion.div key={innovation.title} variants={fadeInUp}>
									<PublicCard className="h-full">
										<div className="text-center">
											<div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground transition-transform duration-300 hover:scale-110">
												<IconComponent className="w-8 h-8" />
											</div>
											<h3 className="text-xl font-semibold text-foreground mb-4">
												{innovation.title}
											</h3>
											<p className="text-muted-foreground mb-6">
												{innovation.description}
											</p>
											{innovation.features && (
												<ul className="text-left space-y-2">
													{innovation.features.map((feature, featureIndex) => (
														<li
															key={featureIndex}
															className="text-sm text-muted-foreground flex items-start gap-2"
														>
															<span className="text-primary mt-1">•</span>
															<span>{feature}</span>
														</li>
													))}
												</ul>
											)}
										</div>
									</PublicCard>
								</motion.div>
							);
						})}
					</PublicGrid>
				</motion.div>
			</PublicSection>

			{/* Mission Section */}
			<PublicSection
				ref={missionRef}
				title="Our Mission"
				description="To provide businesses with the financial intelligence they need to thrive in an increasingly complex world."
			>
				<motion.div
					initial="hidden"
					animate={missionInView ? "visible" : "hidden"}
					variants={staggerContainer}
				>
					<PublicGrid columns={3}>
						{values.map((value, index) => (
							<motion.div key={value.title} variants={fadeInUp}>
								<PublicCard className="h-full">
									<div className="text-center">
										<div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground transition-transform duration-300 hover:scale-110">
											{index === 0 && <Zap className="w-8 h-8" />}
											{index === 1 && <Users className="w-8 h-8" />}
											{index === 2 && <Target className="w-8 h-8" />}
										</div>
										<h3 className="text-xl font-semibold text-foreground mb-4">
											{value.title}
										</h3>
										<p className="text-muted-foreground">
											{value.description}
										</p>
									</div>
								</PublicCard>
							</motion.div>
						))}
					</PublicGrid>
				</motion.div>
			</PublicSection>

			{/* Testimonials Section */}
			<PublicSection
				ref={testimonialsRef}
				title="What Our Customers Say"
				description="Join thousands of businesses who trust Financbase for their financial management needs."
				background="muted"
			>
				<motion.div
					initial="hidden"
					animate={testimonialsInView ? "visible" : "hidden"}
					variants={staggerContainer}
				>
					<PublicGrid columns={3}>
						{testimonials.map((testimonial) => (
							<motion.div
								key={`${testimonial.name}-${testimonial.company}`}
								variants={fadeInUp}
							>
								<PublicCard className="h-full">
									<div className="flex items-center gap-1 mb-4">
										{[...Array(testimonial.rating)].map((_, starIndex) => (
											<Star
												key={`${testimonial.name}-${testimonial.company}-star-${starIndex}`}
												className="w-5 h-5 fill-yellow-400 text-yellow-400"
											/>
										))}
									</div>
									<p className="text-muted-foreground mb-6 italic">
										"{testimonial.content}"
									</p>
									<div className="flex items-center gap-3">
										<div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
											{testimonial.avatar}
										</div>
										<div>
											<p className="font-semibold text-foreground">
												{testimonial.name}
											</p>
											<p className="text-sm text-muted-foreground">
												{testimonial.role}, {testimonial.company}
											</p>
										</div>
									</div>
								</PublicCard>
							</motion.div>
						))}
					</PublicGrid>
				</motion.div>
			</PublicSection>

			{/* Stats Section */}
			<PublicSection
				ref={statsRef}
				title="By the Numbers"
				description="Trusted by businesses worldwide for reliable financial management solutions."
			>
				<motion.div
					initial="hidden"
					animate={statsInView ? "visible" : "hidden"}
					variants={staggerContainer}
				>
					<PublicGrid columns={4}>
						{stats.map((stat, index) => (
							<motion.div
								key={stat.label}
								variants={fadeInUp}
							>
								<PublicCard className="text-center group h-full">
									<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
										{stat.icon}
									</div>
									<motion.div
										className="text-3xl font-bold text-foreground mb-2"
										initial={{ opacity: 0, scale: 0.5 }}
										animate={
											statsInView
												? { opacity: 1, scale: 1 }
												: { opacity: 0, scale: 0.5 }
										}
										transition={{
											delay: index * 0.1 + 0.3,
											duration: 0.5,
											type: "spring",
										}}
									>
										{stat.value}
									</motion.div>
									<p className="text-muted-foreground text-sm">
										{stat.label}
									</p>
									<div className="w-10 h-0.5 bg-primary mx-auto mt-3 group-hover:w-16 transition-all duration-300" />
								</PublicCard>
							</motion.div>
						))}
					</PublicGrid>
				</motion.div>
			</PublicSection>
		</PublicPageTemplate>
	);
}
