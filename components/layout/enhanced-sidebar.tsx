import React, { useMemo, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FinancbaseLogo } from "@/components/ui/financbase-logo";
import { UserAvatar } from "@/components/core/ui/layout/user-avatar";
import { cn } from "@/lib/utils";
import {
	LayoutDashboard,
	CreditCard,
	BarChart3,
	FileText,
	Receipt,
	DollarSign,
	ImageIcon,
	Settings,
	Film,
	ChevronLeft,
	User,
	Users,
	Building2,
	ShoppingBag,
	Bot,
	Brain,
	Workflow,
	Store,
	Shield,
	TrendingUp,
	Target,
	HelpCircle,
	Monitor,
	Zap,
	Network,
	Briefcase,
	Home,
	X,
	Search,
	Plug,
	Code,
	Package,
	Globe,
	UserCog,
	Megaphone,
	Webhook,
	AlertTriangle,
	Puzzle,
	BookOpen,
	Clock,
} from "lucide-react";

interface NavigationItem {
	href: string;
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	section: string;
}

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

// Memoized navigation item component
const NavigationItem = React.memo<{
	item: NavigationItem;
	pathname: string;
	collapsed: boolean;
}>(({ item, pathname, collapsed }) => {
	const isActive = pathname === item.href;
	
	return (
		<li>
			<Link
				href={item.href}
				className={cn(
					"group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
					isActive
						? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-sm"
						: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
				)}
			>
				<item.icon className="h-4 w-4 flex-shrink-0" />
				{!collapsed && <span className="flex-1">{item.label}</span>}
			</Link>
		</li>
	);
});

NavigationItem.displayName = 'NavigationItem';

