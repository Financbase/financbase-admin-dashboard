/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, type Variants } from "framer-motion";
import {
	AlertCircle,
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
import { useQuery } from "@tanstack/react-query";
import { GuideCard, type Guide } from "@/components/guides/guide-card";
import { GuideCardSkeleton } from "@/components/guides/guide-card-skeleton";
import { GuideFilters, type SortOption } from "@/components/guides/guide-filters";
import { PublicHero } from "@/components/layout/public-hero";
import { PublicCTA } from "@/components/layout/public-form";

export default function GuidesPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [sortBy, setSortBy] = useState<SortOption>("popular");

	const containerVariants: Variants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.2,
				delayChildren: 0.3,
			},
		},
	};

	const itemVariants: Variants = {
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

	// Fetch all guides from API
	const { data: guidesData, isLoading: guidesLoading, error: guidesError } = useQuery({
		queryKey: ['guides', selectedCategory, searchTerm, sortBy],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (selectedCategory !== 'all') {
				params.append('category', selectedCategory);
			}
			if (searchTerm) {
				params.append('search', searchTerm);
			}
			params.append('sort', sortBy);
			params.append('limit', '100'); // Get all guides for client-side filtering if needed

			const response = await fetch(`/api/guides?${params.toString()}`);
			if (!response.ok) {
				throw new Error('Failed to fetch guides');
			}
			const data = await response.json();
			return data.data;
		},
		retry: 2,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// Fetch featured guides
	const { data: featuredData, isLoading: featuredLoading } = useQuery({
		queryKey: ['guides', 'featured'],
		queryFn: async () => {
			const response = await fetch('/api/guides?featured=true&limit=2&sort=popular');
			if (!response.ok) {
				throw new Error('Failed to fetch featured guides');
			}
			const data = await response.json();
			return data.data.guides;
		},
		retry: 2,
		staleTime: 5 * 60 * 1000,
	});

	// Transform API guides to match Guide interface
	const guides: Guide[] = useMemo(() => {
		if (!guidesData?.guides) return [];
		return guidesData.guides.map((guide: any) => ({
			id: guide.id,
			title: guide.title,
			description: guide.description || guide.excerpt || '',
			category: guide.category,
			type: guide.type,
			duration: guide.duration || 'N/A',
			difficulty: guide.difficulty,
			author: guide.author?.name || 'Unknown Author',
			rating: guide.rating ? guide.rating / 10 : 0, // Convert from integer * 10 to decimal
			views: guide.viewCount || 0,
			image: guide.imageUrl || guide.thumbnailUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
			tags: Array.isArray(guide.tags) ? guide.tags : [],
			icon: guide.type === 'tutorial' ? <Play className="w-4 h-4" /> :
				guide.type === 'documentation' ? <FileText className="w-4 h-4" /> :
				<BookOpen className="w-4 h-4" />,
		}));
	}, [guidesData]);

	const featuredGuides: Guide[] = useMemo(() => {
		if (!featuredData) return [];
		return featuredData.map((guide: any) => ({
			id: guide.id,
			title: guide.title,
			description: guide.description || guide.excerpt || '',
			category: guide.category || 'getting-started',
			type: guide.type || 'tutorial',
			duration: guide.duration || '30 min',
			difficulty: guide.difficulty || 'beginner',
			author: guide.author?.name || 'Financbase Team',
			rating: guide.rating ? guide.rating / 10 : 4.9,
			views: guide.viewCount || 0,
			image: guide.imageUrl || guide.thumbnailUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=300&fit=crop',
			tags: Array.isArray(guide.tags) ? guide.tags : ['featured', 'popular'],
			icon: <Video className="w-5 h-5" />,
		}));
	}, [featuredData]);

	// Guides are already filtered and sorted by the API, but we can do additional client-side filtering if needed
	const filteredAndSortedGuides = useMemo(() => {
		// API already handles filtering, but we can add additional client-side filtering here if needed
		// For now, just return the guides from API
		return guides;
	}, [guides]);

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
						<h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
							Featured Guides
						</h2>
						<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
							Start with these popular guides to get the most out of Financbase
						</p>
					</motion.div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{featuredLoading
							? Array.from({ length: 2 }).map((_, i) => (
									<GuideCardSkeleton key={i} variant="featured" />
								))
							: featuredGuides.length > 0
							? featuredGuides.map((guide, index) => (
									<GuideCard
										key={guide.id}
										guide={guide}
										index={index}
										variant="featured"
									/>
								))
							: (
								<div className="col-span-2 text-center py-12 text-muted-foreground">
									<p>No featured guides available</p>
								</div>
							)}
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
						<h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
							All Guides
						</h2>
						<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
							Browse our complete library of guides and tutorials
						</p>
					</motion.div>

					{guidesLoading ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{Array.from({ length: 6 }).map((_, i) => (
								<GuideCardSkeleton key={i} />
							))}
						</div>
					) : guidesError ? (
						<motion.div
							className="text-center py-12"
							variants={itemVariants}
							role="status"
							aria-live="polite"
						>
							<AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
							<h3 className="text-xl font-semibold text-foreground mb-2">
								Error loading guides
							</h3>
							<p className="text-muted-foreground mb-4">
								{guidesError instanceof Error ? guidesError.message : 'Failed to load guides. Please try again later.'}
							</p>
							<Button
								variant="outline"
								onClick={() => window.location.reload()}
							>
								Retry
							</Button>
						</motion.div>
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
								className="w-16 h-16 text-muted-foreground mx-auto mb-4"
								aria-hidden="true"
							/>
							<h3 className="text-xl font-semibold text-foreground mb-2">
								No guides found
							</h3>
							<p className="text-muted-foreground mb-4">
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
