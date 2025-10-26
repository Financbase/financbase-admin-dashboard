import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ClientLayout } from './client-layout'
import './globals.css'

const inter = Inter({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-inter'
})

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en" className={inter.variable}>
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
			</head>
			<body className={`${inter.className} font-sans`}>
				<ClientLayout>
					{children}
				</ClientLayout>
			</body>
		</html>
	)
}

export const metadata: Metadata = {
	title: {
		default: 'Financbase Admin Dashboard',
		template: '%s | Financbase'
	},
	description: 'Professional financial management platform with AI automation, real-time collaboration, and enterprise-grade security.',
	keywords: ['financial management', 'accounting', 'invoices', 'expenses', 'reports', 'AI automation', 'business intelligence'],
	authors: [{ name: 'Financbase Team' }],
	creator: 'Financbase',
	metadataBase: new URL('http://localhost:3000'),
	alternates: {
		canonical: '/',
	},
	manifest: '/manifest.json',
	icons: {
		icon: [
			{ url: '/financbase-logo-192x192.png', sizes: '192x192', type: 'image/png' },
			{ url: '/financbase-logo-512x512.png', sizes: '512x512', type: 'image/png' }
		],
		apple: [
			{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
		],
	},
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: 'http://localhost:3000',
		title: 'Financbase Admin Dashboard',
		description: 'Professional financial management platform with AI automation',
		siteName: 'Financbase',
		images: [
			{
				url: '/og-image.png',
				width: 1200,
				height: 630,
				alt: 'Financbase Admin Dashboard',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Financbase Admin Dashboard',
		description: 'Professional financial management platform with AI automation',
		images: ['/twitter-image.png'],
		creator: '@financbase',
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
}

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 5,
	userScalable: true,
	themeColor: '#667eea',
}
