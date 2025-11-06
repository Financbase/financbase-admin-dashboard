/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import {} from "lucide-react";
("use client");

import {
	type AIIconKey,
	type ActionIconKey,
	type BusinessIconKey,
	type FinancbaseIconKey,
	type FinancialIconKey,
	type FinancialOperationIconKey,
	FinancialOperationIcons,
	type SecurityIconKey,
	type StatusIconKey,
	type TimeIconKey,
	type UIIconKey,
	getFinancbaseIcon,
	getIconByCategory,
} from "@/lib/icons/financbase-icons";
import { cn } from "@/lib/utils";
import type React from "react";

// Icon size presets for consistent sizing
export const IconSizes = {
	xs: 12,
	sm: 16,
	md: 20,
	lg: 24,
	xl: 32,
	"2xl": 40,
	"3xl": 48,
} as const;

export type IconSize = keyof typeof IconSizes | number;

// Icon color presets for financial operations
export const IconColors = {
	// Financial Colors
	revenue: "text-green-600",
	expense: "text-red-600",
	profit: "text-green-500",
	loss: "text-red-500",
	neutral: "text-gray-600",

	// Status Colors
	success: "text-green-600",
	warning: "text-yellow-600",
	error: "text-red-600",
	info: "text-blue-600",

	// Business Colors
	primary: "text-blue-600",
	secondary: "text-gray-600",
	accent: "text-purple-600",

	// Default
	default: "text-current",
} as const;

export type IconColor = keyof typeof IconColors | string;

interface FinancbaseIconProps {
	// Icon identification
	name?: FinancbaseIconKey;
	category?:
		| "financial"
		| "business"
		| "ai"
		| "status"
		| "action"
		| "ui"
		| "time"
		| "security";
	categoryKey?: string;
	operation?: FinancialOperationIconKey;

	// Styling
	size?: IconSize;
	color?: IconColor;
	className?: string;

	// Accessibility
	label?: string;
	"aria-label"?: string;
	"aria-hidden"?: boolean;

	// Interactive
	onClick?: () => void;
	disabled?: boolean;

	// Animation
	animate?: boolean;
	spin?: boolean;

	// Custom props
	[key: string]: unknown;
}

/**
 * FinancbaseIcon - A comprehensive icon component for financial applications
 *
 * Features:
 * - Centralized icon management
 * - Financial operation specific icons
 * - Consistent sizing and coloring
 * - Accessibility support
 * - Animation capabilities
 * - Type safety
 */
export function FinancbaseIcon({
	name,
	category,
	categoryKey,
	operation,
	size = "md",
	color = "default",
	className,
	label,
	"aria-label": ariaLabel,
	"aria-hidden": ariaHidden,
	onClick,
	disabled = false,
	animate = false,
	spin = false,
	...props
}: FinancbaseIconProps) {
	// Determine which icon to use
	let IconComponent: React.ComponentType<React.SVGProps<SVGSVGElement>>;

	if (operation) {
		IconComponent = FinancialOperationIcons[operation];
	} else if (category && categoryKey) {
		IconComponent = getIconByCategory(category, categoryKey);
	} else if (name) {
		IconComponent = getFinancbaseIcon(name);
	} else {
		// Fallback to activity icon
		IconComponent = getFinancbaseIcon("activity");
	}

	// Calculate size
	const iconSize = typeof size === "number" ? size : IconSizes[size];

	// Calculate color class
	const colorClass =
		typeof color === "string" && color.startsWith("text-")
			? color
			: IconColors[color as keyof typeof IconColors] || color;

	// Build classes
	const classes = cn(
		// Base classes
		"inline-flex items-center justify-center",

		// Size
		size !== "md" &&
			`w-${typeof size === "number" ? size : IconSizes[size]} h-${typeof size === "number" ? size : IconSizes[size]}`,

		// Color
		colorClass,

		// Interactive
		onClick &&
			!disabled &&
			"cursor-pointer hover:opacity-80 transition-opacity",
		disabled && "opacity-50 cursor-not-allowed",

		// Animation
		animate && "animate-pulse",
		spin && "animate-spin",

		// Custom classes
		className,
	);

	// Accessibility attributes
	const accessibilityProps = {
		"aria-label": ariaLabel || label,
		"aria-hidden": ariaHidden ?? (!ariaLabel && !label),
		role: onClick ? "button" : undefined,
		tabIndex: onClick && !disabled ? 0 : undefined,
	};

	const svgProps: React.SVGProps<SVGSVGElement> = {
		width: iconSize,
		height: iconSize,
		className: classes,
		onClick: disabled ? undefined : onClick,
		"aria-label": accessibilityProps["aria-label"],
		"aria-hidden": accessibilityProps["aria-hidden"],
		role: accessibilityProps.role,
		tabIndex: accessibilityProps.tabIndex,
		...props,
	};

	return <IconComponent {...svgProps} />;
}

// Specialized icon components for common use cases
export function FinancialIcon({
	operation,
	...props
}: Omit<FinancbaseIconProps, "name" | "category" | "categoryKey"> & {
	operation: FinancialOperationIconKey;
}) {
	return <FinancbaseIcon operation={operation} {...props} />;
}

export function BusinessIcon({
	name,
	...props
}: Omit<FinancbaseIconProps, "category" | "categoryKey" | "operation"> & {
	name: BusinessIconKey;
}) {
	return <FinancbaseIcon categoryKey={name} category="business" {...props} />;
}

export function StatusIcon({
	name,
	...props
}: Omit<FinancbaseIconProps, "category" | "categoryKey" | "operation"> & {
	name: StatusIconKey;
}) {
	return <FinancbaseIcon categoryKey={name} category="status" {...props} />;
}

export function ActionIcon({
	name,
	...props
}: Omit<FinancbaseIconProps, "category" | "categoryKey" | "operation"> & {
	name: ActionIconKey;
}) {
	return <FinancbaseIcon categoryKey={name} category="action" {...props} />;
}

// Icon with text component for better UX
interface IconWithTextProps extends FinancbaseIconProps {
	text: string;
	textPosition?: "left" | "right" | "top" | "bottom";
	textSize?: "xs" | "sm" | "md" | "lg";
	textColor?: string;
	gap?: "xs" | "sm" | "md" | "lg";
}

export function IconWithText({
	text,
	textPosition = "right",
	textSize = "sm",
	textColor = "text-gray-700",
	gap = "sm",
	...iconProps
}: IconWithTextProps) {
	const gapClass = {
		xs: "gap-1",
		sm: "gap-2",
		md: "gap-3",
		lg: "gap-4",
	}[gap];

	const textSizeClass = {
		xs: "text-xs",
		sm: "text-sm",
		md: "text-base",
		lg: "text-lg",
	}[textSize];

	const containerClass = cn(
		"inline-flex items-center",
		textPosition === "top" || textPosition === "bottom"
			? "flex-col"
			: "flex-row",
		gapClass,
	);

	return (
		<div className={containerClass}>
			{textPosition === "left" && (
				<span className={cn(textSizeClass, textColor)}>{text}</span>
			)}
			<FinancbaseIcon {...iconProps} />
			{textPosition === "right" && (
				<span className={cn(textSizeClass, textColor)}>{text}</span>
			)}
			{textPosition === "top" && (
				<span className={cn(textSizeClass, textColor)}>{text}</span>
			)}
			{textPosition === "bottom" && (
				<span className={cn(textSizeClass, textColor)}>{text}</span>
			)}
		</div>
	);
}

// Export types for external use
export type { FinancbaseIconProps, IconWithTextProps };
