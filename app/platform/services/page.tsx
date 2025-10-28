import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Megaphone, 
  UserCog, 
  Puzzle, 
  Bot, 
  Building2, 
  Home, 
  Plug,
  TrendingUp,
  Shield,
  Monitor,
  Zap,
  Users,
  DollarSign,
  Target,
  BarChart3,
  Clock,
  FileText,
  Webhook,
  AlertTriangle,
  Code,
  Globe,
  Package
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Service Discovery - Financbase Platform",
  description: "Discover all available services and capabilities in the Financbase platform",
};

const serviceCategories = [
  {
    id: "financial",
    name: "Financial Services",
    description: "Core financial management and intelligence services",
    icon: DollarSign,
    color: "bg-green-500",
    services: [
      {
        name: "Billing Efficiency Service",
        description: "Optimize billing processes and reduce inefficiencies",
        status: "active",
        endpoint: "/api/financial/billing-efficiency",
        product: "Financial Intelligence"
      },
      {
        name: "Expense Management Service",
        description: "Track, categorize, and analyze business expenses",
        status: "active",
        endpoint: "/api/financial/expenses",
        product: "Expense Management"
      },
      {
        name: "Financial Health Service",
        description: "Monitor business financial health and provide insights",
        status: "active",
        endpoint: "/api/financial/health",
        product: "Financial Intelligence"
      },
      {
        name: "Invoice Service",
        description: "Create, manage, and track invoices",
        status: "active",
        endpoint: "/api/financial/invoices",
        product: "Invoice Management"
      },
      {
        name: "Payment Tracking Service",
        description: "Track payments and reconcile transactions",
        status: "active",
        endpoint: "/api/financial/payments",
        product: "Transactions"
      }
    ]
  },
  {
    id: "marketing",
    name: "Marketing Services",
    description: "Marketing automation, campaigns, and lead management",
    icon: Megaphone,
    color: "bg-blue-500",
    services: [
      {
        name: "Adboard Service",
        description: "Campaign management and advertising analytics",
        status: "active",
        endpoint: "/api/marketing/adboard",
        product: "Marketing Hub"
      },
      {
        name: "AI Ad Optimization",
        description: "AI-powered advertising optimization",
        status: "active",
        endpoint: "/api/marketing/ai-optimization",
        product: "Marketing Hub"
      },
      {
        name: "Campaign Service",
        description: "Create and manage marketing campaigns",
        status: "active",
        endpoint: "/api/marketing/campaigns",
        product: "Marketing Hub"
      },
      {
        name: "Lead Scoring Service",
        description: "Score and qualify leads automatically",
        status: "active",
        endpoint: "/api/marketing/lead-scoring",
        product: "Marketing Hub"
      },
      {
        name: "Proposal Service",
        description: "Generate and manage business proposals",
        status: "active",
        endpoint: "/api/marketing/proposals",
        product: "Marketing Hub"
      }
    ]
  },
  {
    id: "hr",
    name: "HR Services",
    description: "Human resources management and employee services",
    icon: UserCog,
    color: "bg-purple-500",
    services: [
      {
        name: "Employee Service",
        description: "Manage employee records and information",
        status: "active",
        endpoint: "/api/hr/employees",
        product: "HR Management"
      },
      {
        name: "Contractor Service",
        description: "Manage contractor relationships and payments",
        status: "active",
        endpoint: "/api/hr/contractors",
        product: "HR Management"
      },
      {
        name: "Time Tracking Service",
        description: "Track employee and contractor time",
        status: "active",
        endpoint: "/api/hr/time-tracking",
        product: "HR Management"
      },
      {
        name: "Payroll Service",
        description: "Process payroll and manage compensation",
        status: "active",
        endpoint: "/api/hr/payroll",
        product: "HR Management"
      }
    ]
  },
  {
    id: "ai",
    name: "AI Services",
    description: "Artificial intelligence and machine learning services",
    icon: Brain,
    color: "bg-orange-500",
    services: [
      {
        name: "AI Assistant Service",
        description: "General-purpose AI assistant capabilities",
        status: "active",
        endpoint: "/api/ai/assistant",
        product: "AI Assistant"
      },
      {
        name: "Financial AI Service",
        description: "Financial-specific AI insights and predictions",
        status: "active",
        endpoint: "/api/ai/financial",
        product: "Financial Intelligence"
      },
      {
        name: "Unified AI Orchestrator",
        description: "Multi-provider AI management and routing",
        status: "active",
        endpoint: "/api/ai/orchestrator",
        product: "All AI Products"
      },
      {
        name: "Cash Flow Predictor",
        description: "Predict future cash flow patterns",
        status: "active",
        endpoint: "/api/ai/cash-flow",
        product: "Financial Intelligence"
      },
      {
        name: "Revenue Predictor",
        description: "Forecast revenue trends and patterns",
        status: "active",
        endpoint: "/api/ai/revenue",
        product: "Financial Intelligence"
      }
    ]
  },
  {
    id: "platform",
    name: "Platform Services",
    description: "Core platform infrastructure and automation services",
    icon: Puzzle,
    color: "bg-indigo-500",
    services: [
      {
        name: "Workflow Engine",
        description: "Automate business processes with visual workflows",
        status: "active",
        endpoint: "/api/platform/workflows",
        product: "Workflows"
      },
      {
        name: "Webhook Service",
        description: "Manage webhook endpoints and event delivery",
        status: "active",
        endpoint: "/api/platform/webhooks",
        product: "Webhooks"
      },
      {
        name: "Monitoring Service",
        description: "Monitor system health and performance",
        status: "active",
        endpoint: "/api/platform/monitoring",
        product: "System Monitoring"
      },
      {
        name: "Platform Integration Service",
        description: "Integrate with external platforms and services",
        status: "active",
        endpoint: "/api/platform/integrations",
        product: "Platform Hub"
      }
    ]
  },
  {
    id: "business",
    name: "Business Services",
    description: "Business-specific services for different industries",
    icon: Building2,
    color: "bg-teal-500",
    services: [
      {
        name: "Agency Client Service",
        description: "Manage agency-client relationships",
        status: "active",
        endpoint: "/api/business/agency-clients",
        product: "Agency Intelligence"
      },
      {
        name: "Freelance Project Service",
        description: "Manage freelance projects and deliverables",
        status: "active",
        endpoint: "/api/business/freelance-projects",
        product: "Freelance Hub"
      },
      {
        name: "Project Profitability Service",
        description: "Track project profitability and ROI",
        status: "active",
        endpoint: "/api/business/project-profitability",
        product: "Project Management"
      },
      {
        name: "Proposal Service",
        description: "Create and manage business proposals",
        status: "active",
        endpoint: "/api/business/proposals",
        product: "Lead Management"
      }
    ]
  },
  {
    id: "property",
    name: "Property Services",
    description: "Real estate and property management services",
    icon: Home,
    color: "bg-amber-500",
    services: [
      {
        name: "Property Management Service",
        description: "Manage real estate properties and portfolios",
        status: "active",
        endpoint: "/api/property/management",
        product: "Real Estate"
      },
      {
        name: "ROI Tracking Service",
        description: "Track property ROI and performance metrics",
        status: "active",
        endpoint: "/api/property/roi-tracking",
        product: "Real Estate"
      },
      {
        name: "Rental Income Service",
        description: "Manage rental income and tenant relationships",
        status: "active",
        endpoint: "/api/property/rental-income",
        product: "Real Estate"
      }
    ]
  },
  {
    id: "integrations",
    name: "Integration Services",
    description: "Third-party integrations and API connections",
    icon: Plug,
    color: "bg-pink-500",
    services: [
      {
        name: "Stripe Integration",
        description: "Payment processing with Stripe",
        status: "active",
        endpoint: "/api/integrations/stripe",
        product: "Integrations"
      },
      {
        name: "QuickBooks Integration",
        description: "Accounting integration with QuickBooks",
        status: "active",
        endpoint: "/api/integrations/quickbooks",
        product: "Integrations"
      },
      {
        name: "Slack Integration",
        description: "Communication integration with Slack",
        status: "active",
        endpoint: "/api/integrations/slack",
        product: "Integrations"
      },
      {
        name: "Google Workspace Integration",
        description: "Productivity integration with Google Workspace",
        status: "active",
        endpoint: "/api/integrations/google",
        product: "Integrations"
      }
    ]
  }
];

