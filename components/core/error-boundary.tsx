/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, XCircle } from "lucide-react";
import React, { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
	onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

export default class DashboardErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// Call the onError callback if provided
		if (this.props.onError) {
			this.props.onError(error, errorInfo);
		}
	}

	handleRetry = () => {
		this.setState({ hasError: false, error: null });
	};

	render() {
		if (this.state.hasError) {
			// Custom fallback UI
			if (this.props.fallback) {
				return this.props.fallback;
			}

			// Default error UI
			return (
				<div
					className="flex flex-col items-center justify-center py-12 px-4 text-center"
					role="alert"
					aria-live="assertive"
				>
					<div className="mb-4 p-3 rounded-full bg-red-100 dark:bg-red-900/30">
						<AlertTriangle
							className="h-8 w-8 text-red-500 dark:text-red-400"
							aria-hidden="true"
						/>
					</div>

					<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
						Something went wrong
					</h3>

					<p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm">
						This widget encountered an error and couldn't load properly.
					</p>

					<div className="flex gap-2">
						<Button onClick={this.handleRetry} size="sm" variant="outline">
							<RefreshCw className="mr-2 h-4 w-4" />
							Try again
						</Button>

						<Button onClick={() => window.location.reload()} size="sm">
							Reload page
						</Button>
					</div>

					{process.env.NODE_ENV === "development" && this.state.error && (
						<details className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-left max-w-md">
							<summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
								Error details (development only)
							</summary>
							<pre className="mt-2 text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap">
								{this.state.error.stack}
							</pre>
						</details>
					)}
				</div>
			);
		}

		return this.props.children;
	}
}

// Hook version for functional components
export function useErrorHandler() {
	const [error, setError] = React.useState<Error | null>(null);

	const resetError = React.useCallback(() => {
		setError(null);
	}, []);

	const handleError = React.useCallback((error: Error) => {
		setError(error);
	}, []);

	React.useEffect(() => {
		if (error) {
			throw error;
		}
	}, [error]);

	return { handleError, resetError };
}

// Higher-order component for wrapping individual widgets
export function withErrorBoundary<P extends object>(
	Component: React.ComponentType<P>,
	errorFallback?: ReactNode,
) {
	return function WrappedComponent(props: P) {
		return (
			<DashboardErrorBoundary fallback={errorFallback}>
				<Component {...props} />
			</DashboardErrorBoundary>
		);
	};
}
