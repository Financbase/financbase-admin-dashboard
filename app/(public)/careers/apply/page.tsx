/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	ArrowLeft,
	Upload,
	FileText,
	CheckCircle,
	AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { getJobById } from "../jobs-data";
import { PublicHero } from "@/components/layout/public-hero";

export default function CareerApplyPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const jobId = searchParams.get("job")
		? parseInt(searchParams.get("job") as string, 10)
		: null;
	const job = jobId ? getJobById(jobId) : null;

	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		linkedin: "",
		portfolio: "",
		coverLetter: "",
		resume: null as File | null,
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">(
		"idle"
	);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setFormData((prev) => ({ ...prev, resume: file }));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setSubmitStatus("idle");

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1500));
			setSubmitStatus("success");
			// Reset form after successful submission
			setTimeout(() => {
				setFormData({
					firstName: "",
					lastName: "",
					email: "",
					phone: "",
					linkedin: "",
					portfolio: "",
					coverLetter: "",
					resume: null,
				});
				setSubmitStatus("idle");
			}, 3000);
		} catch (error) {
			setSubmitStatus("error");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<PublicHero
				title={job ? `Apply for ${job.title}` : "Apply for a Position"}
				subtitle="Join Our Team"
				description={
					job
						? `${job.department} • ${job.location} • ${job.type}`
						: "We're always looking for talented individuals to join our team"
				}
				size="lg"
			/>

			<div className="container mx-auto px-4 py-16">
				<div className="max-w-3xl mx-auto">
					{/* Back Button */}
					<Button variant="ghost" asChild className="mb-8">
						<Link href={job ? `/careers/${job.id}` : "/careers"}>
							<ArrowLeft className="mr-2 h-4 w-4" />
							{job ? "Back to Job Details" : "Back to Careers"}
						</Link>
					</Button>

					{/* Application Form */}
					<Card>
						<CardHeader>
							<CardTitle>Application Form</CardTitle>
							<CardDescription>
								Please fill out the form below to apply for this position. All
								fields marked with * are required.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-6">
								{/* Personal Information */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold">Personal Information</h3>
									<div className="grid md:grid-cols-2 gap-4">
										<div>
											<Label htmlFor="firstName">
												First Name <span className="text-destructive">*</span>
											</Label>
											<Input
												id="firstName"
												name="firstName"
												required
												value={formData.firstName}
												onChange={handleInputChange}
												placeholder="John"
											/>
										</div>
										<div>
											<Label htmlFor="lastName">
												Last Name <span className="text-destructive">*</span>
											</Label>
											<Input
												id="lastName"
												name="lastName"
												required
												value={formData.lastName}
												onChange={handleInputChange}
												placeholder="Doe"
											/>
										</div>
									</div>
									<div>
										<Label htmlFor="email">
											Email Address <span className="text-destructive">*</span>
										</Label>
										<Input
											id="email"
											name="email"
											type="email"
											required
											value={formData.email}
											onChange={handleInputChange}
											placeholder="john.doe@example.com"
										/>
									</div>
									<div>
										<Label htmlFor="phone">
											Phone Number <span className="text-destructive">*</span>
										</Label>
										<Input
											id="phone"
											name="phone"
											type="tel"
											required
											value={formData.phone}
											onChange={handleInputChange}
											placeholder="+1 (555) 123-4567"
										/>
									</div>
								</div>

								{/* Professional Links */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold">Professional Links</h3>
									<div>
										<Label htmlFor="linkedin">LinkedIn Profile</Label>
										<Input
											id="linkedin"
											name="linkedin"
											type="url"
											value={formData.linkedin}
											onChange={handleInputChange}
											placeholder="https://linkedin.com/in/yourprofile"
										/>
									</div>
									<div>
										<Label htmlFor="portfolio">Portfolio / Website</Label>
										<Input
											id="portfolio"
											name="portfolio"
											type="url"
											value={formData.portfolio}
											onChange={handleInputChange}
											placeholder="https://yourportfolio.com"
										/>
									</div>
								</div>

								{/* Resume Upload */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold">Resume</h3>
									<div>
										<Label htmlFor="resume">
											Resume (PDF, DOC, DOCX){" "}
											<span className="text-destructive">*</span>
										</Label>
										<div className="mt-2">
											<Input
												id="resume"
												name="resume"
												type="file"
												accept=".pdf,.doc,.docx"
												required
												onChange={handleFileChange}
												className="cursor-pointer"
											/>
											{formData.resume && (
												<div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
													<FileText className="h-4 w-4" />
													<span>{formData.resume.name}</span>
													<span className="text-xs">
														({(formData.resume.size / 1024 / 1024).toFixed(2)} MB)
													</span>
												</div>
											)}
										</div>
									</div>
								</div>

								{/* Cover Letter */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold">Cover Letter</h3>
									<div>
										<Label htmlFor="coverLetter">
											Why are you interested in this position?{" "}
											<span className="text-destructive">*</span>
										</Label>
										<Textarea
											id="coverLetter"
											name="coverLetter"
											required
											value={formData.coverLetter}
											onChange={handleInputChange}
											placeholder="Tell us why you're interested in this role and what makes you a great fit..."
											rows={6}
											className="resize-none"
										/>
										<p className="text-xs text-muted-foreground mt-1">
											Minimum 100 characters
										</p>
									</div>
								</div>

								{/* Submit Status */}
								{submitStatus === "success" && (
									<div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
										<CheckCircle className="h-5 w-5 text-green-600" />
										<p className="text-sm text-green-800 dark:text-green-200">
											Application submitted successfully! We'll review your
											application and get back to you soon.
										</p>
									</div>
								)}

								{submitStatus === "error" && (
									<div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
										<AlertCircle className="h-5 w-5 text-red-600" />
										<p className="text-sm text-red-800 dark:text-red-200">
											There was an error submitting your application. Please try
											again.
										</p>
									</div>
								)}

								{/* Submit Button */}
								<div className="flex gap-4">
									<Button
										type="submit"
										size="lg"
										disabled={isSubmitting}
										className="flex-1"
									>
										{isSubmitting ? (
											<>
												<span className="mr-2">Submitting...</span>
											</>
										) : (
											<>
												Submit Application
												<Upload className="ml-2 h-4 w-4" />
											</>
										)}
									</Button>
									<Button
										type="button"
										variant="outline"
										size="lg"
										asChild
									>
										<Link href="/careers">Cancel</Link>
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>

					{/* Additional Info */}
					<Card className="mt-8">
						<CardContent className="p-6">
							<h3 className="text-lg font-semibold mb-4">
								What Happens Next?
							</h3>
							<ul className="space-y-3 text-sm text-muted-foreground">
								<li className="flex items-start gap-2">
									<CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
									<span>
										We'll review your application within 2-3 business days
									</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
									<span>
										If selected, we'll contact you to schedule an interview
									</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
									<span>
										Our hiring process typically takes 2-3 weeks from application
										to offer
									</span>
								</li>
							</ul>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

