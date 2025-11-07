/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export interface AvatarProps {
	src?: string | null;
	alt?: string;
	fallback?: string;
	size?: number;
	style?: React.CSSProperties;
	gradientClassName?: string;
}

/**
 * Generate gradient class names based on name for consistent avatar styling
 * Uses Financbase brand colors (hue 231.6 - blue)
 * Base color: hsl(231.6 54% 36%) / rgb(43, 57, 143) / oklch(0.388 0.1423 271.13)
 */
export function getGradientFromName(name: string): string {
	// Financbase brand color gradients using primary color (hue 231.6 - blue)
	// Creating variations with different lightness and saturation for visual variety
	const gradients = [
		// Primary brand color variations
		'bg-gradient-to-br from-primary to-primary/80',
		'bg-gradient-to-br from-[hsl(231.6_54%_42%)] to-[hsl(231.6_54%_30%)]',
		'bg-gradient-to-br from-[hsl(231.6_58%_44%)] to-[hsl(231.6_50%_32%)]',
		'bg-gradient-to-br from-[hsl(231.6_50%_46%)] to-[hsl(231.6_58%_28%)]',
		'bg-gradient-to-br from-[hsl(231.6_60%_40%)] to-[hsl(231.6_48%_34%)]',
		'bg-gradient-to-br from-[hsl(231.6_52%_44%)] to-[hsl(231.6_56%_30%)]',
		// Slightly shifted hues for subtle variation while staying in brand blue
		'bg-gradient-to-br from-[hsl(229_54%_42%)] to-[hsl(234_54%_30%)]',
		'bg-gradient-to-br from-[hsl(230_58%_40%)] to-[hsl(233_50%_34%)]',
		'bg-gradient-to-br from-[hsl(230.5_52%_44%)] to-[hsl(232.7_56%_30%)]',
		'bg-gradient-to-br from-[hsl(231.6_54%_46%)] to-[hsl(231.6_54%_28%)]',
		'bg-gradient-to-br from-[hsl(232_58%_40%)] to-[hsl(231_50%_34%)]',
		'bg-gradient-to-br from-[hsl(231.6_50%_48%)] to-[hsl(231.6_58%_26%)]',
	];

	const hash = name.split('').reduce((acc, char) => {
		return acc + char.charCodeAt(0);
	}, 0);

	return gradients[hash % gradients.length];
}

/**
 * Generate avatar props for user display
 */
export function getAvatarProps(
	name: string,
	imageUrl?: string | null,
	size: number = 40
): AvatarProps {
	// If image URL is provided, use it
	if (imageUrl?.trim()) {
		return {
			src: imageUrl,
			alt: `${name}'s avatar`,
			fallback: getInitials(name),
			size,
			style: { width: size, height: size },
		};
	}

	// Generate fallback with initials and gradient based on name
	const initials = getInitials(name);
	const gradientClassName = getGradientFromName(name);

	return {
		src: null,
		alt: `${name}'s avatar`,
		fallback: initials,
		size,
		gradientClassName,
		style: {
			width: size,
			height: size,
			color: 'white',
			fontWeight: 'bold',
			fontSize: size * 0.4,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
		},
	};
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
	return name
		.split(' ')
		.map(word => word.charAt(0).toUpperCase())
		.slice(0, 2)
		.join('');
}

/**
 * Generate a consistent color based on name
 */
export function getColorFromName(name: string): string {
	const colors = [
		'#ef4444', // red
		'#f97316', // orange
		'#eab308', // yellow
		'#22c55e', // green
		'#06b6d4', // cyan
		'#3b82f6', // blue
		'#8b5cf6', // violet
		'#ec4899', // pink
		'#f43f5e', // rose
		'#84cc16', // lime
	];

	const hash = name.split('').reduce((acc, char) => {
		return acc + char.charCodeAt(0);
	}, 0);

	return colors[hash % colors.length];
}

/**
 * Validate image URL
 */
export function isValidImageUrl(url: string): boolean {
	try {
		new URL(url);
		return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
	} catch {
		return false;
	}
}

/**
 * Get avatar URL from user data
 */
export function getAvatarUrl(user: {
	avatarUrl?: string | null;
	imageUrl?: string | null;
	profileImage?: string | null;
}): string | null {
	if (!user) return null;

	// Check for uploaded avatar
	if (user.avatarUrl?.trim()) {
		return user.avatarUrl;
	}

	// Check for Clerk avatar
	if (user.imageUrl?.trim()) {
		return user.imageUrl;
	}

	// Check for profile image
	if (user.profileImage?.trim()) {
		return user.profileImage;
	}

	return null;
}
