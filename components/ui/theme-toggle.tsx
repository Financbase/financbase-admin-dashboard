"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useThemeManager } from "@/hooks/use-theme-manager";

export function ThemeToggle() {
  const { toggleTheme, resolved, isMounted } = useThemeManager();

  if (!isMounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 hover:bg-accent transition-colors"
        disabled
      >
        <Sun className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 hover:bg-accent transition-colors"
      title={`Switch to ${resolved === 'light' ? 'dark' : 'light'} theme`}
    >
      {resolved === "light" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
