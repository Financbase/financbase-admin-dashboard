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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Users, BookOpen, ExternalLink } from "lucide-react";

interface Member {
  src: string;
  alt: string;
  fallback: string;
}

interface Book {
  title: string;
  author?: string;
}

interface CommunityHubCardProps {
  title: string;
  subtitle: string;
  memberCount: number;
  members: Member[];
  inviteLink: string;
  currentBook?: {
    title: string;
    progress: number;
  };
  upcomingBooks?: Book[];
}

export function CommunityHubCard({
  title,
  subtitle,
  memberCount,
  members,
  inviteLink,
  currentBook,
  upcomingBooks,
}: CommunityHubCardProps) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {members.slice(0, 4).map((member, index) => (
              <Avatar key={index} className="border-2 border-background">
                <AvatarImage src={member.src} alt={member.alt} />
                <AvatarFallback>{member.fallback}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="font-medium">{memberCount} members</span>
            </div>
          </div>
        </div>

        {currentBook && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="font-medium">Current Book</span>
            </div>
            <div>
              <p className="text-sm font-medium">{currentBook.title}</p>
              <Progress value={currentBook.progress} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {currentBook.progress}% complete
              </p>
            </div>
          </div>
        )}

        {upcomingBooks && upcomingBooks.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Upcoming Books</h3>
            <ul className="space-y-1">
              {upcomingBooks.map((book, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  {book.title}
                  {book.author && ` by ${book.author}`}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button asChild className="w-full">
          <a href={inviteLink} target="_blank" rel="noopener noreferrer">
            Invite Members
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
