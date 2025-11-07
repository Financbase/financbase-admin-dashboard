/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface FloatingPathsProps {
  position: number;
}

export function FloatingPaths({ position }: FloatingPathsProps) {
  // Memoize paths calculation to avoid recreating on every render
  const paths = useMemo(() => {
    return Array.from({ length: 36 }, (_, i) => {
      const baseX = 380 - i * 5 * position;
      const baseY = 189 + i * 6;
      const midX1 = 312 - i * 5 * position;
      const midY1 = 216 - i * 6;
      const midX2 = 152 - i * 5 * position;
      const midY2 = 343 - i * 6;
      const endX1 = 616 - i * 5 * position;
      const endY1 = 470 - i * 6;
      const endX2 = 684 - i * 5 * position;
      const endY2 = 875 - i * 6;
      
      return {
        id: i,
        d: `M-${baseX} -${baseY}C-${baseX} -${baseY} -${midX1} ${midY1} ${midX2} ${midY2}C${endX1} ${endY1} ${endX2} ${endY2} ${endX2} ${endY2}`,
        opacity: 0.1 + i * 0.03,
        width: 0.5 + i * 0.03,
      };
    });
  }, [position]);

  return (
    <div className="pointer-events-none absolute inset-0">
      <svg
        className="h-full w-full text-slate-950 dark:text-white"
        viewBox="0 0 696 316"
        fill="none"
      >
        <title>Background Paths</title>
        {paths.map((path) => {
          // Pre-calculate random duration to avoid recalculation on each render
          const duration = 20 + (path.id % 10) * 1.2;
          
          return (
            <motion.path
              key={path.id}
              d={path.d}
              stroke="currentColor"
              strokeWidth={path.width}
              strokeOpacity={path.opacity}
              initial={{ pathLength: 0.3, opacity: 0.6 }}
              animate={{
                pathLength: 1,
                opacity: [0.3, 0.6, 0.3],
                pathOffset: [0, 1, 0],
              }}
              transition={{
                duration,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}
