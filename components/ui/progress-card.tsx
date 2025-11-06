/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProgressCardProps {
  fileName?: string;
  fileSize?: number;
  progress?: number;
  status?: "uploading" | "complete";
  onCancel?: () => void;
  icon?: React.ReactNode;
}

export function ProgressCard({ fileName, fileSize, progress = 50, status, onCancel, icon }: ProgressCardProps = {}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{fileName || "Upload Progress"}</CardTitle>
        {fileSize && <p className="text-sm text-muted-foreground">{(fileSize / 1024).toFixed(2)} KB</p>}
      </CardHeader>
      <CardContent>
        <Progress value={progress} />
        {status && <p className="text-sm text-muted-foreground mt-2">Status: {status}</p>}
      </CardContent>
    </Card>
  );
}

export function UploadProgressCard(props: ProgressCardProps) {
  return <ProgressCard {...props} />;
}

