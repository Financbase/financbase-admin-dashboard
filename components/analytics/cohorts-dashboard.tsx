"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/core/ui/layout/skeleton";

export default function CohortsDashboard() {
	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Cohort Analysis</CardTitle>
					<CardDescription>
						Track user behavior and retention across different cohorts
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<Skeleton className="h-8 w-full" />
						<Skeleton className="h-64 w-full" />
						<Skeleton className="h-32 w-full" />
					</div>
				</CardContent>
			</Card>
			
			<Card>
				<CardHeader>
					<CardTitle>Retention Matrix</CardTitle>
					<CardDescription>
						View user retention rates by cohort
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8 text-muted-foreground">
						Cohort analysis feature coming soon
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

