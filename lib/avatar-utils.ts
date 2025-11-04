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

	// Generate fallback with initials and color based on name
	const initials = getInitials(name);
	const color = getColorFromName(name);

	return {
		src: null,
		alt: `${name}'s avatar`,
		fallback: initials,
		size,
		style: {
			width: size,
			height: size,
			backgroundColor: color,
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
