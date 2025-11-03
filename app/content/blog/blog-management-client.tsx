"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
	BarChart3,
	Calendar,
	Clock,
	Edit,
	Eye,
	Filter,
	Plus,
	Search,
	Share2,
	Star,
	Tag,
	Trash2,
	TrendingUp,
	User,
	Users,
	Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface BlogPost {
	id: number;
	title: string;
	slug: string;
	excerpt: string | null;
	status: "draft" | "published" | "scheduled" | "archived";
	categoryId: number | null;
	isFeatured: boolean;
	viewCount: number;
	likeCount: number;
	commentCount: number;
	publishedAt: string | null;
	createdAt: string;
	userId: string;
}

interface BlogCategory {
	id: number;
	name: string;
	slug: string;
	description: string | null;
	color: string | null;
	postCount: number;
}

interface BlogStats {
	totalPosts: number;
	publishedPosts: number;
	draftPosts: number;
	totalViews: number;
	totalLikes: number;
	totalComments: number;
	averageViews: number;
}

export function BlogManagementClient() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("");

	// Fetch blog posts
	const { data: postsData, isLoading: postsLoading, error: postsError } = useQuery({
		queryKey: ["blog-posts", statusFilter, searchQuery],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (statusFilter) params.append("status", statusFilter);
			if (searchQuery) params.append("search", searchQuery);
			params.append("limit", "50");

			const response = await fetch(`/api/blog?${params.toString()}`);
			if (!response.ok) throw new Error("Failed to fetch blog posts");
			return response.json();
		},
	});

	// Fetch blog stats
	const { data: statsData, isLoading: statsLoading } = useQuery({
		queryKey: ["blog-stats"],
		queryFn: async () => {
			const response = await fetch("/api/blog/stats");
			if (!response.ok) throw new Error("Failed to fetch blog stats");
			return response.json();
		},
	});

	// Fetch categories
	const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
		queryKey: ["blog-categories"],
		queryFn: async () => {
			const response = await fetch("/api/blog/categories");
			if (!response.ok) throw new Error("Failed to fetch categories");
			return response.json();
		},
	});

	const posts: BlogPost[] = postsData?.data || [];
	const stats: BlogStats = statsData?.data || {
		totalPosts: 0,
		publishedPosts: 0,
		draftPosts: 0,
		totalViews: 0,
		totalLikes: 0,
		totalComments: 0,
		averageViews: 0,
	};
	const categories: BlogCategory[] = categoriesData?.data || [];

	// Delete mutation
	const deleteMutation = useMutation({
		mutationFn: async (id: number) => {
			const response = await fetch(`/api/blog/${id}`, {
				method: "DELETE",
			});
			if (!response.ok) throw new Error("Failed to delete post");
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
			queryClient.invalidateQueries({ queryKey: ["blog-stats"] });
			toast.success("Blog post deleted successfully");
		},
		onError: (error: Error) => {
			toast.error(`Failed to delete post: ${error.message}`);
		},
	});

	// Publish mutation
	const publishMutation = useMutation({
		mutationFn: async (id: number) => {
			const response = await fetch(`/api/blog/${id}/publish`, {
				method: "POST",
			});
			if (!response.ok) throw new Error("Failed to publish post");
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
			queryClient.invalidateQueries({ queryKey: ["blog-stats"] });
			toast.success("Blog post published successfully");
		},
		onError: (error: Error) => {
			toast.error(`Failed to publish post: ${error.message}`);
		},
	});

	const handleDelete = async (id: number) => {
		if (confirm("Are you sure you want to delete this post?")) {
			deleteMutation.mutate(id);
		}
	};

	const handlePublish = (id: number) => {
		publishMutation.mutate(id);
	};

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case "published":
				return "default";
			case "draft":
				return "secondary";
			case "scheduled":
				return "outline";
			case "archived":
				return "destructive";
			default:
				return "outline";
		}
	};

	const formatDate = (dateString: string | null) => {
		if (!dateString) return "Not published";
		return new Date(dateString).toLocaleDateString();
	};

	const blogStats = [
		{
			name: "Total Posts",
			value: stats.totalPosts.toString(),
			change: "+5",
			changeType: "positive",
			icon: Calendar,
		},
		{
			name: "Published Posts",
			value: stats.publishedPosts.toString(),
			change: `+${stats.publishedPosts > 0 ? Math.round((stats.publishedPosts / stats.totalPosts) * 100) : 0}%`,
			changeType: "positive",
			icon: Eye,
		},
		{
			name: "Total Views",
			value: stats.totalViews.toLocaleString(),
			change: `+${stats.averageViews > 0 ? Math.round(stats.averageViews / 10) : 0}%`,
			changeType: "positive",
			icon: TrendingUp,
		},
		{
			name: "Engagement Rate",
			value: stats.totalPosts > 0
				? `${Math.round((stats.totalLikes / stats.totalViews) * 100) || 0}%`
				: "0%",
			change: "+0.8%",
			changeType: "positive",
			icon: Users,
		},
	];

	if (postsLoading || statsLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (postsError) {
		return (
			<div className="text-center text-red-600">
				Error loading blog posts: {(postsError as Error).message}
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
					<p className="text-muted-foreground">
						Create, manage, and publish blog content for your audience
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline">
						<Filter className="h-4 w-4 mr-2" />
						Filter
					</Button>
					<Button onClick={() => router.push("/content/blog/new")}>
						<Plus className="h-4 w-4 mr-2" />
						New Post
					</Button>
				</div>
			</div>

			{/* Stats Overview */}
			<div className="grid gap-4 md:grid-cols-4">
				{blogStats.map((stat) => (
					<Card key={stat.name}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
							<stat.icon className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stat.value}</div>
							<p
								className={`text-xs ${
									stat.changeType === "positive" ? "text-green-600" : "text-red-600"
								}`}
							>
								{stat.change} from last month
							</p>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Blog Management */}
			<Tabs defaultValue="posts" className="space-y-4">
				<TabsList>
					<TabsTrigger value="posts">All Posts</TabsTrigger>
					<TabsTrigger value="analytics">Analytics</TabsTrigger>
					<TabsTrigger value="categories">Categories</TabsTrigger>
				</TabsList>

				<TabsContent value="posts" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Blog Posts</CardTitle>
							<CardDescription>Manage your blog posts and content</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{/* Search and filter */}
								<div className="flex items-center gap-4">
									<Input
										placeholder="Search posts..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="flex-1"
									/>
									<Button variant="outline">
										<Filter className="h-4 w-4 mr-2" />
										Filter
									</Button>
								</div>

								{/* Posts list */}
								{posts.length === 0 ? (
									<div className="text-center py-8 text-muted-foreground">
										No blog posts found. Create your first post!
									</div>
								) : (
									posts.map((post) => {
										const category = categories.find((c) => c.id === post.categoryId);
										return (
											<div
												key={post.id}
												className="flex items-center justify-between p-4 border rounded-lg"
											>
												<div className="space-y-1 flex-1">
													<div className="flex items-center gap-2">
														<h4 className="font-medium">{post.title}</h4>
														<Badge variant={getStatusBadgeVariant(post.status)}>
															{post.status}
														</Badge>
														{category && (
															<Badge variant="outline">{category.name}</Badge>
														)}
														{post.isFeatured && (
															<Badge variant="default">Featured</Badge>
														)}
													</div>
													<div className="flex items-center gap-4 text-sm text-muted-foreground">
														<div className="flex items-center gap-1">
															<Clock className="h-3 w-3" />
															{formatDate(post.publishedAt)}
														</div>
													</div>
													<div className="flex items-center gap-4 text-sm">
														<div className="flex items-center gap-1">
															<Eye className="h-3 w-3" />
															{post.viewCount.toLocaleString()} views
														</div>
														<div className="flex items-center gap-1">
															<Star className="h-3 w-3" />
															{post.likeCount} likes
														</div>
														<div className="flex items-center gap-1">
															<Tag className="h-3 w-3" />
															{post.commentCount} comments
														</div>
													</div>
												</div>
												<div className="flex items-center gap-2">
													{post.status === "published" ? (
														<Button
															variant="ghost"
															size="sm"
															onClick={() => router.push(`/blog/${post.slug}`)}
														>
															<Eye className="h-3 w-3 mr-1" />
															View
														</Button>
													) : (
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handlePublish(post.id)}
															disabled={publishMutation.isPending}
														>
															<Plus className="h-3 w-3 mr-1" />
															Publish
														</Button>
													)}
													<Button
														variant="ghost"
														size="sm"
														onClick={() => router.push(`/content/blog/${post.id}/edit`)}
													>
														<Edit className="h-3 w-3 mr-1" />
														Edit
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleDelete(post.id)}
														disabled={deleteMutation.isPending}
													>
														<Trash2 className="h-3 w-3" />
													</Button>
												</div>
											</div>
										);
									})
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="categories" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Blog Categories</CardTitle>
							<CardDescription>Content performance by category</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
								{categoriesLoading ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : categories.length === 0 ? (
									<div className="text-center py-4 text-muted-foreground">
										No categories found
									</div>
								) : (
									categories.map((category) => (
										<div key={category.id} className="space-y-2">
											<div className="flex items-center gap-2">
												<div
													className={`w-3 h-3 rounded-full ${category.color || "bg-blue-500"}`}
												/>
												<h4 className="font-medium">{category.name}</h4>
											</div>
											<div className="space-y-1">
												<p className="text-2xl font-bold">{category.postCount}</p>
											</div>
										</div>
									))
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="analytics" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Content Performance</CardTitle>
							<CardDescription>Overall blog performance metrics</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<span className="text-sm">Avg Views per Post</span>
									<span className="font-medium">
										{stats.publishedPosts > 0
											? Math.round(stats.totalViews / stats.publishedPosts)
											: 0}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm">Avg Engagement Rate</span>
									<span className="font-medium">
										{stats.totalViews > 0
											? `${Math.round((stats.totalLikes / stats.totalViews) * 100)}%`
											: "0%"}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm">Total Posts</span>
									<span className="font-medium">{stats.totalPosts}</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm">Published Posts</span>
									<span className="font-medium text-green-600">
										{stats.publishedPosts}
									</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}

