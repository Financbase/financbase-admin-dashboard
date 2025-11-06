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
import { CreditCard, CheckCircle, Zap, SkipForward } from "lucide-react";
import { toast } from "sonner";

interface ConnectStripeStepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  onSkip?: () => void;
}

export function ConnectStripeStep({ onComplete, onSkip }: ConnectStripeStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [accountName, setAccountName] = useState("");

  const handleConnectStripe = async () => {
    setIsLoading(true);
    try {
      // Simulate Stripe connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsConnected(true);
      setAccountName("Your Stripe Account");
      toast.success("Stripe connected successfully!");
    } catch (error) {
      toast.error("Failed to connect Stripe");
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await onComplete({
        stripeConnected: isConnected,
        accountName,
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
        stripeConnected: false,
        skipped: true,
        timestamp: new Date().toISOString(),
      });
      toast.info("Stripe integration skipped - you can set this up later");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <CreditCard className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold">Connect Stripe</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Sync revenue data automatically from your Stripe account to track revenue 
          and customer metrics in real time.
        </p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 text-primary mr-2" />
            Stripe Integration
          </CardTitle>
          <CardDescription>
            Connect your Stripe account to automatically track revenue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">What You'll Get:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start space-x-2">
                    <Zap className="h-4 w-4 text-primary mt-0.5" />
                    <p>Automatic revenue sync from Stripe</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Zap className="h-4 w-4 text-primary mt-0.5" />
                    <p>Real-time customer metrics and growth tracking</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Zap className="h-4 w-4 text-primary mt-0.5" />
                    <p>MRR, ARR, and churn rate calculations</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Zap className="h-4 w-4 text-primary mt-0.5" />
                    <p>Subscription and payment insights</p>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleConnectStripe} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Connecting..." : "Connect Stripe"}
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <div>
                <h4 className="font-semibold text-green-700">Stripe Connected!</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {accountName}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Your revenue data will sync automatically
                </p>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
            <p>• Revenue data syncs automatically</p>
            <p>• Customer metrics update in real time</p>
            <p>• Track MRR, ARR, and growth metrics</p>
            <p>• Monitor subscription health</p>
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

