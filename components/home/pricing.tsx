/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Star, Zap } from "lucide-react"
import Link from "next/link"

export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: "month",
      description: "Perfect for small businesses and startups",
      features: [
        "Up to 1,000 transactions/month",
        "Basic AI insights",
        "Email support",
        "Standard reports",
        "1 user account"
      ],
      popular: false,
      buttonText: "Start Free Trial",
      buttonVariant: "outline" as const
    },
    {
      name: "Professional",
      price: "$99",
      period: "month",
      description: "Ideal for growing businesses",
      features: [
        "Up to 10,000 transactions/month",
        "Advanced AI insights",
        "Priority support",
        "Custom reports",
        "Team collaboration (5 users)",
        "API access",
        "Advanced automation"
      ],
      popular: true,
      buttonText: "Start Free Trial",
      buttonVariant: "default" as const,
      badge: "Most Popular"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "For large organizations with complex needs",
      features: [
        "Unlimited transactions",
        "Full AI suite",
        "24/7 phone support",
        "White-label solution",
        "Unlimited users",
        "Advanced security",
        "Custom integrations",
        "Dedicated success manager"
      ],
      popular: false,
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const
    }
  ]

  const faqs = [
    {
      question: "Can I change plans anytime?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes! We offer a 14-day free trial with full access to all features. No credit card required."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and bank transfers for enterprise customers."
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service."
    }
  ]

  return (
    <div 
      className="py-24"
      style={{
        background: `linear-gradient(to bottom right, oklch(0.98 0.01 271.13), oklch(0.95 0.05 271.13))`,
        '--brand-primary': 'oklch(0.388 0.1423 271.13)',
        '--brand-primary-light': 'oklch(0.45 0.1423 271.13)',
        '--brand-primary-dark': 'oklch(0.32 0.1423 271.13)',
      } as React.CSSProperties}
    >
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
          <p className="text-xl text-muted-foreground">
            Choose the perfect plan for your business. All plans include our core AI features and 24/7 support.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
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
                    {plan.badge}
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
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    {plan.period !== "pricing" && (
                      <span className="text-muted-foreground">/{plan.period}</span>
                    )}
                  </div>

                  <p className="text-muted-foreground">
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature) => (
                      <div key={`plan-${plan.name}-${feature.toLowerCase().replace(/\s+/g, '-')}`} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    asChild
                    className="w-full"
                    variant={plan.buttonVariant}
                  >
                    <Link href="/auth/sign-up">
                      {plan.buttonText}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h3>

          <div className="space-y-6">
            {faqs.map((faq) => (
              <Card key={`faq-${faq.question.toLowerCase().replace(/\s+/g, '-').slice(0, 50)}`} className="border-0 bg-white/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {faq.question}
                  </h4>
                  <p className="text-muted-foreground">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div 
            className="rounded-2xl p-8 text-white"
            style={{
              background: `linear-gradient(to right, var(--brand-primary), var(--brand-primary-dark))`,
            }}
          >
            <h3 className="text-2xl font-bold mb-4">
              Need a Custom Solution?
            </h3>
            <p className="mb-6 max-w-2xl mx-auto" style={{ color: 'oklch(0.9 0.05 271.13)' }}>
              We work with enterprise clients to create custom financial intelligence solutions
              tailored to your specific needs and requirements.
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link href="/contact">
                Contact Sales Team
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
