/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import {
	Building2,
	MapPin,
	Home,
	Users,
	Plus,
	Search,
	Filter,
	Eye,
	Edit,
	MoreHorizontal,
	Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface Property {
	id: string;
	name: string;
	address: string;
	city: string;
	state: string;
	zipCode: string;
	propertyType: string;
	purchasePrice: number;
	currentValue?: number;
	squareFootage?: number;
	yearBuilt?: number;
	bedrooms?: number;
	bathrooms?: number;
	status: string;
	monthlyRent?: number;
	occupancyRate?: number;
	roi?: number;
	tenantCount?: number;
}

interface PropertyStats {
	totalProperties: number;
	totalValue: number;
	monthlyIncome: number;
	occupancyRate: number;
	averageROI: number;
	portfolioGrowth: number;
}

export function PropertyPortfolio() {
	// Fetch properties data
	const { data: propertiesData, isLoading: propertiesLoading } = useQuery({
		queryKey: ['properties'],
		queryFn: async () => {
			const response = await fetch('/api/real-estate/properties');
			if (!response.ok) throw new Error('Failed to fetch properties');
			return response.json();
		},
	});

	// Fetch property stats
	const { data: statsData, isLoading: statsLoading } = useQuery({
		queryKey: ['property-stats'],
		queryFn: async () => {
			const response = await fetch('/api/real-estate/stats');
			if (!response.ok) throw new Error('Failed to fetch property stats');
			return response.json();
		},
	});

	const properties: Property[] = propertiesData?.properties || [];
	// Note: stats variable intentionally unused as it's fetched for future dashboard integration

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'active': return 'bg-green-100 text-green-800';
			case 'maintenance': return 'bg-yellow-100 text-yellow-800';
			case 'vacant': return 'bg-red-100 text-red-800';
			case 'sold': return 'bg-blue-100 text-blue-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	};

	const getPropertyTypeIcon = (type: string) => {
		switch (type) {
			case 'residential': return <Home className="h-4 w-4" />;
			case 'commercial': return <Building2 className="h-4 w-4" />;
			default: return <Building2 className="h-4 w-4" />;
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	};

	if (propertiesLoading || statsLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Properties Grid */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{properties.length === 0 ? (
					<div className="col-span-full">
						<Card>
							<CardContent className="text-center py-12">
								<Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
								<h3 className="text-lg font-semibold mb-2">No Properties Yet</h3>
								<p className="text-muted-foreground mb-4">
									Start building your real estate portfolio by adding your first property.
								</p>
								<Button>
									<Plus className="mr-2 h-4 w-4" />
									Add Your First Property
								</Button>
							</CardContent>
						</Card>
					</div>
				) : (
					properties.map((property) => (
						<Card key={property.id} className="hover:shadow-lg transition-shadow">
							<CardHeader className="pb-3">
								<div className="flex items-start justify-between">
									<div className="flex items-center gap-2">
										{getPropertyTypeIcon(property.propertyType)}
										<div>
											<CardTitle className="text-lg">{property.name}</CardTitle>
											<div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
												<MapPin className="h-3 w-3" />
												<span>{property.address}, {property.city}, {property.state}</span>
											</div>
										</div>
									</div>
									<Button variant="ghost" size="sm">
										<MoreHorizontal className="h-4 w-4" />
									</Button>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-muted-foreground">Current Value</p>
										<p className="text-lg font-bold">
											{property.currentValue ? formatCurrency(property.currentValue) : 'Not set'}
										</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Purchase Price</p>
										<p className="text-sm font-medium">{formatCurrency(property.purchasePrice)}</p>
									</div>
								</div>

								{property.monthlyRent && (
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm text-muted-foreground">Monthly Rent</p>
											<p className="text-lg font-semibold text-green-600">
												{formatCurrency(property.monthlyRent)}
											</p>
										</div>
										<div>
											<p className="text-sm text-muted-foreground">Occupancy</p>
											<p className="text-sm font-medium">
												{property.occupancyRate || 0}%
											</p>
										</div>
									</div>
								)}

								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Badge className={getStatusColor(property.status)}>
											{property.status}
										</Badge>
										{property.tenantCount !== undefined && (
											<div className="flex items-center gap-1">
												<Users className="h-3 w-3 text-muted-foreground" />
												<span className="text-xs text-muted-foreground">
													{property.tenantCount} tenant{property.tenantCount !== 1 ? 's' : ''}
												</span>
											</div>
										)}
									</div>
									{property.roi && (
										<div className="text-right">
											<p className="text-sm text-muted-foreground">ROI</p>
											<p className="text-sm font-semibold text-green-600">
												{property.roi.toFixed(1)}%
											</p>
										</div>
									)}
								</div>

								<div className="flex gap-2">
									<Button variant="outline" size="sm" className="flex-1">
										<Eye className="mr-2 h-3 w-3" />
										View Details
									</Button>
									<Button variant="outline" size="sm" className="flex-1">
										<Edit className="mr-2 h-3 w-3" />
										Edit
									</Button>
								</div>
							</CardContent>
						</Card>
					))
				)}
			</div>

			{/* Properties Table */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>All Properties</CardTitle>
							<p className="text-sm text-muted-foreground">
								Complete list of your real estate investments
							</p>
						</div>
						<div className="flex gap-2">
							<Button variant="outline" size="sm">
								<Filter className="mr-2 h-4 w-4" />
								Filter
							</Button>
							<Button variant="outline" size="sm">
								<Search className="mr-2 h-4 w-4" />
								Search
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Property</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Location</TableHead>
								<TableHead>Current Value</TableHead>
								<TableHead>Monthly Rent</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>ROI</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{properties.length === 0 ? (
								<TableRow>
									<TableCell colSpan={8} className="text-center py-8">
										No properties found. Add your first property to get started.
									</TableCell>
								</TableRow>
							) : (
								properties.map((property) => (
									<TableRow key={property.id}>
										<TableCell>
											<div>
												<p className="font-medium">{property.name}</p>
												<p className="text-sm text-muted-foreground">
													{property.bedrooms} bed • {property.bathrooms} bath • {property.squareFootage?.toLocaleString()} sq ft
												</p>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												{getPropertyTypeIcon(property.propertyType)}
												<span className="capitalize">{property.propertyType}</span>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-1">
												<MapPin className="h-3 w-3 text-muted-foreground" />
												<span className="text-sm">
													{property.city}, {property.state}
												</span>
											</div>
										</TableCell>
										<TableCell>
											{property.currentValue ? formatCurrency(property.currentValue) : 'Not set'}
										</TableCell>
										<TableCell>
											{property.monthlyRent ? formatCurrency(property.monthlyRent) : 'N/A'}
										</TableCell>
										<TableCell>
											<Badge className={getStatusColor(property.status)}>
												{property.status}
											</Badge>
										</TableCell>
										<TableCell>
											{property.roi ? (
												<span className="font-semibold text-green-600">
													{property.roi.toFixed(1)}%
												</span>
											) : 'N/A'}
										</TableCell>
										<TableCell>
											<div className="flex gap-1">
												<Button variant="ghost" size="sm">
													<Eye className="h-4 w-4" />
												</Button>
												<Button variant="ghost" size="sm">
													<Edit className="h-4 w-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
