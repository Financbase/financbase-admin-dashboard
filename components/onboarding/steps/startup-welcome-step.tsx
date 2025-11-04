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
import { Rocket, TrendingUp, DollarSign, BarChart3 } from "lucide-react";

interface StartupWelcomeStepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  onSkip?: () => void;
}

export function StartupWelcomeStep({ onComplete, onSkip }: StartupWelcomeStepProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = async () => {
    setIsLoading(true);
    try {
      await onComplete({
        welcomeCompleted: true,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Rocket className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold">Your Startup's Financial Edge</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Financbase is built to help high-growth startups like yours track burn rate, 
          runway, and investor-ready insights.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <TrendingUp className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Burn Rate Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Instantly track your burn rate and runway
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <BarChart3 className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Investor Reporting</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Automate monthly reporting and investor-ready insights
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <DollarSign className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Revenue Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Connect Stripe for real-time revenue tracking
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Rocket className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Team Onboarding</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Onboard your whole team in under 5 minutes
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center space-x-4">
        {onSkip && (
          <Button variant="outline" onClick={onSkip}>
            Skip for now
          </Button>
        )}
        <Button onClick={handleGetStarted} disabled={isLoading}>
          {isLoading ? "Getting Started..." : "Get Started"}
        </Button>
      </div>
    </div>
  );
}
