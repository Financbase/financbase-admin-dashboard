/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { isChunkLoadError } from "@/lib/utils/chunk-error-handler";
import { logger } from '@/lib/logger';

interface ReactQueryDevtoolsWrapperProps {
	/** Whether DevTools should be initially open */
	initialIsOpen?: boolean;
}

interface ReactQueryDevtoolsWrapperState {
	hasError: boolean;
	error: Error | null;
	retryCount: number;
	isLoading: boolean;
}

/**
 * Wrapper component for React Query DevTools that handles chunk loading errors gracefully.
 * 
 * This component:
 * - Catches chunk loading errors and prevents them from breaking the app
 * - Makes DevTools optional (app works without it)
 * - Provides retry logic for failed loads
 * - Logs errors for debugging without showing user-facing errors
 */
export class ReactQueryDevtoolsWrapper extends Component<
	ReactQueryDevtoolsWrapperProps,
	ReactQueryDevtoolsWrapperState
> {
	private DevToolsComponent: React.ComponentType<{ initialIsOpen?: boolean }> | null = null;
	private loadAttempts = 0;
	private readonly maxLoadAttempts = 3;

	constructor(props: ReactQueryDevtoolsWrapperProps) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			retryCount: 0,
			isLoading: true,
		};
	}

	componentDidMount() {
		// Only load DevTools in development mode
		if (process.env.NODE_ENV === 'development') {
			this.loadDevTools();
		} else {
			this.setState({ isLoading: false });
		}
	}

	loadDevTools = async () => {
		if (this.loadAttempts >= this.maxLoadAttempts) {
			logger.warn(
				'[ReactQueryDevtoolsWrapper] Max load attempts reached. DevTools will not be available.'
			);
			this.setState({ isLoading: false, hasError: true });
			return;
		}

		this.loadAttempts++;
		this.setState({ isLoading: true, hasError: false });

		try {
			// Dynamically import DevTools with error handling
			const module = await import('@tanstack/react-query-devtools');
			this.DevToolsComponent = module.ReactQueryDevtools;
			this.setState({ isLoading: false, hasError: false });
		} catch (error) {
			const err = error instanceof Error ? error : new Error(String(error));
			
			// Check if it's a chunk loading error
			if (isChunkLoadError(err)) {
				logger.warn(
					'[ReactQueryDevtoolsWrapper] Chunk loading error for DevTools:',
					err.message
				);
				
				// Retry with exponential backoff
				const delay = Math.min(1000 * Math.pow(2, this.loadAttempts - 1), 5000);
				
				if (this.loadAttempts < this.maxLoadAttempts) {
					console.info(
						`[ReactQueryDevtoolsWrapper] Retrying DevTools load in ${delay}ms (attempt ${this.loadAttempts}/${this.maxLoadAttempts})...`
					);
					
					setTimeout(() => {
						this.loadDevTools();
					}, delay);
				} else {
					logger.warn(
						'[ReactQueryDevtoolsWrapper] All retry attempts failed. DevTools will not be available.'
					);
					this.setState({ 
						isLoading: false, 
						hasError: true, 
						error: err 
					});
				}
			} else {
				// Non-chunk error - log and fail gracefully
				logger.error(
					'[ReactQueryDevtoolsWrapper] Error loading DevTools:',
					err
				);
				this.setState({ 
					isLoading: false, 
					hasError: true, 
					error: err 
				});
			}
		}
	};

	static getDerivedStateFromError(error: Error): Partial<ReactQueryDevtoolsWrapperState> {
		// Only catch chunk load errors in the error boundary
		if (isChunkLoadError(error)) {
			return {
				hasError: true,
				error,
			};
		}
		// Re-throw non-chunk errors
		throw error;
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// Log error for debugging
		if (isChunkLoadError(error)) {
			logger.warn(
				'[ReactQueryDevtoolsWrapper] Caught chunk load error in error boundary:',
				error,
				errorInfo
			);
		} else {
			logger.error(
				'[ReactQueryDevtoolsWrapper] Caught non-chunk error:',
				error,
				errorInfo
			);
		}
	}

	handleRetry = () => {
		this.loadAttempts = 0;
		this.setState({ retryCount: this.state.retryCount + 1, hasError: false });
		this.loadDevTools();
	};

	render(): ReactNode {
		// Don't render anything in production
		if (process.env.NODE_ENV !== 'development') {
			return null;
		}

		// If still loading, render nothing (DevTools will appear when loaded)
		if (this.state.isLoading) {
			return null;
		}

		// If there's an error, fail silently (don't break the app)
		if (this.state.hasError) {
			// Optionally, you could render a small indicator in development
			// For now, we'll just fail silently
			return null;
		}

		// If DevTools loaded successfully, render it
		if (this.DevToolsComponent) {
			const { initialIsOpen = false } = this.props;
			return <this.DevToolsComponent initialIsOpen={initialIsOpen} />;
		}

		// Fallback (shouldn't reach here)
		return null;
	}
}

/**
 * Pre-configured DevTools wrapper with error handling
 * Use this instead of directly importing ReactQueryDevtools
 */
export const SafeReactQueryDevtools = (props: ReactQueryDevtoolsWrapperProps) => {
	return <ReactQueryDevtoolsWrapper {...props} />;
};

