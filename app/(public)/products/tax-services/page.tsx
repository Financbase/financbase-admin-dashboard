/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
	FileText, 
	Shield, 
	CheckCircle, 
	MessageSquare, 
	Lock, 
	Receipt, 
	Calculator, 
	AlertCircle, 
	ExternalLink,
	Sparkles,
	Zap,
	Clock,
	Users,
	HelpCircle,
	FileCheck,
	TrendingUp
} from "lucide-react";
import Link from "next/link";
import PremiumSocialProof from "@/components/home/premium-social-proof";
import PremiumFeaturesShowcase from "@/components/home/premium-features-showcase";
import PricingPreview from "@/components/home/pricing-preview";
import FAQ from "@/components/home/faq";
import { PublicCTA } from "@/components/layout/public-form";
import { EnterpriseCapabilitiesSection } from "@/components/home/enterprise-capabilities-section";
import dynamic from "next/dynamic";

const TaxServicesDisclosure = dynamic(
	() => import("@/components/tax/tax-services-disclosure").then((mod) => ({
		default: mod.TaxServicesDisclosure,
	})),
	{
		ssr: false,
		loading: () => <div className="h-32 animate-pulse bg-gray-100 rounded-lg" />,
	}
);

export const metadata: Metadata = {
	title: "Tax Services | Free Federal Tax Filing | Financbase",
	description: "File your federal taxes free with IRS Direct File. Direct IRS submission, no PII storage, interview-based process.",
	openGraph: {
		title: "Tax Services | Free Federal Tax Filing | Financbase",
		description: "File your federal taxes free with IRS Direct File. Direct IRS submission, no PII storage, interview-based process.",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Tax Services | Free Federal Tax Filing | Financbase",
		description: "File your federal taxes free with IRS Direct File. Direct IRS submission, no PII storage, interview-based process.",
	},
};

const features = [
	{
		id: "free-filing",
		icon: <FileText className="h-8 w-8" />,
		title: "Free Federal Tax Filing",
		description: "File directly with the IRS using official IRS Direct File software. No fees, no hidden costs, completely free.",
		benefits: [
			"Direct IRS submission",
			"No filing fees",
			"Official IRS software",
			"Interview-based process"
		],
		metrics: {
			value: "100%",
			label: "Free",
			change: "No Hidden Fees"
		},
		color: "from-blue-500 to-blue-600"
	},
	{
		id: "guided-interview",
		icon: <MessageSquare className="h-8 w-8" />,
		title: "Guided Interview Process",
		description: "Step-by-step questions guide you through your tax return. Simple, intuitive, and designed for everyone.",
		benefits: [
			"Simple question-and-answer format",
			"Automatic calculations",
			"Real-time validation",
			"Progress tracking"
		],
		metrics: {
			value: "15-30",
			label: "Minutes",
			change: "Avg Filing Time"
		},
		color: "from-emerald-500 to-emerald-600"
	},
	{
		id: "privacy-security",
		icon: <Shield className="h-8 w-8" />,
		title: "Your Data Stays Private",
		description: "No PII or FTI stored on our servers - all processing happens in your browser. Your privacy is our priority.",
		benefits: [
			"No PII/FTI storage",
			"Browser-based processing",
			"Direct IRS submission",
			"Session data cleared on exit"
		],
		metrics: {
			value: "Zero",
			label: "Storage",
			change: "100% Private"
		},
		color: "from-purple-500 to-purple-600"
	}
];

const capabilities = [
	{
		icon: <FileText className="h-6 w-6" />,
		title: "Free Filing",
		description: "No cost for federal tax returns"
	},
	{
		icon: <Shield className="h-6 w-6" />,
		title: "Secure & Private",
		description: "No data storage on our servers"
	},
	{
		icon: <CheckCircle className="h-6 w-6" />,
		title: "Direct IRS Submission",
		description: "Official IRS software integration"
	},
	{
		icon: <MessageSquare className="h-6 w-6" />,
		title: "Interview-Based",
		description: "Guided questions for easy filing"
	}
];

