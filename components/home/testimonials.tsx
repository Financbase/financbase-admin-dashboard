/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client"

import { Star, Quote } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

export default function Testimonials() {
  const testimonials = [
    {
      id: "sarah-johnson",
      name: "Sarah Johnson",
      role: "CFO",
      company: "TechStart Inc.",
      image: "/avatars/sarah-johnson.jpg",
      content: "Financbase has revolutionized our financial operations. The AI insights have helped us reduce costs by 30% and improve cash flow forecasting accuracy.",
      rating: 5,
      highlight: "30% cost reduction"
    },
    {
      id: "michael-chen",
      name: "Michael Chen",
      role: "Finance Director",
      company: "GrowthCorp",
      image: "/avatars/michael-chen.jpg",
      content: "The automation features have saved us 15 hours per week. The real-time analytics give us insights we never had before.",
      rating: 5,
      highlight: "15 hours saved weekly"
    },
    {
      id: "emily-rodriguez",
      name: "Emily Rodriguez",
      role: "CEO",
      company: "InnovateLabs",
      image: "/avatars/emily-rodriguez.jpg",
      content: "Finally, a financial platform that grows with our business. The scalability and integration capabilities are unmatched.",
      rating: 5,
      highlight: "Seamless scaling"
    }
  ]

  const companies = [
    { id: "microsoft", name: "Microsoft", logo: "/logos/microsoft.svg" },
    { id: "google", name: "Google", logo: "/logos/google.svg" },
    { id: "amazon", name: "Amazon", logo: "/logos/amazon.svg" },
    { id: "salesforce", name: "Salesforce", logo: "/logos/salesforce.svg" },
    { id: "shopify", name: "Shopify", logo: "/logos/shopify.svg" },
    { id: "stripe", name: "Stripe", logo: "/logos/stripe-official.svg" }
  ]

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-[var(--brand-primary)]/5 to-[var(--brand-primary)]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <Badge variant="secondary" className="mb-4 px-4 py-2">
            <Star className="h-4 w-4 mr-2 fill-yellow-400 text-yellow-400" />
            4.9/5 Customer Rating
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Trusted by Finance Teams
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-primary-light)]">
              Worldwide
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of businesses that have transformed their financial operations with Financbase
          </p>
        </div>

        {/* Company Logos */}
        <div className="mb-20">
          <p className="text-center text-sm font-medium text-gray-500 mb-8">Trusted by leading companies</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-70">
            {companies.map((company) => (
              <div key={company.id} className="flex items-center group">
                <Image
                  src={company.logo}
                  alt={company.name}
                  width={32}
                  height={32}
                  className="h-8 w-auto grayscale group-hover:grayscale-0 transition-all duration-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="group hover:shadow-xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                {/* Quote Icon */}
                <div className="mb-6">
                  <Quote className="h-8 w-8 text-blue-100" />
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                {Array.from({ length: testimonial.rating }, (_, i) => (
                  <Star key={`${testimonial.id}-star-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
                </div>

                {/* Highlight Badge */}
                <Badge variant="outline" className="mb-4 text-green-600 border-green-200 bg-green-50">
                  {testimonial.highlight}
                </Badge>

                {/* Content */}
                <blockquote className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4 ring-2 ring-blue-100">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback className="bg-gradient-to-br from-[hsl(231.6_54%_42%)] to-[hsl(231.6_54%_30%)] text-white font-semibold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { id: "active-users", number: "10,000+", label: "Active Users", color: "text-blue-600" },
            { id: "processed", number: "$2B+", label: "Processed Annually", color: "text-green-600" },
            { id: "uptime", number: "99.9%", label: "Uptime", color: "text-purple-600" },
            { id: "rating", number: "4.9/5", label: "Customer Rating", color: "text-orange-600" }
          ].map((stat) => (
            <div key={stat.id} className="text-center group">
              <div className={`text-4xl font-bold ${stat.color} mb-2 group-hover:scale-110 transition-transform duration-300`}>
                {stat.number}
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}