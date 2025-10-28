import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Puzzle, 
  Workflow,
  Webhook,
  Monitor,
  AlertTriangle,
  Zap,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Activity,
  Server,
  Database,
  Globe,
  Shield
} from "lucide-react";

export const metadata: Metadata = {
  title: "Platform Hub - Financbase",
  description: "Workflows, webhooks, and system monitoring",
};

const platformStats = [
  {
    name: "Active Workflows",
    value: "24",
    change: "+5",
    changeType: "positive",
    icon: Workflow,
  },
  {
    name: "Webhook Endpoints",
    value: "18",
    change: "+3",
    changeType: "positive",
    icon: Webhook,
  },
  {
    name: "System Health",
    value: "99.9%",
    change: "+0.1%",
    changeType: "positive",
    icon: Monitor,
  },
  {
    name: "Active Alerts",
    value: "3",
    change: "-2",
    changeType: "positive",
    icon: AlertTriangle,
  },
];

const workflows = [
  {
    id: "WF-001",
    name: "Invoice Processing",
    description: "Automated invoice creation and approval workflow",
    status: "active",
    executions: "156",
    successRate: "98.7%",
    lastRun: "2 hours ago",
    triggers: ["invoice_created", "payment_received"]
  },
  {
    id: "WF-002",
    name: "Lead Qualification",
    description: "Automated lead scoring and assignment",
    status: "active",
    executions: "89",
    successRate: "94.4%",
    lastRun: "1 hour ago",
    triggers: ["lead_created", "form_submitted"]
  },
  {
    id: "WF-003",
    name: "Expense Approval",
    description: "Multi-level expense approval process",
    status: "paused",
    executions: "234",
    successRate: "96.2%",
    lastRun: "1 day ago",
    triggers: ["expense_submitted", "amount_threshold"]
  },
  {
    id: "WF-004",
    name: "Customer Onboarding",
    description: "Automated customer setup and welcome sequence",
    status: "active",
    executions: "67",
    successRate: "100%",
    lastRun: "30 minutes ago",
    triggers: ["customer_created", "subscription_started"]
  }
];

const webhooks = [
  {
    id: "WH-001",
    name: "Payment Notifications",
    url: "https://api.company.com/webhooks/payments",
    status: "active",
    events: ["payment.completed", "payment.failed"],
    lastDelivery: "5 minutes ago",
    successRate: "99.2%"
  },
  {
    id: "WH-002",
    name: "User Events",
    url: "https://api.company.com/webhooks/users",
    status: "active",
    events: ["user.created", "user.updated", "user.deleted"],
    lastDelivery: "2 minutes ago",
    successRate: "98.8%"
  },
  {
    id: "WH-003",
    name: "Invoice Updates",
    url: "https://api.company.com/webhooks/invoices",
    status: "paused",
    events: ["invoice.created", "invoice.paid", "invoice.overdue"],
    lastDelivery: "1 hour ago",
    successRate: "97.5%"
  }
];

const systemMetrics = [
  {
    name: "API Response Time",
    value: "145ms",
    status: "healthy",
    trend: "down"
  },
  {
    name: "Database Connections",
    value: "23/100",
    status: "healthy",
    trend: "stable"
  },
  {
    name: "Memory Usage",
    value: "67%",
    status: "warning",
    trend: "up"
  },
  {
    name: "CPU Usage",
    value: "34%",
    status: "healthy",
    trend: "down"
  }
];

const quickActions = [
  {
    title: "Create Workflow",
    description: "Build a new automation workflow",
    icon: Plus,
    href: "/workflows/new",
    color: "bg-blue-500",
  },
  {
    title: "Add Webhook",
    description: "Create a new webhook endpoint",
    icon: Webhook,
    href: "/webhooks/new",
    color: "bg-green-500",
  },
  {
    title: "View Monitoring",
    description: "Check system health and metrics",
    icon: Monitor,
    href: "/monitoring",
    color: "bg-purple-500",
  },
  {
    title: "Manage Alerts",
    description: "Configure system alerts",
    icon: AlertTriangle,
    href: "/alerts",
    color: "bg-orange-500",
  },
];

export default function PlatformHubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Platform Hub
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Workflows, webhooks, and system monitoring
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {platformStats.map((stat) => (
            <Card key={stat.name}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {stat.change}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <stat.icon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Puzzle className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Common platform tasks and operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action) => (
                  <Button
                    key={action.title}
                    variant="outline"
                    className="w-full justify-start h-auto p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${action.color}`}>
                        <action.icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{action.title}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          {action.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Workflows & Webhooks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Workflows */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Workflow className="h-5 w-5" />
                      Active Workflows
                    </CardTitle>
                    <CardDescription>
                      Automation workflows and their performance
                    </CardDescription>
                  </div>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Workflow
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className="p-4 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{workflow.name}</h4>
                            <Badge
                              variant={workflow.status === "active" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {workflow.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {workflow.description}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Executions</p>
                          <p className="font-medium">{workflow.executions}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Success Rate</p>
                          <p className="font-medium text-green-600 dark:text-green-400">{workflow.successRate}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Last Run</p>
                          <p className="font-medium">{workflow.lastRun}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Triggers</p>
                          <p className="font-medium">{workflow.triggers.length}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Webhooks */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Webhook className="h-5 w-5" />
                      Webhook Endpoints
                    </CardTitle>
                    <CardDescription>
                      Event delivery endpoints and their status
                    </CardDescription>
                  </div>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Webhook
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {webhooks.map((webhook) => (
                    <div
                      key={webhook.id}
                      className="p-4 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{webhook.name}</h4>
                            <Badge
                              variant={webhook.status === "active" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {webhook.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 font-mono">
                            {webhook.url}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Events</p>
                          <p className="font-medium">{webhook.events.length}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Last Delivery</p>
                          <p className="font-medium">{webhook.lastDelivery}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Success Rate</p>
                          <p className="font-medium text-green-600 dark:text-green-400">{webhook.successRate}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* System Metrics */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Metrics
              </CardTitle>
              <CardDescription>
                Real-time system performance and health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {systemMetrics.map((metric) => (
                  <div key={metric.name} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        {metric.name}
                      </p>
                      <Badge
                        variant={metric.status === "healthy" ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {metric.status}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {metric.value}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Trend: {metric.trend}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
