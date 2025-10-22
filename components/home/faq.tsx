"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, HelpCircle, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const faqs = [
    {
      question: "How does the AI financial intelligence work?",
      answer: "Our AI analyzes your financial data in real-time using advanced machine learning algorithms. It identifies patterns, predicts trends, detects anomalies, and provides actionable insights to help you make better financial decisions. The system learns from your business patterns and gets smarter over time."
    },
    {
      question: "Is my financial data secure?",
      answer: "Absolutely. We use bank-level 256-bit encryption, SOC 2 Type II compliance, and follow industry best practices for data security. Your financial data is encrypted in transit and at rest, and we never share or sell your information to third parties."
    },
    {
      question: "How long does it take to set up?",
      answer: "Most customers are up and running in less than 30 minutes. Our platform connects to your existing financial accounts automatically, and our AI begins analyzing your data immediately. No complex setup or technical expertise required."
    },
    {
      question: "Can I integrate with my existing accounting software?",
      answer: "Yes! We support integrations with popular accounting platforms including QuickBooks, Xero, Sage, NetSuite, and many others. We also provide a robust API for custom integrations with your existing systems."
    },
    {
      question: "What kind of businesses do you work with?",
      answer: "We work with businesses of all sizes, from startups to enterprise corporations. Our platform scales with your needs, whether you're a small business managing basic finances or a large organization with complex financial operations."
    },
    {
      question: "How accurate are the AI predictions?",
      answer: "Our AI achieves 94% accuracy in financial forecasting based on historical data analysis. The system continuously improves its predictions as it learns from more data and outcomes. We provide confidence scores for all predictions so you can make informed decisions."
    },
    {
      question: "Do you offer customer support?",
      answer: "Yes! We provide 24/7 customer support through multiple channels. Our AI assistant is available around the clock, and our human support team is available during business hours. Enterprise customers get priority support and dedicated account managers."
    },
    {
      question: "What happens to my data if I cancel?",
      answer: "Your data remains yours. If you cancel your subscription, you can export all your financial data in standard formats. We provide 90 days to export your data after cancellation, and we never delete your information without explicit consent."
    }
  ]

  const quickActions = [
    {
      title: "Get Started Guide",
      description: "Step-by-step setup instructions",
      href: "/docs/getting-started",
      icon: "📚"
    },
    {
      title: "API Documentation",
      description: "Technical integration guides",
      href: "/docs/api",
      icon: "🔧"
    },
    {
      title: "Video Tutorials",
      description: "Visual learning resources",
      href: "/docs/tutorials",
      icon: "🎥"
    },
    {
      title: "Contact Support",
      description: "Get help from our team",
      href: "/support",
      icon: "💬"
    }
  ]

  return (
    <div className="py-24 bg-gradient-to-br from-blue-50 to-purple-50">
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
            FAQ
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Frequently Asked
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}Questions
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about Financbase and how it can help your business.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 bg-white/70 backdrop-blur-sm hover:bg-white/80 transition-colors">
                  <button
                    className="w-full p-6 text-left hover:bg-gray-50/50 transition-colors"
                    onClick={() => toggleItem(index)}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 pr-4">
                        {faq.question}
                      </h3>
                      {openItems.includes(index) ? (
                        <ChevronUp className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>

                  {openItems.includes(index) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-6"
                    >
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Still Need Help?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 bg-white/50 backdrop-blur-sm group hover:bg-white/70">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl mb-4">{action.icon}</div>
                    <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {action.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {action.description}
                    </p>
                    <Button asChild variant="outline" size="sm">
                      <Link href={action.href}>
                        Learn More
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <HelpCircle className="h-8 w-8 mr-3" />
              <h3 className="text-2xl font-bold">
                Can't Find What You're Looking For?
              </h3>
            </div>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Our support team is here to help! Get in touch with our experts for personalized assistance
              with your financial intelligence needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link href="/support">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Contact Support
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Link href="/docs">
                  Browse Documentation
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
