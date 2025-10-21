import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Clock, Info, XCircle } from "lucide-react";

interface StatusIndicatorProps {
	status: string;
	variant?: "default" | "success" | "warning" | "error" | "info";
	className?: string;
}

const statusConfig = {
	active: { variant: "success" as const, label: "Active" },
	inactive: { variant: "default" as const, label: "Inactive" },
	pending: { variant: "warning" as const, label: "Pending" },
	approved: { variant: "success" as const, label: "Approved" },
	rejected: { variant: "error" as const, label: "Rejected" },
	draft: { variant: "default" as const, label: "Draft" },
	published: { variant: "success" as const, label: "Published" },
	archived: { variant: "default" as const, label: "Archived" },
	completed: { variant: "success" as const, label: "Completed" },
	failed: { variant: "error" as const, label: "Failed" },
	running: { variant: "info" as const, label: "Running" },
	paused: { variant: "warning" as const, label: "Paused" },
	overdue: { variant: "error" as const, label: "Overdue" },
	paid: { variant: "success" as const, label: "Paid" },
	outstanding: { variant: "warning" as const, label: "Outstanding" },
	sent: { variant: "info" as const, label: "Sent" },
	error: { variant: "error" as const, label: "Error" },
};

const variantStyles = {
	success: "bg-green-100 text-green-800 border-green-200",
	warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
	error: "bg-red-100 text-red-800 border-red-200",
	info: "bg-blue-100 text-blue-800 border-blue-200",
	default: "bg-gray-100 text-gray-800 border-gray-200",
};

export function StatusIndicator({
	status,
	variant,
	className,
}: StatusIndicatorProps) {
	const normalizedStatus = status.toLowerCase();
	const config = statusConfig[normalizedStatus as keyof typeof statusConfig];

	if (!config) {
		// Fallback for unknown statuses
		return (
			<Badge variant="outline" className={cn("capitalize", className)}>
				{status}
			</Badge>
		);
	}

	const finalVariant = variant || config.variant;
	const label = config.label;

	return (
		<Badge
			variant="outline"
			className={cn(
				variantStyles[finalVariant],
				"border font-medium",
				className,
			)}
		>
			{label}
		</Badge>
	);
}

export function StatusDot({
	status,
	className,
}: {
	status: string;
	className?: string;
}) {
	const normalizedStatus = status.toLowerCase();
	const config = statusConfig[normalizedStatus as keyof typeof statusConfig];

	if (!config) {
		return (
			<div className={cn("w-2 h-2 rounded-full bg-gray-400", className)} />
		);
	}

	const colorMap = {
		success: "bg-green-500",
		warning: "bg-yellow-500",
		error: "bg-red-500",
		info: "bg-blue-500",
		default: "bg-gray-500",
	};

	return (
		<div
			className={cn(
				"w-2 h-2 rounded-full",
				colorMap[config.variant],
				className,
			)}
		/>
	);
}
