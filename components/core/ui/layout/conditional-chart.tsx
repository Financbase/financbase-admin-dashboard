import type * as React from "react";

// Check if heavy dependencies should be loaded
const shouldLoadHeavyDependencies =
	typeof window !== "undefined" &&
	(process.env.NODE_ENV === "production" ||
		process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true");

/**
 * ConditionalChartWrapper - Only renders chart components when heavy dependencies are enabled
 * This prevents recharts from being bundled in minimal layouts
 */
export function ConditionalChartWrapper({
	children,
	fallback = null,
}: {
	children: React.ReactNode;
	fallback?: React.ReactNode;
}) {
	if (!shouldLoadHeavyDependencies) {
		return <>{fallback}</>;
	}

	return <>{children}</>;
}

/**
 * ChartPlaceholder - Simple placeholder for when charts aren't available
 */
export function ChartPlaceholder({
	message = "Charts require analytics to be enabled",
}: { message?: string }) {
	return (
		<div className="flex h-[200px] w-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50">
			<div className="text-center">
				<div className="mb-2 text-gray-400">
					<svg
						className="mx-auto h-12 w-12"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1}
							d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
						/>
					</svg>
				</div>
				<p className="text-sm text-gray-500">{message}</p>
			</div>
		</div>
	);
}
