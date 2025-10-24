'use client';

import { useDeviceInfo, useMobileNavigation, useAppInstallPrompt } from '@/hooks/use-mobile-app';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Menu, Download, X, Smartphone } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the mobile navigation component to prevent SSR hydration issues
const MobileNavigationContent = dynamic(() => Promise.resolve(MobileNavigation), {
	ssr: false,
	loading: () => <div className="min-h-screen bg-background">{/* Loading placeholder */}</div>
});

interface MobileNavigationProps {
	children: React.ReactNode;
}

function MobileNavigation({ children }: MobileNavigationProps) {
	const { isMobileOrTablet, screenSize, orientation } = useDeviceInfo();
	const { isOpen, setIsOpen } = useMobileNavigation();
	const { showInstallPrompt, installApp, dismissPrompt } = useAppInstallPrompt();

	if (!isMobileOrTablet) {
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

export function MobileAppShell({ children }: { children: React.ReactNode }) {
	const { isMobileOrTablet } = useDeviceInfo();

	if (isMobileOrTablet) {
		return <MobileNavigationContent>{children}</MobileNavigationContent>;
	}

	return <>{children}</>;
}
