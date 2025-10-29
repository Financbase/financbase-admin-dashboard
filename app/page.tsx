import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export default async function RootPage() {
	// Await headers before redirect (required in Next.js 15)
	await headers()
	// Redirect to the public homepage
	redirect('/home')
}
