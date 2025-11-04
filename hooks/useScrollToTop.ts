/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { useEffect, useState } from 'react';

/**
 * Hook for scroll-to-top functionality
 * Shows/hides a button based on scroll position and provides scroll function
 * 
 * @param threshold - Pixel threshold before showing the button (default: 300)
 * @returns Object with isVisible state and scrollToTop function
 */
export function useScrollToTop(threshold: number = 300) {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const toggleVisibility = () => {
			if (window.pageYOffset > threshold) {
				setIsVisible(true);
			} else {
				setIsVisible(false);
			}
		};

		// Set initial visibility
		toggleVisibility();

		// Add scroll event listener
		window.addEventListener('scroll', toggleVisibility);

		// Cleanup
		return () => {
			window.removeEventListener('scroll', toggleVisibility);
		};
	}, [threshold]);

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth',
		});
	};

	return {
		isVisible,
		scrollToTop,
	};
}

