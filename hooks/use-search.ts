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

// Mock search data - in production, this would come from your API
const mockSearchData: SearchResult[] = [
	// Pages
	{
		id: 'dashboard',
		title: 'Dashboard',
		description: 'Overview of your financial data',
		type: 'page',
		href: '/dashboard',
		icon: 'LayoutDashboard',
	},
	{
		id: 'transactions',
		title: 'Transactions',
		description: 'Manage income and expenses',
		type: 'page',
		href: '/transactions',
		icon: 'CreditCard',
	},
	{
		id: 'analytics',
		title: 'Analytics',
		description: 'Advanced reporting and insights',
		type: 'page',
		href: '/analytics',
		icon: 'BarChart3',
	},
	{
		id: 'invoices',
		title: 'Invoices',
		description: 'Create and track invoices',
		type: 'page',
		href: '/invoices',
		icon: 'Receipt',
	},
	{
		id: 'reports',
		title: 'Reports',
		description: 'Financial reports and statements',
		type: 'page',
		href: '/reports',
		icon: 'FileText',
	},
	{
		id: 'clients',
		title: 'Clients',
		description: 'Manage your client relationships',
		type: 'page',
		href: '/clients',
		icon: 'Users',
	},
	{
		id: 'settings',
		title: 'Settings',
		description: 'Configure your account settings',
		type: 'page',
		href: '/settings',
		icon: 'Settings',
	},
	// Sample transactions
	{
		id: 'txn-001',
		title: 'Payment from Acme Corp',
		description: '$2,500.00 - Invoice #INV-2024-001',
		type: 'transaction',
		href: '/transactions/txn-001',
		metadata: { amount: 2500, date: '2024-01-15' },
	},
	{
		id: 'txn-002',
		title: 'Office Supplies Expense',
		description: '$150.00 - Office Depot',
		type: 'transaction',
		href: '/transactions/txn-002',
		metadata: { amount: -150, date: '2024-01-14' },
	},
	// Sample invoices
	{
		id: 'inv-001',
		title: 'Invoice #INV-2024-001',
		description: 'Acme Corp - $2,500.00 - Due Jan 30',
		type: 'invoice',
		href: '/invoices/inv-001',
		metadata: { amount: 2500, status: 'paid', dueDate: '2024-01-30' },
	},
	{
		id: 'inv-002',
		title: 'Invoice #INV-2024-002',
		description: 'Beta LLC - $1,200.00 - Due Feb 15',
		type: 'invoice',
		href: '/invoices/inv-002',
		metadata: { amount: 1200, status: 'pending', dueDate: '2024-02-15' },
	},
	// Sample clients
	{
		id: 'client-001',
		title: 'Acme Corporation',
		description: 'Technology Company - 5 active projects',
		type: 'client',
		href: '/clients/client-001',
		metadata: { projects: 5, status: 'active' },
	},
	{
		id: 'client-002',
		title: 'Beta LLC',
		description: 'Consulting Firm - 2 active projects',
		type: 'client',
		href: '/clients/client-002',
		metadata: { projects: 2, status: 'active' },
	},
];

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
			// Simulate API call delay
			await new Promise(resolve => setTimeout(resolve, 200));
			
			// Filter mock data based on query
			const filteredResults = mockSearchData.filter(item =>
				item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.description.toLowerCase().includes(searchQuery.toLowerCase())
			).slice(0, searchConfig.maxResults);
			
			setResults(filteredResults);
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
