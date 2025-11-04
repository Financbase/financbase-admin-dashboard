/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Play, 
  Pause, 
  Square as StopIcon,
  Clock, 
  Calendar,
  User,
  Building,
  DollarSign,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Download,
  Filter,
  Search,
  Timer,
  BarChart3,
  Target
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

export default function TimeTrackingPage() {
  const timeEntries = [
    {
      id: 1,
      employee: "Sarah Johnson",
      project: "Website Redesign",
      task: "Frontend Development",
      date: "2024-10-20",
      startTime: "09:00",
      endTime: "17:00",
      duration: 8,
      hourlyRate: 75,
      totalCost: 600,
      status: "approved",
      description: "Implemented responsive design components"
    },
    {
      id: 2,
      employee: "Michael Chen",
      project: "API Integration",
      task: "Backend Development",
      date: "2024-10-20",
      startTime: "08:30",
      endTime: "16:30",
      duration: 8,
      hourlyRate: 85,
      totalCost: 680,
      status: "pending",
      description: "Integrated third-party payment API"
    },
    {
      id: 3,
      employee: "Emily Rodriguez",
      project: "Mobile App",
      task: "UI/UX Design",
      date: "2024-10-19",
      startTime: "10:00",
      endTime: "18:00",
      duration: 8,
      hourlyRate: 70,
      totalCost: 560,
      status: "approved",
      description: "Created user interface mockups"
    },
    {
      id: 4,
      employee: "David Kim",
      project: "DevOps Setup",
      task: "Infrastructure",
      date: "2024-10-19",
      startTime: "09:30",
      endTime: "17:30",
      duration: 8,
      hourlyRate: 95,
      totalCost: 760,
      status: "pending",
      description: "Configured CI/CD pipeline"
    },
    {
      id: 5,
      employee: "Lisa Thompson",
      project: "Marketing Campaign",
      task: "Content Creation",
      date: "2024-10-18",
      startTime: "09:00",
      endTime: "17:00",
      duration: 8,
      hourlyRate: 60,
      totalCost: 480,
      status: "approved",
      description: "Created social media content"
    }
  ];

  const projects = [
    {
      id: 1,
      name: "Website Redesign",
      client: "TechCorp Solutions",
      totalHours: 120,
      budget: 15000,
      spent: 9000,
      status: "active",
      team: ["Sarah Johnson", "Michael Chen"],
      deadline: "2024-12-15"
    },
    {
      id: 2,
      name: "Mobile App Development",
      client: "StartupXYZ",
      totalHours: 200,
      budget: 25000,
      spent: 18000,
      status: "active",
      team: ["Emily Rodriguez", "David Kim"],
      deadline: "2025-01-30"
    },
    {
      id: 3,
      name: "Marketing Campaign",
      client: "Creative Agency Pro",
      totalHours: 80,
      budget: 8000,
      spent: 4800,
      status: "completed",
      team: ["Lisa Thompson"],
      deadline: "2024-10-31"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "active": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const timeStats = {
    totalHours: 48,
    billableHours: 40,
    nonBillableHours: 8,
    totalCost: 3840,
    pendingApproval: 2,
    approved: 3
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Time Tracking</h1>
          <p className="text-gray-600 mt-2">
            Track time, manage projects, and monitor productivity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Timesheets
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Log Time
          </Button>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500">
        <span>Dashboard</span>
        <span>/</span>
        <span>HR Management</span>
        <span>/</span>
        <span className="text-gray-900">Time Tracking</span>
      </nav>

      {/* Time Tracking Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timeStats.totalHours}h</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timeStats.billableHours}h</div>
            <p className="text-xs text-green-600">
              {((timeStats.billableHours / timeStats.totalHours) * 100).toFixed(1)}% utilization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${timeStats.totalCost.toLocaleString()}</div>
            <p className="text-xs text-green-600">
              This week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timeStats.pendingApproval}</div>
            <p className="text-xs text-yellow-600">
              Requires review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Timer */}
      <Card>
        <CardHeader>
          <CardTitle>Active Timer</CardTitle>
          <CardDescription>Currently tracking time for active tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Timer className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Website Redesign - Frontend Development</h3>
                <p className="text-sm text-gray-600">Sarah Johnson • Started at 09:00</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-2xl font-bold">2:34:15</div>
                <div className="text-sm text-gray-600">Elapsed time</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
                <Button variant="outline" size="sm">
                  <StopIcon className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Tracking Management */}
      <Tabs defaultValue="entries" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="entries">Time Entries</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Time Entries Tab */}
        <TabsContent value="entries" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Time Entries</CardTitle>
                  <CardDescription>
                    View and manage all time entries
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search entries..."
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeEntries.map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{entry.employee}</h3>
                          <p className="text-sm text-gray-600">{entry.project} - {entry.task}</p>
                        </div>
                        <Badge className={getStatusColor(entry.status)}>
                          {entry.status}
                        </Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Entry
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Entry
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-semibold">{entry.date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Time</p>
                        <p className="font-semibold">{entry.startTime} - {entry.endTime}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-semibold">{entry.duration}h</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Cost</p>
                        <p className="font-semibold">${entry.totalCost}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          Rate: ${entry.hourlyRate}/hr
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {entry.date}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-700">{entry.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Project Time Tracking</CardTitle>
                  <CardDescription>
                    Monitor time spent on different projects
                  </CardDescription>
                </div>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Project
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                          <Building className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{project.name}</h3>
                          <p className="text-sm text-gray-600">{project.client}</p>
                        </div>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Project
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Reports
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Hours</p>
                        <p className="font-semibold">{project.totalHours}h</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Budget</p>
                        <p className="font-semibold">${project.budget.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Spent</p>
                        <p className="font-semibold">${project.spent.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Deadline</p>
                        <p className="font-semibold">{project.deadline}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Budget Utilization</span>
                        <span>{((project.spent / project.budget) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={(project.spent / project.budget) * 100} 
                        className="h-2"
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          Team: {project.team.join(", ")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Due: {project.deadline}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Reports
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Time Summary</CardTitle>
                <CardDescription>Weekly time tracking summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Billable Hours</span>
                    <Badge variant="secondary">{timeStats.billableHours}h</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Non-billable Hours</span>
                    <Badge variant="secondary">{timeStats.nonBillableHours}h</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Cost</span>
                    <Badge className="bg-green-100 text-green-800">${timeStats.totalCost}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Utilization Rate</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {((timeStats.billableHours / timeStats.totalHours) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Time Trackers</CardTitle>
                <CardDescription>Employees with most logged hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Sarah Johnson", hours: 40, projects: 2 },
                    { name: "Michael Chen", hours: 38, projects: 3 },
                    { name: "Emily Rodriguez", hours: 35, projects: 2 },
                    { name: "David Kim", hours: 32, projects: 1 },
                    { name: "Lisa Thompson", hours: 28, projects: 1 }
                  ].map((employee, index) => (
                    <div key={employee.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-sm text-gray-600">{employee.projects} projects</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{employee.hours}h</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}