/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface LiveFeedItem {
  id: string;
  title: string;
  message: string;
  time: string;
  icon?: string;
  type: string;
  action: string;
  timestamp: string;
}

interface UseLiveFeedOptions {
  limit?: number;
  entityTypes?: string[];
  autoRefresh?: boolean;
  onError?: (error: Error) => void;
}

export function useLiveFeed(options: UseLiveFeedOptions = {}) {
  const { limit = 50, entityTypes = [], autoRefresh = true, onError } = options;
  const [items, setItems] = useState<LiveFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasItems, setHasItems] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const lastUpdateRef = useRef<Date>(new Date());

  const fetchItems = useCallback(async () => {
    if (isPaused) return;
    
    try {
      setLoading(true);
      setError(null);
      // Mock data - replace with actual API call
      const mockItems: LiveFeedItem[] = [];
      setItems(mockItems);
      setHasItems(mockItems.length > 0);
      lastUpdateRef.current = new Date();
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load feed");
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [limit, entityTypes, onError, isPaused]);

  const refresh = useCallback(() => {
    fetchItems();
  }, [fetchItems]);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  useEffect(() => {
    if (!isPaused) {
      fetchItems();
      if (autoRefresh) {
        const interval = setInterval(fetchItems, 5000);
        return () => clearInterval(interval);
      }
    }
  }, [fetchItems, autoRefresh, isPaused]);

  // Calculate time since last update
  const timeSinceLastUpdate = (() => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdateRef.current.getTime()) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    return `${Math.floor(diff / 3600)}h`;
  })();

  return {
    items,
    loading,
    isLoading: loading,
    hasItems,
    isError: error !== null,
    error,
    isPaused,
    timeSinceLastUpdate,
    refresh,
    pause,
    resume,
  };
}

