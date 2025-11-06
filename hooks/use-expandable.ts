/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export function useExpandable(initialState = false) {
  const [isExpanded, setIsExpanded] = useState(initialState);
  const contentRef = useRef<HTMLDivElement>(null);
  const [animatedHeight, setAnimatedHeight] = useState<number | "auto">("auto");

  useEffect(() => {
    if (contentRef.current) {
      setAnimatedHeight(contentRef.current.scrollHeight);
    }
  }, [isExpanded]);

  const toggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const toggleExpand = toggle;

  const expand = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const collapse = useCallback(() => {
    setIsExpanded(false);
  }, []);

  return {
    isExpanded,
    toggle,
    toggleExpand,
    expand,
    collapse,
    animatedHeight,
    contentRef,
  };
}