const serviceStats = {
  totalServices: 35,
  activeServices: 35,
  categories: 8,
  products: 15,
  alignmentScore: 88
};

export default function ServiceDiscoveryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Service Discovery
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
            Explore all available services and capabilities in the Financbase platform
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{serviceStats.totalServices}</div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Total Services</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-green-600">{serviceStats.activeServices}</div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Active Services</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-purple-600">{serviceStats.categories}</div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Categories</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-orange-600">{serviceStats.alignmentScore}%</div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Alignment Score</div>
            </div>
          </div>
        </div>

        {/* Service Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceCategories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${category.color}`}>
                    <category.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {category.services.map((service, index) => (
                    <div key={`${category.id}-${service.name}`} className="border rounded-lg p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{service.name}</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {service.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {service.product}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {service.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" className="w-full">
                    <Link href={`/platform/services/${category.id}`}>
                      View {category.name}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Service Health Overview */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Service Health Overview
              </CardTitle>
              <CardDescription>
                Real-time status of all platform services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">100%</div>
                  <div className="text-sm text-green-700 dark:text-green-300">Services Online</div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">&lt;200ms</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Avg Response Time</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">99.9%</div>
                  <div className="text-sm text-purple-700 dark:text-purple-300">Uptime</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common service-related tasks and integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" asChild>
                  <Link href="/platform/monitoring">
                    <Monitor className="h-4 w-4 mr-2" />
                    Monitor Services
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/integrations">
                    <Plug className="h-4 w-4 mr-2" />
                    Manage Integrations
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/workflows">
                    <Zap className="h-4 w-4 mr-2" />
                    Create Workflows
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/docs/api">
                    <Code className="h-4 w-4 mr-2" />
                    API Documentation
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
