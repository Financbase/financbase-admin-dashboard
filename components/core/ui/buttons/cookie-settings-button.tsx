"use client";

import { Button } from "@/components/ui/button";
import CookiePreferencesModal from "@/components/ui/cookie-preferences-modal";
import { useState } from "react";

interface CookieSettingsButtonProps {
	variant?: "default" | "outline" | "ghost";
	size?: "default" | "sm" | "lg";
	className?: string;
}

export default function CookieSettingsButton({
	variant = "outline",
	size = "sm",
	className,
}: CookieSettingsButtonProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	return (
		<>
			<Button
				variant={variant}
				size={size}
				onClick={() => setIsModalOpen(true)}
				className={className}
			>
				🍪 Cookie Settings
			</Button>

			<CookiePreferencesModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
			/>
		</>
	);
}
