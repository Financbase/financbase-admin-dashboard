"use client";

import { useState, useEffect, useId } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Users, TrendingUp, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { FreelancerProfileCard } from "@/components/freelancer-hub/freelancer-profile-card";

// Mock data for demonstration - in production, this would come from your API
const mockFreelancers = [
	{
		id: "1",
		name: "Sarah Johnson",
		title: "Senior UI/UX Designer",
		avatarSrc: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
		bannerSrc: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=200&fit=crop",
		rating: 4.9,
		duration: "2-3 weeks",
		rate: "$75/hr",
		tools: [
			<div key="figma" className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
				<span className="text-xs font-bold text-purple-600">F</span>
			</div>,
			<div key="sketch" className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center">
				<span className="text-xs font-bold text-orange-600">S</span>
			</div>,
			<div key="adobe" className="w-6 h-6 bg-red-100 rounded flex items-center justify-center">
				<span className="text-xs font-bold text-red-600">A</span>
			</div>,
		],
	},
	{
		id: "2",
		name: "Michael Chen",
		title: "Full-Stack Developer",
		avatarSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
		bannerSrc: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop",
		rating: 4.8,
		duration: "4-6 weeks",
		rate: "$90/hr",
		tools: [
			<div key="react" className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
				<span className="text-xs font-bold text-blue-600">R</span>
			</div>,
			<div key="node" className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
				<span className="text-xs font-bold text-green-600">N</span>
			</div>,
			<div key="python" className="w-6 h-6 bg-yellow-100 rounded flex items-center justify-center">
				<span className="text-xs font-bold text-yellow-600">P</span>
			</div>,
		],
	},
	{
		id: "3",
		name: "Emily Rodriguez",
		title: "Digital Marketing Specialist",
		avatarSrc: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
		bannerSrc: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=200&fit=crop",
		rating: 4.7,
		duration: "1-2 weeks",
		rate: "$60/hr",
		tools: [
			<div key="google" className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
				<span className="text-xs font-bold text-blue-600">G</span>
			</div>,
			<div key="facebook" className="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center">
				<span className="text-xs font-bold text-indigo-600">F</span>
			</div>,
			<div key="analytics" className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center">
				<span className="text-xs font-bold text-orange-600">A</span>
			</div>,
		],
	},
	{
		id: "4",
		name: "David Kim",
		title: "Mobile App Developer",
		avatarSrc: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
		bannerSrc: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=200&fit=crop",
		rating: 4.9,
		duration: "6-8 weeks",
		rate: "$85/hr",
		tools: [
			<div key="react-native" className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
				<span className="text-xs font-bold text-blue-600">RN</span>
			</div>,
			<div key="swift" className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center">
				<span className="text-xs font-bold text-orange-600">S</span>
			</div>,
			<div key="kotlin" className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
				<span className="text-xs font-bold text-purple-600">K</span>
			</div>,
		],
	},
	{
		id: "5",
		name: "Lisa Wang",
		title: "Content Writer & SEO Expert",
		avatarSrc: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
		bannerSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop",
		rating: 4.8,
		duration: "1-3 weeks",
		rate: "$45/hr",
		tools: [
			<div key="wordpress" className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
				<span className="text-xs font-bold text-blue-600">W</span>
			</div>,
			<div key="seo" className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
				<span className="text-xs font-bold text-green-600">SEO</span>
			</div>,
			<div key="grammarly" className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
				<span className="text-xs font-bold text-purple-600">G</span>
			</div>,
		],
	},
	{
		id: "6",
		name: "Alex Thompson",
		title: "Data Analyst & Visualization",
		avatarSrc: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
		bannerSrc: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop",
		rating: 4.6,
		duration: "2-4 weeks",
		rate: "$70/hr",
		tools: [
			<div key="python" className="w-6 h-6 bg-yellow-100 rounded flex items-center justify-center">
				<span className="text-xs font-bold text-yellow-600">P</span>
			</div>,
			<div key="tableau" className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
				<span className="text-xs font-bold text-blue-600">T</span>
			</div>,
			<div key="sql" className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center">
				<span className="text-xs font-bold text-orange-600">SQL</span>
			</div>,
		],
	},
];

