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
	ArrowLeft,
	ArrowUp,
	BookOpen,
	FileText,
	Mail,
	Shield,
} from "lucide-react";
import Link from "next/link";
import { useScrollToTop } from "@/hooks/useScrollToTop";

export default function PrivacyPage() {
	const { isVisible, scrollToTop } = useScrollToTop(300);

	const sections = [
		{ id: "introduction", title: "Introduction", icon: FileText },
		{
			id: "information-collection",
			title: "Information We Collect",
			icon: Shield,
		},
		{ id: "information-use", title: "How We Use Information", icon: BookOpen },
		{ id: "information-sharing", title: "Information Sharing", icon: Shield },
		{ id: "data-security", title: "Data Security", icon: Shield },
		{ id: "your-rights", title: "Your Rights", icon: BookOpen },
		{ id: "contact", title: "Contact Us", icon: Mail },
	];

	const accordionItems = [
		{
			value: "introduction",
			title: "1. Introduction",
			content:
				'This Privacy Policy describes how we collect, use, and share your personal information when you use our dashboard application ("Service"). We are committed to protecting your privacy and ensuring you have a positive experience on our Service.',
		},
		{
			value: "information-collection",
			title: "2. Information We Collect",
			content:
				"We collect several types of information from and about users of our Service:",
			list: [
				"Personal Information: Name, email address, phone number, and other contact details you provide",
				"Account Information: Username, password, and profile information",
				"Usage Data: Information about how you use our Service, including access times, pages viewed, and navigation patterns",
				"Device Information: Device type, operating system, browser type, and IP address",
				"Cookies and Tracking: Data collected through cookies and similar tracking technologies",
			],
		},
		{
			value: "information-use",
			title: "3. How We Use Your Information",
			content: "We use the information we collect for various purposes:",
			list: [
				"To provide, maintain, and improve our Service",
				"To process your transactions and send related information",
				"To send you technical notices, updates, and security alerts",
				"To respond to your comments, questions, and customer service requests",
				"To monitor and analyze trends, usage, and activities",
				"To detect, prevent, and address technical issues and fraudulent activity",
				"To personalize your experience and deliver relevant content",
			],
		},
		{
			value: "information-sharing",
			title: "4. Information Sharing and Disclosure",
			content: "We may share your information in the following circumstances:",
			list: [
				"With your consent: When you explicitly agree to share information",
				"Service Providers: With third-party vendors who perform services on our behalf",
				"Legal Requirements: When required by law or to protect our rights",
				"Business Transfers: In connection with a merger, acquisition, or sale of assets",
			],
			note: "We do not sell your personal information to third parties.",
		},
		{
			value: "data-security",
			title: "5. Data Security",
			content:
				"We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.",
		},
		{
			value: "data-retention",
			title: "6. Data Retention",
			content:
				"We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.",
		},
		{
			value: "your-rights",
			title: "7. Your Rights",
			content: "You have certain rights regarding your personal information:",
			list: [
				"Access: Request a copy of your personal information",
				"Correction: Request correction of inaccurate information",
				"Deletion: Request deletion of your personal information",
				"Objection: Object to processing of your information",
				"Data Portability: Request transfer of your data to another service",
				"Withdraw Consent: Withdraw consent where processing is based on consent",
			],
		},
		{
			value: "cookies",
			title: "8. Cookies and Tracking Technologies",
			content:
				"We use cookies and similar tracking technologies to track activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.",
		},
		{
			value: "children-privacy",
			title: "9. Children's Privacy",
			content:
				"Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us.",
		},
		{
			value: "policy-changes",
			title: "10. Changes to This Privacy Policy",
			content:
				'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.',
		},
		{
			value: "international-transfers",
			title: "11. International Data Transfers",
			content:
				"Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ.",
		},
		{
			value: "contact",
			title: "12. Contact Us",
			content:
				"If you have any questions about this Privacy Policy, please contact us at:",
			list: [
				"Email: privacy@financbase.com",
				"Support: support@financbase.com",
			],
		},
	];

	return (
		<ContentPageTemplate
			title="Privacy Policy"
			description="Your privacy matters to us. Learn how we collect, use, and protect your personal information."
			breadcrumbs={[
				{ label: "Home", href: "/" },
				{ label: "Privacy Policy" },
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
								<Shield className="h-6 w-6 text-primary" />
								Privacy Policy Details
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

					{/* Contact Section */}
					<Card className="mt-8">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Mail className="h-5 w-5 text-primary" />
								Questions About This Policy?
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground mb-4">
								If you have any questions about this Privacy Policy or our
								data practices, please don't hesitate to contact us.
							</p>
							<div className="flex flex-col sm:flex-row gap-3">
								<Button asChild className="flex-1">
									<Link href="/contact">
										<Mail className="h-4 w-4 mr-2" />
										Contact Privacy Team
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
