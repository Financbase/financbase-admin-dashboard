/**
 * Unified Data View Component
 * Toggle between single org view and unified view
 * Aggregate data across organizations
 * 
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOrganization } from '@/contexts/organization-context';
import { Building2, Eye, EyeOff, Filter } from 'lucide-react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

interface UnifiedDataViewProps {
	children: React.ReactNode;
	title?: string;
	description?: string;
}

export function UnifiedDataView({ children, title, description }: UnifiedDataViewProps) {
	const { organizations, activeOrganization } = useOrganization();
	const [viewMode, setViewMode] = useState<'single' | 'unified'>('single');
	const [selectedOrgFilter, setSelectedOrgFilter] = useState<string | 'all'>('all');

	const canUseUnifiedView = organizations.length > 1;

	return (
		<div className="space-y-4">
			{canUseUnifiedView && (
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="flex items-center gap-2">
									<Filter className="h-5 w-5" />
									{title || 'Data View'}
								</CardTitle>
								{description && (
									<CardDescription>{description}</CardDescription>
								)}
							</div>
							<div className="flex items-center gap-2">
								<Button
									variant={viewMode === 'single' ? 'default' : 'outline'}
									size="sm"
									onClick={() => setViewMode('single')}
								>
									<Eye className="mr-2 h-4 w-4" />
									Single Organization
								</Button>
								<Button
									variant={viewMode === 'unified' ? 'default' : 'outline'}
									size="sm"
									onClick={() => setViewMode('unified')}
								>
									<EyeOff className="mr-2 h-4 w-4" />
									Unified View
								</Button>
							</div>
						</div>
					</CardHeader>
					{viewMode === 'unified' && (
						<CardContent>
							<div className="flex items-center gap-2">
								<Select value={selectedOrgFilter} onValueChange={(v) => setSelectedOrgFilter(v)}>
									<SelectTrigger className="w-[200px]">
										<SelectValue placeholder="Filter by organization" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Organizations</SelectItem>
										{organizations.map((org) => (
											<SelectItem key={org.id} value={org.id}>
												<div className="flex items-center gap-2">
													{org.logo ? (
														<img src={org.logo} alt={org.name} className="h-4 w-4 rounded" />
													) : (
														<Building2 className="h-4 w-4" />
													)}
													{org.name}
													{activeOrganization?.id === org.id && (
														<Badge variant="secondary" className="ml-1 text-xs">
															Active
														</Badge>
													)}
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{selectedOrgFilter !== 'all' && (
									<Badge variant="outline">
										Filtered: {organizations.find((o) => o.id === selectedOrgFilter)?.name}
									</Badge>
								)}
							</div>
						</CardContent>
					)}
				</Card>
			)}

			<div className={viewMode === 'unified' ? 'opacity-75' : ''}>
				{React.cloneElement(children as React.ReactElement, {
					viewMode,
					organizationFilter: viewMode === 'unified' ? selectedOrgFilter : activeOrganization?.id,
				})}
			</div>

			{viewMode === 'unified' && (
				<Card>
					<CardContent className="pt-6">
						<div className="text-sm text-muted-foreground text-center">
							<p className="mb-2">
								<strong>Unified View:</strong> Showing aggregated data across{' '}
								{selectedOrgFilter === 'all' ? 'all organizations' : 'selected organization'}
							</p>
							<p className="text-xs">
								Note: Some features may be limited in unified view. Switch to single organization view for full functionality.
							</p>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

