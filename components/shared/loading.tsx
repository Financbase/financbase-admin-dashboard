import { Key, MessageCircle } from "lucide-react";
("use client");

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
	size?: "sm" | "md" | "lg";
	className?: string;
}

export function LoadingSpinner({
	size = "md",
	className,
}: LoadingSpinnerProps) {
	const sizeClasses = {
		sm: "h-4 w-4",
		md: "h-6 w-6",
		lg: "h-8 w-8",
	};

	return (
		<div
			className={cn(
				"animate-spin rounded-full border-2 border-muted border-t-primary",
				sizeClasses[size],
				className,
			)}
		/>
	);
}

interface SkeletonProps {
	className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
	return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}

// Pre-built skeleton components
export function CardSkeleton({ className }: { className?: string }) {
	return (
		<Card className={className}>
			<CardHeader>
				<Skeleton className="h-4 w-3/4" />
				<Skeleton className="h-3 w-1/2" />
			</CardHeader>
			<CardContent>
				<Skeleton className="h-4 w-full mb-2" />
				<Skeleton className="h-4 w-2/3" />
			</CardContent>
		</Card>
	);
}

export function TableSkeleton({
	rows = 5,
	columns = 4,
}: {
	rows?: number;
	columns?: number;
}) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<Skeleton className="h-10 w-64" />
				<Skeleton className="h-10 w-32" />
			</div>
			<div className="border rounded-lg">
				<div className="h-12 bg-muted animate-pulse" />
				{Array.from({ length: rows }).map((_, i) => (
					<div key={i} className="h-16 bg-muted animate-pulse border-t" />
				))}
			</div>
		</div>
	);
}

export function ListSkeleton({ items = 5 }: { items?: number }) {
	return (
		<div className="space-y-4">
			{Array.from({ length: items }).map((_, i) => (
				<div key={i} className="flex items-center space-x-4">
					<Skeleton className="h-10 w-10 rounded-full" />
					<div className="space-y-2">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-3 w-24" />
					</div>
				</div>
			))}
		</div>
	);
}

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
	return (
		<div className="space-y-6">
			{Array.from({ length: fields }).map((_, i) => (
				<div key={i} className="space-y-2">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-10 w-full" />
				</div>
			))}
			<div className="flex justify-end gap-2">
				<Skeleton className="h-10 w-20" />
				<Skeleton className="h-10 w-20" />
			</div>
		</div>
	);
}

export function DashboardSkeleton() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<Skeleton className="h-8 w-64 mb-2" />
					<Skeleton className="h-4 w-48" />
				</div>
				<div className="flex gap-2">
					<Skeleton className="h-10 w-24" />
					<Skeleton className="h-10 w-24" />
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<CardSkeleton key={i} />
				))}
			</div>

			{/* Charts */}
			<div className="grid gap-4 md:grid-cols-2">
				<CardSkeleton className="h-64" />
				<CardSkeleton className="h-64" />
			</div>

			{/* Table */}
			<TableSkeleton />
		</div>
	);
}

interface LoadingOverlayProps {
	isLoading: boolean;
	children: React.ReactNode;
	message?: string;
}

export function LoadingOverlay({
	isLoading,
	children,
	message = "Loading...",
}: LoadingOverlayProps) {
	return (
		<div className="relative">
			{children}
			{isLoading && (
				<div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
					<div className="flex flex-col items-center gap-4">
						<LoadingSpinner size="lg" />
						<p className="text-sm text-muted-foreground">{message}</p>
					</div>
				</div>
			)}
		</div>
	);
}

interface LoadingButtonProps {
	isLoading: boolean;
	children: React.ReactNode;
	loadingText?: string;
	className?: string;
	onClick?: () => void;
	disabled?: boolean;
}

export function LoadingButton({
	isLoading,
	children,
	loadingText = "Loading...",
	className,
	onClick,
	disabled,
}: LoadingButtonProps) {
	return (
		<button
			className={cn(
				"inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				"disabled:pointer-events-none disabled:opacity-50",
				"bg-primary text-primary-foreground hover:bg-primary/90",
				"h-10 px-4 py-2",
				className,
			)}
			onClick={onClick}
			disabled={disabled || isLoading}
		>
			{isLoading ? (
				<>
					<LoadingSpinner size="sm" className="mr-2" />
					{loadingText}
				</>
			) : (
				children
			)}
		</button>
	);
}
