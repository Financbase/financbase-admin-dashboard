"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Brain,
  Shield,
  Zap,
  Clock,
  Users,
  Target,
  Globe,
  Smartphone,
  Database,
  CheckCircle,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

export default function Features() {
  const mainFeatures = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI-Powered Financial Intelligence",
      description: "Our advanced machine learning algorithms analyze your financial data in real-time, providing actionable insights and predictive analytics to help you make smarter decisions.",
      features: [
        "Real-time data analysis",
        "Predictive trend forecasting",
        "Anomaly detection",
        "Smart recommendations"
      ],
      gradient: "from-blue-500 to-purple-600"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Comprehensive Analytics Dashboard",
      description: "Get a complete view of your financial health with interactive dashboards, custom reports, and automated insights delivered directly to your inbox.",
      features: [
        "Interactive financial dashboards",
        "Custom report generation",
        "Automated insights",
        "Multi-currency support"
      ],
      gradient: "from-green-500 to-blue-600"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Enterprise-Grade Security",
      description: "Bank-level security with SOC 2 compliance, end-to-end encryption, and advanced fraud detection to keep your financial data safe.",
      features: [
        "SOC 2 Type II compliant",
        "256-bit encryption",
        "Multi-factor authentication",
        "Real-time fraud monitoring"
      ],
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Intelligent Automation",
      description: "Streamline your financial workflows with smart automation that categorizes transactions, generates invoices, and handles reconciliation automatically.",
      features: [
        "Automated transaction categorization",
        "Smart invoice generation",
        "Workflow automation",
        "API integrations"
      ],
      gradient: "from-orange-500 to-red-600"
    }
  ]

  const additionalFeatures = [
    {
      icon: <Clock className="h-6 w-6" />,
      title: "24/7 AI Support",
      description: "Get instant help from our AI assistant that understands your financial context and provides personalized recommendations."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Team Collaboration",
      description: "Share insights, collaborate on reports, and manage permissions with role-based access control for your entire team."
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Goal Tracking",
      description: "Set financial targets, track progress in real-time, and get AI-powered recommendations to achieve your objectives."
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Global Compliance",
      description: "Stay compliant with international financial regulations including GDPR, SOX, and industry-specific requirements."
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Mobile-First Design",
      description: "Access your financial data anywhere with our responsive mobile app and web platform optimized for all devices."
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "Cloud-Native Architecture",
      description: "Built on modern cloud infrastructure for scalability, reliability, and performance with 99.9% uptime guarantee."
    }
  ]

  return (
    <div className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Badge variant="outline" className="mb-4">
            Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need for
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}Financial Intelligence
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Powerful features designed to transform how you manage, analyze, and grow your business finances.
          </p>
        </motion.div>

        {/* Main Features Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-20">
          {mainFeatures.map((feature) => (
            <motion.div
              key={`main-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.gradient} p-4 mb-6`}>
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-lg mb-6">
                    {feature.description}
                  </p>
                  <div className="space-y-3">
                    {feature.features.map((item, itemIndex) => (
                      <div key={`${feature.title}-${itemIndex}-${item.toLowerCase().replace(/\s+/g, '-')}`} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Features */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            More Powerful Features
          </h3>
          <p className="text-muted-foreground text-lg">
            Additional capabilities that make Financbase the complete financial intelligence platform.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {additionalFeatures.map((feature) => (
            <motion.div
              key={`additional-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="group"
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 bg-white/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <div className="text-blue-600">
                        {feature.icon}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {feature.title}
                      </h4>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Transform Your Financial Operations?
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join thousands of businesses already using Financbase to make smarter financial decisions
              and accelerate their growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link href="/auth/sign-up">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Link href="/about">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
