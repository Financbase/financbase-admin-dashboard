"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Search,
	Filter,
	Download,
	Trash2,
	Copy,
	Share2,
	Grid3X3,
	List,
	Calendar,
	Tag,
	Folder,
	MoreVertical,
	Star,
	Archive,
	Image as ImageIcon,
	FolderOpen
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface UploadedImage {
	id: string;
	url: string;
	name: string;
	size: number;
	type: string;
	uploadDate: Date;
	category?: string;
	tags?: string[];
	favorite?: boolean;
	archived?: boolean;
}

interface ImageGalleryProps {
	images?: UploadedImage[];
	onDelete?: (imageId: string) => void;
	onUpdate?: (imageId: string, updates: Partial<UploadedImage>) => void;
	className?: string;
}

export function ImageGallery({
	images = [],
	onDelete,
	onUpdate,
	className = "",
}: ImageGalleryProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
	const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());

	// Filter and sort images
	const filteredImages = useMemo(() => {
		let filtered = images.filter(image => {
			const matchesSearch = image.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				image.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

			const matchesCategory = selectedCategory === 'all' || image.category === selectedCategory;

			const matchesArchive = !image.archived; // Only show non-archived by default

			return matchesSearch && matchesCategory && matchesArchive;
		});

		// Sort images
		filtered.sort((a, b) => {
			switch (sortBy) {
				case 'name':
					return a.name.localeCompare(b.name);
				case 'size':
					return b.size - a.size;
				case 'date':
				default:
					return b.uploadDate.getTime() - a.uploadDate.getTime();
			}
		});

		return filtered;
	}, [images, searchTerm, selectedCategory, sortBy]);

	// Get unique categories
	const categories = useMemo(() => {
		const cats = new Set(images.map(img => img.category).filter(Boolean));
		return Array.from(cats);
	}, [images]);

	const handleImageClick = (image: UploadedImage) => {
		// Open image in modal or navigate to detail view
		console.log('Image clicked:', image);
	};

	const handleDelete = (imageId: string) => {
		onDelete?.(imageId);
		toast.success("Image deleted successfully");
	};

	const handleDownload = (image: UploadedImage) => {
		// Security: Validate image URL before using in anchor href
		const { validateSafeUrl } = require('@/lib/utils/security');
		const safeUrl = validateSafeUrl(image.url) || (image.url.startsWith('blob:') ? image.url : null);
		if (!safeUrl) {
			toast.error('Invalid image URL');
			return;
		}
		const link = document.createElement('a');
		link.href = safeUrl;
		link.download = image.name;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		toast.success("Download started");
	};

	const handleCopyUrl = (url: string) => {
		navigator.clipboard.writeText(url);
		toast.success("URL copied to clipboard");
	};

	const handleToggleFavorite = (imageId: string, currentValue: boolean) => {
		onUpdate?.(imageId, { favorite: !currentValue });
		toast.success(currentValue ? "Removed from favorites" : "Added to favorites");
	};

	const handleToggleArchive = (imageId: string, currentValue: boolean) => {
		onUpdate?.(imageId, { archived: !currentValue });
		toast.success(currentValue ? "Restored from archive" : "Moved to archive");
	};

	const handleBulkDelete = () => {
		if (selectedImages.size === 0) return;

		selectedImages.forEach(id => onDelete?.(id));
		setSelectedImages(new Set());
		toast.success(`Deleted ${selectedImages.size} image(s)`);
	};

	const handleSelectAll = () => {
		if (selectedImages.size === filteredImages.length) {
			setSelectedImages(new Set());
		} else {
			setSelectedImages(new Set(filteredImages.map(img => img.id)));
		}
	};

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	const formatDate = (date: Date) => {
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	return (
		<Card className={`w-full ${className}`}>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<ImageIcon className="h-5 w-5" />
						Image Gallery
						<Badge variant="secondary">{filteredImages.length}</Badge>
					</CardTitle>

					<div className="flex items-center gap-2">
						{/* View Mode Toggle */}
						<div className="flex border rounded-md">
							<Button
								variant={viewMode === 'grid' ? 'default' : 'ghost'}
								size="sm"
								onClick={() => setViewMode('grid')}
								className="rounded-r-none"
							>
								<Grid3X3 className="h-4 w-4" />
							</Button>
							<Button
								variant={viewMode === 'list' ? 'default' : 'ghost'}
								size="sm"
								onClick={() => setViewMode('list')}
								className="rounded-l-none"
							>
								<List className="h-4 w-4" />
							</Button>
						</div>

						{/* Bulk Actions */}
						{selectedImages.size > 0 && (
							<Button variant="destructive" size="sm" onClick={handleBulkDelete}>
								<Trash2 className="h-4 w-4 mr-1" />
								Delete ({selectedImages.size})
							</Button>
						)}
					</div>
				</div>

				{/* Search and Filters */}
				<div className="space-y-3">
					<div className="flex gap-2">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search images..."
								value={searchTerm}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
								className="pl-9"
							/>
						</div>

						{/* Category Filter */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm">
									<Filter className="h-4 w-4 mr-2" />
									{selectedCategory === 'all' ? 'All Categories' : selectedCategory}
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem onClick={() => setSelectedCategory('all')}>
									All Categories
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								{categories.map(category => (
									<DropdownMenuItem
										key={category}
										onClick={() => setSelectedCategory(category!)}
									>
										{category}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>

						{/* Sort Options */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm">
									Sort: {sortBy}
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem onClick={() => setSortBy('date')}>
									<Calendar className="h-4 w-4 mr-2" />
									Date
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setSortBy('name')}>
									<Tag className="h-4 w-4 mr-2" />
									Name
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setSortBy('size')}>
									<Folder className="h-4 w-4 mr-2" />
									Size
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					{/* Quick Filters */}
					<div className="flex gap-2 flex-wrap">
						<Button
							variant={selectedCategory === 'all' ? 'default' : 'outline'}
							size="sm"
							onClick={() => setSelectedCategory('all')}
						>
							All
						</Button>
						{categories.map(category => (
							<Button
								key={category}
								variant={selectedCategory === category ? 'default' : 'outline'}
								size="sm"
								onClick={() => setSelectedCategory(category!)}
							>
								{category}
							</Button>
						))}
					</div>
				</div>
			</CardHeader>

			<CardContent>
				{filteredImages.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
						<FolderOpen className="h-12 w-12 mb-4 opacity-50" />
						<h3 className="text-lg font-medium mb-2">No images found</h3>
						<p className="text-sm text-center">
							{searchTerm || selectedCategory !== 'all'
								? 'Try adjusting your search or filters'
								: 'Upload some images to get started'
							}
						</p>
					</div>
				) : (
					<div className={`${
						viewMode === 'grid'
							? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
							: 'space-y-3'
					}`}>
						{filteredImages.map((image) => (
							<div
								key={image.id}
								className={`group relative border rounded-lg overflow-hidden bg-muted/50 hover:bg-muted transition-colors ${
									selectedImages.has(image.id) ? 'ring-2 ring-primary' : ''
								}`}
							>
								{/* Image */}
								<div className="relative aspect-square cursor-pointer" onClick={() => handleImageClick(image)}>
									<Image
										src={image.url}
										alt={image.name}
										fill
										className="object-cover"
										sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
										onError={(e) => {
											console.error('Failed to load image:', image.url);
											// Replace with placeholder on error
											const target = e.target as HTMLImageElement;
											target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not available%3C/text%3E%3C/svg%3E';
										}}
									/>

									{/* Overlay */}
									<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

									{/* Selection checkbox */}
									<div className="absolute top-2 left-2">
										<input
											type="checkbox"
											checked={selectedImages.has(image.id)}
											onChange={(e) => {
												const newSelected = new Set(selectedImages);
												if (e.target.checked) {
													newSelected.add(image.id);
												} else {
													newSelected.delete(image.id);
												}
												setSelectedImages(newSelected);
											}}
											className="rounded border-gray-300"
											onClick={(e) => e.stopPropagation()}
										/>
									</div>

									{/* Favorite indicator */}
									{image.favorite && (
										<div className="absolute top-2 right-2">
											<Star className="h-4 w-4 text-yellow-400 fill-current" />
										</div>
									)}

									{/* Actions overlay */}
									<div className="absolute bottom-2 left-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
										<Button
											size="sm"
											variant="secondary"
											onClick={(e) => {
												e.stopPropagation();
												handleDownload(image);
											}}
											className="flex-1"
										>
											<Download className="h-3 w-3" />
										</Button>

										<Button
											size="sm"
											variant="secondary"
											onClick={(e) => {
												e.stopPropagation();
												handleCopyUrl(image.url);
											}}
										>
											<Copy className="h-3 w-3" />
										</Button>

										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button size="sm" variant="secondary">
													<MoreVertical className="h-3 w-3" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent>
												<DropdownMenuItem onClick={(e) => {
													e.stopPropagation();
													handleToggleFavorite(image.id, image.favorite || false);
												}}>
													<Star className="h-4 w-4 mr-2" />
													{image.favorite ? 'Remove from' : 'Add to'} Favorites
												</DropdownMenuItem>
												<DropdownMenuItem onClick={(e) => {
													e.stopPropagation();
													handleToggleArchive(image.id, image.archived || false);
												}}>
													<Archive className="h-4 w-4 mr-2" />
													{image.archived ? 'Restore' : 'Archive'}
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													onClick={(e) => {
														e.stopPropagation();
														handleDelete(image.id);
													}}
													className="text-red-600"
												>
													<Trash2 className="h-4 w-4 mr-2" />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</div>

								{/* Image Info */}
								<div className="p-3">
									<h3 className="font-medium text-sm truncate mb-1">{image.name}</h3>
									<div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
										<span>{formatFileSize(image.size)}</span>
										<span>{formatDate(image.uploadDate)}</span>
									</div>

									{/* Tags and Category */}
									<div className="flex flex-wrap gap-1">
										{image.category && (
											<Badge variant="outline" className="text-xs">
												{image.category}
											</Badge>
										)}
										{image.tags?.slice(0, 2).map(tag => (
											<Badge key={tag} variant="secondary" className="text-xs">
												{tag}
											</Badge>
										))}
										{image.tags && image.tags.length > 2 && (
											<Badge variant="secondary" className="text-xs">
												+{image.tags.length - 2}
											</Badge>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
