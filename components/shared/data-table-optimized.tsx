/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

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
import {
	Download,
	Filter,
	Key,
	Layout,
	Link as LinkIcon,
	Link2,
	Plus,
	Search,
} from "lucide-react";
import Link from "next/link";
import type React from "react";
import { memo, useCallback, useMemo, useState } from "react";

interface StatCard {
	label: string;
	value: string;
	change?: string;
	icon: React.ComponentType<{ className?: string }>;
}

interface TableColumn {
	key: string;
	label: string;
	width?: string;
}

interface ActionButton {
	label: string;
	href?: string;
	onClick?: () => void;
	variant?: "default" | "outline" | "ghost";
	icon?: React.ComponentType<{ className?: string }>;
}

interface DataTableTemplateProps {
	title: string;
	description: string;
	stats?: StatCard[];
	columns: TableColumn[];
	data: unknown[];
	actions?: ActionButton[];
	showSearch?: boolean;
	showFilter?: boolean;
	createButtonLabel?: string;
	createButtonHref?: string;
	emptyStateMessage?: string;
}

// Memoized stat card component
const StatCard = memo(function StatCard({ stat }: { stat: StatCard }) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
				{stat.icon && <stat.icon className="h-4 w-4 text-muted-foreground" />}
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{stat.value}</div>
				{stat.change && (
					<p className="text-xs text-muted-foreground">{stat.change}</p>
				)}
			</CardContent>
		</Card>
	);
});

// Memoized action button component
const ActionButton = memo(function ActionButton({
	action,
}: {
	action: ActionButton;
}) {
	return (
		<Button
			variant={action.variant || "outline"}
			asChild={!!action.href}
			onClick={action.href ? undefined : action.onClick}
		>
			{action.href ? (
				<Link href={action.href}>
					{action.icon && <action.icon className="mr-2 h-4 w-4" />}
					{action.label}
				</Link>
			) : (
				<>
					{action.icon && <action.icon className="mr-2 h-4 w-4" />}
					{action.label}
				</>
			)}
		</Button>
	);
});

// Memoized table row component
const TableRow = memo(function TableRow({
	row,
	columns,
	rowIndex,
}: {
	row: unknown;
	columns: TableColumn[];
	rowIndex: number;
}) {
	const typedRow = row as Record<string, any>;
	return (
		<tr className="border-b hover:bg-muted/50 transform-gpu will-change-transform">
			{columns.map((column) => {
				const cellContent =
					typeof typedRow[column.key] === "object" && typedRow[column.key]?.badge ? (
						<Badge variant={typedRow[column.key].variant || "default"}>
							{typedRow[column.key].value}
						</Badge>
					) : (
						typedRow[column.key]
					);
				const cellText = String(
					typeof typedRow[column.key] === "object" && typedRow[column.key]?.value
						? typedRow[column.key].value
						: typedRow[column.key] || ""
				);
				
				return (
					<td key={column.key} className="px-4 py-3 text-sm min-w-0">
						{typeof typedRow[column.key] === "object" && typedRow[column.key]?.badge ? (
							cellContent
						) : (
							<div className="break-words" title={cellText}>
								{cellContent}
							</div>
						)}
					</td>
				);
			})}
		</tr>
	);
});

// Memoized table header component
const TableHeader = memo(function TableHeader({
	columns,
}: {
	columns: TableColumn[];
}) {
	return (
		<thead>
			<tr className="border-b">
				{columns.map((column) => (
					<th
						key={column.key}
						scope="col"
						className="px-4 py-3 text-left text-sm font-medium text-muted-foreground min-w-0 whitespace-nowrap"
						style={{ width: column.width }}
					>
						{column.label}
					</th>
				))}
			</tr>
		</thead>
	);
});

// Memoized search and filter component
const SearchAndFilter = memo(function SearchAndFilter({
	showSearch,
	showFilter,
}: {
	showSearch: boolean;
	showFilter: boolean;
}) {
	const [searchTerm, setSearchTerm] = useState("");

	const handleSearchChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setSearchTerm(e.target.value);
		},
		[],
	);

	return (
		<div className="flex items-center space-x-2">
			{showSearch && (
				<div className="relative flex-1">
					<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search..."
						className="pl-8"
						value={searchTerm}
						onChange={handleSearchChange}
					/>
				</div>
			)}
			{showFilter && (
				<Button variant="outline" size="sm">
					<Filter className="mr-2 h-4 w-4" />
					Filter
				</Button>
			)}
			<Button variant="outline" size="sm">
				<Download className="mr-2 h-4 w-4" />
				Export
			</Button>
		</div>
	);
});

// Main optimized data table component
export const DataTableTemplate = memo(function DataTableTemplate({
	title,
	description,
	stats,
	columns,
	data,
	actions,
	showSearch = true,
	showFilter = true,
	createButtonLabel,
	createButtonHref,
	emptyStateMessage = "No data available",
}: DataTableTemplateProps) {
	// Memoized filtered data
	const filteredData = useMemo(() => {
		// Add filtering logic here if needed
		return data;
	}, [data]);

	// Memoized stats cards
	const statsCards = useMemo(() => {
		if (!stats || stats.length === 0) {
			return null;
		}

		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{stats.map((stat, index) => (
					<StatCard key={`item-${index}`} stat={stat} />
				))}
			</div>
		);
	}, [stats]);

	// Memoized action buttons
	const actionButtons = useMemo(() => {
		if (!actions || actions.length === 0) {
			return null;
		}

		return (
			<div className="flex flex-wrap gap-2">
				{actions.map((action, index) => (
					<ActionButton key={`item-${index}`} action={action} />
				))}
			</div>
		);
	}, [actions]);

	// Memoized table content
	const tableContent = useMemo(() => {
		if (filteredData.length === 0) {
			return (
				<div className="flex h-[300px] items-center justify-center">
					<p className="text-muted-foreground">{emptyStateMessage}</p>
				</div>
			);
		}

		return (
			<div className="overflow-x-auto">
				<table className="w-full" aria-label={`${title} data table`}>
					<caption className="sr-only">
						{title} data table with {filteredData.length} rows
					</caption>
					<TableHeader columns={columns} />
					<tbody>
						{filteredData.map((row, rowIndex) => (
							<TableRow
								key={rowIndex}
								row={row}
								columns={columns}
								rowIndex={rowIndex}
							/>
						))}
					</tbody>
				</table>
			</div>
		);
	}, [filteredData, columns, emptyStateMessage]);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">{title}</h1>
					<p className="text-muted-foreground">{description}</p>
				</div>
				{createButtonLabel && createButtonHref && (
					<Button asChild={true}>
						<Link href={createButtonHref}>
							<Plus className="mr-2 h-4 w-4" />
							{createButtonLabel}
						</Link>
					</Button>
				)}
			</div>

			{/* Stats Cards */}
			{statsCards}

			{/* Action Buttons */}
			{actionButtons}

			{/* Search and Filter */}
			{(showSearch || showFilter) && (
				<SearchAndFilter showSearch={showSearch} showFilter={showFilter} />
			)}

			{/* Data Table */}
			<Card>
				<CardHeader>
					<CardTitle>{title}</CardTitle>
					<CardDescription>
						View and manage your {title.toLowerCase()}
					</CardDescription>
				</CardHeader>
				<CardContent>{tableContent}</CardContent>
			</Card>
		</div>
	);
});

// Export for backward compatibility
export default DataTableTemplate;
