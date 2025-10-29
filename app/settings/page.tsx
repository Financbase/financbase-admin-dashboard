/**
 * Settings Index Page
 * Redirects to profile settings by default
 */

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function SettingsPage() {
	// Await headers before redirect (required in Next.js 15)
	await headers();
	redirect('/settings/profile');
}

