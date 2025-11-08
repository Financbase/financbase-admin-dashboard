/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useEffect, useRef } from "react";

/**
 * Hook for managing ephemeral Direct File session
 * Ensures no PII/FTI is persisted to storage
 */
export function useDirectFileSession() {
	const sessionIdRef = useRef<string | null>(null);
	const cleanupRef = useRef<(() => void) | null>(null);

	useEffect(() => {
		// Generate a session ID for tracking (not PII)
		sessionIdRef.current = `df-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

		// Cleanup function to clear all session data
		const cleanup = () => {
			if (typeof window === "undefined") return;

			// Clear all Direct File related storage
			const keysToRemove: string[] = [];
			
			// Session storage
			for (let i = 0; i < sessionStorage.length; i++) {
				const key = sessionStorage.key(i);
				if (key && (key.startsWith("direct-file-") || key.startsWith("df-") || key.includes("taxreturn"))) {
					keysToRemove.push(key);
				}
			}
			keysToRemove.forEach((key) => sessionStorage.removeItem(key));

			// Local storage (only Direct File related)
			const localKeysToRemove: string[] = [];
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key && (key.startsWith("direct-file-") || key.startsWith("df-") || key.includes("taxreturn"))) {
					localKeysToRemove.push(key);
				}
			}
			localKeysToRemove.forEach((key) => localStorage.removeItem(key));
		};

		cleanupRef.current = cleanup;

		// Cleanup on unmount
		return cleanup;
	}, []);

	// Cleanup on page unload
	useEffect(() => {
		const handleBeforeUnload = () => {
			if (cleanupRef.current) {
				cleanupRef.current();
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, []);

	return {
		sessionId: sessionIdRef.current,
		cleanup: cleanupRef.current,
	};
}

