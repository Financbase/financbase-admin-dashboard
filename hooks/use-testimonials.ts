/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import React, { useState, useCallback } from "react";

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  content: string;
  avatar?: string;
  rating?: number;
  title?: string;
  quote?: string;
  highlight?: string;
}

interface UseTestimonialsOptions {
  featured?: boolean;
  limit?: number;
}

export function useTestimonials(options: UseTestimonialsOptions = {}) {
  const [data, setData] = useState<{ testimonials: Testimonial[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTestimonials = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Mock data - replace with actual API call
      const mockTestimonials: Testimonial[] = [];
      setData({ testimonials: mockTestimonials });
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch testimonials");
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-fetch on mount
  React.useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchTestimonials,
  };
}

