/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { AuthorFormCard } from "@/components/core/ui/layout/author-form-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { type Author, useAuthors } from "@/hooks/use-authors";
import {
	CheckCircle,
	Database,
	Key,
	Puzzle,
	Trash2,
	XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function AuthorFormCardDemo() {
	const {
		createAuthor,
		updateAuthor,
		getAuthors,
		deleteAuthor,
		isLoading,
		error,
	} = useAuthors();
	const [isOpen, setIsOpen] = useState(false);
	const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
	const [authors, setAuthors] = useState<Author[]>([]);

	// Load authors on component mount
	useEffect(() => {
		const loadAuthors = async () => {
			const result = await getAuthors({ limit: 10 });
			if (result.success && result.data) {
				setAuthors(result.data.authors || []);
			}
		};
		loadAuthors();
	}, []);

	const handleFormSubmit = async (data: {
		name: string;
		title?: string;
		email?: string;
		bio?: string;
		avatar?: string;
		website?: string;
		status?: string;
		isFeatured?: boolean;
	}) => {
		try {
			if (editingAuthor) {
				// Update existing author
				const result = await updateAuthor(editingAuthor.id, data);
				if (result.success) {
					setEditingAuthor(null);
					setIsOpen(false);
					// Refresh authors list
					const refreshResult = await getAuthors({ limit: 10 });
					if (refreshResult.success && refreshResult.data) {
						setAuthors(refreshResult.data.authors || []);
					}
				}
			} else {
				// Create new author
				const result = await createAuthor(data);
				if (result.success) {
					setIsOpen(false);
					// Refresh authors list
					const refreshResult = await getAuthors({ limit: 10 });
					if (refreshResult.success && refreshResult.data) {
						setAuthors(refreshResult.data.authors || []);
					}
				}
			}
		} catch (err) {
			console.error("Error saving author:", err);
		}
	};

	const handleCancel = () => {
		setEditingAuthor(null);
		setIsOpen(false);
	};

	const handleEdit = (author: Author) => {
		setEditingAuthor(author);
		setIsOpen(true);
	};

	const handleDelete = async (authorId: string) => {
		if (confirm("Are you sure you want to delete this author?")) {
			const result = await deleteAuthor(authorId);
			if (result.success) {
				// Refresh authors list
				const refreshResult = await getAuthors({ limit: 10 });
				if (refreshResult.success && refreshResult.data) {
					setAuthors(refreshResult.data.authors || []);
				}
			}
		}
	};

	// Example of initial data for an "edit" scenario
	const existingAuthor = editingAuthor
		? {
				id: editingAuthor.id,
				name: editingAuthor.name,
				title: editingAuthor.title || "",
				email: editingAuthor.email,
				bio: editingAuthor.bio,
				avatar: editingAuthor.avatar,
				website: editingAuthor.website,
				status: editingAuthor.status,
				isFeatured: editingAuthor.isFeatured,
			}
		: undefined;

	return (
		<div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-8">
			<div className="w-full max-w-4xl space-y-8">
				{/* Header */}
				<div className="text-center">
					<h1 className="text-3xl font-bold">Author Management Demo</h1>
					<p className="text-muted-foreground mt-2">
						Full implementation with API integration, error handling, and
						database persistence
					</p>
				</div>

				{/* Actions */}
				<div className="flex justify-center gap-4">
					<Dialog open={isOpen} onOpenChange={setIsOpen}>
						<DialogTrigger asChild>
							<Button onClick={() => setEditingAuthor(null)}>
								Add New Author
							</Button>
						</DialogTrigger>
						<DialogContent className="p-0 bg-transparent border-none shadow-none w-full max-w-lg">
							<AuthorFormCard
								initialData={existingAuthor}
								onSubmit={handleFormSubmit}
								onCancel={handleCancel}
								isLoading={isLoading}
								error={error}
							/>
						</DialogContent>
					</Dialog>

					<Button variant="outline" onClick={() => window.location.reload()}>
						Refresh Authors
					</Button>
				</div>

				{/* Authors List */}
				<div className="space-y-4">
					<h2 className="text-xl font-semibold">Authors ({authors.length})</h2>

					{authors.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							No authors yet. Click "Add New Author" to get started.
						</div>
					) : (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{authors.map((author) => (
								<div
									key={author.id}
									className="rounded-lg border p-4 space-y-3"
								>
									<div className="flex items-center gap-3">
										{author.avatar && (
											<img
												src={author.avatar}
												alt={author.name}
												className="w-10 h-10 rounded-full object-cover"
											/>
										)}
										<div className="flex-1 min-w-0">
											<h3 className="font-medium truncate">{author.name}</h3>
											{author.title && (
												<p className="text-sm text-muted-foreground truncate">
													{author.title}
												</p>
											)}
										</div>
										{author.isFeatured && (
											<span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded">
												Featured
											</span>
										)}
									</div>

									<div className="text-sm text-muted-foreground">
										Status: <span className="capitalize">{author.status}</span>
									</div>

									<div className="flex gap-2">
										<Button
											size="sm"
											variant="outline"
											onClick={() => handleEdit(author)}
											disabled={isLoading}
										>
											Edit
										</Button>
										<Button
											size="sm"
											variant="destructive"
											onClick={() => handleDelete(author.id)}
											disabled={isLoading}
										>
											Delete
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Error Display */}
				{error && (
					<div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
						<p className="font-medium">Error:</p>
						<p>{error}</p>
					</div>
				)}

				{/* Loading State */}
				{isLoading && (
					<div className="text-center py-4">
						<div className="inline-flex items-center gap-2 text-muted-foreground">
							<div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
							Processing...
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
