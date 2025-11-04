/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function SegmentsDashboard() {
	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						User Segments
					</CardTitle>
					<CardDescription>
						Create and manage user segments for targeted analysis
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8 text-muted-foreground">
						Segments dashboard coming soon
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

