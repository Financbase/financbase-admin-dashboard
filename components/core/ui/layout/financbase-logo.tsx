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
import { useBrandingContext } from "@/contexts/branding-context";

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
	const { branding, getLogo, getCompanyName } = useBrandingContext();
	
	const sizeClasses = {
		sm: "h-6 w-auto",
		md: "h-8 w-auto",
		lg: "h-12 w-auto",
	};

	const getLogoSrc = () => {
		// Use branded logo if available
		if (variant === "white") {
			return getLogo(true) || "/financbase-logo-white.png";
		} else if (variant === "symbol") {
			// For symbol variant, use default for now (can be extended)
			return "/financbasesymbol.png";
		}
		return getLogo(false) || "/financbase-logo.png";
	};

	const companyName = getCompanyName();

	return (
		<div className="relative inline-block">
			<img
				src={getLogoSrc()}
				alt={`${companyName} Logo`}
				className={`${sizeClasses[size]} ${className} no-filter`}
				style={{
					filter: "none",
					WebkitFilter: "none",
				}}
			/>
		</div>
	);
}
