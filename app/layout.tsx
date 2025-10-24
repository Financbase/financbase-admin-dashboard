import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { MobileAppShell } from '@/components/mobile/mobile-app-shell'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { locales } from '@/i18n'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: {
		default: 'Financbase Admin Dashboard',
		template: '%s | Financbase'
	},
	description: 'Professional financial management platform with AI automation, real-time collaboration, and enterprise-grade security.',
	keywords: ['financial management', 'accounting', 'invoices', 'expenses', 'reports', 'AI automation', 'business intelligence'],
	authors: [{ name: 'Financbase Team' }],
	creator: 'Financbase',
	metadataBase: new URL('https://financbase.com'),
	alternates: {
		canonical: '/',
		languages: {
			'en-US': '/',
			...Object.fromEntries(locales.map(locale => [locale, `/${locale}`]))
		}
	},
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: 'https://financbase.com',
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
	appleWebApp: {
		capable: true,
		statusBarStyle: 'default',
		title: 'Financbase',
	},
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	viewport: {
		width: 'device-width',
		initialScale: 1,
		maximumScale: 5,
		userScalable: true,
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

export default async function RootLayout({
	children,
	params: { locale }
}: {
	children: React.ReactNode
	params: { locale: string }
}) {
	// Ensure that the incoming `locale` parameter is valid
	if (!locales.includes(locale as typeof locales[number])) {
		locale = 'en';
	}

	// Providing all messages to the client side
	const messages = await getMessages();

	return (
		<html lang={locale} suppressHydrationWarning>
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
				<meta name="theme-color" content="#667eea" />
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<meta name="apple-mobile-web-app-title" content="Financbase" />
				<meta name="msapplication-TileColor" content="#667eea" />
				<meta name="msapplication-config" content="/browserconfig.xml" />
			</head>
			<body className={inter.className}>
				<NextIntlClientProvider messages={messages}>
					<MobileAppShell>
						<Providers>
							{children}
							<Toaster />
						</Providers>
					</MobileAppShell>
				</NextIntlClientProvider>
			</body>
		</html>
	)
}
