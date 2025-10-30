import React, { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { EnhancedSidebar } from "./enhanced-sidebar";
import { EnhancedTopNav } from "./enhanced-top-nav";
import { cn } from "@/lib/utils";
import { useMobileNavigation } from "@/hooks/use-mobile-touch";

interface EnhancedLayoutProps {
	children: ReactNode;
	user?: {
		name: string;
		email: string;
		avatar?: string;
		role?: string;
	};
	notifications?: number;
}

export const EnhancedLayout = React.memo<EnhancedLayoutProps>(({
	children,
	user,
	notifications = 0,
}) => {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	
	// Enhanced mobile navigation with touch support
	const { 
		isMobile, 
		touchSupported, 
		isOpen: mobileNavOpen, 
		toggleMenu, 
		closeMenu, 
		touchHandlers 
	} = useMobileNavigation();

	// Use mobile navigation state if on mobile
	const isMenuOpen = isMobile && touchSupported ? mobileNavOpen : mobileMenuOpen;

	// Memoize event handlers
	const toggleMobileMenu = useCallback(() => {
		if (isMobile && touchSupported) {
			toggleMenu();
		} else {
			setMobileMenuOpen(prev => !prev);
		}
	}, [isMobile, touchSupported, toggleMenu]);

	const toggleSidebarCollapse = useCallback(() => {
		setSidebarCollapsed(prev => !prev);
	}, []);

	const closeMobileMenu = useCallback(() => {
		if (isMobile && touchSupported) {
			closeMenu();
		} else {
			setMobileMenuOpen(false);
		}
	}, [isMobile, touchSupported, closeMenu]);

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
		<div className="min-h-screen bg-background flex flex-col">
			{/* Mobile Overlay */}
			{isMenuOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 bg-black/50 z-40 lg:hidden"
					onClick={closeMobileMenu}
				/>
			)}

			{/* Mobile Sidebar */}
			<motion.div
				initial={{ x: -300 }}
				animate={{ x: isMenuOpen ? 0 : -300 }}
				transition={{ duration: 0.3, ease: "easeInOut" }}
				className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
				onTouchStart={touchHandlers?.onTouchStart}
				onTouchMove={touchHandlers?.onTouchMove}
				onTouchEnd={touchHandlers?.onTouchEnd}
			>
				<EnhancedSidebar onClose={closeMobileMenu} user={user} />
			</motion.div>

			{/* Desktop Sidebar */}
			<div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
				<EnhancedSidebar
					collapsed={sidebarCollapsed}
					onToggleCollapse={toggleSidebarCollapse}
					user={user}
				/>
			</div>

			{/* Top Navigation */}
			<div className={cn(
				"transition-all duration-300 w-full",
				sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
			)}>
				<EnhancedTopNav
					onMenuClick={toggleMobileMenu}
					user={user}
					notifications={notifications}
				/>
			</div>

			{/* Main Content */}
			<div
				className={cn(
					"flex flex-col transition-all duration-300 flex-1",
					"pt-16",
					sidebarCollapsed ? "lg:ml-16" : "lg:ml-64",
				)}
			>
				{/* Page Content */}
				<main className="flex-1 w-full overflow-x-hidden">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
						className="w-full p-4 sm:p-6 lg:p-8"
					>
						{children}
					</motion.div>
				</main>
			</div>
		</div>
	);
});

EnhancedLayout.displayName = 'EnhancedLayout';
