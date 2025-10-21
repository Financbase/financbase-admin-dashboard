"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import * as React from "react";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	onSearch?: (query: string) => void;
	onClear?: () => void;
	showClearButton?: boolean;
	loading?: boolean;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
	(
		{ className, onSearch, onClear, showClearButton = true, loading, ...props },
		ref,
	) => {
		const [query, setQuery] = React.useState("");

		const handleSubmit = (e: React.FormEvent) => {
			e.preventDefault();
			if (onSearch && query.trim()) {
				onSearch(query.trim());
			}
		};

		const handleClear = () => {
			setQuery("");
			if (onClear) {
				onClear();
			}
		};

		const handleKeyDown = (e: React.KeyboardEvent) => {
			if (e.key === "Enter") {
				handleSubmit(e);
			}
		};

		return (
			<form onSubmit={handleSubmit} className="relative">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					ref={ref}
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onKeyDown={handleKeyDown}
					className={cn("pl-10 pr-10", className)}
					{...props}
				/>
				{showClearButton && query && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={handleClear}
						className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
					>
						<X className="h-4 w-4" />
					</Button>
				)}
				{loading && (
					<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
						<div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
					</div>
				)}
			</form>
		);
	},
);

SearchInput.displayName = "SearchInput";
