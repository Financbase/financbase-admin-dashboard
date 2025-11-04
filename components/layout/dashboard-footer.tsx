/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { FinancbaseLogo } from "@/components/ui/financbase-logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Github,
  Linkedin,
  Mail,
  Twitter,
  HelpCircle,
  FileText,
  Shield,
  Settings,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

const dashboardNavigation = {
  support: [
    { name: "Help Center", href: "/support", icon: HelpCircle },
    { name: "Documentation", href: "/docs", icon: FileText },
    { name: "Security", href: "/security", icon: Shield },
    { name: "Settings", href: "/settings", icon: Settings },
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
  social: [
    {
      name: "Twitter",
      href: "https://twitter.com/financbase",
      icon: Twitter,
    },
    {
      name: "GitHub",
      href: "https://github.com/financbase",
      icon: Github,
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com/company/financbase",
      icon: Linkedin,
    },
    {
      name: "Email",
      href: "mailto:hello@financbase.com",
      icon: Mail,
    },
  ],
};

export function DashboardFooter() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <Link href="/dashboard" className="inline-block">
                <FinancbaseLogo size="sm" variant="default" />
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Comprehensive financial management platform for modern businesses.
            </p>
            <div className="flex space-x-4">
              {dashboardNavigation.social.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {dashboardNavigation.support.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <item.icon className="h-3 w-3" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {dashboardNavigation.company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-between">
                    Export Data
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>Export to CSV</DropdownMenuItem>
                  <DropdownMenuItem>Export to Excel</DropdownMenuItem>
                  <DropdownMenuItem>Export to PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/settings">
                  <Settings className="h-3 w-3 mr-2" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2025 Financbase. All rights reserved.
            </p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <span className="text-xs text-muted-foreground">
                Version 2.0.0
              </span>
              <div className="flex space-x-4">
                <Link
                  href="/privacy"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy
                </Link>
                <Link
                  href="/terms"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Terms
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
