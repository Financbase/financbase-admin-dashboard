"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Database, SkipForward } from "lucide-react";
import { toast } from "sonner";

interface AgencyImportDataStepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  onSkip?: () => void;
}

export function AgencyImportDataStep({ onComplete, onSkip }: AgencyImportDataStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [importMethod, setImportMethod] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [manualData, setManualData] = useState({
    clients: "",
    projects: "",
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
      toast.success("Data import configured successfully!");
    } catch (error) {
      toast.error("Failed to configure data import");
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
        <h3 className="text-2xl font-bold">Import Your Client & Project Data</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Upload existing client/project data from CSV, QuickBooks, or enter manually. 
          This will help us set up your profitability dashboard.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
              Upload a CSV file with your clients and projects
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
          className={`cursor-pointer transition-colors ${importMethod === "quickbooks" ? "border-primary ring-2 ring-primary/50" : ""}`}
          onClick={() => setImportMethod("quickbooks")}
        >
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <FileText className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">QuickBooks</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Connect your QuickBooks account to sync data
            </CardDescription>
            {importMethod === "quickbooks" && (
              <div className="mt-4">
                <Button variant="outline" size="sm" className="w-full">
                  Connect QuickBooks
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-colors ${importMethod === "manual" ? "border-primary ring-2 ring-primary/50" : ""}`}
          onClick={handleManualData}
        >
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Database className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Manual Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Enter your clients and projects manually
            </CardDescription>
            {importMethod === "manual" && (
              <div className="mt-4 space-y-2">
                <div>
                  <Label htmlFor="clients" className="text-xs">Clients (one per line)</Label>
                  <Textarea
                    id="clients"
                    placeholder="Client 1&#10;Client 2&#10;Client 3"
                    value={manualData.clients}
                    onChange={(e) => setManualData(prev => ({ ...prev, clients: e.target.value }))}
                    className="text-sm"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="projects" className="text-xs">Projects (one per line)</Label>
                  <Textarea
                    id="projects"
                    placeholder="Project 1&#10;Project 2&#10;Project 3"
                    value={manualData.projects}
                    onChange={(e) => setManualData(prev => ({ ...prev, projects: e.target.value }))}
                    className="text-sm"
                    rows={3}
                  />
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
