/**
 * Settings Index Page
 * Redirects to profile settings by default
 */

import { redirect } from 'next/navigation';
// import { headers } from 'next/headers'; // Temporarily disabled

export default async function SettingsPage() {
	// Get headers (required in Next.js 15 for dynamic APIs)
	// const headersList = await headers();
	redirect('/settings/profile');
}

