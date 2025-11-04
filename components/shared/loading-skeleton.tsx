/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { cn } from "@/lib/utils";
import { Key } from "lucide-react";

interface SkeletonProps {
	className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
	return (
		<div
			className={cn("animate-pulse rounded-md bg-muted", className)}
			{...props}
		/>
	);
}

interface LoadingSkeletonProps {
	lines?: number;
	className?: string;
}

export function LoadingSkeleton({
	lines = 3,
	className,
}: LoadingSkeletonProps) {
	const skeletonLines = Array.from({ length: lines }, (_, i) => ({
		id: `skeleton-line-${i}`,
		index: i,
	}));

	return (
		<div className={cn("space-y-2", className)}>
			{skeletonLines.map(({ id, index }) => (
				<Skeleton
					key={id}
					className={cn("h-4", index === lines - 1 ? "w-3/4" : "w-full")}
				/>
			))}
		</div>
	);
}

export function TableSkeleton({
	rows = 5,
	columns = 4,
	className,
}: {
	rows?: number;
	columns?: number;
	className?: string;
}) {
	const headerCells = Array.from({ length: columns }, (_, i) => ({
		id: `header-${i}`,
		index: i,
	}));

	const tableRows = Array.from({ length: rows }, (_, rowIndex) => ({
		id: `row-${rowIndex}`,
		index: rowIndex,
		cells: Array.from({ length: columns }, (_, colIndex) => ({
			id: `cell-${rowIndex}-${colIndex}`,
			index: colIndex,
		})),
	}));

	return (
		<div className={cn("space-y-3", className)}>
			{/* Header */}
			<div className="flex space-x-4">
				{headerCells.map(({ id }) => (
					<Skeleton key={id} className="h-4 flex-1" />
				))}
			</div>
			{/* Rows */}
			{tableRows.map(({ id, cells }) => (
				<div key={id} className="flex space-x-4">
					{cells.map(({ id: cellId, index: colIndex }) => (
						<Skeleton
							key={cellId}
							className={cn(
								"h-4 flex-1",
								colIndex === columns - 1 ? "w-16" : "flex-1",
							)}
						/>
					))}
				</div>
			))}
		</div>
	);
}

export function CardSkeleton({ className }: { className?: string }) {
	return (
		<div className={cn("border rounded-lg p-6", className)}>
			<div className="space-y-4">
				<Skeleton className="h-4 w-1/4" />
				<Skeleton className="h-4 w-1/2" />
				<Skeleton className="h-4 w-3/4" />
			</div>
		</div>
	);
}

export function StatsSkeleton({
	count = 4,
	className,
}: {
	count?: number;
	className?: string;
}) {
	const statCards = Array.from({ length: count }, (_, i) => ({
		id: `stat-card-${i}`,
	}));

	return (
		<div className={cn("grid gap-4 md:grid-cols-4", className)}>
			{statCards.map(({ id }) => (
				<CardSkeleton key={id} />
			))}
		</div>
	);
}
