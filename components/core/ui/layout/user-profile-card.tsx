/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { type Transition, motion } from "framer-motion";
import {
	Activity,
	AlertCircle,
	ArrowUpRight,
	CheckCircle,
	Key,
	Loader2,
	Star,
	User,
	XCircle,
} from "lucide-react";
import type * as React from "react";

const transition: Transition = { type: "spring", stiffness: 300, damping: 30 };

const textSwitchTransition: Transition = { duration: 0.22, ease: "easeInOut" };
const summaryTextVariants = {
	collapsed: { opacity: 1, y: 0 },
	expanded: { opacity: 0, y: -16 },
};
const actionTextVariants = {
	collapsed: { opacity: 0, y: 16 },
	expanded: { opacity: 1, y: 0 },
};

export interface UserProfileData {
	id: number;
	email: string;
	firstName?: string;
	lastName?: string;
	role: string;
	profileCompletion: number;
	activityLevel: number;
	reputation: number;
	avatarUrl?: string;
	metadata?: any;
}

export interface UserProfileCardProps {
	user?: UserProfileData | null | undefined;
	isLoading?: boolean;
	error?: string | null;
	onViewProfile?: () => void;
	showStats?: boolean;
	compact?: boolean;
	className?: string;
}

const defaultAvatarUrl =
	"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face";

const LoadingSkeleton = () => (
	<div className="bg-neutral-200 dark:bg-neutral-900 p-3 rounded-3xl w-xs space-y-3 shadow-md">
		<div className="bg-neutral-100 dark:bg-neutral-800 rounded-xl px-4 py-4 shadow-sm">
			<div className="flex items-center gap-4">
				<div className="size-12 rounded-full bg-neutral-300 dark:bg-neutral-700 animate-pulse" />
				<div className="space-y-2">
					<div className="h-4 w-24 bg-neutral-300 dark:bg-neutral-700 rounded animate-pulse" />
					<div className="h-3 w-20 bg-neutral-300 dark:bg-neutral-700 rounded animate-pulse" />
				</div>
			</div>
			<div className="mt-4 space-y-2">
				{[1, 2, 3].map((i) => (
					<div key={i} className="flex items-center justify-between">
						<div className="h-3 w-20 bg-neutral-300 dark:bg-neutral-700 rounded animate-pulse" />
						<div className="h-3 w-8 bg-neutral-300 dark:bg-neutral-700 rounded animate-pulse" />
					</div>
				))}
			</div>
		</div>
		<div className="flex items-center gap-2">
			<div className="size-5 rounded-full bg-neutral-300 dark:bg-neutral-700 animate-pulse" />
			<div className="h-4 w-24 bg-neutral-300 dark:bg-neutral-700 rounded animate-pulse" />
		</div>
	</div>
);

const ErrorState = ({
	error,
	onRetry,
}: { error: string; onRetry?: (() => void) | undefined }) => (
	<div className="bg-neutral-200 dark:bg-neutral-900 p-3 rounded-3xl w-xs space-y-3 shadow-md">
		<div className="bg-neutral-100 dark:bg-neutral-800 rounded-xl px-4 py-4 shadow-sm">
			<div className="flex items-center gap-3 text-red-600 dark:text-red-400">
				<AlertCircle className="size-5 flex-shrink-0" />
				<div>
					<p className="text-sm font-medium">Failed to load profile</p>
					<p className="text-xs text-red-500 dark:text-red-300 mt-1">{error}</p>
				</div>
			</div>
			{onRetry && (
				<button
					onClick={onRetry}
					className="mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline"
				>
					Try again
				</button>
			)}
		</div>
	</div>
);

const stats = [
	{
		label: "Profile Completion",
		value: "90%",
		Icon: CheckCircle,
		key: "profileCompletion" as keyof UserProfileData,
	},
	{
		label: "Activity Level",
		value: "75%",
		Icon: Activity,
		key: "activityLevel" as keyof UserProfileData,
	},
	{
		label: "Reputation",
		value: "85%",
		Icon: Star,
		key: "reputation" as keyof UserProfileData,
	},
];

