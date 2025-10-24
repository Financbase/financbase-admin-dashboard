"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, TrendingUp, DollarSign, BarChart3 } from "lucide-react";

interface RealEstateWelcomeStepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  onSkip?: () => void;
}

export function RealEstateWelcomeStep({ onComplete, onSkip }: RealEstateWelcomeStepProps) {
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
          <Home className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold">Welcome to Your Real Estate Portfolio HQ</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          You're ready to simplify rental income tracking and investment analytics. 
          Here's how to get up and running with your property portfolio.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Home className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Property Management</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Add your first property and import from spreadsheet
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <DollarSign className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Rental Income Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Log rental income & expenses for real-time cash flow
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <BarChart3 className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Owner Statements</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Generate automated owner statements for co-owners
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <TrendingUp className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Portfolio Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Monitor portfolio performance and upcoming lease expiries
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
