import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  FileText, 
  Download, 
  CheckCircle, 
  Clock,
  Award,
  Calendar,
  Target,
  Users,
  Eye,
  Plus,
  Settings,
  TrendingUp,
  AlertCircle,
  Filter as FilterIcon,
  MoreHorizontal,
  Edit,
  ExternalLink
} from "lucide-react";
import { ComplianceReports } from "@/components/security/compliance-reports";

export const metadata: Metadata = {
  title: "Compliance - Security & Legal",
  description: "Manage compliance standards, generate reports, and track regulatory requirements",
};

export default function CompliancePage() {
  const complianceStats = {
    totalStandards: 8,
    compliant: 3,
    inProgress: 4,
    planned: 1,
    upcomingAudits: 2,
    overdueTasks: 1
  };

  const recentActivities = [
    {
      id: 1,
      type: "audit",
      title: "SOC 2 Type II Audit Completed",
      description: "Annual security audit completed successfully",
      timestamp: "2024-10-15T10:30:00Z",
      status: "completed",
      priority: "high"
    },
    {
      id: 2,
      type: "policy",
      title: "Data Retention Policy Updated",
      description: "Updated GDPR data retention policy for EU customers",
      timestamp: "2024-10-14T14:20:00Z",
      status: "completed",
      priority: "medium"
    },
    {
      id: 3,
      type: "request",
      title: "GDPR Data Request Received",
      description: "New data subject access request from customer",
      timestamp: "2024-10-13T09:15:00Z",
      status: "pending",
      priority: "high"
    },
    {
      id: 4,
      type: "training",
      title: "Compliance Training Scheduled",
      description: "Quarterly compliance training for all employees",
      timestamp: "2024-10-12T16:45:00Z",
      status: "scheduled",
      priority: "medium"
    }
  ];

  const upcomingTasks = [
    {
      id: 1,
      title: "ISO 27001 Certification Preparation",
      description: "Prepare documentation for ISO 27001 certification audit",
      dueDate: "2024-11-15",
      priority: "high",
      assignee: "Security Team",
      status: "in-progress"
    },
    {
      id: 2,
      title: "PCI DSS Compliance Review",
      description: "Annual PCI DSS compliance assessment",
      dueDate: "2024-12-01",
      priority: "high",
      assignee: "IT Security",
      status: "pending"
    },
    {
      id: 3,
      title: "Privacy Impact Assessment",
      description: "Conduct PIA for new customer data processing",
      dueDate: "2024-10-25",
      priority: "medium",
      assignee: "Legal Team",
      status: "pending"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "scheduled": return "bg-purple-100 text-purple-800";
      case "overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "audit": return Shield;
      case "policy": return FileText;
      case "request": return Users;
      case "training": return Award;
      default: return AlertCircle;
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance Management</h1>
          <p className="text-gray-600 mt-2">
            Monitor compliance standards, manage audits, and track regulatory requirements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Audit
          </Button>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500">
        <span>Dashboard</span>
        <span>/</span>
        <span>Collaboration</span>
        <span>/</span>
        <span className="text-gray-900">Compliance</span>
      </nav>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Standards</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceStats.totalStandards}</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2 this quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliant</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceStats.compliant}</div>
            <p className="text-xs text-green-600">
              {((complianceStats.compliant / complianceStats.totalStandards) * 100).toFixed(1)}% of standards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceStats.inProgress}</div>
            <p className="text-xs text-blue-600">
              Active initiatives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Audits</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceStats.upcomingAudits}</div>
            <p className="text-xs text-orange-600">
              Next 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>
                Latest compliance activities and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const IconComponent = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <IconComponent className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{activity.title}</h3>
                          <Badge className={getStatusColor(activity.status)}>
                            {activity.status}
                          </Badge>
                          <Badge className={getPriorityColor(activity.priority)}>
                            {activity.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Upcoming Tasks</CardTitle>
                  <CardDescription>
                    Compliance tasks requiring attention
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <Target className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{task.title}</h3>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{task.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {task.assignee}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Compliance Standards Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Standards</CardTitle>
                <CardDescription>Current compliance framework status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "SOC 2 Type II", status: "compliant", progress: 100 },
                    { name: "GDPR", status: "compliant", progress: 100 },
                    { name: "PCI DSS", status: "in-progress", progress: 75 },
                    { name: "ISO 27001", status: "planned", progress: 25 },
                    { name: "HIPAA", status: "planned", progress: 10 }
                  ].map((standard) => (
                    <div key={standard.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          standard.status === 'compliant' ? 'bg-green-500' :
                          standard.status === 'in-progress' ? 'bg-blue-500' :
                          'bg-orange-500'
                        }`}></div>
                        <span className="font-medium">{standard.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{standard.progress}%</span>
                        <Badge className={getStatusColor(standard.status)}>
                          {standard.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Metrics</CardTitle>
                <CardDescription>Key security and compliance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Security Score</span>
                    <Badge className="bg-green-100 text-green-800">92/100</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Data Breaches</span>
                    <Badge className="bg-green-100 text-green-800">0</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Audit Findings</span>
                    <Badge className="bg-yellow-100 text-yellow-800">2 Minor</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Policy Updates</span>
                    <Badge className="bg-blue-100 text-blue-800">3 This Month</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Training Completion</span>
                    <Badge className="bg-green-100 text-green-800">98%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="mt-6">
          <ComplianceReports />
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Compliance Tasks</CardTitle>
                  <CardDescription>
                    Manage compliance tasks and assignments
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <FilterIcon className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    New Task
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                          <Target className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{task.title}</h3>
                          <p className="text-sm text-gray-600">{task.description}</p>
                        </div>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Due Date</p>
                        <p className="font-semibold">{new Date(task.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Assignee</p>
                        <p className="font-semibold">{task.assignee}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Priority</p>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Created: {new Date().toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          Team: Compliance
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policies Tab */}
        <TabsContent value="policies" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Compliance Policies</CardTitle>
                  <CardDescription>
                    Manage compliance policies and procedures
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    New Policy
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    name: "Data Protection Policy",
                    description: "Comprehensive data protection and privacy policy",
                    version: "2.1",
                    lastUpdated: "2024-10-15",
                    status: "active",
                    category: "Privacy"
                  },
                  {
                    id: 2,
                    name: "Security Incident Response",
                    description: "Procedures for handling security incidents",
                    version: "1.3",
                    lastUpdated: "2024-10-10",
                    status: "active",
                    category: "Security"
                  },
                  {
                    id: 3,
                    name: "Access Control Policy",
                    description: "User access management and control procedures",
                    version: "1.8",
                    lastUpdated: "2024-10-05",
                    status: "active",
                    category: "Security"
                  },
                  {
                    id: 4,
                    name: "Data Retention Policy",
                    description: "Data retention and disposal procedures",
                    version: "1.2",
                    lastUpdated: "2024-09-28",
                    status: "draft",
                    category: "Privacy"
                  }
                ].map((policy) => (
                  <div key={policy.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{policy.name}</h3>
                          <p className="text-sm text-gray-600">{policy.description}</p>
                        </div>
                        <Badge className={getStatusColor(policy.status)}>
                          {policy.status}
                        </Badge>
                        <Badge variant="outline">
                          {policy.category}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Version</p>
                        <p className="font-semibold">{policy.version}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Last Updated</p>
                        <p className="font-semibold">{new Date(policy.lastUpdated).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <Badge className={getStatusColor(policy.status)}>
                          {policy.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Category</p>
                        <Badge variant="outline">{policy.category}</Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Next Review: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          Approved by: Legal Team
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
