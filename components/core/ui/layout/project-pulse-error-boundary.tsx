/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { MessageCircle, XCircle } from "lucide-react";
("use client");

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
}

export class ProjectPulseErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("Project Pulse Tracker Error:", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				this.props.fallback || (
					<div className="w-full max-w-4xl mx-auto bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/30 dark:border-zinc-800/30 rounded-3xl p-6 shadow-md dark:shadow-zinc-900">
						<div className="text-center text-red-600 dark:text-red-400">
							<h3 className="text-lg font-semibold mb-2">
								Something went wrong
							</h3>
							<p className="text-sm text-zinc-500 dark:text-zinc-400">
								The project pulse tracker encountered an error. Please try
								refreshing the page.
							</p>
							{process.env.NODE_ENV === "development" && this.state.error && (
								<details className="mt-4 text-left">
									<summary className="cursor-pointer text-sm font-medium">
										Error Details (Development)
									</summary>
									<pre className="mt-2 text-xs bg-zinc-100 dark:bg-zinc-800 p-2 rounded overflow-auto">
										{this.state.error.message}
									</pre>
								</details>
							)}
						</div>
					</div>
				)
			);
		}

		return this.props.children;
	}
}
