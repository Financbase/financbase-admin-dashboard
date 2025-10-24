"use client"

import { 
  Brain, 
  TrendingUp, 
  Shield, 
  Zap, 
  BarChart3, 
  Users, 
  Lock, 
  Smartphone,
  ArrowRight,
  CheckCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

export default function FeaturesShowcase() {
  const features = [
    {
      id: "ai-insights",
      icon: <Brain className="h-8 w-8" />,
      title: "AI-Powered Insights",
      description: "Machine learning algorithms analyze your financial data to provide actionable insights and predictions.",
      benefits: ["Predictive analytics", "Anomaly detection", "Smart recommendations"]
    },
    {
      id: "real-time-analytics",
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Real-Time Analytics",
      description: "Monitor your financial health with live dashboards and instant reporting capabilities.",
      benefits: ["Live dashboards", "Instant reports", "Custom metrics"]
    },
    {
      id: "smart-automation",
      icon: <Zap className="h-8 w-8" />,
      title: "Smart Automation",
      description: "Automate repetitive tasks and workflows to save time and reduce human error.",
      benefits: ["Workflow automation", "Smart categorization", "Auto-reconciliation"]
    },
    {
      id: "enterprise-security",
      icon: <Shield className="h-8 w-8" />,
      title: "Enterprise Security",
      description: "Bank-level security with SOC 2 compliance and advanced encryption protocols.",
      benefits: ["SOC 2 compliant", "End-to-end encryption", "Multi-factor auth"]
    },
    {
      id: "advanced-reporting",
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Advanced Reporting",
      description: "Generate comprehensive financial reports with customizable templates and scheduling.",
      benefits: ["Custom reports", "Scheduled delivery", "Visual analytics"]
    },
    {
      id: "team-collaboration",
      icon: <Users className="h-8 w-8" />,
      title: "Team Collaboration",
      description: "Enable seamless collaboration with role-based access and real-time updates.",
      benefits: ["Role-based access", "Real-time sync", "Team workflows"]
    }
  ]

  const integrations = [
    { id: "quickbooks", name: "QuickBooks", logo: "/integrations/quickbooks.svg" },
    { id: "xero", name: "Xero", logo: "/integrations/xero.svg" },
    { id: "stripe", name: "Stripe", logo: "/integrations/stripe.svg" },
    { id: "paypal", name: "PayPal", logo: "/integrations/paypal.svg" },
    { id: "bank-apis", name: "Bank APIs", logo: "/integrations/bank.svg" },
    { id: "salesforce", name: "Salesforce", logo: "/integrations/salesforce.svg" }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Manage Your Finances
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powerful features designed to streamline your financial operations and drive business growth
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature) => (
            <Card
              key={feature.id}
              className="group hover:shadow-xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm hover:scale-105"
            >
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl text-white mr-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                
                <ul className="space-y-3">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={`${feature.id}-benefit-${benefitIndex}`} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Integrations Section */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Seamless Integrations
              </h3>
              <p className="text-gray-600 text-lg">
                Connect with your existing tools and workflows
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
              {integrations.map((integration) => (
                <div
                  key={integration.id}
                  className="group flex flex-col items-center p-6 rounded-xl border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300 hover:scale-105"
                >
                  <Image
                    src={integration.logo}
                    alt={integration.name}
                    width={40}
                    height={40}
                    className="h-10 w-10 mb-3 grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                  <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">{integration.name}</span>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <Button asChild variant="outline" size="lg" className="px-8">
                <Link href="/integrations">
                  View All Integrations
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security & Compliance */}
        <Card className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Enterprise-Grade Security
                </h3>
                <p className="text-gray-600 mb-6 text-lg">
                  Your financial data is protected with bank-level security and compliance standards.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: "soc2", icon: <Shield className="h-5 w-5 text-green-500" />, text: "SOC 2 Type II" },
                    { id: "ssl", icon: <Lock className="h-5 w-5 text-green-500" />, text: "256-bit SSL" },
                    { id: "gdpr", icon: <Users className="h-5 w-5 text-green-500" />, text: "GDPR Compliant" },
                    { id: "2fa", icon: <Smartphone className="h-5 w-5 text-green-500" />, text: "2FA Enabled" }
                  ].map((item) => (
                    <div key={item.id} className="flex items-center group">
                      {item.icon}
                      <span className="text-sm font-medium text-gray-700 ml-2 group-hover:text-gray-900">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mb-4 group hover:scale-110 transition-transform duration-300">
                  <Shield className="h-16 w-16 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-600">
                  Trusted by Fortune 500 companies
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
