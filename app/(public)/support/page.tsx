"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	AlertCircle,
	BookOpen,
	ChevronDown,
	ChevronUp,
	CreditCard,
	HelpCircle,
	Mail,
	MessageCircle,
	Phone,
	Search,
	Settings,
	Shield,
	Zap,
	ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useState, useId } from "react";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";

interface ContactFormData {
	name: string;
	email: string;
	subject: string;
	priority: string;
	category: string;
	message: string;
}

export default function SupportPage() {
	const nameId = useId();
	const emailId = useId();
	const subjectId = useId();
	const categoryId = useId();
	const priorityId = useId();
	const messageId = useId();
	
	const [searchQuery, setSearchQuery] = useState("");
	const [openFaq, setOpenFaq] = useState<number | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState<ContactFormData>({
		name: "",
		email: "",
		subject: "",
		priority: "medium",
		category: "general",
		message: "",
	});
	const [formErrors, setFormErrors] = useState<Partial<ContactFormData>>({});
	const [submitMessage, setSubmitMessage] = useState("");

	const validateForm = (): boolean => {
		const errors: Partial<ContactFormData> = {};

		if (!formData.name.trim()) errors.name = "Name is required";
		if (!formData.email.trim()) errors.email = "Email is required";
		if (!formData.email.includes("@")) errors.email = "Valid email is required";
		if (!formData.subject.trim()) errors.subject = "Subject is required";
		if (!formData.message.trim()) errors.message = "Message is required";
		if (formData.message.length < 10) errors.message = "Message must be at least 10 characters";

		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleInputChange = (field: keyof ContactFormData, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		setFormErrors(prev => ({ ...prev, [field]: "" }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		setIsSubmitting(true);

		try {
			// Simulate API call
			await new Promise(resolve => setTimeout(resolve, 2000));

			setSubmitMessage("✅ Thank you! We've received your message and will respond within 24 hours.");
			setFormData({
				name: "",
				email: "",
				subject: "",
				priority: "medium",
				category: "general",
				message: "",
			});
		} catch {
			setSubmitMessage("❌ Something went wrong. Please try again or contact us directly.");
		} finally {
			setIsSubmitting(false);
		}
	};

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
			color: "bg-primary/10",
			articles: 12,
		},
		{
			title: "Account & Billing",
			description: "Manage your account and payments",
			icon: CreditCard,
			color: "bg-chart-2/10",
			articles: 8,
		},
		{
			title: "Security & Privacy",
			description: "Keep your data safe and secure",
			icon: Shield,
			color: "bg-primary/5",
			articles: 15,
		},
		{
			title: "API & Integrations",
			description: "Connect with your favorite tools",
			icon: Settings,
			color: "bg-chart-3/10",
			articles: 20,
		},
		{
			title: "Troubleshooting",
			description: "Fix common issues and errors",
			icon: AlertCircle,
			color: "bg-chart-5/10",
			articles: 18,
		},
		{
			title: "Advanced Features",
			description: "Unlock the full potential",
			icon: Zap,
			color: "bg-chart-4/10",
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


	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<div className="border-b bg-gradient-to-br from-background via-background to-muted/20">
				<div className="container mx-auto px-4 py-8">
					<div className="max-w-4xl mx-auto text-center">
						<div className="flex items-center justify-center gap-2 mb-3">
							<HelpCircle className="h-6 w-6 text-primary" />
							<Badge variant="secondary" className="text-sm font-medium">
								Help Center
							</Badge>
						</div>
						<h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
							How can we help you today?
						</h1>
						<p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
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

			<div className="container mx-auto px-4 py-8">
				<div className="max-w-6xl mx-auto">
					{/* Interactive Tabs Section */}
					<Tabs defaultValue="categories" className="space-y-4">
						<TabsList className="grid w-full grid-cols-4">
							<TabsTrigger value="categories">Browse Topics</TabsTrigger>
							<TabsTrigger value="faq">FAQ</TabsTrigger>
							<TabsTrigger value="contact">Contact Us</TabsTrigger>
							<TabsTrigger value="support">Support Options</TabsTrigger>
						</TabsList>

						{/* Categories Tab */}
						<TabsContent value="categories" className="space-y-4">
							<BentoGrid className="md:auto-rows-[20rem]">
								{supportCategories.map((category) => (
									<BentoCard
										key={`category-${category.title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '').replace(/--+/g, '-')}`}
										name={category.title}
										description={`${category.description}. ${category.articles} articles available.`}
										Icon={category.icon}
										href={`/support/category/${category.title.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "").replace(/--+/g, "-")}`}
										cta="Browse Articles"
										className="md:col-span-1"
										background={
											<div className={`absolute inset-0 ${category.color} group-hover:opacity-15 transition-opacity`} />
										}
									/>
								))}
							</BentoGrid>
						</TabsContent>

						{/* FAQ Tab */}
						<TabsContent value="faq" className="space-y-4">
							<div className="space-y-4">
								{faqItems.map((item) => (
									<Card key={`faq-${item.question.toLowerCase().replace(/\s+/g, '-').slice(0, 50)}`} className="overflow-hidden">
										<button
											type="button"
											className="w-full p-6 text-left hover:bg-muted/50 transition-colors"
											onClick={() => setOpenFaq(openFaq === faqItems.indexOf(item) ? null : faqItems.indexOf(item))}
										>
											<div className="flex items-center justify-between">
												<h3 className="font-semibold text-lg">{item.question}</h3>
												{openFaq === faqItems.indexOf(item) ? (
													<ChevronUp className="h-5 w-5 text-muted-foreground" />
												) : (
													<ChevronDown className="h-5 w-5 text-muted-foreground" />
												)}
											</div>
										</button>
										{openFaq === faqItems.indexOf(item) && (
											<div className="px-6 pb-6">
												<p className="text-muted-foreground leading-relaxed">
													{item.answer}
												</p>
											</div>
										)}
									</Card>
								))}
							</div>
						</TabsContent>

						{/* Contact Form Tab */}
						<TabsContent value="contact" className="space-y-4">
							<div className="max-w-2xl mx-auto">
								<h2 className="text-2xl font-semibold mb-6 text-center">
									Send us a Message
								</h2>
								<p className="text-muted-foreground text-center mb-8">
									Fill out the form below and we'll get back to you as soon as possible.
								</p>

								{submitMessage && (
									<div className={`mb-6 p-4 rounded-lg border ${
										submitMessage.includes('✅')
											? 'bg-green-50 border-green-200 text-green-800'
											: 'bg-red-50 border-red-200 text-red-800'
									}`}>
										{submitMessage}
									</div>
								)}

								<form onSubmit={handleSubmit} className="space-y-6">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<label htmlFor={nameId} className="block text-sm font-medium mb-2">
												Full Name *
											</label>
											<Input
												id={nameId}
												type="text"
												value={formData.name}
												onChange={(e) => handleInputChange('name', e.target.value)}
												className={formErrors.name ? 'border-red-500' : ''}
												placeholder="Enter your full name"
											/>
											{formErrors.name && (
												<p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
											)}
										</div>
										<div>
											<label htmlFor={emailId} className="block text-sm font-medium mb-2">
												Email Address *
											</label>
											<Input
												id={emailId}
												type="email"
												value={formData.email}
												onChange={(e) => handleInputChange('email', e.target.value)}
												className={formErrors.email ? 'border-red-500' : ''}
												placeholder="Enter your email address"
											/>
											{formErrors.email && (
												<p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
											)}
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<label htmlFor={subjectId} className="block text-sm font-medium mb-2">
												Subject *
											</label>
											<Input
												id={subjectId}
												type="text"
												value={formData.subject}
												onChange={(e) => handleInputChange('subject', e.target.value)}
												className={formErrors.subject ? 'border-red-500' : ''}
												placeholder="Brief description of your issue"
											/>
											{formErrors.subject && (
												<p className="text-red-500 text-sm mt-1">{formErrors.subject}</p>
											)}
										</div>
										<div>
											<label htmlFor={categoryId} className="block text-sm font-medium mb-2">
												Category
											</label>
											<Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
												<SelectTrigger id={categoryId}>
													<SelectValue placeholder="Select a category" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="general">General Inquiry</SelectItem>
													<SelectItem value="technical">Technical Support</SelectItem>
													<SelectItem value="billing">Billing & Account</SelectItem>
													<SelectItem value="feature">Feature Request</SelectItem>
													<SelectItem value="bug">Bug Report</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>

									<div>
										<label htmlFor={priorityId} className="block text-sm font-medium mb-2">
											Priority
										</label>
										<Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
											<SelectTrigger id={priorityId} className="w-full md:w-48">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="low">Low - General question</SelectItem>
												<SelectItem value="medium">Medium - Issue affecting work</SelectItem>
												<SelectItem value="high">High - Urgent issue</SelectItem>
												<SelectItem value="critical">Critical - System down</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div>
										<label htmlFor={messageId} className="block text-sm font-medium mb-2">
											Message *
										</label>
										<Textarea
											id={messageId}
											value={formData.message}
											onChange={(e) => handleInputChange('message', e.target.value)}
											className={`min-h-32 ${formErrors.message ? 'border-red-500' : ''}`}
											placeholder="Please describe your issue or question in detail..."
										/>
										{formErrors.message && (
											<p className="text-red-500 text-sm mt-1">{formErrors.message}</p>
										)}
									</div>

									<Button
										type="submit"
										disabled={isSubmitting}
										className="w-full"
									>
										{isSubmitting ? (
											<>
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
												Sending...
											</>
										) : (
											<>
												<Mail className="h-4 w-4 mr-2" />
												Send Message
											</>
										)}
									</Button>
								</form>
							</div>
						</TabsContent>

						{/* Support Options Tab */}
						<TabsContent value="support" className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{contactMethods.map((method) => (
									<Card
										key={`contact-${method.title.toLowerCase().replace(/\s+/g, '-')}`}
										className="group hover:shadow-md transition-all duration-200"
									>
										<CardContent className="p-6">
											<div className="flex items-start gap-4">
												<div className="p-3 rounded-lg bg-primary/10 text-primary">
													<method.icon className="h-6 w-6" />
												</div>
												<div className="flex-1">
													<div className="flex items-center justify-between mb-2">
														<h3 className="font-semibold">
															{method.title}
														</h3>
														<Badge
															variant="secondary"
															className="text-xs"
														>
															{method.availability}
														</Badge>
													</div>
													<p className="text-sm text-muted-foreground mb-4">
														{method.description}
													</p>
													<Button
														asChild
														size="sm"
														className="group-hover:bg-primary/90"
													>
														<Link href="/contact">
															Get Started
															<ExternalLink className="h-3 w-3 ml-1" />
														</Link>
													</Button>
												</div>
											</div>
											</CardContent>
										</Card>
									))}
							</div>
						</TabsContent>
					</Tabs>

					{/* Still Need Help */}
					<Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 mt-8">
						<CardContent className="p-6 text-center">
							<div className="max-w-2xl mx-auto">
								<h3 className="text-2xl font-semibold mb-3">
									Still need help?
								</h3>
								<p className="text-muted-foreground mb-5">
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
