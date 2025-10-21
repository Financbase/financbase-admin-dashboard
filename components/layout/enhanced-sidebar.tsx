"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FinancbaseLogo } from "@/components/ui/financbase-logo";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
	Activity,
	BarChart3,
	Bell,
	BookOpen,
	Bot,
	Brain,
	Briefcase,
	Building2,
	Calendar,
	ChevronDown,
	ChevronRight,
	CreditCard,
	DollarSign,
	FileText,
	Filter,
	HelpCircle,
	Home,
	Key,
	LayoutDashboard,
	Link2,
	LogOut,
	Megaphone,
	Menu,
	MessageSquare,
	PieChart,
	Settings,
	Shield,
	ShoppingCart,
	Target,
	TrendingUp,
	Users,
	Wallet,
	X,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

interface EnhancedSidebarProps {
	collapsed?: boolean;
	onToggleCollapse?: () => void;
	onClose?: () => void;
	user?: {
		name: string;
		email: string;
		avatar?: string;
		role?: string;
	};
}

const navigationItems = [
	{
		name: "Dashboard",
		href: "/dashboard",
		icon: LayoutDashboard,
		badge: null,
	},
	{
		name: "Unified",
		href: "/unified",
		icon: TrendingUp,
		badge: "New",
	},
	{
		name: "Transactions",
		href: "/transactions",
		icon: CreditCard,
		badge: null,
	},
	{
		name: "Analytics",
		href: "/analytics",
		icon: BarChart3,
		badge: null,
	},
	{
		name: "Accounts",
		href: "/accounts",
		icon: Users,
		badge: null,
	},
	{
		name: "Payments",
		href: "/payments",
		icon: DollarSign,
		badge: null,
	},
	{
		name: "Reports",
		href: "/reports",
		icon: FileText,
		badge: null,
	},
	{
		name: "Settings",
		href: "/settings",
		icon: Settings,
		badge: null,
	},
	{
		name: "Admin",
		href: "/admin/rbac",
		icon: Shield,
		badge: null,
		adminOnly: true,
	},
];

const moduleItems = [
	{
		name: "Freelance",
		href: "/freelance",
		icon: Briefcase,
		description: "Project management & billing",
		color: "text-blue-600",
	},
	{
		name: "Real Estate",
		href: "/real-estate",
		icon: Home,
		description: "Property & rental income",
		color: "text-green-600",
	},
	{
		name: "Adboard",
		href: "/adboard",
		icon: Megaphone,
		description: "Campaign management",
		color: "text-purple-600",
	},
];

const financialIntelligenceItems = [
	{
		name: "Financial Intelligence",
		icon: Zap,
		children: [
			{ name: "Overview", href: "/financial-intelligence", icon: PieChart },
			{
				name: "Predictions",
				href: "/financial-intelligence/predictions",
				icon: Target,
			},
			{
				name: "Recommendations",
				href: "/financial-intelligence/recommendations",
				icon: Activity,
			},
			{
				name: "Health Score",
				href: "/financial-intelligence/health",
				icon: Wallet,
			},
		],
	},
	{
		name: "AI Assistant",
		icon: Brain,
		children: [
			{ name: "Assistant", href: "/ai-assistant", icon: MessageSquare },
			{
				name: "FinancbaseGPT",
				href: "/financbase-gpt",
				icon: Bot,
				badge: "New",
			},
		],
	},
	{
		name: "Market Analysis",
		icon: Building2,
		children: [
			{
				name: "Startup Metrics",
				href: "/financial-intelligence/startup",
				icon: TrendingUp,
			},
			{
				name: "Agency Metrics",
				href: "/financial-intelligence/agency",
				icon: Users,
			},
			{
				name: "E-commerce Metrics",
				href: "/financial-intelligence/ecommerce",
				icon: ShoppingCart,
			},
		],
	},
];

