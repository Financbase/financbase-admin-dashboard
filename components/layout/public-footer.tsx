/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { FinancbaseLogo } from "@/components/ui/financbase-logo";
import { FloatingPaths } from "@/components/auth/floating-paths";
import { useBrandingContext } from "@/contexts/branding-context";
import {
	Github,
	Linkedin,
	Mail,
	Twitter,
} from "lucide-react";
import Link from "next/link";

const navigation = {
	product: [
		{ name: "Adboard", href: "/adboard" },
		{ name: "Financial Intelligence", href: "/products/financial-intelligence" },
		{ name: "Analytics", href: "/products/analytics" },
		{ name: "Integrations", href: "/integrations" },
		{ name: "API", href: "/docs/api" },
		{ name: "Pricing", href: "/pricing" },
		{ name: "Security", href: "/security" },
	],
	resources: [
		{ name: "Documentation", href: "/docs" },
		{ name: "Support", href: "/support" },
		{ name: "Blog", href: "/blog" },
		{ name: "Careers", href: "/careers" },
	],
	company: [
		{ name: "Home", href: "/" },
		{ name: "About", href: "/about" },
		{ name: "Contact", href: "/contact" },
	],
	legal: [
		{ name: "Privacy Policy", href: "/privacy" },
		{ name: "Terms of Service", href: "/terms" },
	],
	social: [
		{
			name: "Twitter",
			href: "https://twitter.com/financbase",
			icon: Twitter,
		},
		{
			name: "GitHub",
			href: "https://github.com/financbase",
			icon: Github,
		},
		{
			name: "LinkedIn",
			href: "https://linkedin.com/company/financbase",
			icon: Linkedin,
		},
		{
			name: "Email",
			href: "mailto:hello@financbase.com",
			icon: Mail,
		},
	],
};

export function PublicFooter() {
	const { getCompanyName } = useBrandingContext();
	const companyName = getCompanyName();

	return (
		<footer className="relative bg-muted/50 border-t overflow-hidden">
			{/* Floating paths background */}
			<div className="absolute inset-0 z-0 opacity-30">
				<FloatingPaths position={1} />
				<FloatingPaths position={-1} />
			</div>
			{/* Gradient overlay */}
			<div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-background/80 to-transparent" />
			
			{/* Footer content */}
			<div className="relative z-20 container mx-auto px-4 py-12">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
					{/* Brand */}
					<div className="lg:col-span-1">
						<div className="mb-4">
							<Link href="/" className="inline-block">
								<FinancbaseLogo size="md" variant="default" />
							</Link>
						</div>
						<p className="text-sm text-muted-foreground mb-4">
							The comprehensive financial management platform for modern
							businesses.
						</p>
						<div className="flex space-x-4">
							{navigation.social.map((item) => (
								<Link
									key={item.name}
									href={item.href}
									className="text-muted-foreground hover:text-primary transition-colors"
									target="_blank"
									rel="noopener noreferrer"
								>
									<span className="sr-only">{item.name}</span>
									<item.icon className="h-5 w-5" />
								</Link>
							))}
						</div>
					</div>

					{/* Product */}
					<div>
						<h3 className="text-sm font-semibold mb-4">Product</h3>
						<ul className="space-y-3">
							{navigation.product.map((item) => (
								<li key={item.name}>
									<Link
										href={item.href}
										className="text-sm text-muted-foreground hover:text-primary transition-colors"
									>
										{item.name}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Resources */}
					<div>
						<h3 className="text-sm font-semibold mb-4">Resources</h3>
						<ul className="space-y-3">
							{navigation.resources.map((item) => (
								<li key={item.name}>
									<Link
										href={item.href}
										className="text-sm text-muted-foreground hover:text-primary transition-colors"
									>
										{item.name}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Company */}
					<div>
						<h3 className="text-sm font-semibold mb-4">Company</h3>
						<ul className="space-y-3">
							{navigation.company.map((item) => (
								<li key={item.name}>
									<Link
										href={item.href}
										className="text-sm text-muted-foreground hover:text-primary transition-colors"
									>
										{item.name}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Legal */}
					<div>
						<h3 className="text-sm font-semibold mb-4">Legal</h3>
						<ul className="space-y-3">
							{navigation.legal.map((item) => (
								<li key={item.name}>
									<Link
										href={item.href}
										className="text-sm text-muted-foreground hover:text-primary transition-colors"
									>
										{item.name}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Bottom */}
				<div className="mt-8 pt-8 border-t">
					<div className="flex flex-col md:flex-row justify-between items-center">
						<p className="text-sm text-muted-foreground">
							© 2025 {companyName}. All rights reserved.
						</p>
						<div className="flex space-x-6 mt-4 md:mt-0">
							<Link
								href="/privacy"
								className="text-sm text-muted-foreground hover:text-primary transition-colors"
							>
								Privacy Policy
							</Link>
							<Link
								href="/terms"
								className="text-sm text-muted-foreground hover:text-primary transition-colors"
							>
								Terms of Service
							</Link>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
