/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

'use client';

import { useState, useEffect } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Package, Calendar, DollarSign, User, Truck, FileText, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { logger } from '@/lib/logger';

interface Order {
	id: string;
	orderNumber: string;
	customerId?: string;
	status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
	priority?: "low" | "normal" | "high" | "urgent";
	totalAmount: string;
	products: any;
	orderDate: string;
	dueDate?: string;
	trackingNumber?: string;
	createdAt: string;
	updatedAt?: string;
	customer?: {
		id: string;
		name: string;
		email: string;
	} | null;
	shippingAddress?: {
		street: string;
		city: string;
		state: string;
		zipCode: string;
		country: string;
	} | null;
}

interface OrderDetailDialogProps {
	orderId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onUpdate?: () => void;
}

export function OrderDetailDialog({
	orderId,
	open,
	onOpenChange,
	onUpdate,
}: OrderDetailDialogProps) {
	const [order, setOrder] = useState<Order | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (open && orderId) {
			fetchOrder();
		} else {
			setOrder(null);
			setLoading(true);
		}
	}, [open, orderId]);

	const fetchOrder = async () => {
		try {
			setLoading(true);
			const response = await fetch(`/api/orders/${orderId}`);
			if (!response.ok) {
				if (response.status === 404) {
					toast.error('Order not found');
					onOpenChange(false);
					return;
				}
				throw new Error('Failed to fetch order');
			}
			const data = await response.json();
			setOrder(data);
		} catch (error) {
			logger.error('Error fetching order:', error);
			toast.error('Failed to load order details');
		} finally {
			setLoading(false);
		}
	};

	const getStatusColor = (status: string) => {
		const colors: Record<string, string> = {
			pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
			processing: 'bg-blue-100 text-blue-800 border-blue-200',
			shipped: 'bg-green-100 text-green-800 border-green-200',
			delivered: 'bg-purple-100 text-purple-800 border-purple-200',
			cancelled: 'bg-red-100 text-red-800 border-red-200',
			refunded: 'bg-gray-100 text-gray-800 border-gray-200',
		};
		return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
	};

	const getPriorityColor = (priority?: string) => {
		const colors: Record<string, string> = {
			urgent: 'bg-red-100 text-red-800 border-red-200',
			high: 'bg-orange-100 text-orange-800 border-orange-200',
			normal: 'bg-blue-100 text-blue-800 border-blue-200',
			low: 'bg-gray-100 text-gray-800 border-gray-200',
		};
		return colors[priority || 'normal'] || 'bg-gray-100 text-gray-800 border-gray-200';
	};

	if (loading) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
					<DialogHeader>
						<DialogTitle>Loading Order Details...</DialogTitle>
					</DialogHeader>
					<div className="flex items-center justify-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	if (!order) {
		return null;
	}

	const totalAmount = parseFloat(order.totalAmount || "0");
	const products = Array.isArray(order.products) ? order.products : [];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
				<DialogHeader>
					<DialogTitle className="flex items-center justify-between">
						<span>Order {order.orderNumber}</span>
						<div className="flex gap-2">
							<Badge className={getStatusColor(order.status)} variant="secondary">
								{order.status.charAt(0).toUpperCase() + order.status.slice(1)}
							</Badge>
							{order.priority && (
								<Badge className={getPriorityColor(order.priority)} variant="secondary">
									{order.priority}
								</Badge>
							)}
						</div>
					</DialogTitle>
					<DialogDescription>
						Order placed on {order.orderDate ? format(new Date(order.orderDate), 'PPp') : 'N/A'}
					</DialogDescription>
				</DialogHeader>

				<ScrollArea className="flex-1 pr-4">
					<div className="space-y-6">
						{/* Order Information */}
						<div className="space-y-4">
							<div>
								<h3 className="font-semibold mb-2 flex items-center gap-2">
									<Package className="h-4 w-4" />
									Order Information
								</h3>
								<div className="grid grid-cols-2 gap-4 text-sm">
									<div>
										<div className="text-muted-foreground">Order Number</div>
										<div className="font-medium font-mono">{order.orderNumber}</div>
									</div>
									<div>
										<div className="text-muted-foreground">Order ID</div>
										<div className="font-medium font-mono text-xs">{order.id}</div>
									</div>
									<div>
										<div className="text-muted-foreground">Status</div>
										<Badge className={getStatusColor(order.status)} variant="secondary">
											{order.status.charAt(0).toUpperCase() + order.status.slice(1)}
										</Badge>
									</div>
									{order.priority && (
										<div>
											<div className="text-muted-foreground">Priority</div>
											<Badge className={getPriorityColor(order.priority)} variant="secondary">
												{order.priority.charAt(0).toUpperCase() + order.priority.slice(1)}
											</Badge>
										</div>
									)}
									<div>
										<div className="text-muted-foreground">Order Date</div>
										<div className="font-medium">
											{order.orderDate ? format(new Date(order.orderDate), 'PPp') : 'N/A'}
										</div>
									</div>
									{order.dueDate && (
										<div>
											<div className="text-muted-foreground">Due Date</div>
											<div className="font-medium">
												{format(new Date(order.dueDate), 'PPp')}
											</div>
										</div>
									)}
									<div>
										<div className="text-muted-foreground">Total Amount</div>
										<div className="font-medium text-lg text-primary">
											${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
										</div>
									</div>
									{order.trackingNumber && (
										<div>
											<div className="text-muted-foreground">Tracking Number</div>
											<div className="font-medium font-mono">{order.trackingNumber}</div>
										</div>
									)}
								</div>
							</div>

							<Separator />

							{/* Customer Information */}
							{order.customer && (
								<div>
									<h3 className="font-semibold mb-2 flex items-center gap-2">
										<User className="h-4 w-4" />
										Customer Information
									</h3>
									<div className="grid grid-cols-2 gap-4 text-sm">
										<div>
											<div className="text-muted-foreground">Name</div>
											<div className="font-medium">{order.customer.name}</div>
										</div>
										<div>
											<div className="text-muted-foreground">Email</div>
											<div className="font-medium">{order.customer.email}</div>
										</div>
										{order.customerId && (
											<div>
												<div className="text-muted-foreground">Customer ID</div>
												<div className="font-medium font-mono text-xs">{order.customerId}</div>
											</div>
										)}
									</div>
								</div>
							)}

							{/* Shipping Address */}
							{order.shippingAddress && (
								<>
									<Separator />
									<div>
										<h3 className="font-semibold mb-2 flex items-center gap-2">
											<Truck className="h-4 w-4" />
											Shipping Address
										</h3>
										<div className="text-sm">
											<div className="font-medium">{order.shippingAddress.street}</div>
											<div className="text-muted-foreground">
												{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
											</div>
											<div className="text-muted-foreground">{order.shippingAddress.country}</div>
										</div>
									</div>
								</>
							)}

							{/* Products */}
							{products.length > 0 && (
								<>
									<Separator />
									<div>
										<h3 className="font-semibold mb-2 flex items-center gap-2">
											<Package className="h-4 w-4" />
											Products ({products.length})
										</h3>
										<div className="space-y-2">
											{products.map((product: any, index: number) => (
												<div key={index} className="flex items-center justify-between p-3 border rounded-lg">
													<div className="flex-1">
														<div className="font-medium">
															{product.name || product.productId || `Product ${index + 1}`}
														</div>
														{product.description && (
															<div className="text-sm text-muted-foreground">{product.description}</div>
														)}
														{product.quantity && (
															<div className="text-sm text-muted-foreground">
																Quantity: {product.quantity}
															</div>
														)}
													</div>
													{product.price && (
														<div className="font-medium">
															${parseFloat(product.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
														</div>
													)}
												</div>
											))}
										</div>
									</div>
								</>
							)}
						</div>
					</div>
				</ScrollArea>

				<div className="flex justify-end gap-2 pt-4 border-t">
					<Button
						variant="outline"
						onClick={() => {
							toast.info('Edit order functionality coming soon');
						}}
					>
						<Edit className="h-4 w-4 mr-2" />
						Edit Order
					</Button>
					<Button
						onClick={() => {
							onOpenChange(false);
							if (onUpdate) {
								onUpdate();
							}
						}}
					>
						Close
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

