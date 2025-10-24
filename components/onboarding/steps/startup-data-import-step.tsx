"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Database, Upload, FileText, DollarSign, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface StartupDataImportStepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  onSkip?: () => void;
}

export function StartupDataImportStep({ onComplete, onSkip }: StartupDataImportStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [importMethod, setImportMethod] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [manualData, setManualData] = useState({
    monthlyRevenue: "",
    monthlyExpenses: "",
    runway: "",
    burnRate: "",
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImportMethod("file");
    }
  };

  const handleManualData = () => {
    setImportMethod("manual");
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const stepData: Record<string, unknown> = {
        importMethod,
        timestamp: new Date().toISOString(),
      };

      if (importMethod === "file" && file) {
        stepData.fileName = file.name;
        stepData.fileSize = file.size;
        stepData.fileType = file.type;
      } else if (importMethod === "manual") {
        stepData.manualData = manualData;
      }

      await onComplete(stepData);
      toast.success("Startup data imported successfully!");
    } catch (error) {
      toast.error("Failed to import startup data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      await onComplete({
        importMethod: "skipped",
        timestamp: new Date().toISOString(),
      });
      toast.info("Data import skipped - you can set this up later");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Database className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold">Import Your Startup Data</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Upload your revenue/expense data or enter key metrics to set up 
          your burn rate dashboard and runway calculations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card 
          className={`cursor-pointer transition-colors ${importMethod === "file" ? "border-primary ring-2 ring-primary/50" : ""}`}
          onClick={() => setImportMethod("file")}
        >
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Upload className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Upload CSV</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Upload a CSV file with your financial data
            </CardDescription>
            {importMethod === "file" && (
              <div className="mt-4">
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="text-sm"
                />
                {file && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Selected: {file.name}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-colors ${importMethod === "manual" ? "border-primary ring-2 ring-primary/50" : ""}`}
          onClick={handleManualData}
        >
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <FileText className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Manual Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Enter your key startup metrics manually
            </CardDescription>
            {importMethod === "manual" && (
              <div className="mt-4 space-y-3">
                <div>
                  <Label htmlFor="revenue" className="text-xs">Monthly Revenue</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="revenue"
                      type="number"
                      placeholder="50000"
                      value={manualData.monthlyRevenue}
                      onChange={(e) => setManualData(prev => ({ ...prev, monthlyRevenue: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="expenses" className="text-xs">Monthly Expenses</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="expenses"
                      type="number"
                      placeholder="75000"
                      value={manualData.monthlyExpenses}
                      onChange={(e) => setManualData(prev => ({ ...prev, monthlyExpenses: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="runway" className="text-xs">Current Cash (Runway)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="runway"
                      type="number"
                      placeholder="500000"
                      value={manualData.runway}
                      onChange={(e) => setManualData(prev => ({ ...prev, runway: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="burnRate" className="text-xs">Monthly Burn Rate</Label>
                  <div className="relative">
                    <TrendingUp className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="burnRate"
                      type="number"
                      placeholder="25000"
                      value={manualData.burnRate}
                      onChange={(e) => setManualData(prev => ({ ...prev, burnRate: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-semibold mb-2">What we'll track for you:</h4>
        <div className="grid gap-2 md:grid-cols-2 text-sm">
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
            <p>Monthly burn rate and runway calculations</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
            <p>Revenue growth and churn analysis</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
            <p>Expense categorization and optimization</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
            <p>Investor-ready financial reports</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        {onSkip && (
          <Button variant="outline" onClick={handleSkip} disabled={isLoading}>
            Skip for now
          </Button>
        )}
        <Button 
          onClick={handleComplete} 
          disabled={isLoading || !importMethod}
        >
          {isLoading ? "Importing..." : "Import Data"}
        </Button>
      </div>
    </div>
  );
}
