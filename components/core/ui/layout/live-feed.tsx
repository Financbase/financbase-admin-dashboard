/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";
import { Button } from "@/components/ui/button";
import { type LiveFeedItem, useLiveFeed } from "@/hooks/use-live-feed";
import { cn } from "@/lib/utils";
import {
	AlertCircle,
	Clock,
	CreditCard,
	Image,
	Info,
	Key,
	MessageCircle,
	RefreshCw,
	Wifi,
	WifiOff,
	XCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

type FeedItem = LiveFeedItem;

type NotificationFeedProps = {
	cardTitle?: string;
	cardDescription?: string;
	feed?: FeedItem[];
	limit?: number;
	entityTypes?: string[];
	autoRefresh?: boolean;
	showControls?: boolean;
	className?: string;
};

const defaultFeed: FeedItem[] = [
	{
		id: "1",
		title: "Stripe",
		message: "Payment succeeded $29.00",
		time: "1m",
		icon: "💳",
		type: "payment",
		action: "created",
		timestamp: new Date().toISOString(),
	},
	{
		id: "2",
		title: "Linear",
		message: "Issue S-123 assigned",
		time: "3m",
		icon: "📋",
		type: "task",
		action: "assigned",
		timestamp: new Date().toISOString(),
	},
	{
		id: "3",
		title: "Slack",
		message: "New mention in #ops",
		time: "7m",
		icon: "💬",
		type: "message",
		action: "mentioned",
		timestamp: new Date().toISOString(),
	},
	{
		id: "4",
		title: "Sentry",
		message: "New error in prod",
		time: "10m",
		icon: "🚨",
		type: "error",
		action: "detected",
		timestamp: new Date().toISOString(),
	},
];

export const NotificationCenterFeed = ({
	cardTitle = "Live feed",
	cardDescription = "Auto-scrolling updates; hover to pause and focus.",
	feed = defaultFeed,
	limit = 10,
	entityTypes,
	autoRefresh = true,
	showControls = false,
	className,
}: NotificationFeedProps) => {
	const [isHovered, setIsHovered] = useState(false);
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	// Use the live feed hook for real data - eliminate redundant state
	const {
		items,
		isLoading,
		isError,
		error,
		isPaused,
		timeSinceLastUpdate,
		refresh,
		pause,
		resume,
		hasItems,
	} = useLiveFeed({
		limit,
		entityTypes,
		autoRefresh,
		onError: (error: Error) => {
			console.error("Live feed error:", error);
		},
	});

	// Auto-scrolling logic with proper cleanup
	useEffect(() => {
		if (isHovered || isPaused || !autoRefresh || items.length === 0) {
			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}
			return;
		}

		timerRef.current = setInterval(() => {
			// Note: Auto-scrolling is handled by the useLiveFeed hook
			// This effect is for any additional scrolling logic if needed
		}, 1600);

		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}
		};
	}, [isHovered, isPaused, autoRefresh, items.length]);

	// Handle hover pause/resume
	const handleMouseEnter = () => {
		setIsHovered(true);
		pause();
	};

	const handleMouseLeave = () => {
		setIsHovered(false);
		if (autoRefresh) {
			resume();
		}
	};

	// Loading state
	if (isLoading && items.length === 0) {
		return (
			<motion.div
				className={cn(
					"relative",
					"flex max-w-[350px] items-center justify-center",
					"rounded-lg border border-primary/5 bg-neutral-100 p-6 dark:bg-neutral-950",
					className,
				)}
			>
				<div className="relative h-[230px] w-[264px] overflow-hidden rounded-[14px] bg-neutral-200 p-2 dark:bg-neutral-900/50">
					<div className="flex h-full items-center justify-center">
						<div className="flex flex-col items-center gap-2 text-neutral-500">
							<RefreshCw className="h-6 w-6 animate-spin" />
							<span className="text-sm">Loading live feed...</span>
						</div>
					</div>
				</div>
			</motion.div>
		);
	}

	// Error state
	if (isError && items.length === 0) {
		return (
			<motion.div
				className={cn(
					"relative",
					"flex max-w-[350px] items-center justify-center",
					"rounded-lg border border-destructive/20 bg-neutral-100 p-6 dark:bg-neutral-950",
					className,
				)}
			>
				<div className="relative h-[230px] w-[264px] overflow-hidden rounded-[14px] bg-neutral-200 p-2 dark:bg-neutral-900/50">
					<div className="flex h-full flex-col items-center justify-center gap-3 text-neutral-500">
						<AlertCircle className="h-8 w-8 text-destructive" />
						<div className="text-center">
							<p className="text-sm font-medium">Unable to load live feed</p>
							<p className="text-xs text-neutral-400 mt-1">
								{error?.message || "Connection error"}
							</p>
						</div>
						{showControls && (
							<Button
								variant="outline"
								size="sm"
								onClick={refresh}
								className="text-xs"
							>
								<RefreshCw className="h-3 w-3 mr-1" />
								Retry
							</Button>
						)}
					</div>
				</div>
			</motion.div>
		);
	}

	return (
		<motion.div
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			className={cn(
				"relative",
				"flex max-w-[350px] items-center justify-center",
				"rounded-lg border border-primary/5 bg-neutral-100 p-6 dark:bg-neutral-950",
				className,
			)}
		>
			<div className="relative h-[230px] w-[264px] overflow-hidden rounded-[14px] bg-neutral-200 p-2 dark:bg-neutral-900/50">
				{/* Status indicator */}
				<div className="absolute left-3 top-2 flex items-center gap-1 text-[9px] text-neutral-500">
					<div
						className={cn(
							"h-1.5 w-1.5 rounded-full",
							isError
								? "bg-destructive"
								: isLoading
									? "bg-yellow-500 animate-pulse"
									: isPaused
										? "bg-orange-500"
										: "bg-green-500",
						)}
					/>
					{isError ? (
						<>
							<WifiOff className="h-2.5 w-2.5" />
							<span>Disconnected</span>
						</>
					) : isPaused ? (
						<>
							<span>Paused</span>
						</>
					) : (
						<>
							<Wifi className="h-2.5 w-2.5" />
							<span>
								{new Date().toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
									hour12: false,
								})}
							</span>
						</>
					)}
				</div>

				{/* Refresh button for controls */}
				{showControls && (
					<div className="absolute right-3 top-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={refresh}
							disabled={isLoading}
							className="h-6 w-6 p-0 text-neutral-500 hover:text-neutral-700"
						>
							<RefreshCw
								className={cn("h-3 w-3", isLoading && "animate-spin")}
							/>
						</Button>
					</div>
				)}

				<div className="absolute inset-x-2 bottom-2 top-8">
					{items.length === 0 ? (
						<div className="flex h-full items-center justify-center">
							<div className="text-center text-neutral-500">
								<p className="text-sm">No recent activity</p>
								<p className="text-xs text-neutral-400">
									Activities will appear here
								</p>
							</div>
						</div>
					) : (
						items.map((it: any, i: number) => (
							<motion.div
								key={it.id + i}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.25, delay: i * 0.05 }}
								className="mb-2 rounded-md border bg-neutral-300 p-2 text-xs shadow dark:border-neutral-800 dark:bg-neutral-800"
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-1">
										<span className="text-sm">{it.icon}</span>
										<span className="font-medium text-neutral-900 dark:text-neutral-100 truncate max-w-[120px]">
											{it.title}
										</span>
									</div>
									<span className="text-[10px] text-neutral-500">
										{it.time}
									</span>
								</div>
								<div className="mt-1 truncate text-neutral-700 dark:text-neutral-400">
									{it.message}
								</div>
							</motion.div>
						))
					)}
				</div>
			</div>

			{/* Gradient overlays */}
			<div className="pointer-events-none absolute bottom-0 left-0 hidden h-[160px] w-full rounded-b-lg [background-image:linear-gradient(to_top,#0a0a0a_65%,transparent_100%)] dark:block" />
			<div className="pointer-events-none absolute bottom-0 left-0 block h-[160px] w-full rounded-b-lg [background-image:linear-gradient(to_top,#f5f5f5_65%,transparent_100%)] dark:hidden" />

			{/* Card info */}
			<div className="absolute bottom-4 left-0 w-full px-6">
				<h3 className="text-sm font-semibold text-primary">{cardTitle}</h3>
				<p className="mt-1 text-xs text-neutral-500">{cardDescription}</p>
				{showControls && timeSinceLastUpdate && (
					<p className="mt-1 text-[10px] text-neutral-400">
						Updated {timeSinceLastUpdate}
					</p>
				)}
			</div>
		</motion.div>
	);
};

export default NotificationCenterFeed;
