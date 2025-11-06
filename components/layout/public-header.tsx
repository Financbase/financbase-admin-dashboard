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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FinancbaseLogo } from "@/components/ui/financbase-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSelector } from "@/components/i18n/language-selector";
import {
	BookOpen,
	ChevronDown,
	Filter,
	Headphones,
	Key,
	Link2,
	Menu,
	Shield,
	X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

const navigation = [
	{ name: "Home", href: "/" },
	{ name: "About", href: "/about" },
	{ name: "Pricing", href: "/pricing" },
	{ name: "Contact", href: "/contact" },
];

const resources = [
	{ name: "Documentation", href: "/docs" },
	{ name: "Support", href: "/support" },
	{ name: "Blog", href: "/blog" },
	{ name: "Careers", href: "/careers" },
	{ name: "Security", href: "/security" },
];

const legal = [
	{ name: "Privacy Policy", href: "/privacy" },
	{ name: "Terms of Service", href: "/terms" },
];

export function PublicHeader() {
	const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
	const pathname = usePathname();

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background">
			<div className="container mx-auto px-4">
				<div className="flex h-16 items-center justify-between">
					{/* Logo */}
					<div className="flex items-center">
						<Link href="/">
							<FinancbaseLogo size="md" />
						</Link>
					</div>

					{/* Desktop Navigation */}
					<nav className="hidden md:flex items-center space-x-8">
						{navigation.map((item) => (
							<Link
								key={item.name}
								href={item.href}
								className={`text-sm font-medium transition-colors hover:text-primary ${
									pathname === item.href
										? "text-primary"
										: "text-muted-foreground"
								}`}
							>
								{item.name}
							</Link>
						))}

						{/* Resources Dropdown */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="text-sm font-medium">
									Resources
									<ChevronDown className="ml-1 h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-48">
								{resources.map((item) => (
									<DropdownMenuItem key={item.name} asChild>
										<Link href={item.href} className="w-full">
											{item.name}
										</Link>
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					</nav>

					{/* Right side */}
					<div className="flex items-center space-x-4">
						<ThemeToggle />
						<LanguageSelector variant="minimal" />

						<div className="hidden md:flex items-center space-x-2">
							<Button variant="ghost" asChild>
								<Link href="/auth/sign-in">Sign In</Link>
							</Button>
							<Button asChild>
								<Link href="/auth/sign-up">Get Started</Link>
							</Button>
						</div>

						{/* Mobile menu button */}
						<Button
							variant="ghost"
							size="icon"
							className="md:hidden"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						>
							{mobileMenuOpen ? (
								<X className="h-6 w-6" />
							) : (
								<Menu className="h-6 w-6" />
							)}
						</Button>
					</div>
				</div>

				{/* Mobile Navigation */}
				{mobileMenuOpen && (
					<div className="md:hidden border-t">
						<div className="px-2 pt-2 pb-3 space-y-1">
							{navigation.map((item) => (
								<Link
									key={item.name}
									href={item.href}
									className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
										pathname === item.href
											? "bg-primary text-primary-foreground"
											: "text-muted-foreground hover:text-primary hover:bg-muted"
									}`}
									onClick={() => setMobileMenuOpen(false)}
								>
									{item.name}
								</Link>
							))}

							{/* Mobile Resources */}
							<div className="px-3 py-2">
								<div className="text-sm font-medium text-muted-foreground mb-2">
									Resources
								</div>
								<div className="space-y-1">
									{resources.map((item) => (
										<Link
											key={item.name}
											href={item.href}
											className="block px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-primary hover:bg-muted"
											onClick={() => setMobileMenuOpen(false)}
										>
											{item.name}
										</Link>
									))}
								</div>
							</div>

							{/* Mobile Auth */}
							<div className="pt-4 border-t">
								<div className="space-y-2">
									<Button
										variant="ghost"
										asChild
										className="w-full justify-start"
									>
										<Link href="/auth/sign-in">Sign In</Link>
									</Button>
									<Button asChild className="w-full">
										<Link href="/auth/sign-up">Get Started</Link>
									</Button>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</header>
	);
}
