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
import { TrendingDown, Activity, DollarSign, Calendar, AlertTriangle, Target, SkipForward } from "lucide-react";
import { toast } from "sonner";

interface BurnRateDashboardStepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  onSkip?: () => void;
}

export function BurnRateDashboardStep({ onComplete, onSkip }: BurnRateDashboardStepProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleViewDashboard = async () => {
    setIsLoading(true);
    try {
      await onComplete({
        dashboardExplored: true,
        timestamp: new Date().toISOString(),
      });
      toast.success("Burn rate dashboard exploration completed!");
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
          <TrendingDown className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold">Explore Burn Rate Dashboard</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Monitor your monthly spending trends, burn rate, and runway projections 
          to make informed decisions about fundraising and spending.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <TrendingDown className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Monthly Burn Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,000</div>
            <p className="text-xs text-muted-foreground">
              -5% from last month
            </p>
            <CardDescription className="mt-2">
              Average monthly cash outflow
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Calendar className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Runway</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18 months</div>
            <p className="text-xs text-muted-foreground">
              At current burn rate
            </p>
            <CardDescription className="mt-2">
              Time until cash runs out
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <DollarSign className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$810,000</div>
            <p className="text-xs text-muted-foreground">
              Current available funds
            </p>
            <CardDescription className="mt-2">
              Total cash on hand
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Activity className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Revenue Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$28,500</div>
            <p className="text-xs text-muted-foreground">
              Monthly recurring revenue
            </p>
            <CardDescription className="mt-2">
              Current MRR growth
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Target className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Net Burn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">$16,500</div>
            <p className="text-xs text-muted-foreground">
              After revenue
            </p>
            <CardDescription className="mt-2">
              Monthly net cash burn
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <AlertTriangle className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Fundraising Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6 months</div>
            <p className="text-xs text-muted-foreground">
              Recommended start
            </p>
            <CardDescription className="mt-2">
              When to begin fundraising
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="bg-muted/50 rounded-lg p-6">
        <h4 className="font-semibold mb-3">Burn Rate Dashboard Features:</h4>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium">Spending Trends</p>
              <p className="text-xs text-muted-foreground">Track monthly expenses and identify trends</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium">Runway Projections</p>
              <p className="text-xs text-muted-foreground">Calculate time until cash runs out</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium">Revenue vs. Burn</p>
              <p className="text-xs text-muted-foreground">Compare income to expenses</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium">Fundraising Timeline</p>
              <p className="text-xs text-muted-foreground">Know when to start raising capital</p>
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

