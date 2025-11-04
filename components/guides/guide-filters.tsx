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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter, SortAsc, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortOption = "popular" | "recent" | "rating" | "difficulty";

interface Category {
	id: string;
	name: string;
	icon: React.ReactNode;
	count: number;
}

interface GuideFiltersProps {
	categories: Category[];
	selectedCategory: string;
	onCategoryChange: (category: string) => void;
	sortBy: SortOption;
	onSortChange: (sort: SortOption) => void;
	resultsCount?: number;
}

export function GuideFilters({
	categories,
	selectedCategory,
	onCategoryChange,
	sortBy,
	onSortChange,
	resultsCount,
}: GuideFiltersProps) {
	const sortOptions: { value: SortOption; label: string }[] = [
		{ value: "popular", label: "Most Popular" },
		{ value: "recent", label: "Most Recent" },
		{ value: "rating", label: "Highest Rated" },
		{ value: "difficulty", label: "Difficulty" },
	];

	const selectedCategoryData = categories.find((c) => c.id === selectedCategory);

	return (
		<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
			{/* Category Filter Buttons (Compact on mobile, full on desktop) */}
			<div className="flex flex-wrap gap-2 flex-1">
				{categories.slice(0, 4).map((category) => (
					<Button
						key={category.id}
						variant={
							selectedCategory === category.id ? "default" : "outline"
						}
						size="sm"
						onClick={() => onCategoryChange(category.id)}
						className="flex items-center gap-2"
						aria-pressed={selectedCategory === category.id}
					>
						{category.icon}
						<span className="hidden sm:inline">{category.name}</span>
						<Badge variant="secondary" className="ml-1">
							{category.count}
						</Badge>
					</Button>
				))}

				{/* Show more categories in dropdown */}
				{categories.length > 4 && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm">
								<Filter className="w-4 h-4" />
								<span className="hidden sm:inline">More</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56">
							<DropdownMenuLabel>All Categories</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuRadioGroup
								value={selectedCategory}
								onValueChange={onCategoryChange}
							>
								{categories.map((category) => (
									<DropdownMenuRadioItem
										key={category.id}
										value={category.id}
										className="flex items-center justify-between"
									>
										<div className="flex items-center gap-2">
											{category.icon}
											<span>{category.name}</span>
										</div>
										<Badge variant="secondary" className="ml-2">
											{category.count}
										</Badge>
									</DropdownMenuRadioItem>
								))}
							</DropdownMenuRadioGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>

			{/* Sort Dropdown */}
			<Select value={sortBy} onValueChange={onSortChange}>
				<SelectTrigger className="w-full sm:w-[180px]">
					<SortAsc className="w-4 h-4 mr-2" />
					<SelectValue placeholder="Sort by" />
				</SelectTrigger>
				<SelectContent>
					{sortOptions.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			{/* Results Count */}
			{resultsCount !== undefined && (
				<div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
					{resultsCount} {resultsCount === 1 ? "result" : "results"}
				</div>
			)}

			{/* Clear Filters Button */}
			{selectedCategory !== "all" && (
				<Button
					variant="ghost"
					size="sm"
					onClick={() => onCategoryChange("all")}
					className="flex items-center gap-2"
					aria-label="Clear filters"
				>
					<X className="w-4 h-4" />
					<span className="hidden sm:inline">Clear</span>
				</Button>
			)}
		</div>
	);
}

