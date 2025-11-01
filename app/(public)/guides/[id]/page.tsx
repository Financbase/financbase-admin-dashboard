"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, User, Star, BookOpen, Play, FileText } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

// Mock guide data - in production, this would come from an API or CMS
const mockGuides: Record<number, any> = {
	1: {
		id: 1,
		title: "Getting Started with Financbase",
		description: "Learn the basics of setting up your account and navigating the platform",
		category: "getting-started",
		type: "tutorial",
		duration: "15 min",
		difficulty: "beginner",
		author: "Sarah Johnson",
		rating: 4.9,
		views: 1250,
		content: `
# Getting Started with Financbase

Welcome to Financbase! This guide will help you get up and running quickly.

## Overview
Financbase is a comprehensive financial management platform designed to help you take control of your finances.

## Key Features
- Dashboard overview
- Transaction management
- Financial reporting
- Budget tracking

## Next Steps
1. Complete your profile setup
2. Connect your accounts
3. Explore the dashboard

## Need Help?
If you have any questions, feel free to reach out to our support team.
		`,
	},
	2: {
		id: 2,
		title: "Advanced Financial Analytics",
		description: "Deep dive into advanced analytics features and custom reporting",
		category: "advanced",
		type: "guide",
		duration: "45 min",
		difficulty: "intermediate",
		author: "Mike Chen",
		rating: 4.8,
		views: 890,
		content: `
# Advanced Financial Analytics

Learn how to leverage Financbase's powerful analytics features.

## Advanced Features
- Custom report builder
- Data visualization
- Trend analysis
- Forecasting
		`,
	},
};

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
			return <Play className="w-5 h-5" />;
		case "guide":
			return <BookOpen className="w-5 h-5" />;
		case "documentation":
			return <FileText className="w-5 h-5" />;
		default:
			return <BookOpen className="w-5 h-5" />;
	}
};

export default function GuideDetailPage() {
	const params = useParams();
	const router = useRouter();
	const guideId = parseInt(params.id as string);
	const guide = mockGuides[guideId];

	if (!guide) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
				<div className="max-w-4xl mx-auto px-6 py-16">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-center"
					>
						<h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
							Guide Not Found
						</h1>
						<p className="text-gray-600 dark:text-gray-400 mb-8">
							The guide you're looking for doesn't exist or has been removed.
						</p>
						<Button asChild>
							<Link href="/guides">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Guides
							</Link>
						</Button>
					</motion.div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
			<div className="max-w-4xl mx-auto px-6 py-8">
				{/* Back Button */}
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					className="mb-6"
				>
					<Button variant="ghost" asChild>
						<Link href="/guides">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Guides
						</Link>
					</Button>
				</motion.div>

				{/* Guide Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
				>
					<Card className="mb-8">
						<CardHeader>
							<div className="flex items-start justify-between mb-4">
								<div className="flex items-center gap-3">
									<div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
										{getTypeIcon(guide.type)}
									</div>
									<div>
										<Badge variant="secondary" className="mb-2">
											{guide.type}
										</Badge>
										<CardTitle className="text-3xl">{guide.title}</CardTitle>
									</div>
								</div>
							</div>
							<div className="flex flex-wrap items-center gap-4">
								<Badge className={getDifficultyColor(guide.difficulty)}>
									{guide.difficulty}
								</Badge>
								<div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
									<Clock className="w-4 h-4" />
									<span>{guide.duration}</span>
								</div>
								<div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
									<User className="w-4 h-4" />
									<span>{guide.author}</span>
								</div>
								<div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
									<Star className="w-4 h-4 text-yellow-500 fill-current" />
									<span>{guide.rating}</span>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<p className="text-lg text-gray-700 dark:text-gray-300">
								{guide.description}
							</p>
						</CardContent>
					</Card>
				</motion.div>

				{/* Guide Content */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
				>
					<Card>
						<CardContent className="p-8">
							<div className="prose dark:prose-invert max-w-none">
								<div className="whitespace-pre-line text-gray-700 dark:text-gray-300">
									{guide.content || "Content coming soon..."}
								</div>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				{/* Navigation */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3 }}
					className="mt-8 flex justify-center"
				>
					<Button asChild>
						<Link href="/guides">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to All Guides
						</Link>
					</Button>
				</motion.div>
			</div>
		</div>
	);
}

