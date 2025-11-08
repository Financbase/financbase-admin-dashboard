/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { PublicPageTemplate } from "@/components/layout/public-templates";
import { PublicSection, PublicCard, PublicGrid } from "@/components/layout/public-section";
import { PublicForm, PublicFormField } from "@/components/layout/public-form";
import {
	Briefcase,
	Lightbulb,
	Target,
	TrendingUp,
	CheckCircle2,
	ArrowRight,
	Users,
	BookOpen,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ConsultingFormData {
	name: string;
	email: string;
	company: string;
	phone: string;
	service: string;
	message: string;
}

export default function ConsultingPage() {
	const [formData, setFormData] = useState<ConsultingFormData>({
		name: "",
		email: "",
		company: "",
		phone: "",
		service: "",
		message: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitMessage, setSubmitMessage] = useState("");
	const [errors, setErrors] = useState<Partial<ConsultingFormData>>({});

	const validateForm = (): boolean => {
		const newErrors: Partial<ConsultingFormData> = {};

		if (!formData.name.trim()) newErrors.name = "Name is required";
		if (!formData.email.trim()) newErrors.email = "Email is required";
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = "Please enter a valid email address";
		}
		if (!formData.message.trim()) newErrors.message = "Message is required";

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (formDataObj: Record<string, string>) => {
		const data = {
			...formDataObj,
			website: formDataObj.website || '', // Honeypot
		} as ConsultingFormData & { website: string };

		setFormData({
			name: data.name || formData.name,
			email: data.email || formData.email,
			company: data.company || formData.company,
			phone: data.phone || formData.phone,
			service: data.service || formData.service,
			message: data.message || formData.message,
		});

		if (!validateForm()) return;

		setIsSubmitting(true);
		setSubmitMessage("");

		try {
			// Prepare metadata for consulting-specific fields
			const metadata: Record<string, string> = {
				type: 'consulting',
			};
			
			if (data.service) {
				metadata.service = data.service;
			}
			if (data.phone) {
				metadata.phone = data.phone;
			}

			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: data.name,
					email: data.email,
					company: data.company,
					message: data.message,
					website: data.website,
					source: 'consulting_page',
					metadata: metadata,
				}),
			});

			const result = await response.json();

			if (response.ok) {
				setSubmitMessage("✅ Thank you! Our consulting team will contact you within 24 hours.");
				setFormData({
					name: "",
					email: "",
					company: "",
					phone: "",
					service: "",
					message: "",
				});
			} else {
				setSubmitMessage(`❌ ${result.error || 'Something went wrong. Please try again.'}`);
			}
		} catch (error) {
			console.error('Consulting form error:', error);
			setSubmitMessage("❌ Something went wrong. Please contact consulting@financbase.com directly.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const services = [
		{
			icon: <Target className="w-8 h-8" />,
			title: "Financial Strategy Consulting",
			description: "Develop comprehensive financial strategies aligned with your business goals and growth plans.",
		},
		{
			icon: <TrendingUp className="w-8 h-8" />,
			title: "Implementation & Migration",
			description: "Expert guidance for migrating from legacy systems and implementing Financbase across your organization.",
		},
		{
			icon: <Lightbulb className="w-8 h-8" />,
			title: "Process Optimization",
			description: "Streamline your financial workflows, automate repetitive tasks, and optimize your financial operations.",
		},
		{
			icon: <BookOpen className="w-8 h-8" />,
			title: "Training & Education",
			description: "Comprehensive training programs for your team to maximize the value of Financbase.",
		},
		{
			icon: <Users className="w-8 h-8" />,
			title: "Custom Integration",
			description: "Integrate Financbase with your existing systems and build custom workflows tailored to your needs.",
		},
		{
			icon: <Briefcase className="w-8 h-8" />,
			title: "Ongoing Support",
			description: "Dedicated consulting support to help you continuously improve your financial operations.",
		},
	];

	const benefits = [
		"Expert guidance from financial technology specialists",
		"Faster implementation and time-to-value",
		"Customized solutions for your unique needs",
		"Best practices from industry leaders",
		"Reduced risk with expert oversight",
		"Ongoing support and optimization",
	];

	return (
		<PublicPageTemplate
			hero={{
				title: "Consulting Services",
				description: "Get expert guidance to maximize the value of Financbase. Our consulting team helps you implement, optimize, and scale your financial operations.",
				primaryAction: {
					text: "Contact Consulting Team",
					href: "#contact",
				},
				secondaryAction: {
					text: "View Services",
					href: "#services",
				},
			}}
			cta={{
				title: "Ready to Optimize Your Financial Operations?",
				description: "Contact our consulting team to discuss how we can help you achieve your financial goals.",
				primaryAction: {
					text: "Get Started",
					href: "#contact",
				},
				secondaryAction: {
					text: "Learn More",
					href: "/about",
				},
			}}
		>
			{/* Services Section */}
			<PublicSection
				id="services"
				title="Our Consulting Services"
				description="Comprehensive consulting services to help you succeed with Financbase"
			>
				<PublicGrid columns={3}>
					{services.map((service) => (
						<PublicCard key={service.title} className="h-full">
							<div className="flex flex-col h-full">
								<div className="w-16 h-16 mb-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
									{service.icon}
								</div>
								<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
									{service.title}
								</h3>
								<p className="text-gray-600 dark:text-gray-400 flex-grow">
									{service.description}
								</p>
							</div>
						</PublicCard>
					))}
				</PublicGrid>
			</PublicSection>

			{/* Benefits Section */}
			<PublicSection
				title="Why Choose Our Consulting Services"
				description="Partner with experts who understand both finance and technology"
				background="muted"
			>
				<PublicGrid columns={2}>
					{benefits.map((benefit, index) => (
						<PublicCard key={index}>
							<div className="flex items-start space-x-3">
								<CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
								<p className="text-gray-700 dark:text-gray-300 font-medium">
									{benefit}
								</p>
							</div>
						</PublicCard>
					))}
				</PublicGrid>
			</PublicSection>

			{/* Contact Form Section */}
			<PublicSection id="contact" title="Get Started with Consulting">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
					<div>
						<h2 className="text-3xl font-bold mb-6">Request a Consultation</h2>
						<p className="text-gray-600 dark:text-gray-400 mb-8">
							Fill out the form and our consulting team will contact you to discuss your needs and how we can help.
						</p>
						<PublicCard>
							{submitMessage && (
								<div className={`mb-6 p-4 rounded-lg border ${
									submitMessage.includes('✅')
										? 'bg-green-50 border-green-200 text-green-800'
										: 'bg-red-50 border-red-200 text-red-800'
								}`}>
									{submitMessage}
								</div>
							)}

							<PublicForm onSubmit={handleSubmit} isLoading={isSubmitting}>
								<input
									type="text"
									name="website"
									tabIndex={-1}
									autoComplete="off"
									style={{ position: 'absolute', left: '-9999px' }}
									aria-hidden="true"
								/>
								
								<PublicFormField
									label="Full Name"
									name="name"
									placeholder="John Doe"
									required
									error={errors.name}
								/>
								
								<PublicFormField
									label="Email Address"
									name="email"
									type="email"
									placeholder="john@company.com"
									required
									error={errors.email}
								/>

								<PublicFormField
									label="Company Name"
									name="company"
									placeholder="Your Company Inc."
								/>

								<PublicFormField
									label="Phone Number"
									name="phone"
									type="tel"
									placeholder="+1 (555) 123-4567"
								/>

								<PublicFormField
									label="Service of Interest"
									name="service"
									placeholder="e.g., Implementation, Training, Process Optimization"
								/>

								<PublicFormField
									label="Tell us about your needs"
									name="message"
									type="textarea"
									placeholder="What challenges are you facing? How can we help?"
									required
									error={errors.message}
								/>
							</PublicForm>
						</PublicCard>
					</div>

					<div>
						<h2 className="text-3xl font-bold mb-6">Other Ways to Reach Us</h2>
						<PublicGrid columns={1} gap="lg">
							<PublicCard>
								<div className="flex items-start space-x-4">
									<Briefcase className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
									<div>
										<h3 className="font-semibold mb-2">Consulting Team</h3>
										<p className="text-gray-600 dark:text-gray-400 mb-2">
											Email: <a href="mailto:consulting@financbase.com" className="text-primary hover:underline">consulting@financbase.com</a>
										</p>
										<p className="text-gray-600 dark:text-gray-400">
											Phone: <a href="tel:+15551234567" className="text-primary hover:underline">+1 (555) 123-4567</a>
										</p>
									</div>
								</div>
							</PublicCard>

							<PublicCard>
								<div className="flex items-start space-x-4">
									<Lightbulb className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
									<div>
										<h3 className="font-semibold mb-2">Learn More</h3>
										<p className="text-gray-600 dark:text-gray-400 mb-4">
											Explore our documentation and training materials to get started.
										</p>
										<Link href="/training">
											<Button variant="outline" className="w-full">
												View Training Materials
												<ArrowRight className="w-4 h-4 ml-2" />
											</Button>
										</Link>
									</div>
								</div>
							</PublicCard>

							<PublicCard>
								<div className="flex items-start space-x-4">
									<BookOpen className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
									<div>
										<h3 className="font-semibold mb-2">Documentation</h3>
										<p className="text-gray-600 dark:text-gray-400 mb-4">
											Access our comprehensive documentation and guides.
										</p>
										<Link href="/docs">
											<Button variant="outline" className="w-full">
												Browse Documentation
												<ArrowRight className="w-4 h-4 ml-2" />
											</Button>
										</Link>
									</div>
								</div>
							</PublicCard>
						</PublicGrid>
					</div>
				</div>
			</PublicSection>
		</PublicPageTemplate>
	);
}

