"use client";

import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	ArrowLeft,
	MapPin,
	Clock,
	Users,
	CheckCircle,
	Calendar,
	ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { getJobById } from "../jobs-data";
import { PublicHero } from "@/components/layout/public-hero";
import { notFound } from "next/navigation";

export default function CareerDetailPage() {
	const params = useParams();
	const router = useRouter();
	const jobId = params?.id ? parseInt(params.id as string, 10) : null;
	const job = jobId ? getJobById(jobId) : null;

	if (!job) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<Card className="max-w-md">
					<CardContent className="p-8 text-center">
						<h2 className="text-2xl font-semibold mb-4">Job Not Found</h2>
						<p className="text-muted-foreground mb-6">
							The job posting you're looking for doesn't exist or has been removed.
						</p>
						<Button asChild>
							<Link href="/careers">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Careers
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<PublicHero
				title={job.title}
				subtitle={job.department}
				description={`${job.location} • ${job.type} • ${job.experience}`}
				size="lg"
			/>

			<div className="container mx-auto px-4 py-16">
				<div className="max-w-4xl mx-auto">
					{/* Back Button */}
					<Button variant="ghost" asChild className="mb-8">
						<Link href="/careers">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to All Positions
						</Link>
					</Button>

					<div className="grid lg:grid-cols-3 gap-8">
						{/* Main Content */}
						<div className="lg:col-span-2 space-y-8">
							{/* Job Overview */}
							<Card>
								<CardHeader>
									<div className="flex items-start justify-between">
										<div>
											<CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
											<div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
												<div className="flex items-center gap-1">
													<MapPin className="h-4 w-4" />
													<span>{job.location}</span>
												</div>
												<div className="flex items-center gap-1">
													<Clock className="h-4 w-4" />
													<span>{job.type}</span>
												</div>
												<div className="flex items-center gap-1">
													<Users className="h-4 w-4" />
													<span>{job.experience}</span>
												</div>
												<div className="flex items-center gap-1">
													<Calendar className="h-4 w-4" />
													<span>Posted {job.posted}</span>
												</div>
											</div>
										</div>
										{job.featured && (
											<Badge variant="default">Featured</Badge>
										)}
									</div>
								</CardHeader>
								<CardContent className="space-y-6">
									{/* Description */}
									<div>
										<h3 className="text-xl font-semibold mb-3">About the Role</h3>
										<p className="text-muted-foreground leading-relaxed">
											{job.fullDescription || job.description}
										</p>
									</div>

									{/* Responsibilities */}
									{job.responsibilities && job.responsibilities.length > 0 && (
										<div>
											<h3 className="text-xl font-semibold mb-3">
												Key Responsibilities
											</h3>
											<ul className="space-y-2">
												{job.responsibilities.map((responsibility, index) => (
													<li
														key={index}
														className="flex items-start gap-2 text-muted-foreground"
													>
														<CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
														<span>{responsibility}</span>
													</li>
												))}
											</ul>
										</div>
									)}

									{/* Qualifications */}
									{job.qualifications && job.qualifications.length > 0 && (
										<div>
											<h3 className="text-xl font-semibold mb-3">
												Qualifications
											</h3>
											<ul className="space-y-2">
												{job.qualifications.map((qualification, index) => (
													<li
														key={index}
														className="flex items-start gap-2 text-muted-foreground"
													>
														<CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
														<span>{qualification}</span>
													</li>
												))}
											</ul>
										</div>
									)}

									{/* Requirements */}
									<div>
										<h3 className="text-xl font-semibold mb-3">
											Required Skills
										</h3>
										<div className="flex flex-wrap gap-2">
											{job.requirements.map((req, index) => (
												<Badge key={index} variant="outline">
													{req}
												</Badge>
											))}
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Sidebar */}
						<div className="lg:col-span-1 space-y-6">
							{/* Apply Card */}
							<Card className="sticky top-8">
								<CardHeader>
									<CardTitle>Apply for this Position</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									{job.salary && (
										<div>
											<p className="text-sm text-muted-foreground">Salary Range</p>
											<p className="text-lg font-semibold">{job.salary}</p>
										</div>
									)}
									<div>
										<p className="text-sm text-muted-foreground">Applicants</p>
										<p className="text-lg font-semibold">
											{job.applicants} applicants
										</p>
									</div>
									<Button asChild className="w-full" size="lg">
										<Link href={`/careers/apply?job=${job.id}`}>
											Apply Now
											<ArrowRight className="ml-2 h-4 w-4" />
										</Link>
									</Button>
									<Button variant="outline" asChild className="w-full">
										<Link href="/careers">View All Positions</Link>
									</Button>
								</CardContent>
							</Card>

							{/* Benefits Card */}
							{job.benefits && job.benefits.length > 0 && (
								<Card>
									<CardHeader>
										<CardTitle>Benefits</CardTitle>
									</CardHeader>
									<CardContent>
										<ul className="space-y-2">
											{job.benefits.map((benefit, index) => (
												<li
													key={index}
													className="flex items-start gap-2 text-sm text-muted-foreground"
												>
													<CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
													<span>{benefit}</span>
												</li>
											))}
										</ul>
									</CardContent>
								</Card>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

