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
import { FileText, Download, Calendar, DollarSign, TrendingUp, SkipForward } from "lucide-react";
import { toast } from "sonner";

interface RealEstateOwnerStatementStepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  onSkip?: () => void;
}

export function RealEstateOwnerStatementStep({ onComplete, onSkip }: RealEstateOwnerStatementStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [statementGenerated, setStatementGenerated] = useState(false);

  const handleGenerateReport = async () => {
    setIsLoading(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatementGenerated(true);
      await onComplete({
        statementGenerated: true,
        timestamp: new Date().toISOString(),
      });
      toast.success("Owner statement generated successfully!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      await onComplete({
        statementGenerated: false,
        skipped: true,
        timestamp: new Date().toISOString(),
      });
      toast.info("Owner statement demo skipped");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold">Generate Owner Statement</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Create detailed reports for yourself or co-owners showing rental performance, 
          income, expenses, and ROI calculations.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 text-primary mr-2" />
              Owner Statement Preview
            </CardTitle>
            <CardDescription>
              See how easy it is to generate professional owner statements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!statementGenerated ? (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-6 border-2 border-dashed">
                  <div className="text-center space-y-4">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div>
                      <h4 className="font-semibold mb-2">Monthly Owner Statement</h4>
                      <p className="text-sm text-muted-foreground">
                        This statement will include rental income, expenses, and net cash flow
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <DollarSign className="h-4 w-4 text-primary mr-2" />
                        Rental Income
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$1,500</div>
                      <p className="text-xs text-muted-foreground mt-1">This month</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <TrendingUp className="h-4 w-4 text-primary mr-2" />
                        Expenses
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$450</div>
                      <p className="text-xs text-muted-foreground mt-1">Maintenance & fees</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Calendar className="h-4 w-4 text-primary mr-2" />
                        Net Cash Flow
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">$1,050</div>
                      <p className="text-xs text-muted-foreground mt-1">After expenses</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Statement Features:</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                      <p>Detailed income and expense breakdown</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                      <p>ROI and cash-on-cash return calculations</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                      <p>Year-to-date summaries and trends</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                      <p>Export to PDF for sharing with co-owners</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 py-8">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-700 mb-2">Statement Generated!</h4>
                  <p className="text-sm text-muted-foreground">
                    Your owner statement has been created and is ready to download or share.
                  </p>
                </div>
                <Button variant="outline" className="mt-4">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
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
        {!statementGenerated && (
          <Button onClick={handleGenerateReport} disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate Report"}
          </Button>
        )}
      </div>
    </div>
  );
}

