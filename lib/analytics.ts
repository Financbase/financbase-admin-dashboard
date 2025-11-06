/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { useState, useCallback } from 'react';
import { AnalyticsEvents } from '@/lib/analytics/events';

// Export events for convenience
export const events = AnalyticsEvents;

// Analytics utilities
export const trackEvent = (event: string, properties?: Record<string, any>) => {
  // Placeholder analytics tracking
  console.log('Analytics event:', event, properties);
};

export const trackPageView = (page: string) => {
  // Placeholder page view tracking
  console.log('Page view:', page);
};

export const identifyUser = (userId: string, traits?: Record<string, any>) => {
  // Placeholder user identification
  console.log('User identified:', userId, traits);
};

// Analytics hook
export function useAnalytics() {
  const [isTracking, setIsTracking] = useState(false);

  const track = useCallback((event: string, properties?: Record<string, any>) => {
    setIsTracking(true);
    trackEvent(event, properties);
    setTimeout(() => setIsTracking(false), 100);
  }, []);

  const trackPage = useCallback((page: string) => {
    trackPageView(page);
  }, []);

  const identify = useCallback((userId: string, traits?: Record<string, any>) => {
    identifyUser(userId, traits);
  }, []);

  return {
    track,
    trackPage,
    identify,
    isTracking,
    events,
  };
}

// Hybrid analytics hook (alias for useAnalytics with events)
export function useHybridAnalytics() {
  return useAnalytics();
}
