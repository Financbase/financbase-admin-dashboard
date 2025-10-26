'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { isMobile, isTablet, isDesktop } from 'react-device-detect';
import { useMediaQuery } from 'react-responsive';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Menu, Download, X, Smartphone } from 'lucide-react';

interface DeviceInfo {
	isMobile: boolean;
	isTablet: boolean;
	isDesktop: boolean;
	isMobileOrTablet: boolean;
	screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
	orientation: 'portrait' | 'landscape';
}

function useDeviceInfo(): DeviceInfo {
	const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

	// Responsive breakpoints
	const isXs = useMediaQuery({ maxWidth: 575 });
	const isSm = useMediaQuery({ minWidth: 576, maxWidth: 767 });
	const isMd = useMediaQuery({ minWidth: 768, maxWidth: 991 });
	const isLg = useMediaQuery({ minWidth: 992, maxWidth: 1199 });
	const isXl = useMediaQuery({ minWidth: 1200, maxWidth: 1399 });
	const is2Xl = useMediaQuery({ minWidth: 1400 });

	// Determine screen size
	let screenSize: DeviceInfo['screenSize'] = 'xs';
	if (is2Xl) screenSize = '2xl';
	else if (isXl) screenSize = 'xl';
	else if (isLg) screenSize = 'lg';
	else if (isMd) screenSize = 'md';
	else if (isSm) screenSize = 'sm';

	// Handle orientation changes
	useEffect(() => {
		const handleOrientationChange = () => {
			setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
		};

		handleOrientationChange();
		window.addEventListener('resize', handleOrientationChange);
		window.addEventListener('orientationchange', handleOrientationChange);

		return () => {
			window.removeEventListener('resize', handleOrientationChange);
			window.removeEventListener('orientationchange', handleOrientationChange);
		};
	}, []);

	return {
		isMobile: isMobile || isXs,
		isTablet: isTablet || isSm || isMd,
		isDesktop: isDesktop || isLg || isXl || is2Xl,
		isMobileOrTablet: (isMobile || isTablet || isXs || isSm || isMd),
		screenSize,
		orientation,
	};
}

function useMobileNavigation() {
	const { isMobileOrTablet } = useDeviceInfo();
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		if (!isMobileOrTablet) {
			setIsOpen(false);
		}
	}, [isMobileOrTablet]);

	return {
		isOpen,
		setIsOpen,
		toggle: () => setIsOpen(!isOpen),
		close: () => setIsOpen(false),
		open: () => setIsOpen(true),
	};
}

function useAppInstallPrompt() {
	const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
	const [showInstallPrompt, setShowInstallPrompt] = useState(false);

	useEffect(() => {
		const handleBeforeInstallPrompt = (e: Event) => {
			e.preventDefault();
			setDeferredPrompt(e);
			setShowInstallPrompt(true);
		};

		const handleAppInstalled = () => {
			setDeferredPrompt(null);
			setShowInstallPrompt(false);
		};

		window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
		window.addEventListener('appinstalled', handleAppInstalled);

		return () => {
			window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
			window.removeEventListener('appinstalled', handleAppInstalled);
		};
	}, []);

	const installApp = async () => {
		if (!deferredPrompt) return;

		(deferredPrompt as any).prompt();
		const { outcome } = await (deferredPrompt as any).userChoice;

		if (outcome === 'accepted') {
			setDeferredPrompt(null);
			setShowInstallPrompt(false);
		}
	};

	return {
		showInstallPrompt,
		installApp,
		dismissPrompt: () => {
			setShowInstallPrompt(false);
			setDeferredPrompt(null);
		},
	};
}

interface MobileNavigationProps {
	children: React.ReactNode;
}

function MobileNavigation({ children }: MobileNavigationProps) {
	const { isMobileOrTablet, screenSize, orientation } = useDeviceInfo();
	const { isOpen, setIsOpen } = useMobileNavigation();
	const { showInstallPrompt, installApp, dismissPrompt } = useAppInstallPrompt();
	const pathname = usePathname();

	// Don't render mobile shell for dashboard pages - they have their own layout
	if (!isMobileOrTablet || pathname.startsWith('/dashboard')) {
		return <>{children}</>;
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Mobile Header */}
			<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container flex h-14 items-center">
					<Sheet open={isOpen} onOpenChange={setIsOpen}>
						<SheetTrigger asChild>
							<Button variant="ghost" size="icon" className="md:hidden">
								<Menu className="h-5 w-5" />
								<span className="sr-only">Toggle navigation menu</span>
							</Button>
						</SheetTrigger>
						<SheetContent side="left" className="w-[300px] sm:w-[400px]">
							<SheetHeader>
								<SheetTitle className="flex items-center gap-2">
									<Smartphone className="h-5 w-5" />
									Financbase Mobile
								</SheetTitle>
							</SheetHeader>
							<nav className="flex flex-col gap-4 mt-6">
								{children}
							</nav>
						</SheetContent>
					</Sheet>

					<div className="flex flex-1 items-center justify-between">
						<div className="flex items-center gap-2">
							<h1 className="font-semibold text-lg">Financbase</h1>
							<Badge variant="secondary" className="text-xs">
								{screenSize.toUpperCase()}
							</Badge>
						</div>

						{showInstallPrompt && (
							<div className="flex items-center gap-2">
								<Button size="sm" onClick={installApp} className="gap-2">
									<Download className="h-4 w-4" />
									Install App
								</Button>
								<Button
									size="sm"
									variant="ghost"
									onClick={dismissPrompt}
									className="h-8 w-8 p-0"
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
						)}
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="flex-1">
				{children}
			</main>

			{/* Mobile Footer */}
			<footer className="border-t bg-background p-4">
				<div className="container flex items-center justify-between text-sm text-muted-foreground">
					<div className="flex items-center gap-2">
						<Smartphone className="h-4 w-4" />
						<span>Mobile App</span>
					</div>
					<div className="flex items-center gap-2">
						<span>{orientation}</span>
						<span>•</span>
						<span>{screenSize}</span>
					</div>
				</div>
			</footer>
		</div>
	);
}

// Dynamic import for the entire MobileNavigation component to prevent SSR
const DynamicMobileNavigation = dynamic(() => Promise.resolve(MobileNavigation), {
	ssr: false,
	loading: () => <div className="min-h-screen bg-background">{/* Loading placeholder */}</div>
});

export function MobileAppShell({ children }: { children: React.ReactNode }) {
	// Check if children contain layout components that provide their own navigation
	const childrenArray = React.Children.toArray(children);
	const hasLayoutNavigation = childrenArray.some((child) => {
		if (React.isValidElement(child)) {
			const componentName = (child.type as any)?.name || child.type?.toString() || '';
			return componentName.includes('EnhancedLayout') || componentName.includes('enhanced-layout');
		}
		return false;
	});

	// If children have their own layout, just pass them through
	if (hasLayoutNavigation) {
		return <>{children}</>;
	}

	// For other cases, use dynamic mobile navigation
	return <DynamicMobileNavigation>{children}</DynamicMobileNavigation>;
}
