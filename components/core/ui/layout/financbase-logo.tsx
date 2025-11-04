/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import React from "react";

interface FinancbaseLogoProps {
	className?: string;
	size?: "sm" | "md" | "lg";
	variant?: "full" | "symbol" | "white";
}

export function FinancbaseLogo({
	className = "",
	size = "md",
	variant = "full",
}: FinancbaseLogoProps) {
	const sizeClasses = {
		sm: "h-6 w-auto",
		md: "h-8 w-auto",
		lg: "h-12 w-auto",
	};

	const getLogoSrc = () => {
		if (variant === "symbol") {
			return "/financbasesymbol.png";
		} else if (variant === "white") {
			return "/financbase-logo-white.png";
		}
		return "/financbase-logo.png";
	};

	return (
		<div className="relative inline-block">
			<img
				src={getLogoSrc()}
				alt="Financbase Logo"
				className={`${sizeClasses[size]} ${className} no-filter`}
				style={{
					filter: "none",
					WebkitFilter: "none",
				}}
			/>
		</div>
	);
}
