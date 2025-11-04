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
import type { ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type React from "react";
import { memo } from "react";

interface ActionButtonProps extends Omit<ButtonProps, "disabled"> {
	isLoading?: boolean;
	loadingText?: string;
	icon?: React.ReactNode;
	children: React.ReactNode;
}

export const ActionButton = memo(function ActionButton({
	isLoading = false,
	loadingText,
	icon,
	children,
	className,
	...props
}: ActionButtonProps) {
	return (
		<Button disabled={isLoading} className={className} {...props}>
			{isLoading ? (
				<>
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					{loadingText || "Loading..."}
				</>
			) : (
				<>
					{icon && <span className="mr-2">{icon}</span>}
					{children}
				</>
			)}
		</Button>
	);
});
