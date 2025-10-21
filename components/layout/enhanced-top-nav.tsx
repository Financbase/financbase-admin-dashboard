"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/core/ui/navigation/dropdown-menu";
import { FinancbaseLogo } from "@/components/ui/financbase-logo";
import { Input } from "@/components/ui/input";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { AnimatePresence, motion } from "framer-motion";
import {
	BarChart3,
	Bell,
	ChevronDown,
	DollarSign,
	Filter,
	HelpCircle,
	Key,
	LayoutDashboard,
	Link2,
	LogOut,
	Menu,
	Monitor,
	Moon,
	Search,
	Settings,
	Sun,
	TrendingUp,
	User,
	X,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";

interface EnhancedTopNavProps {
	onMenuClick?: () => void;
	user?: {
		name: string;
		email: string;
		avatar?: string;
		role?: string;
	};
	notifications?: number;
}

export function EnhancedTopNav({
	onMenuClick,
	user,
	notifications = 0,
}: EnhancedTopNavProps) {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

	const pathname = usePathname();

	// Handle scroll effect
	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Quick actions for search
	const quickActions = [
		{ name: "Financial Dashboard", href: "/dashboard", icon: BarChart3 },
		{ name: "Analytics", href: "/analytics", icon: TrendingUp },
		{ name: "Transactions", href: "/transactions", icon: DollarSign },
		{ name: "Settings", href: "/settings", icon: Settings },
	];

	const filteredActions = quickActions.filter((action) =>
		action.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<motion.header
			initial={{ y: -100 }}
			animate={{ y: 0 }}
			transition={{ duration: 0.3 }}
			className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ${
				isScrolled ? "shadow-sm" : ""
			}`}
		>
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					{/* Left Section - Logo & Mobile Menu */}
					<div className="flex items-center gap-4">
						{/* Mobile Menu Button */}
						<Button
							variant="ghost"
							size="icon"
							onClick={onMenuClick}
							className="lg:hidden"
							aria-label="Toggle navigation menu"
						>
							<Menu className="h-5 w-5" />
						</Button>

					{/* Logo */}
					<Link href="/dashboard" className="flex items-center gap-2">
						<FinancbaseLogo size="sm" />
					</Link>
					</div>

					{/* Center Section - Search */}
					<div className="flex-1 max-w-md mx-4 hidden md:block">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search financial data, reports, or actions..."
								className="pl-10 pr-4 bg-muted/50 border-0 focus:bg-background transition-colors"
								onFocus={() => setIsSearchOpen(true)}
								onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>

						{/* Search Results Dropdown */}
						<AnimatePresence>
							{isSearchOpen && (
								<motion.div
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50"
								>
									<div className="p-2">
										{filteredActions.length > 0 ? (
											filteredActions.map((action) => (
												<Link
													key={action.name}
													href={action.href}
													className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors"
												>
													<action.icon className="h-4 w-4 text-muted-foreground" />
													<span className="text-sm">{action.name}</span>
												</Link>
											))
										) : (
											<div className="p-4 text-center text-muted-foreground">
												<Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
												<p className="text-sm">No results found</p>
											</div>
										)}
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					{/* Right Section - Actions & User Menu */}
					<div className="flex items-center gap-2">
						{/* Mobile Search */}
						<Sheet>
							<SheetTrigger asChild>
								<Button variant="ghost" size="icon" className="md:hidden">
									<Search className="h-5 w-5" />
								</Button>
							</SheetTrigger>
							<SheetContent side="top" className="h-32">
								<SheetHeader>
									<SheetTitle>Search</SheetTitle>
									<SheetDescription>
										Find financial data, reports, and actions
									</SheetDescription>
								</SheetHeader>
								<div className="mt-4">
									<Input
										placeholder="Search..."
										className="w-full"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
									/>
								</div>
							</SheetContent>
						</Sheet>

						{/* Notifications */}
						<Button variant="ghost" size="icon" className="relative">
							<Bell className="h-5 w-5" />
							{notifications > 0 && (
								<Badge
									variant="destructive"
									className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
								>
									{notifications > 9 ? "9+" : notifications}
								</Badge>
							)}
						</Button>

						{/* Theme Toggle */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon">
									<Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
									<Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
									<span className="sr-only">Toggle theme</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={() => setTheme("light")}>
									<Sun className="mr-2 h-4 w-4" />
									Light
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setTheme("dark")}>
									<Moon className="mr-2 h-4 w-4" />
									Dark
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setTheme("system")}>
									<Monitor className="mr-2 h-4 w-4" />
									System
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						{/* Help */}
						<Button variant="ghost" size="icon">
							<HelpCircle className="h-5 w-5" />
						</Button>

						{/* User Menu */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="relative h-8 w-8 rounded-full"
								>
									<Avatar className="h-8 w-8">
										<AvatarImage
											src={user?.avatar}
											alt={user?.name || "User"}
										/>
										<AvatarFallback className="bg-primary text-primary-foreground">
											{user?.name?.charAt(0) || "U"}
										</AvatarFallback>
									</Avatar>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56" align="end" forceMount>
								<DropdownMenuLabel className="font-normal">
									<div className="flex flex-col space-y-1">
										<p className="text-sm font-medium leading-none">
											{user?.name || "User"}
										</p>
										<p className="text-xs leading-none text-muted-foreground">
											{user?.email || "user@example.com"}
										</p>
										{user?.role && (
											<Badge variant="secondary" className="w-fit text-xs">
												{user.role}
											</Badge>
										)}
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link href="/profile" className="flex items-center">
										<User className="mr-2 h-4 w-4" />
										Profile
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href="/settings" className="flex items-center">
										<Settings className="mr-2 h-4 w-4" />
										Settings
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem className="flex items-center text-red-600">
									<LogOut className="mr-2 h-4 w-4" />
									Sign out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>

			{/* Breadcrumb for current page */}
			<div className="border-t bg-muted/30">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2">
					<nav className="flex items-center space-x-2 text-sm">
						<Link
							href="/dashboard"
							className="text-muted-foreground hover:text-foreground"
						>
							Dashboard
						</Link>
						{pathname !== "/dashboard" && (
							<>
								<span className="text-muted-foreground">/</span>
								<span className="text-foreground font-medium capitalize">
									{pathname.split("/").pop()?.replace("-", " ")}
								</span>
							</>
						)}
					</nav>
				</div>
			</div>
		</motion.header>
	);
}
