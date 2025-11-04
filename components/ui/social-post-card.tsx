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
import { Heart, MessageCircle, Share, MoreHorizontal } from "lucide-react";

interface SocialPostCardProps {
  author: {
    name: string;
    avatar?: string;
    handle: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
}

export function SocialPostCard({ 
  author, 
  content, 
  timestamp, 
  likes, 
  comments, 
  shares 
}: SocialPostCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={author.avatar} />
              <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{author.name}</CardTitle>
              <p className="text-sm text-muted-foreground">@{author.handle}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">{timestamp}</span>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4">{content}</p>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <Heart className="h-4 w-4 mr-1" />
            {likes}
          </Button>
          <Button variant="ghost" size="sm">
            <MessageCircle className="h-4 w-4 mr-1" />
            {comments}
          </Button>
          <Button variant="ghost" size="sm">
            <Share className="h-4 w-4 mr-1" />
            {shares}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
