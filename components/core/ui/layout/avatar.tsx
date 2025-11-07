/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as React from "react";

import { cn } from "@/lib/utils";

const Avatar = React.forwardRef<
	React.ElementRef<typeof AvatarPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, style, ...props }, ref) => {
	// Check if size is explicitly set via className or style
	const hasCustomSize = 
		(typeof className === "string" && (className.includes("h-") || className.includes("w-"))) ||
		(style && ("width" in style || "height" in style));

	return (
		<AvatarPrimitive.Root
			ref={ref}
			className={cn(
				"relative flex shrink-0 overflow-hidden rounded-full",
				// Default size - only apply if no custom size is provided
				!hasCustomSize && "h-10 w-10",
				className,
			)}
			style={style}
			{...props}
		/>
	);
});
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
	React.ElementRef<typeof AvatarPrimitive.Image>,
	React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
	<AvatarPrimitive.Image
		ref={ref}
		className={cn(
			"aspect-square h-full w-full object-cover object-center",
			// Ensure image respects container bounds
			"max-w-full max-h-full",
			className,
		)}
		{...props}
	/>
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
	React.ElementRef<typeof AvatarPrimitive.Fallback>,
	React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
	<AvatarPrimitive.Fallback
		ref={ref}
		className={cn(
			"flex h-full w-full items-center justify-center rounded-[inherit] text-xs",
			// Only apply default background if no gradient class is provided
			!className?.includes("bg-gradient") && !className?.includes("bg-") && "bg-secondary",
			className,
		)}
		{...props}
	/>
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarFallback, AvatarImage };
