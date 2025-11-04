/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

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
