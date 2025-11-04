/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Briefcase, CheckCircle, DollarSign, TrendingUp, Eye, MoreHorizontal, Star } from "lucide-react"

interface FreelancerDisplay {
  id: string
  name: string
  skill: string
  rating: number
  earnings: string
  projects: number
  avatar?: string
}

interface DashboardStats {
  total_users: number
  active_jobs: number
  completed_projects: number
  platform_earnings: number
  total_revenue: number
}

interface Activity {
  id: string
  user: string
  action: string
  project: string
  time: string
  avatar?: string
}

interface RecentJob {
  id: string
  title: string
  description: string
  budget: string
  posted: string
  proposals: number
}

export function FreelancerDashboardOverview() {
  const [topFreelancers, setTopFreelancers] = useState<FreelancerDisplay[]>([])
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([])
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Initialize with mock data for the migration
    setTopFreelancers([
      {
        id: "1",
        name: "Sarah Ahmed",
        skill: "Web Development",
        rating: 4.9,
        earnings: "$12,450",
        projects: 23,
        avatar: "/placeholder.svg?height=40&width=40"
      },
      {
        id: "2",
        name: "Rahul Sharma",
        skill: "Mobile Development",
        rating: 4.8,
        earnings: "$9,820",
        projects: 18,
        avatar: "/placeholder.svg?height=40&width=40"
      },
      {
        id: "3",
        name: "Fatima Khan",
        skill: "UI/UX Design",
        rating: 4.9,
        earnings: "$8,650",
        projects: 15,
        avatar: "/placeholder.svg?height=40&width=40"
      }
    ])

    setDashboardStats({
      total_users: 1247,
      active_jobs: 89,
      completed_projects: 456,
      platform_earnings: 23450,
      total_revenue: 156780
    })

    // Generate mock activities
    setRecentActivities([
      {
        id: "1",
        user: "Sarah Ahmed",
        action: "completed project",
        project: "Website Development",
        time: "2 minutes ago",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      {
        id: "2",
        user: "Rahul Sharma",
        action: "posted new job",
        project: "Mobile App Design",
        time: "15 minutes ago",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      {
        id: "3",
        user: "Fatima Khan",
        action: "received payment",
        project: "Logo Design",
        time: "1 hour ago",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      {
        id: "4",
        user: "Arjun Patel",
        action: "submitted proposal",
        project: "Content Writing",
        time: "2 hours ago",
        avatar: "/placeholder.svg?height=32&width=32",
      },
    ])

    setLoading(false)
  }, [])

  const metrics = dashboardStats ? [
    {
      title: "Total Users",
      value: dashboardStats.total_users.toLocaleString(),
      change: "+12%",
      changeType: "positive" as const,
      icon: Users,
      description: "Active platform users",
    },
    {
      title: "Active Jobs",
      value: dashboardStats.active_jobs.toLocaleString(),
      change: "+8%",
      changeType: "positive" as const,
      icon: Briefcase,
      description: "Currently open positions",
    },
    {
      title: "Completed Projects",
      value: dashboardStats.completed_projects.toLocaleString(),
      change: "+23%",
      changeType: "positive" as const,
      icon: CheckCircle,
      description: "Successfully delivered",
    },
    {
      title: "Platform Earnings",
      value: `$${dashboardStats.platform_earnings.toLocaleString()}`,
      change: "+15%",
      changeType: "positive" as const,
      icon: DollarSign,
      description: "Commission earned",
    },
    {
      title: "Total Revenue",
      value: `$${dashboardStats.total_revenue.toLocaleString()}`,
      change: "+18%",
      changeType: "positive" as const,
      icon: TrendingUp,
      description: "All transactions",
    },
  ] : []

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Freelancer Hub Dashboard</h1>
        <p className="text-gray-600">Manage freelancers, jobs, and platform analytics</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-green-600 font-medium">{metric.change}</span>
                <span className="text-gray-500">from last month</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
            <CardDescription>Latest platform activities and updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activity.avatar || "/placeholder.svg"} alt={activity.user} />
                  <AvatarFallback>
                    {activity.user
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user}</span> {activity.action}{" "}
                    <span className="font-medium text-blue-600">"{activity.project}"</span>
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4">
              View All Activities
            </Button>
          </CardContent>
        </Card>

        {/* Top Freelancers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Top Freelancers This Week</CardTitle>
            <CardDescription>Highest performing freelancers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topFreelancers.map((freelancer, index) => (
              <div key={freelancer.id} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                    {index + 1}
                  </span>
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={freelancer.avatar || "/placeholder.svg"} alt={freelancer.name} />
                  <AvatarFallback>
                    {freelancer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{freelancer.name}</p>
                  <p className="text-xs text-gray-500">{freelancer.skill}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-600 ml-1">{freelancer.rating}</span>
                    </div>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-600">{freelancer.projects} projects</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{freelancer.earnings}</p>
                  <p className="text-xs text-gray-500">earned</p>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4">
              View All Freelancers
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Job Postings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Job Postings</CardTitle>
          <CardDescription>Latest jobs posted on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-8">
              <p className="text-gray-500">Job postings integration ready for implementation</p>
              <Button className="mt-4">View Integration Guide</Button>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-4">
            View All Jobs
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
