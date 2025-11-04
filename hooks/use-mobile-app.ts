/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

'use client';

import { useState, useEffect } from 'react';
import { isMobile, isTablet, isDesktop } from 'react-device-detect';
import { useMediaQuery } from 'react-responsive';

export interface DeviceInfo {
	isMobile: boolean;
	isTablet: boolean;
	isDesktop: boolean;
	isMobileOrTablet: boolean;
	screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
	orientation: 'portrait' | 'landscape';
}

export function useDeviceInfo(): DeviceInfo {
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

export function useMobileNavigation() {
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

export function useAppInstallPrompt() {
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
