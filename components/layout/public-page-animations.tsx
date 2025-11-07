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
import { FloatingPaths } from "@/components/auth/floating-paths";
import { ReactNode } from "react";

interface PageAnimationWrapperProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Wrapper component that provides the same fade-in/slide-up animation
 * used in the sign-up page
 */
export function PageAnimationWrapper({ 
  children, 
  className = "",
  delay = 0 
}: PageAnimationWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: boolean;
}

/**
 * Animated section with optional stagger effect for children
 */
export function AnimatedSection({ 
  children, 
  className = "",
  delay = 0,
  stagger = false 
}: AnimatedSectionProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay,
        staggerChildren: stagger ? 0.1 : 0,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    },
  };

  if (stagger) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={className}
      >
        {Array.isArray(children) 
          ? children.map((child, index) => (
              <motion.div key={index} variants={itemVariants}>
                {child}
              </motion.div>
            ))
          : <motion.div variants={itemVariants}>{children}</motion.div>
        }
      </motion.div>
    );
  }

  return (
    <PageAnimationWrapper className={className} delay={delay}>
      {children}
    </PageAnimationWrapper>
  );
}

interface AnimatedBackgroundProps {
  children: ReactNode;
  showFloatingPaths?: boolean;
  gradient?: boolean;
}

/**
 * Background wrapper with optional floating paths animation
 */
export function AnimatedBackground({ 
  children, 
  showFloatingPaths = false,
  gradient = false 
}: AnimatedBackgroundProps) {
  return (
    <div className={`relative min-h-screen ${gradient ? 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50' : ''}`}>
      {showFloatingPaths && (
        <>
          <div className="absolute inset-0 z-0">
            <FloatingPaths position={1} />
            <FloatingPaths position={-1} />
          </div>
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-background to-transparent" />
        </>
      )}
      <div className="relative z-20">
        {children}
      </div>
    </div>
  );
}

