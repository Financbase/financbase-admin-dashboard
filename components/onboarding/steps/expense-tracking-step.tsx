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
import { Receipt, Camera, DollarSign, Calendar, Upload, SkipForward } from "lucide-react";
import { toast } from "sonner";

interface ExpenseTrackingStepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  onSkip?: () => void;
}

export function ExpenseTrackingStep({ onComplete, onSkip }: ExpenseTrackingStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [expenseLogged, setExpenseLogged] = useState(false);
  const [expenseData, setExpenseData] = useState({
    description: "",
    amount: "",
    category: "",
    date: "",
  });

  const handleLogExpense = async () => {
    if (!expenseData.description || !expenseData.amount) {
      toast.error("Description and amount are required");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate expense logging
      await new Promise(resolve => setTimeout(resolve, 1000));
      setExpenseLogged(true);
      await onComplete({
        expenseLogged: true,
        expenseData,
        timestamp: new Date().toISOString(),
      });
      toast.success("Expense logged successfully!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      await onComplete({
        expenseLogged: false,
        skipped: true,
        timestamp: new Date().toISOString(),
      });
      toast.info("Expense tracking demo skipped");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Receipt className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold">Set Up Expense Tracking</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Learn how to log expenses on the go and snap photos of receipts. 
          Proper expense tracking helps maximize your tax deductions and business insights.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="h-5 w-5 text-primary mr-2" />
              Log an Expense
            </CardTitle>
            <CardDescription>
              Track your business expenses easily
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!expenseLogged ? (
              <>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    placeholder="e.g., Office supplies, Software subscription"
                    value={expenseData.description}
                    onChange={(e) => setExpenseData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="amount">Amount *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="amount"
                        type="number"
                        placeholder="50.00"
                        value={expenseData.amount}
                        onChange={(e) => setExpenseData(prev => ({ ...prev, amount: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="date"
                        type="date"
                        value={expenseData.date}
                        onChange={(e) => setExpenseData(prev => ({ ...prev, date: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Office, Travel, Software, Marketing"
                    value={expenseData.category}
                    onChange={(e) => setExpenseData(prev => ({ ...prev, category: e.target.value }))}
                  />
                </div>

                <div className="bg-muted/50 rounded-lg p-4 border-2 border-dashed">
                  <div className="text-center space-y-2">
                    <Camera className="h-8 w-8 text-muted-foreground mx-auto" />
                    <div>
                      <Label htmlFor="receipt" className="cursor-pointer">
                        <Button variant="outline" size="sm" asChild>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Receipt Photo
                          </span>
                        </Button>
                      </Label>
                      <Input
                        id="receipt"
                        type="file"
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Snap a photo of your receipt for easy tracking
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Expense Tracking Benefits:</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                      <p>Maximize tax deductions with proper categorization</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                      <p>Receipt photos stored automatically for tax season</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                      <p>Track spending patterns and business insights</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                      <p>Export expense reports for your accountant</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4 py-8">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Receipt className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-700 mb-2">Expense Logged!</h4>
                  <p className="text-sm text-muted-foreground">
                    Your expense has been tracked and categorized. Receipt photos are stored automatically.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center space-x-4">
        {onSkip && (
          <Button variant="outline" onClick={handleSkip} disabled={isLoading}>
            <SkipForward className="h-4 w-4 mr-2" />
            Skip demo
          </Button>
        )}
        {!expenseLogged && (
          <Button 
            onClick={handleLogExpense} 
            disabled={isLoading || !expenseData.description || !expenseData.amount}
          >
            {isLoading ? "Logging..." : "Log Expense"}
          </Button>
        )}
      </div>
    </div>
  );
}

