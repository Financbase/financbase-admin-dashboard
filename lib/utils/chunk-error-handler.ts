/**
 * Chunk Load Error Handler
 * 
 * Handles ChunkLoadError from webpack when code-split chunks fail to load.
 * Implements automatic retry with exponential backoff and page reload fallback.
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


export interface ChunkErrorHandlerOptions {
	/** Maximum number of retry attempts (default: 3) */
	maxRetries?: number;
	/** Initial retry delay in milliseconds (default: 1000) */
	initialDelay?: number;
	/** Maximum delay between retries in milliseconds (default: 10000) */
	maxDelay?: number;
	/** Whether to automatically reload the page on failure (default: true) */
	autoReload?: boolean;
	/** Callback before reload (useful for notifications) */
	onBeforeReload?: () => void;
	/** Custom error logging function */
	logError?: (error: Error, context: string) => void;
}

const DEFAULT_OPTIONS: Required<ChunkErrorHandlerOptions> = {
	maxRetries: 3,
	initialDelay: 1000,
	maxDelay: 10000,
	autoReload: true,
	onBeforeReload: () => {},
	logError: (error, context) => {
		console.error(`[ChunkErrorHandler] ${context}:`, error);
	},
};

/**
 * Check if an error is a ChunkLoadError
 */
export function isChunkLoadError(error: Error | unknown): boolean {
	if (!(error instanceof Error)) {
		return false;
	}

	const errorMessage = error.message.toLowerCase();
	const errorName = error.name.toLowerCase();
	const errorStack = error.stack?.toLowerCase() || '';

	// Check error name first - exact match for ChunkLoadError
	if (errorName === 'chunkloaderror' || errorName.includes('chunkload') || errorName.includes('chunk load')) {
		return true;
	}

	// Check for webpack internal chunk loading errors
	// These occur in __webpack_require__.f.j and related webpack functions
	const webpackInternalPatterns = [
		/__webpack_require__/i,
		/webpack_require__\.f\.j/i,
		/webpack_require__\.e/i,
		/webpack\.js/i,
		/webpack-internal/i,
		/react-server-dom-webpack/i,
	];

	for (const pattern of webpackInternalPatterns) {
		if (pattern.test(errorStack) || pattern.test(errorMessage)) {
			// If it's a webpack internal error, check if it's chunk-related
			if (
				errorStack.includes('chunk') ||
				errorStack.includes('_next/static') ||
				errorMessage.includes('chunk') ||
				errorMessage.includes('loading') ||
				errorMessage.includes('failed')
			) {
				return true;
			}
		}
	}

	// Check for common chunk loading error patterns
	const chunkErrorPatterns = [
		'chunkload',
		'loading chunk',
		'loading css chunk',
		'failed to fetch dynamically imported module',
		'chunk load error',
		'chunkloaderror',
		// Pattern: "Loading chunk [name] failed"
		/loading chunk .* failed/i,
		// Pattern: "ChunkLoadError: Loading chunk [name] failed"
		/chunkloaderror.*loading chunk/i,
		// Pattern: "Failed to load chunk [name]"
		/failed to load chunk/i,
		// Pattern: "ChunkLoadError" as standalone
		/^chunkloaderror$/i,
	];

	// Check if message matches any pattern
	for (const pattern of chunkErrorPatterns) {
		if (typeof pattern === 'string') {
			if (errorMessage.includes(pattern) || errorStack.includes(pattern)) {
				return true;
			}
		} else if (pattern instanceof RegExp) {
			if (pattern.test(errorMessage) || pattern.test(errorStack)) {
				return true;
			}
		}
	}

	// Check for network errors that might be chunk-related
	if (errorMessage.includes('failed to fetch') || errorMessage.includes('networkerror')) {
		const isChunkRelated = 
			errorMessage.includes('_next/static') ||
			errorMessage.includes('chunk') ||
			errorMessage.includes('_app-pages-browser') ||
			errorMessage.includes('node_modules') ||
			errorMessage.includes('webpack') ||
			errorStack.includes('_next/static') ||
			errorStack.includes('chunk') ||
			errorStack.includes('webpack');
		
		if (isChunkRelated) {
			return true;
		}
	}

	// Check for specific DevTools chunk errors
	if (errorMessage.includes('react-query-devtools') || errorMessage.includes('tanstack')) {
		if (errorMessage.includes('failed') || errorMessage.includes('error') || errorMessage.includes('chunk')) {
			return true;
		}
	}

	// Check for errors in webpack chunk loading mechanism
	// This catches errors from webpack's internal chunk loading functions
	if (errorStack.includes('loadchunk') || errorStack.includes('preloadmodule') || errorStack.includes('resolvemodule')) {
		return true;
	}

	return false;
}

