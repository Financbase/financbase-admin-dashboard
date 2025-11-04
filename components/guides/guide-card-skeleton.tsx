/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface GuideCardSkeletonProps {
	variant?: "default" | "featured";
	className?: string;
}

export function GuideCardSkeleton({
	variant = "default",
	className,
}: GuideCardSkeletonProps) {
	if (variant === "featured") {
		return (
			<Card className={cn("h-full overflow-hidden", className)}>
				<Skeleton className="w-full h-48" />
				<CardContent className="p-6">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-4">
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-6 w-24" />
						</div>
						<Skeleton className="h-4 w-24" />
					</div>
					<Skeleton className="h-6 w-32 mb-2" />
					<Skeleton className="h-4 w-full mb-4" />
					<Skeleton className="h-10 w-full" />
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className={cn("h-full overflow-hidden", className)}>
			<Skeleton className="w-full h-40" />
			<CardContent className="p-6">
				<div className="flex items-center justify-between mb-3">
					<Skeleton className="h-6 w-24" />
					<Skeleton className="h-4 w-12" />
				</div>
				<Skeleton className="h-6 w-3/4 mb-2" />
				<Skeleton className="h-4 w-full mb-2" />
				<Skeleton className="h-4 w-2/3 mb-4" />
				<div className="flex items-center justify-between mb-4">
					<Skeleton className="h-4 w-20" />
					<Skeleton className="h-4 w-24" />
				</div>
				<div className="flex gap-1 mb-4">
					<Skeleton className="h-5 w-16" />
					<Skeleton className="h-5 w-16" />
				</div>
				<Skeleton className="h-10 w-full" />
			</CardContent>
		</Card>
	);
}