// Navigation data
const navigationData: NavigationItem[] = [
	// Main
	{ href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", section: "main" },
	{ href: "/search", icon: Search, label: "Search Hub", section: "main" },
	{ href: "/transactions", icon: CreditCard, label: "Transactions", section: "main" },
	{ href: "/analytics", icon: BarChart3, label: "Analytics", section: "main" },
	{ href: "/reports", icon: FileText, label: "Reports", section: "main" },
	
	// Financial Management
	{ href: "/invoices", icon: Receipt, label: "Invoices", section: "financial" },
	{ href: "/expenses", icon: DollarSign, label: "Expenses", section: "financial" },
	{ href: "/bill-pay", icon: FileText, label: "Bill Pay", section: "financial" },
	{ href: "/accounts", icon: Building2, label: "Accounts", section: "financial" },
	{ href: "/financial-intelligence", icon: Brain, label: "Financial Intelligence", section: "financial" },
	{ href: "/financial-intelligence/agency", icon: Building2, label: "Agency Intelligence", section: "financial" },
	{ href: "/financial-intelligence/ecommerce", icon: ShoppingBag, label: "E-commerce Intelligence", section: "financial" },
	
	// Business Services
	{ href: "/clients", icon: Users, label: "Clients", section: "business" },
	{ href: "/marketplace", icon: Store, label: "Marketplace", section: "business" },
	{ href: "/workflows", icon: Workflow, label: "Workflows", section: "business" },
	{ href: "/leads", icon: Target, label: "Leads", section: "business" },
	{ href: "/adboard", icon: Briefcase, label: "Adboard", section: "business" },
	{ href: "/real-estate", icon: Home, label: "Real Estate", section: "business" },
	{ href: "/freelance", icon: User, label: "Freelance", section: "business" },
	
	// Marketing & Advertising
	{ href: "/marketing", icon: Megaphone, label: "Marketing Hub", section: "marketing" },
	{ href: "/marketing/campaigns", icon: Target, label: "Campaigns", section: "marketing" },
	{ href: "/marketing/analytics", icon: BarChart3, label: "Marketing Analytics", section: "marketing" },
	{ href: "/marketing/leads", icon: Users, label: "Lead Management", section: "marketing" },
	{ href: "/marketing/automation", icon: Zap, label: "Marketing Automation", section: "marketing" },
	
	// HR & People Management
	{ href: "/hr", icon: UserCog, label: "HR Management", section: "hr" },
	{ href: "/hr/employees", icon: Users, label: "Employees", section: "hr" },
	{ href: "/hr/contractors", icon: User, label: "Contractors", section: "hr" },
	{ href: "/hr/time-tracking", icon: Clock, label: "Time Tracking", section: "hr" },
	{ href: "/hr/payroll", icon: DollarSign, label: "Payroll", section: "hr" },
	
	// AI & Intelligence
	{ href: "/ai-assistant", icon: Bot, label: "AI Assistant", section: "ai" },
	{ href: "/financbase-gpt", icon: Zap, label: "Financbase GPT", section: "ai" },
	{ href: "/performance", icon: TrendingUp, label: "Performance", section: "ai" },
	
	// Platform Services
	{ href: "/platform", icon: Puzzle, label: "Platform Hub", section: "platform" },
	{ href: "/workflows", icon: Workflow, label: "Workflows", section: "platform" },
	{ href: "/webhooks", icon: Webhook, label: "Webhooks", section: "platform" },
	{ href: "/monitoring", icon: Monitor, label: "System Monitoring", section: "platform" },
	{ href: "/alerts", icon: AlertTriangle, label: "Alerts & Notifications", section: "platform" },
	
	// Integration & Development
	{ href: "/integrations", icon: Plug, label: "Integrations", section: "integration" },
	{ href: "/integrations/marketplace", icon: Package, label: "Plugin Marketplace", section: "integration" },
	{ href: "/developer", icon: Code, label: "Developer Portal", section: "integration" },
	{ href: "/api", icon: Globe, label: "API Hub", section: "integration" },
	
	// Collaboration
	{ href: "/collaboration", icon: Network, label: "Collaboration", section: "collaboration" },
	{ href: "/security-dashboard", icon: Shield, label: "Security", section: "collaboration" },
	{ href: "/compliance", icon: Shield, label: "Compliance", section: "collaboration" },
	
	// Tools & Media
	{ href: "/gallery", icon: ImageIcon, label: "Image Gallery", section: "tools" },
	{ href: "/editor", icon: Settings, label: "Image Editor", section: "tools" },
	{ href: "/video", icon: Film, label: "Video Upload", section: "tools" },
	{ href: "/content", icon: FileText, label: "Content Manager", section: "tools" },
	
	// Support
	{ href: "/help-center", icon: HelpCircle, label: "Help Center", section: "support" },
	{ href: "/docs", icon: BookOpen, label: "Documentation", section: "support" },
];

const sectionLabels = {
	main: "Main",
	financial: "Financial Management",
	business: "Business Services",
	marketing: "Marketing & Advertising",
	hr: "HR & People Management",
	ai: "AI & Intelligence",
	platform: "Platform Services",
	integration: "Integration & Development",
	collaboration: "Collaboration",
	tools: "Tools & Media",
	support: "Support",
};

export const EnhancedSidebar = React.memo<EnhancedSidebarProps>(({
	collapsed = false,
	onToggleCollapse,
	onClose,
	user,
}) => {
	const pathname = usePathname();

	// Memoize grouped navigation items
	const groupedNavigation = useMemo(() => {
		const groups: Record<string, NavigationItem[]> = {};
		navigationData.forEach(item => {
			if (!groups[item.section]) {
				groups[item.section] = [];
			}
			groups[item.section].push(item);
		});
		return groups;
	}, []);

	// Memoize event handlers
	const handleToggleCollapse = useCallback(() => {
		onToggleCollapse?.();
	}, [onToggleCollapse]);

	const handleClose = useCallback(() => {
		onClose?.();
	}, [onClose]);

	return (
		<motion.div
			initial={{ x: -300 }}
			animate={{ x: 0 }}
			transition={{ duration: 0.3 }}
			className={cn(
				"flex h-full flex-col transition-all duration-300",
				"bg-[var(--sidebar)] border-r border-[var(--sidebar-border)]",
				"overflow-hidden",
				collapsed ? "w-16" : "w-64",
			)}
		>
			{/* Header */}
			<div className="flex h-16 items-center justify-between px-4 border-b border-[var(--sidebar-border)] flex-shrink-0">
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
						<button
							type="button"
							onClick={handleToggleCollapse}
							className="p-1.5 rounded-md hover:bg-[var(--sidebar-accent)] transition-colors"
						>
							<ChevronLeft className={cn("h-4 w-4 text-[var(--sidebar-foreground)]", collapsed && "rotate-180")} />
						</button>
					)}
					{onClose && (
						<button
							type="button"
							onClick={handleClose}
							className="p-1.5 rounded-md hover:bg-[var(--sidebar-accent)] transition-colors lg:hidden"
						>
							<X className="h-4 w-4 text-[var(--sidebar-foreground)]" />
						</button>
					)}
				</div>
			</div>

			{/* Navigation */}
			<nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 min-h-0">
				<div className="px-4 space-y-6">
					{Object.entries(groupedNavigation).map(([section, items]) => (
						<div key={section}>
						<h3 className={cn(
							"px-3 text-xs font-semibold uppercase tracking-wider mb-3",
							"text-[var(--sidebar-foreground)] opacity-60",
							collapsed && "hidden",
						)}>
								{sectionLabels[section as keyof typeof sectionLabels]}
						</h3>
						<ul className="space-y-1">
								{items.map((item) => (
									<NavigationItem
										key={item.href}
										item={item}
										pathname={pathname}
										collapsed={collapsed}
									/>
								))}
						</ul>
					</div>
					))}
				</div>
			</nav>

			{/* Footer - User Section */}
			<div className="border-t border-[var(--sidebar-border)] p-4 flex-shrink-0">
				{user ? (
					<div className={cn(
						"flex items-center gap-3",
						collapsed && "justify-center",
					)}>
						<UserAvatar
							name={user.name || "User"}
							imageUrl={user.avatar}
							size={collapsed ? 32 : 40}
						/>
						{!collapsed && (
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-[var(--sidebar-foreground)] truncate">
									{user.name || "User"}
								</p>
								{user.email && (
									<p className="text-xs text-[var(--sidebar-foreground)] opacity-60 truncate">
										{user.email}
									</p>
								)}
							</div>
						)}
					</div>
				) : (
					<div className={cn(
						"flex items-center gap-3",
						collapsed && "justify-center",
					)}>
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] text-sm font-medium">
							U
						</div>
						{!collapsed && (
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-[var(--sidebar-foreground)] truncate">
									Guest User
								</p>
								<p className="text-xs text-[var(--sidebar-foreground)] opacity-60 truncate">
									Not signed in
								</p>
							</div>
						)}
					</div>
				)}
			</div>
		</motion.div>
	);
});

EnhancedSidebar.displayName = 'EnhancedSidebar';