const specialties = [
	"Web Development",
	"Mobile Development", 
	"UI/UX Design",
	"Digital Marketing",
	"Content Writing",
	"Data Analysis",
	"Graphic Design",
	"Project Management",
];

const countries = [
	"United States",
	"United Kingdom", 
	"Canada",
	"Australia",
	"Germany",
	"France",
	"Netherlands",
	"India",
];

export default function FreelancePage() {
	const specialtyId = useId();
	const countryId = useId();
	const sortId = useId();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedSpecialty, setSelectedSpecialty] = useState("all");
	const [selectedCountry, setSelectedCountry] = useState("all");
	const [sortBy, setSortBy] = useState("rating");
	const [freelancers, setFreelancers] = useState(mockFreelancers);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	// Filter freelancers based on search and filters
	useEffect(() => {
		let filtered = [...mockFreelancers];

		if (searchQuery) {
			filtered = filtered.filter(freelancer =>
				freelancer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				freelancer.title.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		if (selectedSpecialty && selectedSpecialty !== "all") {
			filtered = filtered.filter(freelancer =>
				freelancer.title.toLowerCase().includes(selectedSpecialty.toLowerCase())
			);
		}

		// Sort freelancers
		filtered.sort((a, b) => {
			switch (sortBy) {
				case "rating":
					return b.rating - a.rating;
				case "rate":
					return parseFloat(b.rate.replace(/[^0-9.]/g, '')) - parseFloat(a.rate.replace(/[^0-9.]/g, ''));
				default:
					return 0;
			}
		});

		setFreelancers(filtered);
	}, [searchQuery, selectedSpecialty, sortBy]);

	const handleSearch = () => {
		// In production, this would trigger an API call
		console.log("Searching for:", { searchQuery, selectedSpecialty, selectedCountry, sortBy });
	};

	const handleClearFilters = () => {
		setSearchQuery("");
		setSelectedSpecialty("all");
		setSelectedCountry("all");
		setSortBy("rating");
	};

	return (
		<div className="container mx-auto px-4 py-8 space-y-8">
			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="text-center space-y-4"
			>
				<h1 className="text-4xl font-bold tracking-tight">Find Top Freelancers</h1>
				<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
					Connect with skilled professionals for your next project. Browse profiles, compare rates, and hire the perfect freelancer.
				</p>
			</motion.div>

			{/* Search and Filters */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.1 }}
				className="space-y-6"
			>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Search className="h-5 w-5" />
							Search & Filter
						</CardTitle>
						<CardDescription>
							Find the perfect freelancer for your project
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Search Bar */}
						<div className="flex gap-2">
							<div className="relative flex-1">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search by name, skills, or project type..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-10"
								/>
				</div>
							<Button onClick={handleSearch} className="px-6">
								<Search className="h-4 w-4 mr-2" />
								Search
				</Button>
			</div>

						{/* Filters */}
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
							<div>
								<label htmlFor={specialtyId} className="text-sm font-medium mb-2 block">Specialty</label>
								<Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
									<SelectTrigger id={specialtyId}>
										<SelectValue placeholder="All specialties" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All specialties</SelectItem>
										{specialties.map((specialty) => (
											<SelectItem key={specialty} value={specialty}>
												{specialty}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
				</div>

							<div>
								<label htmlFor={countryId} className="text-sm font-medium mb-2 block">Country</label>
								<Select value={selectedCountry} onValueChange={setSelectedCountry}>
									<SelectTrigger id={countryId}>
										<SelectValue placeholder="All countries" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All countries</SelectItem>
										{countries.map((country) => (
											<SelectItem key={country} value={country}>
												{country}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
				</div>

							<div>
								<label htmlFor={sortId} className="text-sm font-medium mb-2 block">Sort By</label>
								<Select value={sortBy} onValueChange={setSortBy}>
									<SelectTrigger id={sortId}>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="rating">Rating</SelectItem>
										<SelectItem value="rate">Hourly Rate</SelectItem>
										<SelectItem value="experience">Experience</SelectItem>
										<SelectItem value="projects">Projects Completed</SelectItem>
									</SelectContent>
								</Select>
				</div>

							<div className="flex items-end">
								<Button variant="outline" onClick={handleClearFilters} className="w-full">
									<Filter className="h-4 w-4 mr-2" />
									Clear Filters
								</Button>
				</div>
			</div>

						{/* Active Filters */}
						{(searchQuery || (selectedSpecialty && selectedSpecialty !== "all") || (selectedCountry && selectedCountry !== "all")) && (
							<div className="flex flex-wrap gap-2">
								<span className="text-sm text-muted-foreground">Active filters:</span>
								{searchQuery && (
									<Badge variant="secondary" className="gap-1">
										Search: {searchQuery}
										<button
											type="button"
											onClick={() => setSearchQuery("")}
											className="ml-1 hover:text-destructive"
										>
											×
										</button>
									</Badge>
								)}
								{selectedSpecialty && selectedSpecialty !== "all" && (
									<Badge variant="secondary" className="gap-1">
										Specialty: {selectedSpecialty}
										<button
											type="button"
											onClick={() => setSelectedSpecialty("all")}
											className="ml-1 hover:text-destructive"
										>
											×
										</button>
									</Badge>
								)}
								{selectedCountry && selectedCountry !== "all" && (
									<Badge variant="secondary" className="gap-1">
										Country: {selectedCountry}
										<button
											type="button"
											onClick={() => setSelectedCountry("all")}
											className="ml-1 hover:text-destructive"
										>
											×
										</button>
									</Badge>
								)}
							</div>
						)}
					</CardContent>
				</Card>
			</motion.div>

			{/* Results Summary */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.2 }}
				className="flex items-center justify-between"
			>
				<div className="flex items-center gap-4">
					<h2 className="text-2xl font-semibold">
						{freelancers.length} Freelancer{freelancers.length !== 1 ? 's' : ''} Found
					</h2>
					<Badge variant="outline" className="gap-1">
						<Users className="h-3 w-3" />
						{freelancers.length} Available
										</Badge>
				</div>
				<div className="text-sm text-muted-foreground">
					Sorted by {sortBy === 'rating' ? 'Rating' : sortBy === 'rate' ? 'Hourly Rate' : sortBy}
			</div>
			</motion.div>

			{/* Freelancer Cards Grid */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.3 }}
				className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
			>
				{freelancers.map((freelancer) => (
					<FreelancerProfileCard
						key={freelancer.id}
						id={freelancer.id}
						name={freelancer.name}
						title={freelancer.title}
						avatarSrc={freelancer.avatarSrc}
						bannerSrc={freelancer.bannerSrc}
						rating={freelancer.rating}
						duration={freelancer.duration}
						rate={freelancer.rate}
						tools={freelancer.tools}
					/>
				))}
			</motion.div>

			{/* Pagination */}
			{totalPages > 1 && (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.4 }}
					className="flex items-center justify-center gap-2"
				>
					<Button
						variant="outline"
						onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
						disabled={currentPage === 1}
					>
						Previous
					</Button>
					<div className="flex items-center gap-1">
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
							<Button
								key={page}
								variant={currentPage === page ? "default" : "outline"}
								size="sm"
								onClick={() => setCurrentPage(page)}
							>
								{page}
							</Button>
						))}
					</div>
					<Button
						variant="outline"
						onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
						disabled={currentPage === totalPages}
					>
						Next
					</Button>
				</motion.div>
			)}

			{/* Marketplace Stats */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.5 }}
				className="grid gap-4 md:grid-cols-3"
			>
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-blue-100 rounded-lg">
								<Users className="h-6 w-6 text-blue-600" />
							</div>
							<div>
								<p className="text-2xl font-bold">2,500+</p>
								<p className="text-sm text-muted-foreground">Active Freelancers</p>
					</div>
				</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-green-100 rounded-lg">
								<TrendingUp className="h-6 w-6 text-green-600" />
					</div>
										<div>
								<p className="text-2xl font-bold">98%</p>
								<p className="text-sm text-muted-foreground">Success Rate</p>
										</div>
									</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-purple-100 rounded-lg">
								<Clock className="h-6 w-6 text-purple-600" />
					</div>
							<div>
								<p className="text-2xl font-bold">24h</p>
								<p className="text-sm text-muted-foreground">Avg Response Time</p>
				</div>
			</div>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}