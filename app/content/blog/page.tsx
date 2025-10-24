import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	BarChart3,
	Bookmark,
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
	Users
} from "lucide-react";

export const metadata: Metadata = {
	title: "Blog Management | Financbase",
	description: "Create, manage, and publish blog content for your audience",
};

const blogStats = [
	{
		name: "Total Posts",
		value: "47",
		change: "+5",
		changeType: "positive",
		icon: Calendar,
	},
	{
		name: "Monthly Views",
		value: "12.4K",
		change: "+23%",
		changeType: "positive",
		icon: Eye,
	},
	{
		name: "Subscribers",
		value: "1,247",
		change: "+12%",
		changeType: "positive",
		icon: Users,
	},
	{
		name: "Engagement Rate",
		value: "4.2%",
		change: "+0.8%",
		changeType: "positive",
		icon: TrendingUp,
	},
];

const recentPosts = [
	{
		id: "BLOG-001",
		title: "The Future of AI in Financial Management",
		author: "Sarah Johnson",
		status: "published",
		views: 2450,
		likes: 127,
		comments: 23,
		publishedDate: "2025-01-18",
		category: "Technology",
		readTime: "5 min read",
		featured: true,
	},
	{
		id: "BLOG-002",
		title: "5 Ways to Optimize Your Cash Flow",
		author: "Mike Wilson",
		status: "published",
		views: 1820,
		likes: 89,
		comments: 15,
		publishedDate: "2025-01-15",
		category: "Finance",
		readTime: "7 min read",
		featured: false,
	},
	{
		id: "BLOG-003",
		title: "Building Scalable Financial Systems",
		author: "Lisa Chen",
		status: "draft",
		views: 0,
		likes: 0,
		comments: 0,
		publishedDate: null,
		category: "Engineering",
		readTime: "10 min read",
		featured: false,
	},
	{
		id: "BLOG-004",
		title: "Tax Planning Strategies for 2025",
		author: "David Brown",
		status: "published",
		views: 3200,
		likes: 156,
		comments: 34,
		publishedDate: "2025-01-12",
		category: "Tax",
		readTime: "8 min read",
		featured: true,
	},
];

const categories = [
	{
		name: "Technology",
		posts: 12,
		views: 8500,
		engagement: 4.5,
		color: "bg-blue-500",
	},
	{
		name: "Finance",
		posts: 15,
		views: 12400,
		engagement: 3.8,
		color: "bg-green-500",
	},
	{
		name: "Business",
		posts: 8,
		views: 6200,
		engagement: 4.2,
		color: "bg-purple-500",
	},
	{
		name: "Tax",
		posts: 6,
		views: 4800,
		engagement: 5.1,
		color: "bg-orange-500",
	},
	{
		name: "Engineering",
		posts: 4,
		views: 2100,
		engagement: 3.2,
		color: "bg-red-500",
	},
	{
		name: "Marketing",
		posts: 2,
		views: 1400,
		engagement: 4.8,
		color: "bg-pink-500",
	},
];

const topPosts = [
	{
		title: "Tax Planning Strategies for 2025",
		views: 3200,
		engagement: 5.1,
		published: "2025-01-12",
	},
	{
		title: "The Future of AI in Financial Management",
		views: 2450,
		engagement: 4.7,
		published: "2025-01-18",
	},
	{
		title: "5 Ways to Optimize Your Cash Flow",
		views: 1820,
		engagement: 4.3,
		published: "2025-01-15",
	},
];

