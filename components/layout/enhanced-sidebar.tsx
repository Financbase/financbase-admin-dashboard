import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FinancbaseLogo } from "@/components/ui/financbase-logo";
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
	Activity,
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
	Calendar,
	HelpCircle,
	Monitor,
	Zap,
	Database,
	Network,
	Briefcase,
	Home,
	LineChart
} from "lucide-react";

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

export function EnhancedSidebar({
	collapsed = false,
	onToggleCollapse,
	onClose,
	user,
}: EnhancedSidebarProps) {
	const pathname = usePathname();

	return (
		<motion.div
			initial={{ x: -300 }}
			animate={{ x: 0 }}
			transition={{ duration: 0.3 }}
			className={cn(
				"flex h-full flex-col transition-all duration-300",
				"bg-[var(--sidebar)] border-r border-[var(--sidebar-border)]",
				collapsed ? "w-16" : "w-64",
			)}
		>
			{/* Header */}
			<div className="flex h-16 items-center justify-between px-4 border-b border-[var(--sidebar-border)]">
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
				{onToggleCollapse && (
					<button
						onClick={onToggleCollapse}
						className="p-1.5 rounded-md hover:bg-[var(--sidebar-accent)] transition-colors"
					>
						<ChevronLeft className={cn("h-4 w-4 text-[var(--sidebar-foreground)]", collapsed && "rotate-180")} />
					</button>
				)}
			</div>

			{/* Navigation */}
			<nav className="flex-1 overflow-y-auto py-4">
				<div className="px-4 space-y-6">
					{/* Main Navigation */}
					<div>
						<h3 className={cn(
							"px-3 text-xs font-semibold uppercase tracking-wider mb-3",
							"text-[var(--sidebar-foreground)] opacity-60",
							collapsed && "hidden",
						)}>
							Main
						</h3>
						<ul className="space-y-1">
							<li>
								<Link
									href="/dashboard"
									className={cn(
										"group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
										pathname === "/dashboard"
											? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-sm"
											: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
									)}
								>
									<LayoutDashboard className="h-4 w-4 flex-shrink-0" />
									{!collapsed && <span className="flex-1">Dashboard</span>}
								</Link>
							</li>
							<li>
								<Link
									href="/transactions"
									className={cn(
										"group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
										pathname === "/transactions"
											? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-sm"
											: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
									)}
								>
									<CreditCard className="h-4 w-4 flex-shrink-0" />
									{!collapsed && <span className="flex-1">Transactions</span>}
								</Link>
							</li>
							<li>
								<Link
									href="/analytics"
									className={cn(
										"group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
										pathname === "/analytics"
											? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-sm"
											: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
									)}
								>
									<BarChart3 className="h-4 w-4 flex-shrink-0" />
									{!collapsed && <span className="flex-1">Analytics</span>}
								</Link>
							</li>
							<li>
								<Link
									href="/reports"
									className={cn(
										"group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
										pathname === "/reports"
											? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-sm"
											: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
									)}
								>
									<FileText className="h-4 w-4 flex-shrink-0" />
									{!collapsed && <span className="flex-1">Reports</span>}
								</Link>
							</li>
						</ul>
					</div>

					{/* Financial Management */}
					<div>
						<h3 className={cn(
							"px-3 text-xs font-semibold uppercase tracking-wider mb-3",
							"text-[var(--sidebar-foreground)] opacity-60",
							collapsed && "hidden",
						)}>
							Financial
						</h3>
						<ul className="space-y-1">
							<li>
								<Link
									href="/invoices"
									className={cn(
										"group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
										pathname === "/invoices"
											? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-sm"
											: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
									)}
								>
									<Receipt className="h-4 w-4 flex-shrink-0" />
									{!collapsed && <span className="flex-1">Invoices</span>}
								</Link>
							</li>
							<li>
								<Link
									href="/expenses"
									className={cn(
										"group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
										pathname === "/expenses"
											? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-sm"
											: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
									)}
								>
									<DollarSign className="h-4 w-4 flex-shrink-0" />
									{!collapsed && <span className="flex-1">Expenses</span>}
								</Link>
							</li>
							<li>
								<Link
									href="/bill-pay"
									className={cn(
										"group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
										pathname === "/bill-pay"
											? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-sm"
											: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
									)}
								>
									<FileText className="h-4 w-4 flex-shrink-0" />
									{!collapsed && <span className="flex-1">Bill Pay</span>}
								</Link>
							</li>
							<li>
								<Link
									href="/accounts"
									className={cn(
										"group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
										pathname === "/accounts"
											? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-sm"
											: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
									)}
								>
									<Building2 className="h-4 w-4 flex-shrink-0" />
									{!collapsed && <span className="flex-1">Accounts</span>}
								</Link>
							</li>
							<li>
								<Link
									href="/financial-intelligence"
									className={cn(
										"group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
										pathname === "/financial-intelligence"
											? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-sm"
											: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
									)}
								>
									<Brain className="h-4 w-4 flex-shrink-0" />
									{!collapsed && <span className="flex-1">Financial Intelligence</span>}
								</Link>
							</li>
							<li>
								<Link
									href="/financial-intelligence/agency"
									className={cn(
										"group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
										pathname === "/financial-intelligence/agency"
											? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-sm"
											: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
									)}
								>
									<Building2 className="h-4 w-4 flex-shrink-0" />
									{!collapsed && <span className="flex-1">Agency Intelligence</span>}
								</Link>
							</li>
							<li>
								<Link
									href="/financial-intelligence/ecommerce"
									className={cn(
										"group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
										pathname === "/financial-intelligence/ecommerce"
											? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-sm"
											: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
									)}
								>
									<ShoppingBag className="h-4 w-4 flex-shrink-0" />
									{!collapsed && <span className="flex-1">E-commerce Intelligence</span>}
								</Link>
							</li>
						</ul>
					</div>

					{/* Business Management */}
					<div>
						<h3 className={cn(
							"px-3 text-xs font-semibold uppercase tracking-wider mb-3",
							"text-[var(--sidebar-foreground)] opacity-60",
							collapsed && "hidden",
						)}>
							Business
						</h3>
						<ul className="space-y-1">
							<li>
								<Link
									href="/clients"
									className={cn(
										"group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
										pathname === "/clients"
											? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-sm"
											: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
									)}
								>
									<Users className="h-4 w-4 flex-shrink-0" />
									{!collapsed && <span className="flex-1">Clients</span>}
								</Link>
							</li>
							<li>
								<Link
									href="/marketplace"
									className={cn(
										"group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
										pathname === "/marketplace"
											? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-sm"
											: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
									)}
								>
									<Store className="h-4 w-4 flex-shrink-0" />
									{!collapsed && <span className="flex-1">Marketplace</span>}
								</Link>
							</li>
							<li>
								<Link
									href="/workflows"
									className={cn(
										"group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
										pathname === "/workflows"
											? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-sm"
											: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
									)}
								>
									<Workflow className="h-4 w-4 flex-shrink-0" />
									{!collapsed && <span className="flex-1">Workflows</span>}
								</Link>
							</li>
							<li>
								<Link
									href="/leads"
									className={cn(
										"group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
										pathname === "/leads"
											? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-sm"
											: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
									)}
								>
									<Target className="h-4 w-4 flex-shrink-0" />
									{!collapsed && <span className="flex-1">Leads</span>}
								</Link>
							</li>
							<li>
								<Link
									href="/adboard"
									className={cn(
										"group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
										pathname === "/adboard"
											? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-sm"
											: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
									)}
								>
									<Briefcase className="h-4 w-4 flex-shrink-0" />
									{!collapsed && <span className="flex-1">Adboard</span>}
								</Link>
							</li>
							<li>
								<Link
									href="/real-estate"
									className={cn(
										"group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
										pathname === "/real-estate"
											? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-sm"
											: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
									)}
								>
									<Home className="h-4 w-4 flex-shrink-0" />
									{!collapsed && <span className="flex-1">Real Estate</span>}
								</Link>
							</li>
							<li>
								<Link
									href="/freelance"
									className={cn(
										"group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
										pathname === "/freelance"
											? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-sm"
											: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
									)}
								>
									<User className="h-4 w-4 flex-shrink-0" />
									{!collapsed && <span className="flex-1">Freelance</span>}
								</Link>
							</li>
						</ul>
					</div>

					{/* AI & Intelligence */}
					<div>
						<h3 className={cn(
							"px-3 text-xs font-semibold uppercase tracking-wider mb-3",
							"text-[var(--sidebar-foreground)] opacity-60",
							collapsed && "hidden",
						)}>
							AI & Intelligence
						</h3>
						<ul className="space-y-1">
							<li>
								<Link
									href="/ai-assistant"
									className={cn(
										"group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
										pathname === "/ai-assistant"
											? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-sm"
											: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
									)}
								>
									<Bot className="h-4 w-4 flex-shrink-0" />
									{!collapsed && <span className="flex-1">AI Assistant</span>}
								</Link>
							</li>
							<li>
								<Link
									href="/financbase-gpt"
									className={cn(
										"group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
										pathname === "/financbase-gpt"
											? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-sm"
											: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
									)}
								>
									<Zap className="h-4 w-4 flex-shrink-0" />
									{!collapsed && <span className="flex-1">Financbase GPT</span>}
								</Link>
							</li>
							<li>
								<Link
									href="/performance"
									className={cn(
										"group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
										pathname === "/performance"
											? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-sm"
											: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
									)}
								>
									<TrendingUp className="h-4 w-4 flex-shrink-0" />
									{!collapsed && <span className="flex-1">Performance</span>}
								</Link>
							</li>
						</ul>
					</div>

					{/* Collaboration */}
					<div>
						<h3 className={cn(
							"px-3 text-xs font-semibold uppercase tracking-wider mb-3",
							"text-[var(--sidebar-foreground)] opacity-60",
							collapsed && "hidden",
						)}>
							Collaboration
						</h3>
						<ul className="space-y-1">
							<li>
								<Link
									href="/collaboration"
									className={cn(
										"group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
										pathname === "/collaboration"
											? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-sm"
											: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
									)}
								>
									<Network className="h-4 w-4 flex-shrink-0" />
									{!collapsed && <span className="flex-1">Collaboration</span>}
								</Link>
							</li>
							<li>
								<Link
									href="/security-dashboard"
									className={cn(
										"group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
										pathname === "/security-dashboard"
											? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-sm"
											: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
									)}
								>
									<Shield className="h-4 w-4 flex-shrink-0" />
									{!collapsed && <span className="flex-1">Security</span>}
								</Link>
							</li>
							<li>
								<Link
									href="/monitoring"
									className={cn(
										"group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
										pathname === "/monitoring"
											? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-sm"
											: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
									)}
								>
									<Monitor className="h-4 w-4 flex-shrink-0" />
									{!collapsed && <span className="flex-1">Monitoring</span>}
								</Link>
							</li>
						</ul>
					</div>

					{/* Tools & Media */}
					<div>
						<h3 className={cn(
							"px-3 text-xs font-semibold uppercase tracking-wider mb-3",
							"text-[var(--sidebar-foreground)] opacity-60",
							collapsed && "hidden",
						)}>
							Tools & Media
						</h3>
						<ul className="space-y-1">
							<li>
								<Link
									href="/gallery"
									className={cn(
										"group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
										pathname === "/gallery"
											? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-sm"
											: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
									)}
								>
									<ImageIcon className="h-4 w-4 flex-shrink-0" />
									{!collapsed && <span className="flex-1">Image Gallery</span>}
								</Link>
							</li>
							<li>
								<Link
									href="/editor"
									className={cn(
										"group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
										pathname === "/editor"
											? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-sm"
											: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
									)}
								>
									<Settings className="h-4 w-4 flex-shrink-0" />
									{!collapsed && <span className="flex-1">Image Editor</span>}
								</Link>
							</li>
							<li>
								<Link
									href="/video"
									className={cn(
										"group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
										pathname === "/video"
											? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-sm"
											: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
									)}
								>
									<Film className="h-4 w-4 flex-shrink-0" />
									{!collapsed && <span className="flex-1">Video Upload</span>}
								</Link>
							</li>
							<li>
								<Link
									href="/integrations"
									className={cn(
										"group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
										pathname === "/integrations"
											? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-sm"
											: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
									)}
								>
									<Database className="h-4 w-4 flex-shrink-0" />
									{!collapsed && <span className="flex-1">Integrations</span>}
								</Link>
							</li>
						</ul>
					</div>

					{/* Support & Help */}
					<div>
						<h3 className={cn(
							"px-3 text-xs font-semibold uppercase tracking-wider mb-3",
							"text-[var(--sidebar-foreground)] opacity-60",
							collapsed && "hidden",
						)}>
							Support
						</h3>
						<ul className="space-y-1">
							<li>
								<Link
									href="/help-center"
									className={cn(
										"group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
										pathname === "/help-center"
											? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-sm"
											: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
									)}
								>
									<HelpCircle className="h-4 w-4 flex-shrink-0" />
									{!collapsed && <span className="flex-1">Help Center</span>}
								</Link>
							</li>
						</ul>
					</div>
				</div>
			</nav>

			{/* Footer */}
			<div className="border-t border-[var(--sidebar-border)] p-4">
				<div className={cn(
					"flex items-center gap-3",
					collapsed && "justify-center",
				)}>
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] text-sm font-medium">
						{user?.name?.charAt(0) || "U"}
					</div>
					{!collapsed && user && (
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-[var(--sidebar-foreground)] truncate">{user.name}</p>
							<p className="text-xs text-[var(--sidebar-foreground)] opacity-60 truncate">
								{user.email}
							</p>
						</div>
					)}
				</div>
			</div>
		</motion.div>
	);
}
