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
  Heart,
  Calculator,
  Search,
  DollarSign,
  Home,
  TrendingUp,
  Calendar,
  FileText,
  MapPin,
  Star,
  Plus,
  Filter,
  Eye,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency, formatPercentage } from '@/lib/utils/real-estate-formatting';
import { calculateAffordability, calculateMortgagePayment } from '@/lib/utils/real-estate-calculations';
import { RoleSwitcher } from '@/components/real-estate/role-switcher';
import { useRealEstateRole } from '@/lib/hooks/use-real-estate-role';

interface BuyerStats {
  savedProperties: number;
  viewedProperties: number;
  offersSubmitted: number;
  preApprovedAmount: number;
  monthlyBudget: number;
  downPaymentSaved: number;
}

interface SavedProperty extends PropertyCardData {
  savedDate: string;
  notes?: string;
  rating?: number;
}

export default function BuyerDashboard() {
  const { role, updateRole } = useRealEstateRole();
  const [affordabilityInputs, setAffordabilityInputs] = useState({
    monthlyIncome: 8000,
    monthlyDebt: 500,
    downPaymentPercent: 20,
  });

  // Mock data for now - will be replaced with actual API calls
  const stats: BuyerStats = {
    savedProperties: 12,
    viewedProperties: 8,
    offersSubmitted: 2,
    preApprovedAmount: 500000,
    monthlyBudget: 2500,
    downPaymentSaved: 75000,
  };

  const savedProperties: SavedProperty[] = [
    {
      id: '1',
      name: 'Charming Family Home',
      address: '123 Oak Street',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      propertyType: 'residential',
      purchasePrice: 350000,
      currentValue: 365000,
      squareFootage: 1800,
      bedrooms: 3,
      bathrooms: 2,
      status: 'active',
      savedDate: '2024-01-10',
      notes: 'Great neighborhood, good schools',
      rating: 4,
    },
    {
      id: '2',
      name: 'Modern Downtown Condo',
      address: '456 Main St',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62702',
      propertyType: 'residential',
      purchasePrice: 280000,
      currentValue: 295000,
      squareFootage: 1200,
      bedrooms: 2,
      bathrooms: 2,
      status: 'active',
      savedDate: '2024-01-08',
      notes: 'Close to work, modern amenities',
      rating: 5,
    },
  ];

  const affordability = calculateAffordability(
    affordabilityInputs.monthlyIncome,
    affordabilityInputs.monthlyDebt,
    affordabilityInputs.downPaymentPercent
  );

  const kpiMetrics: MetricCardData[] = [
    {
      title: 'Pre-Approved Amount',
      value: stats.preApprovedAmount,
      format: 'currency',
      icon: <DollarSign className="h-5 w-5" />,
      description: 'Maximum loan amount',
    },
    {
      title: 'Monthly Budget',
      value: stats.monthlyBudget,
      format: 'currency',
      icon: <Calculator className="h-5 w-5" />,
      description: 'Target monthly payment',
    },
    {
      title: 'Down Payment Saved',
      value: stats.downPaymentSaved,
      format: 'currency',
      icon: <TrendingUp className="h-5 w-5" />,
      description: 'Available for down payment',
    },
    {
      title: 'Saved Properties',
      value: stats.savedProperties,
      format: 'number',
      icon: <Heart className="h-5 w-5" />,
      description: 'Properties you\'re interested in',
    },
  ];

  const progressMetrics: MetricCardData[] = [
    {
      title: 'Properties Viewed',
      value: stats.viewedProperties,
      format: 'number',
      icon: <Eye className="h-4 w-4" />,
      description: 'In-person visits',
    },
    {
      title: 'Offers Submitted',
      value: stats.offersSubmitted,
      format: 'number',
      icon: <FileText className="h-4 w-4" />,
      description: 'Active offers',
    },
  ];

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
          <Button variant="outline">
            <Search className="mr-2 h-4 w-4" />
            Search Properties
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
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

      {/* Progress Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        {progressMetrics.map((metric, index) => (
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
                <Label htmlFor="monthlyIncome">Monthly Income</Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  value={affordabilityInputs.monthlyIncome}
                  onChange={(e) => setAffordabilityInputs(prev => ({
                    ...prev,
                    monthlyIncome: Number(e.target.value)
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="monthlyDebt">Monthly Debt Payments</Label>
                <Input
                  id="monthlyDebt"
                  type="number"
                  value={affordabilityInputs.monthlyDebt}
                  onChange={(e) => setAffordabilityInputs(prev => ({
                    ...prev,
                    monthlyDebt: Number(e.target.value)
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="downPayment">Down Payment %</Label>
                <Input
                  id="downPayment"
                  type="number"
                  value={affordabilityInputs.downPaymentPercent}
                  onChange={(e) => setAffordabilityInputs(prev => ({
                    ...prev,
                    downPaymentPercent: Number(e.target.value)
                  }))}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Your Affordability</h3>
                <div className="space-y-2">
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
                    <span className="font-semibold text-primary">{formatCurrency(affordability.maxHomePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Recommended Down Payment:</span>
                    <span className="font-semibold">{formatCurrency(affordability.recommendedDownPayment)}</span>
                  </div>
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
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </div>

        {savedProperties.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Saved Properties Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start your home search by saving properties you're interested in.
              </p>
              <Button>
                <Search className="mr-2 h-4 w-4" />
                Start Searching
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {savedProperties.map((property) => (
              <Card key={property.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      <div>
                        <CardTitle className="text-lg">{property.name}</CardTitle>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          <span>{property.city}, {property.state}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {property.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{property.rating}</span>
                        </div>
                      )}
                      <Button variant="ghost" size="sm">
                        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="text-lg font-bold">{formatCurrency(property.currentValue || property.purchasePrice)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Payment</p>
                      <p className="text-sm font-medium">
                        {formatCurrency(calculateMortgagePayment(
                          (property.currentValue || property.purchasePrice) * 0.8,
                          7,
                          30
                        ).monthlyPayment)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Bedrooms</p>
                      <p className="font-medium">{property.bedrooms}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Bathrooms</p>
                      <p className="font-medium">{property.bathrooms}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Square Feet</p>
                      <p className="font-medium">{property.squareFootage?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Saved</p>
                      <p className="font-medium">{new Date(property.savedDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {property.notes && (
                    <div className="p-2 bg-muted rounded text-sm">
                      <p className="text-muted-foreground">Notes:</p>
                      <p>{property.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="mr-2 h-3 w-3" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Calendar className="mr-2 h-3 w-3" />
                      Schedule Tour
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
              <Search className="h-6 w-6" />
              <span>Search Properties</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Calculator className="h-6 w-6" />
              <span>Mortgage Calculator</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <FileText className="h-6 w-6" />
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
