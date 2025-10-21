"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	AlertTriangle,
	ArrowLeft,
	ArrowRight,
	ArrowUp,
	BookOpen,
	Briefcase,
	Calendar,
	CheckCircle,
	Clock,
	FileText,
	Filter,
	Gavel,
	Headphones,
	Home,
	Key,
	LayoutDashboard,
	Link2,
	Mail,
	Scale,
	Server,
	Shield,
	TrendingDown,
	TrendingUp,
	User,
	Users,
	XCircle,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function TermsPage() {
	const [activeSection, setActiveSection] = useState<string>("");
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const toggleVisibility = () => {
			if (window.pageYOffset > 300) {
				setIsVisible(true);
			} else {
				setIsVisible(false);
			}
		};

		window.addEventListener("scroll", toggleVisibility);
		return () => window.removeEventListener("scroll", toggleVisibility);
	}, []);

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	};

	const sections = [
		{ id: "acceptance", title: "Acceptance of Terms", icon: CheckCircle },
		{ id: "use-license", title: "Use License", icon: FileText },
		{ id: "user-account", title: "User Account", icon: User },
		{ id: "privacy-policy", title: "Privacy Policy", icon: Shield },
		{ id: "disclaimer", title: "Disclaimer", icon: AlertTriangle },
		{ id: "limitations", title: "Limitations", icon: XCircle },
		{ id: "governing-law", title: "Governing Law", icon: Gavel },
		{ id: "contact", title: "Contact Information", icon: Mail },
	];

	const accordionItems = [
		{
			value: "acceptance",
			title: "1. Acceptance of Terms",
			content:
				'By accessing and using this dashboard application ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.',
			important: true,
		},
		{
			value: "use-license",
			title: "2. Use License",
			content:
				"Permission is granted to temporarily use this Service for personal or commercial purposes. This is the grant of a license, not a transfer of title, and under this license you may not:",
			list: [
				"Modify or copy the materials without authorization",
				"Use the materials for any commercial purpose without a valid license",
				"Attempt to decompile or reverse engineer any software contained in the Service",
				"Remove any copyright or other proprietary notations from the materials",
				"Transfer the materials to another person or mirror the materials on any other server",
			],
		},
		{
			value: "user-account",
			title: "3. User Account",
			content:
				"You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account or password. You must notify us immediately of any unauthorized use of your account.",
			important: true,
		},
		{
			value: "privacy-policy",
			title: "4. Privacy Policy",
			content:
				"Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy, which also governs the Service and informs users of our data collection practices.",
			note: "Our Privacy Policy is available at /privacy and contains important information about how we collect, use, and protect your personal information.",
		},
		{
			value: "disclaimer",
			title: "5. Disclaimer",
			content:
				'The materials within the Service are provided on an "as is" basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.',
			important: true,
		},
		{
			value: "limitations",
			title: "6. Limitations",
			content:
				"In no event shall we or our suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the Service, even if we or our authorized representative has been notified orally or in writing of the possibility of such damage.",
			important: true,
		},
		{
			value: "revisions",
			title: "7. Revisions and Errata",
			content:
				"The materials appearing in the Service could include technical, typographical, or photographic errors. We do not warrant that any of the materials on the Service are accurate, complete or current. We may make changes to the materials contained in the Service at any time without notice.",
		},
		{
			value: "modifications",
			title: "8. Service Terms Modifications",
			content:
				"We may revise these terms of service at any time without notice. By using this Service you are agreeing to be bound by the then current version of these terms of service.",
			note: "We will notify users of significant changes to these terms via email or through the Service interface.",
		},
		{
			value: "governing-law",
			title: "9. Governing Law",
			content:
				"These terms and conditions are governed by and construed in accordance with the laws of your jurisdiction and you irrevocably submit to the exclusive jurisdiction of the courts in that location.",
			important: true,
		},
		{
			value: "contact",
			title: "10. Contact Information",
			content:
				"If you have any questions about these Terms, please contact us at:",
			list: [
				"Email: legal@financbase.com",
				"Support: support@financbase.com",
				"Legal Department: legal@financbase.com",
			],
		},
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
			{/* Hero Section */}
			<div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container mx-auto px-4 py-16">
					<div className="max-w-4xl mx-auto text-center">
						<div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6">
							<Scale className="h-4 w-4" />
							Legal Terms
						</div>
						<h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
							Terms of Service
						</h1>
						<p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
							Please read these terms carefully before using our service. By
							using our platform, you agree to be bound by these terms.
						</p>
						<div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
							<div className="flex items-center gap-2">
								<Calendar className="h-4 w-4" />
								Last updated:{" "}
								{new Date().toLocaleDateString("en-US", {
									month: "long",
									day: "numeric",
									year: "numeric",
								})}
							</div>
							<Separator orientation="vertical" className="h-4" />
							<div className="flex items-center gap-2">
								<FileText className="h-4 w-4" />
								10 sections
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Navigation Breadcrumb */}
			<div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Link
							href="/"
							className="flex items-center gap-1 hover:text-primary transition-colors"
						>
							<Home className="h-4 w-4" />
							Home
						</Link>
						<span>/</span>
						<span className="text-foreground font-medium">
							Terms of Service
						</span>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-16">
				<div className="max-w-6xl mx-auto">
					<div className="grid gap-8 lg:grid-cols-4">
						{/* Table of Contents */}
						<div className="lg:col-span-1">
							<Card className="sticky top-24">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<BookOpen className="h-5 w-5" />
										Table of Contents
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2">
									{sections.map((section) => {
										const Icon = section.icon;
										return (
											<Button
												key={section.id}
												variant="ghost"
												className="w-full justify-start h-auto p-3"
												onClick={() => {
													document.getElementById(section.id)?.scrollIntoView({
														behavior: "smooth",
													});
												}}
											>
												<Icon className="h-4 w-4 mr-3 flex-shrink-0" />
												<span className="text-left text-sm">
													{section.title}
												</span>
											</Button>
										);
									})}
								</CardContent>
							</Card>
						</div>

						{/* Main Content */}
						<div className="lg:col-span-3">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Scale className="h-6 w-6 text-primary" />
										Terms of Service Details
									</CardTitle>
								</CardHeader>
								<CardContent>
									<Accordion type="single" collapsible className="w-full">
										{accordionItems.map((item, index) => (
											<AccordionItem
												key={item.value}
												value={item.value}
												id={item.value}
											>
												<AccordionTrigger className="text-left hover:no-underline">
													<div className="flex items-center gap-3">
														<Badge variant="outline" className="flex-shrink-0">
															{index + 1}
														</Badge>
														<span className="font-semibold">{item.title}</span>
														{item.important && (
															<Badge variant="destructive" className="text-xs">
																Important
															</Badge>
														)}
													</div>
												</AccordionTrigger>
												<AccordionContent className="space-y-4">
													<p className="text-muted-foreground leading-relaxed">
														{item.content}
													</p>
													{item.list && (
														<ul className="space-y-2 ml-4">
															{item.list.map((listItem, listIndex) => (
																<li
																	key={`${item.value}-${listIndex}`}
																	className="flex items-start gap-2"
																>
																	<div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
																	<span className="text-muted-foreground text-sm">
																		{listItem}
																	</span>
																</li>
															))}
														</ul>
													)}
													{item.note && (
														<div className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
															<p className="text-sm font-medium text-foreground">
																{item.note}
															</p>
														</div>
													)}
												</AccordionContent>
											</AccordionItem>
										))}
									</Accordion>
								</CardContent>
							</Card>

							{/* Important Notice */}
							<Card className="mt-8 border-destructive/20 bg-destructive/5">
								<CardHeader>
									<CardTitle className="flex items-center gap-2 text-destructive">
										<AlertTriangle className="h-5 w-5" />
										Important Legal Notice
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground mb-4">
										These terms constitute a legally binding agreement between
										you and Financbase. By using our service, you acknowledge
										that you have read, understood, and agree to be bound by
										these terms.
									</p>
									<div className="flex flex-col sm:flex-row gap-3">
										<Button variant="destructive" className="flex-1">
											<Gavel className="h-4 w-4 mr-2" />
											Review Legal Terms
										</Button>
										<Button variant="outline" className="flex-1">
											<FileText className="h-4 w-4 mr-2" />
											Download PDF
										</Button>
									</div>
								</CardContent>
							</Card>

							{/* Contact Section */}
							<Card className="mt-8">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Mail className="h-5 w-5 text-primary" />
										Questions About These Terms?
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground mb-4">
										If you have any questions about these Terms of Service or
										need legal clarification, please contact our legal team.
									</p>
									<div className="flex flex-col sm:flex-row gap-3">
										<Button className="flex-1">
											<Mail className="h-4 w-4 mr-2" />
											Contact Legal Team
										</Button>
										<Button variant="outline" className="flex-1">
											<FileText className="h-4 w-4 mr-2" />
											Download PDF
										</Button>
										<Button variant="ghost" asChild className="flex-1">
											<Link href="/">
												<ArrowLeft className="h-4 w-4 mr-2" />
												Back to Home
											</Link>
										</Button>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>

			{/* Scroll to Top Button */}
			{isVisible && (
				<Button
					onClick={scrollToTop}
					className="fixed bottom-8 right-8 h-12 w-12 rounded-full shadow-lg z-50"
					size="icon"
				>
					<ArrowUp className="h-4 w-4" />
				</Button>
			)}
		</div>
	);
}
