"use client";

import type React from "react";
import { motion } from "framer-motion";
import { FinancbaseLogo } from "@/components/core/ui/layout/financbase-logo";
import { FloatingPaths } from "./floating-paths";
import { TrustIndicators } from "./trust-indicators";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  showTrustIndicators?: boolean;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  showTrustIndicators = true,
}: AuthLayoutProps) {
  return (
    <main className="relative min-h-screen overflow-hidden lg:grid lg:grid-cols-2">
      {/* Left Side - Branding & Testimonial */}
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative hidden h-full flex-col border-r p-10 lg:flex">
        {/* Gradient overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-background to-transparent" />
        
        {/* Floating background paths */}
        <div className="absolute inset-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>

        {/* Content */}
        <div className="z-10 flex items-center gap-2 mb-8">
          <FinancbaseLogo size="lg" />
        </div>

        <div className="z-10 mt-auto space-y-8">
          {/* Testimonial */}
          <blockquote className="space-y-4">
            <p className="text-xl text-gray-700 leading-relaxed">
              "Financbase has transformed how we manage our finances. The AI insights 
              are incredible and have helped us make better decisions faster."
            </p>
            <footer className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                SJ
              </div>
              <div>
                <div className="font-semibold text-gray-900">Sarah Johnson</div>
                <div className="text-sm text-gray-600">CEO, TechStart</div>
              </div>
            </footer>
          </blockquote>

          {/* Trust indicators */}
          {showTrustIndicators && <TrustIndicators />}
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="relative flex min-h-screen flex-col justify-center p-4">
        {/* Background elements */}
        <div
          aria-hidden
          className="absolute inset-0 isolate contain-strict -z-10 opacity-60"
        >
          <div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)] absolute top-0 right-0 h-320 w-140 -translate-y-87.5 rounded-full" />
          <div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 right-0 h-320 w-60 [translate:5%_-50%] rounded-full" />
          <div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 right-0 h-320 w-60 -translate-y-87.5 rounded-full" />
        </div>

        {/* Mobile logo */}
        <div className="flex items-center gap-2 lg:hidden mb-8">
          <FinancbaseLogo size="md" />
        </div>

        {/* Auth form container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto space-y-4 w-full max-w-md"
        >
          <div className="flex flex-col space-y-1">
            <h1 className="font-heading text-2xl font-bold tracking-wide text-gray-900">
              {title}
            </h1>
            <p className="text-muted-foreground text-base text-gray-600">
              {subtitle}
            </p>
          </div>

          {/* Auth form content */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            {children}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
