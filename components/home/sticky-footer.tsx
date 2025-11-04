/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Star } from "lucide-react"
import Link from "next/link"

export default function StickyFooter() {
  const features = [
    "AI-Powered Financial Intelligence",
    "Real-Time Analytics Dashboard",
    "Automated Workflow Management",
    "Enterprise Security & Compliance"
  ]

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 1 }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Features */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="font-medium text-gray-900">Everything you need:</span>
            {features.map((feature, index) => (
              <div key={feature} className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>{feature}</span>
                {index < features.length - 1 && (
                  <span className="text-gray-300 mx-2">•</span>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">4.9/5</span>
                <span className="text-gray-400">from 2,000+ reviews</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/about">
                  Learn More
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/sign-up">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
