"use client"

import { CheckCircle, Star, Zap, Shield, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import NumberFlow from "@number-flow/react"
import { motion } from "framer-motion"
import { useState } from "react"
import Link from "next/link"

export default function PricingPreview() {
  const [isYearly, setIsYearly] = useState(false)

  const plans = [
    {
      id: "starter",
      name: "Starter",
      description: "Perfect for small businesses getting started",
      price: 29,
      yearlyPrice: 249,
      buttonText: "Get started",
      buttonVariant: "outline" as const,
      features: [
        "Up to 5 users",
        "Basic financial tracking",
        "Monthly reports",
        "Email support",
        "Mobile app access",
        "Basic analytics",
        "Export to PDF/Excel",
        "Standard security"
      ],
      popular: false,
    },
    {
      id: "professional",
      name: "Professional",
      description: "Ideal for growing businesses",
      price: 79,
      yearlyPrice: 639,
      buttonText: "Get started",
      buttonVariant: "default" as const,
      popular: true,
      features: [
        "Up to 25 users",
        "Advanced analytics",
        "Real-time reporting",
        "Priority support",
        "API access",
        "Custom integrations",
        "Advanced security",
        "Custom dashboards",
        "AI-powered insights",
        "Multi-currency support",
        "Budget planning tools",
        "Team collaboration"
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "For large organizations",
      price: 199,
      yearlyPrice: 1599,
      buttonText: "Get started",
      buttonVariant: "outline" as const,
      features: [
        "Unlimited users",
        "Advanced AI insights",
        "Custom dashboards",
        "Dedicated support",
        "White-label options",
        "API rate limits",
        "Custom integrations",
        "Advanced compliance",
        "Priority onboarding",
        "Custom training",
        "SLA guarantee"
      ],
      popular: false,
    }
  ]

  const PricingSwitch = () => {
    const [selected, setSelected] = useState("0")

    const handleSwitch = (value: string) => {
      setSelected(value)
      setIsYearly(Number.parseInt(value) === 1)
    }

    return (
      <div className="flex justify-center mb-8">
        <div className="relative z-10 mx-auto flex w-fit rounded-xl bg-neutral-50 border border-gray-200 p-1">
          <button
            type="button"
            onClick={() => handleSwitch("0")}
            className={cn(
              "relative z-10 w-fit cursor-pointer h-12 rounded-xl sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors sm:text-base text-sm",
              selected === "0"
                ? "text-white"
                : "text-muted-foreground hover:text-black",
            )}
          >
            {selected === "0" && (
              <motion.span
                layoutId={"switch"}
                className="absolute top-0 left-0 h-12 w-full rounded-xl border-4 shadow-sm"
                style={{
                  borderColor: 'var(--brand-primary)',
                  backgroundColor: 'var(--brand-primary)',
                  boxShadow: '0 0 0 1px var(--brand-primary)',
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative">Monthly Billing</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitch("1")}
            className={cn(
              "relative z-10 w-fit cursor-pointer h-12 flex-shrink-0 rounded-xl sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors sm:text-base text-sm",
              selected === "1"
                ? "text-white"
                : "text-muted-foreground hover:text-black",
            )}
          >
            {selected === "1" && (
              <motion.span
                layoutId={"switch"}
                className="absolute top-0 left-0 h-12 w-full rounded-xl border-4 shadow-sm"
                style={{
                  borderColor: 'var(--brand-primary)',
                  backgroundColor: 'var(--brand-primary)',
                  boxShadow: '0 0 0 1px var(--brand-primary)',
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              Yearly Billing
              <span 
                className="rounded-full px-2 py-0.5 text-xs font-medium text-black"
                style={{ backgroundColor: 'oklch(0.95 0.05 271.13)' }}
              >
                Save 20%
              </span>
            </span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <section 
      className="py-24"
      style={{
        background: `linear-gradient(to bottom right, oklch(0.98 0.01 271.13), oklch(0.95 0.05 271.13))`,
        '--brand-primary': 'oklch(0.388 0.1423 271.13)',
        '--brand-primary-light': 'oklch(0.45 0.1423 271.13)',
        '--brand-primary-dark': 'oklch(0.32 0.1423 271.13)',
      } as React.CSSProperties}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Pricing
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent
            <span 
              className="bg-clip-text text-transparent"
              style={{
                background: `linear-gradient(to right, var(--brand-primary), var(--brand-primary-light))`,
              }}
            >
              {" "}Pricing
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your business. All plans include our core AI features and 24/7 support.
          </p>
          
          {/* Pricing Toggle */}
          <PricingSwitch />
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative ${plan.popular ? 'scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge 
                    className="text-white px-4 py-1"
                    style={{
                      background: `linear-gradient(to right, var(--brand-primary), var(--brand-primary-light))`,
                    }}
                  >
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <Card 
                className={`h-full transition-all duration-300 hover:shadow-xl border-0 bg-white/70 backdrop-blur-sm ${plan.popular ? 'ring-2' : ''}`}
                style={plan.popular ? { ringColor: 'var(--brand-primary)' } : {}}
              >
                <CardHeader className="text-center pb-8">
                  <div className="flex items-center justify-center mb-4">
                    {plan.popular && <Zap className="h-6 w-6 mr-2" style={{ color: 'var(--brand-primary)' }} />}
                    <h3 className="text-2xl font-bold text-gray-900">
                      {plan.name}
                    </h3>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-gray-900">$</span>
                      <NumberFlow
                        value={isYearly ? plan.yearlyPrice : plan.price}
                        className="text-4xl font-bold text-gray-900"
                      />
                      <span className="text-muted-foreground ml-1">/{isYearly ? "year" : "month"}</span>
                    </div>
                  </div>

                  <p className="text-muted-foreground">
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={`${plan.id}-${feature}-${featureIndex}`} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    asChild
                    className={`w-full ${
                      plan.popular
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        : plan.buttonVariant === "outline"
                          ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                          : "bg-gray-900 hover:bg-gray-800 text-white"
                    }`}
                    size="lg"
                  >
                    <Link href={plan.name === "Enterprise" ? "/contact" : "/auth/sign-up"}>
                      {plan.buttonText}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div 
            className="rounded-2xl p-8 text-white max-w-4xl mx-auto"
            style={{
              background: `linear-gradient(to right, var(--brand-primary), var(--brand-primary-dark))`,
            }}
          >
            <h3 className="text-2xl font-bold mb-4">
              All Plans Include
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { id: "free-trial", icon: <CheckCircle className="h-6 w-6" />, text: "14-day free trial" },
                { id: "no-fees", icon: <Shield className="h-6 w-6" />, text: "No setup fees" },
                { id: "cancel-anytime", icon: <Users className="h-6 w-6" />, text: "Cancel anytime" }
              ].map((item) => (
                <div key={item.id} className="flex flex-col items-center group">
                  <div className="text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <span className="font-medium" style={{ color: 'oklch(0.9 0.05 271.13)' }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
