/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";

interface BookmarkButtonProps {
  freelancerId: string;
  freelancerName: string;
  className?: string;
}

export function BookmarkButton({ freelancerId, freelancerName, className }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load bookmark state from localStorage on mount
  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('freelancer-bookmarks') || '[]');
    setIsBookmarked(bookmarks.includes(freelancerId));
  }, [freelancerId]);

  const handleBookmark = async () => {
    setIsLoading(true);
    
    try {
      // Get current bookmarks from localStorage
      const bookmarks = JSON.parse(localStorage.getItem('freelancer-bookmarks') || '[]');
      
      if (isBookmarked) {
        // Remove bookmark
        const updatedBookmarks = bookmarks.filter((id: string) => id !== freelancerId);
        localStorage.setItem('freelancer-bookmarks', JSON.stringify(updatedBookmarks));
        setIsBookmarked(false);
        toast.success(`Removed ${freelancerName} from bookmarks`);
      } else {
        // Add bookmark
        const updatedBookmarks = [...bookmarks, freelancerId];
        localStorage.setItem('freelancer-bookmarks', JSON.stringify(updatedBookmarks));
        setIsBookmarked(true);
        toast.success(`Bookmarked ${freelancerName}`);
      }
      
      // Here you would typically sync with your backend
      console.log("Bookmark updated:", {
        freelancerId,
        freelancerName,
        isBookmarked: !isBookmarked,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      toast.error("Failed to update bookmark. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="icon"
      className={className}
      onClick={handleBookmark}
      disabled={isLoading}
      aria-label={isBookmarked ? "Remove bookmark" : "Bookmark profile"}
    >
      {isBookmarked ? (
        <BookmarkCheck className="h-4 w-4 text-primary" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
    </Button>
  );
}
