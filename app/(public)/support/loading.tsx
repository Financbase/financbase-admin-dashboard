/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { PublicPageTemplate } from '@/components/layout/public-templates';
import { PublicSection } from '@/components/layout/public-section';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SupportLoading() {
	return (
		<PublicPageTemplate
			hero={{
				title: 'Support',
				description: 'Get help with Financbase',
			}}
		>
			<PublicSection>
				<Tabs defaultValue="search" className="w-full">
					<TabsList className="grid w-full grid-cols-3 mb-8">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</TabsList>

					<TabsContent value="search" className="space-y-6">
						<Skeleton className="h-12 w-full mb-4" />
						<div className="grid gap-4">
							{[...Array(5)].map((_, i) => (
								<Skeleton key={i} className="h-24 w-full" />
							))}
						</div>
					</TabsContent>

					<TabsContent value="contact" className="space-y-6">
						<div className="max-w-2xl mx-auto space-y-6">
							<Skeleton className="h-8 w-48 mx-auto" />
							<Skeleton className="h-4 w-96 mx-auto" />
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<Skeleton className="h-12 w-full" />
								<Skeleton className="h-12 w-full" />
							</div>
							<Skeleton className="h-12 w-full" />
							<Skeleton className="h-12 w-full" />
							<Skeleton className="h-32 w-full" />
							<Skeleton className="h-12 w-full" />
						</div>
					</TabsContent>
				</Tabs>
			</PublicSection>
		</PublicPageTemplate>
	);
}

