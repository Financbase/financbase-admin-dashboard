/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { motion, type Variants, type Transition } from "framer-motion";
import { type ReactNode } from "react";

interface VerticalCutRevealProps {
  children: ReactNode;
  splitBy?: "words" | "characters";
  staggerDuration?: number;
  staggerFrom?: "first" | "last";
  reverse?: boolean;
  containerClassName?: string;
  transition?: Transition;
}

export const VerticalCutReveal = ({
  children,
  splitBy = "words",
  staggerDuration = 0.1,
  staggerFrom = "first",
  reverse = false,
  containerClassName = "",
  transition = {
    type: "spring",
    stiffness: 100,
    damping: 20,
  },
}: VerticalCutRevealProps) => {
  const text = typeof children === "string" ? children : "";
  
  const splitText = splitBy === "words" 
    ? text.split(" ") 
    : text.split("");

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDuration,
        staggerDirection: staggerFrom === "first" ? 1 : -1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      y: reverse ? -20 : 20,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition,
    },
  };

  return (
    <motion.div
      className={`flex flex-wrap ${containerClassName}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {splitText.map((item, index) => (
        <motion.span
          key={`${item}-${index}-${splitText.length}`}
          variants={itemVariants}
          className="inline-block"
        >
          {item}
          {splitBy === "words" && index < splitText.length - 1 && " "}
        </motion.span>
      ))}
    </motion.div>
  );
};
