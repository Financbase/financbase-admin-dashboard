"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Loader2, XCircle } from "lucide-react";
import type React from "react";
import { memo } from "react";

interface FormSectionProps {
	title: string;
	description?: string;
	children: React.ReactNode;
	isLoading?: boolean;
	error?: string;
	className?: string;
}

export const FormSection = memo(function FormSection({
	title,
	description,
	children,
	isLoading = false,
	error,
	className,
}: FormSectionProps) {
	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					{title}
					{isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
				</CardTitle>
				{description && <CardDescription>{description}</CardDescription>}
			</CardHeader>
			<CardContent>
				{error && (
					<Alert variant="destructive" className="mb-4">
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}
				{children}
			</CardContent>
		</Card>
	);
});
