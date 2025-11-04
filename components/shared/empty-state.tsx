/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
	icon?: LucideIcon;
	title: string;
	description: string;
	action?: {
		label: string;
		onClick: () => void;
		variant?:
			| "default"
			| "destructive"
			| "outline"
			| "secondary"
			| "ghost"
			| "link";
	};
	className?: string;
}

export function EmptyState({
	icon: Icon,
	title,
	description,
	action,
	className = "",
}: EmptyStateProps) {
	return (
		<Card className={className}>
			<CardContent className="flex flex-col items-center justify-center py-12">
				{Icon && (
					<div className="mb-4 p-3 rounded-full bg-muted">
						<Icon className="h-8 w-8 text-muted-foreground" />
					</div>
				)}
				<h3 className="text-lg font-semibold mb-2">{title}</h3>
				<p className="text-muted-foreground text-center mb-6 max-w-sm">
					{description}
				</p>
				{action && (
					<Button
						variant={action.variant || "default"}
						onClick={action.onClick}
					>
						{action.label}
					</Button>
				)}
			</CardContent>
		</Card>
	);
}

interface EmptyStateWithIllustrationProps {
	illustration: React.ReactNode;
	title: string;
	description: string;
	action?: {
		label: string;
		onClick: () => void;
		variant?:
			| "default"
			| "destructive"
			| "outline"
			| "secondary"
			| "ghost"
			| "link";
	};
	className?: string;
}

export function EmptyStateWithIllustration({
	illustration,
	title,
	description,
	action,
	className = "",
}: EmptyStateWithIllustrationProps) {
	return (
		<Card className={className}>
			<CardContent className="flex flex-col items-center justify-center py-12">
				<div className="mb-6">{illustration}</div>
				<h3 className="text-lg font-semibold mb-2">{title}</h3>
				<p className="text-muted-foreground text-center mb-6 max-w-sm">
					{description}
				</p>
				{action && (
					<Button
						variant={action.variant || "default"}
						onClick={action.onClick}
					>
						{action.label}
					</Button>
				)}
			</CardContent>
		</Card>
	);
}
