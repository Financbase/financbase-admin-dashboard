/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MetricCard, MetricCardData } from '@/components/real-estate/shared/metric-card';
import { PropertyCard, PropertyCardData } from '@/components/real-estate/shared/property-card';
import {
  Home,
  DollarSign,
  Calculator,
  Search,
  Filter,
  Heart,
  Calendar,
  MapPin,
  Star,
  TrendingUp,
  Target,
  CreditCard,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency, formatPercentage } from '@/lib/utils/real-estate-formatting';
import { RoleSwitcher } from '@/components/real-estate/role-switcher';
import { useRealEstateRole } from '@/lib/hooks/use-real-estate-role';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";

interface BuyerStats {
  preApprovedAmount: number;
  monthlyBudget: number;
  downPaymentSaved: number;
  savedProperties: number;
  propertiesViewed: number;
  offersSubmitted: number;
}

export default function BuyerDashboard() {
  const router = useRouter();
  const { role, updateRole } = useRealEstateRole();
  const [monthlyIncome, setMonthlyIncome] = useState(8000);
  const [monthlyDebt, setMonthlyDebt] = useState(500);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);

  // Fetch buyer stats from API
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['buyer-stats'],
    queryFn: async () => {
      const response = await fetch('/api/real-estate/buyer/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      return data.stats;
    },
  });

  // Fetch saved properties from API
  const { data: propertiesData, isLoading: propertiesLoading } = useQuery({
    queryKey: ['saved-properties'],
    queryFn: async () => {
      const response = await fetch('/api/real-estate/buyer/saved-properties?limit=50');
      if (!response.ok) throw new Error('Failed to fetch saved properties');
      const data = await response.json();
      return data;
    },
  });

  // Helper function to calculate monthly payment
  const calculateMonthlyPayment = (price: number, downPaymentPercent: number): number => {
    const loanAmount = price * (1 - downPaymentPercent / 100);
    const monthlyRate = 0.07 / 12; // 7% annual rate
    const termMonths = 30 * 12;
    
    if (monthlyRate === 0) return loanAmount / termMonths;
    
    const monthlyPayment = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);
    
    return Math.round(monthlyPayment);
  };

  // Map API stats to component format
  const stats: BuyerStats = statsData ? {
    preApprovedAmount: statsData.preApprovedAmount || 0,
    monthlyBudget: statsData.monthlyBudget || 0,
    downPaymentSaved: statsData.downPaymentSaved || 0,
    savedProperties: statsData.savedProperties || 0,
    propertiesViewed: statsData.viewedProperties || 0,
    offersSubmitted: statsData.offersSubmitted || 0,
  } : {
    preApprovedAmount: 0,
    monthlyBudget: 0,
    downPaymentSaved: 0,
    savedProperties: 0,
    propertiesViewed: 0,
    offersSubmitted: 0,
  };

  // Map API properties to component format
  const savedProperties: PropertyCardData[] = propertiesData?.savedProperties?.map((prop: any) => ({
    id: prop.id || prop.propertyId,
    name: prop.name,
    address: prop.address,
    city: prop.city,
    state: prop.state,
    zipCode: prop.zipCode,
    price: prop.purchasePrice || 0,
    bedrooms: prop.bedrooms || 0,
    bathrooms: prop.bathrooms || 0,
    squareFootage: prop.squareFootage || 0,
    propertyType: prop.propertyType,
    status: prop.status === 'saved' ? 'active' : prop.status,
    monthlyPayment: prop.purchasePrice ? calculateMonthlyPayment(prop.purchasePrice, downPaymentPercent) : undefined,
    savedDate: prop.savedDate,
    notes: prop.notes || undefined,
    rating: prop.rating || undefined,
  })) || [];

  const kpiMetrics: MetricCardData[] = [
    {
      title: 'Pre-Approved Amount',
      value: stats.preApprovedAmount,
      format: 'currency',
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      title: 'Monthly Budget',
      value: stats.monthlyBudget,
      format: 'currency',
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      title: 'Down Payment Saved',
      value: stats.downPaymentSaved,
      format: 'currency',
      icon: <Target className="h-5 w-5" />,
    },
    {
      title: 'Saved Properties',
      value: stats.savedProperties,
      format: 'number',
      icon: <Heart className="h-5 w-5" />,
    },
  ];

  const activityMetrics: MetricCardData[] = [
    {
      title: 'Properties Viewed',
      value: stats.propertiesViewed,
      format: 'number',
      icon: <Home className="h-4 w-4" />,
      description: 'This month',
    },
    {
      title: 'Offers Submitted',
      value: stats.offersSubmitted,
      format: 'number',
      icon: <TrendingUp className="h-4 w-4" />,
      description: 'This month',
    },
  ];

  // Calculate affordability
  const calculateAffordability = () => {
    const maxMonthlyPayment = (monthlyIncome * 0.28) - monthlyDebt;
    const monthlyRate = 0.07 / 12; // 7% annual rate
    const termMonths = 30 * 12;
    
    const maxLoanAmount = maxMonthlyPayment * 
      (Math.pow(1 + monthlyRate, termMonths) - 1) /
      (monthlyRate * Math.pow(1 + monthlyRate, termMonths));
    
    const maxHomePrice = maxLoanAmount / (1 - downPaymentPercent / 100);
    const recommendedDownPayment = maxHomePrice * (downPaymentPercent / 100);
    
    return {
      maxMonthlyPayment,
      maxLoanAmount,
      maxHomePrice,
      recommendedDownPayment,
    };
  };

  const affordability = calculateAffordability();

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Home Buyer Dashboard</h1>
          <p className="text-muted-foreground">
            Find your dream home and manage your buying journey
          </p>
        </div>
        <div className="flex gap-2">
          {role && <RoleSwitcher currentRole={role} onRoleChange={updateRole} />}
          <Button>
            <Search className="mr-2 h-4 w-4" />
            Search Properties
          </Button>
          <Button variant="outline">
            <Calculator className="mr-2 h-4 w-4" />
            Get Pre-Approved
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
      <div className="grid gap-4 md:grid-cols-2">
        {activityMetrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} variant="compact" />
        ))}
      </div>

      {/* Affordability Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Affordability Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="monthly-income">Monthly Income</Label>
                <Input
                  id="monthly-income"
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="monthly-debt">Monthly Debt Payments</Label>
                <Input
                  id="monthly-debt"
                  type="number"
                  value={monthlyDebt}
                  onChange={(e) => setMonthlyDebt(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="down-payment">Down Payment %</Label>
                <Input
                  id="down-payment"
                  type="number"
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Your Affordability</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Max Monthly Payment:</span>
                  <span className="font-semibold">{formatCurrency(affordability.maxMonthlyPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Max Loan Amount:</span>
                  <span className="font-semibold">{formatCurrency(affordability.maxLoanAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Max Home Price:</span>
                  <span className="font-semibold">{formatCurrency(affordability.maxHomePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Recommended Down Payment:</span>
                  <span className="font-semibold">{formatCurrency(affordability.recommendedDownPayment)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saved Properties */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Saved Properties</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4 mr-1" />
              Search
            </Button>
          </div>
        </div>

        {propertiesLoading ? (
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
        ) : savedProperties.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No saved properties yet. Start searching to save your favorites!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {savedProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                variant="detailed"
                onView={(property) => {
                  console.log('View property:', property.id);
                }}
                onSchedule={(property) => {
                  console.log('Schedule tour:', property.id);
                }}
                onSave={(property) => {
                  console.log('Save property:', property.id);
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
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => router.push('/real-estate/buyer?action=search')}
            >
              <Search className="h-6 w-6" />
              <span>Search Properties</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => {
                toast.info('Mortgage calculator will open in a new window');
              }}
            >
              <Calculator className="h-6 w-6" />
              <span>Mortgage Calculator</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => {
                toast.info('Pre-approval application will be available soon');
              }}
            >
              <CreditCard className="h-6 w-6" />
              <span>Pre-Approval</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => {
                toast.info('Tour scheduling feature will be available soon');
              }}
            >
              <Calendar className="h-6 w-6" />
              <span>Schedule Tours</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
