/**
 * Chunk Load Error Handler
 * 
 * Handles ChunkLoadError from webpack when code-split chunks fail to load.
 * Implements automatic retry with exponential backoff and page reload fallback.
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

	return (
		errorName.includes('chunkload') ||
		errorMessage.includes('chunkload') ||
		errorMessage.includes('loading chunk') ||
		errorMessage.includes('failed to fetch dynamically imported module') ||
		errorMessage.includes('loading css chunk') ||
		// Check for network errors that might be chunk-related
		(errorMessage.includes('failed to fetch') && 
			(errorMessage.includes('_next/static') || errorMessage.includes('chunk')))
	);
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

