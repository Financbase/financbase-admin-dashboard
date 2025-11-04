/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { ContentPageTemplate } from '@/components/layout/public-templates';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function PrivacyLoading() {
	return (
		<ContentPageTemplate
			title="Privacy Policy"
			description="Learn how we collect, use, and protect your personal information"
		>
			<div className="max-w-4xl mx-auto space-y-6">
				{/* Table of Contents Skeleton */}
				<Card>
					<CardContent className="p-6">
						<Skeleton className="h-6 w-48 mb-4" />
						<div className="space-y-2">
							{[...Array(8)].map((_, i) => (
								<Skeleton key={i} className="h-5 w-full" />
							))}
						</div>
					</CardContent>
				</Card>

				{/* Content Sections Skeleton */}
				{[...Array(8)].map((_, i) => (
					<Card key={i}>
						<CardContent className="p-6 space-y-4">
							<Skeleton className="h-8 w-64" />
							<div className="space-y-2">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-3/4" />
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</ContentPageTemplate>
	);
}

