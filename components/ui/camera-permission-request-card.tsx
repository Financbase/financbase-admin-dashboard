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
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

export function CameraPermissionRequestCard() {
  const handleRequestPermission = () => {
    // Request camera permission logic
    console.log("Requesting camera permission");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Camera Access Required
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          This feature requires camera access to function properly. Please grant camera permission.
        </p>
        <Button onClick={handleRequestPermission}>
          Grant Camera Permission
        </Button>
      </CardContent>
    </Card>
  );
}
