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
  Target,
  TrendingUp, 
  BarChart3,
  ChevronDown,
  DollarSign,
  MousePointer,
  Eye
} from "lucide-react"
import Link from "next/link"

export default function AdboardHero() {
  const [activeMetric, setActiveMetric] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setActiveMetric((prev) => (prev + 1) % 3)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const metrics = [
    { 
      id: "roas", 
      value: "3.2x", 
      label: "Average ROAS", 
      change: "+45%", 
      icon: <TrendingUp className="h-4 w-4" />,
      color: "text-emerald-600"
    },
    { 
      id: "conversions", 
      value: "+85%", 
      label: "Conversion Rate", 
      change: "+23%", 
      icon: <MousePointer className="h-4 w-4" />,
      color: "text-blue-600"
    },
    { 
      id: "cost", 
      value: "40%", 
      label: "Cost Reduction", 
      change: "-12%", 
      icon: <DollarSign className="h-4 w-4" />,
      color: "text-purple-600"
    }
  ]

  const features = [
    {
      icon: <Target className="h-5 w-5" />,
      title: "Multi-Platform Management",
      description: "Manage all your ad campaigns from one dashboard"
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Real-Time Analytics",
      description: "Track performance with live data and insights"
    },
    {
      icon: <Eye className="h-5 w-5" />,
      title: "Audience Insights",
      description: "Understand your audience with detailed analytics"
    }
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full animate-pulse" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-primary/10 rounded-lg rotate-12 animate-pulse delay-1000" />
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-primary/5 rounded-full animate-pulse delay-500" />
        <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-primary/10 rounded-lg rotate-45 animate-pulse delay-700" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-screen">
          {/* Left Column - Content */}
          <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Badge */}
            <div className="inline-flex">
              <Badge variant="secondary" className="px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20">
                <Target className="h-4 w-4 mr-2" />
                Campaign Management Platform
              </Badge>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
                <span className="text-slate-900">Advertising Campaigns</span>
                <br />
                <span className="text-primary">
                  Optimized
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-2xl">
                Professional campaign management and advertising analytics platform. 
                Optimize your ad spend, track performance, and maximize ROI across all channels.
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
                  <div className="text-sm text-slate-500">Adboard Dashboard</div>
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

                  {/* Chart Placeholder */}
                  <div className="h-32 bg-primary/5 rounded-lg flex items-center justify-center">
                    <div className="text-slate-500 text-sm">Campaign Performance</div>
                  </div>

                  {/* Recent Campaigns */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-900">Active Campaigns</h3>
                    {[
                      { id: "campaign-001", name: "Summer Sale Campaign", spend: "$2,450", status: "active" },
                      { id: "campaign-002", name: "Product Launch", spend: "$890", status: "paused" },
                      { id: "campaign-003", name: "Brand Awareness", spend: "$5,200", status: "active" }
                    ].map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <div className="text-sm font-medium text-slate-900">{campaign.name}</div>
                          <div className="text-xs text-slate-500">{campaign.status}</div>
                        </div>
                        <div className="text-sm font-semibold text-slate-900">{campaign.spend}</div>
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

