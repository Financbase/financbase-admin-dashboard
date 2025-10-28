"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Quote, Users, Award, Shield } from "lucide-react"
import Image from "next/image"

export default function PremiumSocialProof() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const testimonials = [
    {
      id: "sarah-johnson",
      name: "Sarah Johnson",
      role: "CFO",
      company: "TechFlow",
      avatar: "/avatars/sarah-johnson.jpg",
      content: "Financbase has transformed our financial operations. We've significantly reduced manual work and improved accuracy. The AI insights are game-changing.",
      rating: 5,
      metric: "Significant time saved"
    },
    {
      id: "michael-chen",
      name: "Michael Chen",
      role: "Finance Director",
      company: "GrowthCorp",
      avatar: "/avatars/michael-chen.jpg",
      content: "The automation features are impressive. We process more transactions efficiently with the same team. ROI was positive within the first month.",
      rating: 5,
      metric: "Improved efficiency"
    },
    {
      id: "emily-rodriguez",
      name: "Emily Rodriguez",
      role: "CEO",
      company: "InnovateLabs",
      avatar: "/avatars/emily-rodriguez.jpg",
      content: "Finally, a platform that scales with our business. The real-time analytics help us make data-driven decisions every day.",
      rating: 5,
      metric: "Real-time insights"
    }
  ]

  const companies = [
    { id: "microsoft", name: "Microsoft", logo: "/logos/microsoft.svg", tier: "enterprise" },
    { id: "google", name: "Google", logo: "/logos/google.svg", tier: "enterprise" },
    { id: "stripe", name: "Stripe", logo: "/logos/stripe.svg", tier: "enterprise" },
    { id: "shopify", name: "Shopify", logo: "/logos/shopify.svg", tier: "enterprise" },
    { id: "notion", name: "Notion", logo: "/logos/notion.svg", tier: "growth" },
    { id: "linear", name: "Linear", logo: "/logos/linear.svg", tier: "growth" }
  ]

  const stats = [
    { id: "users", number: "Growing", label: "Business Community", icon: <Users className="h-5 w-5" /> },
    { id: "rating", number: "Highly", label: "Rated Platform", icon: <Star className="h-5 w-5" /> },
    { id: "uptime", number: "Built for", label: "Reliability", icon: <Shield className="h-5 w-5" /> }
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
            Trusted by Industry Leaders
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            See how businesses
            <span className="block text-primary">are transforming their finances</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            From startups to growing companies, see how Financbase is revolutionizing financial operations
          </p>
        </div>

        {/* Company Logos */}
        <div className={`mb-20 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-center text-sm font-medium text-slate-500 mb-8">Representative clients and industry examples</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
            {companies.map((company) => (
              <div 
                key={company.id} 
                className="group flex items-center hover:opacity-100 transition-opacity duration-300"
              >
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
