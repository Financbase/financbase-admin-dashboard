/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState, useEffect, useCallback } from "react";

export interface ActivityItem {
  id: string;
  icon: React.ElementType;
  message: React.ReactNode;
  timestamp: string;
  iconColorClass?: string;
}

interface UseActivitiesOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  entityType?: string;
  entityId?: string;
}

export function useActivities(options: UseActivitiesOptions = {}) {
  const { autoRefresh = true, refreshInterval = 30000, entityType, entityId } = options;
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      setActivities([
        {
          id: "1",
          icon: () => null,
          message: "Sample activity",
          timestamp: "Just now",
        },
      ]);
      setHasMore(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load activities");
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    fetchActivities();
    if (autoRefresh) {
      const interval = setInterval(fetchActivities, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchActivities, autoRefresh, refreshInterval]);

  const refresh = useCallback(() => {
    fetchActivities();
  }, [fetchActivities]);

  const loadMore = useCallback(() => {
    // Implement load more logic
    fetchActivities();
  }, [fetchActivities]);

  return {
    activities,
    loading,
    error,
    refresh,
    hasMore,
    loadMore,
  };
}

