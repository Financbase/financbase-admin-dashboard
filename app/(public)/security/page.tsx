"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	AlertTriangle,
	ArrowRight,
	Award,
	BarChart3,
	CheckCircle,
	ChevronDown,
	Clock,
	CreditCard,
	Download,
	ExternalLink,
	Eye,
	FileText,
	Globe,
	Headphones,
	HelpCircle,
	Key,
	Landmark,
	Link2,
	Lock,
	Mail,
	Phone,
	Server,
	Shield,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SecurityPage() {
	const [openFaq, setOpenFaq] = useState<number | null>(null);

	const securityRoadmap = [
		{
			name: "SOC 2 Type II",
			description:
				"Audited controls for security, availability, and confidentiality",
			status: "Planned Q1 2026",
			icon: Award,
			color: "text-blue-600",
			progress: "Planning Phase",
		},
		{
			name: "ISO 27001",
			description: "Information security management system certification",
			status: "Planned Q2 2026",
			icon: Shield,
			color: "text-purple-600",
			progress: "Research Phase",
		},
		{
			name: "PCI DSS Level 1",
			description: "Payment card industry data security standards",
			status: "Planned Q3 2026",
			icon: Lock,
			color: "text-indigo-600",
			progress: "Requirements Analysis",
		},
		{
			name: "GDPR Compliance",
			description: "General Data Protection Regulation compliance",
			status: "In Progress",
			icon: Globe,
			color: "text-green-600",
			progress: "Implementation Phase",
		},
	];

	const securityFeatures = [
		{
			title: "End-to-End Encryption",
			description:
				"All data is encrypted in transit and at rest using AES-256 encryption",
			icon: Lock,
			details: [
				"TLS 1.3 for data in transit",
				"AES-256 for data at rest",
				"Perfect Forward Secrecy",
			],
		},
		{
			title: "Multi-Factor Authentication",
			description:
				"Enhanced security with MFA for all user accounts and API access",
			icon: Key,
			details: [
				"SMS, TOTP, and hardware key support",
				"Mandatory for admin accounts",
				"API key rotation",
			],
		},
		{
			title: "Zero Trust Architecture",
			description:
				"Never trust, always verify approach to network and application security",
			icon: Shield,
			details: [
				"Micro-segmentation",
				"Identity-based access",
				"Continuous verification",
			],
		},
		{
			title: "Regular Security Audits",
			description: "Third-party security assessments and penetration testing",
			icon: CheckCircle,
			details: [
				"Quarterly penetration tests",
				"Annual security audits",
				"Bug bounty program",
			],
		},
	];

	const complianceItems = [
		{
			title: "Data Residency",
			description:
				"Customer data is stored in secure, geographically distributed data centers",
			icon: Server,
			status: "Compliant",
		},
		{
			title: "Access Controls",
			description:
				"Role-based access control with principle of least privilege",
			icon: Users,
			status: "Implemented",
		},
		{
			title: "Audit Logging",
			description:
				"Comprehensive logging and monitoring of all system activities",
			icon: BarChart3,
			status: "Active",
		},
		{
			title: "Incident Response",
			description:
				"24/7 security monitoring and rapid incident response procedures",
			icon: AlertTriangle,
			status: "Operational",
		},
	];

	const faqItems = [
		{
			question: "How is my financial data protected?",
			answer:
				"We use bank-level encryption (AES-256) for all data at rest and TLS 1.3 for data in transit. All data is encrypted before leaving your device and remains encrypted in our secure data centers.",
		},
		{
			question: "Where is my data stored?",
			answer:
				"Your data is stored in secure, geographically distributed data centers that are SOC 2 Type II certified. We use multiple availability zones to ensure redundancy and uptime.",
		},
		{
			question: "Who has access to my data?",
			answer:
				"Access to customer data is strictly limited to authorized personnel who need it to provide our services. All access is logged, monitored, and requires multi-factor authentication.",
		},
		{
			question: "How do you handle data breaches?",
			answer:
				"We have comprehensive incident response procedures in place. In the unlikely event of a breach, we will notify affected customers within 72 hours and work with relevant authorities to investigate and resolve the issue.",
		},
		{
			question: "Can I export my data?",
			answer:
				"Yes, you can export all your data at any time through our self-service data export tools. We also provide data portability features to help you migrate to other platforms if needed.",
		},
		{
			question: "Do you share data with third parties?",
			answer:
				"We only share data with third parties as necessary to provide our services (like payment processors) and only with your explicit consent. We never sell or rent your personal information.",
		},
	];

	const securityReports = [
		{
			title: "SOC 2 Type II Report",
			description: "Independent audit of our security controls and procedures",
			date: "2025-10-15",
			size: "2.3 MB",
			icon: FileText,
		},
		{
			title: "Penetration Test Report",
			description: "Third-party security assessment and vulnerability testing",
			date: "2025-10-10",
			size: "1.8 MB",
			icon: Shield,
		},
		{
			title: "Privacy Policy",
			description: "How we collect, use, and protect your personal information",
			date: "2025-10-01",
			size: "456 KB",
			icon: Eye,
		},
	];

	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<div className="border-b bg-gradient-to-br from-background via-background to-muted/20">
				<div className="container mx-auto px-4 py-16">
					<div className="max-w-4xl mx-auto text-center">
						<div className="flex items-center justify-center gap-2 mb-4">
							<Shield className="h-6 w-6 text-primary" />
							<Badge variant="secondary" className="text-sm font-medium">
								Security & Compliance
							</Badge>
						</div>
						<h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
							Your Data Security is Our{" "}
							<span className="text-primary">Top Priority</span>
						</h1>
						<p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
							Bank-level security, industry-leading compliance, and transparent
							practices to protect your financial data.
						</p>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-16">
				<div className="max-w-6xl mx-auto">
					{/* Security Roadmap */}
					<div className="mb-16">
						<h2 className="text-2xl font-semibold mb-6 text-center">
							Security Roadmap
						</h2>
						<p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
							We're committed to achieving the highest security standards.
							Here's our planned certification timeline.
						</p>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							{securityRoadmap.map((item, index) => (
								<Card
									key={`roadmap-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
									className="text-center group hover:shadow-lg transition-all duration-200"
								>
									<CardContent className="p-6">
										<div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-4">
											<item.icon className="h-6 w-6" />
										</div>
										<h3 className="text-lg font-semibold mb-2">{item.name}</h3>
										<p className="text-muted-foreground text-sm mb-3">
											{item.description}
										</p>
										<div className="space-y-2">
											<Badge variant="outline" className={item.color}>
												{item.status}
											</Badge>
											<p className="text-xs text-muted-foreground">
												{item.progress}
											</p>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</div>

					{/* Current Security Measures */}
					<div className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">
							Current Security Measures
						</h2>
						<p className="text-muted-foreground mb-8">
							While we work toward formal certifications, we've already
							implemented robust security measures to protect your data.
						</p>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							{securityFeatures.map((feature, index) => (
								<Card
									key={`feature-${feature.title.toLowerCase().replace(/\s+/g, "-")}`}
									className="group hover:shadow-lg transition-all duration-200"
								>
									<CardContent className="p-6">
										<div className="flex items-start gap-4">
											<div className="p-3 rounded-lg bg-primary/10 text-primary">
												<feature.icon className="h-6 w-6" />
											</div>
											<div className="flex-1">
												<h3 className="text-lg font-semibold mb-2">
													{feature.title}
												</h3>
												<p className="text-muted-foreground mb-4">
													{feature.description}
												</p>
												<ul className="space-y-1">
													{feature.details.map((detail, detailIndex) => (
														<li
															key={`detail-${detailIndex}-${detail.substring(0, 20).replace(/\s+/g, "-")}`}
															className="flex items-center gap-2 text-sm text-muted-foreground"
														>
															<CheckCircle className="h-4 w-4 text-green-600" />
															<span>{detail}</span>
														</li>
													))}
												</ul>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</div>

					{/* Preparation Steps */}
					<div className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">
							Certification Preparation
						</h2>
						<p className="text-muted-foreground mb-8">
							We're actively preparing for security certifications by
							implementing industry best practices and controls.
						</p>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Card className="border-green-200 bg-green-50/50">
								<CardContent className="p-6">
									<div className="flex items-start gap-4">
										<div className="p-2 rounded-lg bg-green-100 text-green-600">
											<CheckCircle className="h-5 w-5" />
										</div>
										<div>
											<h3 className="font-semibold mb-2">
												Security Policies & Procedures
											</h3>
											<p className="text-sm text-muted-foreground mb-3">
												Comprehensive security documentation and incident
												response procedures.
											</p>
											<Badge variant="outline" className="text-green-600">
												Completed
											</Badge>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="border-blue-200 bg-blue-50/50">
								<CardContent className="p-6">
									<div className="flex items-start gap-4">
										<div className="p-2 rounded-lg bg-blue-100 text-blue-600">
											<Clock className="h-5 w-5" />
										</div>
										<div>
											<h3 className="font-semibold mb-2">
												Security Training Program
											</h3>
											<p className="text-sm text-muted-foreground mb-3">
												Regular security awareness training for all team
												members.
											</p>
											<Badge variant="outline" className="text-blue-600">
												In Progress
											</Badge>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="border-purple-200 bg-purple-50/50">
								<CardContent className="p-6">
									<div className="flex items-start gap-4">
										<div className="p-2 rounded-lg bg-purple-100 text-purple-600">
											<Shield className="h-5 w-5" />
										</div>
										<div>
											<h3 className="font-semibold mb-2">
												Vulnerability Assessments
											</h3>
											<p className="text-sm text-muted-foreground mb-3">
												Regular security scans and penetration testing.
											</p>
											<Badge variant="outline" className="text-purple-600">
												Planned Q4 2025
											</Badge>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="border-orange-200 bg-orange-50/50">
								<CardContent className="p-6">
									<div className="flex items-start gap-4">
										<div className="p-2 rounded-lg bg-orange-100 text-orange-600">
											<FileText className="h-5 w-5" />
										</div>
										<div>
											<h3 className="font-semibold mb-2">
												Audit Trail Implementation
											</h3>
											<p className="text-sm text-muted-foreground mb-3">
												Comprehensive logging and monitoring of all system
												activities.
											</p>
											<Badge variant="outline" className="text-orange-600">
												In Development
											</Badge>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>

					{/* Compliance */}
					<div className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">
							Compliance & Controls
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{complianceItems.map((item, index) => (
								<Card
									key={`compliance-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
									className="group hover:shadow-md transition-all duration-200"
								>
									<CardContent className="p-6">
										<div className="flex items-start gap-4">
											<div className="p-2 rounded-lg bg-primary/10 text-primary">
												<item.icon className="h-5 w-5" />
											</div>
											<div className="flex-1">
												<div className="flex items-center justify-between mb-2">
													<h3 className="font-semibold">{item.title}</h3>
													<Badge variant="outline" className="text-green-600">
														{item.status}
													</Badge>
												</div>
												<p className="text-muted-foreground text-sm">
													{item.description}
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</div>

					{/* Security Reports */}
					<div className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">
							Security Reports & Documentation
						</h2>
						<div className="space-y-4">
							{securityReports.map((report, index) => (
								<Card
									key={`report-${report.title.toLowerCase().replace(/\s+/g, "-")}`}
									className="group hover:shadow-md transition-all duration-200"
								>
									<CardContent className="p-6">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-4">
												<div className="p-2 rounded-lg bg-primary/10 text-primary">
													<report.icon className="h-5 w-5" />
												</div>
												<div>
													<h3 className="font-semibold mb-1">{report.title}</h3>
													<p className="text-sm text-muted-foreground mb-2">
														{report.description}
													</p>
													<div className="flex items-center gap-4 text-xs text-muted-foreground">
														<span>Updated: {report.date}</span>
														<span>Size: {report.size}</span>
													</div>
												</div>
											</div>
											<div className="flex items-center gap-2">
												<Button variant="outline" size="sm">
													<Download className="h-4 w-4 mr-2" />
													Download
												</Button>
												<Button variant="ghost" size="sm">
													<ExternalLink className="h-4 w-4" />
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</div>

					{/* FAQ Section */}
					<div className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">Security FAQ</h2>
						<div className="space-y-4">
							{faqItems.map((item, index) => (
								<Card
									key={`faq-${item.question.toLowerCase().replace(/\s+/g, "-").substring(0, 30)}`}
									className="overflow-hidden"
								>
									<button
										type="button"
										className="w-full p-6 text-left hover:bg-muted/50 transition-colors"
										onClick={() => setOpenFaq(openFaq === index ? null : index)}
									>
										<div className="flex items-center justify-between">
											<h3 className="font-semibold text-lg">{item.question}</h3>
											{openFaq === index ? (
												<ChevronDown className="h-5 w-5 text-muted-foreground rotate-180" />
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

					{/* Contact Security Team */}
					<Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
						<CardContent className="p-8 text-center">
							<div className="max-w-2xl mx-auto">
								<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
									<Shield className="h-8 w-8 text-primary" />
								</div>
								<h3 className="text-2xl font-semibold mb-4">
									Security Questions?
								</h3>
								<p className="text-muted-foreground mb-6">
									Our security team is available to answer any questions about
									our security practices, compliance, or data protection
									measures.
								</p>
								<div className="flex flex-col sm:flex-row gap-4 justify-center">
									<Button asChild>
										<Link href="mailto:security@financbase.com">
											<Mail className="h-4 w-4 mr-2" />
											security@financbase.com
										</Link>
									</Button>
									<Button variant="outline" asChild>
										<Link href="/contact">
											<Phone className="h-4 w-4 mr-2" />
											Contact Support
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
