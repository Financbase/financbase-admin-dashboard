/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ArrowRight,
	Construction,
	Key,
	LayoutDashboard,
	Link,
	Link2,
} from "lucide-react";
import Link from "next/link";

interface ComingSoonProps {
	title: string;
	description?: string;
	expectedFeatures?: string[];
	backLink?: string;
}

export function ComingSoon({
	title,
	description = "This feature is currently under development.",
	expectedFeatures = [],
	backLink = "/dashboard",
}: ComingSoonProps) {
	return (
		<div className="flex items-center justify-center min-h-[60vh]">
			<Card className="w-full max-w-md text-center">
				<CardHeader>
					<div className="mx-auto mb-4 p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full w-fit">
						<Construction className="h-8 w-8 text-orange-600 dark:text-orange-400" />
					</div>
					<CardTitle className="text-xl">{title}</CardTitle>
					<CardDescription>{description}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{expectedFeatures.length > 0 && (
						<div className="text-left">
							<h4 className="font-medium text-sm text-gray-900 dark:text-white mb-2">
								Expected Features:
							</h4>
							<ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
								{expectedFeatures.map((feature, index) => (
									<li key={`item-${index}`} className="flex items-center">
										<ArrowRight className="h-3 w-3 mr-2 text-gray-400" />
										{feature}
									</li>
								))}
							</ul>
						</div>
					)}
					<Link href={backLink}>
						<Button variant="outline" className="w-full bg-transparent">
							Back to Dashboard
						</Button>
					</Link>
				</CardContent>
			</Card>
		</div>
	);
}
