"use client";

import { PublicFooter } from "@/components/layout/public-footer";
import { FinancbaseLogo } from "@/components/core/ui/layout/financbase-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function PublicLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	return (
		<div className="min-h-screen flex flex-col">
			<header className="bg-white shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-6">
						<div className="flex items-center">
							<Link href="/">
								<FinancbaseLogo size="md" />
							</Link>
						</div>

						{/* Desktop Navigation */}
						<nav className="hidden md:flex space-x-8">
							<Link href="/" className="text-gray-500 hover:text-gray-900">Home</Link>
							<Link href="/about" className="text-gray-500 hover:text-gray-900">About</Link>
							<Link href="/pricing" className="text-gray-500 hover:text-gray-900">Pricing</Link>
							<Link href="/contact" className="text-gray-500 hover:text-gray-900">Contact</Link>
						</nav>

						{/* Right side - Theme Toggle and Mobile Menu */}
						<div className="flex items-center space-x-4">
							<ThemeToggle />
							
							{/* Mobile menu button */}
							<button
								type="button"
								className="md:hidden p-2"
								onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							>
								{isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
							</button>
						</div>
					</div>

					{/* Mobile Navigation */}
					{isMobileMenuOpen && (
						<div className="md:hidden pb-6 border-t pt-4">
							<nav className="flex flex-col space-y-4">
								<Link href="/" className="text-gray-500 hover:text-gray-900" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
								<Link href="/about" className="text-gray-500 hover:text-gray-900" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
								<Link href="/pricing" className="text-gray-500 hover:text-gray-900" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
								<Link href="/contact" className="text-gray-500 hover:text-gray-900" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
							</nav>
						</div>
					)}
				</div>
			</header>
			<main className="flex-1">{children}</main>
			<PublicFooter />
		</div>
	);
}
