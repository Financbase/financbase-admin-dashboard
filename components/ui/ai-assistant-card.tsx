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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AIAssistantCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/ai-avatar.png" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Get instant help with your tasks and questions.
          </p>
          <div className="space-y-2">
            <Button className="w-full">Ask a Question</Button>
            <Button variant="outline" className="w-full">View History</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
