"use client";

import React from "react";

interface FinancbaseLogoProps {
	className?: string;
	size?: "sm" | "md" | "lg";
	variant?: "full" | "symbol";
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

	const logoSrc =
		variant === "symbol" ? "/financbasesymbol.png" : "/financbase-logo.png";

	return (
		<div className="relative inline-block">
			<img
				src={logoSrc}
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
