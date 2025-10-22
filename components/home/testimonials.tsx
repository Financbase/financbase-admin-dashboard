"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Quote } from "lucide-react"

export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "CFO",
      company: "TechFlow Solutions",
      image: "/avatars/sarah.jpg",
      content: "Financbase transformed how we manage our finances. The AI insights helped us identify $200K in potential savings within the first month. It's like having a financial expert available 24/7.",
      rating: 5,
      metrics: "200K saved"
    },
    {
      name: "Michael Rodriguez",
      role: "CEO",
      company: "GrowthCorp",
      image: "/avatars/michael.jpg",
      content: "The automation features saved us 20 hours per week on financial reporting. The predictive analytics helped us secure funding by showing investors exactly where we're heading.",
      rating: 5,
      metrics: "20hrs/week saved"
    },
    {
      name: "Emily Johnson",
      role: "Finance Director",
      company: "ScaleUp Inc",
      image: "/avatars/emily.jpg",
      content: "Implementation was seamless and the ROI was immediate. We've reduced financial errors by 95% and improved our cash flow forecasting accuracy significantly.",
      rating: 5,
      metrics: "95% fewer errors"
    },
    {
      name: "David Kim",
      role: "VP Operations",
      company: "InnovateLabs",
      image: "/avatars/david.jpg",
      content: "The real-time insights and automated workflows have been game-changing. We now make data-driven decisions instead of relying on gut feelings.",
      rating: 5,
      metrics: "Data-driven decisions"
    },
    {
      name: "Lisa Thompson",
      role: "Founder",
      company: "StartupXYZ",
      image: "/avatars/lisa.jpg",
      content: "As a startup, we needed financial visibility without complexity. Financbase delivered exactly that - powerful insights in an intuitive interface.",
      rating: 5,
      metrics: "Startup ready"
    },
    {
      name: "James Wilson",
      role: "CFO",
      company: "Enterprise Corp",
      image: "/avatars/james.jpg",
      content: "The enterprise security and compliance features gave us peace of mind. Combined with the AI capabilities, it's the complete financial intelligence platform.",
      rating: 5,
      metrics: "Enterprise secure"
    }
  ]

  const companies = [
    { name: "TechFlow Solutions", logo: "/companies/techflow.png" },
    { name: "GrowthCorp", logo: "/companies/growthcorp.png" },
    { name: "ScaleUp Inc", logo: "/companies/scaleup.png" },
    { name: "InnovateLabs", logo: "/companies/innovatelabs.png" },
    { name: "StartupXYZ", logo: "/companies/startupxyz.png" },
    { name: "Enterprise Corp", logo: "/companies/enterprise.png" }
  ]

  return (
    <div className="py-24 bg-white">
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
            Testimonials
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Trusted by
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}10,000+ Businesses
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            See what our customers are saying about their experience with Financbase.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={`testimonial-${testimonial.name.toLowerCase().replace(/\s+/g, '-')}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, starIndex) => (
                      <Star key={`star-${testimonial.name}-${starIndex}`} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  <div className="flex items-start gap-3 mb-4">
                    <Quote className="h-8 w-8 text-blue-200 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 italic">
                      "{testimonial.content}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={testimonial.image} alt={testimonial.name} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {testimonial.role} at {testimonial.company}
                        </div>
                      </div>
                    </div>

                    <Badge variant="secondary" className="text-xs">
                      {testimonial.metrics}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Company Logos */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <p className="text-muted-foreground mb-8">
            Trusted by leading companies worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {companies.map((company) => (
              <motion.div
                key={`company-${company.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex items-center gap-2 text-gray-400"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <span className="text-sm font-medium">{company.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
