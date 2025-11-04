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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquare, CheckCircle, SkipForward } from "lucide-react";
import { toast } from "sonner";

interface ConnectSlackStepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  onSkip?: () => void;
}

export function ConnectSlackStep({ onComplete, onSkip }: ConnectSlackStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");

  const handleConnectSlack = async () => {
    setIsLoading(true);
    try {
      // Simulate Slack connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsConnected(true);
      setWorkspaceName("Your Workspace");
      toast.success("Slack connected successfully!");
    } catch (error) {
      toast.error("Failed to connect Slack");
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await onComplete({
        slackConnected: isConnected,
        workspaceName,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      await onComplete({
        slackConnected: false,
        skipped: true,
        timestamp: new Date().toISOString(),
      });
      toast.info("Slack integration skipped - you can set this up later");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <MessageSquare className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold">Connect Slack</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Integrate with Slack for real-time notifications on project updates, 
          invoice reminders, and team collaboration.
        </p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 text-primary mr-2" />
            Slack Integration
          </CardTitle>
          <CardDescription>
            Connect your Slack workspace to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="workspace" className="text-sm font-medium">
                  Workspace Name (Optional)
                </Label>
                <Input
                  id="workspace"
                  placeholder="Your Workspace"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <Button 
                onClick={handleConnectSlack} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Connecting..." : "Connect Slack"}
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <div>
                <h4 className="font-semibold text-green-700">Slack Connected!</h4>
                <p className="text-sm text-muted-foreground">
                  You'll receive notifications for project updates and invoices
                </p>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Get notified when invoices are sent</p>
            <p>• Receive project milestone updates</p>
            <p>• Team collaboration notifications</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center space-x-4">
        {onSkip && (
          <Button variant="outline" onClick={handleSkip} disabled={isLoading}>
            <SkipForward className="h-4 w-4 mr-2" />
            Skip for now
          </Button>
        )}
        <Button 
          onClick={handleComplete} 
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}
