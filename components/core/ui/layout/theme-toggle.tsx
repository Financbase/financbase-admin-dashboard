"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import Switch from "@/components/ui/sky-toggle";
import { useThemeManager } from "@/hooks/use-theme-manager";

export function ThemeToggle() {
	const { toggleTheme, resolved } = useThemeManager();

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={toggleTheme}
			className="h-9 w-9"
			title={`Switch to ${resolved === 'light' ? 'dark' : 'light'} theme`}
		>
			<Switch />
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
