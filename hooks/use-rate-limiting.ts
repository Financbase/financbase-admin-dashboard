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

export interface RateLimitingError {
  message: string;
  retryAfter?: number;
  limit?: number;
  remaining?: number;
}

export interface RateLimitingData {
  requests: number;
  limit: number;
  remaining: number;
  resetTime: number;
  errors: RateLimitingError[];
  summary: {
    totalRequests: number;
    throttledRequests: number;
    avgResponseTime: number;
    uniqueIps: number;
  };
}

export function useRateLimitingData(hours: number = 24) {
  const [data, setData] = useState<RateLimitingData>({
    requests: 0,
    limit: 1000,
    remaining: 1000,
    resetTime: Date.now() + 3600000,
    errors: [],
    summary: {
      totalRequests: 0,
      throttledRequests: 0,
      avgResponseTime: 0,
      uniqueIps: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/monitoring/rate-limits?hours=${hours}`);
        if (!response.ok) {
          throw new Error('Failed to fetch rate limiting data');
        }
        const result = await response.json();
        if (result.success && result.data) {
          setData(result.data);
        } else {
          throw new Error('Invalid response format');
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch rate limiting data'));
        // Set default values on error
        setData({
          requests: 0,
          limit: 1000,
          remaining: 1000,
          resetTime: Date.now() + 3600000,
          errors: [],
          summary: {
            totalRequests: 0,
            throttledRequests: 0,
            avgResponseTime: 0,
            uniqueIps: 0,
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [hours]);

  return { data, loading, error };
}

