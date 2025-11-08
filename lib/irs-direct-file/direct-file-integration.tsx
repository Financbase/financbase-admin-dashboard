/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 * 
 * Integration module for IRS Direct File application.
 * 
 * NOTE: This is a simplified integration adapter. The full IRS Direct File
 * application requires a complete backend setup (Java Spring Boot services,
 * database, etc.). This adapter provides the structure for integration.
 * 
 * For production use, you will need to:
 * 1. Set up the Direct File backend services
 * 2. Configure the fact graph Scala compilation
 * 3. Set up proper environment variables
 * 4. Complete the full integration
 */

import { Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { StrictMode } from "react";

interface DirectFileConfig {
	onExportComplete?: (metadata: { filename: string; exportDate: string; format: "mef-xml" | "json" }) => void;
	onError?: (error: Error) => void;
}

/**
 * Initialize the IRS Direct File application in an isolated React root
 * 
 * This is a placeholder implementation. For full integration:
 * 1. The Direct File app uses BrowserRouter - we need to adapt it to MemoryRouter
 * 2. The app requires backend services (API, state-api, etc.)
 * 3. The fact graph needs to be compiled from Scala to JavaScript
 * 4. Environment variables need to be configured
 * 
 * Current implementation shows the structure. Full integration requires
 * additional setup work.
 */
export async function initializeDirectFileApp(
	root: Root,
	config: DirectFileConfig = {}
): Promise<void> {
	// Set up environment variables for Direct File
	if (typeof window !== "undefined") {
		const originalEnv = (window as any).__DIRECT_FILE_ENV__ || {};
		(window as any).__DIRECT_FILE_ENV__ = {
			...originalEnv,
			VITE_PUBLIC_PATH: "",
			VITE_ALLOW_LOADING_TEST_DATA: "true",
		};
	}

	try {
		// Import the adapted Direct File app (uses MemoryRouter)
		// Note: This requires the Direct File app to be properly set up with:
		// 1. Backend API endpoints configured
		// 2. Fact graph compiled from Scala
		// 3. Environment variables set
		
		// Try to load the adapted app
		let DirectFileApp;
		try {
			const appModule = await import("./df-client/df-client-app/src/App.adapted");
			DirectFileApp = appModule.DirectFileApp;
		} catch (importError) {
			// Fallback to placeholder if adapted app not available
			console.warn("Direct File adapted app not available, using placeholder:", importError);
			root.render(
				<StrictMode>
					<MemoryRouter initialEntries={["/flow"]} initialIndex={0}>
						<div style={{ padding: "2rem", textAlign: "center" }}>
							<h2>IRS Direct File Integration</h2>
							<p style={{ marginTop: "1rem", color: "#666" }}>
								The Direct File application integration is in progress.
							</p>
							<p style={{ marginTop: "0.5rem", color: "#666", fontSize: "0.9rem" }}>
								This requires additional setup:
							</p>
							<ul style={{ marginTop: "1rem", textAlign: "left", display: "inline-block" }}>
								<li>Backend services configuration</li>
								<li>Fact graph compilation</li>
								<li>Environment variable setup</li>
								<li>Dependencies installation</li>
							</ul>
							<p style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#999" }}>
								See docs/integrations/irs-direct-file.md for setup instructions.
							</p>
						</div>
					</MemoryRouter>
				</StrictMode>
			);
			return;
		}
		
		// Render the adapted Direct File app
		root.render(
			<StrictMode>
				<DirectFileApp
					initialPath="/flow"
					onExportComplete={config.onExportComplete}
					onError={config.onError}
				/>
			</StrictMode>
		);
	} catch (error) {
		console.error("Error initializing Direct File app:", error);
		throw new Error(
			error instanceof Error 
				? `Failed to initialize Direct File: ${error.message}`
				: "Failed to initialize Direct File application"
		);
	}
}

/**
 * Cleanup function to clear all Direct File related data
 */
export function cleanupDirectFile(): void {
	if (typeof window === "undefined") return;

	// Clear session storage
	const sessionKeys: string[] = [];
	for (let i = 0; i < sessionStorage.length; i++) {
		const key = sessionStorage.key(i);
		if (key && (key.startsWith("direct-file-") || key.startsWith("df-") || key.includes("taxreturn"))) {
			sessionKeys.push(key);
		}
	}
	sessionKeys.forEach((key) => sessionStorage.removeItem(key));

	// Clear localStorage (only Direct File related)
	const localKeys: string[] = [];
	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i);
		if (key && (key.startsWith("direct-file-") || key.startsWith("df-") || key.includes("taxreturn"))) {
			localKeys.push(key);
		}
	}
	localKeys.forEach((key) => localStorage.removeItem(key));
}
