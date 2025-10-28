'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface TouchPosition {
	x: number;
	y: number;
}

interface SwipeDirection {
	direction: 'left' | 'right' | 'up' | 'down' | null;
	velocity: number;
	distance: number;
}

interface TouchGestureOptions {
	threshold?: number;
	velocityThreshold?: number;
	preventDefault?: boolean;
}

const defaultOptions: Required<TouchGestureOptions> = {
	threshold: 50,
	velocityThreshold: 0.3,
	preventDefault: true,
};

/**
 * Hook for handling touch gestures and interactions
 */
export function useTouchGestures(options: TouchGestureOptions = {}) {
	const opts = { ...defaultOptions, ...options };
	const [touchStart, setTouchStart] = useState<TouchPosition | null>(null);
	const [touchEnd, setTouchEnd] = useState<TouchPosition | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [swipeDirection, setSwipeDirection] = useState<SwipeDirection>({
		direction: null,
		velocity: 0,
		distance: 0,
	});
	
	const touchStartTime = useRef<number>(0);
	const lastTouchTime = useRef<number>(0);

	const handleTouchStart = useCallback((e: TouchEvent) => {
		if (opts.preventDefault) {
			e.preventDefault();
		}
		
		const touch = e.touches[0];
		const position = { x: touch.clientX, y: touch.clientY };
		
		setTouchStart(position);
		setTouchEnd(null);
		setIsDragging(true);
		touchStartTime.current = Date.now();
		lastTouchTime.current = Date.now();
	}, [opts.preventDefault]);

	const handleTouchMove = useCallback((e: TouchEvent) => {
		if (!touchStart) return;
		
		if (opts.preventDefault) {
			e.preventDefault();
		}
		
		const touch = e.touches[0];
		const position = { x: touch.clientX, y: touch.clientY };
		
		setTouchEnd(position);
		lastTouchTime.current = Date.now();
	}, [touchStart, opts.preventDefault]);

	const handleTouchEnd = useCallback((e: TouchEvent) => {
		if (opts.preventDefault) {
			e.preventDefault();
		}
		
		setIsDragging(false);
		
		if (!touchStart || !touchEnd) return;
		
		const deltaX = touchEnd.x - touchStart.x;
		const deltaY = touchEnd.y - touchStart.y;
		const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
		const timeDelta = Date.now() - touchStartTime.current;
		const velocity = distance / timeDelta;
		
		// Determine swipe direction
		let direction: SwipeDirection['direction'] = null;
		
		if (Math.abs(deltaX) > Math.abs(deltaY)) {
			// Horizontal swipe
			if (Math.abs(deltaX) > opts.threshold && velocity > opts.velocityThreshold) {
				direction = deltaX > 0 ? 'right' : 'left';
			}
		} else {
			// Vertical swipe
			if (Math.abs(deltaY) > opts.threshold && velocity > opts.velocityThreshold) {
				direction = deltaY > 0 ? 'down' : 'up';
			}
		}
		
		setSwipeDirection({
			direction,
			velocity,
			distance,
		});
		
		// Reset after a short delay
		setTimeout(() => {
			setSwipeDirection({
				direction: null,
				velocity: 0,
				distance: 0,
			});
			setTouchStart(null);
			setTouchEnd(null);
		}, 100);
	}, [touchStart, touchEnd, opts.threshold, opts.velocityThreshold, opts.preventDefault]);

	return {
		touchStart,
		touchEnd,
		isDragging,
		swipeDirection,
		handleTouchStart,
		handleTouchMove,
		handleTouchEnd,
	};
}

/**
 * Hook for mobile-specific interactions
 */
export function useMobileInteractions() {
	const [isMobile, setIsMobile] = useState(false);
	const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
	const [touchSupported, setTouchSupported] = useState(false);

	useEffect(() => {
		// Check if device is mobile
		const checkMobile = () => {
			const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
				window.innerWidth <= 768;
			setIsMobile(isMobileDevice);
		};

		// Check touch support
		const checkTouchSupport = () => {
			setTouchSupported('ontouchstart' in window || navigator.maxTouchPoints > 0);
		};

		// Check orientation
		const checkOrientation = () => {
			setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
		};

		checkMobile();
		checkTouchSupport();
		checkOrientation();

		// Add event listeners
		window.addEventListener('resize', checkMobile);
		window.addEventListener('resize', checkOrientation);
		window.addEventListener('orientationchange', checkOrientation);

		return () => {
			window.removeEventListener('resize', checkMobile);
			window.removeEventListener('resize', checkOrientation);
			window.removeEventListener('orientationchange', checkOrientation);
		};
	}, []);

	return {
		isMobile,
		orientation,
		touchSupported,
	};
}

/**
 * Hook for enhanced mobile navigation
 */
export function useMobileNavigation() {
	const [isOpen, setIsOpen] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);
	
	const { isMobile, touchSupported } = useMobileInteractions();
	const { swipeDirection, handleTouchStart, handleTouchMove, handleTouchEnd } = useTouchGestures({
		threshold: 100,
		velocityThreshold: 0.5,
	});

	// Handle swipe gestures for mobile menu
	useEffect(() => {
		if (!isMobile || !touchSupported) return;

		if (swipeDirection.direction === 'right' && !isOpen) {
			// Swipe right to open menu
			setIsOpen(true);
		} else if (swipeDirection.direction === 'left' && isOpen) {
			// Swipe left to close menu
			setIsOpen(false);
		}
	}, [swipeDirection, isOpen, isMobile, touchSupported]);

	const toggleMenu = useCallback(() => {
		if (isAnimating) return;
		
		setIsAnimating(true);
		setIsOpen(prev => !prev);
		
		// Reset animation state after transition
		setTimeout(() => {
			setIsAnimating(false);
		}, 300);
	}, [isAnimating]);

	const closeMenu = useCallback(() => {
		if (isAnimating) return;
		
		setIsAnimating(true);
		setIsOpen(false);
		
		setTimeout(() => {
			setIsAnimating(false);
		}, 300);
	}, [isAnimating]);

	// Close menu on escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				closeMenu();
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [isOpen, closeMenu]);

	return {
		isOpen,
		isAnimating,
		isMobile,
		touchSupported,
		toggleMenu,
		closeMenu,
		touchHandlers: {
			onTouchStart: handleTouchStart,
			onTouchMove: handleTouchMove,
			onTouchEnd: handleTouchEnd,
		},
	};
}

/**
 * Hook for improved mobile scrolling
 */
export function useMobileScroll() {
	const [isScrolling, setIsScrolling] = useState(false);
	const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
	const [lastScrollY, setLastScrollY] = useState(0);
	const scrollTimeout = useRef<NodeJS.Timeout>();

	const handleScroll = useCallback(() => {
		const currentScrollY = window.scrollY;
		const direction = currentScrollY > lastScrollY ? 'down' : 'up';
		
		setScrollDirection(direction);
		setLastScrollY(currentScrollY);
		setIsScrolling(true);
		
		// Clear existing timeout
		if (scrollTimeout.current) {
			clearTimeout(scrollTimeout.current);
		}
		
		// Set timeout to stop scrolling state
		scrollTimeout.current = setTimeout(() => {
			setIsScrolling(false);
		}, 150);
	}, [lastScrollY]);

	useEffect(() => {
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => {
			window.removeEventListener('scroll', handleScroll);
			if (scrollTimeout.current) {
				clearTimeout(scrollTimeout.current);
			}
		};
	}, [handleScroll]);

	return {
		isScrolling,
		scrollDirection,
		scrollY: lastScrollY,
	};
}
