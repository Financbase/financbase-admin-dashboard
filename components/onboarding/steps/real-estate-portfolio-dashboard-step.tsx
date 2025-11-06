/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Home, Calendar, DollarSign, AlertCircle, SkipForward } from "lucide-react";
import { toast } from "sonner";

interface RealEstatePortfolioDashboardStepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  onSkip?: () => void;
}

export function RealEstatePortfolioDashboardStep({ onComplete, onSkip }: RealEstatePortfolioDashboardStepProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleViewDashboard = async () => {
    setIsLoading(true);
    try {
      await onComplete({
        dashboardExplored: true,
        timestamp: new Date().toISOString(),
      });
      toast.success("Portfolio dashboard exploration completed!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      await onComplete({
        dashboardExplored: false,
        skipped: true,
        timestamp: new Date().toISOString(),
      });
      toast.info("Dashboard tour skipped");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <BarChart3 className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold">Explore Portfolio Dashboard</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Monitor your real estate portfolio with a complete overview of properties, 
          rental trends, and investment performance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Home className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              3 active rentals, 2 vacant
            </p>
            <CardDescription className="mt-2">
              Track all your properties in one place
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <DollarSign className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$7,500</div>
            <p className="text-xs text-muted-foreground">
              +$500 from last month
            </p>
            <CardDescription className="mt-2">
              Total rental income across portfolio
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <TrendingUp className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Portfolio ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5%</div>
            <p className="text-xs text-muted-foreground">
              Annual return on investment
            </p>
            <CardDescription className="mt-2">
              Track overall portfolio performance
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Calendar className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Lease Expiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Next 90 days
            </p>
            <CardDescription className="mt-2">
              Stay ahead of lease renewals
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <BarChart3 className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$4,200</div>
            <p className="text-xs text-muted-foreground">
              Net after expenses
            </p>
            <CardDescription className="mt-2">
              Monthly cash flow across all properties
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <AlertCircle className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,200</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
            <CardDescription className="mt-2">
              Track maintenance and repairs
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="bg-muted/50 rounded-lg p-6">
        <h4 className="font-semibold mb-3">Portfolio Dashboard Features:</h4>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium">Property Overview</p>
              <p className="text-xs text-muted-foreground">See all properties, status, and key metrics at a glance</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium">Rental Trends</p>
              <p className="text-xs text-muted-foreground">Track income trends and occupancy rates over time</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium">Lease Management</p>
              <p className="text-xs text-muted-foreground">Monitor upcoming lease expiries and renewals</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium">Performance Analytics</p>
              <p className="text-xs text-muted-foreground">ROI, cash-on-cash return, and growth metrics</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        {onSkip && (
          <Button variant="outline" onClick={handleSkip} disabled={isLoading}>
            <SkipForward className="h-4 w-4 mr-2" />
            Skip tour
          </Button>
        )}
        <Button onClick={handleViewDashboard} disabled={isLoading}>
          {isLoading ? "Loading..." : "View Dashboard"}
        </Button>
      </div>
    </div>
  );
}

