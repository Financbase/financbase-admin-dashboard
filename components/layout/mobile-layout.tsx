/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { PWAHead } from "@/components/pwa/pwa-head";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EnhancedNotificationsPanel } from "@/components/core/enhanced-notifications-panel";
import { useOnlineStatus } from "@/hooks/use-online-status";
import {
	Filter,
	LayoutDashboard,
	Menu,
	Wifi,
	WifiOff,
} from "lucide-react";
import { useEffect, useState } from "react";

interface MobileLayoutProps {
	children: React.ReactNode;
	title?: string;
	subtitle?: string;
	actions?: React.ReactNode;
}

export function MobileLayout({
	children,
	title,
	subtitle,
	actions,
}: MobileLayoutProps) {
	const [isMobile, setIsMobile] = useState(false);
	const [showMobileMenu, setShowMobileMenu] = useState(false);
	const isOnline = useOnlineStatus();

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);

		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	return (
		<>
			<PWAHead />

			<div className="min-h-screen bg-background">
				{/* Mobile Sidebar */}
				<MobileSidebar />

				{/* Main content */}
				<div
					className={`flex flex-1 flex-col ${isMobile ? "ml-0" : "md:ml-64"}`}
				>
					{/* Top Header Bar */}
					<header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
						<div className="flex h-16 items-center gap-4 px-4">
							{/* Mobile menu button */}
							<Button
								variant="ghost"
								size="sm"
								className="md:hidden"
								onClick={() => setShowMobileMenu(true)}
							>
								<Menu className="h-5 w-5" />
							</Button>

							{/* Page title and subtitle */}
							<div className="flex-1">
								{title && (
									<h1 className="text-lg font-semibold md:text-xl">{title}</h1>
								)}
								{subtitle && (
									<p className="text-sm text-muted-foreground hidden sm:block">
										{subtitle}
									</p>
								)}
							</div>

							{/* Status indicators and actions */}
							<div className="flex items-center gap-2">
								{/* Online/Offline status */}
								<div className="hidden sm:flex items-center gap-2">
									{isOnline ? (
										<Badge variant="outline" className="text-green-600">
											<Wifi className="mr-1 h-3 w-3" />
											Online
										</Badge>
									) : (
										<Badge variant="outline" className="text-red-600">
											<WifiOff className="mr-1 h-3 w-3" />
											Offline
										</Badge>
									)}
								</div>

								{/* Notifications */}
								<EnhancedNotificationsPanel />

								{/* Action buttons */}
								{actions && (
									<div className="flex items-center gap-2">{actions}</div>
								)}
							</div>
						</div>
					</header>

					{/* Page content */}
					<main className="flex-1 p-4 md:p-6">
						<div className="mx-auto max-w-7xl">{children}</div>
					</main>

					{/* Mobile bottom navigation (optional) */}
					{isMobile && (
						<nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur">
							<div className="grid grid-cols-4 gap-1 p-2">
								<Button
									variant="ghost"
									size="sm"
									className="flex flex-col gap-1 h-auto py-2"
								>
									<div className="h-4 w-4 rounded bg-primary" />
									<span className="text-xs">Home</span>
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="flex flex-col gap-1 h-auto py-2"
								>
									<div className="h-4 w-4 rounded bg-muted" />
									<span className="text-xs">Orders</span>
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="flex flex-col gap-1 h-auto py-2"
								>
									<div className="h-4 w-4 rounded bg-muted" />
									<span className="text-xs">Users</span>
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="flex flex-col gap-1 h-auto py-2"
								>
									<div className="h-4 w-4 rounded bg-muted" />
									<span className="text-xs">More</span>
								</Button>
							</div>
						</nav>
					)}
				</div>
			</div>

			{/* PWA Installation Prompt */}
			<PWAPrompt />
		</>
	);
}

// PWA Installation Prompt Component
function PWAPrompt() {
	const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
	const [showPrompt, setShowPrompt] = useState(false);

	useEffect(() => {
		const handleBeforeInstallPrompt = (e: any) => {
			e.preventDefault();
			setDeferredPrompt(e);
			setShowPrompt(true);
		};

		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

		return () => {
			window.removeEventListener(
				"beforeinstallprompt",
				handleBeforeInstallPrompt,
			);
		};
	}, []);

	const handleInstall = async () => {
		if (deferredPrompt) {
			deferredPrompt.prompt();
			const { outcome } = await deferredPrompt.userChoice;
			if (outcome === "accepted") {
				setDeferredPrompt(null);
				setShowPrompt(false);
			}
		}
	};

	if (!showPrompt) return null;

	return (
		<div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
			<div className="bg-card border rounded-lg p-4 shadow-lg">
				<div className="flex items-start gap-3">
					<div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
						<span className="text-primary-foreground font-bold text-sm">
							📱
						</span>
					</div>
					<div className="flex-1">
						<h3 className="font-medium text-sm">Install App</h3>
						<p className="text-xs text-muted-foreground mt-1">
							Get quick access to your dashboard from your home screen.
						</p>
					</div>
					<div className="flex gap-2">
						<Button
							size="sm"
							variant="outline"
							onClick={() => setShowPrompt(false)}
						>
							Later
						</Button>
						<Button size="sm" onClick={handleInstall}>
							Install
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
