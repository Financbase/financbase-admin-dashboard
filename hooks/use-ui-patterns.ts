/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export interface UIPattern {
  id: string;
  name: string;
  description: string;
}

export function useUIPatterns() {
  const [patterns, setPatterns] = useState<UIPattern[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPatterns = useCallback(async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      setPatterns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    patterns,
    loading,
    loadPatterns,
  };
}

/**
 * Auto-rotate through items at specified interval
 */
export function useAutoRotate<T>(items: T[], interval: number = 5000): [T | undefined, (item: T) => void] {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (items.length === 0) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [items.length, interval]);

  const setCurrentItem = useCallback((item: T) => {
    const index = items.indexOf(item);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  }, [items]);

  return [items[currentIndex], setCurrentItem];
}

/**
 * Email input with validation
 */
export function useEmailInput(initialValue: string = ""): [string, string | null, (value: string) => void] {
  const [email, setEmail] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback((value: string) => {
    setEmail(value);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      setError("Please enter a valid email address");
    } else {
      setError(null);
    }
  }, []);

  return [email, error, handleChange];
}

/**
 * Expandable content state
 */
export function useExpandableContent(initialState: boolean = false): [boolean, () => void] {
  const [isExpanded, setIsExpanded] = useState(initialState);

  const toggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return [isExpanded, toggle];
}

/**
 * Scroll visibility hook - tracks if scroll position exceeds threshold
 */
export function useScrollVisibility(threshold: number = 100): [boolean] {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial state

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  return [isVisible];
}

