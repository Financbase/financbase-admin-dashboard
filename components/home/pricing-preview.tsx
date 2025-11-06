/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client"

import { CheckCircle, Star, Zap, Shield, Users, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import NumberFlow from "@number-flow/react"
import { motion } from "framer-motion"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function PricingPreview() {
  const [isYearly, setIsYearly] = useState(false)
  const router = useRouter()

  const plans = [
    {
      id: "starter",
      name: "Starter",
      description: "Perfect for small businesses getting started",
      price: 29,
      yearlyPrice: 249,
      buttonText: "Get started",
      buttonVariant: "outline" as const,
      includes: [
        "Free includes:",
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
      includes: [
        "Everything in Starter, plus:",
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
      includes: [
        "Everything in Professional, plus:",
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
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gray-900">Simple, </span>
            <span 
              className="font-bold"
              style={{
                background: `linear-gradient(to right, var(--brand-primary), var(--brand-primary-light))`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Transparent Pricing
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your business. All plans include our core AI features and 24/7 support.
          </p>
          
          {/* Pricing Toggle */}
          <PricingSwitch />
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
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
                className={`h-full transition-all duration-300 hover:shadow-xl border border-neutral-200 bg-white ${plan.popular ? 'ring-2 bg-opacity-10' : ''}`}
                style={plan.popular ? { 
                  '--tw-ring-color': 'var(--brand-primary)',
                  backgroundColor: 'oklch(0.95 0.05 271.13)',
                } as React.CSSProperties : {}}
              >
                <CardHeader className="text-left">
                  <div className="flex justify-between">
                    <h3 className="xl:text-3xl md:text-2xl text-3xl font-semibold text-gray-900 mb-2">
                      {plan.name} Plan
                    </h3>
                    {plan.popular && (
                      <div className="">
                        <span 
                          className="text-white px-3 py-1 rounded-full text-sm font-medium"
                          style={{ backgroundColor: 'var(--brand-primary)' }}
                        >
                          Popular
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="xl:text-sm md:text-xs text-sm text-gray-600 mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-semibold text-gray-900">
                      $
                      <NumberFlow
                        format={{
                          currency: "USD",
                        }}
                        value={isYearly ? plan.yearlyPrice : plan.price}
                        className="text-4xl font-semibold"
                      />
                    </span>
                    <span className="text-gray-600 ml-1">
                      /{isYearly ? "year" : "month"}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {plan.name === "Enterprise" ? (
                    <Button
                      asChild
                      className={`w-full mb-6 p-4 text-xl rounded-xl ${
                        plan.popular
                          ? "text-white border"
                          : plan.buttonVariant === "outline"
                            ? "bg-gradient-to-t from-neutral-900 to-neutral-600 border border-neutral-700 text-white"
                            : ""
                      }`}
                      style={plan.popular ? {
                        background: `linear-gradient(to bottom, var(--brand-primary-light), var(--brand-primary))`,
                        borderColor: 'var(--brand-primary)',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
                      } : {
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      <Link href="/contact" prefetch={false}>
                        {plan.buttonText}
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        // Use router.push to navigate directly to sign-up page
                        router.push('/auth/sign-up');
                      }}
                      className={`w-full mb-6 p-4 text-xl rounded-xl ${
                        plan.popular
                          ? "text-white border"
                          : plan.buttonVariant === "outline"
                            ? "bg-gradient-to-t from-neutral-900 to-neutral-600 border border-neutral-700 text-white"
                            : ""
                      }`}
                      style={plan.popular ? {
                        background: `linear-gradient(to bottom, var(--brand-primary-light), var(--brand-primary))`,
                        borderColor: 'var(--brand-primary)',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
                      } : {
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      {plan.buttonText}
                    </Button>
                  )}
                  <Button
                    asChild
                    variant="outline"
                    className="w-full mb-6 p-4 text-xl rounded-xl bg-white text-black border border-gray-200 hover:bg-gray-50"
                    style={{
                      boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    }}
                  >
                    <Link href="/contact">
                      Click to Sale
                    </Link>
                  </Button>

                  <div className="space-y-3 pt-4 border-t border-neutral-200">
                    <h2 className="text-xl font-semibold uppercase text-gray-900 mb-3">
                      Features
                    </h2>
                    <h4 className="font-medium text-base text-gray-900 mb-3">
                      {plan.includes[0]}
                    </h4>
                    <ul className="space-y-2 font-semibold">
                      {plan.includes.slice(1).map((feature, featureIndex) => (
                        <li key={`${plan.id}-${feature}-${featureIndex}`} className="flex items-center">
                          <span 
                            className="h-6 w-6 bg-white border rounded-full grid place-content-center mt-0.5 mr-3"
                            style={{ borderColor: 'var(--brand-primary)' }}
                          >
                            <CheckCheck 
                              className="h-4 w-4" 
                              style={{ color: 'var(--brand-primary)' }}
                            />
                          </span>
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          className="text-center mt-16"
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
            <h3 className="text-2xl font-bold mb-8">
              All Plans Include
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { id: "free-trial", icon: <CheckCircle className="h-6 w-6" />, text: "14-day free trial" },
                { id: "no-fees", icon: <Shield className="h-6 w-6" />, text: "No setup fees" },
                { id: "cancel-anytime", icon: <Users className="h-6 w-6" />, text: "Cancel anytime" }
              ].map((item) => (
                <div key={item.id} className="flex flex-col items-center justify-center group">
                  <div className="text-white mb-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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
