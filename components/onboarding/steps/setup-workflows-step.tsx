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
import { Workflow, CheckCircle, Bell, FileText, Users, Zap, SkipForward } from "lucide-react";
import { toast } from "sonner";

interface SetupWorkflowsStepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  onSkip?: () => void;
}

export function SetupWorkflowsStep({ onComplete, onSkip }: SetupWorkflowsStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([]);

  const workflows = [
    {
      id: "ar-reminders",
      name: "AR Reminders",
      description: "Automatically send reminders for overdue invoices",
      icon: Bell,
    },
    {
      id: "expense-approvals",
      name: "Expense Approvals",
      description: "Route expense approvals to managers",
      icon: CheckCircle,
    },
    {
      id: "investor-reports",
      name: "Investor Reports",
      description: "Generate and send monthly reports to investors",
      icon: FileText,
    },
    {
      id: "team-notifications",
      name: "Team Notifications",
      description: "Notify team of important financial events",
      icon: Users,
    },
  ];

  const toggleWorkflow = (workflowId: string) => {
    setSelectedWorkflows(prev =>
      prev.includes(workflowId)
        ? prev.filter(id => id !== workflowId)
        : [...prev, workflowId]
    );
  };

  const handleSetupWorkflows = async () => {
    setIsLoading(true);
    try {
      await onComplete({
        workflowsConfigured: true,
        selectedWorkflows,
        timestamp: new Date().toISOString(),
      });
      toast.success("Workflows configured successfully!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      await onComplete({
        workflowsConfigured: false,
        skipped: true,
        timestamp: new Date().toISOString(),
      });
      toast.info("Workflow setup skipped - you can configure them later");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Workflow className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold">Set Up Financial Workflows</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Automate your financial reporting and processes. Set up automated workflows 
          for AR reminders, expense approvals, and investor reports.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Workflow className="h-5 w-5 text-primary mr-2" />
              Available Workflows
            </CardTitle>
            <CardDescription>
              Select the workflows you'd like to enable
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {workflows.map((workflow) => {
              const Icon = workflow.icon;
              const isSelected = selectedWorkflows.includes(workflow.id);
              
              return (
                <div
                  key={workflow.id}
                  onClick={() => toggleWorkflow(workflow.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${
                      isSelected ? "bg-primary/10" : "bg-muted"
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        isSelected ? "text-primary" : "text-muted-foreground"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{workflow.name}</h4>
                        {isSelected && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {workflow.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="bg-muted/50 rounded-lg p-4 mt-4">
              <h4 className="font-semibold mb-2 flex items-center">
                <Zap className="h-4 w-4 text-primary mr-2" />
                Automation Benefits:
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
                  <p>Save time with automated reminders and notifications</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
                  <p>Ensure nothing falls through the cracks</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
                  <p>Keep stakeholders informed automatically</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
                  <p>Streamline approval processes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center space-x-4">
        {onSkip && (
          <Button variant="outline" onClick={handleSkip} disabled={isLoading}>
            <SkipForward className="h-4 w-4 mr-2" />
            Skip for now
          </Button>
        )}
        <Button 
          onClick={handleSetupWorkflows} 
          disabled={isLoading}
        >
          {isLoading ? "Setting Up..." : "Set Up Workflows"}
        </Button>
      </div>
    </div>
  );
}

