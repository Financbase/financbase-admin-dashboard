"use client"

import { CheckCircle, Star, Zap, Shield, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function PricingPreview() {
  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for small businesses getting started",
      icon: <Users className="h-6 w-6" />,
      features: [
        "Up to 5 users",
        "Basic financial reports",
        "Email support",
        "Standard integrations",
        "Mobile app access"
      ],
      popular: false,
      cta: "Start Free Trial",
      color: "border-gray-200"
    },
    {
      id: "professional",
      name: "Professional",
      price: "$79",
      period: "/month",
      description: "Ideal for growing businesses with advanced needs",
      icon: <Zap className="h-6 w-6" />,
      features: [
        "Up to 25 users",
        "Advanced analytics & AI insights",
        "Priority support",
        "All integrations",
        "Custom reporting",
        "API access",
        "Advanced automation"
      ],
      popular: true,
      cta: "Start Free Trial",
      color: "border-blue-500"
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations with complex requirements",
      icon: <Shield className="h-6 w-6" />,
      features: [
        "Unlimited users",
        "Custom AI models",
        "Dedicated support",
        "Custom integrations",
        "White-label options",
        "Advanced security",
        "SLA guarantee"
      ],
      popular: false,
      cta: "Contact Sales",
      color: "border-gray-200"
    }
  ]

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <Badge variant="outline" className="mb-4 px-4 py-2">
            <Star className="h-4 w-4 mr-2 fill-yellow-400 text-yellow-400" />
            No hidden fees
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Pricing
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that fits your business needs. All plans include a 14-day free trial.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative group hover:shadow-2xl transition-all duration-500 ${
                plan.popular 
                  ? "ring-2 ring-blue-500 shadow-xl scale-105" 
                  : "hover:scale-105"
              } ${plan.color}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 text-sm font-medium">
                    <Star className="h-4 w-4 mr-1 fill-white" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
                  plan.popular 
                    ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white" 
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                <CardDescription className="text-gray-600">{plan.description}</CardDescription>
                <div className="flex items-baseline justify-center mt-4">
                  <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 ml-1 text-lg">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="px-6">
                <ul className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={`${plan.id}-feature-${featureIndex}`} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-6">
                <Button
                  asChild
                  className={`w-full ${
                    plan.popular
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                      : "bg-gray-900 hover:bg-gray-800"
                  }`}
                  size="lg"
                >
                  <Link href={plan.name === "Enterprise" ? "/contact" : "/auth/sign-up"}>
                    {plan.cta}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <Card className="max-w-4xl mx-auto bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              All Plans Include
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { id: "free-trial", icon: <CheckCircle className="h-6 w-6" />, text: "14-day free trial", color: "text-green-600" },
                { id: "no-fees", icon: <Shield className="h-6 w-6" />, text: "No setup fees", color: "text-blue-600" },
                { id: "cancel-anytime", icon: <Users className="h-6 w-6" />, text: "Cancel anytime", color: "text-purple-600" }
              ].map((item) => (
                <div key={item.id} className="flex flex-col items-center group">
                  <div className={`${item.color} mb-2 group-hover:scale-110 transition-transform duration-300`}>
                    {item.icon}
                  </div>
                  <span className="font-medium text-gray-700">{item.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
