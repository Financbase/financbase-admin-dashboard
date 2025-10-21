"use client";

import { AnimatePresence, motion } from "framer-motion";
import type React from "react";
import { useEffect, useState } from "react";
import { EnhancedSidebar } from "./enhanced-sidebar";
import { EnhancedTopNav } from "./enhanced-top-nav";

interface EnhancedLayoutProps {
	children: React.ReactNode;
	user?: {
		name: string;
		email: string;
		avatar?: string;
		role?: string;
	};
	notifications?: number;
}

export function EnhancedLayout({
	children,
	user,
	notifications = 0,
}: EnhancedLayoutProps) {
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	// Handle mobile menu
	const toggleMobileMenu = () => {
		setMobileMenuOpen(!mobileMenuOpen);
	};

	const toggleSidebarCollapse = () => {
		setSidebarCollapsed(!sidebarCollapsed);
	};

	// Close mobile menu on route change
	useEffect(() => {
		setMobileMenuOpen(false);
	}, []);

	// Handle escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && mobileMenuOpen) {
				setMobileMenuOpen(false);
			}
		};

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [mobileMenuOpen]);

	return (
		<div className="min-h-screen bg-background">
			{/* Mobile Overlay */}
			{mobileMenuOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 bg-black/50 z-40 lg:hidden"
					onClick={() => setMobileMenuOpen(false)}
				/>
			)}

			{/* Mobile Sidebar */}
			<motion.div
				initial={{ x: -300 }}
				animate={{ x: mobileMenuOpen ? 0 : -300 }}
				transition={{ duration: 0.3, ease: "easeInOut" }}
				className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
			>
				<EnhancedSidebar onClose={() => setMobileMenuOpen(false)} user={user} />
			</motion.div>

			{/* Desktop Sidebar */}
			<div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
				<EnhancedSidebar
					collapsed={sidebarCollapsed}
					onToggleCollapse={toggleSidebarCollapse}
					user={user}
				/>
			</div>

			{/* Main Content */}
			<div
				className={cn(
					"flex flex-col min-h-screen transition-all duration-300",
					sidebarCollapsed ? "lg:ml-16" : "lg:ml-64",
				)}
			>
				{/* Top Navigation */}
				<EnhancedTopNav
					onMenuClick={toggleMobileMenu}
					user={user}
					notifications={notifications}
				/>

				{/* Page Content */}
				<main className="flex-1">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
						className="p-4 sm:p-6 lg:p-8"
					>
						{children}
					</motion.div>
				</main>
			</div>
		</div>
	);
}

// Helper function for conditional classes
function cn(...classes: (string | undefined | null | false)[]): string {
	return classes.filter(Boolean).join(" ");
}
