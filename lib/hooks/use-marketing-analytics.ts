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

export interface MarketingAnalytics {
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
}

export function useMarketingAnalytics() {
  const [data, setData] = useState<MarketingAnalytics>({
    impressions: 0,
    clicks: 0,
    conversions: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/marketing/analytics');
        if (!response.ok) {
          throw new Error('Failed to fetch marketing analytics');
        }
        const result = await response.json();
        
        // Map API response to hook interface
        // API returns: { analytics: { overview, performanceMetrics, ... } }
        const analytics = result.analytics || {};
        const overview = analytics.overview || {};
        const performanceMetrics = analytics.performanceMetrics || {};
        
        // Use performanceMetrics if available (has current/previous/change), otherwise use overview totals
        setData({
          impressions: performanceMetrics.impressions?.current || overview.totalImpressions || 0,
          clicks: performanceMetrics.clicks?.current || overview.totalClicks || 0,
          conversions: performanceMetrics.conversions?.current || overview.totalConversions || 0,
          revenue: performanceMetrics.revenue?.current || overview.totalRevenue || 0,
        });
      } catch (error) {
        console.error('Error fetching marketing analytics:', error);
        // Fallback to zero values on error
        setData({
          impressions: 0,
          clicks: 0,
          conversions: 0,
          revenue: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const trackComponentInteraction = async (
    componentName: string,
    category: string,
    action: string,
    metadata?: Record<string, unknown>
  ) => {
    try {
      await fetch('/api/marketing/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          componentName,
          category,
          action,
          metadata,
        }),
      });
    } catch (error) {
      console.error('Error tracking component interaction:', error);
    }
  };

  return {
    data,
    loading,
    trackComponentInteraction,
  };
}

export function useMarketingFeedback() {
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/marketing/feedback');
        if (!response.ok) {
          throw new Error('Failed to fetch feedback');
        }
        const result = await response.json();
        setFeedback(result.data || []);
      } catch (error) {
        console.error('Error fetching feedback:', error);
        setFeedback([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  const submitFeedback = async (data: any) => {
    try {
      const response = await fetch('/api/marketing/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }
      // Refresh feedback list
      const result = await response.json();
      setFeedback((prev) => [result.data, ...prev]);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  };

  return {
    feedback,
    loading,
    submitFeedback,
  };
}
