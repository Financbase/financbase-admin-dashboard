'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useSearch, SearchResult } from '@/hooks/use-search';

interface SearchComponentProps {
	className?: string;
	placeholder?: string;
	showShortcuts?: boolean;
}

const typeLabels = {
	page: 'Pages',
	transaction: 'Transactions',
	invoice: 'Invoices',
	client: 'Clients',
	report: 'Reports',
	setting: 'Settings',
};

const typeIcons = {
	page: '📄',
	transaction: '💳',
	invoice: '📋',
	client: '👥',
	report: '📊',
	setting: '⚙️',
};

export function SearchComponent({ 
	className, 
	placeholder = "Search financial data, reports, and actions...",
	showShortcuts = true 
}: SearchComponentProps) {
	const {
		query,
		setQuery,
		groupedResults,
		isLoading,
		isOpen,
		setIsOpen,
		selectedIndex,
		clearSearch,
		selectResult,
		hasResults,
	} = useSearch();

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(e.target.value);
		if (!isOpen) setIsOpen(true);
	};

	const handleResultClick = (result: SearchResult) => {
		selectResult(result);
	};

	const renderResult = (result: SearchResult, index: number) => {
		const isSelected = selectedIndex === index;
		
		return (
			<motion.div
				key={result.id}
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: index * 0.05 }}
				className={cn(
					"flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
					"hover:bg-accent hover:text-accent-foreground",
					isSelected && "bg-accent text-accent-foreground"
				)}
				onClick={() => handleResultClick(result)}
			>
				<div className="flex-shrink-0 w-8 h-8 rounded-md bg-muted flex items-center justify-center text-sm">
					{typeIcons[result.type]}
				</div>
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<h4 className="font-medium text-sm truncate">{result.title}</h4>
						<Badge variant="secondary" className="text-xs">
							{typeLabels[result.type]}
						</Badge>
					</div>
					<p className="text-xs text-muted-foreground truncate">
						{result.description}
					</p>
					{result.metadata && (
						<div className="flex items-center gap-2 mt-1">
							{result.metadata.amount && (
								<span className="text-xs font-medium">
									${Math.abs(result.metadata.amount).toLocaleString()}
								</span>
							)}
							{result.metadata.status && (
								<Badge 
									variant={result.metadata.status === 'paid' ? 'default' : 'secondary'}
									className="text-xs"
								>
									{result.metadata.status}
								</Badge>
							)}
						</div>
					)}
				</div>
				<ArrowRight className="w-4 h-4 text-muted-foreground" />
			</motion.div>
		);
	};

	return (
		<div className={cn("relative", className)}>
			{/* Search Input */}
			<div className="relative">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
				<Input
					type="text"
					placeholder={placeholder}
					value={query}
					onChange={handleInputChange}
					onFocus={() => setIsOpen(true)}
					className="pl-10 pr-10"
				/>
				{query && (
					<Button
						variant="ghost"
						size="icon"
						onClick={clearSearch}
						className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
					>
						<X className="w-4 h-4" />
					</Button>
				)}
			</div>

			{/* Search Results */}
			<AnimatePresence>
				{isOpen && (query.length >= 2 || hasResults) && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 10 }}
						transition={{ duration: 0.2 }}
						className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
					>
						{isLoading ? (
							<div className="flex items-center justify-center p-6">
								<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
								<span className="ml-2 text-sm text-muted-foreground">Searching...</span>
							</div>
						) : hasResults ? (
							<div className="p-2">
								{Object.entries(groupedResults).map(([type, results]) => (
									<div key={type} className="mb-4 last:mb-0">
										<h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
											{typeLabels[type as keyof typeof typeLabels]}
										</h3>
										<div className="space-y-1">
											{results.map((result, index) => {
												const globalIndex = Object.values(groupedResults)
													.slice(0, Object.keys(groupedResults).indexOf(type))
													.reduce((acc, group) => acc + group.length, 0) + index;
												return renderResult(result, globalIndex);
											})}
										</div>
									</div>
								))}
							</div>
						) : query.length >= 2 ? (
							<div className="flex items-center justify-center p-6 text-muted-foreground">
								<Clock className="w-4 h-4 mr-2" />
								<span className="text-sm">No results found for "{query}"</span>
							</div>
						) : null}

						{/* Keyboard Shortcuts */}
						{showShortcuts && hasResults && (
							<div className="border-t p-3 bg-muted/30">
								<div className="flex items-center justify-between text-xs text-muted-foreground">
									<div className="flex items-center gap-4">
										<span>↑↓ Navigate</span>
										<span>↵ Select</span>
										<span>⎋ Close</span>
									</div>
									<span>{Object.values(groupedResults).reduce((acc, group) => acc + group.length, 0)} results</span>
								</div>
							</div>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
