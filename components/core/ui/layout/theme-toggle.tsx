"use client";

import { useTheme } from "next-themes";
import * as React from "react";

import { Button } from "@/components/ui/button";
import Switch from "@/components/ui/sky-toggle";

export function ThemeToggle() {
	const { setTheme, theme } = useTheme();

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={() => setTheme(theme === "light" ? "dark" : "light")}
			className="h-9 w-9"
		>
			<Switch />
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
