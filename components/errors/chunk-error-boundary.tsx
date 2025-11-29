/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import type React from "react";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isChunkLoadError, handleChunkLoadError, reloadPageWithCacheBust } from "@/lib/utils/chunk-error-handler";
import { logger } from '@/lib/logger';

interface ChunkErrorBoundaryProps {
	children: ReactNode;
	/** Custom fallback UI */
	fallback?: ReactNode;
	/** Callback when chunk error is caught */
	onChunkError?: (error: Error, errorInfo: ErrorInfo) => void;
	/** Whether to automatically try to recover from chunk errors */
	autoRecover?: boolean;
}

interface ChunkErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
	isRecovering: boolean;
	retryCount: number;
}

/**
 * Error Boundary specifically designed for ChunkLoadError
 * 
 * Automatically detects and handles webpack chunk loading errors with
 * user-friendly error messages and recovery options.
 */
export class ChunkErrorBoundary extends Component<ChunkErrorBoundaryProps, ChunkErrorBoundaryState> {
	private retryTimeoutId: NodeJS.Timeout | null = null;

	constructor(props: ChunkErrorBoundaryProps) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			isRecovering: false,
			retryCount: 0,
		};
	}

	static getDerivedStateFromError(error: Error): Partial<ChunkErrorBoundaryState> {
		// Only catch chunk load errors
		if (isChunkLoadError(error)) {
			return {
				hasError: true,
				error,
				isRecovering: false,
				retryCount: 0,
			};
		}
		// Re-throw non-chunk errors to be handled by parent error boundaries
		throw error;
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// Log error for debugging
		logger.error("[ChunkErrorBoundary] Chunk load error caught:", error, errorInfo);

		// Call custom callback if provided
		if (this.props.onChunkError) {
			this.props.onChunkError(error, errorInfo);
		}

		// Auto-recover if enabled
		if (this.props.autoRecover !== false && isChunkLoadError(error)) {
			this.handleAutoRecover();
		}
	}

	componentWillUnmount() {
		// Clean up any pending retry timeouts
		if (this.retryTimeoutId) {
			clearTimeout(this.retryTimeoutId);
			this.retryTimeoutId = null;
		}
	}

	handleAutoRecover = () => {
		const { error } = this.state;
		if (!error) return;

		this.setState({ isRecovering: true });

		// Attempt to recover using the chunk error handler
		handleChunkLoadError(error, {
			maxRetries: 3,
			initialDelay: 1000,
			autoReload: true,
			onBeforeReload: () => {
				this.setState({ isRecovering: true });
			},
		}).catch((finalError) => {
			logger.error("[ChunkErrorBoundary] Auto-recovery failed:", finalError);
			this.setState({ isRecovering: false });
		});
	};

	handleManualRetry = () => {
		this.setState({ isRecovering: true, retryCount: this.state.retryCount + 1 });

		// Clear error state and try again
		setTimeout(() => {
			this.setState({
				hasError: false,
				error: null,
				isRecovering: false,
			});
		}, 100);
	};

	handleReload = () => {
		this.setState({ isRecovering: true });
		reloadPageWithCacheBust();
	};

	render() {
		if (this.state.hasError) {
			// Custom fallback UI
			if (this.props.fallback) {
				return this.props.fallback;
			}

			const { error, isRecovering } = this.state;

			// Default error UI
			return (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex flex-col items-center justify-center py-12 px-4 text-center min-h-[400px]"
					role="alert"
					aria-live="assertive"
				>
					<div className="mb-6">
						<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
							<AlertTriangle
								className="h-8 w-8 text-amber-600 dark:text-amber-400"
								aria-hidden="true"
							/>
						</div>
					</div>

					<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
						{isRecovering ? "Recovering..." : "Failed to Load Application"}
					</h3>

					<p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md">
						{isRecovering
							? "We're automatically reloading the page to fix the issue. Please wait..."
							: "The application failed to load a required component. This usually happens after a code update. Try reloading the page."}
					</p>

					{!isRecovering && (
						<div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
							<Button
								onClick={this.handleReload}
								className="w-full sm:w-auto flex-1"
								variant="default"
								disabled={isRecovering}
							>
								<RefreshCw className="h-4 w-4 mr-2" />
								Reload Page
							</Button>

							<Button
								onClick={this.handleManualRetry}
								className="w-full sm:w-auto flex-1"
								variant="outline"
								disabled={isRecovering}
							>
								<Download className="h-4 w-4 mr-2" />
								Try Again
							</Button>
						</div>
					)}

					{isRecovering && (
						<div className="mt-4">
							<div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
								<RefreshCw className="h-4 w-4 animate-spin" />
								Reloading...
							</div>
						</div>
					)}

					{process.env.NODE_ENV === "development" && error && (
						<details className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-left max-w-2xl w-full">
							<summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Error details (development only)
							</summary>
							<div className="mt-2 space-y-2">
								<p className="text-xs font-semibold text-red-600 dark:text-red-400">
									{error.name}: {error.message}
								</p>
								{error.stack && (
									<pre className="text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap overflow-auto">
										{error.stack}
									</pre>
								)}
							</div>
						</details>
					)}

					<p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
						If this problem persists, please try:
						<br />
						1. Hard refresh (Cmd/Ctrl + Shift + R)
						<br />
						2. Clear your browser cache
						<br />
						3. Contact support if the issue continues
					</p>
				</motion.div>
			);
		}

		return <>{this.props.children}</>;
	}
}

/**
 * Higher-order component to wrap components with chunk error boundary
 */
export function withChunkErrorBoundary<P extends object>(
	Component: React.ComponentType<P>,
	options?: Omit<ChunkErrorBoundaryProps, "children">
) {
	return function WrappedComponent(props: P) {
		return (
			<ChunkErrorBoundary {...options}>
				<Component {...props} />
			</ChunkErrorBoundary>
		);
	};
}

