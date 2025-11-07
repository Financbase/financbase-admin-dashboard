/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  ArrowRight, 
  MessageSquare, 
  Plug,
  Zap,
  TrendingUp, 
  BarChart3,
  ChevronDown,
  Link2,
  Shield,
  Clock
} from "lucide-react"
import Link from "next/link"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { FloatingPaths } from "@/components/auth/floating-paths"

export default function IntegrationsHero() {
  const [activeMetric, setActiveMetric] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setActiveMetric((prev) => (prev + 1) % 3)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // Chart data for integration status over time
  const chartData = [
    { day: "Mon", active: 12, syncing: 3 },
    { day: "Tue", active: 15, syncing: 2 },
    { day: "Wed", active: 18, syncing: 4 },
    { day: "Thu", active: 22, syncing: 3 },
    { day: "Fri", active: 25, syncing: 2 },
    { day: "Sat", active: 23, syncing: 3 },
    { day: "Sun", active: 20, syncing: 2 },
  ]

  const metrics = [
    { 
      id: "integrations", 
      value: "100+", 
      label: "Integrations", 
      change: "+15", 
      icon: <Plug className="h-4 w-4" />,
      color: "text-emerald-600"
    },
    { 
      id: "sync", 
      value: "<1s", 
      label: "Sync Time", 
      change: "99.9%", 
      icon: <Clock className="h-4 w-4" />,
      color: "text-blue-600"
    },
    { 
      id: "security", 
      value: "100%", 
      label: "Secure", 
      change: "Zero breaches", 
      icon: <Shield className="h-4 w-4" />,
      color: "text-purple-600"
    }
  ]

  const features = [
    {
      icon: <Plug className="h-5 w-5" />,
      title: "One-Click Setup",
      description: "Connect integrations in minutes, not hours"
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Real-Time Sync",
      description: "Keep data synchronized across all platforms"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Enterprise Security",
      description: "Bank-level encryption and compliance"
    }
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-primary/5" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        
        {/* Floating Paths Background Animation */}
        <div className="absolute inset-0 z-0 overflow-hidden opacity-[0.15]">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none" />
        {/* Additional overlay for left content area to improve text readability */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-background/60 via-transparent to-transparent pointer-events-none lg:block hidden" />
        
        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full animate-pulse z-[2]" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-primary/10 rounded-lg rotate-12 animate-pulse delay-1000 z-[2]" />
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-primary/5 rounded-full animate-pulse delay-500 z-[2]" />
        <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-primary/10 rounded-lg rotate-45 animate-pulse delay-700 z-[2]" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] z-[2]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-12 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-start pt-8">
          {/* Left Column - Content */}
          <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Badge */}
            <div className="inline-flex">
              <Badge variant="secondary" className="px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20">
                <Plug className="h-4 w-4 mr-2" />
                Integration Platform
              </Badge>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
                <span className="text-slate-900">Connect All Your</span>
                <br />
                <span className="text-primary">
                  Favorite Tools
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-2xl">
                Seamlessly integrate with 100+ popular apps and services. Connect your entire tech stack in minutes and automate your workflows.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="px-8 py-4 text-lg bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <Link href="/auth/sign-up" className="flex items-center">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-4 text-lg border-2 hover:bg-slate-50 transition-all duration-300">
                <Link href="/contact" className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Contact Sales
                </Link>
              </Button>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3">
              {features.map((feature) => (
                <div 
                  key={`feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
                  className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-slate-200 hover:border-primary/30 transition-all duration-300 hover:shadow-md"
                >
                  <div className="text-primary">{feature.icon}</div>
                  <span className="text-sm font-medium text-slate-700">{feature.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Interactive Dashboard Preview */}
          <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Main Dashboard Card */}
            <Card className="relative overflow-hidden bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="p-0">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                  </div>
                  <div className="text-sm text-slate-500">Integrations Dashboard</div>
                </div>

                {/* Dashboard Content */}
                <div className="p-6 space-y-6">
                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-4">
                    {metrics.map((metric, index) => (
                      <div 
                        key={metric.id}
                        className={`p-4 rounded-lg border transition-all duration-500 ${
                          activeMetric === index 
                            ? 'bg-primary/5 border-primary/20 shadow-lg scale-105' 
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className={`${metric.color}`}>{metric.icon}</div>
                          <span className="text-xs font-medium text-emerald-600">{metric.change}</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{metric.value}</div>
                        <div className="text-xs text-slate-600">{metric.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Integration Status Chart */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-slate-900">Integration Status</h3>
                    <div className="h-32 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorSyncing" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                          <XAxis 
                            dataKey="day" 
                            tick={{ fontSize: 10, fill: '#64748b' }}
                            axisLine={{ stroke: '#e2e8f0' }}
                          />
                          <YAxis 
                            tick={{ fontSize: 10, fill: '#64748b' }}
                            axisLine={{ stroke: '#e2e8f0' }}
                            width={30}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e2e8f0',
                              borderRadius: '0.5rem',
                              fontSize: '12px',
                              padding: '8px',
                            }}
                            formatter={(value: number) => [value, '']}
                          />
                          <Area
                            type="monotone"
                            dataKey="active"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorActive)"
                          />
                          <Area
                            type="monotone"
                            dataKey="syncing"
                            stroke="#10b981"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorSyncing)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex items-center justify-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-slate-600">Active</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-slate-600">Syncing</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Integrations */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-900">Active Integrations</h3>
                    {[
                      { id: "stripe", name: "Stripe", status: "connected", lastSync: "2 min ago" },
                      { id: "quickbooks", name: "QuickBooks", status: "connected", lastSync: "5 min ago" },
                      { id: "shopify", name: "Shopify", status: "syncing", lastSync: "Just now" }
                    ].map((integration) => (
                      <div key={integration.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <div className="text-sm font-medium text-slate-900">{integration.name}</div>
                          <div className="text-xs text-slate-500">{integration.status}</div>
                        </div>
                        <div className="text-xs text-slate-500">{integration.lastSync}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full animate-pulse" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-primary/5 rounded-lg rotate-12 animate-pulse delay-500" />
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-slate-400" />
        </div>
      </div>
    </div>
  )
}