export function EnhancedSidebar({
	collapsed = false,
	onToggleCollapse,
	onClose,
	user,
}: EnhancedSidebarProps) {
	const [expandedSections, setExpandedSections] = useState<string[]>([
		"Financial Intelligence",
	]);
	const pathname = usePathname();

	// Check if user is admin (simplified for now - would use proper auth check)
	const isAdmin = true; // This should use proper auth check

	const toggleSection = (sectionName: string) => {
		setExpandedSections((prev) =>
			prev.includes(sectionName)
				? prev.filter((s) => s !== sectionName)
				: [...prev, sectionName],
		);
	};

	const isActive = (href: string) => pathname === href;

	// Filter navigation items based on admin status
	const visibleNavItems = navigationItems.filter(item =>
		!item.adminOnly || (item.adminOnly && isAdmin)
	);

	return (
		<motion.div
			initial={{ x: -300 }}
			animate={{ x: 0 }}
			transition={{ duration: 0.3 }}
			className={cn(
				"flex h-full flex-col bg-background border-r transition-all duration-300",
				collapsed ? "w-16" : "w-64",
			)}
		>
			{/* Header */}
			<div className="flex h-16 items-center justify-between px-4 border-b">
				{!collapsed && (
					<Link href="/dashboard" className="flex items-center gap-2">
						<FinancbaseLogo size="sm" />
					</Link>
				)}
				{collapsed && (
					<Link href="/dashboard" className="flex items-center justify-center">
						<FinancbaseLogo size="sm" />
					</Link>
				)}

				<div className="flex items-center gap-2">
					{onToggleCollapse && (
						<Button
							variant="ghost"
							size="icon"
							onClick={onToggleCollapse}
							className="hidden lg:flex"
						>
							<Menu className="h-4 w-4" />
						</Button>
					)}
					{onClose && (
						<Button
							variant="ghost"
							size="icon"
							onClick={onClose}
							className="lg:hidden"
						>
							<X className="h-4 w-4" />
						</Button>
					)}
				</div>
			</div>

			{/* Navigation */}
			<nav className="flex-1 overflow-y-auto py-4">
				<div className="px-4 space-y-6">
					{/* Main Navigation */}
					<div>
						<h3
							className={cn(
								"px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider",
								collapsed && "hidden",
							)}
						>
							Main
						</h3>
						<ul className="mt-2 space-y-1">
							{visibleNavItems.map((item) => (
								<li key={item.name}>
									<Link
										href={item.href}
										className={cn(
											"group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
											isActive(item.href)
												? "bg-primary text-primary-foreground shadow-sm"
												: "text-muted-foreground hover:bg-muted hover:text-foreground",
										)}
									>
										<item.icon
											className={cn(
												"h-5 w-5 shrink-0",
												isActive(item.href)
													? "text-primary-foreground"
													: "text-muted-foreground group-hover:text-foreground",
											)}
										/>
										{!collapsed && (
											<>
												<span className="flex-1">{item.name}</span>
												{item.badge && (
													<Badge variant="secondary" className="text-xs">
														{item.badge}
													</Badge>
												)}
											</>
										)}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Financial Intelligence Section */}
					<div>
						<h3
							className={cn(
								"px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider",
								collapsed && "hidden",
							)}
						>
							Intelligence
						</h3>
						<div className="mt-2 space-y-1">
							{financialIntelligenceItems.map((section) => (
								<div key={section.name}>
									<button
										type="button"
										onClick={() => toggleSection(section.name)}
										className={cn(
											"group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200",
											collapsed && "justify-center",
										)}
									>
										<section.icon className="h-5 w-5 shrink-0" />
										{!collapsed && (
											<>
												<span className="flex-1 text-left">{section.name}</span>
												{expandedSections.includes(section.name) ? (
													<ChevronDown className="h-4 w-4" />
												) : (
													<ChevronRight className="h-4 w-4" />
												)}
											</>
										)}
									</button>

									{!collapsed && expandedSections.includes(section.name) && (
										<motion.div
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: "auto" }}
											exit={{ opacity: 0, height: 0 }}
											className="ml-6 space-y-1 mt-1"
										>
											{section.children.map((child) => (
												<Link
													key={child.name}
													href={child.href}
													className={cn(
														"group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
														isActive(child.href)
															? "bg-primary/10 text-primary"
															: "text-muted-foreground hover:bg-muted hover:text-foreground",
													)}
												>
													<child.icon className="h-4 w-4 shrink-0" />
													<span>{child.name}</span>
												</Link>
											))}
										</motion.div>
									)}
								</div>
							))}
						</div>
					</div>

					{/* Modules Section */}
					<div>
						<h3
							className={cn(
								"px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider",
								collapsed && "hidden",
							)}
						>
							Modules
						</h3>
						<ul className="mt-2 space-y-1">
							{moduleItems.map((item) => (
								<li key={item.name}>
									<Link
										href={item.href}
										className={cn(
											"group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
											isActive(item.href)
												? "bg-primary text-primary-foreground shadow-sm"
												: "text-muted-foreground hover:bg-muted hover:text-foreground",
										)}
									>
										<item.icon
											className={cn(
												"h-5 w-5 shrink-0",
												isActive(item.href)
													? "text-primary-foreground"
													: item.color,
											)}
										/>
										{!collapsed && (
											<div className="flex-1">
												<span>{item.name}</span>
												<p className="text-xs text-muted-foreground">
													{item.description}
												</p>
											</div>
										)}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>
			</nav>

			{/* Footer */}
			<div className="border-t p-4">
				<div
					className={cn(
						"flex items-center gap-3",
						collapsed && "justify-center",
					)}
				>
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
						{user?.name?.charAt(0) || "U"}
					</div>
					{!collapsed && (
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium truncate">{user?.name || "User"}</p>
							<p className="text-xs text-muted-foreground truncate">
								{user?.email || "user@example.com"}
							</p>
							{user?.role && (
								<Badge variant="secondary" className="text-xs mt-1">
									{user.role}
								</Badge>
							)}
						</div>
					)}
				</div>
			</div>
		</motion.div>
	);
}
