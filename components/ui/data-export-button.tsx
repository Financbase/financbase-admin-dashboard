/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { logger } from '@/lib/logger';

export function DataExportButton() {
  const handleExport = () => {
    logger.info("Exporting data...");
  };

  return (
    <Button onClick={handleExport} variant="outline">
      <Download className="h-4 w-4 mr-2" />
      Export Data
    </Button>
  );
}
