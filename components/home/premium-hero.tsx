/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  ArrowRight, 
  MessageSquare, 
  Sparkles, 
  TrendingUp, 
  Shield, 
  Zap,
  ChevronDown,
  DollarSign,
  BarChart3,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
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

interface HomeMetrics {
  revenue: {
    total: number
    thisMonth: number
    lastMonth: number
    growth: number
    formatted: string
  }
  efficiency: {
    timeSaved: number
    change: number
    formatted: string
  }
  accuracy: {
    rate: number
    change: number
    formatted: string
  }
  totalUsers: number
  totalClients: number
  totalInvoices: number
  platformUptime: number
}

export default function PremiumHero() {
  const router = useRouter()
  const [activeMetric, setActiveMetric] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  // Fetch real metrics from API
  const { data: metricsData, isLoading, error } = useQuery<{ success: boolean; data: HomeMetrics }>({
    queryKey: ['home-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/home/metrics')
      if (!response.ok) throw new Error('Failed to fetch metrics')
      return response.json()
    },
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 60000, // Consider data fresh for 1 minute
  })

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setActiveMetric((prev) => (prev + 1) % 3)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // Use real data or fallback to defaults
  const metrics = metricsData?.data ? [
    { 
      id: "revenue", 
      value: metricsData.data.revenue.formatted, 
      label: "Revenue Processed", 
      change: metricsData.data.revenue.growth > 0 ? `+${metricsData.data.revenue.growth.toFixed(1)}%` : `${metricsData.data.revenue.growth.toFixed(1)}%`, 
      icon: <DollarSign className="h-4 w-4" />,
      color: "text-primary"
    },
    { 
      id: "efficiency", 
      value: metricsData.data.efficiency.formatted, 
      label: "Time Saved", 
      change: `+${metricsData.data.efficiency.change}%`, 
      icon: <TrendingUp className="h-4 w-4" />,
      color: "text-primary"
    },
    { 
      id: "accuracy", 
      value: metricsData.data.accuracy.formatted, 
      label: "Accuracy Rate", 
      change: `+${metricsData.data.accuracy.change}%`, 
      icon: <BarChart3 className="h-4 w-4" />,
      color: "text-primary"
    }
  ] : [
    { 
      id: "revenue", 
      value: "$2.4M", 
      label: "Revenue Processed", 
      change: "+23%", 
      icon: <DollarSign className="h-4 w-4" />,
      color: "text-primary"
    },
    { 
      id: "efficiency", 
      value: "94%", 
      label: "Time Saved", 
      change: "+12%", 
      icon: <TrendingUp className="h-4 w-4" />,
      color: "text-primary"
    },
    { 
      id: "accuracy", 
      value: "99.7%", 
      label: "Accuracy Rate", 
      change: "+5%", 
      icon: <BarChart3 className="h-4 w-4" />,
      color: "text-primary"
    }
  ]

  const features = [
    {
      icon: <Zap className="h-5 w-5" />,
      title: "AI-Powered Automation",
      description: "Intelligent workflows that adapt to your business"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Enterprise Security",
      description: "Bank-level encryption and compliance"
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Real-Time Insights",
      description: "Live analytics and predictive forecasting"
    }
  ]

  // Generate sample real-time analytics data
  const analyticsData = useMemo(() => {
    const days = 14
    const baseValue = 45000
    return Array.from({ length: days }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (days - 1 - i))
      const variation = (Math.random() - 0.5) * 10000
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.max(30000, baseValue + variation + (i * 500)), // Slight upward trend
      }
    })
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating Paths Background Animation - Same as sign-up page */}
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
                <Sparkles className="h-4 w-4 mr-2" />
                AI-Powered Financial Intelligence
              </Badge>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
                <span className="text-slate-900">Financial Operations</span>
                <br />
                <span className="text-primary">
                  Reimagined
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-2xl">
                The only platform that combines AI automation, real-time analytics, and enterprise security 
                to transform how modern businesses manage their finances.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="px-8 py-4 text-lg bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
                onClick={() => router.push('/auth/sign-up')}
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
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
                  <div className="text-sm text-slate-500">Financbase Dashboard</div>
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
                          <span className="text-xs font-medium text-primary">{metric.change}</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{metric.value}</div>
                        <div className="text-xs text-slate-600">{metric.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Real-time Analytics Chart */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-slate-900">Real-time Analytics</h3>
                    <div className="h-48 rounded-lg bg-background border border-border p-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={analyticsData}
                          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                        >
                          <defs>
                            <linearGradient id="heroAnalyticsGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="oklch(var(--brand-primary))" stopOpacity={0.6} />
                              <stop offset="50%" stopColor="oklch(var(--brand-primary))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="oklch(var(--brand-primary))" stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 500 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
                            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 500 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '12px',
                              padding: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="oklch(var(--brand-primary))"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#heroAnalyticsGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Recent Transactions */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-900">Recent Activity</h3>
                    {[
                      { id: "invoice-001", description: "Invoice #INV-001 processed", amount: "$2,450", status: "completed" },
                      { id: "expense-report", description: "Expense report approved", amount: "$890", status: "pending" },
                      { id: "payment-received", description: "Payment received", amount: "$5,200", status: "completed" }
                    ].map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <div className="text-sm font-medium text-slate-900">{transaction.description}</div>
                          <div className="text-xs text-slate-500">{transaction.status}</div>
                        </div>
                        <div className="text-sm font-semibold text-slate-900">{transaction.amount}</div>
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
