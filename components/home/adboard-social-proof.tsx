/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Quote, Target, Award, TrendingUp } from "lucide-react"
import Image from "next/image"
import { useQuery } from "@tanstack/react-query"

interface Testimonial {
  id: string
  name: string
  role: string
  company: string
  avatar?: string
  content: string
  rating: number
  metric: string
  createdAt: string
}

export default function AdboardSocialProof() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  // Fetch testimonials from API
  const { data: testimonialsData } = useQuery<{ success: boolean; data: Testimonial[] }>({
    queryKey: ['adboard-testimonials'],
    queryFn: async () => {
      const response = await fetch('/api/home/testimonials?limit=3')
      if (!response.ok) throw new Error('Failed to fetch testimonials')
      return response.json()
    },
    refetchInterval: 600000,
    staleTime: 300000,
  })

  // Use real testimonials or fallback to Adboard-specific defaults
  const testimonials: Testimonial[] = testimonialsData?.data || [
    {
      id: "sarah-marketing",
      name: "Sarah Martinez",
      role: "Marketing Director",
      company: "GrowthLabs",
      avatar: "/avatars/sarah-martinez.jpg",
      content: "Adboard has transformed how we manage our advertising campaigns. We've increased our ROAS by 3.2x and cut campaign setup time by 75%. The unified dashboard is a game-changer.",
      rating: 5,
      metric: "3.2x ROAS improvement",
      createdAt: new Date().toISOString()
    },
    {
      id: "michael-ads",
      name: "Michael Chen",
      role: "Head of Paid Media",
      company: "DigitalFirst Agency",
      avatar: "/avatars/michael-chen.jpg",
      content: "Managing campaigns across Google, Facebook, and LinkedIn used to take hours. With Adboard, we do it in minutes. The real-time analytics help us optimize on the fly.",
      rating: 5,
      metric: "75% time saved",
      createdAt: new Date().toISOString()
    },
    {
      id: "emily-campaigns",
      name: "Emily Rodriguez",
      role: "VP Marketing",
      company: "TechScale",
      avatar: "/avatars/emily-rodriguez.jpg",
      content: "The budget optimization features are incredible. We've reduced ad spend by 40% while maintaining the same conversion rates. Adboard pays for itself.",
      rating: 5,
      metric: "40% cost reduction",
      createdAt: new Date().toISOString()
    }
  ]

  useEffect(() => {
    setIsVisible(true)
    if (testimonials.length > 0) {
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [testimonials.length])

  const companies = [
    { id: "google", name: "Google Ads", logo: "/logos/google.svg", tier: "enterprise" },
    { id: "meta", name: "Meta", logo: "/logos/meta.svg", tier: "enterprise" },
    { id: "linkedin", name: "LinkedIn", logo: "/logos/linkedin.svg", tier: "enterprise" },
    { id: "tiktok", name: "TikTok", logo: "/logos/tiktok.svg", tier: "growth" },
    { id: "twitter", name: "Twitter", logo: "/logos/twitter.svg", tier: "growth" },
    { id: "amazon", name: "Amazon Ads", logo: "/logos/amazon.svg", tier: "growth" }
  ]

  const stats = [
    { id: "campaigns", number: "10K+", label: "Campaigns Managed", icon: <Target className="h-5 w-5" /> },
    { id: "roas", number: "3.2x", label: "Average ROAS", icon: <TrendingUp className="h-5 w-5" /> },
    { id: "savings", number: "40%", label: "Cost Reduction", icon: <Award className="h-5 w-5" /> },
    { id: "uptime", number: "99.9%", label: "Uptime", icon: <Award className="h-5 w-5" /> }
  ]

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Badge variant="outline" className="mb-6 px-4 py-2 text-sm font-medium">
            <Award className="h-4 w-4 mr-2" />
            Trusted by Marketing Teams
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            See how marketing teams
            <span className="block text-primary">are optimizing their campaigns</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            From agencies to in-house teams, see how Adboard is revolutionizing advertising campaign management
          </p>
        </div>

        {/* Platform Logos */}
        <div className={`mb-20 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-center text-sm font-medium text-slate-500 mb-8">Integrated with leading ad platforms</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
            {companies.map((company) => (
              <div 
                key={company.id} 
                className="group flex items-center justify-center hover:opacity-100 transition-opacity duration-300 min-w-[80px]"
              >
                <Image
                  src={company.logo}
                  alt={company.name}
                  width={120}
                  height={40}
                  className="h-8 w-auto max-w-[120px] grayscale group-hover:grayscale-0 transition-all duration-500 object-contain"
                  unoptimized={company.logo.endsWith('.svg')}
                  onError={(e) => {
                    console.error(`Failed to load logo for ${company.name}:`, company.logo)
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className={`grid md:grid-cols-3 gap-8 mb-20 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {testimonials.map((testimonial, index) => (
            <Card 
              key={testimonial.id}
              className={`group hover:shadow-xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm hover:scale-105 ${
                currentTestimonial === index ? 'ring-2 ring-primary/20 shadow-lg' : ''
              }`}
            >
              <CardContent className="p-8">
                {/* Quote Icon */}
                <div className="mb-6">
                  <Quote className="h-8 w-8 text-primary/20" />
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                {Array.from({ length: testimonial.rating }, (_, i) => (
                  <Star key={`${testimonial.id}-star-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
                </div>

                {/* Highlight Badge */}
                <Badge variant="outline" className="mb-4 text-emerald-600 border-emerald-200 bg-emerald-50">
                  {testimonial.metric}
                </Badge>

                {/* Content */}
                <blockquote className="text-slate-700 mb-6 leading-relaxed text-lg">
                  "{testimonial.content}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4 ring-2 ring-primary/10">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-semibold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-slate-900">{testimonial.name}</div>
                    <div className="text-sm text-slate-600">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Grid */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {stats.map((stat) => (
            <div key={stat.id} className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                <div className="text-primary">{stat.icon}</div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-2 group-hover:scale-110 transition-transform duration-300">
                {stat.number}
              </div>
              <div className="text-slate-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

