"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	ArrowRight,
	Award,
	BarChart3,
	BookOpen,
	Building2,
	Calendar,
	CheckCircle,
	ChevronDown,
	Clock,
	Code,
	Coffee,
	DollarSign,
	Globe,
	Heart,
	Key,
	Laptop,
	Link2,
	MapPin,
	MessageCircle,
	Palette,
	PiggyBank,
	Puzzle,
	Search,
	Shield,
	Star,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { jobOpenings } from "./jobs-data";

export default function CareersPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedDepartment, setSelectedDepartment] = useState("All");

	const departments = [
		"All",
		"Engineering",
		"Design",
		"Product",
		"Sales",
		"Marketing",
		"Operations",
	];

	const companyValues = [
		{
			title: "Innovation First",
			description:
				"We encourage creative thinking and embrace new technologies to solve complex financial challenges.",
			icon: Zap,
			color: "bg-blue-500",
		},
		{
			title: "Customer Obsessed",
			description:
				"Every decision we make is guided by what's best for our customers and their financial success.",
			icon: Heart,
			color: "bg-red-500",
		},
		{
			title: "Transparency",
			description:
				"We believe in open communication, honest feedback, and building trust with our team and customers.",
			icon: Shield,
			color: "bg-green-500",
		},
		{
			title: "Growth Mindset",
			description:
				"We invest in our people's development and provide opportunities for continuous learning and advancement.",
			icon: TrendingUp,
			color: "bg-purple-500",
		},
	];

	const benefits = [
		{
			title: "Competitive Salary",
			icon: DollarSign,
			description: "Market-leading compensation packages",
		},
		{
			title: "Health Insurance",
			icon: Shield,
			description: "Comprehensive medical, dental, and vision coverage",
		},
		{
			title: "Flexible PTO",
			icon: Calendar,
			description: "Unlimited vacation days and flexible work arrangements",
		},
		{
			title: "Learning Budget",
			icon: BookOpen,
			description: "$2,000 annual budget for courses and conferences",
		},
		{
			title: "Stock Options",
			icon: TrendingUp,
			description: "Equity participation in our growing company",
		},
		{
			title: "Remote Work",
			icon: Laptop,
			description: "Work from anywhere with our distributed team",
		},
		{
			title: "Team Events",
			icon: Coffee,
			description: "Regular team building and social activities",
		},
		{
			title: "Career Growth",
			icon: Award,
			description: "Clear promotion paths and mentorship programs",
		},
	];

	const teamStats = [
		{ label: "Team Members", value: "150+" },
		{ label: "Countries", value: "12" },
		{ label: "Remote Workers", value: "85%" },
		{ label: "Employee Satisfaction", value: "4.8/5" },
	];

	const filteredJobs =
		selectedDepartment === "All"
			? jobOpenings
			: jobOpenings.filter((job) => job.department === selectedDepartment);

	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<div className="border-b bg-gradient-to-br from-background via-background to-muted/20">
				<div className="container mx-auto px-4 py-16">
					<div className="max-w-4xl mx-auto text-center">
						<div className="flex items-center justify-center gap-2 mb-4">
							<Users className="h-6 w-6 text-primary" />
							<Badge variant="secondary" className="text-sm font-medium">
								Join Our Team
							</Badge>
						</div>
						<h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
							Build the Future of{" "}
							<span className="text-primary">Financial Technology</span>
						</h1>
						<p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
							Join a team of passionate innovators working to democratize
							financial services and create meaningful impact.
						</p>

						{/* Search Bar */}
						<div className="relative max-w-2xl mx-auto">
							<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
							<Input
								type="text"
								placeholder="Search job openings..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-12 pr-4 py-3 text-lg"
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-16">
				<div className="max-w-6xl mx-auto">
					{/* Team Stats */}
					<div className="mb-16">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
							{teamStats.map((stat, index) => (
								<div key={index} className="text-center">
									<div className="text-3xl font-bold text-primary mb-2">
										{stat.value}
									</div>
									<div className="text-muted-foreground">{stat.label}</div>
								</div>
							))}
						</div>
					</div>

					{/* Department Filter */}
					<div className="mb-12">
						<h2 className="text-2xl font-semibold mb-6">Open Positions</h2>
						<div className="flex flex-wrap gap-2">
							{departments.map((department) => (
								<Button
									key={department}
									variant={
										selectedDepartment === department ? "default" : "outline"
									}
									size="sm"
									onClick={() => setSelectedDepartment(department)}
									className="transition-all duration-200"
								>
									{department}
								</Button>
							))}
						</div>
					</div>

					{/* Job Openings */}
					<div className="mb-16">
						<div className="space-y-6">
							{filteredJobs.map((job) => (
								<Card
									key={`job-${job.id}`}
									className={`group hover:shadow-lg transition-all duration-200 ${job.featured ? "border-primary/20 bg-primary/5" : ""}`}
								>
									<CardContent className="p-6">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<div className="flex items-center gap-3 mb-3">
													<h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
														{job.title}
													</h3>
													{job.featured && (
														<Badge variant="default" className="text-xs">
															Featured
														</Badge>
													)}
												</div>
												<div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-muted-foreground">
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
														<MessageCircle className="h-4 w-4" />
														<span>{job.applicants} applicants</span>
													</div>
												</div>
												<p className="text-muted-foreground mb-4">
													{job.description}
												</p>
												<div className="flex flex-wrap gap-2 mb-4">
													{job.requirements.map((req, index) => (
														<Badge
															key={index}
															variant="outline"
															className="text-xs"
														>
															{req}
														</Badge>
													))}
												</div>
												<div className="flex items-center justify-between">
													<span className="text-sm text-muted-foreground">
														Posted {job.posted}
													</span>
													<Button className="group" asChild>
														<Link href={`/careers/${job.id}`}>
															Apply Now
															<ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
														</Link>
													</Button>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</div>

					{/* Company Values */}
					<div className="mb-16">
						<h2 className="text-2xl font-semibold mb-6 text-center">
							Our Values
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							{companyValues.map((value, index) => (
								<Card
									key={`value-${index}`}
									className="text-center group hover:shadow-lg transition-all duration-200"
								>
									<CardContent className="p-6">
										<div
											className={`inline-flex p-3 rounded-full ${value.color} text-white mb-4`}
										>
											<value.icon className="h-6 w-6" />
										</div>
										<h3 className="text-lg font-semibold mb-2">
											{value.title}
										</h3>
										<p className="text-muted-foreground text-sm">
											{value.description}
										</p>
									</CardContent>
								</Card>
							))}
						</div>
					</div>

					{/* Benefits */}
					<div className="mb-16">
						<h2 className="text-2xl font-semibold mb-6 text-center">
							Benefits & Perks
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							{benefits.map((benefit, index) => (
								<Card
									key={`benefit-${index}`}
									className="group hover:shadow-md transition-all duration-200"
								>
									<CardContent className="p-6 text-center">
										<div className="inline-flex p-2 rounded-lg bg-primary/10 text-primary mb-3">
											<benefit.icon className="h-5 w-5" />
										</div>
										<h3 className="font-semibold mb-2">{benefit.title}</h3>
										<p className="text-sm text-muted-foreground">
											{benefit.description}
										</p>
									</CardContent>
								</Card>
							))}
						</div>
					</div>

					{/* Culture Section */}
					<Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
						<CardContent className="p-8 text-center">
							<div className="max-w-3xl mx-auto">
								<h3 className="text-2xl font-semibold mb-4">
									Join Our Mission
								</h3>
								<p className="text-muted-foreground mb-6">
									We're building the financial infrastructure of the future. If
									you're passionate about creating meaningful impact and working
									with cutting-edge technology, we'd love to hear from you.
								</p>
								<div className="flex flex-col sm:flex-row gap-4 justify-center">
									<Button asChild>
										<Link href="/careers/apply">
											View All Positions
											<ArrowRight className="ml-2 h-4 w-4" />
										</Link>
									</Button>
									<Button variant="outline" asChild>
										<Link href="/about">Learn About Us</Link>
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
