"use client";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

export function ShareButton() {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Project',
        text: 'Check out this project',
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <Button onClick={handleShare} variant="outline">
      <Share2 className="h-4 w-4 mr-2" />
      Share
    </Button>
  );
}
