/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

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
import { ContentPageTemplate } from "@/components/layout/public-templates";
import {
	AlertTriangle,
	ArrowLeft,
	ArrowUp,
	BookOpen,
	CheckCircle,
	FileText,
	Gavel,
	Mail,
	Scale,
	Shield,
	User,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { useScrollToTop } from "@/hooks/useScrollToTop";

export default function TermsPage() {
	const { isVisible, scrollToTop } = useScrollToTop(300);

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
		<ContentPageTemplate
			title="Terms of Service"
			description="Please read these terms carefully before using our service. By using our platform, you agree to be bound by these terms."
			breadcrumbs={[
				{ label: "Home", href: "/" },
				{ label: "Terms of Service" },
			]}
		>
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
								<Button variant="destructive" asChild className="flex-1">
									<Link href="/legal">
										<Gavel className="h-4 w-4 mr-2" />
										Review Legal Terms
									</Link>
								</Button>
								<Button variant="outline" asChild className="flex-1">
									<Link href="/contact">
										<FileText className="h-4 w-4 mr-2" />
										Download PDF
									</Link>
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
								<Button asChild className="flex-1">
									<Link href="/contact">
										<Mail className="h-4 w-4 mr-2" />
										Contact Legal Team
									</Link>
								</Button>
								<Button variant="outline" asChild className="flex-1">
									<Link href="/contact">
										<FileText className="h-4 w-4 mr-2" />
										Download PDF
									</Link>
								</Button>
								<Button variant="ghost" asChild className="flex-1">
									<Link href="/home">
										<ArrowLeft className="h-4 w-4 mr-2" />
										Back to Home
									</Link>
								</Button>
							</div>
						</CardContent>
					</Card>
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
		</ContentPageTemplate>
	);
}
