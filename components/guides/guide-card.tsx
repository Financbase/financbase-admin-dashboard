"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
	Card,
	CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Clock,
	User,
	Star,
	Play,
	BookOpen,
	FileText,
	ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Guide {
	id: number;
	title: string;
	description: string;
	category: string;
	type: "tutorial" | "guide" | "documentation";
	duration: string;
	difficulty: "beginner" | "intermediate" | "advanced";
	author: string;
	rating: number;
	views: number;
	image: string;
	tags: string[];
	icon?: React.ReactNode;
}

interface GuideCardProps {
	guide: Guide;
	index?: number;
	className?: string;
	variant?: "default" | "featured";
}

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

export const GuideCard = memo<GuideCardProps>(
	({ guide, index = 0, className, variant = "default" }) => {
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
		if (variant === "featured") {
			return (
				<motion.div
					className={cn("group", className)}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: index * 0.1, duration: 0.5 }}
					whileHover={{ y: -5, transition: { duration: 0.2 } }}
				>
					<Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300">
						<div className="relative">
							<img
								src={guide.image}
								alt={guide.title}
								className="w-full h-48 object-cover"
								loading="lazy"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
							<div className="absolute bottom-4 left-4 text-white">
								<Badge className="bg-blue-600 text-white mb-2">
									Featured
								</Badge>
								<h3 className="text-xl font-bold mb-2">{guide.title}</h3>
								<p className="text-white/90 text-sm">{guide.description}</p>
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
							<Button
								className="w-full group-hover:bg-blue-700 transition-colors"
								asChild
							>
								<Link href={`/guides/${guide.id}`}>
									Start Learning
									<ArrowRight className="w-4 h-4 ml-2" />
								</Link>
							</Button>
						</CardContent>
					</Card>
				</motion.div>
			);
		}

		return (
			<motion.div
				className={cn("group", className)}
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: index * 0.05, duration: 0.4 }}
				whileHover={{ y: -5, transition: { duration: 0.2 } }}
			>
				<Card
					className="h-full overflow-hidden hover:shadow-lg transition-all duration-300"
					role="article"
					aria-labelledby={`guide-title-${guide.id}`}
				>
					<div className="relative">
						<img
							src={guide.image}
							alt={guide.title}
							className="w-full h-40 object-cover"
							loading="lazy"
						/>
						<div className="absolute top-4 left-4">
							<div className="flex items-center gap-2">
								<div className="bg-white/90 backdrop-blur-sm p-2 rounded-lg">
									{guide.icon || getTypeIcon(guide.type)}
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
						<h3
							id={`guide-title-${guide.id}`}
							className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors"
						>
							{guide.title}
						</h3>
						<p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
							{guide.description}
						</p>
						<div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
							<div className="flex items-center gap-1">
								<Clock className="w-4 h-4" aria-hidden="true" />
								<span>{guide.duration}</span>
							</div>
							<div className="flex items-center gap-1">
								<User className="w-4 h-4" aria-hidden="true" />
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
							asChild
						>
							<Link href={`/guides/${guide.id}`}>
								{getTypeIcon(guide.type)}
								<span className="ml-2">
									{guide.type === "tutorial" ? "Watch" : "Read"}
								</span>
							</Link>
						</Button>
					</CardContent>
				</Card>
			</motion.div>
		);
	},
);

GuideCard.displayName = "GuideCard";