const taxServiceFeatures = [
	{ 
		name: "Federal Returns Only", 
		description: "File your federal tax return with W-2, 1099, and other common forms support", 
		icon: <FileText className="h-6 w-6" /> 
	},
	{ 
		name: "Interview-Based Filing", 
		description: "Step-by-step questions guide you through your tax return preparation", 
		icon: <MessageSquare className="h-6 w-6" /> 
	},
	{ 
		name: "Automatic Calculations", 
		description: "Tax calculations done automatically as you answer questions", 
		icon: <Calculator className="h-6 w-6" /> 
	},
	{ 
		name: "Real-Time Validation", 
		description: "Catch errors and inconsistencies before you submit your return", 
		icon: <FileCheck className="h-6 w-6" /> 
	},
	{ 
		name: "Export Options", 
		description: "Export your return in MeF XML or JSON formats for your records", 
		icon: <Receipt className="h-6 w-6" /> 
	},
	{ 
		name: "Self-Service Tool", 
		description: "No tax advice provided - you file directly with the IRS", 
		icon: <HelpCircle className="h-6 w-6" /> 
	}
];

export default function TaxServicesPage() {
	return (
		<>
			{/* Hero Section */}
			<section className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center">
				<div className="container mx-auto px-4 py-20">
					<div className="text-center max-w-4xl mx-auto">
						<Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20">
							<FileText className="h-4 w-4 mr-2" />
							Tax Services
						</Badge>
						<h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent drop-shadow-sm">
							File Your Federal Taxes
							<br />
							<span className="text-4xl md:text-5xl">Free</span>
						</h1>
						<p className="text-xl text-foreground/90 mb-8 max-w-2xl mx-auto font-medium">
							File directly with the IRS using official IRS Direct File software. No fees, no hidden costs, and your data stays private.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button size="lg" className="text-lg px-8" asChild>
								<Link href="/auth/sign-up">Start Filing</Link>
							</Button>
							<Button variant="outline" size="lg" className="text-lg px-8" asChild>
								<Link href="/docs/tax-filing">Learn More</Link>
							</Button>
						</div>
						<p className="text-sm text-foreground/80 mt-4 font-medium">
							Free forever • No credit card required
						</p>
					</div>
				</div>
			</section>

			<PremiumSocialProof />

			{/* USPs Section */}
			<section className="py-24 bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
				{/* Background Elements */}
				<div className="absolute inset-0">
					<div className="absolute top-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
					<div className="absolute bottom-20 left-20 w-48 h-48 bg-primary/10 rounded-full blur-2xl" />
				</div>

				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
					{/* Header */}
					<div className="text-center mb-20">
						<Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20">
							<Sparkles className="h-4 w-4 mr-2" />
							Why Choose Tax Services
						</Badge>
						<h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
							Built for the future of
							<span className="block text-primary">tax filing</span>
						</h2>
						<p className="text-xl text-slate-600 max-w-3xl mx-auto">
							Three core capabilities that set us apart from traditional tax filing services
						</p>
					</div>

					{/* Main Features Grid */}
					<div className="grid lg:grid-cols-3 gap-8 mb-20">
						{features.map((feature) => (
							<Card 
								key={feature.id}
								className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm hover:scale-105"
							>
								<CardContent className="p-8">
									{/* Icon and Title */}
									<div className="flex items-center mb-6">
										<div className={`p-4 bg-gradient-to-br ${feature.color} rounded-xl text-white mr-4 group-hover:scale-110 transition-transform duration-300`}>
											{feature.icon}
										</div>
										<div>
											<h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
											<div className="flex items-center gap-2 mt-1">
												<div className="text-2xl font-bold text-slate-900">{feature.metrics.value}</div>
												<div className="text-sm text-emerald-600 font-medium">{feature.metrics.change}</div>
											</div>
											<div className="text-xs text-slate-600">{feature.metrics.label}</div>
										</div>
									</div>

									{/* Description */}
									<p className="text-slate-600 mb-6 leading-relaxed">{feature.description}</p>

									{/* Benefits */}
									<div className="space-y-3 mb-6">
										{feature.benefits.map((benefit, benefitIndex) => (
											<div key={`${feature.id}-benefit-${benefitIndex}`} className="flex items-center">
												<CheckCircle className="h-4 w-4 text-emerald-500 mr-3 flex-shrink-0" />
												<span className="text-sm text-slate-700">{benefit}</span>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					{/* Capabilities Section */}
					<EnterpriseCapabilitiesSection
						capabilities={capabilities}
						title="Enterprise-Grade Capabilities"
						description="Everything you need to file your taxes securely and confidently"
					/>
				</div>
			</section>

			{/* Tax Service Features Section */}
			<section className="py-24 bg-gradient-to-br from-background via-background to-primary/5">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<Badge variant="outline" className="mb-4 px-4 py-2">
							<FileText className="h-4 w-4 mr-2" />
							Tax Filing Features
						</Badge>
						<h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
							Complete Tax Filing Solution
							<span className="block text-primary">For Federal Returns</span>
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							Comprehensive tax filing features designed to make filing your federal taxes simple and secure
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{taxServiceFeatures.map((feature) => (
							<Card key={feature.name} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:scale-105">
								<CardContent className="p-6">
									<div className="flex items-center gap-4 mb-4">
										<div className="p-3 bg-primary/10 rounded-lg text-primary">
											{feature.icon}
										</div>
										<h3 className="text-lg font-semibold text-gray-900">{feature.name}</h3>
									</div>
									<p className="text-gray-600">{feature.description}</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Security & Privacy Highlight Section */}
			<section className="py-24 bg-gradient-to-br from-slate-50 via-white to-slate-100">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20">
							<Shield className="h-4 w-4 mr-2" />
							Security & Privacy
						</Badge>
						<h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
							Your Privacy is Protected
						</h2>
						<p className="text-xl text-slate-600 max-w-2xl mx-auto">
							We take your privacy seriously. Your tax information never leaves your browser.
						</p>
					</div>

					<div className="bg-white rounded-lg shadow-lg p-8 mb-8">
						<TaxServicesDisclosure />
					</div>

					<div className="grid md:grid-cols-2 gap-6">
						<Card className="border-0 bg-white/80 backdrop-blur-sm">
							<CardContent className="p-6">
								<div className="flex items-center gap-4 mb-4">
									<div className="p-3 bg-emerald-100 rounded-lg text-emerald-600">
										<Lock className="h-6 w-6" />
									</div>
									<h3 className="text-lg font-semibold text-gray-900">No Data Storage</h3>
								</div>
								<p className="text-gray-600">
									Your personal information and tax return data are processed entirely in your browser. 
									We don't store any PII or FTI on our servers.
								</p>
							</CardContent>
						</Card>

						<Card className="border-0 bg-white/80 backdrop-blur-sm">
							<CardContent className="p-6">
								<div className="flex items-center gap-4 mb-4">
									<div className="p-3 bg-blue-100 rounded-lg text-blue-600">
										<CheckCircle className="h-6 w-6" />
									</div>
									<h3 className="text-lg font-semibold text-gray-900">Direct IRS Filing</h3>
								</div>
								<p className="text-gray-600">
									You file directly with the IRS. Financbase does not submit your return on your behalf. 
									We provide the software, you control the submission.
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			<PremiumFeaturesShowcase />

			<PricingPreview />

			<FAQ />

			<PublicCTA
				title="Ready to File Your Taxes?"
				description="Join thousands filing their federal taxes free with IRS Direct File"
				primaryAction={{
					text: "Start Filing",
					href: "/auth/sign-up",
				}}
				secondaryAction={{
					text: "Learn More",
					href: "/docs/tax-filing",
				}}
			/>
		</>
	);
}

