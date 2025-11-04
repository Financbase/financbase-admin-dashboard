/**
 * Root page - redirects are handled by middleware
 * This component should not render as middleware redirects before it loads.
 * Returning empty fragment as fallback.
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

export default function RootPage() {
	// Middleware handles redirect - this should never render
	// Return empty fragment instead of null for valid React component
	return <></>
}