export default function BlogPage() {
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
					<Button>
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
							<p className={`text-xs ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
								{stat.change} from last month
							</p>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Blog Categories */}
			<Card>
				<CardHeader>
					<CardTitle>Blog Categories</CardTitle>
					<CardDescription>
						Content performance by category
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
						{categories.map((category) => (
							<div key={category.name} className="space-y-2">
								<div className="flex items-center gap-2">
									<div className={`w-3 h-3 rounded-full ${category.color}`} />
									<h4 className="font-medium">{category.name}</h4>
								</div>
								<div className="space-y-1">
									<p className="text-2xl font-bold">{category.posts}</p>
									<p className="text-sm text-muted-foreground">
										{category.views.toLocaleString()} views
									</p>
									<p className="text-sm text-muted-foreground">
										{category.engagement}% engagement
									</p>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Blog Management */}
			<Tabs defaultValue="posts" className="space-y-4">
				<TabsList>
					<TabsTrigger value="posts">All Posts</TabsTrigger>
					<TabsTrigger value="analytics">Analytics</TabsTrigger>
					<TabsTrigger value="categories">Categories</TabsTrigger>
					<TabsTrigger value="comments">Comments</TabsTrigger>
				</TabsList>

				<TabsContent value="posts" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Blog Posts</CardTitle>
							<CardDescription>
								Manage your blog posts and content
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{/* Search and filter */}
								<div className="flex items-center gap-4">
									<Button variant="outline" className="flex-1 justify-start">
										<Search className="h-4 w-4 mr-2" />
										Search posts...
									</Button>
									<Button variant="outline">
										<Filter className="h-4 w-4 mr-2" />
										Filter
									</Button>
								</div>

								{/* Posts list */}
								{recentPosts.map((post) => (
									<div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<h4 className="font-medium">{post.title}</h4>
												<Badge variant={
													post.status === 'published' ? 'default' :
													post.status === 'draft' ? 'secondary' :
													'outline'
												}>
													{post.status}
												</Badge>
												<Badge variant="outline">{post.category}</Badge>
												{post.featured && <Badge variant="default">Featured</Badge>}
											</div>
											<div className="flex items-center gap-4 text-sm text-muted-foreground">
												<div className="flex items-center gap-1">
													<User className="h-3 w-3" />
													{post.author}
												</div>
												<div className="flex items-center gap-1">
													<Clock className="h-3 w-3" />
													{post.readTime}
												</div>
												{post.publishedDate && (
													<div className="flex items-center gap-1">
														<Calendar className="h-3 w-3" />
														{post.publishedDate}
													</div>
												)}
											</div>
											<div className="flex items-center gap-4 text-sm">
												<div className="flex items-center gap-1">
													<Eye className="h-3 w-3" />
													{post.views.toLocaleString()} views
												</div>
												<div className="flex items-center gap-1">
													<Star className="h-3 w-3" />
													{post.likes} likes
												</div>
												<div className="flex items-center gap-1">
													<Tag className="h-3 w-3" />
													{post.comments} comments
												</div>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Button variant="ghost" size="sm">
												<Eye className="h-3 w-3 mr-1" />
												Preview
											</Button>
											<Button variant="ghost" size="sm">
												<Edit className="h-3 w-3 mr-1" />
												Edit
											</Button>
											<Button variant="ghost" size="sm">
												<Share2 className="h-3 w-3 mr-1" />
												Share
											</Button>
											<Button variant="ghost" size="sm">
												<Trash2 className="h-3 w-3" />
											</Button>
										</div>
									</div>
								))}
								<Separator />
								<Button variant="outline" className="w-full">
									<Search className="h-4 w-4 mr-2" />
									View All Posts
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="analytics" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Top Performing Posts</CardTitle>
								<CardDescription>
									Most viewed and engaging content
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{topPosts.map((post, index) => (
										<div key={`${post.title}-${post.published}-${post.views}`} className="flex items-center justify-between p-3 border rounded-lg">
											<div className="space-y-1">
												<h4 className="font-medium text-sm">{post.title}</h4>
												<p className="text-xs text-muted-foreground">
													Published: {post.published} • {post.engagement}% engagement
												</p>
											</div>
											<div className="text-right">
												<p className="font-medium">{post.views.toLocaleString()}</p>
												<p className="text-xs text-muted-foreground">views</p>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Content Performance</CardTitle>
								<CardDescription>
									Overall blog performance metrics
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<span className="text-sm">Avg Views per Post</span>
										<span className="font-medium">1,247</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Avg Engagement Rate</span>
										<span className="font-medium">4.2%</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Bounce Rate</span>
										<span className="font-medium text-green-600">32%</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Avg Read Time</span>
										<span className="font-medium">4.2 min</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="categories" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Category Management</CardTitle>
							<CardDescription>
								Manage blog categories and tags
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{categories.map((category) => (
									<div key={category.name} className="flex items-center justify-between p-4 border rounded-lg">
										<div className="flex items-center gap-3">
											<div className={`w-4 h-4 rounded-full ${category.color}`} />
											<div>
												<h4 className="font-medium">{category.name}</h4>
												<p className="text-sm text-muted-foreground">
													{category.posts} posts • {category.views.toLocaleString()} views • {category.engagement}% engagement
												</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Button variant="outline" size="sm">
												View Posts
											</Button>
											<Button variant="outline" size="sm">
												Edit
											</Button>
										</div>
									</div>
								))}
								<Separator />
								<Button variant="outline" className="w-full">
									<Plus className="h-4 w-4 mr-2" />
									Create Category
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="comments" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Comment Management</CardTitle>
							<CardDescription>
								Moderate and manage blog comments
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="text-center py-8 text-muted-foreground">
									<Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
									<h3 className="font-medium mb-2">Comment Moderation</h3>
									<p className="text-sm mb-4">
										Comment moderation interface with approval workflows and spam filtering
									</p>
									<Button variant="outline">
										<Users className="h-4 w-4 mr-2" />
										View Comments
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
