import { redirect } from 'next/navigation';
// import { headers } from 'next/headers'; // Temporarily disabled

export default async function ProfilePage() {
	// Get headers (required in Next.js 15 for dynamic APIs)
	// const headersList = await headers();
	redirect('/settings/profile');
}
