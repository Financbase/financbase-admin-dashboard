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
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	ArrowUpDown,
	ChevronLeft,
	ChevronRight,
	Filter,
	Search,
} from "lucide-react";
import { memo, useMemo, useState } from "react";

interface Column<T> {
	key: keyof T;
	label: string;
	render?: (value: T[keyof T], row: T) => React.ReactNode;
	sortable?: boolean;
}

interface DataTableProps<T> {
	data: T[];
	columns: Column<T>[];
	searchable?: boolean;
	searchPlaceholder?: string;
	pagination?: boolean;
	pageSize?: number;
	onRowClick?: (row: T) => void;
	className?: string;
}

export const DataTable = memo(function DataTable<
	T extends Record<string, unknown>,
>({
	data,
	columns,
	searchable = true,
	searchPlaceholder = "Search...",
	pagination = true,
	pageSize = 10,
	onRowClick,
	className,
}: DataTableProps<T>) {
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [sortKey, setSortKey] = useState<keyof T | null>(null);
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

	const filteredData = data.filter((item) =>
		Object.values(item).some((value) =>
			String(value).toLowerCase().includes(searchTerm.toLowerCase()),
		),
	);

	const sortedData = sortKey
		? [...filteredData].sort((a, b) => {
				const aVal = a[sortKey];
				const bVal = b[sortKey];
				const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
				return sortDirection === "asc" ? result : -result;
			})
		: filteredData;

	const totalPages = Math.ceil(sortedData.length / pageSize);
	const startIndex = (currentPage - 1) * pageSize;
	const endIndex = startIndex + pageSize;
	const paginatedData = pagination
		? sortedData.slice(startIndex, endIndex)
		: sortedData;

	const handleSort = (key: keyof T) => {
		if (sortKey === key) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortKey(key);
			setSortDirection("asc");
		}
	};

	return (
		<div className={className}>
			{searchable && (
				<div className="mb-4">
					<div className="relative max-w-sm">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
						<Input
							placeholder={searchPlaceholder}
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10"
						/>
					</div>
				</div>
			)}

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							{columns.map((column) => (
								<TableHead
									key={String(column.key)}
									className={
										column.sortable ? "cursor-pointer hover:bg-muted" : ""
									}
									onClick={() => column.sortable && handleSort(column.key)}
								>
									{column.label}
									{column.sortable && sortKey === column.key && (
										<span className="ml-1">
											{sortDirection === "asc" ? "↑" : "↓"}
										</span>
									)}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{paginatedData.map((row, index) => (
							<TableRow
								key={index}
								className={onRowClick ? "cursor-pointer hover:bg-muted" : ""}
								onClick={() => onRowClick?.(row)}
							>
								{columns.map((column) => (
									<TableCell key={String(column.key)}>
										{column.render
											? column.render(row[column.key], row)
											: String(row[column.key] || "")}
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{pagination && totalPages > 1 && (
				<div className="flex items-center justify-between mt-4">
					<div className="text-sm text-muted-foreground">
						Showing {startIndex + 1} to {Math.min(endIndex, sortedData.length)}{" "}
						of {sortedData.length} results
					</div>
					<div className="flex items-center space-x-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
							disabled={currentPage === 1}
						>
							<ChevronLeft className="h-4 w-4" />
							Previous
						</Button>
						<span className="text-sm">
							Page {currentPage} of {totalPages}
						</span>
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								setCurrentPage((prev) => Math.min(prev + 1, totalPages))
							}
							disabled={currentPage === totalPages}
						>
							Next
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}) as <T extends Record<string, unknown>>(
	props: DataTableProps<T>,
) => JSX.Element;
