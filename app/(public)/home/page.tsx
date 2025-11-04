/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import PremiumHero from '@/components/home/premium-hero'
import PremiumSocialProof from '@/components/home/premium-social-proof'
import PremiumUSPs from '@/components/home/premium-usps'
import PremiumFeaturesShowcase from '@/components/home/premium-features-showcase'
import CombinedFeaturedSection from '@/components/home/combined-featured-section'
import PersonaShowcase from '@/components/home/persona-showcase'
import PricingPreview from '@/components/home/pricing-preview'
import FAQ from '@/components/home/faq'
import { PublicCTA } from '@/components/layout/public-form'

export default function Home() {
	return (
		<>
			<PremiumHero />
			<PremiumSocialProof />
			<PremiumUSPs />
			<PremiumFeaturesShowcase />
			<CombinedFeaturedSection />
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
					href: "/about",
				}}
			/>
		</>
	)
}
