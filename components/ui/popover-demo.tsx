/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

interface SharePopoverDemoProps {
  itemData?: {
    id: string;
    title: string;
    description?: string;
    type: string;
  };
}

export default function SharePopoverDemo({ itemData }: SharePopoverDemoProps = {}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Share2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-medium">Share</h4>
          <p className="text-sm text-muted-foreground">
            Share this content with others.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