/**
 * Calculate exponential backoff delay
 */
function calculateDelay(attempt: number, initialDelay: number, maxDelay: number): number {
	const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
	// Add jitter to prevent thundering herd
	const jitter = Math.random() * 0.3 * delay;
	return Math.floor(delay + jitter);
}

/**
 * Wait for a specified duration
 */
function wait(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Handle chunk load error with automatic retry
 */
export async function handleChunkLoadError(
	error: Error,
	options: ChunkErrorHandlerOptions = {}
): Promise<void> {
	const config = { ...DEFAULT_OPTIONS, ...options };
	
	if (!isChunkLoadError(error)) {
		config.logError(error, 'Not a chunk load error, re-throwing');
		throw error;
	}

	config.logError(error, 'Chunk load error detected');

	let lastError = error;

	for (let attempt = 0; attempt < config.maxRetries; attempt++) {
		const delay = calculateDelay(attempt, config.initialDelay, config.maxDelay);
		
		config.logError(
			new Error(`Retry attempt ${attempt + 1}/${config.maxRetries} after ${delay}ms`),
			'Retrying chunk load'
		);

		await wait(delay);

			try {
				// Try to reload the page
				if (config.autoReload && attempt === config.maxRetries - 1 && typeof window !== 'undefined') {
					// Last attempt - reload the page
					config.logError(
						new Error('All retries exhausted, reloading page'),
						'Final retry'
					);
					
					if (config.onBeforeReload) {
						config.onBeforeReload();
					}

					// Clear any cached chunks by appending timestamp
					const url = new URL(window.location.href);
					url.searchParams.set('_chunk_reload', Date.now().toString());
					
					window.location.href = url.toString();
					return;
				}

			// For intermediate retries, wait and let the app retry naturally
			// The error will be re-thrown to trigger React's error boundary
			throw lastError;
		} catch (retryError) {
			lastError = retryError instanceof Error ? retryError : new Error(String(retryError));
			
			if (attempt < config.maxRetries - 1) {
				config.logError(lastError, `Retry ${attempt + 1} failed, will retry`);
			} else {
				config.logError(lastError, 'All retries exhausted');
			}
		}
	}

	// If we get here, all retries failed and auto-reload didn't happen
	// This shouldn't normally occur, but handle it gracefully
	if (config.autoReload && typeof window !== 'undefined') {
		config.logError(new Error('Unexpected state: retries exhausted but auto-reload not triggered'), 'Error');
		window.location.reload();
	} else {
		throw lastError;
	}
}

/**
 * Set up global chunk error handler
 * Call this once in your app initialization (e.g., in providers or root layout)
 * This function only works in the browser environment
 */
export function setupChunkErrorHandler(options: ChunkErrorHandlerOptions = {}): () => void {
	// Only set up in browser environment
	if (typeof window === 'undefined') {
		// Return a no-op cleanup function for server-side
		return () => {};
	}

	const config = { ...DEFAULT_OPTIONS, ...options };

	// Handle unhandled promise rejections (common for chunk errors)
	const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
		const error = event.reason instanceof Error 
			? event.reason 
			: new Error(String(event.reason));

		if (isChunkLoadError(error)) {
			event.preventDefault(); // Prevent default error logging
			handleChunkLoadError(error, config).catch((finalError) => {
				config.logError(finalError, 'Chunk error handler failed');
			});
		}
	};

	// Handle regular errors
	const handleError = (event: ErrorEvent) => {
		const error = event.error || new Error(event.message);

		if (isChunkLoadError(error)) {
			event.preventDefault(); // Prevent default error logging
			handleChunkLoadError(error, config).catch((finalError) => {
				config.logError(finalError, 'Chunk error handler failed');
			});
		}
	};

	// Add event listeners
	window.addEventListener('unhandledrejection', handleUnhandledRejection);
	window.addEventListener('error', handleError);

	// Return cleanup function
	return () => {
		window.removeEventListener('unhandledrejection', handleUnhandledRejection);
		window.removeEventListener('error', handleError);
	};
}

/**
 * Reload page with cache busting for chunk files
 * Only works in browser environment
 */
export function reloadPageWithCacheBust(): void {
	if (typeof window === 'undefined') {
		console.warn('[ChunkErrorHandler] reloadPageWithCacheBust called in server environment');
		return;
	}

	const url = new URL(window.location.href);
	// Remove existing cache bust parameter if present
	url.searchParams.delete('_chunk_reload');
	// Add new cache bust parameter
	url.searchParams.set('_chunk_reload', Date.now().toString());
	window.location.href = url.toString();
}

