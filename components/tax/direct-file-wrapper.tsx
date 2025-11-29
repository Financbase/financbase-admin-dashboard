/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 * 
 * This component wraps the IRS Direct File application for embedding within Financbase.
 * It provides isolation from Financbase's routing and state management while maintaining
 * the Direct File functionality.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import { DirectFileDisclosure } from "./direct-file-disclosure";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { logger } from '@/lib/logger';

interface DirectFileWrapperProps {
	/**
	 * Optional callback when export is completed
	 * Receives export metadata (filename, export date) - no PII/FTI
	 */
	onExportComplete?: (metadata: { filename: string; exportDate: string; format: "mef-xml" | "json" }) => void;
}

/**
 * Wrapper component for IRS Direct File application
 * 
 * This component:
 * - Isolates Direct File's React Router from Next.js routing using MemoryRouter
 * - Provides session-only state (no persistence)
 * - Clears all data on unmount
 * - Handles export functionality
 */
export function DirectFileWrapper({ onExportComplete }: DirectFileWrapperProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const rootRef = useRef<Root | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Initialize Direct File app in isolated container
		const initializeDirectFile = async () => {
			if (!containerRef.current) return;

			try {
				// Dynamic import to avoid loading Direct File code until needed
				const { initializeDirectFileApp } = await import("@/lib/irs-direct-file/direct-file-integration");
				
				// Create isolated React root for Direct File
				const root = createRoot(containerRef.current);
				rootRef.current = root;

				// Initialize the Direct File app with isolated routing
				await initializeDirectFileApp(root, {
					onExportComplete: (metadata) => {
						// Only store metadata, no PII/FTI
						onExportComplete?.(metadata);
					},
					onError: (err) => {
						setError(err.message || "An error occurred while loading the tax filing application.");
					},
				});

				setIsLoading(false);
			} catch (err) {
				logger.error("Failed to initialize Direct File:", err);
				setError(
					err instanceof Error 
						? err.message 
						: "Failed to load the tax filing application. Please try again later."
				);
				setIsLoading(false);
			}
		};

		initializeDirectFile();

		// Cleanup on unmount - clear all session data
		return () => {
			// Clear session storage related to Direct File
			if (typeof window !== "undefined") {
				const keysToRemove: string[] = [];
				for (let i = 0; i < sessionStorage.length; i++) {
					const key = sessionStorage.key(i);
					if (key && (key.startsWith("direct-file-") || key.startsWith("df-"))) {
						keysToRemove.push(key);
					}
				}
				keysToRemove.forEach((key) => sessionStorage.removeItem(key));

				// Clear any Direct File related localStorage
				const localStorageKeysToRemove: string[] = [];
				for (let i = 0; i < localStorage.length; i++) {
					const key = localStorage.key(i);
					if (key && (key.startsWith("direct-file-") || key.startsWith("df-"))) {
						localStorageKeysToRemove.push(key);
					}
				}
				localStorageKeysToRemove.forEach((key) => localStorage.removeItem(key));
			}

			// Unmount React root
			if (rootRef.current) {
				rootRef.current.unmount();
				rootRef.current = null;
			}
		};
	}, [onExportComplete]);

	return (
		<div className="space-y-6">
			<DirectFileDisclosure />

			<Card className="p-0 overflow-hidden">
				{error ? (
					<div className="p-8 text-center">
						<div className="text-destructive mb-4">{error}</div>
						<button
							onClick={() => window.location.reload()}
							className="text-primary hover:underline"
						>
							Reload page
						</button>
					</div>
				) : (
					<>
						{isLoading && (
							<div className="flex items-center justify-center p-12">
								<Loader2 className="h-8 w-8 animate-spin text-primary" />
								<span className="ml-3 text-muted-foreground">Loading tax filing application...</span>
							</div>
						)}
						<div
							ref={containerRef}
							className={isLoading ? "hidden" : "min-h-[600px]"}
							id="direct-file-container"
							aria-label="IRS Direct File tax filing application"
						/>
					</>
				)}
			</Card>
		</div>
	);
}

