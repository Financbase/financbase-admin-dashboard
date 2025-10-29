"use client"

import { HelpCircle, MessageCircle, BookOpen } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function FAQ() {
  const faqs = [
    {
      id: "ai-insights",
      question: "How does Financbase's AI-powered insights work?",
      answer: "Our AI analyzes your financial data patterns to identify trends, anomalies, and opportunities. It uses machine learning to provide predictive analytics, smart categorization, and actionable recommendations tailored to your business."
    },
    {
      id: "data-security",
      question: "Is my financial data secure with Financbase?",
      answer: "Absolutely. We use industry-standard security with 256-bit SSL encryption and privacy-focused design. Your data is encrypted both in transit and at rest, with multi-factor authentication and role-based access controls."
    },
    {
      id: "integrations",
      question: "Can I integrate Financbase with my existing accounting software?",
      answer: "Yes! Financbase is API-ready for future integrations with popular accounting tools like QuickBooks, Xero, Stripe, and PayPal. Our integration framework is in place and we provide API access for custom integrations."
    },
    {
      id: "free-trial",
      question: "What's included in the free trial?",
      answer: "The 14-day free trial includes full access to all features of your chosen plan, with no credit card required. You can explore all our AI insights, automation features, and integrations during this period."
    },
    {
      id: "compliance",
      question: "How does Financbase help with compliance and reporting?",
      answer: "Financbase automates compliance reporting and provides audit trails for all transactions. We support various accounting standards and can generate reports for tax purposes, financial statements, and regulatory compliance."
    },
    {
      id: "customization",
      question: "Can I customize reports and dashboards?",
      answer: "Yes! You can create custom dashboards, set up automated reports, and configure alerts based on your specific business needs. Our reporting engine supports custom metrics and KPIs."
    },
    {
      id: "support",
      question: "What kind of support do you provide?",
      answer: "We offer 24/7 email support for all plans, with priority support for Professional and Enterprise customers. Enterprise customers get dedicated account managers and phone support."
    },
    {
      id: "getting-started",
      question: "How quickly can I get started with Financbase?",
      answer: "You can be up and running in minutes! Simply sign up, connect your bank accounts or import your data, and our AI will start analyzing your financial patterns immediately."
    }
  ]

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-gray-50 to-[var(--brand-primary)]/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <Badge variant="outline" className="mb-4 px-4 py-2">
            <HelpCircle className="h-4 w-4 mr-2" />
            Common Questions
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Frequently Asked
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-primary-light)]">
              Questions
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about Financbase
          </p>
        </div>

        {/* FAQ Accordion */}
        <Card className="mb-12 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-0">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id} className="border-b border-gray-100 last:border-b-0">
                  <AccordionTrigger className="px-8 py-6 text-left hover:no-underline hover:bg-gray-50/50 transition-colors">
                    <span className="font-semibold text-gray-900 text-lg">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 pb-6">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
                  </CardContent>
                </Card>

        {/* Contact CTA */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-[var(--brand-primary)]/5 to-[var(--brand-primary)]/10 border-[var(--brand-primary)]/20">
            <CardContent className="p-8">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-primary-dark)] rounded-full mb-4">
                  <MessageCircle className="h-8 w-8 text-white" />
          </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Still have questions?
              </h3>
                <p className="text-gray-600">
                  We're here to help! Get in touch with our support team.
                </p>
            </div>
              
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="outline" size="lg" className="px-8">
                  <Link href="/contact">
                    <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Support
                </Link>
              </Button>
                <Button asChild size="lg" className="px-8 bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-primary-dark)] hover:from-[var(--brand-primary-dark)] hover:to-[var(--brand-primary)] text-white">
                <Link href="/docs">
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Documentation
                </Link>
              </Button>
            </div>
            </CardContent>
          </Card>
          </div>
      </div>
    </section>
  )
}