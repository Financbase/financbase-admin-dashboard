"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, FileText, Receipt, TrendingUp } from "lucide-react";

interface FreelancerWelcomeStepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  onSkip?: () => void;
}

export function FreelancerWelcomeStep({ onComplete, onSkip }: FreelancerWelcomeStepProps) {
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
          <User className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold">Financial Peace of Mind for Freelancers</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          We're excited to make your freelance finances easier than ever. 
          Let's get you set up for success.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <FileText className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Invoice Management</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Create and send your first invoice with built-in reminders
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Receipt className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Expense Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Log expenses on the go and snap photos of receipts
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <TrendingUp className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Business Health</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Monitor your business health with real-time income/expenses
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <User className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Tax Preparation</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Get estimated taxes owed to plan for tax season
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
