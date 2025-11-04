/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState, type ComponentType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavbarMenuItem {
  name: string;
  href: string;
  icon?: ComponentType<{ className?: string }>;
  description?: string;
}

interface AnimatedNavbarProps {
  items: NavbarMenuItem[];
  className?: string;
}

export function AnimatedNavbar({ items, className }: AnimatedNavbarProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className={cn("relative flex items-center justify-center w-full", className)}>
      <div className="flex items-center space-x-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 p-1 shadow-lg overflow-hidden">
        {items.map((item, index) => (
          <motion.div
            key={item.name}
            className="relative"
            onHoverStart={() => setHoveredIndex(index)}
            onHoverEnd={() => setHoveredIndex(null)}
          >
            <motion.a
              href={item.href}
              className={cn(
                "relative flex items-center space-x-2 px-3 xl:px-4 py-2 rounded-full text-xs xl:text-sm font-medium transition-colors whitespace-nowrap",
                "text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white",
                "bg-transparent hover:bg-white/20 dark:hover:bg-white/10"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              <span>{item.name}</span>

              {/* Animated background */}
              <AnimatePresence>
                {hoveredIndex === index && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full"
                    layoutId="navbar-hover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </AnimatePresence>
            </motion.a>

            {/* Tooltip */}
            <AnimatePresence>
              {hoveredIndex === index && item.description && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900/90 text-white text-xs rounded-lg backdrop-blur-sm border border-gray-700/50 whitespace-nowrap z-50"
                >
                  {item.description}
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900/90 rotate-45 border-l border-t border-gray-700/50"></div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Navigation items configuration
export const navbarItems: NavbarMenuItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    description: "Overview of your financial data"
  },
  {
    name: "Analytics",
    href: "/analytics",
    description: "Advanced reporting and insights"
  },
  {
    name: "Transactions",
    href: "/transactions",
    description: "Manage income and expenses"
  },
  {
    name: "Invoices",
    href: "/invoices",
    description: "Create and track invoices"
  },
  {
    name: "Reports",
    href: "/reports",
    description: "Financial reports and statements"
  },
];
