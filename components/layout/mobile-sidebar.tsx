"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
	BarChart3,
	Bell,
	Building2,
	ChevronDown,
	FileText,
	Filter,
	Home,
	Key,
	LayoutDashboard,
	Link2,
	LogOut,
	Menu,
	Search,
	Settings,
	ShoppingCart,
	Users,
	X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
	{ name: "Dashboard", href: "/dashboard", icon: Home, badge: null },
	{
		name: "Purchase Orders",
		href: "/purchases",
		icon: ShoppingCart,
		badge: "12",
	},
	{ name: "Employees", href: "/employees", icon: Users, badge: null },
	{ name: "Analytics", href: "/analytics", icon: BarChart3, badge: null },
	{ name: "Content", href: "/content", icon: FileText, badge: null },
	{ name: "Settings", href: "/settings", icon: Settings, badge: null },
];

interface MobileSidebarProps {
	className?: string;
}

export function MobileSidebar({ className }: MobileSidebarProps) {
	const [open, setOpen] = useState(false);
	const [expandedItems, setExpandedItems] = useState<string[]>([]);
	const pathname = usePathname();

	const toggleExpanded = (itemName: string) => {
		setExpandedItems((prev) =>
			prev.includes(itemName)
				? prev.filter((name) => name !== itemName)
				: [...prev, itemName],
		);
	};

	const SidebarContent = () => (
		<div className="flex h-full flex-col" data-testid="mobile-sidebar">
			{/* Header */}
			<div className="flex h-16 items-center justify-between px-4 border-b">
				<div className="flex items-center space-x-2">
					<div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
						<span className="text-primary-foreground font-bold text-sm">
							CMS
						</span>
					</div>
					<span className="font-semibold">Admin</span>
				</div>
				<Sheet open={open} onOpenChange={setOpen}>
					<SheetTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="md:hidden"
							data-testid="mobile-menu-close"
						>
							<X className="h-4 w-4" />
						</Button>
					</SheetTrigger>
				</Sheet>
			</div>

			{/* Navigation */}
			<nav
				className="flex-1 space-y-1 px-2 py-4"
				data-testid="mobile-navigation"
			>
				{navigation.map((item) => {
					const isActive = pathname === item.href;
					const Icon = item.icon;

					return (
						<div key={item.name}>
							<Link
								href={item.href}
								onClick={() => setOpen(false)}
								className={cn(
									"group flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md transition-colors",
									isActive
										? "bg-primary text-primary-foreground"
										: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
								)}
								data-testid={`mobile-nav-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
							>
								<div className="flex items-center space-x-3">
									<Icon className="h-4 w-4" />
									<span>{item.name}</span>
								</div>
								<div className="flex items-center space-x-2">
									{item.badge && (
										<Badge variant="secondary" className="text-xs">
											{item.badge}
										</Badge>
									)}
									<ChevronDown className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
								</div>
							</Link>

							{/* Sub-navigation (if needed) */}
							{expandedItems.includes(item.name) && (
								<div className="ml-6 space-y-1">
									{/* Add sub-items here if needed */}
								</div>
							)}
						</div>
					);
				})}
			</nav>

			{/* User section */}
			<div className="border-t p-4">
				<div className="flex items-center space-x-3 mb-3">
					<div className="h-8 w-8 bg-accent rounded-full flex items-center justify-center">
						<span className="text-sm font-medium">JD</span>
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium truncate">John Doe</p>
						<p className="text-xs text-muted-foreground truncate">
							john@company.com
						</p>
					</div>
				</div>

				<div className="space-y-1">
					<Button variant="ghost" size="sm" className="w-full justify-start">
						<Bell className="mr-2 h-4 w-4" />
						Notifications
					</Button>
					<Button variant="ghost" size="sm" className="w-full justify-start">
						<LogOut className="mr-2 h-4 w-4" />
						Sign Out
					</Button>
				</div>
			</div>
		</div>
	);

	return (
		<>
			{/* Mobile trigger */}
			<Sheet open={open} onOpenChange={setOpen}>
				<SheetTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						className="md:hidden"
						data-testid="mobile-menu-toggle"
					>
						<Menu className="h-5 w-5" />
						<span className="sr-only">Open sidebar</span>
					</Button>
				</SheetTrigger>
				<SheetContent side="left" className="w-80 p-0">
					<SidebarContent />
				</SheetContent>
			</Sheet>

			{/* Desktop sidebar */}
			<div
				className={cn(
					"hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0",
					className,
				)}
			>
				<div className="flex flex-col flex-grow border-r bg-card">
					<SidebarContent />
				</div>
			</div>
		</>
	);
}
