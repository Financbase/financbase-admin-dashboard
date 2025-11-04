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
import { MetricCard, MetricCardData } from '@/components/real-estate/shared/metric-card';
import { PropertyCard, PropertyCardData } from '@/components/real-estate/shared/property-card';
import {
  Briefcase,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  Eye,
  Plus,
  Phone,
  Mail,
  MapPin,
  Clock,
  Target,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency, formatPercentage } from '@/lib/utils/real-estate-formatting';
import { RoleSwitcher } from '@/components/real-estate/role-switcher';
import { useRealEstateRole } from '@/lib/hooks/use-real-estate-role';

interface RealtorStats {
  activeListings: number;
  totalCommissions: number;
  monthlyCommissions: number;
  averageDaysOnMarket: number;
  conversionRate: number;
  totalLeads: number;
  newLeads: number;
  scheduledShowings: number;
  closedDeals: number;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'viewing' | 'offer' | 'closed';
  propertyInterest?: string;
  budget?: number;
  lastContact: string;
  source: string;
}

export default function RealtorDashboard() {
  const { role, updateRole } = useRealEstateRole();

  // Fetch realtor stats from API
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['realtor-stats'],
    queryFn: async () => {
      const response = await fetch('/api/real-estate/realtor/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      return data.stats;
    },
  });

  // Fetch leads from API
  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: ['realtor-leads'],
    queryFn: async () => {
      const response = await fetch('/api/real-estate/realtor/leads?limit=50');
      if (!response.ok) throw new Error('Failed to fetch leads');
      const data = await response.json();
      return data;
    },
  });

  // Fetch listings from API
  const { data: listingsData, isLoading: listingsLoading } = useQuery({
    queryKey: ['realtor-listings'],
    queryFn: async () => {
      const response = await fetch('/api/real-estate/realtor/listings?limit=50');
      if (!response.ok) throw new Error('Failed to fetch listings');
      const data = await response.json();
      return data;
    },
  });

  // Map API stats to component format
  const stats: RealtorStats = statsData ? {
    activeListings: statsData.activeListings || 0,
    totalCommissions: statsData.totalCommissions || 0,
    monthlyCommissions: statsData.monthlyCommissions || 0,
    averageDaysOnMarket: Math.round(statsData.averageDaysOnMarket || 0),
    conversionRate: statsData.conversionRate || 0,
    totalLeads: statsData.totalLeads || 0,
    newLeads: statsData.newLeads || 0,
    scheduledShowings: statsData.scheduledShowings || 0,
    closedDeals: statsData.closedDeals || 0,
  } : {
    activeListings: 0,
    totalCommissions: 0,
    monthlyCommissions: 0,
    averageDaysOnMarket: 0,
    conversionRate: 0,
    totalLeads: 0,
    newLeads: 0,
    scheduledShowings: 0,
    closedDeals: 0,
  };

  // Map API leads to component format
  const leads: Lead[] = leadsData?.leads?.map((lead: any) => ({
    id: String(lead.id),
    name: lead.name,
    email: lead.email,
    phone: lead.phone || '',
    status: lead.status || 'new',
    propertyInterest: lead.propertyInterest || undefined,
    budget: lead.budget || undefined,
    lastContact: typeof lead.lastContact === 'string' ? lead.lastContact : (lead.lastContact?.toISOString?.().split('T')[0] || new Date().toISOString().split('T')[0]),
    source: lead.source || 'Unknown',
  })) || [];

  // Helper function to calculate monthly payment
  const calculateMonthlyPayment = (price: number): number => {
    const loanAmount = price * 0.8; // 20% down payment
    const monthlyRate = 0.07 / 12; // 7% annual rate
    const termMonths = 30 * 12;
    
    if (monthlyRate === 0) return loanAmount / termMonths;
    
    const monthlyPayment = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);
    
    return Math.round(monthlyPayment);
  };

  // Map API listings to component format
  const listings: PropertyCardData[] = listingsData?.listings?.map((listing: any) => ({
    id: String(listing.id),
    name: listing.name,
    address: listing.address,
    city: listing.city,
    state: listing.state,
    zipCode: listing.zipCode,
    price: listing.purchasePrice || 0,
    bedrooms: listing.bedrooms || 0,
    bathrooms: listing.bathrooms || 0,
    squareFootage: listing.squareFootage || 0,
    propertyType: listing.propertyType,
    status: listing.status === 'active' ? 'active' : listing.status || 'active',
    monthlyPayment: listing.purchasePrice ? calculateMonthlyPayment(listing.purchasePrice) : undefined,
  })) || [];

  const kpiMetrics: MetricCardData[] = [
    {
      title: 'Active Listings',
      value: stats.activeListings,
      format: 'number',
      icon: <Briefcase className="h-5 w-5" />,
      change: 2,
      changeType: 'increase',
      trend: 'up',
    },
    {
      title: 'Monthly Commissions',
      value: stats.monthlyCommissions,
      format: 'currency',
      icon: <DollarSign className="h-5 w-5" />,
      change: 12.5,
      changeType: 'increase',
      trend: 'up',
    },
    {
      title: 'Conversion Rate',
      value: stats.conversionRate,
      format: 'percentage',
      icon: <Target className="h-5 w-5" />,
      change: 2.1,
      changeType: 'increase',
      trend: 'up',
    },
    {
      title: 'Avg Days on Market',
      value: stats.averageDaysOnMarket,
      format: 'number',
      icon: <Clock className="h-5 w-5" />,
      change: -5,
      changeType: 'increase',
      trend: 'up',
    },
  ];

  const activityMetrics: MetricCardData[] = [
    {
      title: 'New Leads',
      value: stats.newLeads,
      format: 'number',
      icon: <Users className="h-4 w-4" />,
      description: 'This week',
    },
    {
      title: 'Scheduled Showings',
      value: stats.scheduledShowings,
      format: 'number',
      icon: <Calendar className="h-4 w-4" />,
      description: 'This week',
    },
    {
      title: 'Closed Deals',
      value: stats.closedDeals,
      format: 'number',
      icon: <TrendingUp className="h-4 w-4" />,
      description: 'This month',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'viewing':
        return 'bg-purple-100 text-purple-800';
      case 'offer':
        return 'bg-orange-100 text-orange-800';
      case 'closed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Realtor Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your listings, leads, and client relationships
          </p>
        </div>
        <div className="flex gap-2">
          {role && <RoleSwitcher currentRole={role} onRoleChange={updateRole} />}
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Showing
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Listing
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {statsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpiMetrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>
      )}

      {/* Activity Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        {activityMetrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} variant="compact" />
        ))}
      </div>

      {/* Active Listings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Active Listings</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </div>

        {listingsLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No active listings yet. Create your first listing to get started!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <PropertyCard
                key={listing.id}
                property={listing}
                variant="detailed"
                onView={(property) => {
                  console.log('View listing:', property.id);
                }}
                onEdit={(property) => {
                  console.log('Edit listing:', property.id);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lead Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          {leadsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse p-4 border rounded-lg">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No leads yet. Start connecting with potential clients!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {leads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{lead.name}</h3>
                      <Badge className={getStatusColor(lead.status)}>
                        {lead.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <p>{lead.email}</p>
                        <p>{lead.phone}</p>
                      </div>
                      <div>
                        <p>Interest: {lead.propertyInterest || 'Not specified'}</p>
                        <p>Budget: {lead.budget ? formatCurrency(lead.budget) : 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Calendar className="h-6 w-6" />
              <span>Schedule Showing</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Users className="h-6 w-6" />
              <span>Add Lead</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              <span>Market Analysis</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <DollarSign className="h-6 w-6" />
              <span>Commission Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
