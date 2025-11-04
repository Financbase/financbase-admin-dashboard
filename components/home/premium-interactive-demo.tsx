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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ArrowRight,
  TrendingUp,
  BarChart3,
  CheckCircle,
  Zap
} from "lucide-react"
import Link from "next/link"

export default function PremiumInteractiveDemo() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const demoSteps = [
    {
      id: "data-import",
      title: "Smart Data Import",
      description: "Connect your bank accounts and import historical data in seconds",
      icon: <TrendingUp className="h-6 w-6" />,
      metrics: { value: "2.4M", label: "Transactions Imported", time: "2.3s" },
      color: "from-blue-500 to-blue-600"
    },
    {
      id: "ai-categorization",
      title: "AI Categorization",
      description: "Machine learning automatically categorizes and tags your transactions",
      icon: <Zap className="h-6 w-6" />,
      metrics: { value: "94%", label: "Accuracy Rate", time: "0.8s" },
      color: "from-purple-500 to-purple-600"
    },
    {
      id: "real-time-analytics",
      title: "Real-Time Analytics",
      description: "Live dashboards show your financial health with predictive insights",
      icon: <BarChart3 className="h-6 w-6" />,
      metrics: { value: "99.7%", label: "Prediction Accuracy", time: "0.1s" },
      color: "from-emerald-500 to-emerald-600"
    },
    {
      id: "automated-reports",
      title: "Automated Reports",
      description: "Generate comprehensive reports and send them to stakeholders",
      icon: <CheckCircle className="h-6 w-6" />,
      metrics: { value: "15", label: "Reports Generated", time: "1.2s" },
      color: "from-orange-500 to-orange-600"
    }
  ]

  const liveMetrics = [
    { id: "revenue", label: "Monthly Revenue", value: "$2,450,000", change: "+12.3%", trend: "up" },
    { id: "expenses", label: "Operating Expenses", value: "$1,890,000", change: "-2.1%", trend: "down" },
    { id: "profit", label: "Net Profit", value: "$560,000", change: "+18.7%", trend: "up" },
    { id: "cash-flow", label: "Cash Flow", value: "$890,000", change: "+8.2%", trend: "up" }
  ]

  const recentTransactions = [
    { id: 1, description: "Invoice #INV-001 processed", amount: "$2,450", status: "completed", time: "2m ago" },
    { id: 2, description: "Expense report approved", amount: "$890", status: "pending", time: "5m ago" },
    { id: 3, description: "Payment received from Client A", amount: "$5,200", status: "completed", time: "8m ago" },
    { id: 4, description: "Automated reconciliation", amount: "$1,230", status: "completed", time: "12m ago" }
  ]

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % demoSteps.length)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [isPlaying])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentStep(0)
  }

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Badge variant="outline" className="mb-6 px-4 py-2 text-sm font-medium">
            <Play className="h-4 w-4 mr-2" />
            Interactive Demo
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            See Financbase in action
            <span className="block text-primary">Experience the power</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Watch how our AI-powered platform transforms your financial operations in real-time
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Demo Controls */}
          <div className={`space-y-8 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Demo Steps */}
            <div className="space-y-4">
              {demoSteps.map((step, index) => (
                <Card 
                  key={step.id}
                  className={`transition-all duration-500 cursor-pointer ${
                    currentStep === index 
                      ? 'ring-2 ring-primary/20 shadow-lg scale-105 bg-primary/5' 
                      : 'hover:shadow-md hover:scale-102'
                  }`}
                  onClick={() => setCurrentStep(index)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className={`p-3 bg-gradient-to-br ${step.color} rounded-lg text-white mr-4`}>
                        {step.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">{step.title}</h3>
                        <p className="text-sm text-slate-600 mb-2">{step.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="font-medium">{step.metrics.value} {step.metrics.label}</span>
                          <span>•</span>
                          <span>{step.metrics.time}</span>
                        </div>
                      </div>
                      {currentStep === index && (
                        <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Demo Controls */}
            <div className="flex items-center gap-4">
              <Button 
                onClick={handlePlayPause}
                className="flex items-center gap-2"
                variant={isPlaying ? "outline" : "default"}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? 'Pause' : 'Play'} Demo
              </Button>
              <Button 
                onClick={handleReset}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>

            {/* CTA */}
            <div className="pt-8">
              <Button asChild size="lg" className="w-full">
                <Link href="/demo">
                  Try Interactive Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Column - Live Dashboard Preview */}
          <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Card className="relative overflow-hidden bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="p-0">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                  </div>
                  <div className="text-sm text-slate-500">Financbase Live Dashboard</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xs text-emerald-600 font-medium">Live</span>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-6 space-y-6">
                  {/* Live Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    {liveMetrics.map((metric) => (
                      <div key={metric.id} className="p-4 rounded-lg border border-slate-200 hover:border-primary/30 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-slate-500">{metric.label}</span>
                          <span className={`text-xs font-medium ${
                            metric.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {metric.change}
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{metric.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Current Step Highlight */}
                  <div className={`p-4 rounded-lg bg-gradient-to-r ${demoSteps[currentStep]?.color} text-white`}>
                    <div className="flex items-center gap-3 mb-2">
                      {demoSteps[currentStep]?.icon}
                      <span className="font-semibold">{demoSteps[currentStep]?.title}</span>
                    </div>
                    <p className="text-sm opacity-90">{demoSteps[currentStep]?.description}</p>
                  </div>

                  {/* Recent Transactions */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-900">Recent Activity</h3>
                    {recentTransactions.slice(0, 3).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            transaction.status === 'completed' ? 'bg-emerald-500' : 'bg-yellow-500'
                          }`} />
                          <div>
                            <div className="text-sm font-medium text-slate-900">{transaction.description}</div>
                            <div className="text-xs text-slate-500">{transaction.time}</div>
                          </div>
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
      </div>
    </section>
  )
}
