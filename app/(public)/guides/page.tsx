"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
	BarChart3,
	BookOpen,
	Code,
	FileText,
	Globe,
	HelpCircle,
	Play,
	Search,
	Shield,
	Sparkles,
	Target,
	Video,
	Zap,
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { GuideCard, type Guide } from "@/components/guides/guide-card";
import { GuideCardSkeleton } from "@/components/guides/guide-card-skeleton";
import { GuideFilters, type SortOption } from "@/components/guides/guide-filters";
import { PublicHero } from "@/components/layout/public-hero";
import { PublicCTA } from "@/components/layout/public-form";

export default function GuidesPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [sortBy, setSortBy] = useState<SortOption>("popular");
	const [isLoading] = useState(false); // For future loading states

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

	const categories = [
		{
			id: "all",
			name: "All Guides",
			icon: <BookOpen className="w-4 h-4" />,
			count: 24,
		},
		{
			id: "getting-started",
			name: "Getting Started",
			icon: <Zap className="w-4 h-4" />,
			count: 8,
		},
		{
			id: "advanced",
			name: "Advanced",
			icon: <Target className="w-4 h-4" />,
			count: 6,
		},
		{
			id: "integrations",
			name: "Integrations",
			icon: <Globe className="w-4 h-4" />,
			count: 5,
		},
		{
			id: "api",
			name: "API Reference",
			icon: <Code className="w-4 h-4" />,
			count: 3,
		},
		{
			id: "troubleshooting",
			name: "Troubleshooting",
			icon: <Shield className="w-4 h-4" />,
			count: 2,
		},
	];

	const guides: Guide[] = [
		{
			id: 1,
			title: "Getting Started with Financbase",
			description:
				"Learn the basics of setting up your account and navigating the platform",
			category: "getting-started",
			type: "tutorial",
			duration: "15 min",
			difficulty: "beginner",
			author: "Sarah Johnson",
			rating: 4.9,
			views: 1250,
			image:
				"https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
			tags: ["setup", "basics", "onboarding"],
			icon: <Play className="w-4 h-4" />,
		},
		{
			id: 2,
			title: "Advanced Financial Analytics",
			description:
				"Deep dive into advanced analytics features and custom reporting",
			category: "advanced",
			type: "guide",
			duration: "45 min",
			difficulty: "intermediate",
			author: "Mike Chen",
			rating: 4.8,
			views: 890,
			image:
				"https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
			tags: ["analytics", "reporting", "data"],
			icon: <BarChart3 className="w-4 h-4" />,
		},
		{
			id: 3,
			title: "API Integration Guide",
			description:
				"Complete guide to integrating Financbase with your existing systems",
			category: "integrations",
			type: "documentation",
			duration: "30 min",
			difficulty: "advanced",
			author: "Alex Rodriguez",
			rating: 4.7,
			views: 650,
			image:
				"https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
			tags: ["api", "integration", "development"],
			icon: <Code className="w-4 h-4" />,
		},
		{
			id: 4,
			title: "Setting Up Automated Reports",
			description:
				"Configure automated financial reports and email notifications",
			category: "getting-started",
			type: "tutorial",
			duration: "20 min",
			difficulty: "beginner",
			author: "Emma Wilson",
			rating: 4.9,
			views: 1100,
			image:
				"https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
			tags: ["automation", "reports", "email"],
			icon: <FileText className="w-4 h-4" />,
		},
		{
			id: 5,
			title: "Troubleshooting Common Issues",
			description: "Solutions to the most common problems users encounter",
			category: "troubleshooting",
			type: "guide",
			duration: "25 min",
			difficulty: "intermediate",
			author: "Support Team",
			rating: 4.6,
			views: 750,
			image:
				"https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
			tags: ["troubleshooting", "support", "issues"],
			icon: <Shield className="w-4 h-4" />,
		},
		{
			id: 6,
			title: "Advanced Data Visualization",
			description:
				"Create stunning charts and dashboards with custom visualizations",
			category: "advanced",
			type: "tutorial",
			duration: "40 min",
			difficulty: "advanced",
			author: "David Kim",
			rating: 4.8,
			views: 520,
			image:
				"https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
			tags: ["visualization", "charts", "dashboards"],
			icon: <BarChart3 className="w-4 h-4" />,
		},
	];

	const featuredGuides = [
		{
			title: "Complete Platform Overview",
			description: "Master Financbase in 30 minutes",
			duration: "30 min",
			difficulty: "beginner",
			views: 2500,
			image:
				"https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=300&fit=crop",
		},
		{
			title: "AI-Powered Financial Insights",
			description: "Leverage artificial intelligence for better decisions",
			duration: "25 min",
			difficulty: "intermediate",
			views: 1800,
			image:
				"https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=300&fit=crop",
		},
	];

	// Memoized filtered and sorted guides
	const filteredAndSortedGuides = useMemo(() => {
		let filtered = guides.filter((guide) => {
			const matchesSearch =
				guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				guide.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
				guide.tags.some((tag) =>
					tag.toLowerCase().includes(searchTerm.toLowerCase()),
				);
			const matchesCategory =
				selectedCategory === "all" || guide.category === selectedCategory;
			return matchesSearch && matchesCategory;
		});

		// Sort guides
		filtered = [...filtered].sort((a, b) => {
			switch (sortBy) {
				case "popular":
					return b.views - a.views;
				case "rating":
					return b.rating - a.rating;
				case "difficulty":
					const difficultyOrder: Record<"beginner" | "intermediate" | "advanced", number> = { beginner: 0, intermediate: 1, advanced: 2 };
					return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
				case "recent":
					// Assuming guides with higher IDs are more recent
					return b.id - a.id;
				default:
					return 0;
			}
		});

		return filtered;
	}, [guides, searchTerm, selectedCategory, sortBy]);

	const handleCategoryChange = useCallback((category: string) => {
		setSelectedCategory(category);
	}, []);

	const handleSortChange = useCallback((sort: SortOption) => {
		setSortBy(sort);
	}, []);

	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<PublicHero
				title="Knowledge Base"
				subtitle={
					<span className="flex items-center gap-2">
						<Sparkles className="w-4 h-4" />
						LEARNING CENTER
					</span>
				}
				description="Master Financbase with our comprehensive guides, tutorials, and documentation. From beginner basics to advanced features, we've got you covered."
				size="md"
			/>

			{/* Search and Filter Section */}
			<section className="py-12 bg-background border-b">
				<div className="max-w-6xl mx-auto px-6">
					<motion.div
						className="flex flex-col gap-6"
						initial="hidden"
						animate="visible"
						variants={containerVariants}
					>
						{/* Search Input */}
						<motion.div className="relative" variants={itemVariants}>
							<Search
								className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground"
								aria-hidden="true"
							/>
							<Input
								placeholder="Search guides, tutorials, and documentation..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10 pr-4 py-3 bg-background"
								aria-label="Search guides"
							/>
							{searchTerm && (
								<button
									onClick={() => setSearchTerm("")}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
									aria-label="Clear search"
								>
									×
								</button>
							)}
						</motion.div>

						{/* Filters */}
						<motion.div variants={itemVariants}>
							<GuideFilters
								categories={categories}
								selectedCategory={selectedCategory}
								onCategoryChange={handleCategoryChange}
								sortBy={sortBy}
								onSortChange={handleSortChange}
								resultsCount={filteredAndSortedGuides.length}
							/>
						</motion.div>
					</motion.div>
				</div>
			</section>

			{/* Featured Guides */}
			<motion.section
				className="py-20 bg-background"
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true }}
				variants={containerVariants}
			>
				<div className="max-w-6xl mx-auto px-6">
					<motion.div className="text-center mb-16" variants={itemVariants}>
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
							Featured Guides
						</h2>
						<p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
							Start with these popular guides to get the most out of Financbase
						</p>
					</motion.div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{isLoading
							? Array.from({ length: 2 }).map((_, i) => (
									<GuideCardSkeleton key={i} variant="featured" />
								))
							: featuredGuides.map((guide, index) => {
									const featuredGuide: Guide = {
										...guide,
										id: index + 100,
										category: "getting-started",
										type: "tutorial",
										difficulty: guide.difficulty as "beginner" | "intermediate" | "advanced",
										author: "Financbase Team",
										rating: 4.9,
										tags: ["featured", "popular"],
										icon: <Video className="w-5 h-5" />,
									};
									return (
										<GuideCard
											key={index}
											guide={featuredGuide}
											index={index}
											variant="featured"
										/>
									);
								})}
					</div>
				</div>
			</motion.section>

			{/* All Guides */}
			<motion.section
				className="py-20 bg-muted/30"
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true }}
				variants={containerVariants}
			>
				<div className="max-w-6xl mx-auto px-6">
					<motion.div className="text-center mb-16" variants={itemVariants}>
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
							All Guides
						</h2>
						<p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
							Browse our complete library of guides and tutorials
						</p>
					</motion.div>

					{isLoading ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{Array.from({ length: 6 }).map((_, i) => (
								<GuideCardSkeleton key={i} />
							))}
						</div>
					) : filteredAndSortedGuides.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{filteredAndSortedGuides.map((guide, index) => (
								<GuideCard
									key={guide.id}
									guide={guide}
									index={index}
								/>
							))}
						</div>
					) : (
						<motion.div
							className="text-center py-12"
							variants={itemVariants}
							role="status"
							aria-live="polite"
						>
							<BookOpen
								className="w-16 h-16 text-gray-400 mx-auto mb-4"
								aria-hidden="true"
							/>
							<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
								No guides found
							</h3>
							<p className="text-gray-600 dark:text-gray-400 mb-4">
								{searchTerm
									? `No results match "${searchTerm}". Try adjusting your search terms.`
									: selectedCategory !== "all"
										? `No guides found in this category. Try selecting a different category.`
										: "Try adjusting your search terms or filters"}
							</p>
							{searchTerm && (
								<Button
									variant="outline"
									onClick={() => setSearchTerm("")}
									className="mt-4"
								>
									Clear Search
								</Button>
							)}
						</motion.div>
					)}
				</div>
			</motion.section>

			{/* CTA Section */}
			<PublicCTA
				title="Can't find what you're looking for?"
				description="Our support team is here to help. Get personalized assistance with your specific questions."
				primaryAction={{
					text: "Contact Support",
					href: "/support",
				}}
				secondaryAction={{
					text: "Request a Guide",
					href: "/support#contact",
				}}
			/>
		</div>
	);
}
