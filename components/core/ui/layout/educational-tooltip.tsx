"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	BookOpen,
	DollarSign,
	HelpCircle,
	Lightbulb,
	Target,
	TrendingUp,
	Users,
	X,
} from "lucide-react";
import { useState } from "react";

interface EducationalTooltipProps {
	children: React.ReactNode;
	title: string;
	content: string;
	concept?: string;
	examples?: string[];
	relatedTerms?: string[];
	level?: "beginner" | "intermediate" | "advanced";
	icon?: React.ReactNode;
}

export function EducationalTooltip({
	children,
	title,
	content,
	concept,
	examples = [],
	relatedTerms = [],
	level = "beginner",
	icon,
}: EducationalTooltipProps) {
	const [isOpen, setIsOpen] = useState(false);

	const getLevelColor = (level: string) => {
		switch (level) {
			case "beginner":
				return "bg-green-100 text-green-800 border-green-200";
			case "intermediate":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "advanced":
				return "bg-red-100 text-red-800 border-red-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const getLevelIcon = (level: string) => {
		switch (level) {
			case "beginner":
				return <BookOpen className="h-4 w-4" />;
			case "intermediate":
				return <Lightbulb className="h-4 w-4" />;
			case "advanced":
				return <Target className="h-4 w-4" />;
			default:
				return <HelpCircle className="h-4 w-4" />;
		}
	};

	return (
		<div className="relative inline-block">
			<div
				className="cursor-help"
				onMouseEnter={() => setIsOpen(true)}
				onMouseLeave={() => setIsOpen(false)}
			>
				{children}
			</div>

			{isOpen && (
				<div className="absolute z-50 w-80 mt-2 left-0 transform -translate-x-1/2">
					<Card className="shadow-lg border-2">
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-2">
									{icon || getLevelIcon(level)}
									<CardTitle className="text-lg">{title}</CardTitle>
								</div>
								<div className="flex items-center space-x-2">
									<Badge className={`text-xs ${getLevelColor(level)}`}>
										{level}
									</Badge>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setIsOpen(false)}
										className="h-6 w-6 p-0"
									>
										<X className="h-3 w-3" />
									</Button>
								</div>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<p className="text-sm text-gray-700">{content}</p>

							{concept && (
								<div className="bg-blue-50 p-3 rounded-lg">
									<h4 className="text-sm font-semibold text-blue-800 mb-1">
										Key Concept
									</h4>
									<p className="text-sm text-blue-700">{concept}</p>
								</div>
							)}

							{examples.length > 0 && (
								<div>
									<h4 className="text-sm font-semibold text-gray-800 mb-2">
										Examples
									</h4>
									<ul className="text-sm text-gray-700 space-y-1">
										{examples.map((example, index) => (
											<li key={index} className="flex items-start space-x-2">
												<span className="text-blue-500 mt-1">•</span>
												<span>{example}</span>
											</li>
										))}
									</ul>
								</div>
							)}

							{relatedTerms.length > 0 && (
								<div>
									<h4 className="text-sm font-semibold text-gray-800 mb-2">
										Related Terms
									</h4>
									<div className="flex flex-wrap gap-1">
										{relatedTerms.map((term, index) => (
											<Badge key={index} variant="outline" className="text-xs">
												{term}
											</Badge>
										))}
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}

interface EducationalCardProps {
	title: string;
	description: string;
	icon: React.ReactNode;
	concepts: string[];
	examples: string[];
	level: "beginner" | "intermediate" | "advanced";
	onLearnMore?: () => void;
}

export function EducationalCard({
	title,
	description,
	icon,
	concepts,
	examples,
	level,
	onLearnMore,
}: EducationalCardProps) {
	const getLevelColor = (level: string) => {
		switch (level) {
			case "beginner":
				return "bg-green-100 text-green-800 border-green-200";
			case "intermediate":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "advanced":
				return "bg-red-100 text-red-800 border-red-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	return (
		<Card className="hover:shadow-lg transition-shadow">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-3">
						{icon}
						<CardTitle className="text-lg">{title}</CardTitle>
					</div>
					<Badge className={`text-xs ${getLevelColor(level)}`}>{level}</Badge>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<p className="text-sm text-gray-700">{description}</p>

				<div>
					<h4 className="text-sm font-semibold text-gray-800 mb-2">
						Key Concepts
					</h4>
					<div className="flex flex-wrap gap-1">
						{concepts.map((concept, index) => (
							<Badge key={index} variant="outline" className="text-xs">
								{concept}
							</Badge>
						))}
					</div>
				</div>

				<div>
					<h4 className="text-sm font-semibold text-gray-800 mb-2">Examples</h4>
					<ul className="text-sm text-gray-700 space-y-1">
						{examples.map((example, index) => (
							<li key={index} className="flex items-start space-x-2">
								<span className="text-blue-500 mt-1">•</span>
								<span>{example}</span>
							</li>
						))}
					</ul>
				</div>

				{onLearnMore && (
					<Button
						variant="outline"
						size="sm"
						onClick={onLearnMore}
						className="w-full"
					>
						<BookOpen className="h-4 w-4 mr-2" />
						Learn More
					</Button>
				)}
			</CardContent>
		</Card>
	);
}
