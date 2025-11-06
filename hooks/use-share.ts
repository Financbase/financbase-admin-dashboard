/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { useState } from "react";

export interface UseShareReturn {
  share: (data: { url?: string; title?: string; text?: string; itemType?: string; itemId?: string; description?: string; isPublic?: boolean }) => Promise<void>;
  isSharing: boolean;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

export function useShare(): UseShareReturn {
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const share = async (data: { url?: string; title?: string; text?: string }) => {
    setIsSharing(true);
    setError(null);
    try {
      if (navigator.share) {
        await navigator.share(data);
      } else {
        // Fallback: copy to clipboard
        if (data.url) {
          await navigator.clipboard.writeText(data.url);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to share'));
    } finally {
      setIsSharing(false);
    }
  };

  const reset = () => {
    setError(null);
    setIsSharing(false);
  };

  return {
    share,
    isSharing,
    isLoading: isSharing,
    error,
    reset,
  };
}

