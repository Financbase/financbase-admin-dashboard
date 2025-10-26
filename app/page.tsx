import Link from 'next/link'
import { FinancbaseLogo } from '@/components/ui/financbase-logo'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Header } from '@/components/header'
import PremiumHero from '@/components/home/premium-hero'
import PremiumSocialProof from '@/components/home/premium-social-proof'
import PremiumUSPs from '@/components/home/premium-usps'
import PremiumInteractiveDemo from '@/components/home/premium-interactive-demo'
import PersonaShowcase from '@/components/home/persona-showcase'
import PricingPreview from '@/components/home/pricing-preview'
import FAQ from '@/components/home/faq'

export default function Home() {
	return (
    <div className="min-h-screen">
      {/* New Header Component */}
      <Header />

      {/* Main Content */}
      <main>
        <PremiumHero />
        <PremiumSocialProof />
        <PremiumUSPs />
        <PremiumInteractiveDemo />
        <PersonaShowcase />
        <PricingPreview />
        <FAQ />

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary to-primary/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Financial Operations?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of businesses already using Financbase to make smarter financial decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="px-8 py-4 text-lg bg-white text-primary hover:bg-gray-100">
                <Link href="/auth/sign-up">
                  Start Free Trial
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-primary">
                <Link href="/about">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FinancbaseLogo size="md" variant="white" />
              </div>
              <p className="text-sm">AI-powered financial intelligence for modern businesses.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/legal" className="hover:text-white transition-colors">Legal</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 Financbase. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
	)
}