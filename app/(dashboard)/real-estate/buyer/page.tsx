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

interface BuyerStats {
  preApprovedAmount: number;
  monthlyBudget: number;
  downPaymentSaved: number;
  savedProperties: number;
  propertiesViewed: number;
  offersSubmitted: number;
}

export default function BuyerDashboard() {
  const { role, updateRole } = useRealEstateRole();
  const [monthlyIncome, setMonthlyIncome] = useState(8000);
  const [monthlyDebt, setMonthlyDebt] = useState(500);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);

  // Mock data for now - will be replaced with actual API calls
  const stats: BuyerStats = {
    preApprovedAmount: 500000,
    monthlyBudget: 2500,
    downPaymentSaved: 75000,
    savedProperties: 12,
    propertiesViewed: 8,
    offersSubmitted: 2,
  };

  const savedProperties: PropertyCardData[] = [
    {
      id: '1',
      name: 'Charming Family Home',
      address: '123 Oak Street',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      price: 365000,
      bedrooms: 3,
      bathrooms: 2,
      squareFootage: 1800,
      propertyType: 'single_family',
      status: 'active',
      monthlyPayment: 1943,
      savedDate: '2024-01-09',
      notes: 'Great neighborhood, good schools',
      rating: 4.5,
    },
    {
      id: '2',
      name: 'Modern Downtown Condo',
      address: '456 Main Street',
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
      savedDate: '2024-01-07',
      notes: 'Close to work, modern amenities',
      rating: 4.2,
    },
  ];

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiMetrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>

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
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Search className="h-6 w-6" />
              <span>Search Properties</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Calculator className="h-6 w-6" />
              <span>Mortgage Calculator</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <CreditCard className="h-6 w-6" />
              <span>Pre-Approval</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Calendar className="h-6 w-6" />
              <span>Schedule Tours</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
