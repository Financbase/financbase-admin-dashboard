/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

interface CookieNoticeProps {
  onAccept?: () => void;
  onReject?: () => void;
  onCustomize?: () => void;
}

export default function CookieNotice({
  onAccept,
  onReject,
  onCustomize,
}: CookieNoticeProps) {
  return (
    <Card className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 shadow-lg z-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Cookie className="h-5 w-5" />
          <CardTitle>Cookie Preferences</CardTitle>
        </div>
        <CardDescription>
          We use cookies to enhance your experience. By continuing, you agree to our use of cookies.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-2">
        {onReject && (
          <Button variant="outline" onClick={onReject} className="flex-1">
            Reject
          </Button>
        )}
        {onCustomize && (
          <Button variant="outline" onClick={onCustomize} className="flex-1">
            Customize
          </Button>
        )}
        {onAccept && (
          <Button onClick={onAccept} className="flex-1">
            Accept All
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
