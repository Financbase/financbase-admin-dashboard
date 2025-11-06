/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { Metadata } from 'next';
import PremiumHero from '@/components/home/premium-hero'
import PremiumSocialProof from '@/components/home/premium-social-proof'
import PremiumUSPs from '@/components/home/premium-usps'
import PremiumFeaturesShowcase from '@/components/home/premium-features-showcase'
import PersonaShowcase from '@/components/home/persona-showcase'
import PricingPreview from '@/components/home/pricing-preview'
import FAQ from '@/components/home/faq'
import { PublicCTA } from '@/components/layout/public-form'

export const metadata: Metadata = {
	title: 'Financbase - AI-Powered Financial Management Platform',
	description:
		'Transform your financial operations with AI-powered insights, real-time analytics, and enterprise-grade security. Join businesses already using Financbase to make smarter financial decisions.',
	openGraph: {
		title: 'Financbase - AI-Powered Financial Management Platform',
		description:
			'Transform your financial operations with AI-powered insights, real-time analytics, and enterprise-grade security.',
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Financbase - AI-Powered Financial Management Platform',
		description:
			'Transform your financial operations with AI-powered insights, real-time analytics, and enterprise-grade security.',
	},
};

export default function Home() {
	return (
		<>
			<PremiumHero />
			<PremiumSocialProof />
			<PremiumUSPs />
			<PremiumFeaturesShowcase />
			<PersonaShowcase />
			<PricingPreview />
			<FAQ />
			<PublicCTA
				title="Ready to Transform Your Financial Operations?"
				description="Join businesses already using Financbase to make smarter financial decisions."
				primaryAction={{
					text: "Start Free Trial",
					href: "/auth/sign-up",
				}}
				secondaryAction={{
					text: "Learn More",
					href: "/docs",
				}}
			/>
		</>
	)
}
