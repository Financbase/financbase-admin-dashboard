/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { EnhancedSidebar } from "./enhanced-sidebar";
import { EnhancedTopNav } from "./enhanced-top-nav";
import { DashboardFooter } from "./dashboard-footer";
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
	const pathname = usePathname();
	const isMountedRef = useRef(true);
	
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
		if (!isMountedRef.current) return;
		if (isMobile && touchSupported) {
			toggleMenu();
		} else {
			setMobileMenuOpen(prev => !prev);
		}
	}, [isMobile, touchSupported, toggleMenu]);

	const toggleSidebarCollapse = useCallback(() => {
		if (!isMountedRef.current) return;
		setSidebarCollapsed(prev => !prev);
	}, []);

	const closeMobileMenu = useCallback(() => {
		if (!isMountedRef.current) return;
		if (isMobile && touchSupported) {
			closeMenu();
		} else {
			setMobileMenuOpen(false);
		}
	}, [isMobile, touchSupported, closeMenu]);

	// Close mobile menu on route change
	useEffect(() => {
		if (!isMountedRef.current) return;
		
		// Close both menu states on route change
		if (isMobile && touchSupported) {
			closeMenu();
		} else {
			setMobileMenuOpen(false);
		}
	}, [pathname, isMobile, touchSupported, closeMenu]);

	// Handle escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isMenuOpen && isMountedRef.current) {
				if (isMobile && touchSupported) {
					closeMenu();
				} else {
					setMobileMenuOpen(false);
				}
			}
		};

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [isMenuOpen, isMobile, touchSupported, closeMenu]);

	// Cleanup on unmount
	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	return (
		<div className="h-screen bg-background overflow-hidden">
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
				transition={{ duration: 0.3,  }}
				className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
				onTouchStart={touchHandlers?.onTouchStart}
				onTouchMove={touchHandlers?.onTouchMove}
				onTouchEnd={touchHandlers?.onTouchEnd}
			>
				<EnhancedSidebar onClose={closeMobileMenu} user={user} />
			</motion.div>

			{/* Desktop Sidebar */}
			<div 
				className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col" 
				style={{ width: sidebarCollapsed ? '64px' : '256px' }}
			>
				<EnhancedSidebar
					collapsed={sidebarCollapsed}
					onToggleCollapse={toggleSidebarCollapse}
					user={user}
				/>
			</div>

			{/* Top Navigation - Mobile */}
			<div 
				className={cn(
					"lg:hidden fixed top-0 left-0 right-0 z-40 h-16"
				)}
			>
				<EnhancedTopNav
					onMenuClick={toggleMobileMenu}
					user={user}
					notifications={notifications}
				/>
			</div>

			{/* Top Navigation - Desktop */}
			<div 
				className={cn(
					"hidden lg:block fixed top-0 z-40 h-16 transition-all duration-300",
					sidebarCollapsed ? "left-16 right-0" : "left-64 right-0"
				)}
			>
				<EnhancedTopNav
					onMenuClick={toggleMobileMenu}
					user={user}
					notifications={notifications}
				/>
			</div>

			{/* Main Content Area - Mobile */}
			<div 
				className={cn(
					"lg:hidden fixed inset-0 pt-16 flex flex-col"
				)}
			>
				<main className="flex-1 w-full overflow-x-hidden overflow-y-auto">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
						className="w-full p-4 sm:p-6 lg:p-8"
					>
						{children}
					</motion.div>
				</main>
				<DashboardFooter />
			</div>

			{/* Main Content Area - Desktop */}
			<div 
				className={cn(
					"hidden lg:block fixed inset-0 transition-all duration-300 flex flex-col",
					"pt-16",
					sidebarCollapsed ? "left-16" : "left-64"
				)}
			>
				<main className="flex-1 w-full overflow-x-hidden overflow-y-auto">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
						className="w-full p-4 sm:p-6 lg:p-8 max-w-[1920px] mx-auto"
					>
						{children}
					</motion.div>
				</main>
				<DashboardFooter />
			</div>
		</div>
	);
});

EnhancedLayout.displayName = 'EnhancedLayout';
