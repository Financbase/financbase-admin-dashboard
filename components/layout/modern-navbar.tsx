"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Menu as MenuComponent, MenuItem, ProductItem, HoveredLink } from "@/components/ui/navbar-menu";
import { FinancbaseLogo } from "@/components/core/ui/layout/financbase-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { useLocalStorage, useWindowSize, useTimeout } from "@/hooks";

export function ModernNavbar() {
  const [active, setActive] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { width } = useWindowSize();
  const [userPreferences, setUserPreferences] = useLocalStorage('navbar-preferences', {
    lastActiveItem: null,
    mobileMenuCollapsed: false
  });

  // Auto-close mobile menu on desktop
  useTimeout(() => {
    if (width >= 768 && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, width >= 768 && isMobileMenuOpen ? 100 : null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-transparent bg-background/95 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <FinancbaseLogo size="md" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <MenuComponent setActive={setActive}>
              <MenuItem setActive={setActive} active={active} item="Products">
                <div className="grid grid-cols-2 gap-4">
                  <ProductItem
                    title="Adboard"
                    description="Campaign management and advertising analytics"
                    href="/adboard"
                    src="/images/products/adboard.svg"
                  />
                  <ProductItem
                    title="Financial Intelligence"
                    description="AI-powered financial insights and predictions"
                    href="/financial-intelligence"
                    src="/images/products/financial-intelligence.svg"
                  />
                  <ProductItem
                    title="Analytics"
                    description="Advanced business analytics and reporting"
                    href="/products/analytics"
                    src="/images/products/analytics.svg"
                  />
                  <ProductItem
                    title="Integrations"
                    description="Connect your apps and services"
                    href="/integrations"
                    src="/images/products/integrations.svg"
                  />
                  <ProductItem
                    title="API"
                    description="Build custom integrations with our API"
                    href="/docs/api"
                    src="/images/products/api.svg"
                  />
                </div>
              </MenuItem>
              
              <MenuItem setActive={setActive} active={active} item="Company">
                <div className="flex flex-col space-y-2">
                  <HoveredLink href="/about">About Us</HoveredLink>
                  <HoveredLink href="/blog">Blog</HoveredLink>
                  <HoveredLink href="/careers">Careers</HoveredLink>
                  <HoveredLink href="/contact">Contact</HoveredLink>
                </div>
              </MenuItem>
              
              <MenuItem setActive={setActive} active={active} item="Resources">
                <div className="flex flex-col space-y-2">
                  <HoveredLink href="/docs">Documentation</HoveredLink>
                  <HoveredLink href="/guides">Guides</HoveredLink>
                  <HoveredLink href="/support">Support</HoveredLink>
                  <HoveredLink href="/pricing">Pricing</HoveredLink>
                </div>
              </MenuItem>
              
              <MenuItem setActive={setActive} active={active} item="Legal">
                <div className="flex flex-col space-y-2">
                  <HoveredLink href="/terms">Terms of Service</HoveredLink>
                  <HoveredLink href="/privacy">Privacy Policy</HoveredLink>
                  <HoveredLink href="/legal">Legal</HoveredLink>
                  <HoveredLink href="/security">Security</HoveredLink>
                </div>
              </MenuItem>
            </MenuComponent>
          </div>

          {/* Right side - Auth buttons and mobile menu */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Link href="/auth/sign-in">Sign In</Link>
              </Button>
              <Button size="sm">
                <Link href="/auth/sign-up">Get Started</Link>
              </Button>
            </div>
            
            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pb-6 border-t pt-4"
          >
            <nav className="flex flex-col space-y-4">
              {/* Products */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Products</h3>
                <div className="space-y-2 ml-4">
                  <Link href="/adboard" className="block text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white" onClick={closeMobileMenu}>
                    Adboard
                  </Link>
                  <Link href="/financial-intelligence" className="block text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white" onClick={closeMobileMenu}>
                    Financial Intelligence
                  </Link>
                  <Link href="/products/analytics" className="block text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white" onClick={closeMobileMenu}>
                    Analytics
                  </Link>
                  <Link href="/integrations" className="block text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white" onClick={closeMobileMenu}>
                    Integrations
                  </Link>
                  <Link href="/docs/api" className="block text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white" onClick={closeMobileMenu}>
                    API
                  </Link>
                </div>
              </div>

              {/* Company */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Company</h3>
                <div className="space-y-2 ml-4">
                  <Link href="/about" className="block text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white" onClick={closeMobileMenu}>
                    About Us
                  </Link>
                  <Link href="/blog" className="block text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white" onClick={closeMobileMenu}>
                    Blog
                  </Link>
                  <Link href="/careers" className="block text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white" onClick={closeMobileMenu}>
                    Careers
                  </Link>
                  <Link href="/contact" className="block text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white" onClick={closeMobileMenu}>
                    Contact
                  </Link>
                </div>
              </div>

              {/* Resources */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Resources</h3>
                <div className="space-y-2 ml-4">
                  <Link href="/docs" className="block text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white" onClick={closeMobileMenu}>
                    Documentation
                  </Link>
                  <Link href="/guides" className="block text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white" onClick={closeMobileMenu}>
                    Guides
                  </Link>
                  <Link href="/support" className="block text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white" onClick={closeMobileMenu}>
                    Support
                  </Link>
                  <Link href="/pricing" className="block text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white" onClick={closeMobileMenu}>
                    Pricing
                  </Link>
                </div>
              </div>

              {/* Legal */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Legal</h3>
                <div className="space-y-2 ml-4">
                  <Link href="/terms" className="block text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white" onClick={closeMobileMenu}>
                    Terms of Service
                  </Link>
                  <Link href="/privacy" className="block text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white" onClick={closeMobileMenu}>
                    Privacy Policy
                  </Link>
                  <Link href="/legal" className="block text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white" onClick={closeMobileMenu}>
                    Legal
                  </Link>
                  <Link href="/security" className="block text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white" onClick={closeMobileMenu}>
                    Security
                  </Link>
                </div>
              </div>

              {/* Mobile Auth Buttons */}
              <div className="flex flex-col space-y-2 pt-4 border-t">
                <Button variant="outline" className="w-full">
                  <Link href="/auth/sign-in" onClick={closeMobileMenu}>Sign In</Link>
                </Button>
                <Button className="w-full">
                  <Link href="/auth/sign-up" onClick={closeMobileMenu}>Get Started</Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
}


