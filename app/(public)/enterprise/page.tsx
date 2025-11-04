"use client";

import { PublicPageTemplate } from "@/components/layout/public-templates";
import { PublicSection, PublicCard, PublicGrid } from "@/components/layout/public-section";
import { PublicForm, PublicFormField } from "@/components/layout/public-form";
import {
	Building2,
	Shield,
	Users,
	Zap,
	BarChart3,
	Lock,
	Headphones,
	CheckCircle2,
	ArrowRight,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EnterpriseFormData {
	name: string;
	email: string;
	company: string;
	phone: string;
	employees: string;
	message: string;
}

export default function EnterprisePage() {
	const [formData, setFormData] = useState<EnterpriseFormData>({
		name: "",
		email: "",
		company: "",
		phone: "",
		employees: "",
		message: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitMessage, setSubmitMessage] = useState("");
	const [errors, setErrors] = useState<Partial<EnterpriseFormData>>({});

	const validateForm = (): boolean => {
		const newErrors: Partial<EnterpriseFormData> = {};

		if (!formData.name.trim()) newErrors.name = "Name is required";
		if (!formData.email.trim()) newErrors.email = "Email is required";
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = "Please enter a valid email address";
		}
		if (!formData.company.trim()) newErrors.company = "Company name is required";
		if (!formData.message.trim()) newErrors.message = "Message is required";

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (formDataObj: Record<string, string>) => {
		const data = {
			...formDataObj,
			website: formDataObj.website || '', // Honeypot
			type: 'enterprise', // Mark as enterprise inquiry
		};

		setFormData({
			name: data.name || formData.name,
			email: data.email || formData.email,
			company: data.company || formData.company,
			phone: data.phone || formData.phone,
			employees: data.employees || formData.employees,
			message: data.message || formData.message,
		});

		if (!validateForm()) return;

		setIsSubmitting(true);
		setSubmitMessage("");

		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: data.name,
					email: data.email,
					company: data.company,
					message: `Enterprise Inquiry\n\nPhone: ${data.phone || 'N/A'}\nEmployees: ${data.employees || 'N/A'}\n\nMessage: ${data.message}`,
					website: data.website,
				}),
			});

			const result = await response.json();

			if (response.ok) {
				setSubmitMessage("✅ Thank you! Our sales team will contact you within 24 hours.");
				setFormData({
					name: "",
					email: "",
					company: "",
					phone: "",
					employees: "",
					message: "",
				});
			} else {
				setSubmitMessage(`❌ ${result.error || 'Something went wrong. Please try again.'}`);
			}
		} catch (error) {
			console.error('Enterprise form error:', error);
			setSubmitMessage("❌ Something went wrong. Please contact sales@financbase.com directly.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const features = [
		{
			icon: <Shield className="w-8 h-8" />,
			title: "Enterprise Security",
			description: "SOC 2 compliant with advanced encryption, SSO, and dedicated security audits.",
		},
		{
			icon: <Users className="w-8 h-8" />,
			title: "Unlimited Users",
			description: "Scale your team without limits. Add unlimited users, departments, and locations.",
		},
		{
			icon: <BarChart3 className="w-8 h-8" />,
			title: "Advanced Analytics",
			description: "Custom dashboards, real-time reporting, and predictive financial insights powered by AI.",
		},
		{
			icon: <Lock className="w-8 h-8" />,
			title: "Dedicated Infrastructure",
			description: "Private cloud options, dedicated instances, and custom deployment configurations.",
		},
		{
			icon: <Headphones className="w-8 h-8" />,
			title: "24/7 Priority Support",
			description: "Dedicated account manager, priority support, and custom SLA guarantees.",
		},
		{
			icon: <Zap className="w-8 h-8" />,
			title: "Custom Integrations",
			description: "API access, webhooks, and custom integrations with your existing systems.",
		},
	];

	const benefits = [
		"Custom pricing based on your needs",
		"Dedicated account manager",
		"Priority feature requests",
		"Custom training and onboarding",
		"99.9% uptime SLA",
		"Advanced compliance and audit features",
		"White-label options",
		"Custom reporting and analytics",
	];

	return (
		<PublicPageTemplate
			hero={{
				title: "Enterprise Solutions",
				description: "Scale your financial operations with enterprise-grade features, dedicated support, and custom solutions designed for large organizations.",
				primaryAction: {
					text: "Contact Sales",
					href: "#contact",
				},
				secondaryAction: {
					text: "View Features",
					href: "#features",
				},
			}}
			cta={{
				title: "Ready to Transform Your Enterprise Financial Operations?",
				description: "Get in touch with our sales team to discuss custom enterprise solutions for your organization.",
				primaryAction: {
					text: "Contact Sales Team",
					href: "#contact",
				},
				secondaryAction: {
					text: "Schedule a Demo",
					href: "/contact",
				},
			}}
		>
			{/* Features Section */}
			<PublicSection
				id="features"
				title="Enterprise Features"
				description="Everything you need to manage finances at scale, with enterprise-grade security and support."
			>
				<PublicGrid columns={3}>
					{features.map((feature) => (
						<PublicCard key={feature.title} className="h-full">
							<div className="flex flex-col h-full">
								<div className="w-16 h-16 mb-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
									{feature.icon}
								</div>
								<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
									{feature.title}
								</h3>
								<p className="text-gray-600 dark:text-gray-400 flex-grow">
									{feature.description}
								</p>
							</div>
						</PublicCard>
					))}
				</PublicGrid>
			</PublicSection>

			{/* Benefits Section */}
			<PublicSection
				title="Enterprise Benefits"
				description="What you get with Financbase Enterprise"
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
			<PublicSection id="contact" title="Get Started with Enterprise">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
					<div>
						<h2 className="text-3xl font-bold mb-6">Request Enterprise Information</h2>
						<p className="text-gray-600 dark:text-gray-400 mb-8">
							Fill out the form and our sales team will contact you within 24 hours to discuss your enterprise needs.
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
									required
									error={errors.company}
								/>

								<PublicFormField
									label="Phone Number"
									name="phone"
									type="tel"
									placeholder="+1 (555) 123-4567"
								/>

								<PublicFormField
									label="Number of Employees"
									name="employees"
									placeholder="e.g., 500-1000"
								/>

								<PublicFormField
									label="Tell us about your needs"
									name="message"
									type="textarea"
									placeholder="What are you looking for in an enterprise solution?"
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
									<Building2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
									<div>
										<h3 className="font-semibold mb-2">Sales Team</h3>
										<p className="text-gray-600 dark:text-gray-400 mb-2">
											Email: <a href="mailto:sales@financbase.com" className="text-primary hover:underline">sales@financbase.com</a>
										</p>
										<p className="text-gray-600 dark:text-gray-400">
											Phone: <a href="tel:+15551234567" className="text-primary hover:underline">+1 (555) 123-4567</a>
										</p>
									</div>
								</div>
							</PublicCard>

							<PublicCard>
								<div className="flex items-start space-x-4">
									<Zap className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
									<div>
										<h3 className="font-semibold mb-2">Schedule a Demo</h3>
										<p className="text-gray-600 dark:text-gray-400 mb-4">
											See Financbase in action with a personalized demo tailored to your needs.
										</p>
										<Link href="/contact">
											<Button variant="outline" className="w-full">
												Schedule Demo
												<ArrowRight className="w-4 h-4 ml-2" />
											</Button>
										</Link>
									</div>
								</div>
							</PublicCard>

							<PublicCard>
								<div className="flex items-start space-x-4">
									<BarChart3 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
									<div>
										<h3 className="font-semibold mb-2">View Pricing</h3>
										<p className="text-gray-600 dark:text-gray-400 mb-4">
											See our standard pricing plans, or contact us for custom enterprise pricing.
										</p>
										<Link href="/pricing">
											<Button variant="outline" className="w-full">
												View Pricing
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

