/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

/**
 * Webpack Chunk Loading Error Handler
 * 
 * Intercepts webpack chunk loading errors at the runtime level by hooking into
 * webpack's chunk loading mechanism. This provides early detection and recovery
 * for chunk loading failures before they propagate to React error boundaries.
 */

import { isChunkLoadError, handleChunkLoadError, type ChunkErrorHandlerOptions } from './chunk-error-handler';

interface WebpackChunkHandlerOptions extends ChunkErrorHandlerOptions {
	/** Maximum number of retries for a specific chunk (default: 3) */
	maxChunkRetries?: number;
	/** Whether to log chunk loading attempts (default: false in production) */
	verbose?: boolean;
}

const DEFAULT_OPTIONS: Required<Omit<WebpackChunkHandlerOptions, 'logError' | 'onBeforeReload'>> = {
	maxRetries: 3,
	initialDelay: 1000,
	maxDelay: 10000,
	autoReload: true,
	maxChunkRetries: 3,
	verbose: process.env.NODE_ENV === 'development',
};

/**
 * Track chunk loading attempts to prevent infinite retry loops
 */
const chunkRetryMap = new Map<string, number>();

/**
 * Get or create retry count for a chunk
 */
function getChunkRetryCount(chunkId: string): number {
	return chunkRetryMap.get(chunkId) || 0;
}

/**
 * Increment retry count for a chunk
 */
function incrementChunkRetry(chunkId: string): number {
	const current = getChunkRetryCount(chunkId);
	const next = current + 1;
	chunkRetryMap.set(chunkId, next);
	return next;
}

/**
 * Reset retry count for a chunk (after successful load)
 */
function resetChunkRetry(chunkId: string): void {
	chunkRetryMap.delete(chunkId);
}

/**
 * Extract chunk ID from error message or stack
 */
function extractChunkId(error: Error): string | null {
	const stack = error.stack || '';
	const message = error.message || '';
	
	// Try to extract chunk ID from various patterns
	const patterns = [
		/chunk[_-]?(\d+)/i,
		/chunk[_-]?([a-f0-9]+)/i,
		/_next\/static\/chunks\/([^\/]+)/i,
		/webpack[_-]?chunk[_-]?([^\.\s]+)/i,
	];
	
	for (const pattern of patterns) {
		const match = (stack + ' ' + message).match(pattern);
		if (match && match[1]) {
			return match[1];
		}
	}
	
	return null;
}

/**
 * Setup webpack chunk loading error handler
 * This intercepts errors from webpack's chunk loading mechanism
 */
export function setupWebpackChunkHandler(options: WebpackChunkHandlerOptions = {}): () => void {
	// Only set up in browser environment
	if (typeof window === 'undefined') {
		return () => {};
	}

	const config = { ...DEFAULT_OPTIONS, ...options };
	const log = (message: string, ...args: unknown[]) => {
		if (config.verbose) {
			console.log(`[WebpackChunkHandler] ${message}`, ...args);
		}
	};

	// Intercept webpack chunk loading errors
	const originalWebpackRequire = (window as any).__webpack_require__;
	let originalChunkLoading: ((chunkId: string) => Promise<unknown>) | null = null;
	
	if (originalWebpackRequire && originalWebpackRequire.f) {
		originalChunkLoading = originalWebpackRequire.f.j;
		
		if (originalChunkLoading) {
			// Wrap webpack's chunk loading function
			originalWebpackRequire.f.j = function wrappedChunkLoader(chunkId: string) {
				const retryCount = getChunkRetryCount(chunkId);
				
				if (retryCount >= config.maxChunkRetries) {
					log(`Chunk ${chunkId} exceeded max retries (${retryCount}), will trigger page reload`);
					// Create a ChunkLoadError to trigger the error handler
					const error = new Error(`ChunkLoadError: Loading chunk ${chunkId} failed after ${retryCount} retries`);
					error.name = 'ChunkLoadError';
					
					handleChunkLoadError(error, config).catch((finalError) => {
						console.error('[WebpackChunkHandler] Failed to handle chunk error:', finalError);
					});
					
					return Promise.reject(error);
				}
				
				log(`Loading chunk ${chunkId} (attempt ${retryCount + 1}/${config.maxChunkRetries})`);
				
				// Call original chunk loader
				return originalChunkLoading.call(this, chunkId)
					.then((result: unknown) => {
						// Success - reset retry count
						resetChunkRetry(chunkId);
						log(`Chunk ${chunkId} loaded successfully`);
						return result;
					})
					.catch((error: Error) => {
						// Increment retry count
						incrementChunkRetry(chunkId);
						
						// Check if it's a chunk load error
						if (isChunkLoadError(error)) {
							log(`Chunk ${chunkId} load failed (attempt ${retryCount + 1}):`, error);
							
							// If we haven't exceeded max retries, try again after a delay
							if (retryCount + 1 < config.maxChunkRetries) {
								const delay = Math.min(
									config.initialDelay * Math.pow(2, retryCount),
									config.maxDelay
								);
								
								log(`Retrying chunk ${chunkId} after ${delay}ms`);
								
								return new Promise((resolve, reject) => {
									setTimeout(() => {
										// Retry the chunk load
										if (originalChunkLoading) {
											originalChunkLoading.call(this, chunkId)
												.then(resolve)
												.catch(reject);
										} else {
											reject(new Error('Original chunk loader not available'));
										}
									}, delay);
								});
							} else {
								// Max retries exceeded - trigger error handler
								log(`Chunk ${chunkId} failed after ${retryCount + 1} attempts, triggering error handler`);
								handleChunkLoadError(error, config).catch((finalError) => {
									console.error('[WebpackChunkHandler] Failed to handle chunk error:', finalError);
								});
							}
						}
						
						throw error;
					});
			};
		}
	}

	// Also intercept webpack's error handling for chunk loading
	const handleWebpackError = (event: ErrorEvent) => {
		const error = event.error || new Error(event.message);
		
		if (isChunkLoadError(error)) {
			const chunkId = extractChunkId(error) || 'unknown';
			const retryCount = getChunkRetryCount(chunkId);
			
			log(`Webpack chunk error detected for chunk ${chunkId} (retry count: ${retryCount})`);
			
			if (retryCount < config.maxChunkRetries) {
				event.preventDefault();
				incrementChunkRetry(chunkId);
				
				// Let the wrapped chunk loader handle the retry
				return;
			}
			
			// Max retries exceeded - let the error handler deal with it
			event.preventDefault();
			handleChunkLoadError(error, config).catch((finalError) => {
				console.error('[WebpackChunkHandler] Failed to handle chunk error:', finalError);
			});
		}
	};

	// Add event listener for webpack errors
	window.addEventListener('error', handleWebpackError);

	// Return cleanup function
	return () => {
		// Restore original webpack chunk loader if it was wrapped
		if (originalWebpackRequire && originalWebpackRequire.f && originalChunkLoading) {
			originalWebpackRequire.f.j = originalChunkLoading;
		}
		
		// Clear retry map
		chunkRetryMap.clear();
		
		// Remove event listener
		window.removeEventListener('error', handleWebpackError);
	};
}

/**
 * Check if webpack chunk handler is available
 */
export function isWebpackChunkHandlerAvailable(): boolean {
	if (typeof window === 'undefined') {
		return false;
	}
	
	return typeof (window as any).__webpack_require__ !== 'undefined';
}

