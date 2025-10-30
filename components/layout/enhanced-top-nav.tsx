"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
} from "@/components/ui/dropdown-menu";
import { FinancbaseLogo } from "@/components/ui/financbase-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AnimatedNavbar, navbarItems } from "@/components/ui/animated-navbar";
import { SearchComponent } from "@/components/ui/search-component";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { motion } from "framer-motion";
import {
	Activity,
	Bell,
	BookOpen,
	FileText,
	HelpCircle,
	LogOut,
	Menu,
	MessageSquare,
	Search,
	Settings,
	Shield,
	User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

// Memoized notification items
const NotificationItems = React.memo<{ notifications: number }>(() => {
	const notificationData = useMemo(() => [
		{
			id: 1,
			type: 'payment',
			title: 'New Payment Received',
			description: 'Payment of $2,500 received from Acme Corp',
			time: '2m ago',
			color: 'bg-blue-500',
		},
		{
			id: 2,
			type: 'overdue',
			title: 'Invoice Overdue',
			description: 'Invoice #INV-2024-001 is 5 days overdue',
			time: '1h ago',
			color: 'bg-green-500',
		},
		{
			id: 3,
			type: 'expense',
			title: 'Expense Alert',
			description: 'Monthly expenses exceeded budget by 15%',
			time: '3h ago',
			color: 'bg-orange-500',
		},
	], []);

	return (
		<div className="max-h-80 overflow-y-auto">
			{notificationData.map((notification) => (
				<DropdownMenuItem key={notification.id} className="flex flex-col items-start p-4">
					<div className="flex items-center gap-2 w-full">
						<div className={`w-2 h-2 ${notification.color} rounded-full`}></div>
						<span className="text-sm font-medium">{notification.title}</span>
						<span className="text-xs text-muted-foreground ml-auto">{notification.time}</span>
					</div>
					<p className="text-xs text-muted-foreground mt-1">
						{notification.description}
					</p>
				</DropdownMenuItem>
			))}
		</div>
	);
});

NotificationItems.displayName = 'NotificationItems';

export const EnhancedTopNav = React.memo<EnhancedTopNavProps>(({
	onMenuClick,
	user,
	notifications = 0,
}) => {
	const [isScrolled, setIsScrolled] = useState(false);
	const pathname = usePathname();

	// Memoize scroll handler
	const handleScroll = useCallback(() => {
		setIsScrolled(window.scrollY > 10);
	}, []);

	// Handle scroll effect
	useEffect(() => {
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, [handleScroll]);

	return (
		<motion.header
			initial={{ y: -100 }}
			animate={{ y: 0 }}
			transition={{ duration: 0.3 }}
			className={`sticky top-0 z-[60] w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ${
				isScrolled ? "shadow-sm" : ""
			}`}
		>
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between gap-4">
					{/* Left Section - Logo & Mobile Menu */}
					<div className="flex items-center gap-4 flex-shrink-0">
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

					{/* Center Section - Animated Navbar */}
					<div className="hidden lg:flex flex-1 justify-center min-w-0 px-4">
						<AnimatedNavbar items={navbarItems} className="max-w-full" />
					</div>

					{/* Right Section - Actions & User Menu */}
					<div className="flex items-center gap-2 flex-shrink-0">
						{/* Desktop Search */}
						<div className="hidden md:block md:w-64 lg:w-72 xl:w-80">
							<SearchComponent placeholder="Search financial data..." />
						</div>

						{/* Mobile Search */}
						<Sheet>
							<SheetTrigger asChild>
								<Button variant="ghost" size="icon" className="md:hidden">
									<Search className="h-5 w-5" />
								</Button>
							</SheetTrigger>
							<SheetContent side="top" className="h-96">
								<SheetHeader>
									<SheetTitle>Search</SheetTitle>
									<SheetDescription>
										Find financial data, reports, and actions
									</SheetDescription>
								</SheetHeader>
								<div className="mt-4">
									<SearchComponent showShortcuts={false} />
								</div>
							</SheetContent>
						</Sheet>

						{/* Notifications */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
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
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-80">
								<DropdownMenuLabel>Notifications</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<NotificationItems notifications={notifications} />
								<DropdownMenuSeparator />
								<DropdownMenuItem className="text-center">
									View All Notifications
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						{/* Theme Toggle - Make it more prominent */}
						<div className="flex items-center">
							<ThemeToggle />
						</div>

						{/* Help */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon">
									<HelpCircle className="h-5 w-5" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-80">
								<DropdownMenuLabel>Help & Support</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link href="/docs" className="flex items-center">
										<FileText className="mr-2 h-4 w-4" />
										Documentation
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href="/guides" className="flex items-center">
										<BookOpen className="mr-2 h-4 w-4" />
										User Guides
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href="/support" className="flex items-center">
										<MessageSquare className="mr-2 h-4 w-4" />
										Contact Support
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link href="/api/health" className="flex items-center">
										<Activity className="mr-2 h-4 w-4" />
										System Status
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href="/legal" className="flex items-center">
										<Shield className="mr-2 h-4 w-4" />
										Legal & Privacy
									</Link>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						{/* User Menu */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="relative h-8 w-8 rounded-full p-0"
								>
									<Avatar className="h-8 w-8">
										<AvatarImage
											src={user?.avatar}
											alt={user?.name || "User"}
											className="object-cover"
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
									<Link href="/settings/profile" className="flex items-center">
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
});

EnhancedTopNav.displayName = 'EnhancedTopNav';