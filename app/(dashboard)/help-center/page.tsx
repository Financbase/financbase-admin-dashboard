import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  BookOpen, 
  MessageSquare, 
  Phone, 
  Mail,
  FileText,
  Star,
  TrendingUp,
  Clock,
  Users,
  ExternalLink,
  HelpCircle,
  ChevronRight,
  ArrowRight,
  Settings
} from "lucide-react";

export const metadata: Metadata = {
  title: "Help Center - Support & Documentation",
  description: "Get help, find answers, and access support resources",
};

export default function HelpCenterPage() {
  const helpCategories = [
    {
      id: 1,
      title: "Getting Started",
      description: "New to Financbase? Start here",
      icon: BookOpen,
      color: "bg-blue-500",
      articles: 12,
      href: "#"
    },
    {
      id: 2,
      title: "Account & Billing",
      description: "Manage your subscription and payment",
      icon: Users,
      color: "bg-green-500",
      articles: 8,
      href: "#"
    },
    {
      id: 3,
      title: "API & Integration",
      description: "Connect with third-party tools",
      icon: ExternalLink,
      color: "bg-purple-500",
      articles: 15,
      href: "#"
    },
    {
      id: 4,
      title: "Troubleshooting",
      description: "Common issues and solutions",
      icon: Settings,
      color: "bg-orange-500",
      articles: 20,
      href: "#"
    }
  ];

  const popularArticles = [
    {
      id: 1,
      title: "How to create your first invoice",
      description: "Step-by-step guide to creating invoices",
      category: "Getting Started",
      views: 1250,
      rating: 4.8,
      lastUpdated: "2024-10-15",
      href: "#"
    },
    {
      id: 2,
      title: "Setting up payment methods",
      description: "Configure Stripe and other payment processors",
      category: "Account & Billing",
      views: 980,
      rating: 4.6,
      lastUpdated: "2024-10-14",
      href: "#"
    },
    {
      id: 3,
      title: "API authentication guide",
      description: "Learn how to authenticate with our API",
      category: "API & Integration",
      views: 750,
      rating: 4.9,
      lastUpdated: "2024-10-13",
      href: "#"
    },
    {
      id: 4,
      title: "Troubleshooting login issues",
      description: "Common login problems and solutions",
      category: "Troubleshooting",
      views: 650,
      rating: 4.4,
      lastUpdated: "2024-10-12",
      href: "#"
    }
  ];

  const supportStats = {
    totalArticles: 156,
    totalViews: 45600,
    averageRating: 4.7,
    responseTime: "2 hours"
  };

  const quickActions = [
    {
      title: "Submit Ticket",
      description: "Get personalized help",
      icon: MessageSquare,
      color: "bg-blue-500",
      href: "#"
    },
    {
      title: "Live Chat",
      description: "Chat with support team",
      icon: MessageSquare,
      color: "bg-green-500",
      href: "#"
    },
    {
      title: "Schedule Call",
      description: "Book a support call",
      icon: Phone,
      color: "bg-purple-500",
      href: "#"
    },
    {
      title: "Email Support",
      description: "Send us an email",
      icon: Mail,
      color: "bg-orange-500",
      href: "#"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6 py-12">
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <HelpCircle className="mr-2 h-4 w-4" />
              Help Center
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              How can we{" "}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                help you?
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Find answers, get help, and access support resources to make the most of Financbase.
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="mx-auto max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search help articles, guides, and FAQs..."
                className="h-12 pl-12 pr-4 text-lg"
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>Popular searches:</span>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">invoice creation</Button>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">payment setup</Button>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">API integration</Button>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">billing questions</Button>
            </div>
          </div>
        </div>

        {/* Support Stats */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Articles</CardTitle>
              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{supportStats.totalArticles}</div>
              <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12 this month
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Total Views</CardTitle>
              <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">{supportStats.totalViews.toLocaleString()}</div>
              <p className="text-xs text-green-600 dark:text-green-400">This month</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{supportStats.averageRating}</div>
              <p className="text-xs text-purple-600 dark:text-purple-400">Out of 5 stars</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Response Time</CardTitle>
              <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{supportStats.responseTime}</div>
              <p className="text-xs text-orange-600 dark:text-orange-400">Average</p>
            </CardContent>
          </Card>
        </div>

        {/* Help Categories */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Browse by Category</h2>
            <p className="text-muted-foreground">Find help organized by topic</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {helpCategories.map((category) => (
              <Card key={category.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-background to-muted/20 hover:from-muted/30 hover:to-muted/40">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${category.color} text-white group-hover:scale-110 transition-transform duration-300`}>
                      <category.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">{category.title}</CardTitle>
                      <CardDescription className="text-sm">{category.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{category.articles} articles</span>
                    <Button variant="ghost" size="sm" className="group-hover:bg-primary/10 group-hover:text-primary">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Get Support</h2>
            <p className="text-muted-foreground">Choose how you'd like to get help</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Card key={action.title} className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-background to-muted/20 hover:from-muted/30 hover:to-muted/40">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${action.color} text-white group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">{action.title}</CardTitle>
                      <CardDescription className="text-sm">{action.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button className="w-full group-hover:bg-primary/90 transition-colors">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Popular Articles */}
        <Card className="border-0 bg-gradient-to-br from-background to-muted/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">Popular Articles</CardTitle>
                <CardDescription className="text-base">
                  Most viewed and highest-rated help articles
                </CardDescription>
              </div>
              <Button variant="outline" className="hidden sm:flex">
                View All Articles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularArticles.map((article) => (
                <div key={article.id} className="group flex items-center justify-between p-6 rounded-xl border bg-gradient-to-r from-background to-muted/10 hover:from-muted/20 hover:to-muted/30 transition-all duration-300 cursor-pointer">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{article.title}</h3>
                      <Badge variant="outline" className="text-xs">{article.category}</Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">{article.description}</p>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {article.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {article.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Updated {article.lastUpdated}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Read
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-center sm:hidden">
              <Button variant="outline" className="w-full">
                View All Articles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Still Need Help?</h2>
            <p className="text-muted-foreground">Our support team is here to assist you</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="text-center border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/20">
              <CardHeader>
                <div className="mx-auto w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Live Chat</CardTitle>
                <CardDescription>Chat with our support team in real-time</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start Chat
                </Button>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  Available 9 AM - 6 PM EST
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/20">
              <CardHeader>
                <div className="mx-auto w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Email Support</CardTitle>
                <CardDescription>Send us an email and we'll respond within 2 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  support@financbase.com
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/20">
              <CardHeader>
                <div className="mx-auto w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center mb-4">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Phone Support</CardTitle>
                <CardDescription>Call us for urgent issues and complex problems</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </Button>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                  +1 (555) 123-4567
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}