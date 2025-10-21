"use client";

import { Loader2 } from "lucide-react";
import { memo } from "react";

interface LoadingSpinnerProps {
	size?: "sm" | "md" | "lg";
	text?: string;
	className?: string;
	overlay?: boolean;
}

const sizeClasses = {
	sm: "h-4 w-4",
	md: "h-6 w-6",
	lg: "h-8 w-8",
};

export const LoadingSpinner = memo(function LoadingSpinner({
	size = "md",
	text,
	className,
	overlay = false,
}: LoadingSpinnerProps) {
	const content = (
		<div className={`flex items-center justify-center ${className}`}>
			<Loader2 className={`animate-spin ${sizeClasses[size]}`} />
			{text && (
				<span className="ml-2 text-sm text-muted-foreground">{text}</span>
			)}
		</div>
	);

	if (overlay) {
		return (
			<div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
				{content}
			</div>
		);
	}

	return content;
});
