/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

export interface SearchResult {
	id: string;
	title: string;
	description: string;
	type: 'page' | 'transaction' | 'invoice' | 'client' | 'report' | 'setting';
	href: string;
	icon?: string;
	metadata?: Record<string, any>;
}

export interface SearchConfig {
	minQueryLength: number;
	debounceMs: number;
	maxResults: number;
}

const defaultConfig: SearchConfig = {
	minQueryLength: 2,
	debounceMs: 300,
	maxResults: 10,
};


export function useSearch(config: Partial<SearchConfig> = {}) {
	const router = useRouter();
	const searchConfig = { ...defaultConfig, ...config };
	
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<SearchResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(0);

	// Debounced search function
	const performSearch = useCallback(async (searchQuery: string) => {
		if (searchQuery.length < searchConfig.minQueryLength) {
			setResults([]);
			return;
		}

		setIsLoading(true);
		
		try {
			// Call real search API
			const params = new URLSearchParams({
				q: searchQuery,
				limit: searchConfig.maxResults.toString(),
			});
			
			const response = await fetch(`/api/search?${params.toString()}`);
			
			if (!response.ok) {
				throw new Error('Search API request failed');
			}
			
			const data = await response.json();
			setResults(data.results || []);
		} catch (error) {
			console.error('Search error:', error);
			setResults([]);
		} finally {
			setIsLoading(false);
		}
	}, [searchConfig.minQueryLength, searchConfig.maxResults]);

	// Debounce search
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			performSearch(query);
		}, searchConfig.debounceMs);

		return () => clearTimeout(timeoutId);
	}, [query, performSearch, searchConfig.debounceMs]);

	// Handle keyboard navigation
	const handleKeyDown = useCallback((e: KeyboardEvent) => {
		if (!isOpen) return;

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				setSelectedIndex(prev => 
					prev < results.length - 1 ? prev + 1 : 0
				);
				break;
			case 'ArrowUp':
				e.preventDefault();
				setSelectedIndex(prev => 
					prev > 0 ? prev - 1 : results.length - 1
				);
				break;
			case 'Enter':
				e.preventDefault();
				if (results[selectedIndex]) {
					router.push(results[selectedIndex].href);
					setIsOpen(false);
					setQuery('');
				}
				break;
			case 'Escape':
				setIsOpen(false);
				setQuery('');
				break;
		}
	}, [isOpen, results, selectedIndex, router]);

	// Reset selected index when results change
	useEffect(() => {
		setSelectedIndex(0);
	}, [results]);

	// Add keyboard event listener
	useEffect(() => {
		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [handleKeyDown]);

	const search = useCallback((searchQuery: string) => {
		setQuery(searchQuery);
		setIsOpen(true);
	}, []);

	const clearSearch = useCallback(() => {
		setQuery('');
		setResults([]);
		setIsOpen(false);
		setSelectedIndex(0);
	}, []);

	const selectResult = useCallback((result: SearchResult) => {
		router.push(result.href);
		setIsOpen(false);
		setQuery('');
	}, [router]);

	// Group results by type
	const groupedResults = useMemo(() => {
		const groups: Record<string, SearchResult[]> = {};
		
		results.forEach(result => {
			if (!groups[result.type]) {
				groups[result.type] = [];
			}
			groups[result.type].push(result);
		});
		
		return groups;
	}, [results]);

	return {
		query,
		setQuery,
		results,
		groupedResults,
		isLoading,
		isOpen,
		setIsOpen,
		selectedIndex,
		search,
		clearSearch,
		selectResult,
		hasResults: results.length > 0,
	};
}
