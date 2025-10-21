"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
	ArrowRight,
	ArrowUp,
	BarChart3,
	BookOpen,
	CheckCircle,
	ChevronDown,
	Clock,
	Code,
	Database,
	Download,
	FileText,
	Filter,
	Globe,
	Headphones,
	HelpCircle,
	Image,
	Key,
	Play,
	Puzzle,
	Search,
	Shield,
	Sparkles,
	Star,
	Tag,
	Target,
	TrendingUp,
	User,
	Users,
	Video,
	Workflow,
	Zap,
} from "lucide-react";
import { useState } from "react";

export default function GuidesPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");

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

	const guides = [
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
			icon: <Play className="w-5 h-5" />,
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
			icon: <BarChart3 className="w-5 h-5" />,
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
			icon: <Code className="w-5 h-5" />,
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
			icon: <FileText className="w-5 h-5" />,
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
			icon: <Shield className="w-5 h-5" />,
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
			icon: <BarChart3 className="w-5 h-5" />,
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

	const filteredGuides = guides.filter((guide) => {
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

	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty) {
			case "beginner":
				return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
			case "intermediate":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
			case "advanced":
				return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
		}
	};

	const getTypeIcon = (type: string) => {
		switch (type) {
			case "tutorial":
				return <Play className="w-4 h-4" />;
			case "guide":
				return <BookOpen className="w-4 h-4" />;
			case "documentation":
				return <FileText className="w-4 h-4" />;
			default:
				return <BookOpen className="w-4 h-4" />;
		}
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
							LEARNING CENTER
						</motion.span>
						<h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
							Knowledge <span className="text-blue-600">Base</span>
						</h1>
						<motion.div
							className="w-24 h-1 bg-blue-600 mx-auto"
							initial={{ width: 0 }}
							animate={{ width: 96 }}
							transition={{ duration: 1, delay: 0.5 }}
						/>
						<p className="text-xl text-gray-600 dark:text-gray-300 mt-8 max-w-3xl mx-auto">
							Master Financbase with our comprehensive guides, tutorials, and
							documentation. From beginner basics to advanced features, we've
							got you covered.
						</p>
					</motion.div>

					{/* Search and Filter */}
					<motion.div
						className="flex flex-col md:flex-row gap-4 mb-16"
						variants={itemVariants}
					>
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
							<Input
								placeholder="Search guides, tutorials, and documentation..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
							/>
						</div>
						<div className="flex gap-2">
							{categories.slice(0, 4).map((category) => (
								<Button
									key={category.id}
									variant={
										selectedCategory === category.id ? "default" : "outline"
									}
									onClick={() => setSelectedCategory(category.id)}
									className="flex items-center gap-2"
								>
									{category.icon}
									{category.name}
									<Badge variant="secondary" className="ml-1">
										{category.count}
									</Badge>
								</Button>
							))}
						</div>
					</motion.div>
				</div>
			</motion.section>

			{/* Featured Guides */}
			<motion.section
				className="py-20"
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
						{featuredGuides.map((guide, index) => (
							<motion.div
								key={index}
								className="group"
								variants={itemVariants}
								whileHover={{ y: -5, transition: { duration: 0.2 } }}
							>
								<Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300">
									<div className="relative">
										<img
											src={guide.image}
											alt={guide.title}
											className="w-full h-48 object-cover"
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
										<div className="absolute bottom-4 left-4 text-white">
											<Badge className="bg-blue-600 text-white mb-2">
												Featured
											</Badge>
											<h3 className="text-xl font-bold mb-2">{guide.title}</h3>
											<p className="text-white/90 text-sm">
												{guide.description}
											</p>
										</div>
									</div>
									<CardContent className="p-6">
										<div className="flex items-center justify-between mb-4">
											<div className="flex items-center gap-4">
												<div className="flex items-center gap-1">
													<Clock className="w-4 h-4 text-gray-400" />
													<span className="text-sm text-gray-600 dark:text-gray-400">
														{guide.duration}
													</span>
												</div>
												<Badge className={getDifficultyColor(guide.difficulty)}>
													{guide.difficulty}
												</Badge>
											</div>
											<div className="flex items-center gap-1">
												<Star className="w-4 h-4 text-yellow-500 fill-current" />
												<span className="text-sm text-gray-600 dark:text-gray-400">
													{guide.views} views
												</span>
											</div>
										</div>
										<Button className="w-full group-hover:bg-blue-700 transition-colors">
											Start Learning
											<ArrowRight className="w-4 h-4 ml-2" />
										</Button>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>
				</div>
			</motion.section>

			{/* All Guides */}
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
							All Guides
						</h2>
						<p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
							Browse our complete library of guides and tutorials
						</p>
					</motion.div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{filteredGuides.map((guide, index) => (
							<motion.div
								key={guide.id}
								className="group"
								variants={itemVariants}
								whileHover={{ y: -5, transition: { duration: 0.2 } }}
							>
								<Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300">
									<div className="relative">
										<img
											src={guide.image}
											alt={guide.title}
											className="w-full h-40 object-cover"
										/>
										<div className="absolute top-4 left-4">
											<div className="flex items-center gap-2">
												<div className="bg-white/90 backdrop-blur-sm p-2 rounded-lg">
													{guide.icon}
												</div>
												<Badge className="bg-white/90 text-gray-900">
													{guide.type}
												</Badge>
											</div>
										</div>
									</div>
									<CardContent className="p-6">
										<div className="flex items-center justify-between mb-3">
											<Badge className={getDifficultyColor(guide.difficulty)}>
												{guide.difficulty}
											</Badge>
											<div className="flex items-center gap-1">
												<Star className="w-4 h-4 text-yellow-500 fill-current" />
												<span className="text-sm text-gray-600 dark:text-gray-400">
													{guide.rating}
												</span>
											</div>
										</div>
										<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
											{guide.title}
										</h3>
										<p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
											{guide.description}
										</p>
										<div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
											<div className="flex items-center gap-1">
												<Clock className="w-4 h-4" />
												<span>{guide.duration}</span>
											</div>
											<div className="flex items-center gap-1">
												<User className="w-4 h-4" />
												<span>{guide.author}</span>
											</div>
										</div>
										<div className="flex flex-wrap gap-1 mb-4">
											{guide.tags.slice(0, 2).map((tag, tagIndex) => (
												<Badge
													key={tagIndex}
													variant="outline"
													className="text-xs"
												>
													{tag}
												</Badge>
											))}
										</div>
										<Button
											variant="outline"
											className="w-full group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors"
										>
											{getTypeIcon(guide.type)}
											<span className="ml-2">
												{guide.type === "tutorial" ? "Watch" : "Read"}
											</span>
										</Button>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>

					{filteredGuides.length === 0 && (
						<motion.div className="text-center py-12" variants={itemVariants}>
							<BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
							<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
								No guides found
							</h3>
							<p className="text-gray-600 dark:text-gray-400">
								Try adjusting your search terms or filters
							</p>
						</motion.div>
					)}
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
							Can't find what you're looking for?
						</h2>
						<p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
							Our support team is here to help. Get personalized assistance with
							your specific questions.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium transition-colors"
							>
								Contact Support
							</motion.button>
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="border border-white text-white hover:bg-white hover:text-blue-600 px-6 py-3 rounded-lg font-medium transition-colors"
							>
								Request a Guide
							</motion.button>
						</div>
					</motion.div>
				</div>
			</motion.section>
		</div>
	);
}
