/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Link2 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface PageTemplateProps {
	title: string;
	description?: string;
	badge?: string;
	isNew?: boolean;
	backLink?: string;
	actions?: ReactNode;
	children: ReactNode;
}

export function PageTemplate({
	title,
	description,
	badge,
	isNew,
	backLink,
	actions,
	children,
}: PageTemplateProps) {
	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					{backLink && (
						<Link href={backLink}>
							<Button variant="ghost" size="sm">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back
							</Button>
						</Link>
					)}
					<div>
						<div className="flex items-center space-x-2">
							<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
								{title}
							</h1>
							{badge && (
								<Badge variant="secondary" className="text-xs">
									{badge}
								</Badge>
							)}
							{isNew && (
								<Badge
									variant="default"
									className="text-xs bg-green-500 text-white"
								>
									New
								</Badge>
							)}
						</div>
						{description && (
							<p className="text-gray-600 dark:text-gray-300 mt-1">
								{description}
							</p>
						)}
					</div>
				</div>
				{actions && (
					<div className="flex items-center space-x-2">{actions}</div>
				)}
			</div>

			{/* Page Content */}
			<div className="space-y-6">{children}</div>
		</div>
	);
}
