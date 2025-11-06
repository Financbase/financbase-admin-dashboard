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
import { Heart, Activity, DollarSign, TrendingUp, Receipt, Calendar, AlertCircle, SkipForward } from "lucide-react";
import { toast } from "sonner";

interface BusinessHealthStepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  onSkip?: () => void;
}

export function BusinessHealthStep({ onComplete, onSkip }: BusinessHealthStepProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleViewDashboard = async () => {
    setIsLoading(true);
    try {
      await onComplete({
        dashboardExplored: true,
        timestamp: new Date().toISOString(),
      });
      toast.success("Business health dashboard exploration completed!");
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
          <Heart className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold">Monitor Business Health</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          See real-time income/expenses and estimated taxes owed. This dashboard helps you 
          stay on top of your finances and plan for tax season.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <DollarSign className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$5,200</div>
            <p className="text-xs text-muted-foreground">
              +$800 from last month
            </p>
            <CardDescription className="mt-2">
              Total income this month
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Receipt className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,450</div>
            <p className="text-xs text-muted-foreground">
              -$120 from last month
            </p>
            <CardDescription className="mt-2">
              Total business expenses
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <TrendingUp className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$3,750</div>
            <p className="text-xs text-muted-foreground">
              After expenses
            </p>
            <CardDescription className="mt-2">
              Monthly net income
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Calendar className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Estimated Taxes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">$1,125</div>
            <p className="text-xs text-muted-foreground">
              Quarterly estimate
            </p>
            <CardDescription className="mt-2">
              Based on current income
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Activity className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72%</div>
            <p className="text-xs text-muted-foreground">
              Healthy margin
            </p>
            <CardDescription className="mt-2">
              Income after expenses
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <AlertCircle className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Tax Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$450</div>
            <p className="text-xs text-muted-foreground">
              From deductions
            </p>
            <CardDescription className="mt-2">
              Tracked business expenses
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="bg-muted/50 rounded-lg p-6">
        <h4 className="font-semibold mb-3">Business Health Dashboard Features:</h4>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium">Income Tracking</p>
              <p className="text-xs text-muted-foreground">Monitor all revenue sources in one place</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium">Expense Management</p>
              <p className="text-xs text-muted-foreground">Track and categorize all business expenses</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium">Tax Planning</p>
              <p className="text-xs text-muted-foreground">See estimated taxes and plan ahead</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium">Financial Insights</p>
              <p className="text-xs text-muted-foreground">Understand your business financial health</p>
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

