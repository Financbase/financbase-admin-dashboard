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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Template,
	FileText,
	Copy,
	Edit,
	Trash2,
	Plus,
	Search,
	Star,
	Clock,
	Zap,
} from "lucide-react";
import { useState } from "react";

interface AlertTemplate {
	id: string;
	name: string;
	description: string;
	category: "revenue" | "performance" | "error" | "security" | "custom";
	complexity: "simple" | "moderate" | "advanced";
	popularity: number;
	usageCount: number;
	createdAt: string;
	tags: string[];
	isFavorite: boolean;
}

const mockTemplates: AlertTemplate[] = [
	{
		id: "1",
		name: "Revenue Threshold Alert",
		description: "Monitor daily revenue and alert when it drops below a specified threshold",
		category: "revenue",
		complexity: "simple",
		popularity: 95,
		usageCount: 127,
		createdAt: "2024-01-01",
		tags: ["revenue", "threshold", "daily"],
		isFavorite: true,
	},
	{
		id: "2",
		name: "Error Rate Spike Detection",
		description: "Advanced alert for detecting sudden increases in application error rates",
		category: "error",
		complexity: "advanced",
		popularity: 87,
		usageCount: 89,
		createdAt: "2024-01-05",
		tags: ["error", "spike", "detection", "advanced"],
		isFavorite: false,
	},
	{
		id: "3",
		name: "Performance Degradation Monitor",
		description: "Monitor response times and alert when performance degrades significantly",
		category: "performance",
		complexity: "moderate",
		popularity: 78,
		usageCount: 156,
		createdAt: "2024-01-03",
		tags: ["performance", "response-time", "degradation"],
		isFavorite: true,
	},
	{
		id: "4",
		name: "Security Breach Detection",
		description: "Monitor for suspicious activities and potential security breaches",
		category: "security",
		complexity: "advanced",
		popularity: 92,
		usageCount: 43,
		createdAt: "2024-01-07",
		tags: ["security", "breach", "suspicious", "activity"],
		isFavorite: false,
	},
];

export function AlertsTemplates() {
	const [templates, setTemplates] = useState<AlertTemplate[]>(mockTemplates);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>("all");

	const filteredTemplates = templates.filter(template => {
		const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
			template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

		const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;

		return matchesSearch && matchesCategory;
	});

	const getComplexityColor = (complexity: string) => {
		switch (complexity) {
			case "simple":
				return "bg-green-100 text-green-800 border-green-200";
			case "moderate":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "advanced":
				return "bg-red-100 text-red-800 border-red-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const getCategoryIcon = (category: string) => {
		switch (category) {
			case "revenue":
				return <span className="text-green-500">$</span>;
			case "performance":
				return <Zap className="h-4 w-4 text-blue-500" />;
			case "error":
				return <span className="text-red-500">⚠</span>;
			case "security":
				return <span className="text-purple-500">🔒</span>;
			default:
				return <Template className="h-4 w-4 text-gray-500" />;
		}
	};

	const toggleFavorite = (templateId: string) => {
		setTemplates(prev =>
			prev.map(template =>
				template.id === templateId
					? { ...template, isFavorite: !template.isFavorite }
					: template
			)
		);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold">Alert Templates</h2>
					<p className="text-muted-foreground mt-2">
						Pre-built alert configurations for common monitoring scenarios
					</p>
				</div>
				<Button>
					<Plus className="h-4 w-4 mr-2" />
					Create Template
				</Button>
			</div>

			{/* Filters */}
			<Card>
				<CardContent className="p-4">
					<div className="flex flex-col md:flex-row gap-4 items-center">
						<div className="flex-1">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search templates..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>

						<div className="flex items-center space-x-2">
							<select
								value={selectedCategory}
								onChange={(e) => setSelectedCategory(e.target.value)}
								className="px-3 py-2 border rounded-md text-sm"
							>
								<option value="all">All Categories</option>
								<option value="revenue">Revenue</option>
								<option value="performance">Performance</option>
								<option value="error">Error</option>
								<option value="security">Security</option>
								<option value="custom">Custom</option>
							</select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Templates Grid */}
			{filteredTemplates.length === 0 ? (
				<Card>
					<CardContent className="p-8 text-center">
						<Template className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
						<h3 className="text-lg font-semibold mb-2">No templates found</h3>
						<p className="text-muted-foreground mb-4">
							Try adjusting your search criteria or create a new template.
						</p>
						<Button>
							<Plus className="h-4 w-4 mr-2" />
							Create Template
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{filteredTemplates.map((template) => (
						<Card key={template.id} className="hover:shadow-md transition-shadow">
							<CardHeader className="pb-3">
								<div className="flex items-start justify-between">
									<div className="flex items-center space-x-2">
										{getCategoryIcon(template.category)}
										<CardTitle className="text-base">{template.name}</CardTitle>
									</div>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => toggleFavorite(template.id)}
										className="p-1"
									>
										<Star
											className={`h-4 w-4 ${
												template.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
											}`}
										/>
									</Button>
								</div>
							</CardHeader>
							<CardContent className="space-y-3">
								<p className="text-sm text-muted-foreground line-clamp-2">
									{template.description}
								</p>

								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-2">
										<Badge variant="outline" className={`text-xs ${getComplexityColor(template.complexity)}`}>
											{template.complexity}
										</Badge>
										<span className="text-xs text-muted-foreground">
											{template.usageCount} uses
										</span>
									</div>
								</div>

								<div className="flex flex-wrap gap-1">
									{template.tags.slice(0, 3).map((tag, index) => (
										<Badge key={index} variant="secondary" className="text-xs">
											{tag}
										</Badge>
									))}
									{template.tags.length > 3 && (
										<Badge variant="secondary" className="text-xs">
											+{template.tags.length - 3}
										</Badge>
									)}
								</div>

								<div className="flex items-center justify-between pt-2">
									<div className="flex items-center space-x-2">
										<div className="flex items-center space-x-1">
											<Star className="h-3 w-3 text-yellow-500" />
											<span className="text-xs text-muted-foreground">
												{template.popularity}%
											</span>
										</div>
									</div>

									<div className="flex items-center space-x-1">
										<Dialog>
											<DialogTrigger asChild>
												<Button size="sm" variant="outline">
													Use Template
												</Button>
											</DialogTrigger>
											<DialogContent>
												<DialogHeader>
													<DialogTitle>Use Alert Template</DialogTitle>
													<DialogDescription>
														This will create a new alert based on the "{template.name}" template.
														You can customize the settings before saving.
													</DialogDescription>
												</DialogHeader>
												<div className="flex justify-end space-x-2 mt-4">
													<Button variant="outline">Cancel</Button>
													<Button>Create Alert</Button>
												</div>
											</DialogContent>
										</Dialog>

										<Button size="sm" variant="ghost">
											<Copy className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
