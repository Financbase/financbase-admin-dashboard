"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function DataExportButton() {
  const handleExport = () => {
    console.log("Exporting data...");
  };

  return (
    <Button onClick={handleExport} variant="outline">
      <Download className="h-4 w-4 mr-2" />
      Export Data
    </Button>
  );
}
