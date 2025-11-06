/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Key, Search } from "lucide-react";

interface DataTableColumn<T> {
	key: keyof T;
	label: string;
	render?: (value: T[keyof T], item: T) => React.ReactNode;
	className?: string;
}

interface DataTableProps<T> {
	data: T[];
	columns: DataTableColumn<T>[];
	loading?: boolean;
	searchable?: boolean;
	searchPlaceholder?: string;
	onSearch?: (query: string) => void;
	pagination?: {
		page: number;
		totalPages: number;
		onPageChange: (page: number) => void;
	};
	actions?: {
		label: string;
		onClick: (item: T) => void;
		icon?: React.ComponentType<{ className?: string }>;
		variant?:
			| "default"
			| "destructive"
			| "outline"
			| "secondary"
			| "ghost"
			| "link";
	}[];
	emptyMessage?: string;
	className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
	data,
	columns,
	loading = false,
	searchable = false,
	searchPlaceholder = "Search...",
	onSearch,
	pagination,
	actions = [],
	emptyMessage = "No data available",
	className = "",
}: DataTableProps<T>) {
	if (loading) {
		return (
			<div className="border rounded-lg">
				<div className="p-6">
					<div className="animate-pulse space-y-4">
						<div className="h-4 bg-muted rounded w-1/4" />
						<div className="space-y-2">
							<div className="h-4 bg-muted rounded" />
							<div className="h-4 bg-muted rounded" />
							<div className="h-4 bg-muted rounded" />
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className={`border rounded-lg ${className}`}>
			{searchable && onSearch && (
				<div className="p-4 border-b">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder={searchPlaceholder}
							className="pl-10"
							onChange={(e) => onSearch(e.target.value)}
						/>
					</div>
				</div>
			)}

			<div className="overflow-x-auto">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b">
							{columns.map((column) => (
								<th
									key={String(column.key)}
									className={`text-left p-3 ${column.className || ""}`}
								>
									{column.label}
								</th>
							))}
							{actions.length > 0 && (
								<th className="text-center p-3">Actions</th>
							)}
						</tr>
					</thead>
					<tbody>
						{data.length === 0 ? (
							<tr>
								<td
									colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
									className="p-8 text-center text-muted-foreground"
								>
									{emptyMessage}
								</td>
							</tr>
						) : (
							data.map((item, index) => (
								<tr
									key={(item.id as string | number | undefined) || `row-${index}`}
									className="border-b hover:bg-muted/50"
								>
									{columns.map((column) => (
										<td
											key={String(column.key)}
											className={`p-3 ${column.className || ""}`}
										>
											{column.render
												? column.render(item[column.key], item)
												: String(item[column.key] || "")}
										</td>
									))}
									{actions.length > 0 && (
										<td className="p-3">
											<div className="flex items-center justify-center space-x-1">
												{actions.map((action, actionIndex) => (
													<Button
														key={`${item.id || index}-action-${actionIndex}`}
														size="sm"
														variant={action.variant || "ghost"}
														onClick={() => action.onClick(item)}
														title={action.label}
													>
														{action.icon && <action.icon className="h-4 w-4" />}
														{!action.icon && action.label}
													</Button>
												))}
											</div>
										</td>
									)}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{pagination && (
				<div className="flex items-center justify-between p-4 border-t">
					<div className="text-sm text-muted-foreground">
						Page {pagination.page} of {pagination.totalPages}
					</div>
					<div className="flex items-center space-x-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => pagination.onPageChange(pagination.page - 1)}
							disabled={pagination.page <= 1}
						>
							<ChevronLeft className="h-4 w-4" />
							Previous
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => pagination.onPageChange(pagination.page + 1)}
							disabled={pagination.page >= pagination.totalPages}
						>
							Next
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
