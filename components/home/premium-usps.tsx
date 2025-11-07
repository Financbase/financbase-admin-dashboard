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
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Brain, 
  Zap, 
  Shield, 
  Clock, 
  Users, 
  ArrowRight,
  CheckCircle,
  Sparkles,
  BarChart3,
  Lock,
  Smartphone
} from "lucide-react"
import Link from "next/link"
import { EnterpriseCapabilitiesSection } from "@/components/home/enterprise-capabilities-section"

export default function PremiumUSPs() {
  const [activeFeature, setActiveFeature] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const features = [
    {
      id: "ai-automation",
      icon: <Brain className="h-8 w-8" />,
      title: "AI-Powered Automation",
      description: "Machine learning algorithms that learn from your patterns and automate repetitive tasks",
      benefits: [
        "Smart invoice categorization",
        "Automated expense matching",
        "Predictive cash flow forecasting",
        "Intelligent anomaly detection"
      ],
      metrics: {
        value: "94%",
        label: "Time Saved",
        change: "+23%"
      },
      color: "bg-orange-500",
      href: "/products/workflows-automations"
    },
    {
      id: "real-time-analytics",
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Real-Time Analytics",
      description: "Live dashboards and insights that give you instant visibility into your financial health",
      benefits: [
        "Live financial dashboards",
        "Custom KPI tracking",
        "Automated reporting",
        "Trend analysis"
      ],
      metrics: {
        value: "99.7%",
        label: "Accuracy Rate",
        change: "+5%"
      },
      color: "bg-indigo-500",
      href: "/products/analytics"
    },
    {
      id: "enterprise-security",
      icon: <Shield className="h-8 w-8" />,
      title: "Enterprise Security",
      description: "Security-focused architecture with industry-standard encryption protocols",
      benefits: [
        "Security-first design",
        "256-bit SSL encryption",
        "Multi-factor authentication",
        "Role-based access control"
      ],
      metrics: {
        value: "Built for",
        label: "Reliability",
        change: "+0.1%"
      },
      color: "bg-teal-500",
      href: "/security"
    }
  ]

  const capabilities = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast",
      description: "Process thousands of transactions in seconds"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "24/7 Monitoring",
      description: "Continuous monitoring and instant alerts"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Team Collaboration",
      description: "Seamless collaboration across departments"
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Mobile First",
      description: "Full functionality on any device"
    }
  ]

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-primary/10 rounded-full blur-2xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20">
            <Sparkles className="h-4 w-4 mr-2" />
            Why Choose Financbase
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Built for the future of
            <span className="block text-primary">financial operations</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Three core capabilities that set us apart from traditional financial software
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <Card 
              key={feature.id}
              className={`group hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm hover:scale-105 cursor-pointer ${
                activeFeature === index ? 'ring-2 ring-primary/20 shadow-xl' : ''
              }`}
              onClick={() => setActiveFeature(index)}
            >
              <CardContent className="p-8">
                {/* Icon and Title */}
                <div className="flex items-center mb-6">
                  <div className={`p-4 ${feature.color} rounded-xl text-white mr-4 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-2xl font-bold text-slate-900">{feature.metrics.value}</div>
                      <div className="text-sm text-emerald-600 font-medium">{feature.metrics.change}</div>
                    </div>
                    <div className="text-xs text-slate-600">{feature.metrics.label}</div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-600 mb-6 leading-relaxed">{feature.description}</p>

                {/* Benefits */}
                <div className="space-y-3 mb-6">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <div key={`${feature.id}-benefit-${benefitIndex}`} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mr-3 flex-shrink-0" />
                      <span className="text-sm text-slate-700">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Learn More Button */}
                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-primary group-hover:text-white transition-all duration-300"
                  asChild
                >
                  <Link href={feature.href || "#"}>
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Capabilities Section */}
        <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <EnterpriseCapabilitiesSection
            capabilities={capabilities}
            title="Enterprise-Grade Capabilities"
            description="Everything you need to scale your financial operations"
          />
        </div>

        {/* Security Badge */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-slate-200 shadow-lg">
            <Lock className="h-5 w-5 text-primary" />
            <span className="font-medium text-slate-900">Security-First Architecture</span>
            <span className="text-slate-400">•</span>
            <span className="font-medium text-slate-900">256-bit SSL Encryption</span>
            <span className="text-slate-400">•</span>
            <span className="font-medium text-slate-900">Privacy-Focused Design</span>
          </div>
        </div>
      </div>
    </section>
  )
}
