"use client"

import { 
  Building2, 
  Home, 
  Rocket, 
  User, 
  Target,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Users
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function PersonaShowcase() {
  const personas = [
    {
      id: "digital-agencies",
      icon: <Building2 className="h-8 w-8" />,
      title: "Digital Agencies",
      headline: "The Agency Growth Engine—Financial Clarity & Project Profitability in One Place",
      subhead: "Manage client budgets, automate invoicing, track campaigns, and forecast agency profits—without spreadsheets or chaos.",
      features: [
        "Real-time profit dashboards by client, project, or team",
        "Automated invoice creation, reminders, and payment tracking",
        "Track campaign expenses, ad spend, and billable hours",
        "Custom workflows for retainers, milestones, and split billing",
        "Team collaboration with role-based access",
        "Easy import from QuickBooks or CSV"
      ],
      cta: "See your agency's P&L in minutes—Try Financbase Free",
      color: "from-primary to-primary/80",
      bgColor: "from-primary/5 to-primary/10"
    },
    {
      id: "real-estate",
      icon: <Home className="h-8 w-8" />,
      title: "Real Estate Teams",
      headline: "Powerful Portfolio Management for Real Estate Pros",
      subhead: "Track rental income, analyze investment ROI, and automate owner statements—all under one secure roof.",
      features: [
        "Property-by-property cash flow and ROI tracking",
        "AI-powered document management and search",
        "Automated expense splits and owner reports",
        "Visual dashboards for vacancy and occupancy trends",
        "Multi-user roles for agents, owners, and accountants",
        "Fast onboarding with CSV import"
      ],
      cta: "Unlock instant ROI and rental analytics—Demo Financbase Now",
      color: "from-primary to-primary/80",
      bgColor: "from-primary/5 to-primary/10"
    },
    {
      id: "tech-startups",
      icon: <Rocket className="h-8 w-8" />,
      title: "Tech Startups & SaaS",
      headline: "Runway, Revenue, and Real-Time Insights—Built for Startups",
      subhead: "From invoice to investor update, automate your finances so you can focus on shipping product and scaling growth.",
      features: [
        "Automatic burn rate, runway, and expense tracking",
        "AI-generated monthly reports and forecasting",
        "Supports contract, subscription, and usage-billing",
        "Investor dashboard with restricted viewer access",
        "Simple CSV imports from Stripe, QuickBooks, Xero",
        "Enterprise-grade security for sensitive data"
      ],
      cta: "Know your numbers—Start with Financbase in under 15 minutes",
      color: "from-primary to-primary/80",
      bgColor: "from-primary/5 to-primary/10"
    },
    {
      id: "freelancers",
      icon: <User className="h-8 w-8" />,
      title: "Freelancers & Solopreneurs",
      headline: "Get Paid, Track Expenses, and Stay on Top—Stress-Free Finances for Freelancers",
      subhead: "Invoicing, business reports, and tax tracking—all in your pocket.",
      features: [
        "Create beautiful invoices and automated reminders",
        "One-click expense logging with receipt attachment",
        "Instant income, expense, and estimated tax reports",
        "Built-in collaboration for agency expansion",
        "No setup headaches—import statements or start fresh",
        "Mobile-first design for on-the-go management"
      ],
      cta: "Take Control of Your Freelance Finances Today",
      color: "from-primary to-primary/80",
      bgColor: "from-primary/5 to-primary/10"
    },
    {
      id: "marketing-teams",
      icon: <Target className="h-8 w-8" />,
      title: "Marketing Teams & Agencies",
      headline: "Maximize Campaign ROI—Financial Intelligence for Marketers",
      subhead: "Connect ad spend, client budgets, and campaign performance to your bottom line.",
      features: [
        "View campaign spend vs. outcome in real-time",
        "Smart spend categorization by platform and region",
        "Real-time alerts for budget overruns or low-ROI",
        "Customizable analytics dashboards for execs",
        "Flexible import from Excel or Google Sheets",
        "API integrations for seamless data flow"
      ],
      cta: "Reveal Your Real Marketing ROI—Try Financbase Free",
      color: "from-primary to-primary/80",
      bgColor: "from-primary/5 to-primary/10"
    }
  ]

  return (
    <section className="py-24 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <Badge variant="outline" className="mb-4 px-4 py-2">
            <Users className="h-4 w-4 mr-2" />
            Built for Your Industry
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Solutions for Every
            <span className="block text-primary">
              Business Type
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tailored financial management solutions designed for your specific industry needs and workflows
          </p>
        </div>

        {/* Persona Cards */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {personas.map((persona) => (
            <Card 
              key={persona.id} 
              className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm hover:scale-105"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center mb-4">
                  <div className={`p-3 bg-gradient-to-br ${persona.color} rounded-xl text-white mr-4 group-hover:scale-110 transition-transform duration-300`}>
                    {persona.icon}
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">{persona.title}</CardTitle>
                    <Badge variant="outline" className="mt-2">
                      Industry Solution
                    </Badge>
                  </div>
                </div>
                <CardDescription className="text-lg font-semibold text-gray-800 mb-2">
                  {persona.headline}
                </CardDescription>
                <p className="text-gray-600 leading-relaxed">
                  {persona.subhead}
                </p>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {persona.features.map((feature, index) => (
                    <div key={`${persona.id}-feature-${index}`} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className={`p-4 rounded-lg bg-gradient-to-r ${persona.bgColor} border`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TrendingUp className="h-5 w-5 text-gray-600 mr-2" />
                      <span className="font-medium text-gray-800">{persona.cta}</span>
                    </div>
                    <Button asChild size="sm" className={`bg-gradient-to-r ${persona.color} hover:opacity-90`}>
                      <Link href="/auth/sign-up">
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Industry Stats */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Trusted Across Industries
              </h3>
              <p className="text-gray-600">
                Join thousands of businesses that have transformed their financial operations
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              {[
                { id: "agencies", icon: <Building2 className="h-6 w-6" />, label: "500+ Agencies", color: "text-primary" },
                { id: "real-estate", icon: <Home className="h-6 w-6" />, label: "300+ RE Teams", color: "text-primary" },
                { id: "startups", icon: <Rocket className="h-6 w-6" />, label: "1,200+ Startups", color: "text-primary" },
                { id: "freelancers", icon: <User className="h-6 w-6" />, label: "2,500+ Freelancers", color: "text-primary" },
                { id: "marketers", icon: <Target className="h-6 w-6" />, label: "800+ Marketers", color: "text-primary" }
              ].map((stat) => (
                <div key={stat.id} className="text-center group">
                  <div className={`${stat.color} mb-2 group-hover:scale-110 transition-transform duration-300`}>
                    {stat.icon}
                  </div>
                  <div className="font-semibold text-gray-900">{stat.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
