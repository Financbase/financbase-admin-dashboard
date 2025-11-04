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
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	type Project,
	ProjectDataTable,
} from "@/components/ui/project-data-table";
import {
	CheckCircle,
	Code,
	Columns,
	Key,
	ListFilter,
	Loader2,
	MessageCircle,
	Plus,
	Trash2,
	Users,
	XCircle,
} from "lucide-react";
import React, { useState, useMemo, useEffect } from "react";

// Project type for API response
interface ProjectFromAPI {
	id: string;
	name: string;
	repository?: string;
	team: string;
	tech: string;
	createdAt: string;
	contributors: Contributor[];
	status: {
		text: string;
		variant: "active" | "in_progress" | "on_hold";
	};
}

interface Contributor {
	id: string;
	name: string;
	avatar?: string;
	role?: string;
}

const allColumns: (keyof Project)[] = [
	"name",
	"repository",
	"team",
	"tech",
	"createdAt",
	"contributors",
	"status",
];

const Demo = () => {
	const [projects, setProjects] = useState<ProjectFromAPI[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [techFilter, setTechFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [visibleColumns, setVisibleColumns] = useState<Set<keyof Project>>(
		new Set(allColumns),
	);

	// Fetch projects from API
	useEffect(() => {
		const fetchProjects = async () => {
			try {
				setLoading(true);
				setError(null);

				const response = await fetch("/api/projects");

				if (!response.ok) {
					throw new Error(`Failed to fetch projects: ${response.status}`);
				}

				const data = await response.json();

				if (!data.success) {
					throw new Error(data.error || "Failed to fetch projects");
				}

				setProjects(data.data || []);
			} catch (err) {
				console.error("Error fetching projects:", err);
				setError(
					err instanceof Error ? err.message : "Failed to load projects",
				);
			} finally {
				setLoading(false);
			}
		};

		fetchProjects();
	}, []);

	const filteredProjects = useMemo(() => {
		if (!projects) return [];

		return projects.filter((project) => {
			const techMatch =
				techFilter === "" ||
				project.tech.toLowerCase().includes(techFilter.toLowerCase());
			const statusMatch =
				statusFilter === "all" || project.status.variant === statusFilter;
			return techMatch && statusMatch;
		});
	}, [projects, techFilter, statusFilter]);

	const toggleColumn = (column: keyof Project) => {
		setVisibleColumns((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(column)) {
				newSet.delete(column);
			} else {
				newSet.add(column);
			}
			return newSet;
		});
	};

	if (loading) {
		return (
			<div className="container mx-auto p-4 md:p-6">
				<div className="flex items-center justify-center h-64">
					<Loader2 className="h-8 w-8 animate-spin" />
					<span className="ml-2">Loading projects...</span>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto p-4 md:p-6">
				<div className="text-center py-12">
					<p className="text-red-600 mb-4">Error: {error}</p>
					<Button onClick={() => window.location.reload()}>Try Again</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-4 md:p-6">
			<div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center">
				<div className="flex flex-1 gap-4">
					<Input
						placeholder="Filter by technology..."
						value={techFilter}
						onChange={(e) => setTechFilter(e.target.value)}
						className="max-w-xs"
					/>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="flex items-center gap-2">
								<ListFilter className="h-4 w-4" />
								<span>Status</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuCheckboxItem
								checked={statusFilter === "all"}
								onCheckedChange={() => setStatusFilter("all")}
							>
								All
							</DropdownMenuCheckboxItem>
							<DropdownMenuCheckboxItem
								checked={statusFilter === "active"}
								onCheckedChange={() => setStatusFilter("active")}
							>
								Active
							</DropdownMenuCheckboxItem>
							<DropdownMenuCheckboxItem
								checked={statusFilter === "in_progress"}
								onCheckedChange={() => setStatusFilter("in_progress")}
							>
								In Progress
							</DropdownMenuCheckboxItem>
							<DropdownMenuCheckboxItem
								checked={statusFilter === "on_hold"}
								onCheckedChange={() => setStatusFilter("on_hold")}
							>
								On Hold
							</DropdownMenuCheckboxItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="flex items-center gap-2">
							<Columns className="h-4 w-4" />
							<span>Columns</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{allColumns.map((column) => (
							<DropdownMenuCheckboxItem
								key={column}
								className="capitalize"
								checked={visibleColumns.has(column)}
								onCheckedChange={() => toggleColumn(column)}
							>
								{column}
							</DropdownMenuCheckboxItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<ProjectDataTable
				projects={filteredProjects}
				visibleColumns={visibleColumns}
			/>
		</div>
	);
};

export default Demo;
