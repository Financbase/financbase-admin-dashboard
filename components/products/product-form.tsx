/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useCurrentUser } from '@/hooks/use-current-user';
import { X } from 'lucide-react';

interface Product {
	id: string;
	name: string;
	sku: string;
	description?: string;
	category: string;
	price: string;
	cost?: string;
	stockQuantity: number;
	lowStockThreshold: number;
	reorderPoint?: number;
	status: "active" | "inactive" | "low_stock" | "discontinued" | "out_of_stock";
	images?: string[];
	tags?: string[];
	barcode?: string;
	vendor?: string;
	brand?: string;
	trackInventory?: boolean;
	allowBackorders?: boolean;
	currency?: string;
}

interface ProductFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	product?: Product;
	onSuccess?: () => void;
}

export function ProductForm({ open, onOpenChange, product, onSuccess }: ProductFormProps) {
	const [loading, setLoading] = useState(false);
	const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
	const [tagInput, setTagInput] = useState('');
	const { data: userData } = useCurrentUser();

	const [formData, setFormData] = useState({
		name: product?.name || '',
		sku: product?.sku || '',
		description: product?.description || '',
		category: product?.category || '',
		price: product?.price || '',
		cost: product?.cost || '',
		stockQuantity: product?.stockQuantity ?? 0,
		lowStockThreshold: product?.lowStockThreshold ?? 10,
		reorderPoint: product?.reorderPoint ?? 5,
		status: product?.status || 'active',
		barcode: product?.barcode || '',
		vendor: product?.vendor || '',
		brand: product?.brand || '',
		tags: product?.tags || [],
		images: product?.images || [],
		trackInventory: product?.trackInventory ?? true,
		allowBackorders: product?.allowBackorders ?? false,
		currency: product?.currency || 'USD',
	});

	// Fetch categories when dialog opens
	useEffect(() => {
		if (open && userData?.organizationId) {
			fetchCategories();
		}
	}, [open, userData?.organizationId]);

	// Reset form when product changes
	useEffect(() => {
		if (product) {
			setFormData({
				name: product.name || '',
				sku: product.sku || '',
				description: product.description || '',
				category: product.category || '',
				price: product.price || '',
				cost: product.cost || '',
				stockQuantity: product.stockQuantity ?? 0,
				lowStockThreshold: product.lowStockThreshold ?? 10,
				reorderPoint: product.reorderPoint ?? 5,
				status: product.status || 'active',
				barcode: product.barcode || '',
				vendor: product.vendor || '',
				brand: product.brand || '',
				tags: product.tags || [],
				images: product.images || [],
				trackInventory: product.trackInventory ?? true,
				allowBackorders: product.allowBackorders ?? false,
				currency: product.currency || 'USD',
			});
		} else {
			// Reset to defaults for new product
			setFormData({
				name: '',
				sku: '',
				description: '',
				category: '',
				price: '',
				cost: '',
				stockQuantity: 0,
				lowStockThreshold: 10,
				reorderPoint: 5,
				status: 'active',
				barcode: '',
				vendor: '',
				brand: '',
				tags: [],
				images: [],
				trackInventory: true,
				allowBackorders: false,
				currency: 'USD',
			});
		}
	}, [product, open]);

	const fetchCategories = async () => {
		try {
			const organizationId = userData?.organizationId;
			if (!organizationId) return;

			const response = await fetch(`/api/products/categories?organizationId=${organizationId}`);
			if (!response.ok) throw new Error('Failed to fetch categories');
			const data = await response.json();
			setCategories(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error('Error fetching categories:', error);
		}
	};

	const handleAddTag = () => {
		if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
			setFormData({
				...formData,
				tags: [...formData.tags, tagInput.trim()],
			});
			setTagInput('');
		}
	};

	const handleRemoveTag = (tagToRemove: string) => {
		setFormData({
			...formData,
			tags: formData.tags.filter((tag) => tag !== tagToRemove),
		});
	};

	const handleAddImage = () => {
		const imageUrl = prompt('Enter image URL:');
		if (imageUrl?.trim()) {
			setFormData({
				...formData,
				images: [...formData.images, imageUrl.trim()],
			});
		}
	};

	const handleRemoveImage = (imageToRemove: string) => {
		setFormData({
			...formData,
			images: formData.images.filter((img) => img !== imageToRemove),
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const url = product ? `/api/products/${product.id}` : '/api/products';
			const method = product ? 'PATCH' : 'POST';

			const payload = {
				name: formData.name,
				sku: formData.sku,
				description: formData.description || undefined,
				category: formData.category,
				price: formData.price,
				cost: formData.cost || undefined,
				stockQuantity: formData.stockQuantity,
				lowStockThreshold: formData.lowStockThreshold,
				status: formData.status,
				tags: formData.tags.length > 0 ? formData.tags : undefined,
				images: formData.images.length > 0 ? formData.images : undefined,
				barcode: formData.barcode || undefined,
				vendor: formData.vendor || undefined,
				brand: formData.brand || undefined,
			};

			const response = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to save product');
			}

			toast.success(product ? 'Product updated successfully' : 'Product created successfully');
			onOpenChange(false);
			onSuccess?.();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to save product');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{product ? 'Edit Product' : 'Create Product'}</DialogTitle>
					<DialogDescription>
						{product ? 'Update your product details' : 'Create a new product in your catalog'}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid gap-4 py-4">
						{/* Basic Information */}
						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="name">Product Name *</Label>
								<Input
									id="name"
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									required
									placeholder="e.g., Premium Widget"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="sku">SKU *</Label>
								<Input
									id="sku"
									value={formData.sku}
									onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
									required
									placeholder="e.g., WID-001"
								/>
							</div>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={formData.description}
								onChange={(e) => setFormData({ ...formData, description: e.target.value })}
								placeholder="Product description"
								rows={3}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="category">Category *</Label>
								<Select
									value={formData.category}
									onValueChange={(value) => setFormData({ ...formData, category: value })}
									required
								>
									<SelectTrigger>
										<SelectValue placeholder="Select category" />
									</SelectTrigger>
									<SelectContent>
										{categories.map((cat) => (
											<SelectItem key={cat.id} value={cat.name}>
												{cat.name}
											</SelectItem>
										))}
										{categories.length === 0 && (
											<SelectItem value="" disabled>
												No categories available
											</SelectItem>
										)}
									</SelectContent>
								</Select>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="status">Status *</Label>
								<Select
									value={formData.status}
									onValueChange={(value: any) => setFormData({ ...formData, status: value })}
									required
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="active">Active</SelectItem>
										<SelectItem value="inactive">Inactive</SelectItem>
										<SelectItem value="low_stock">Low Stock</SelectItem>
										<SelectItem value="out_of_stock">Out of Stock</SelectItem>
										<SelectItem value="discontinued">Discontinued</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Pricing */}
						<div className="grid grid-cols-3 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="price">Price *</Label>
								<Input
									id="price"
									type="number"
									step="0.01"
									min="0"
									value={formData.price}
									onChange={(e) => setFormData({ ...formData, price: e.target.value })}
									required
									placeholder="0.00"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="cost">Cost</Label>
								<Input
									id="cost"
									type="number"
									step="0.01"
									min="0"
									value={formData.cost}
									onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
									placeholder="0.00"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="currency">Currency</Label>
								<Select
									value={formData.currency}
									onValueChange={(value) => setFormData({ ...formData, currency: value })}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="USD">USD</SelectItem>
										<SelectItem value="EUR">EUR</SelectItem>
										<SelectItem value="GBP">GBP</SelectItem>
										<SelectItem value="CAD">CAD</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Inventory */}
						<div className="grid grid-cols-3 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="stockQuantity">Stock Quantity</Label>
								<Input
									id="stockQuantity"
									type="number"
									min="0"
									value={formData.stockQuantity}
									onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
									placeholder="0"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
								<Input
									id="lowStockThreshold"
									type="number"
									min="0"
									value={formData.lowStockThreshold}
									onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) || 10 })}
									placeholder="10"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="reorderPoint">Reorder Point</Label>
								<Input
									id="reorderPoint"
									type="number"
									min="0"
									value={formData.reorderPoint}
									onChange={(e) => setFormData({ ...formData, reorderPoint: parseInt(e.target.value) || 5 })}
									placeholder="5"
								/>
							</div>
						</div>

						<div className="flex items-center gap-6">
							<div className="flex items-center space-x-2">
								<Checkbox
									id="trackInventory"
									checked={formData.trackInventory}
									onCheckedChange={(checked) => setFormData({ ...formData, trackInventory: checked as boolean })}
								/>
								<Label htmlFor="trackInventory" className="font-normal cursor-pointer">
									Track Inventory
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="allowBackorders"
									checked={formData.allowBackorders}
									onCheckedChange={(checked) => setFormData({ ...formData, allowBackorders: checked as boolean })}
								/>
								<Label htmlFor="allowBackorders" className="font-normal cursor-pointer">
									Allow Backorders
								</Label>
							</div>
						</div>

						{/* Additional Information */}
						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="barcode">Barcode</Label>
								<Input
									id="barcode"
									value={formData.barcode}
									onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
									placeholder="Barcode"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="vendor">Vendor</Label>
								<Input
									id="vendor"
									value={formData.vendor}
									onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
									placeholder="Vendor name"
								/>
							</div>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="brand">Brand</Label>
							<Input
								id="brand"
								value={formData.brand}
								onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
								placeholder="Brand name"
							/>
						</div>

						{/* Tags */}
						<div className="grid gap-2">
							<Label>Tags</Label>
							<div className="flex gap-2">
								<Input
									value={tagInput}
									onChange={(e) => setTagInput(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											e.preventDefault();
											handleAddTag();
										}
									}}
									placeholder="Add a tag and press Enter"
								/>
								<Button type="button" variant="outline" onClick={handleAddTag}>
									Add
								</Button>
							</div>
							{formData.tags.length > 0 && (
								<div className="flex flex-wrap gap-2 mt-2">
									{formData.tags.map((tag) => (
										<Badge key={tag} variant="secondary" className="flex items-center gap-1">
											{tag}
											<button
												type="button"
												onClick={() => handleRemoveTag(tag)}
												className="ml-1 hover:text-destructive"
											>
												<X className="h-3 w-3" />
											</button>
										</Badge>
									))}
								</div>
							)}
						</div>

						{/* Images */}
						<div className="grid gap-2">
							<Label>Images</Label>
							<Button type="button" variant="outline" onClick={handleAddImage}>
								Add Image URL
							</Button>
							{formData.images.length > 0 && (
								<div className="space-y-2 mt-2">
									{formData.images.map((image, index) => (
										<div key={index} className="flex items-center gap-2">
											<Input value={image} readOnly className="flex-1" />
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => handleRemoveImage(image)}
											>
												<X className="h-4 w-4" />
											</Button>
										</div>
									))}
								</div>
							)}
						</div>
					</div>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button type="submit" disabled={loading}>
							{loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
