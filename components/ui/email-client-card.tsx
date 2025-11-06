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

interface EmailClientCardProps {
  avatarSrc?: string;
  avatarFallback?: string;
  senderName?: string;
  senderEmail?: string;
  timestamp?: string;
  message?: string;
  reactions?: string[];
  onReactionClick?: (reaction: string) => void;
  onActionClick?: (index: number) => void;
  actions?: React.ReactNode[];
}

export function EmailClientCard({ avatarSrc, avatarFallback, senderName, senderEmail, timestamp, message, reactions, onReactionClick, onActionClick, actions }: EmailClientCardProps = {}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{senderName || "Email Client"}</CardTitle>
        {senderEmail && <p className="text-sm text-muted-foreground">{senderEmail}</p>}
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground">
          {message || "Email interface"}
        </div>
      </CardContent>
    </Card>
  );
}

