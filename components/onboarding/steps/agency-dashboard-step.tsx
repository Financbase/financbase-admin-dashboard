"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, DollarSign, Clock, Target } from "lucide-react";
import { toast } from "sonner";

interface AgencyDashboardStepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  onSkip?: () => void;
}

export function AgencyDashboardStep({ onComplete, onSkip }: AgencyDashboardStepProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleExploreDashboard = async () => {
    setIsLoading(true);
    try {
      await onComplete({
        dashboardExplored: true,
        timestamp: new Date().toISOString(),
      });
      toast.success("Dashboard exploration completed!");
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
      toast.info("Dashboard exploration skipped");
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
        <h3 className="text-2xl font-bold">Explore Your Agency Dashboard</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover your agency-wide profitability, billable hours, and client status 
          at a glance. This is your command center for agency growth.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <TrendingUp className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Profitability Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,230</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last month
            </p>
            <CardDescription className="mt-2">
              See profit margins across all clients and projects
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Clock className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247h</div>
            <p className="text-xs text-muted-foreground">
              +8.2% from last month
            </p>
            <CardDescription className="mt-2">
              Track team productivity and utilization rates
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Users className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              +3 new this month
            </p>
            <CardDescription className="mt-2">
              Monitor client relationships and project status
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <DollarSign className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Outstanding Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$18,450</div>
            <p className="text-xs text-muted-foreground">
              7 invoices pending
            </p>
            <CardDescription className="mt-2">
              Track cash flow and payment status
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Target className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Project Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">
              On-time delivery rate
            </p>
            <CardDescription className="mt-2">
              Monitor project timelines and deliverables
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <BarChart3 className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Growth Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+28%</div>
            <p className="text-xs text-muted-foreground">
              Revenue growth this quarter
            </p>
            <CardDescription className="mt-2">
              Track agency growth and performance trends
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="bg-muted/50 rounded-lg p-6">
        <h4 className="font-semibold mb-3">Key Dashboard Features:</h4>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium">Real-time Profitability</p>
              <p className="text-xs text-muted-foreground">See margins across all projects instantly</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium">Team Performance</p>
              <p className="text-xs text-muted-foreground">Track billable hours and productivity</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium">Client Insights</p>
              <p className="text-xs text-muted-foreground">Monitor project health and satisfaction</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium">Cash Flow Tracking</p>
              <p className="text-xs text-muted-foreground">Manage outstanding invoices and payments</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        {onSkip && (
          <Button variant="outline" onClick={handleSkip} disabled={isLoading}>
            Skip for now
          </Button>
        )}
        <Button onClick={handleExploreDashboard} disabled={isLoading}>
          {isLoading ? "Exploring..." : "Explore Dashboard"}
        </Button>
      </div>
    </div>
  );
}
