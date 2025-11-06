/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sun, Bell } from "lucide-react";
import { Workspaces, WorkspaceTrigger } from "@/components/core/ui/layout/workspaces";
import {
	Archive,
	BarChart3,
	BookOpen,
	Bot,
	Briefcase,
	Building,
	Building2,
	Calculator,
	CreditCard,
	DollarSign,
	FileText,
	FolderKanban,
	Headphones,
	HelpCircle,
	Home,
	Image,
	Key,
	LayoutDashboard,
	LogOut,
	Megaphone,
	Menu,
	MessageCircle,
	Package,
	PiggyBank,
	Puzzle,
	Receipt,
	Search as SearchIcon,
	Settings,
	ShoppingCart,
	TrendingUp,
	UserCog,
	Users,
	Users as UsersIcon,
	Workflow,
	X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

const navigationItems = [
	{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
	{ name: "Unified", href: "/unified", icon: TrendingUp },
	{ name: "Transactions", href: "/transactions", icon: CreditCard },
	{ name: "Analytics", href: "/analytics", icon: BarChart3 },
	{ name: "Accounts", href: "/accounts", icon: Users },
	{ name: "Pricing", href: "/settings/pricing", icon: DollarSign },
	{ name: "Reports", href: "/reports", icon: FileText },
	{ name: "Settings", href: "/settings", icon: Settings },
];

const moduleItems = [
	// Core Business Modules (Primary Revenue Streams)
	{
		name: "Freelance",
		href: "/freelance",
		icon: Briefcase,
		category: "business",
	},
	{
		name: "Real Estate",
		href: "/real-estate",
		icon: Home,
		category: "business",
	},
	{ name: "Adboard", href: "/adboard", icon: Megaphone, category: "business" },

	// Financial Management (Money & Budgets)
	{ name: "Budgets", href: "/budgets", icon: PiggyBank, category: "finance" },
	{ name: "Assets", href: "/assets", icon: Archive, category: "finance" },
	{ name: "Tax", href: "/tax", icon: Calculator, category: "finance" },

	// Business Operations (Sales & Service)
	{
		name: "Customers",
		href: "/customers",
		icon: UsersIcon,
		category: "operations",
	},
	{
		name: "Products",
		href: "/products",
		icon: Package,
		category: "operations",
	},
	{
		name: "Invoices",
		href: "/invoices",
		icon: Receipt,
		category: "operations",
	},
	{
		name: "Orders",
		href: "/orders",
		icon: ShoppingCart,
		category: "operations",
	},

	// Team & Organization
	{ name: "Employees", href: "/employees", icon: UserCog, category: "team" },
	{
		name: "Organization",
		href: "/organization",
		icon: Building,
		category: "team",
	},

	// AI & Automation (Smart Tools)
	{ name: "AI Assist", href: "/ai-assist", icon: Bot, category: "ai" },
	{ name: "Automations", href: "/automations", icon: Workflow, category: "ai" },
	{ name: "Chat", href: "/chat", icon: MessageCircle, category: "ai" },

	// Platform & Tools (System Features)
	{
		name: "Integrations",
		href: "/integrations",
		icon: Puzzle,
		category: "platform",
	},
	{
		name: "Optimization",
		href: "/optimization",
		icon: TrendingUp,
		category: "platform",
	},
	{ name: "Blog", href: "/content/blog", icon: BookOpen, category: "platform" },
	{ name: "Search", href: "/search", icon: SearchIcon, category: "platform" },

	// Support & Help (Resources)
	{ name: "Help", href: "/help", icon: HelpCircle, category: "support" },
	{ name: "Docs", href: "/help/docs", icon: BookOpen, category: "support" },
	{ name: "Support", href: "/support", icon: Headphones, category: "support" },
];

export default function FintechNav() {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const pathname = usePathname();

	return (
		<>
			{/* Top Bar */}
			<div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="flex items-center space-x-2">
						<div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
							<span className="text-white font-bold text-lg">F</span>
						</div>
						<span className="font-bold text-xl text-gray-900">Financbase</span>
					</div>
					<span className="text-lg font-bold text-gray-900">Financbase</span>
				</div>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
					className="lg:hidden"
				>
					{isMobileMenuOpen ? (
						<X className="h-6 w-6" />
					) : (
						<Menu className="h-6 w-6" />
					)}
				</Button>
			</div>

			{/* Desktop Navigation */}
			<nav className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50">
				<div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 px-6 pb-4">
					<div className="flex h-16 shrink-0 items-center">
						<Link href="/" className="flex items-center">
							<div className="flex items-center space-x-2">
						<div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
							<span className="text-white font-bold text-lg">F</span>
						</div>
						<span className="font-bold text-xl text-gray-900">Financbase</span>
					</div>
						</Link>
					</div>

					{/* Workspace Selector */}
					<div className="px-3 py-2">
						<div className="text-sm text-gray-600">Personal Workspace</div>
					</div>

					<nav className="flex flex-1 flex-col">
						<ul className="flex flex-1 flex-col gap-y-7">
							<li>
								<ul className="-mx-2 space-y-1">
									{navigationItems.map((item) => {
										const isActive = pathname === item.href;
										return (
											<li key={item.name}>
												<Link
													href={item.href}
													className={cn(
														"group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors",
														isActive
															? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
															: "text-gray-700 dark:text-gray-300 hover:text-blue-700 hover:bg-gray-50 dark:hover:bg-gray-700",
													)}
												>
													<item.icon
														className={cn(
															"h-6 w-6 shrink-0",
															isActive
																? "text-blue-700 dark:text-blue-300"
																: "text-gray-400 dark:text-gray-500 group-hover:text-blue-700 dark:group-hover:text-blue-400",
														)}
														aria-hidden="true"
													/>
													{item.name}
												</Link>
											</li>
										);
									})}
								</ul>
							</li>

							<li>
								<div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wider">
									Modules
								</div>
								<ul className="-mx-2 mt-2 space-y-1">
									{moduleItems.map((item) => {
										const isActive = pathname.startsWith(item.href);
										return (
											<li key={item.name}>
												<Link
													href={item.href}
													className={cn(
														"group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors",
														isActive
															? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
															: "text-gray-700 dark:text-gray-300 hover:text-green-700 hover:bg-gray-50 dark:hover:bg-gray-700",
													)}
												>
													<item.icon
														className={cn(
															"h-6 w-6 shrink-0",
															isActive
																? "text-green-700 dark:text-green-300"
																: "text-gray-400 dark:text-gray-500 group-hover:text-green-700 dark:group-hover:text-green-400",
														)}
														aria-hidden="true"
													/>
													{item.name}
												</Link>
											</li>
										);
									})}
								</ul>
							</li>

							<li className="mt-auto">
								<div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">
									<div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
										<span className="text-white text-sm font-medium">FB</span>
									</div>
									<span className="sr-only">Your profile</span>
									<span aria-hidden="true">Financbase User</span>
								</div>
								<div className="flex items-center gap-x-2 px-2 py-2">
									<Button variant="ghost" size="icon">
										<Sun className="h-5 w-5" />
									</Button>
									<Button
										variant="ghost"
										className="flex-1 justify-start text-gray-700 dark:text-gray-300 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
									>
										<LogOut className="h-4 w-4 mr-2" />
										Sign out
									</Button>
								</div>
							</li>
						</ul>
					</nav>
				</div>
			</nav>

			{/* Mobile Navigation */}
			<div className="lg:hidden">
				<div className="fixed inset-0 z-50 lg:hidden">
					<div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800">
						<div className="flex h-16 items-center justify-between px-6">
							<Link href="/" className="flex items-center">
								<div className="flex items-center space-x-2">
						<div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
							<span className="text-white font-bold text-lg">F</span>
						</div>
						<span className="font-bold text-xl text-gray-900">Financbase</span>
					</div>
							</Link>
							<button
								type="button"
								className="-m-2.5 p-2.5"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								<X className="h-6 w-6" />
							</button>
						</div>

						{/* Workspace Selector - Mobile */}
						<div className="px-6 py-2">
							<Workspaces>
								<WorkspaceTrigger className="w-full" />
							</Workspaces>
						</div>

						<nav className="flex flex-1 flex-col px-6 pb-4">
							<ul className="flex flex-1 flex-col gap-y-7">
								<li>
									<ul className="-mx-2 space-y-1">
										{navigationItems.map((item) => {
											const isActive = pathname === item.href;
											return (
												<li key={item.name}>
													<Link
														href={item.href}
														className={cn(
															"group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors",
															isActive
																? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
																: "text-gray-700 dark:text-gray-300 hover:text-blue-700 hover:bg-gray-50 dark:hover:bg-gray-700",
														)}
														onClick={() => setIsMobileMenuOpen(false)}
													>
														<item.icon
															className={cn(
																"h-6 w-6 shrink-0",
																isActive
																	? "text-blue-700 dark:text-blue-300"
																	: "text-gray-400 dark:text-gray-500 group-hover:text-blue-700 dark:group-hover:text-blue-400",
															)}
															aria-hidden="true"
														/>
														{item.name}
													</Link>
												</li>
											);
										})}
									</ul>
								</li>

								<li>
									<div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wider">
										Modules
									</div>
									<ul className="-mx-2 mt-2 space-y-1">
										{moduleItems.map((item) => {
											const isActive = pathname.startsWith(item.href);
											return (
												<li key={item.name}>
													<Link
														href={item.href}
														className={cn(
															"group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors",
															isActive
																? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
																: "text-gray-700 dark:text-gray-300 hover:text-green-700 hover:bg-gray-50 dark:hover:bg-gray-700",
														)}
														onClick={() => setIsMobileMenuOpen(false)}
													>
														<item.icon
															className={cn(
																"h-6 w-6 shrink-0",
																isActive
																	? "text-green-700 dark:text-green-300"
																	: "text-gray-400 dark:text-gray-500 group-hover:text-green-700 dark:group-hover:text-green-400",
															)}
															aria-hidden="true"
														/>
														{item.name}
													</Link>
												</li>
											);
										})}
									</ul>
								</li>
							</ul>
						</nav>
					</div>
				</div>
			</div>

			{/* Mobile menu button */}
			<div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
				<button
					type="button"
					className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
					onClick={() => setIsMobileMenuOpen(true)}
				>
					<Menu className="h-6 w-6" />
				</button>

				<div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
					<div className="flex flex-1" />
					<div className="flex items-center gap-x-4 lg:gap-x-6">
						<Button variant="ghost" size="icon">
							<Sun className="h-5 w-5" />
						</Button>
						<Button variant="ghost" size="icon" className="relative">
							<Bell className="h-5 w-5" />
							<span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
								2
							</span>
						</Button>
					</div>
				</div>
			</div>
		</>
	);
}
