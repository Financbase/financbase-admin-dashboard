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

export function DataTableTemplate({
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
			{stats && stats.length > 0 && (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{stats.map((stat, index) => (
						<Card key={`item-${index}`}>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									{stat.label}
								</CardTitle>
								{stat.icon && (
									<stat.icon className="h-4 w-4 text-muted-foreground" />
								)}
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{stat.value}</div>
								{stat.change && (
									<p className="text-xs text-muted-foreground">{stat.change}</p>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Action Buttons */}
			{actions && actions.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{actions.map((action, index) => (
						<Button
							key={`item-${index}`}
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
					))}
				</div>
			)}

			{/* Search and Filter */}
			{(showSearch || showFilter) && (
				<div className="flex items-center space-x-2">
					{showSearch && (
						<div className="relative flex-1">
							<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input placeholder="Search..." className="pl-8" />
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
			)}

			{/* Data Table */}
			<Card>
				<CardHeader>
					<CardTitle>{title}</CardTitle>
					<CardDescription>
						View and manage your {title.toLowerCase()}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{data.length > 0 ? (
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b">
										{columns.map((column) => (
											<th
												key={column.key}
												className="px-4 py-3 text-left text-sm font-medium text-muted-foreground min-w-0 whitespace-nowrap"
												style={{ width: column.width }}
											>
												{column.label}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{data.map((row, rowIndex) => {
										const typedRow = row as Record<string, any>;
										return (
										<tr key={rowIndex} className="border-b hover:bg-muted/50">
											{columns.map((column) => {
												const cellContent =
													typeof typedRow[column.key] === "object" &&
													typedRow[column.key]?.badge ? (
														<Badge
															variant={typedRow[column.key].variant || "default"}
														>
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
														{typeof typedRow[column.key] === "object" &&
														typedRow[column.key]?.badge ? (
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
									})}
								</tbody>
							</table>
						</div>
					) : (
						<div className="flex h-[300px] items-center justify-center">
							<p className="text-muted-foreground">{emptyStateMessage}</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
