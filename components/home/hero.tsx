"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  TrendingUp,
  Clock,
  Users,
  CheckCircle,
  ArrowRight,
  Star,
  Sparkles
} from "lucide-react"
import Link from "next/link"

export default function Hero() {
  const features = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI-Powered Insights",
      description: "Machine learning algorithms analyze your financial data in real-time"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Predictive Analytics",
      description: "Forecast trends and identify opportunities before they happen"
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Enterprise Security",
      description: "Bank-level encryption and compliance with financial regulations"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Instant Automation",
      description: "Streamline workflows with intelligent automation and smart categorization"
    }
  ]

  const stats = [
    { number: "10,000+", label: "Active Businesses", icon: <Users className="h-5 w-5" /> },
    { number: "$2B+", label: "Processed Annually", icon: <CheckCircle className="h-5 w-5" /> },
    { number: "99.9%", label: "Uptime Guarantee", icon: <CheckCircle className="h-5 w-5" /> },
    { number: "24/7", label: "AI Support", icon: <Clock className="h-5 w-5" /> }
  ]

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-100 rounded-full opacity-20 animate-pulse" />
      <div className="absolute top-40 right-20 w-16 h-16 bg-purple-100 rounded-full opacity-20 animate-pulse delay-1000" />
      <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-green-100 rounded-full opacity-20 animate-pulse delay-500" />

      <div className="relative z-10 container mx-auto px-4 py-20">
        {/* Badge */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 mr-2" />
            AI-Powered Financial Intelligence Platform
          </Badge>
        </motion.div>

        {/* Main Heading */}
        <motion.div
          className="text-center max-w-5xl mx-auto mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
              Transform Your
            </span>
            <br />
            <span className="text-gray-900">Financial Future</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            AI-powered financial intelligence that automates workflows, predicts trends,
            and provides actionable insights to help your business thrive.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button asChild size="lg" className="px-8 py-4 text-lg">
            <Link href="/auth/sign-up">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="px-8 py-4 text-lg">
            <Link href="/about">
              Watch Demo
            </Link>
          </Button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-lg border">
              <div className="flex items-center justify-center mb-2 text-blue-600">
                {stat.icon}
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {stat.number}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 bg-white/70 backdrop-blur-sm rounded-xl border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg mb-4 group-hover:bg-blue-200 transition-colors flex items-center justify-center">
                <div className="text-blue-600">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          className="flex flex-wrap justify-center items-center gap-8 mt-16 opacity-60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>4.9/5 Rating</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>10,000+ Businesses</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4" />
            <span>SOC 2 Compliant</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>99.9% Uptime</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
