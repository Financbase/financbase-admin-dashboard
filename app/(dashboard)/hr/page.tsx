/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  UserCog, 
  Users, 
  User, 
  Clock, 
  DollarSign,
  TrendingUp,
  Calendar,
  FileText,
  Plus,
  Search,
  Filter,
  MoreHorizontal
} from "lucide-react";

export const metadata: Metadata = {
  title: "HR Management - Financbase",
  description: "Comprehensive human resources management and employee services",
};

const hrStats = [
  {
    name: "Total Employees",
    value: "47",
    change: "+3",
    changeType: "positive",
    icon: Users,
  },
  {
    name: "Active Contractors",
    value: "12",
    change: "+2",
    changeType: "positive",
    icon: User,
  },
  {
    name: "Pending Approvals",
    value: "5",
    change: "-2",
    changeType: "positive",
    icon: Clock,
  },
  {
    name: "Monthly Payroll",
    value: "$125,400",
    change: "+8%",
    changeType: "positive",
    icon: DollarSign,
  },
];

const recentActivities = [
  {
    id: "1",
    type: "employee_added",
    title: "New Employee Added",
    description: "Sarah Johnson joined as Senior Developer",
    timestamp: "2 hours ago",
    status: "completed",
  },
  {
    id: "2",
    type: "timesheet_submitted",
    title: "Timesheet Submitted",
    description: "Mike Chen submitted weekly timesheet",
    timestamp: "4 hours ago",
    status: "pending",
  },
  {
    id: "3",
    type: "contractor_approved",
    title: "Contractor Approved",
    description: "Design contractor Lisa Wang approved",
    timestamp: "1 day ago",
    status: "completed",
  },
  {
    id: "4",
    type: "payroll_processed",
    title: "Payroll Processed",
    description: "Monthly payroll for 47 employees completed",
    timestamp: "2 days ago",
    status: "completed",
  },
];

const quickActions = [
  {
    title: "Add Employee",
    description: "Add a new employee to the system",
    icon: Plus,
    href: "/hr/employees/new",
    color: "bg-blue-500",
  },
  {
    title: "Add Contractor",
    description: "Add a new contractor",
    icon: User,
    href: "/hr/contractors/new",
    color: "bg-green-500",
  },
  {
    title: "Process Payroll",
    description: "Run monthly payroll",
    icon: DollarSign,
    href: "/hr/payroll/process",
    color: "bg-purple-500",
  },
  {
    title: "Time Tracking",
    description: "View time tracking reports",
    icon: Clock,
    href: "/hr/time-tracking",
    color: "bg-orange-500",
  },
];

export default function HRManagementPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            HR Management
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Comprehensive human resources management and employee services
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {hrStats.map((stat) => (
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
                  <UserCog className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Common HR tasks and operations
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

          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activities
                </CardTitle>
                <CardDescription>
                  Latest HR activities and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <Clock className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{activity.title}</h4>
                          <Badge
                            variant={activity.status === "completed" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {activity.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                          {activity.description}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* HR Modules Overview */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>HR Modules</CardTitle>
              <CardDescription>
                Access all HR management features and tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Users className="h-6 w-6" />
                  <span>Employees</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <User className="h-6 w-6" />
                  <span>Contractors</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Clock className="h-6 w-6" />
                  <span>Time Tracking</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <DollarSign className="h-6 w-6" />
                  <span>Payroll</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
