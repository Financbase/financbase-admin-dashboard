"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarProps } from "@/lib/avatar-utils";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

interface UserAvatarProps {
	name: string;
	imageUrl?: string;
	size?: number;
	className?: string;
	showTooltip?: boolean;
}

/**
 * Smart user avatar component that uses Clerk image or falls back to generated avatar
 */
export function UserAvatar({
	name,
	imageUrl,
	size = 40,
	className,
	showTooltip = false,
}: UserAvatarProps) {
	const avatarProps = getAvatarProps(name, imageUrl, size);

	return (
		<Avatar
			className={cn("shrink-0", className)}
			style={{ width: size, height: size, minWidth: size, minHeight: size }}
		>
			{avatarProps.src && (
				<AvatarImage
					src={avatarProps.src}
					alt={avatarProps.alt}
					className="object-cover"
				/>
			)}
			<AvatarFallback
				className="text-sm font-semibold"
				style={avatarProps.style}
			>
				{avatarProps.fallback}
			</AvatarFallback>
		</Avatar>
	);
}

/**
 * User avatar with name display
 */
export function UserAvatarWithName({
	name,
	imageUrl,
	size = 40,
	className,
	showName = true,
	nameClassName,
}: UserAvatarProps & {
	showName?: boolean;
	nameClassName?: string;
}) {
	return (
		<div className={cn("flex items-center gap-3", className)}>
			<UserAvatar name={name} imageUrl={imageUrl} size={size} />
			{showName && (
				<span className={cn("text-sm font-medium", nameClassName)}>{name}</span>
			)}
		</div>
	);
}

/**
 * Compact user avatar for lists and tables
 */
export function CompactUserAvatar({
	name,
	imageUrl,
	size = 32,
	className,
}: UserAvatarProps) {
	return (
		<UserAvatar
			name={name}
			imageUrl={imageUrl}
			size={size}
			className={cn("ring-2 ring-background", className)}
		/>
	);
}

/**
 * User avatar with status indicator
 */
export function UserAvatarWithStatus({
	name,
	imageUrl,
	size = 40,
	className,
	status = "offline",
}: UserAvatarProps & {
	status?: "online" | "offline" | "away" | "busy";
}) {
	const statusColors = {
		online: "bg-green-500",
		offline: "bg-gray-400",
		away: "bg-yellow-500",
		busy: "bg-red-500",
	};

	return (
		<div className={cn("relative", className)}>
			<UserAvatar name={name} imageUrl={imageUrl} size={size} />
			<div
				className={cn(
					"absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
					statusColors[status],
				)}
			/>
		</div>
	);
}
