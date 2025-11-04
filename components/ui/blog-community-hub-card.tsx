/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageCircle, TrendingUp } from "lucide-react";

interface BlogCommunityHubCardProps {
  title?: string;
  description?: string;
  memberCount?: number;
  postCount?: number;
  growthRate?: number;
}

export function BlogCommunityHubCard({
  title = "Community Hub",
  description = "Join our growing community of financial professionals",
  memberCount = 1250,
  postCount = 89,
  growthRate = 12.5,
}: BlogCommunityHubCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600">{description}</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{memberCount.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Members</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{postCount}</div>
            <div className="text-sm text-gray-500">Posts</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-green-600">
          <TrendingUp className="h-4 w-4" />
          <span>+{growthRate}% growth this month</span>
        </div>

        <Button className="w-full" variant="outline">
          <MessageCircle className="h-4 w-4 mr-2" />
          Join Discussion
        </Button>
      </CardContent>
    </Card>
  );
}
