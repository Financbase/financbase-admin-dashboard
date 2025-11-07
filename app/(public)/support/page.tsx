/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	AlertCircle,
	BookOpen,
	ChevronDown,
	ChevronUp,
	CreditCard,
	HelpCircle,
	Mail,
	MessageCircle,
	Phone,
	Search,
	Settings,
	Shield,
	Zap,
	ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useState, useId, useEffect, useCallback, useRef } from "react";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { useRouter } from "next/navigation";

interface ContactFormData {
	name: string;
	email: string;
	subject: string;
	priority: string;
	category: string;
	message: string;
}

interface SearchResult {
	type: 'faq' | 'category' | 'article';
	title: string;
	excerpt: string;
	href: string;
	category?: string;
	index?: number; // For FAQ items to auto-expand
}

export default function SupportPage() {
	const nameId = useId();
	const emailId = useId();
	const subjectId = useId();
	const categoryId = useId();
	const priorityId = useId();
	const messageId = useId();
	
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [showSearchResults, setShowSearchResults] = useState(false);
	const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
	const searchInputRef = useRef<HTMLInputElement>(null);
	const searchResultsRef = useRef<HTMLDivElement>(null);
	const router = useRouter();
	
	const [openFaq, setOpenFaq] = useState<number | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState<ContactFormData>({
		name: "",
		email: "",
		subject: "",
		priority: "medium",
		category: "general",
		message: "",
	});
	const [formErrors, setFormErrors] = useState<Partial<ContactFormData>>({});
	const [submitMessage, setSubmitMessage] = useState("");

	// Define FAQ items and categories before they're used in callbacks
	const faqItems = [
		{
			question: "How do I get started with Financbase?",
			answer:
				"Getting started is easy! Sign up for an account, verify your email, and complete the onboarding process. You'll have access to our dashboard and can start using our financial tools immediately.",
		},
		{
			question: "What payment methods do you accept?",
			answer:
				"We accept all major credit cards (Visa, Mastercard, American Express), bank transfers, and digital wallets like PayPal and Apple Pay. All transactions are processed securely through our PCI-compliant payment system.",
		},
		{
			question: "How secure is my financial data?",
			answer:
				"Security is our top priority. We use bank-level encryption (256-bit SSL), are SOC 2 compliant, and follow strict data protection protocols. Your data is encrypted both in transit and at rest.",
		},
		{
			question: "Can I integrate Financbase with my existing systems?",
			answer:
				"Yes! We offer comprehensive APIs and webhooks that integrate with most popular business tools including QuickBooks, Xero, Salesforce, and custom applications. Check our integration guides for detailed setup instructions.",
		},
		{
			question: "What's your refund policy?",
			answer:
				"We offer a 30-day money-back guarantee for all new subscriptions. If you're not satisfied with our service, contact our support team within 30 days of your initial purchase for a full refund.",
		},
		{
			question: "Do you offer phone support?",
			answer:
				"Yes! Our Enterprise customers have access to dedicated phone support. Standard and Professional plan customers can reach us via live chat, email, or our help center. Response times vary by plan.",
		},
	];

	const supportCategories = [
		{
			title: "Getting Started",
			description: "New to Financbase? Start here",
			icon: BookOpen,
			color: "bg-primary/10",
			href: "/support/category/getting-started",
			articles: 12,
		},
		{
			title: "Billing & Payments",
			description: "Questions about pricing, billing, and payments",
			icon: CreditCard,
			color: "bg-green-500/10",
			href: "/support/category/billing-payments",
			articles: 8,
		},
		{
			title: "Account Management",
			description: "Manage your account settings and preferences",
			icon: Settings,
			color: "bg-blue-500/10",
			href: "/support/category/account-management",
			articles: 10,
		},
		{
			title: "Security & Privacy",
			description: "Learn about our security measures and privacy policy",
			icon: Shield,
			color: "bg-red-500/10",
			href: "/support/category/security-privacy",
			articles: 15,
		},
		{
			title: "API & Integrations",
			description: "Connect Financbase with your favorite tools",
			icon: Zap,
			color: "bg-purple-500/10",
			href: "/support/category/api-integrations",
			articles: 20,
		},
		{
			title: "Troubleshooting",
			description: "Fix common issues and resolve errors",
			icon: HelpCircle,
			color: "bg-orange-500/10",
			href: "/support/category/troubleshooting",
			articles: 18,
		},
	];

	const validateForm = (): boolean => {
		const errors: Partial<ContactFormData> = {};

		if (!formData.name.trim()) errors.name = "Name is required";
		if (!formData.email.trim()) errors.email = "Email is required";
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			errors.email = "Please enter a valid email address";
		}
		if (!formData.subject.trim()) errors.subject = "Subject is required";
		if (!formData.message.trim()) errors.message = "Message is required";
		if (formData.message.length < 10) errors.message = "Message must be at least 10 characters";

		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleInputChange = (field: keyof ContactFormData, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		setFormErrors(prev => ({ ...prev, [field]: "" }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		setIsSubmitting(true);
		setSubmitMessage("");

		try {
			const response = await fetch('/api/support/public', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					...formData,
					website: '', // Honeypot field
				}),
			});

			const result = await response.json();

			if (response.ok) {
				setSubmitMessage(
					`✅ Thank you! We've received your support request (Ticket: ${result.ticketNumber}) and will respond within 24 hours.`
				);
				setFormData({
					name: "",
					email: "",
					subject: "",
					priority: "medium",
					category: "general",
					message: "",
				});
			} else {
				setSubmitMessage(`❌ ${result.error || 'Something went wrong. Please try again.'}`);
				
				// Show validation errors if provided
				if (result.details && Array.isArray(result.details)) {
					const newErrors: Partial<ContactFormData> = {};
					result.details.forEach((detail: { field: string; message: string }) => {
						if (detail.field in formData) {
							newErrors[detail.field as keyof ContactFormData] = detail.message;
						}
					});
					setFormErrors(newErrors);
				}
			}
		} catch (error) {
			console.error('Support form error:', error);
			setSubmitMessage("❌ Something went wrong. Please try again or contact us directly.");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Category data for search (matches category page data)
	const categoryData: Record<string, {
		title: string;
		description: string;
		articles: Array<{
			title: string;
			description: string;
			href: string;
		}>;
	}> = {
		"getting-started": {
			title: "Getting Started",
			description: "New to Financbase? Start here with our comprehensive guides",
			articles: [
				{ title: "Quick Start Guide", description: "Get up and running with Financbase in 5 minutes", href: "/docs/help/getting-started" },
				{ title: "Account Setup", description: "Learn how to configure your organization and user settings", href: "/docs/help/account-setup" },
				{ title: "Dashboard Overview", description: "Understand your financial dashboard and key features", href: "/docs/help/dashboard" },
				{ title: "First Steps", description: "Essential first steps after creating your account", href: "/docs/first-steps" },
			],
		},
		"account-billing": {
			title: "Account & Billing",
			description: "Manage your account, subscription, and payment settings",
			articles: [
				{ title: "Subscription Plans", description: "Compare features and pricing across different plans", href: "/pricing" },
				{ title: "Billing & Invoices", description: "Manage payments, view invoices, and update payment methods", href: "/docs/help/billing" },
				{ title: "Update Payment Method", description: "How to change or update your payment information", href: "/docs/help/payment" },
			],
		},
		"security-privacy": {
			title: "Security & Privacy",
			description: "Keep your data safe and secure with best practices",
			articles: [
				{ title: "Security Best Practices", description: "Learn how to secure your account and data", href: "/docs/help/security" },
				{ title: "Two-Factor Authentication", description: "Set up 2FA to add an extra layer of security", href: "/docs/help/2fa" },
				{ title: "Privacy Policy", description: "Understand how we protect and handle your data", href: "/privacy" },
				{ title: "Data Encryption", description: "Learn about our encryption and security measures", href: "/docs/security" },
			],
		},
		"api-integrations": {
			title: "API & Integrations",
			description: "Connect Financbase with your favorite tools and services",
			articles: [
				{ title: "API Overview", description: "Introduction to the Financbase API", href: "/docs/api" },
				{ title: "API Authentication", description: "Learn how to authenticate with our API", href: "/docs/api/auth" },
				{ title: "Webhooks Guide", description: "Set up and configure webhooks for real-time updates", href: "/docs/api/webhooks" },
				{ title: "Integration Setup", description: "Connect with QuickBooks, Stripe, and other services", href: "/docs/integrations" },
			],
		},
		"troubleshooting": {
			title: "Troubleshooting",
			description: "Fix common issues and resolve errors",
			articles: [
				{ title: "Common Issues", description: "Solutions for frequently encountered problems", href: "/docs/help/issues" },
				{ title: "Payment Issues", description: "Troubleshoot payment and billing problems", href: "/docs/help/payment-issues" },
				{ title: "Import Errors", description: "Fix data import and synchronization errors", href: "/docs/help/import-errors" },
				{ title: "Performance Issues", description: "Optimize performance and resolve slowdowns", href: "/docs/help/performance" },
			],
		},
		"advanced-features": {
			title: "Advanced Features",
			description: "Unlock the full potential of Financbase",
			articles: [
				{ title: "Custom Workflows", description: "Create and automate custom business workflows", href: "/docs/help/workflows" },
				{ title: "Advanced Reporting", description: "Build custom reports and analytics dashboards", href: "/docs/help/reporting" },
				{ title: "Multi-Tenant Setup", description: "Configure multi-tenant organizations", href: "/docs/multi-tenant" },
				{ title: "Best Practices", description: "Expert tips and best practices for power users", href: "/docs/help/best-practices" },
			],
		},
	};

	// Search function
	const performSearch = useCallback(async (query: string) => {
		if (!query.trim() || query.length < 2) {
			setSearchResults([]);
			setShowSearchResults(false);
			return;
		}

		setIsSearching(true);
		const lowerQuery = query.toLowerCase();
		const results: SearchResult[] = [];

		// Search FAQs
		faqItems.forEach((faq, index) => {
			if (
				faq.question.toLowerCase().includes(lowerQuery) ||
				faq.answer.toLowerCase().includes(lowerQuery)
			) {
				results.push({
					type: 'faq',
					title: faq.question,
					excerpt: faq.answer.substring(0, 150) + (faq.answer.length > 150 ? '...' : ''),
					href: '#faq',
					index,
				});
			}
		});

		// Search categories
		supportCategories.forEach((category) => {
			const slug = category.title
				.toLowerCase()
				.replace(/\s+/g, '-')
				.replace(/&/g, '')
				.replace(/[^\w-]/g, '')
				.replace(/-+/g, '-')
				.replace(/^-|-$/g, '');
			
			if (
				category.title.toLowerCase().includes(lowerQuery) ||
				category.description.toLowerCase().includes(lowerQuery)
			) {
				results.push({
					type: 'category',
					title: category.title,
					excerpt: category.description,
					href: `/support/category/${slug}`,
					category: category.title,
				});
			}
		});

		// Search category articles
		Object.entries(categoryData).forEach(([slug, category]) => {
			category.articles.forEach((article) => {
				if (
					article.title.toLowerCase().includes(lowerQuery) ||
					article.description.toLowerCase().includes(lowerQuery)
				) {
					results.push({
						type: 'article',
						title: article.title,
						excerpt: article.description,
						href: article.href,
						category: category.title,
					});
				}
			});
		});

		// Search database articles via API
		try {
			const response = await fetch(`/api/support/search?q=${encodeURIComponent(query)}&limit=5`);
			if (response.ok) {
				const data = await response.json();
				if (data.results && Array.isArray(data.results)) {
					results.push(...data.results.map((article: any) => ({
						type: 'article' as const,
						title: article.title,
						excerpt: article.excerpt,
						href: article.href,
						category: article.category,
					})));
				}
			}
		} catch (error) {
			console.error('Error searching articles:', error);
		}

		// Limit results to 20 total
		setSearchResults(results.slice(0, 20));
		setShowSearchResults(results.length > 0);
		setIsSearching(false);
	}, [faqItems, supportCategories]);

	// Debounced search effect
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			performSearch(searchQuery);
		}, 300);

		return () => clearTimeout(timeoutId);
	}, [searchQuery, performSearch]);

	// Handle keyboard navigation
	const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (!showSearchResults || searchResults.length === 0) {
			if (e.key === 'Enter' && searchQuery.trim().length >= 2) {
				performSearch(searchQuery);
			}
			return;
		}

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				setSelectedResultIndex((prev) =>
					prev < searchResults.length - 1 ? prev + 1 : prev
				);
				break;
			case 'ArrowUp':
				e.preventDefault();
				setSelectedResultIndex((prev) => (prev > 0 ? prev - 1 : -1));
				break;
			case 'Enter':
				e.preventDefault();
				if (selectedResultIndex >= 0 && selectedResultIndex < searchResults.length) {
					const result = searchResults[selectedResultIndex];
					handleResultClick(result);
				}
				break;
			case 'Escape':
				setShowSearchResults(false);
				setSelectedResultIndex(-1);
				searchInputRef.current?.blur();
				break;
		}
	};

	// Handle result click
	const handleResultClick = (result: SearchResult) => {
		if (result.type === 'faq' && result.index !== undefined) {
			// Scroll to FAQ and expand it
			setOpenFaq(result.index);
			setShowSearchResults(false);
			setSearchQuery('');
			// Scroll to FAQ section
			setTimeout(() => {
				const faqElement = document.getElementById(`faq-${result.index}`);
				faqElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}, 100);
		} else {
			router.push(result.href);
			setShowSearchResults(false);
			setSearchQuery('');
		}
	};

	// Handle click outside to close results
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				searchResultsRef.current &&
				!searchResultsRef.current.contains(event.target as Node) &&
				searchInputRef.current &&
				!searchInputRef.current.contains(event.target as Node)
			) {
				setShowSearchResults(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const contactMethods = [
		{
			title: "Live Chat",
			description: "Get instant help from our support team",
			icon: MessageCircle,
			availability: "Available 24/7",
			responseTime: "< 2 minutes",
			color: "text-green-600",
		},
		{
			title: "Email Support",
			description: "Send us a detailed message",
			icon: Mail,
			availability: "Mon-Fri, 9AM-6PM EST",
			responseTime: "< 4 hours",
			color: "text-blue-600",
		},
		{
			title: "Phone Support",
			description: "Speak directly with our team",
			icon: Phone,
			availability: "Enterprise customers only",
			responseTime: "Immediate",
			color: "text-purple-600",
		},
	];


	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<div className="border-b bg-gradient-to-br from-background via-background to-muted/20">
				<div className="container mx-auto px-4 py-8">
					<div className="max-w-4xl mx-auto text-center">
						<div className="flex items-center justify-center gap-2 mb-3">
							<HelpCircle className="h-6 w-6 text-primary" />
							<Badge variant="secondary" className="text-sm font-medium">
								Help Center
							</Badge>
						</div>
						<h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
							How can we help you today?
						</h1>
						<p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
							Find answers to common questions, get help with your account, or
							contact our support team.
						</p>

						{/* Search Bar */}
						<div className="relative max-w-2xl mx-auto">
							<div className="relative">
								<Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
									isSearching ? 'text-primary animate-pulse' : 'text-muted-foreground'
								}`} />
								<Input
									ref={searchInputRef}
									type="text"
									placeholder="Search for help articles..."
									value={searchQuery}
									onChange={(e) => {
										setSearchQuery(e.target.value);
										setSelectedResultIndex(-1);
									}}
									onKeyDown={handleSearchKeyDown}
									onFocus={() => {
										if (searchResults.length > 0) {
											setShowSearchResults(true);
										}
									}}
									className="pl-12 pr-10 py-3 text-lg"
								/>
								{searchQuery && (
									<button
										type="button"
										onClick={() => {
											setSearchQuery('');
											setSearchResults([]);
											setShowSearchResults(false);
											searchInputRef.current?.focus();
										}}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
										aria-label="Clear search"
									>
										<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								)}
							</div>
							
							{/* Search Results Dropdown */}
							{showSearchResults && (
								<div
									ref={searchResultsRef}
									className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto"
								>
									{isSearching ? (
										<div className="p-6 text-center text-muted-foreground">
											<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
											<p>Searching...</p>
										</div>
									) : searchResults.length > 0 ? (
										<div className="py-2">
											{searchResults.map((result, index) => {
												const isSelected = index === selectedResultIndex;
												const Icon = result.type === 'faq' 
													? HelpCircle 
													: result.type === 'category' 
													? BookOpen 
													: BookOpen;
												
												return (
													<button
														key={`${result.type}-${index}`}
														type="button"
														onClick={() => handleResultClick(result)}
														className={`w-full text-left px-4 py-3 hover:bg-muted transition-colors ${
															isSelected ? 'bg-muted' : ''
														}`}
														onMouseEnter={() => setSelectedResultIndex(index)}
													>
														<div className="flex items-start gap-3">
															<Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
																result.type === 'faq' ? 'text-blue-600' :
																result.type === 'category' ? 'text-green-600' :
																'text-purple-600'
															}`} />
															<div className="flex-1 min-w-0">
																<div className="flex items-center gap-2 mb-1">
																	<h4 className="font-semibold text-sm truncate">{result.title}</h4>
																	{result.category && (
																		<Badge variant="secondary" className="text-xs flex-shrink-0">
																			{result.category}
																		</Badge>
																	)}
																</div>
																<p className="text-xs text-muted-foreground line-clamp-2">{result.excerpt}</p>
																{result.type === 'faq' && (
																	<span className="text-xs text-blue-600 mt-1 inline-block">FAQ</span>
																)}
															</div>
														</div>
													</button>
												);
											})}
										</div>
									) : (
										<div className="p-6 text-center text-muted-foreground">
											<HelpCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
											<p>No results found</p>
											<p className="text-xs mt-1">Try different keywords</p>
										</div>
									)}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-8">
				<div className="max-w-6xl mx-auto">
					{/* Interactive Tabs Section */}
					<Tabs defaultValue="categories" className="space-y-4">
						<TabsList className="grid w-full grid-cols-4">
							<TabsTrigger value="categories">Browse Topics</TabsTrigger>
							<TabsTrigger value="faq">FAQ</TabsTrigger>
							<TabsTrigger value="contact">Contact Us</TabsTrigger>
							<TabsTrigger value="support">Support Options</TabsTrigger>
						</TabsList>

						{/* Categories Tab */}
						<TabsContent value="categories" className="space-y-4">
							<BentoGrid className="md:auto-rows-[20rem]">
								{supportCategories.map((category) => {
									// Generate slug that matches category page expectations
									const slug = category.title
										.toLowerCase()
										.replace(/\s+/g, '-')
										.replace(/&/g, '')
										.replace(/[^\w-]/g, '')
										.replace(/-+/g, '-')
										.replace(/^-|-$/g, '');
									
									return (
										<BentoCard
											key={`category-${slug}`}
											name={category.title}
											description={`${category.description}. ${category.articles} articles available.`}
											Icon={category.icon}
											href={`/support/category/${slug}`}
											cta="Browse Articles"
											className="md:col-span-1"
											background={
												<div className={`absolute inset-0 ${category.color} group-hover:opacity-15 transition-opacity`} />
											}
										/>
									);
								})}
							</BentoGrid>
						</TabsContent>

						{/* FAQ Tab */}
						<TabsContent value="faq" className="space-y-4">
							<div className="space-y-4">
								{faqItems.map((item, index) => (
									<Card 
										key={`faq-${item.question.toLowerCase().replace(/\s+/g, '-').slice(0, 50)}`} 
										id={`faq-${index}`}
										className="overflow-hidden"
									>
										<button
											type="button"
											className="w-full p-6 text-left hover:bg-muted/50 transition-colors"
											onClick={() => setOpenFaq(openFaq === index ? null : index)}
										>
											<div className="flex items-center justify-between">
												<h3 className="font-semibold text-lg">{item.question}</h3>
												{openFaq === index ? (
													<ChevronUp className="h-5 w-5 text-muted-foreground" />
												) : (
													<ChevronDown className="h-5 w-5 text-muted-foreground" />
												)}
											</div>
										</button>
										{openFaq === index && (
											<div className="px-6 pb-6">
												<p className="text-muted-foreground leading-relaxed">
													{item.answer}
												</p>
											</div>
										)}
									</Card>
								))}
							</div>
						</TabsContent>

						{/* Contact Form Tab */}
						<TabsContent value="contact" className="space-y-4">
							<div className="max-w-2xl mx-auto">
								<h2 className="text-2xl font-semibold mb-6 text-center">
									Send us a Message
								</h2>
								<p className="text-muted-foreground text-center mb-8">
									Fill out the form below and we'll get back to you as soon as possible.
								</p>

								{submitMessage && (
									<div className={`mb-6 p-4 rounded-lg border ${
										submitMessage.includes('✅')
											? 'bg-green-50 border-green-200 text-green-800'
											: 'bg-red-50 border-red-200 text-red-800'
									}`}>
										{submitMessage}
									</div>
								)}

								<form onSubmit={handleSubmit} className="space-y-6">
									{/* Honeypot field - hidden from users, visible to bots */}
									<input
										type="text"
										name="website"
										tabIndex={-1}
										autoComplete="off"
										style={{ position: 'absolute', left: '-9999px' }}
										aria-hidden="true"
									/>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<label htmlFor={nameId} className="block text-sm font-medium mb-2">
												Full Name *
											</label>
											<Input
												id={nameId}
												type="text"
												value={formData.name}
												onChange={(e) => handleInputChange('name', e.target.value)}
												className={formErrors.name ? 'border-red-500' : ''}
												placeholder="Enter your full name"
											/>
											{formErrors.name && (
												<p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
											)}
										</div>
										<div>
											<label htmlFor={emailId} className="block text-sm font-medium mb-2">
												Email Address *
											</label>
											<Input
												id={emailId}
												type="email"
												value={formData.email}
												onChange={(e) => handleInputChange('email', e.target.value)}
												className={formErrors.email ? 'border-red-500' : ''}
												placeholder="Enter your email address"
											/>
											{formErrors.email && (
												<p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
											)}
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<label htmlFor={subjectId} className="block text-sm font-medium mb-2">
												Subject *
											</label>
											<Input
												id={subjectId}
												type="text"
												value={formData.subject}
												onChange={(e) => handleInputChange('subject', e.target.value)}
												className={formErrors.subject ? 'border-red-500' : ''}
												placeholder="Brief description of your issue"
											/>
											{formErrors.subject && (
												<p className="text-red-500 text-sm mt-1">{formErrors.subject}</p>
											)}
										</div>
										<div>
											<label htmlFor={categoryId} className="block text-sm font-medium mb-2">
												Category
											</label>
											<Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
												<SelectTrigger id={categoryId}>
													<SelectValue placeholder="Select a category" />
												</SelectTrigger>
											<SelectContent>
												<SelectItem value="general">General Inquiry</SelectItem>
												<SelectItem value="technical">Technical Support</SelectItem>
												<SelectItem value="billing">Billing & Account</SelectItem>
												<SelectItem value="feature_request">Feature Request</SelectItem>
												<SelectItem value="bug_report">Bug Report</SelectItem>
											</SelectContent>
											</Select>
										</div>
									</div>

									<div>
										<label htmlFor={priorityId} className="block text-sm font-medium mb-2">
											Priority
										</label>
										<Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
											<SelectTrigger id={priorityId} className="w-full md:w-48">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="low">Low - General question</SelectItem>
												<SelectItem value="medium">Medium - Issue affecting work</SelectItem>
												<SelectItem value="high">High - Urgent issue</SelectItem>
												<SelectItem value="critical">Critical - System down</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div>
										<label htmlFor={messageId} className="block text-sm font-medium mb-2">
											Message *
										</label>
										<Textarea
											id={messageId}
											value={formData.message}
											onChange={(e) => handleInputChange('message', e.target.value)}
											className={`min-h-32 ${formErrors.message ? 'border-red-500' : ''}`}
											placeholder="Please describe your issue or question in detail..."
										/>
										{formErrors.message && (
											<p className="text-red-500 text-sm mt-1">{formErrors.message}</p>
										)}
									</div>

									<Button
										type="submit"
										disabled={isSubmitting}
										className="w-full"
									>
										{isSubmitting ? (
											<>
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
												Sending...
											</>
										) : (
											<>
												<Mail className="h-4 w-4 mr-2" />
												Send Message
											</>
										)}
									</Button>
								</form>
							</div>
						</TabsContent>

						{/* Support Options Tab */}
						<TabsContent value="support" className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{contactMethods.map((method) => (
									<Card
										key={`contact-${method.title.toLowerCase().replace(/\s+/g, '-')}`}
										className="group hover:shadow-md transition-all duration-200"
									>
										<CardContent className="p-6">
											<div className="flex items-start gap-4">
												<div className="p-3 rounded-lg bg-primary/10 text-primary">
													<method.icon className="h-6 w-6" />
												</div>
												<div className="flex-1">
													<div className="flex items-center justify-between mb-2">
														<h3 className="font-semibold">
															{method.title}
														</h3>
														<Badge
															variant="secondary"
															className="text-xs"
														>
															{method.availability}
														</Badge>
													</div>
													<p className="text-sm text-muted-foreground mb-4">
														{method.description}
													</p>
													<Button
														asChild
														size="sm"
														className="group-hover:bg-primary/90"
													>
														<Link href="/contact">
															Get Started
															<ExternalLink className="h-3 w-3 ml-1" />
														</Link>
													</Button>
												</div>
											</div>
											</CardContent>
										</Card>
									))}
							</div>
						</TabsContent>
					</Tabs>

					{/* Still Need Help */}
					<Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 mt-8">
						<CardContent className="p-6 text-center">
							<div className="max-w-2xl mx-auto">
								<h3 className="text-2xl font-semibold mb-3">
									Still need help?
								</h3>
								<p className="text-muted-foreground mb-5">
									Can't find the answer you're looking for? Our support team is
									here to help you get back on track.
								</p>
								<div className="flex flex-col sm:flex-row gap-4 justify-center">
									<Button asChild>
										<Link href="/contact">
											<MessageCircle className="h-4 w-4 mr-2" />
											Contact Support
										</Link>
									</Button>
									<Button variant="outline" asChild>
										<Link href="/docs">
											<BookOpen className="h-4 w-4 mr-2" />
											Browse Documentation
										</Link>
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
