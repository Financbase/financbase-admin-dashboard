"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MetricCard, MetricCardData } from '@/components/real-estate/shared/metric-card';
import { PropertyCard, PropertyCardData } from '@/components/real-estate/shared/property-card';
import {
  TrendingUp,
  DollarSign,
  Home,
  Users,
  Calendar,
  Wrench,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency, formatPercentage } from '@/lib/utils/real-estate-formatting';
import { RoleSwitcher } from '@/components/real-estate/role-switcher';
import { useRealEstateRole } from '@/lib/hooks/use-real-estate-role';

interface InvestorStats {
  totalProperties: number;
  totalValue: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netCashFlow: number;
  occupancyRate: number;
  averageROI: number;
  portfolioGrowth: number;
  activeProperties: number;
  vacantProperties: number;
  maintenanceProperties: number;
}

export default function InvestorDashboard() {
  const { role, updateRole } = useRealEstateRole();

  // Fetch investor stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['investor-stats'],
    queryFn: async () => {
      const response = await fetch('/api/real-estate/stats');
      if (!response.ok) throw new Error('Failed to fetch investor stats');
      return response.json();
    },
  });

  // Fetch properties
  const { data: propertiesData, isLoading: propertiesLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const response = await fetch('/api/real-estate/properties');
      if (!response.ok) throw new Error('Failed to fetch properties');
      return response.json();
    },
  });

  const stats: InvestorStats = statsData?.stats || {
    totalProperties: 0,
    totalValue: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    netCashFlow: 0,
    occupancyRate: 0,
    averageROI: 0,
    portfolioGrowth: 0,
    activeProperties: 0,
    vacantProperties: 0,
    maintenanceProperties: 0,
  };

  const properties: PropertyCardData[] = propertiesData?.properties || [];

  const kpiMetrics: MetricCardData[] = [
    {
      title: 'Total Portfolio Value',
      value: stats.totalValue,
      format: 'currency',
      icon: <TrendingUp className="h-5 w-5" />,
      change: stats.portfolioGrowth,
      changeType: stats.portfolioGrowth > 0 ? 'increase' : stats.portfolioGrowth < 0 ? 'decrease' : 'neutral',
      trend: stats.portfolioGrowth > 0 ? 'up' : stats.portfolioGrowth < 0 ? 'down' : 'stable',
    },
    {
      title: 'Monthly Cash Flow',
      value: stats.netCashFlow,
      format: 'currency',
      icon: <DollarSign className="h-5 w-5" />,
      change: stats.monthlyIncome > 0 ? ((stats.netCashFlow / stats.monthlyIncome) * 100) : 0,
      changeType: stats.netCashFlow > 0 ? 'increase' : stats.netCashFlow < 0 ? 'decrease' : 'neutral',
      trend: stats.netCashFlow > 0 ? 'up' : stats.netCashFlow < 0 ? 'down' : 'stable',
    },
    {
      title: 'Average ROI',
      value: stats.averageROI,
      format: 'percentage',
      icon: <TrendingUp className="h-5 w-5" />,
      change: stats.averageROI > 10 ? 5 : stats.averageROI > 5 ? 2 : 0,
      changeType: stats.averageROI > 10 ? 'increase' : stats.averageROI > 5 ? 'increase' : 'neutral',
      trend: stats.averageROI > 10 ? 'up' : stats.averageROI > 5 ? 'up' : 'stable',
    },
    {
      title: 'Occupancy Rate',
      value: stats.occupancyRate,
      format: 'percentage',
      icon: <Users className="h-5 w-5" />,
      change: stats.occupancyRate > 90 ? 2 : stats.occupancyRate > 80 ? 1 : -1,
      changeType: stats.occupancyRate > 90 ? 'increase' : stats.occupancyRate > 80 ? 'increase' : 'decrease',
      trend: stats.occupancyRate > 90 ? 'up' : stats.occupancyRate > 80 ? 'up' : 'down',
    },
  ];

  const propertyStatusMetrics: MetricCardData[] = [
    {
      title: 'Active Properties',
      value: stats.activeProperties,
      format: 'number',
      icon: <Home className="h-4 w-4" />,
      description: 'Currently rented and generating income',
    },
    {
      title: 'Vacant Properties',
      value: stats.vacantProperties,
      format: 'number',
      icon: <Minus className="h-4 w-4" />,
      description: 'Available for rent',
    },
    {
      title: 'Under Maintenance',
      value: stats.maintenanceProperties,
      format: 'number',
      icon: <Wrench className="h-4 w-4" />,
      description: 'Requiring repairs or updates',
    },
  ];

  if (statsLoading || propertiesLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Property Investor Dashboard</h1>
          <p className="text-muted-foreground">
            Track your portfolio performance and manage your investments
          </p>
        </div>
        <div className="flex gap-2">
          {role && <RoleSwitcher currentRole={role} onRoleChange={updateRole} />}
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiMetrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>

      {/* Property Status Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        {propertyStatusMetrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} variant="compact" />
        ))}
      </div>

      {/* Properties Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Your Properties</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </div>

        {properties.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.slice(0, 6).map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                variant="detailed"
                onView={(property) => {
                  // Handle view action
                  console.log('View property:', property.id);
                }}
                onEdit={(property) => {
                  // Handle edit action
                  console.log('Edit property:', property.id);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Calendar className="h-6 w-6" />
              <span>Schedule Maintenance</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Users className="h-6 w-6" />
              <span>Manage Tenants</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              <span>View Analytics</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <DollarSign className="h-6 w-6" />
              <span>Track Expenses</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
