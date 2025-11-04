"use client";

import { PublicPageTemplate } from "@/components/layout/public-templates";
import { PublicSection, PublicCard, PublicGrid } from "@/components/layout/public-section";
import {
	BookOpen,
	Video,
	Users,
	Clock,
	CheckCircle2,
	ArrowRight,
	GraduationCap,
	Target,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TrainingPage() {
	const trainingPrograms = [
		{
			icon: <Zap className="w-8 h-8" />,
			title: "Getting Started",
			duration: "15 minutes",
			difficulty: "Beginner",
			description: "Quick introduction to Financbase for new users",
			topics: ["Account setup", "Basic navigation", "First steps"],
			href: "/docs/user-training/getting-started",
		},
		{
			icon: <Target className="w-8 h-8" />,
			title: "Dashboard Training",
			duration: "20 minutes",
			difficulty: "Beginner",
			description: "Learn to navigate and use your financial dashboard",
			topics: ["Dashboard overview", "Key metrics", "Charts and visualizations"],
			href: "/docs/user-training/dashboard-training",
		},
		{
			icon: <BookOpen className="w-8 h-8" />,
			title: "Invoice Management",
			duration: "20 minutes",
			difficulty: "Intermediate",
			description: "Master invoice creation, management, and workflows",
			topics: ["Creating invoices", "Managing invoices", "Invoice workflows"],
			href: "/docs/user-training/invoice-training",
		},
		{
			icon: <Users className="w-8 h-8" />,
			title: "Expense Tracking",
			duration: "20 minutes",
			difficulty: "Intermediate",
			description: "Learn to track and manage expenses effectively",
			topics: ["Recording expenses", "Expense categories", "Expense reports"],
			href: "/docs/user-training/expense-training",
		},
		{
			icon: <GraduationCap className="w-8 h-8" />,
			title: "Advanced Features",
			duration: "25 minutes",
			difficulty: "Advanced",
			description: "Explore workflows, automation, and integrations",
			topics: ["Workflows and automation", "Integrations", "Custom dashboards"],
			href: "/docs/user-training/advanced-features-training",
		},
		{
			icon: <Video className="w-8 h-8" />,
			title: "AI Assistant",
			duration: "15 minutes",
			difficulty: "Intermediate",
			description: "Leverage AI-powered financial insights and recommendations",
			topics: ["Using Financbase GPT", "Financial insights", "Recommendations"],
			href: "/docs/user-training/ai-assistant-training",
		},
	];

	const learningPaths = [
		{
			title: "Business Owner",
			description: "Focus on dashboard, invoices, and reports",
			duration: "1.5 hours",
			programs: ["Getting Started", "Dashboard Training", "Invoice Management", "Reports"],
			icon: <Users className="w-6 h-6" />,
		},
		{
			title: "Accountant",
			description: "Complete training for all features",
			duration: "3 hours",
			programs: ["All training programs", "Advanced reporting", "API integration"],
			icon: <GraduationCap className="w-6 h-6" />,
		},
		{
			title: "Team Member",
			description: "Basic features and collaboration",
			duration: "1 hour",
			programs: ["Getting Started", "Dashboard Training", "Expense Tracking"],
			icon: <Target className="w-6 h-6" />,
		},
	];

	const benefits = [
		"Self-paced learning at your own speed",
		"Step-by-step guides with screenshots",
		"Comprehensive training materials",
		"Role-based learning paths",
		"Video tutorials for visual learners",
		"Troubleshooting guides and support",
	];

	return (
		<PublicPageTemplate
			hero={{
				title: "Training Programs",
				description: "Comprehensive training materials to help you and your team master Financbase. From beginner guides to advanced features, we've got you covered.",
				primaryAction: {
					text: "Start Learning",
					href: "#programs",
				},
				secondaryAction: {
					text: "View Documentation",
					href: "/docs",
				},
			}}
			cta={{
				title: "Ready to Master Financbase?",
				description: "Start your training journey today and unlock the full potential of Financbase.",
				primaryAction: {
					text: "Browse Training Materials",
					href: "#programs",
				},
				secondaryAction: {
					text: "Get Support",
					href: "/support",
				},
			}}
		>
			{/* Training Programs Section */}
			<PublicSection
				id="programs"
				title="Training Programs"
				description="Choose from our comprehensive training programs designed for different skill levels and roles"
			>
				<PublicGrid columns={3}>
					{trainingPrograms.map((program) => (
						<PublicCard key={program.title} className="h-full">
							<div className="flex flex-col h-full">
								<div className="w-16 h-16 mb-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
									{program.icon}
								</div>
								<div className="flex items-center gap-2 mb-3">
									<h3 className="text-xl font-semibold text-gray-900 dark:text-white">
										{program.title}
									</h3>
								</div>
								<div className="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
									<span className="flex items-center gap-1">
										<Clock className="w-4 h-4" />
										{program.duration}
									</span>
									<span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
										{program.difficulty}
									</span>
								</div>
								<p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
									{program.description}
								</p>
								<div className="mb-4">
									<p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Topics covered:
									</p>
									<ul className="space-y-1">
										{program.topics.map((topic, index) => (
											<li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
												<CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
												{topic}
											</li>
										))}
									</ul>
								</div>
								<Link href={program.href}>
									<Button className="w-full mt-auto">
										Start Training
										<ArrowRight className="w-4 h-4 ml-2" />
									</Button>
								</Link>
							</div>
						</PublicCard>
					))}
				</PublicGrid>
			</PublicSection>

			{/* Learning Paths Section */}
			<PublicSection
				title="Learning Paths by Role"
				description="Structured learning paths designed for specific roles and responsibilities"
				background="muted"
			>
				<PublicGrid columns={3}>
					{learningPaths.map((path) => (
						<PublicCard key={path.title} className="h-full">
							<div className="flex flex-col h-full">
								<div className="w-16 h-16 mb-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
									{path.icon}
								</div>
								<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
									{path.title}
								</h3>
								<p className="text-gray-600 dark:text-gray-400 mb-4">
									{path.description}
								</p>
								<div className="mb-4">
									<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
										Duration: {path.duration}
									</span>
								</div>
								<div className="mb-4">
									<p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Includes:
									</p>
									<ul className="space-y-1">
										{path.programs.map((program, index) => (
											<li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
												<CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
												{program}
											</li>
										))}
									</ul>
								</div>
								<Link href="/docs/user-training">
									<Button variant="outline" className="w-full mt-auto">
										View Full Path
										<ArrowRight className="w-4 h-4 ml-2" />
									</Button>
								</Link>
							</div>
						</PublicCard>
					))}
				</PublicGrid>
			</PublicSection>

			{/* Benefits Section */}
			<PublicSection
				title="Why Choose Our Training Programs"
				description="Comprehensive, accessible, and designed for success"
			>
				<PublicGrid columns={3}>
					{benefits.map((benefit, index) => (
						<PublicCard key={index}>
							<div className="flex items-start space-x-3">
								<CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
								<p className="text-gray-700 dark:text-gray-300 font-medium">
									{benefit}
								</p>
							</div>
						</PublicCard>
					))}
				</PublicGrid>
			</PublicSection>

			{/* Resources Section */}
			<PublicSection
				title="Additional Resources"
				description="Explore more learning materials and support options"
				background="muted"
			>
				<PublicGrid columns={3}>
					<PublicCard>
						<div className="flex flex-col items-center text-center">
							<Video className="w-12 h-12 text-primary mb-4" />
							<h3 className="text-lg font-semibold mb-2">Video Tutorials</h3>
							<p className="text-gray-600 dark:text-gray-400 mb-4">
								Watch step-by-step video tutorials for visual learners
							</p>
							<Link href="/docs/video-tutorials">
								<Button variant="outline">
									Watch Videos
									<ArrowRight className="w-4 h-4 ml-2" />
								</Button>
							</Link>
						</div>
					</PublicCard>

					<PublicCard>
						<div className="flex flex-col items-center text-center">
							<BookOpen className="w-12 h-12 text-primary mb-4" />
							<h3 className="text-lg font-semibold mb-2">User Guides</h3>
							<p className="text-gray-600 dark:text-gray-400 mb-4">
								Comprehensive guides for getting started and workflows
							</p>
							<Link href="/docs/user-guides">
								<Button variant="outline">
									Read Guides
									<ArrowRight className="w-4 h-4 ml-2" />
								</Button>
							</Link>
						</div>
					</PublicCard>

					<PublicCard>
						<div className="flex flex-col items-center text-center">
							<Users className="w-12 h-12 text-primary mb-4" />
							<h3 className="text-lg font-semibold mb-2">Get Support</h3>
							<p className="text-gray-600 dark:text-gray-400 mb-4">
								Need help? Contact our support team for assistance
							</p>
							<Link href="/support">
								<Button variant="outline">
									Contact Support
									<ArrowRight className="w-4 h-4 ml-2" />
								</Button>
							</Link>
						</div>
					</PublicCard>
				</PublicGrid>
			</PublicSection>
		</PublicPageTemplate>
	);
}

