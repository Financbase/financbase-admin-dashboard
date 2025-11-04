/**
 * Settings Index Page
 * Redirects to profile settings by default
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { redirect } from 'next/navigation';
// import { headers } from 'next/headers'; // Temporarily disabled

export default async function SettingsPage() {
	// Get headers (required in Next.js 15 for dynamic APIs)
	// const headersList = await headers();
	redirect('/settings/profile');
}

