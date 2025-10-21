"use client";

import { Badge } from "@/components/ui/badge";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ChevronRight, Home, Key, Link, Link2 } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { memo } from "react";

interface BreadcrumbItemData {
	label: string;
	href?: string;
}

interface PageHeaderProps {
	title: string;
	description?: string;
	breadcrumbs?: BreadcrumbItemData[];
	actions?: React.ReactNode;
	status?: {
		label: string;
		variant?: "default" | "secondary" | "destructive" | "outline";
	};
	className?: string;
}

export const PageHeader = memo(function PageHeader({
	title,
	description,
	breadcrumbs = [],
	actions,
	status,
	className,
}: PageHeaderProps) {
	return (
		<div className={`space-y-4 ${className}`}>
			{/* Breadcrumbs */}
			{breadcrumbs.length > 0 && (
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink asChild>
								<Link href="/">
									<Home className="h-4 w-4" />
								</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>
						{breadcrumbs.map((item, index) => (
							<div
								key={`breadcrumb-${index}-${item.label}`}
								className="flex items-center"
							>
								<BreadcrumbSeparator>
									<ChevronRight className="h-4 w-4" />
								</BreadcrumbSeparator>
								<BreadcrumbItem>
									{item.href ? (
										<BreadcrumbLink asChild>
											<Link href={item.href}>{item.label}</Link>
										</BreadcrumbLink>
									) : (
										<BreadcrumbPage>{item.label}</BreadcrumbPage>
									)}
								</BreadcrumbItem>
							</div>
						))}
					</BreadcrumbList>
				</Breadcrumb>
			)}

			{/* Header Content */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div className="space-y-1">
					<div className="flex items-center gap-3">
						<h1 className="text-3xl font-bold tracking-tight">{title}</h1>
						{status && (
							<Badge variant={status.variant || "default"}>
								{status.label}
							</Badge>
						)}
					</div>
					{description && (
						<p className="text-muted-foreground">{description}</p>
					)}
				</div>
				{actions && <div className="flex items-center gap-2">{actions}</div>}
			</div>
		</div>
	);
});
