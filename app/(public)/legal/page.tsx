"use client";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import {
	AlertTriangle,
	ArrowRight,
	BarChart3,
	Briefcase,
	Calendar,
	CheckCircle,
	Clock,
	Eye,
	FileText,
	Globe,
	HelpCircle,
	Info,
	Key,
	Lock,
	Mail,
	MapPin,
	Phone,
	Settings,
	Shield,
	Sparkles,
	Trash2,
	Users,
} from "lucide-react";

export default function LegalPage() {
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.2,
				delayChildren: 0.3,
			},
		},
	};

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: { duration: 0.6, ease: "easeOut" },
		},
	};

	const legalSections = [
		{
			title: "Privacy Policy",
			description: "How we collect, use, and protect your personal information",
			icon: <Shield className="w-6 h-6" />,
			lastUpdated: "December 15, 2024",
			content: [
				"Information Collection: We collect information you provide directly to us, such as when you create an account, use our services, or contact us.",
				"Data Usage: We use your information to provide, maintain, and improve our services, process transactions, and communicate with you.",
				"Data Protection: We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.",
				"Third-Party Services: We may use third-party services to help us operate our business, but we ensure they meet our privacy standards.",
				"Your Rights: You have the right to access, update, or delete your personal information. You can also opt out of certain communications from us.",
			],
		},
		{
			title: "Terms of Service",
			description: "The rules and guidelines for using our platform",
			icon: <FileText className="w-6 h-6" />,
			lastUpdated: "December 15, 2024",
			content: [
				"Acceptance of Terms: By accessing or using our services, you agree to be bound by these terms and conditions.",
				"User Responsibilities: You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.",
				"Prohibited Uses: You may not use our services for any unlawful purpose or to solicit others to perform unlawful acts.",
				"Service Availability: We strive to maintain high service availability, but we do not guarantee uninterrupted access to our services.",
				"Termination: We reserve the right to terminate or suspend your account at any time for violation of these terms.",
			],
		},
		{
			title: "Cookie Policy",
			description: "How we use cookies and similar technologies",
			icon: <Lock className="w-6 h-6" />,
			lastUpdated: "December 15, 2024",
			content: [
				"What are Cookies: Cookies are small text files that are placed on your device when you visit our website.",
				"Types of Cookies: We use essential cookies, performance cookies, and marketing cookies to enhance your experience.",
				"Cookie Management: You can control and delete cookies through your browser settings, though this may affect website functionality.",
				"Third-Party Cookies: Some cookies are set by third-party services we use, such as analytics providers.",
				"Updates: We may update this cookie policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons.",
			],
		},
		{
			title: "Data Processing Agreement",
			description: "How we process data on behalf of our customers",
			icon: <Users className="w-6 h-6" />,
			lastUpdated: "December 15, 2024",
			content: [
				"Data Controller: You remain the data controller for any personal data you provide to us.",
				"Processing Purposes: We process data only for the purposes specified in our agreement with you.",
				"Data Security: We implement appropriate technical and organizational measures to ensure data security.",
				"Data Retention: We retain data only for as long as necessary to fulfill the purposes for which it was collected.",
				"Data Transfers: Any international data transfers are conducted in accordance with applicable data protection laws.",
			],
		},
	];

	const complianceFeatures = [
		{
			title: "GDPR Compliant",
			description: "Full compliance with European data protection regulations",
			icon: <CheckCircle className="w-5 h-5" />,
			status: "compliant",
		},
		{
			title: "SOC 2 Type II",
			description: "Certified security controls and processes",
			icon: <Shield className="w-5 h-5" />,
			status: "compliant",
		},
		{
			title: "ISO 27001",
			description: "Information security management system certified",
			icon: <Lock className="w-5 h-5" />,
			status: "compliant",
		},
		{
			title: "CCPA Compliant",
			description: "California Consumer Privacy Act compliance",
			icon: <Eye className="w-5 h-5" />,
			status: "compliant",
		},
	];

	const contactInfo = [
		{
			icon: <Mail className="w-5 h-5" />,
			label: "Email",
			value: "legal@financbase.com",
			description: "For legal inquiries and data requests",
		},
		{
			icon: <Phone className="w-5 h-5" />,
			label: "Phone",
			value: "+1 (555) 123-4567",
			description: "Legal department direct line",
		},
		{
			icon: <MapPin className="w-5 h-5" />,
			label: "Address",
			value: "123 Financial Street, San Francisco, CA 94105",
			description: "Our headquarters location",
		},
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
			{/* Hero Section */}
			<motion.section
				className="py-20 md:py-32"
				initial="hidden"
				animate="visible"
				variants={containerVariants}
			>
				<div className="max-w-6xl mx-auto px-6">
					<motion.div className="text-center mb-16" variants={itemVariants}>
						<motion.span
							className="text-blue-600 font-medium mb-4 flex items-center justify-center gap-2"
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
						>
							<Sparkles className="w-4 h-4" />
							LEGAL INFORMATION
						</motion.span>
						<h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
							Legal <span className="text-blue-600">Compliance</span>
						</h1>
						<motion.div
							className="w-24 h-1 bg-blue-600 mx-auto"
							initial={{ width: 0 }}
							animate={{ width: 96 }}
							transition={{ duration: 1, delay: 0.5 }}
						/>
						<p className="text-xl text-gray-600 dark:text-gray-300 mt-8 max-w-3xl mx-auto">
							Transparent, compliant, and secure. Learn about our legal
							framework and how we protect your data.
						</p>
					</motion.div>
				</div>
			</motion.section>

			{/* Compliance Badges */}
			<motion.section
				className="py-20"
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true }}
				variants={containerVariants}
			>
				<div className="max-w-6xl mx-auto px-6">
					<motion.div className="text-center mb-16" variants={itemVariants}>
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
							Security & Compliance
						</h2>
						<p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
							We maintain the highest standards of security and compliance to
							protect your data.
						</p>
					</motion.div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{complianceFeatures.map((feature, index) => (
							<motion.div
								key={index}
								className="group"
								variants={itemVariants}
								whileHover={{ y: -5, transition: { duration: 0.2 } }}
							>
								<Card className="h-full p-6 hover:shadow-lg transition-all duration-300">
									<CardContent className="p-0">
										<div className="flex items-center gap-3 mb-4">
											<div className="text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
												{feature.icon}
											</div>
											<div>
												<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
													{feature.title}
												</h3>
												<Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
													{feature.status}
												</Badge>
											</div>
										</div>
										<p className="text-gray-600 dark:text-gray-400 text-sm">
											{feature.description}
										</p>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>
				</div>
			</motion.section>

			{/* Legal Documents */}
			<motion.section
				className="py-20 bg-white dark:bg-gray-900"
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true }}
				variants={containerVariants}
			>
				<div className="max-w-6xl mx-auto px-6">
					<motion.div className="text-center mb-16" variants={itemVariants}>
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
							Legal Documents
						</h2>
						<p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
							Comprehensive legal information about our services and data
							practices.
						</p>
					</motion.div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{legalSections.map((section, index) => (
							<motion.div
								key={index}
								className="group"
								variants={itemVariants}
								whileHover={{ y: -5, transition: { duration: 0.2 } }}
							>
								<Card className="h-full p-6 hover:shadow-lg transition-all duration-300">
									<CardHeader className="p-0 mb-6">
										<div className="flex items-center gap-3 mb-4">
											<div className="text-blue-600 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
												{section.icon}
											</div>
											<div>
												<CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
													{section.title}
												</CardTitle>
												<div className="flex items-center gap-2 mt-2">
													<Calendar className="w-4 h-4 text-gray-400" />
													<span className="text-sm text-gray-500 dark:text-gray-400">
														Last updated: {section.lastUpdated}
													</span>
												</div>
											</div>
										</div>
										<CardDescription className="text-gray-600 dark:text-gray-400">
											{section.description}
										</CardDescription>
									</CardHeader>
									<CardContent className="p-0">
										<ul className="space-y-3">
											{section.content.map((item, itemIndex) => (
												<li key={itemIndex} className="flex items-start gap-3">
													<div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
													<span className="text-sm text-gray-600 dark:text-gray-400">
														{item}
													</span>
												</li>
											))}
										</ul>
										<div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
											<button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm group">
												Read Full Document
												<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
											</button>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>
				</div>
			</motion.section>

			{/* Contact Information */}
			<motion.section
				className="py-20"
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true }}
				variants={containerVariants}
			>
				<div className="max-w-6xl mx-auto px-6">
					<motion.div className="text-center mb-16" variants={itemVariants}>
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
							Legal Contact Information
						</h2>
						<p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
							Need to reach our legal team? Here's how you can contact us for
							legal matters.
						</p>
					</motion.div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{contactInfo.map((info, index) => (
							<motion.div
								key={index}
								className="group"
								variants={itemVariants}
								whileHover={{ y: -5, transition: { duration: 0.2 } }}
							>
								<Card className="h-full p-6 hover:shadow-lg transition-all duration-300">
									<CardContent className="p-0">
										<div className="flex items-center gap-3 mb-4">
											<div className="text-blue-600 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
												{info.icon}
											</div>
											<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
												{info.label}
											</h3>
										</div>
										<p className="text-gray-900 dark:text-white font-medium mb-2">
											{info.value}
										</p>
										<p className="text-gray-600 dark:text-gray-400 text-sm">
											{info.description}
										</p>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>
				</div>
			</motion.section>

			{/* Important Notice */}
			<motion.section
				className="py-20 bg-blue-600"
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true }}
				variants={containerVariants}
			>
				<div className="max-w-4xl mx-auto px-6 text-center">
					<motion.div variants={itemVariants}>
						<div className="flex items-center justify-center gap-2 mb-6">
							<AlertTriangle className="w-6 h-6 text-blue-200" />
							<span className="text-blue-200 font-medium">
								IMPORTANT NOTICE
							</span>
						</div>
						<h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
							Legal Updates
						</h2>
						<p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
							We regularly update our legal documents to ensure compliance with
							evolving regulations. Please check this page periodically for the
							most current information.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium transition-colors"
							>
								Download Legal Documents
							</motion.button>
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="border border-white text-white hover:bg-white hover:text-blue-600 px-6 py-3 rounded-lg font-medium transition-colors"
							>
								Contact Legal Team
							</motion.button>
						</div>
					</motion.div>
				</div>
			</motion.section>
		</div>
	);
}
