"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	AlertCircle,
	ArrowLeft,
	ArrowRight,
	ArrowUp,
	BookOpen,
	Briefcase,
	CheckCircle,
	ChevronDown,
	ChevronUp,
	Clock,
	Code,
	CreditCard,
	FileText,
	Headphones,
	HelpCircle,
	Key,
	Landmark,
	LayoutDashboard,
	Link2,
	Mail,
	MessageCircle,
	Phone,
	Puzzle,
	Search,
	Settings,
	Shield,
	Users,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SupportPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [openFaq, setOpenFaq] = useState<number | null>(null);

	const faqItems = [
		{
			question: "How do I get started with Financbase?",
			answer:
				"Getting started is easy! Sign up for an account, verify your email, and complete the onboarding process. You'll have access to our dashboard and can start using our financial tools immediately.",
		},
		{
			question: "What payment methods do you accept?",
			answer:
				"We accept all major credit cards (Visa, Mastercard, American Express), bank transfers, and digital wallets like PayPal and Apple Pay. All transactions are processed securely through our PCI-compliant payment system.",
		},
		{
			question: "How secure is my financial data?",
			answer:
				"Security is our top priority. We use bank-level encryption (256-bit SSL), are SOC 2 compliant, and follow strict data protection protocols. Your data is encrypted both in transit and at rest.",
		},
		{
			question: "Can I integrate Financbase with my existing systems?",
			answer:
				"Yes! We offer comprehensive APIs and webhooks that integrate with most popular business tools including QuickBooks, Xero, Salesforce, and custom applications. Check our integration guides for detailed setup instructions.",
		},
		{
			question: "What's your refund policy?",
			answer:
				"We offer a 30-day money-back guarantee for all new subscriptions. If you're not satisfied with our service, contact our support team within 30 days of your initial purchase for a full refund.",
		},
		{
			question: "Do you offer phone support?",
			answer:
				"Yes! Our Enterprise customers have access to dedicated phone support. Standard and Professional plan customers can reach us via live chat, email, or our help center. Response times vary by plan.",
		},
	];

	const supportCategories = [
		{
			title: "Getting Started",
			description: "New to Financbase? Start here",
			icon: BookOpen,
			color: "bg-blue-500",
			articles: 12,
		},
		{
			title: "Account & Billing",
			description: "Manage your account and payments",
			icon: CreditCard,
			color: "bg-green-500",
			articles: 8,
		},
		{
			title: "Security & Privacy",
			description: "Keep your data safe and secure",
			icon: Shield,
			color: "bg-purple-500",
			articles: 15,
		},
		{
			title: "API & Integrations",
			description: "Connect with your favorite tools",
			icon: Settings,
			color: "bg-orange-500",
			articles: 20,
		},
		{
			title: "Troubleshooting",
			description: "Fix common issues and errors",
			icon: AlertCircle,
			color: "bg-red-500",
			articles: 18,
		},
		{
			title: "Advanced Features",
			description: "Unlock the full potential",
			icon: Zap,
			color: "bg-indigo-500",
			articles: 10,
		},
	];

	const contactMethods = [
		{
			title: "Live Chat",
			description: "Get instant help from our support team",
			icon: MessageCircle,
			availability: "Available 24/7",
			responseTime: "< 2 minutes",
			color: "text-green-600",
		},
		{
			title: "Email Support",
			description: "Send us a detailed message",
			icon: Mail,
			availability: "Mon-Fri, 9AM-6PM EST",
			responseTime: "< 4 hours",
			color: "text-blue-600",
		},
		{
			title: "Phone Support",
			description: "Speak directly with our team",
			icon: Phone,
			availability: "Enterprise customers only",
			responseTime: "Immediate",
			color: "text-purple-600",
		},
	];

	const popularArticles = [
		{
			title: "Setting up your first account",
			href: "/support/account-setup",
			views: "2.1k",
		},
		{
			title: "Understanding your dashboard",
			href: "/support/dashboard-guide",
			views: "1.8k",
		},
		{
			title: "API authentication guide",
			href: "/support/api-auth",
			views: "1.5k",
		},
		{
			title: "Troubleshooting payment issues",
			href: "/support/payment-troubleshooting",
			views: "1.2k",
		},
	];

	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<div className="border-b bg-gradient-to-br from-background via-background to-muted/20">
				<div className="container mx-auto px-4 py-16">
					<div className="max-w-4xl mx-auto text-center">
						<div className="flex items-center justify-center gap-2 mb-4">
							<HelpCircle className="h-6 w-6 text-primary" />
							<Badge variant="secondary" className="text-sm font-medium">
								Help Center
							</Badge>
						</div>
						<h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
							How can we help you today?
						</h1>
						<p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
							Find answers to common questions, get help with your account, or
							contact our support team.
						</p>

						{/* Search Bar */}
						<div className="relative max-w-2xl mx-auto">
							<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
							<Input
								type="text"
								placeholder="Search for help articles..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-12 pr-4 py-3 text-lg"
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-16">
				<div className="max-w-6xl mx-auto">
					{/* Contact Methods */}
					<div className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{contactMethods.map((method, index) => (
								<Card
									key={`contact-method-${index}`}
									className="group hover:shadow-lg transition-all duration-200"
								>
									<CardContent className="p-6 text-center">
										<div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-4">
											<method.icon className="h-6 w-6" />
										</div>
										<h3 className="text-lg font-semibold mb-2">
											{method.title}
										</h3>
										<p className="text-muted-foreground mb-4">
											{method.description}
										</p>
										<div className="space-y-2 text-sm">
											<div className="flex items-center justify-center gap-2">
												<Clock className="h-4 w-4 text-muted-foreground" />
												<span>{method.availability}</span>
											</div>
											<div className="flex items-center justify-center gap-2">
												<CheckCircle className="h-4 w-4 text-green-600" />
												<span className={method.color}>
													{method.responseTime}
												</span>
											</div>
										</div>
										<Button className="w-full mt-4" variant="outline">
											Get Started
										</Button>
									</CardContent>
								</Card>
							))}
						</div>
					</div>

					{/* Support Categories */}
					<div className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">Browse by Category</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{supportCategories.map((category, index) => (
								<Link
									key={`category-${index}`}
									href={`/support/category/${category.title.toLowerCase().replace(/\s+/g, "-")}`}
								>
									<Card className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
										<CardContent className="p-6">
											<div className="flex items-start gap-4">
												<div
													className={`p-3 rounded-lg ${category.color} text-white`}
												>
													<category.icon className="h-6 w-6" />
												</div>
												<div className="flex-1">
													<h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
														{category.title}
													</h3>
													<p className="text-muted-foreground mb-3">
														{category.description}
													</p>
													<div className="flex items-center gap-2 text-sm text-muted-foreground">
														<FileText className="h-4 w-4" />
														<span>{category.articles} articles</span>
													</div>
												</div>
												<ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
											</div>
										</CardContent>
									</Card>
								</Link>
							))}
						</div>
					</div>

					{/* Popular Articles */}
					<div className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">Popular Articles</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{popularArticles.map((article, index) => (
								<Link key={`article-${index}`} href={article.href}>
									<Card className="group hover:shadow-md transition-all duration-200">
										<CardContent className="p-6">
											<div className="flex items-center justify-between">
												<div className="flex-1">
													<h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
														{article.title}
													</h3>
													<div className="flex items-center gap-2 text-sm text-muted-foreground">
														<Users className="h-4 w-4" />
														<span>{article.views} views</span>
													</div>
												</div>
												<ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
											</div>
										</CardContent>
									</Card>
								</Link>
							))}
						</div>
					</div>

					{/* FAQ Section */}
					<div className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">
							Frequently Asked Questions
						</h2>
						<div className="space-y-4">
							{faqItems.map((item, index) => (
								<Card key={`faq-${index}`} className="overflow-hidden">
									<button
										type="button"
										className="w-full p-6 text-left hover:bg-muted/50 transition-colors"
										onClick={() => setOpenFaq(openFaq === index ? null : index)}
									>
										<div className="flex items-center justify-between">
											<h3 className="font-semibold text-lg">{item.question}</h3>
											{openFaq === index ? (
												<ChevronUp className="h-5 w-5 text-muted-foreground" />
											) : (
												<ChevronDown className="h-5 w-5 text-muted-foreground" />
											)}
										</div>
									</button>
									{openFaq === index && (
										<div className="px-6 pb-6">
											<p className="text-muted-foreground leading-relaxed">
												{item.answer}
											</p>
										</div>
									)}
								</Card>
							))}
						</div>
					</div>

					{/* Still Need Help */}
					<Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
						<CardContent className="p-8 text-center">
							<div className="max-w-2xl mx-auto">
								<h3 className="text-2xl font-semibold mb-4">
									Still need help?
								</h3>
								<p className="text-muted-foreground mb-6">
									Can't find the answer you're looking for? Our support team is
									here to help you get back on track.
								</p>
								<div className="flex flex-col sm:flex-row gap-4 justify-center">
									<Button asChild>
										<Link href="/contact">
											<MessageCircle className="h-4 w-4 mr-2" />
											Contact Support
										</Link>
									</Button>
									<Button variant="outline" asChild>
										<Link href="/docs">
											<BookOpen className="h-4 w-4 mr-2" />
											Browse Documentation
										</Link>
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
