/**
 * Root page - redirects are handled by middleware
 * This component should not render as middleware redirects before it loads.
 * Returning empty fragment as fallback.
 */
export default function RootPage() {
	// Middleware handles redirect - this should never render
	// Return empty fragment instead of null for valid React component
	return <></>
}
