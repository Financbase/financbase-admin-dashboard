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
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Send, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface BlogPost {
	id: number;
	title: string;
	slug: string;
	excerpt: string | null;
	content: string;
	featuredImage: string | null;
	categoryId: number | null;
	status: string;
	isFeatured: boolean;
}

interface BlogCategory {
	id: number;
	name: string;
	slug: string;
}

export default function EditBlogPostPage() {
	const router = useRouter();
	const params = useParams();
	const postId = params.id as string;

	const [formData, setFormData] = useState({
		title: "",
		slug: "",
		excerpt: "",
		content: "",
		featuredImage: "",
		categoryId: "",
		status: "draft",
		isFeatured: false,
	});

	// Fetch post data
	const { data: postData, isLoading: postLoading } = useQuery({
		queryKey: ["blog-post", postId],
		queryFn: async () => {
			const response = await fetch(`/api/blog/${postId}`);
			if (!response.ok) throw new Error("Failed to fetch post");
			const data = await response.json();
			if (!data.success) throw new Error("Post not found");
			return data.data;
		},
		enabled: !!postId,
	});

	// Fetch categories
	const { data: categoriesData } = useQuery({
		queryKey: ["blog-categories"],
		queryFn: async () => {
			const response = await fetch("/api/blog/categories");
			if (!response.ok) throw new Error("Failed to fetch categories");
			return response.json();
		},
	});

	const categories: BlogCategory[] = categoriesData?.data || [];

	// Update form when post data is loaded
	useEffect(() => {
		if (postData) {
			setFormData({
				title: postData.title || "",
				slug: postData.slug || "",
				excerpt: postData.excerpt || "",
				content: postData.content || "",
				featuredImage: postData.featuredImage || "",
				categoryId: postData.categoryId?.toString() || "",
				status: postData.status || "draft",
				isFeatured: postData.isFeatured || false,
			});
		}
	}, [postData]);

	// Generate slug from title
	const generateSlug = (title: string) => {
		return title
			.toLowerCase()
			.trim()
			.replace(/[^\w\s-]/g, "")
			.replace(/[\s_-]+/g, "-")
			.replace(/^-+|-+$/g, "");
	};

	const handleTitleChange = (title: string) => {
		setFormData((prev) => ({
			...prev,
			title,
			slug: prev.slug || generateSlug(title),
		}));
	};

	const updatePostMutation = useMutation({
		mutationFn: async (data: typeof formData) => {
			const response = await fetch(`/api/blog/${postId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					...data,
					categoryId: data.categoryId ? parseInt(data.categoryId) : undefined,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error?.message || "Failed to update blog post");
			}

			return response.json();
		},
		onSuccess: () => {
			toast.success("Blog post updated successfully!");
		},
		onError: (error: Error) => {
			toast.error(`Failed to update post: ${error.message}`);
		},
	});

	const publishMutation = useMutation({
		mutationFn: async () => {
			const response = await fetch(`/api/blog/${postId}/publish`, {
				method: "POST",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error?.message || "Failed to publish blog post");
			}

			return response.json();
		},
		onSuccess: () => {
			toast.success("Blog post published successfully!");
			router.push("/content/blog");
		},
		onError: (error: Error) => {
			toast.error(`Failed to publish post: ${error.message}`);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		updatePostMutation.mutate(formData);
	};

	const handlePublish = () => {
		publishMutation.mutate();
	};

	if (postLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Link href="/content/blog">
						<Button variant="ghost" size="sm">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back
						</Button>
					</Link>
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Edit Blog Post</h1>
						<p className="text-muted-foreground">Edit your blog post content</p>
					</div>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="grid gap-6 md:grid-cols-3">
					{/* Main Content */}
					<div className="md:col-span-2 space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Content</CardTitle>
								<CardDescription>Edit your blog post content</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="title">Title *</Label>
									<Input
										id="title"
										value={formData.title}
										onChange={(e) => handleTitleChange(e.target.value)}
										placeholder="Enter post title"
										required
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="slug">Slug *</Label>
									<Input
										id="slug"
										value={formData.slug}
										onChange={(e) =>
											setFormData((prev) => ({ ...prev, slug: e.target.value }))
										}
										placeholder="post-url-slug"
										required
									/>
									<p className="text-xs text-muted-foreground">
										URL-friendly version of the title
									</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="excerpt">Excerpt</Label>
									<Textarea
										id="excerpt"
										value={formData.excerpt}
										onChange={(e) =>
											setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
										}
										placeholder="Brief description of the post"
										rows={3}
										maxLength={500}
									/>
									<p className="text-xs text-muted-foreground">
										{formData.excerpt.length}/500 characters
									</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="content">Content *</Label>
									<Textarea
										id="content"
										value={formData.content}
										onChange={(e) =>
											setFormData((prev) => ({ ...prev, content: e.target.value }))
										}
										placeholder="Write your blog post content (HTML supported)"
										rows={20}
										required
									/>
									<p className="text-xs text-muted-foreground">
										You can use HTML tags for formatting
									</p>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Publish</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="status">Status</Label>
									<Select
										value={formData.status}
										onValueChange={(value) =>
											setFormData((prev) => ({ ...prev, status: value }))
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="draft">Draft</SelectItem>
											<SelectItem value="published">Published</SelectItem>
											<SelectItem value="scheduled">Scheduled</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="flex items-center justify-between">
									<Label htmlFor="featured">Featured Post</Label>
									<Switch
										id="featured"
										checked={formData.isFeatured}
										onCheckedChange={(checked) =>
											setFormData((prev) => ({ ...prev, isFeatured: checked }))
										}
									/>
								</div>

								<div className="flex flex-col gap-2">
									<Button
										type="submit"
										variant="outline"
										disabled={updatePostMutation.isPending}
									>
										<Save className="h-4 w-4 mr-2" />
										Save Changes
									</Button>
									{formData.status !== "published" && (
										<Button
											type="button"
											onClick={handlePublish}
											disabled={publishMutation.isPending}
										>
											<Send className="h-4 w-4 mr-2" />
											Publish
										</Button>
									)}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Settings</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="category">Category</Label>
									<Select
										value={formData.categoryId}
										onValueChange={(value) =>
											setFormData((prev) => ({ ...prev, categoryId: value }))
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select category" />
										</SelectTrigger>
										<SelectContent>
											{categories.map((category) => (
												<SelectItem key={category.id} value={category.id.toString()}>
													{category.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label htmlFor="featuredImage">Featured Image URL</Label>
									<Input
										id="featuredImage"
										value={formData.featuredImage}
										onChange={(e) =>
											setFormData((prev) => ({ ...prev, featuredImage: e.target.value }))
										}
										placeholder="https://example.com/image.jpg"
										type="url"
									/>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</form>
		</div>
	);
}