export const Component: React.FC<UserProfileCardProps> = ({
	user,
	isLoading = false,
	error = null,
	onViewProfile,
	showStats = true,
	compact = false,
	className = "",
}) => {
	if (isLoading) {
		return <LoadingSkeleton />;
	}

	if (error) {
		return <ErrorState error={error} onRetry={onViewProfile} />;
	}

	if (!user) {
		return (
			<ErrorState error="No user data available" onRetry={onViewProfile} />
		);
	}

	const displayName =
		user.firstName && user.lastName
			? `${user.firstName} ${user.lastName}`
			: user.firstName || user.email.split("@")[0];

	const avatarUrl = user.avatarUrl || defaultAvatarUrl;

	return (
		<motion.div
			className={`bg-neutral-200 dark:bg-neutral-900 p-3 rounded-3xl w-xs space-y-3 shadow-md ${className}`}
			initial="collapsed"
			whileHover="expanded"
		>
			<motion.div
				layout="position"
				transition={transition}
				className="bg-neutral-100 dark:bg-neutral-800 rounded-xl px-4 py-4 shadow-sm"
			>
				<div className="flex items-center gap-4">
					<img
						src={avatarUrl}
						alt={`${displayName}'s avatar`}
						className="size-12 rounded-full object-cover"
						onError={(e) => {
							// Fallback to default avatar if image fails to load
							(e.target as HTMLImageElement).src = defaultAvatarUrl;
						}}
					/>
					<div>
						<h1 className="text-sm font-semibold">{displayName}</h1>
						<p className="text-xs text-neutral-500 font-medium capitalize">
							{user.role}
						</p>
					</div>
				</div>

				{showStats && !compact && (
					<motion.div
						variants={{
							collapsed: { height: 0, opacity: 0, marginTop: 0 },
							expanded: { height: "auto", opacity: 1, marginTop: "16px" },
						}}
						transition={{ staggerChildren: 0.1, ...transition }}
						className="overflow-hidden"
					>
						{stats.map(({ label, Icon, key }) => {
							const value = user[key] as number;
							const percentageValue = `${value}%`;

							return (
								<motion.div
									key={label}
									variants={{
										collapsed: { opacity: 0, y: 10 },
										expanded: { opacity: 1, y: 0 },
									}}
									transition={transition}
									className="mt-2"
								>
									<div className="flex items-center justify-between text-xs font-medium text-neutral-500 mb-1">
										<div className="flex items-center gap-1.5">
											<Icon className="size-3.5" />
											{label}
										</div>
										<span>{percentageValue}</span>
									</div>
									<div className="h-1.5 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full">
										<motion.div
											className="h-1.5 bg-sky-500 rounded-full"
											variants={{
												collapsed: { width: 0 },
												expanded: { width: percentageValue },
											}}
											transition={transition}
										/>
									</div>
								</motion.div>
							);
						})}
					</motion.div>
				)}
			</motion.div>

			<div className="flex items-center gap-2">
				<div className="size-5 rounded-full bg-sky-500 text-white flex items-center justify-center">
					<User className="size-3" />
				</div>
				<span className="grid">
					<motion.span
						className="text-sm font-medium text-neutral-600 dark:text-neutral-300 row-start-1 col-start-1"
						variants={summaryTextVariants}
					>
						{compact ? "Profile" : "Team Profile"}
					</motion.span>
					<motion.button
						onClick={onViewProfile}
						className="text-sm font-medium text-neutral-600 dark:text-neutral-300 flex items-center gap-1 cursor-pointer select-none row-start-1 col-start-1"
						variants={actionTextVariants}
					>
						{compact ? "View" : "View Full Profile"}
						<ArrowUpRight className="size-4" />
					</motion.button>
				</span>
			</div>
		</motion.div>
	);
};
