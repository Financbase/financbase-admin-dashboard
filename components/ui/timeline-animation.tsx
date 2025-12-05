/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { motion, useInView, type Variants } from "framer-motion";
import React, { useRef, type ReactNode } from "react";

interface TimelineContentProps {
  as?: keyof React.JSX.IntrinsicElements;
  animationNum?: number;
  timelineRef?: React.RefObject<HTMLElement>;
  customVariants?: Variants;
  className?: string;
  children: ReactNode;
}

export const TimelineContent = ({
  as: Component = "div",
  animationNum = 0,
  timelineRef,
  customVariants,
  className,
  children,
  ...props
}: TimelineContentProps) => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const defaultVariants: Variants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.2,
        duration: 0.6,
        
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: 30,
      opacity: 0,
    },
  };

  const variants = customVariants || defaultVariants;

  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      variants={variants}
      custom={animationNum}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};
