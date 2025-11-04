/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function PricingLoading() {
	return (
		<div className="container mx-auto px-4 py-16">
			{/* Header Skeleton */}
			<div className="text-center mb-12 space-y-4">
				<Skeleton className="h-12 w-64 mx-auto" />
				<Skeleton className="h-6 w-96 mx-auto" />
			</div>

			{/* Toggle Skeleton */}
			<div className="flex justify-center mb-12">
				<Skeleton className="h-12 w-64" />
			</div>

			{/* Pricing Cards Skeleton */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
				{[...Array(3)].map((_, i) => (
					<Card key={i} className="relative">
						<CardHeader>
							<Skeleton className="h-6 w-32 mb-2" />
							<Skeleton className="h-4 w-48 mb-4" />
							<Skeleton className="h-12 w-40" />
						</CardHeader>
						<CardContent>
							<div className="space-y-3 mb-6">
								{[...Array(6)].map((_, j) => (
									<Skeleton key={j} className="h-5 w-full" />
								))}
							</div>
							<Skeleton className="h-12 w-full" />
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

