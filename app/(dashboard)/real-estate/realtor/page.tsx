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

  // Mock data for now - will be replaced with actual API calls
  const stats: RealtorStats = {
    activeListings: 12,
    totalCommissions: 125000,
    monthlyCommissions: 8500,
    averageDaysOnMarket: 45,
    conversionRate: 15.2,
    totalLeads: 48,
    newLeads: 8,
    scheduledShowings: 6,
    closedDeals: 3,
  };

  const leads: Lead[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '(555) 123-4567',
      status: 'new',
      propertyInterest: '3BR Single Family',
      budget: 450000,
      lastContact: '2024-01-15',
      source: 'Website',
    },
    {
      id: '2',
      name: 'Mike Chen',
      email: 'mike.chen@email.com',
      phone: '(555) 987-6543',
      status: 'viewing',
      propertyInterest: '2BR Condo',
      budget: 320000,
      lastContact: '2024-01-14',
      source: 'Referral',
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily.r@email.com',
      phone: '(555) 456-7890',
      status: 'offer',
      propertyInterest: '4BR Single Family',
      budget: 550000,
      lastContact: '2024-01-13',
      source: 'Social Media',
    },
  ];

  const listings: PropertyCardData[] = [
    {
      id: '1',
      name: 'Modern Downtown Condo',
      address: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      price: 295000,
      bedrooms: 2,
      bathrooms: 2,
      squareFootage: 1200,
      propertyType: 'condo',
      status: 'active',
      monthlyPayment: 1570,
    },
    {
      id: '2',
      name: 'Charming Family Home',
      address: '456 Oak Ave',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62702',
      price: 365000,
      bedrooms: 3,
      bathrooms: 2,
      squareFootage: 1800,
      propertyType: 'single_family',
      status: 'active',
      monthlyPayment: 1943,
    },
  ];

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiMetrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>

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
      </div>

      {/* Lead Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
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
                      <p>Interest: {lead.propertyInterest}</p>
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
