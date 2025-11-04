/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to detect scroll position
 * @param threshold - The scroll threshold in pixels
 * @returns boolean indicating if scrolled past threshold
 */
export function useScroll(threshold: number = 0) {
	const [scrolled, setScrolled] = useState(false);

	const onScroll = useCallback(() => {
		setScrolled(window.scrollY > threshold);
	}, [threshold]);

	useEffect(() => {
		// Check initial scroll position
		onScroll();

		// Add scroll listener
		window.addEventListener('scroll', onScroll, { passive: true });
		
		return () => {
			window.removeEventListener('scroll', onScroll);
		};
	}, [onScroll]);

	return scrolled;
}

/**
 * Hook to get current scroll position
 * @returns scroll position in pixels
 */
export function useScrollPosition() {
	const [scrollPosition, setScrollPosition] = useState(0);

	useEffect(() => {
		const updatePosition = () => {
			setScrollPosition(window.scrollY);
		};

		window.addEventListener('scroll', updatePosition, { passive: true });
		updatePosition(); // Set initial position

		return () => window.removeEventListener('scroll', updatePosition);
	}, []);

	return scrollPosition;
}

/**
 * Hook to detect scroll direction
 * @returns object with scroll direction and position
 */
export function useScrollDirection() {
	const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
	const [lastScrollY, setLastScrollY] = useState(0);

	useEffect(() => {
		const updateScrollDirection = () => {
			const scrollY = window.scrollY;
			const direction = scrollY > lastScrollY ? 'down' : 'up';
			
			if (direction !== scrollDirection && Math.abs(scrollY - lastScrollY) > 10) {
				setScrollDirection(direction);
			}
			setLastScrollY(scrollY > 0 ? scrollY : 0);
		};

		window.addEventListener('scroll', updateScrollDirection, { passive: true });
		return () => window.removeEventListener('scroll', updateScrollDirection);
	}, [scrollDirection, lastScrollY]);

	return { scrollDirection, scrollPosition: lastScrollY };
}
