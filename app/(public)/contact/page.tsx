"use client";

import { SupportWidget } from "@/components/shared/support-widget";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EducationalTooltip } from "@/components/ui/educational-tooltip";
import { FeedbackWidget } from "@/components/ui/feedback-widget";
import { ProfileCard } from "@/components/ui/flexible-profile-card";
import { AnimatePresence, motion } from "framer-motion";
import {
	ArrowLeft,
	ArrowRight,
	Briefcase,
	Building,
	Building2,
	Calendar,
	Check,
	CheckCircle,
	Clock,
	Copy,
	Globe,
	Headphones,
	HelpCircle,
	Key,
	Mail,
	MapPin,
	MessageCircle,
	MessageSquare,
	Phone,
	Send,
	Shield,
	Sparkles,
	User,
	UserCog,
	Users,
	XCircle,
	Zap,
} from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		company: "",
		message: "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [copiedItem, setCopiedItem] = useState<string | null>(null);

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

	const contactMethods = [
		{
			icon: <Mail className="w-6 h-6" />,
			title: "Email Us",
			description: "Get in touch via email",
			value: "hello@financbase.com",
			link: "mailto:hello@financbase.com",
			gradient: "from-blue-500/20 to-cyan-500/20",
			hoverColor: "blue",
		},
		{
			icon: <Phone className="w-6 h-6" />,
			title: "Call Us",
			description: "Speak directly with our team",
			value: "+1 (555) 123-4567",
			link: "tel:+15551234567",
			gradient: "from-green-500/20 to-emerald-500/20",
			hoverColor: "green",
		},
		{
			icon: <MapPin className="w-6 h-6" />,
			title: "Visit Us",
			description: "Our headquarters",
			value: "San Francisco, CA",
			link: "#",
			gradient: "from-purple-500/20 to-pink-500/20",
			hoverColor: "purple",
		},
	];

	const companyStats = [
		{ label: "Response Time", value: "< 2 hours", icon: Clock },
		{ label: "Global Clients", value: "500+", icon: Globe },
		{ label: "Security Level", value: "SOC 2", icon: Shield },
		{ label: "Success Rate", value: "99.9%", icon: Zap },
	];

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) {
			newErrors.name = "Name is required";
		}

		if (!formData.email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = "Please enter a valid email";
		}

		if (!formData.message.trim()) {
			newErrors.message = "Message is required";
		} else if (formData.message.trim().length < 10) {
			newErrors.message = "Message must be at least 10 characters";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateForm()) return;

		setIsSubmitting(true);
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 2000));
		setIsSubmitting(false);
		setIsSubmitted(true);
	};

	const handleCopy = async (text: string, item: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopiedItem(item);
			setTimeout(() => setCopiedItem(null), 2000);
		} catch (err) {
			console.error("Failed to copy text: ", err);
		}
	};

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
							CONTACT US
						</motion.span>
						<h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
							Get in <span className="text-blue-600">Touch</span>
						</h1>
						<motion.div
							className="w-24 h-1 bg-blue-600 mx-auto"
							initial={{ width: 0 }}
							animate={{ width: 96 }}
							transition={{ duration: 1, delay: 0.5 }}
						/>
						<p className="text-xl text-gray-600 dark:text-gray-300 mt-8 max-w-3xl mx-auto">
							Ready to transform your business with AI? Let's start a
							conversation about your goals and how we can help you achieve
							them.
						</p>
					</motion.div>

					{/* Stats Bar */}
					<motion.div
						className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
						variants={itemVariants}
					>
						{companyStats.map((stat, index) => (
							<motion.div
								key={index}
								className="text-center p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 group hover:bg-white dark:hover:bg-gray-800 transition-all"
								whileHover={{ scale: 1.05, y: -5 }}
								variants={itemVariants}
							>
								<motion.div
									className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center justify-center mx-auto mb-3"
									whileHover={{ rotateY: 180 }}
									transition={{ duration: 0.6 }}
								>
									<stat.icon className="w-6 h-6 text-blue-600" />
								</motion.div>
								<div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
									{stat.value}
								</div>
								<div className="text-gray-600 dark:text-gray-400 text-sm">
									{stat.label}
								</div>
							</motion.div>
						))}
					</motion.div>
				</div>
			</motion.section>

			<div className="max-w-6xl mx-auto px-6">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
					{/* Contact Form */}
					<motion.div
						className="space-y-8"
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						variants={containerVariants}
					>
						<motion.div variants={itemVariants}>
							<h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
								Send us a message
							</h3>
							<p className="text-gray-600 dark:text-gray-400 text-lg">
								Tell us about your project and we'll get back to you within 24
								hours.
							</p>
						</motion.div>

						<AnimatePresence mode="wait">
							{!isSubmitted ? (
								<motion.form
									key="form"
									onSubmit={handleSubmit}
									className="space-y-6"
									initial={{ opacity: 1 }}
									exit={{ opacity: 0, y: -20 }}
									transition={{ duration: 0.3 }}
									variants={itemVariants}
								>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="relative">
											<User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
											<input
												type="text"
												placeholder="Your Name"
												value={formData.name}
												onChange={(e) =>
													handleInputChange("name", e.target.value)
												}
												className={`w-full pl-10 pr-4 py-4 bg-white dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all ${
													errors.name
														? "border-red-500"
														: "border-gray-200 dark:border-gray-700"
												}`}
											/>
											{errors.name && (
												<motion.p
													initial={{ opacity: 0, y: -10 }}
													animate={{ opacity: 1, y: 0 }}
													className="text-red-500 text-sm mt-2"
												>
													{errors.name}
												</motion.p>
											)}
										</div>

										<div className="relative">
											<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
											<input
												type="email"
												placeholder="Email Address"
												value={formData.email}
												onChange={(e) =>
													handleInputChange("email", e.target.value)
												}
												className={`w-full pl-10 pr-4 py-4 bg-white dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all ${
													errors.email
														? "border-red-500"
														: "border-gray-200 dark:border-gray-700"
												}`}
											/>
											{errors.email && (
												<motion.p
													initial={{ opacity: 0, y: -10 }}
													animate={{ opacity: 1, y: 0 }}
													className="text-red-500 text-sm mt-2"
												>
													{errors.email}
												</motion.p>
											)}
										</div>
									</div>

									<div className="relative">
										<Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
										<input
											type="text"
											placeholder="Company (Optional)"
											value={formData.company}
											onChange={(e) =>
												handleInputChange("company", e.target.value)
											}
											className="w-full pl-10 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
										/>
									</div>

									<div className="relative">
										<MessageSquare className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
										<textarea
											placeholder="Tell us about your project..."
											rows={6}
											value={formData.message}
											onChange={(e) =>
												handleInputChange("message", e.target.value)
											}
											className={`w-full pl-10 pr-4 py-4 bg-white dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all resize-none ${
												errors.message
													? "border-red-500"
													: "border-gray-200 dark:border-gray-700"
											}`}
										/>
										{errors.message && (
											<motion.p
												initial={{ opacity: 0, y: -10 }}
												animate={{ opacity: 1, y: 0 }}
												className="text-red-500 text-sm mt-2"
											>
												{errors.message}
											</motion.p>
										)}
									</div>

									<motion.button
										type="submit"
										disabled={isSubmitting}
										className="w-full relative group overflow-hidden bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-xl transition-all disabled:opacity-50"
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
									>
										<motion.div
											className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
											initial={{ x: "-100%" }}
											whileHover={{ x: "100%" }}
											transition={{ duration: 0.5 }}
										/>
										<span className="relative flex items-center justify-center gap-2">
											{isSubmitting ? (
												<motion.div
													className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
													animate={{ rotate: 360 }}
													transition={{
														duration: 1,
														repeat: Number.POSITIVE_INFINITY,
														ease: "linear",
													}}
												/>
											) : (
												<>
													<Send className="h-5 w-5" />
													Send Message
													<ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
												</>
											)}
										</span>
									</motion.button>
								</motion.form>
							) : (
								<motion.div
									key="success"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									className="text-center py-12"
								>
									<motion.div
										className="w-20 h-20 rounded-full bg-green-500/20 border border-green-400/30 flex items-center justify-center mx-auto mb-6"
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
									>
										<CheckCircle className="w-10 h-10 text-green-500" />
									</motion.div>
									<h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
										Message Sent!
									</h3>
									<p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
										Thank you for reaching out. We'll get back to you within 24
										hours.
									</p>
									<motion.button
										onClick={() => {
											setIsSubmitted(false);
											setFormData({
												name: "",
												email: "",
												company: "",
												message: "",
											});
										}}
										className="px-6 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
									>
										Send Another Message
									</motion.button>
								</motion.div>
							)}
						</AnimatePresence>
					</motion.div>

					{/* Contact Methods */}
					<motion.div
						className="space-y-8"
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						variants={containerVariants}
					>
						<motion.div variants={itemVariants}>
							<h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
								Other ways to reach us
							</h3>
							<p className="text-gray-600 dark:text-gray-400 text-lg">
								Choose the method that works best for you.
							</p>
						</motion.div>

						{/* Company Profile Card */}
						<motion.div
							className="flex justify-center mb-8"
							variants={itemVariants}
						>
							<ProfileCard
								name="Financbase"
								title="AI-Powered Financial Intelligence"
								department="Financial Technology Company"
								contact={{
									email: "hello@financbase.com",
									phone: "+1 (555) 123-4567",
									location: "San Francisco, CA",
								}}
								variant="employee"
								bio="Transforming businesses with AI-powered financial intelligence solutions. We help companies make smarter financial decisions."
							/>
						</motion.div>

						<div className="space-y-6">
							{contactMethods.map((method, index) => (
								<motion.a
									key={index}
									href={method.link}
									className="block p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group"
									variants={itemVariants}
									whileHover={{ scale: 1.02, y: -2 }}
								>
									<div className="flex items-center gap-4">
										<motion.div
											className={`w-14 h-14 rounded-xl bg-gradient-to-br ${method.gradient} border border-gray-200 dark:border-gray-700 flex items-center justify-center`}
											whileHover={{ scale: 1.1, rotateY: 180 }}
											transition={{ duration: 0.6 }}
										>
											{method.icon}
										</motion.div>
										<div className="flex-1">
											<h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
												{method.title}
											</h4>
											<p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
												{method.description}
											</p>
											<div className="flex items-center gap-2">
												<p className="text-gray-900 dark:text-white font-medium">
													{method.value}
												</p>
												<Button
													variant="ghost"
													size="sm"
													onClick={(e) => {
														e.preventDefault();
														handleCopy(method.value, method.title);
													}}
													className="h-6 w-6 p-0"
												>
													{copiedItem === method.title ? (
														<Check className="w-3 h-3 text-green-500" />
													) : (
														<Copy className="w-3 h-3" />
													)}
												</Button>
											</div>
										</div>
										<ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-all" />
									</div>
								</motion.a>
							))}
						</div>

						{/* Additional Info */}
						<motion.div
							className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-800"
							variants={itemVariants}
						>
							<h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
								Quick Response Guarantee
							</h4>
							<p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
								We pride ourselves on rapid response times. All inquiries are
								typically answered within 2 hours during business hours, and
								we'll schedule a call within 24 hours to discuss your project in
								detail.
							</p>
						</motion.div>

						{/* Support Widget */}
						<motion.div variants={itemVariants}>
							<SupportWidget component="marketing" />
						</motion.div>
					</motion.div>
				</div>
			</div>

			{/* Enhanced Feedback and Support */}
			<div className="fixed bottom-4 right-4 z-50 space-y-4">
				<FeedbackWidget
					category="contact"
					placeholder="How was your contact experience?"
				/>
				<EducationalTooltip
					title="Contact Support"
					content="Our support team is available 24/7 to help with any questions or issues you may have."
					level="beginner"
				>
					<div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-green-700 transition-colors">
						<MessageSquare className="w-5 h-5" />
					</div>
				</EducationalTooltip>
			</div>
		</div>
	);
}
