import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	ArrowRight,
	Search,
	User,
	Eye,
	Heart,
} from "lucide-react";

// Simple blog data
const blogPosts = [
	{
			id: 1,
		title: "The Future of AI in Financial Management",
		excerpt: "Explore how artificial intelligence is revolutionizing financial decision-making and business operations.",
		author: "Sarah Johnson",
		authorRole: "AI Research Lead",
		authorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
			publishedAt: "2024-01-15",
		readTime: "5 min read",
		category: "AI & Technology",
		image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
		views: "2.3k",
		likes: 45,
	},
			{
				id: 2,
		title: "Building Scalable Financial Systems",
		excerpt: "Learn the best practices for creating robust financial infrastructure that grows with your business.",
		author: "Mike Chen",
		authorRole: "Engineering Director",
		authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
		publishedAt: "2024-01-10",
		readTime: "7 min read",
		category: "Engineering",
		image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
				views: "1.8k",
		likes: 32,
			},
			{
				id: 3,
		title: "Financial Analytics Best Practices",
		excerpt: "Discover how to leverage data analytics to make better financial decisions and drive business growth.",
		author: "Alex Thompson",
		authorRole: "Data Scientist",
		authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
		publishedAt: "2024-01-05",
		readTime: "6 min read",
		category: "Analytics",
		image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
		views: "3.1k",
				likes: 67,
			},
];

const categories = ["All", "AI & Technology", "Engineering", "Analytics", "Business"];

export default function BlogPage() {
	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
				<div className="max-w-6xl mx-auto px-6">
					<div className="text-center text-white">
						<h1 className="text-4xl md:text-6xl font-bold mb-6">
								Financbase Blog
						</h1>
						<p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
							Insights, tutorials, and best practices for modern financial management
						</p>
						
						{/* Search Bar */}
						<div className="max-w-md mx-auto">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
							<Input
								placeholder="Search articles..."
									className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-blue-100"
								/>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Categories */}
			<section className="py-8 bg-card border-b">
				<div className="max-w-6xl mx-auto px-6">
								<div className="flex flex-wrap gap-2">
						{categories.map((category) => (
							<Badge
											key={category}
								variant={category === "All" ? "default" : "outline"}
								className="cursor-pointer hover:bg-primary/10"
											>
												{category}
							</Badge>
									))}
								</div>
							</div>
			</section>

			{/* Blog Posts */}
			<section className="py-12">
				<div className="max-w-6xl mx-auto px-6">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{blogPosts.map((post) => (
							<Card key={post.id} className="group hover:shadow-lg transition-all duration-300">
								<CardHeader className="p-0">
									<div className="relative overflow-hidden rounded-t-lg">
										<img
											src={post.image}
											alt={post.title}
											className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
										/>
										<div className="absolute top-4 left-4">
											<Badge variant="secondary" className="bg-white/90 text-gray-800">
												{post.category}
												</Badge>
										</div>
									</div>
								</CardHeader>
								
								<CardContent className="p-6">
									<div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
										<User className="h-4 w-4" />
										<span>{post.author}</span>
										<span>•</span>
										<span>{post.publishedAt}</span>
										<span>•</span>
										<span>{post.readTime}</span>
							</div>

									<h3 className="text-xl font-semibold mb-3 group-hover:text-blue-600 transition-colors">
													{post.title}
												</h3>
									
									<p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
													{post.excerpt}
												</p>
									
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-4 text-sm text-gray-500">
														<div className="flex items-center gap-1">
												<Eye className="h-4 w-4" />
															<span>{post.views}</span>
														</div>
														<div className="flex items-center gap-1">
												<Heart className="h-4 w-4" />
															<span>{post.likes}</span>
														</div>
													</div>
										
										<Button variant="ghost" size="sm" className="group">
														Read More
											<ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
												</Button>
									</div>
											</CardContent>
										</Card>
									))}
								</div>
							</div>
			</section>

							{/* Newsletter Signup */}
			<section className="py-16 bg-primary/5">
				<div className="max-w-4xl mx-auto px-6 text-center">
					<h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
											Stay Updated
					</h2>
					<p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
						Get the latest insights and updates delivered to your inbox
					</p>
					
										<div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
											<Input
												placeholder="Enter your email"
												className="flex-1"
											/>
						<Button className="whitespace-nowrap">
							Subscribe
						</Button>
					</div>
				</div>
			</section>
		</div>
	);
}