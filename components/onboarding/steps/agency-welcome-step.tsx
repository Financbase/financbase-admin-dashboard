"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, TrendingUp, DollarSign } from "lucide-react";

interface AgencyWelcomeStepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  onSkip?: () => void;
}

export function AgencyWelcomeStep({ onComplete, onSkip }: AgencyWelcomeStepProps) {
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
          <Building2 className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold">Welcome to Your Agency's Growth Command Center</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Financbase is designed to empower your agency with instant clarity on client profitability, 
          billable hours, and seamless invoicing—no spreadsheets required.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <TrendingUp className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Profitability Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              See profit margins instantly across all clients and projects
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Users className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Team Collaboration</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Invite your team for full transparency and collaboration
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <DollarSign className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Automated Invoicing</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Generate professional invoices with automated reminders
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Building2 className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Client Management</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Track billable hours and project profitability
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
