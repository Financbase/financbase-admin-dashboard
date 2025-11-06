/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client"

import { HelpCircle, MessageCircle, BookOpen } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function AdboardFAQ() {
  const faqs = [
    {
      id: "platform-integration",
      question: "Which advertising platforms does Adboard support?",
      answer: "Adboard integrates with all major advertising platforms including Google Ads (Search, Display, Shopping, YouTube), Meta (Facebook, Instagram), LinkedIn Ads, Twitter Ads, TikTok Ads, and Amazon Ads. We're constantly adding new platform integrations based on user demand."
    },
    {
      id: "roas-tracking",
      question: "How does Adboard track ROAS across multiple platforms?",
      answer: "Adboard uses advanced attribution modeling to track Return on Ad Spend across all connected platforms. We aggregate spend and revenue data, apply cross-channel attribution rules, and provide real-time ROAS calculations in your unified dashboard."
    },
    {
      id: "budget-optimization",
      question: "How does the budget optimization feature work?",
      answer: "Our AI-powered budget optimization analyzes campaign performance across all platforms and automatically reallocates budget to high-performing campaigns. You can set rules, thresholds, and optimization goals, and Adboard will continuously optimize your ad spend for maximum ROI."
    },
    {
      id: "free-trial",
      question: "What's included in the free trial?",
      answer: "The 14-day free trial includes full access to all Adboard features: multi-platform campaign management, real-time analytics, ROAS tracking, budget optimization, audience insights, and automated reporting. No credit card required."
    },
    {
      id: "data-security",
      question: "Is my advertising data secure with Adboard?",
      answer: "Absolutely. We use industry-standard security with 256-bit SSL encryption. Your data is encrypted both in transit and at rest, with multi-factor authentication and role-based access controls. We're SOC 2 compliant and follow GDPR guidelines."
    },
    {
      id: "team-collaboration",
      question: "Can multiple team members collaborate on campaigns?",
      answer: "Yes! Adboard supports team collaboration with role-based access control. You can assign different permissions to team members, share campaigns, set up approval workflows, and collaborate in real-time on campaign optimization."
    },
    {
      id: "reporting",
      question: "What kind of reports can I generate?",
      answer: "Adboard provides comprehensive reporting including campaign performance reports, ROAS analysis, budget utilization reports, audience insights, and custom reports. You can schedule automated reports to be delivered via email, and export data to CSV or PDF."
    },
    {
      id: "getting-started",
      question: "How quickly can I get started with Adboard?",
      answer: "You can be up and running in minutes! Simply sign up, connect your advertising platform accounts (we support OAuth for secure connections), and Adboard will automatically sync your existing campaigns and start tracking performance."
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
            Everything you need to know about Adboard
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

