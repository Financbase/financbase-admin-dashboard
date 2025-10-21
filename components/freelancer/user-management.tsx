"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Badge, Avatar, AvatarFallback, AvatarImage, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../src/design-system"
import { Search, MoreHorizontal, Eye, Edit, Ban, CheckCircle, Users, UserCheck, UserX } from "lucide-react"

const users = [
  {
    id: 1,
    name: "Sarah Ahmed",
    email: "sarah.ahmed@email.com",
    role: "Freelancer",
    status: "Active",
    joinDate: "2024-01-15",
    projects: 23,
    rating: 4.9,
    earnings: "$12,450",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Rahul Sharma",
    email: "rahul.sharma@email.com",
    role: "Client",
    status: "Active",
    joinDate: "2024-02-20",
    projects: 8,
    rating: 4.7,
    earnings: "$0",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Fatima Khan",
    email: "fatima.khan@email.com",
    role: "Freelancer",
    status: "Pending",
    joinDate: "2024-03-10",
    projects: 0,
    rating: 0,
    earnings: "$0",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Ahmed Hassan",
    email: "ahmed.hassan@email.com",
    role: "Freelancer",
    status: "Blocked",
    joinDate: "2024-01-05",
    projects: 15,
    rating: 4.2,
    earnings: "$8,750",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "Priya Patel",
    email: "priya.patel@email.com",
    role: "Client",
    status: "Active",
    joinDate: "2024-02-28",
    projects: 12,
    rating: 4.8,
    earnings: "$0",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

const userStats = [
  {
    title: "Total Users",
    value: "12,847",
    icon: Users,
    color: "text-blue-600",
  },
  {
    title: "Active Users",
    value: "11,234",
    icon: UserCheck,
    color: "text-green-600",
  },
  {
    title: "Pending Approval",
    value: "156",
    icon: UserX,
    color: "text-yellow-600",
  },
  {
    title: "Blocked Users",
    value: "89",
    icon: Ban,
    color: "text-red-600",
  },
]

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "Blocked":
        return <Badge className="bg-red-100 text-red-800">Blocked</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    return role === "Freelancer" ? (
      <Badge variant="outline" className="text-blue-600 border-blue-200">
        Freelancer
      </Badge>
    ) : (
      <Badge variant="outline" className="text-purple-600 border-purple-200">
        Client
      </Badge>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600">Manage freelancers and clients on the platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {userStats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>A list of all users including freelancers and clients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="freelancer">Freelancer</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Earnings</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback>
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-sm text-gray-500">{user.joinDate}</TableCell>
                    <TableCell>{user.projects}</TableCell>
                    <TableCell>
                      {user.rating > 0 ? (
                        <div className="flex items-center">
                          <span className="text-sm font-medium">{user.rating}</span>
                          <span className="text-yellow-400 ml-1">★</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{user.earnings}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.status === "Pending" && (
                            <DropdownMenuItem className="text-green-600">
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                          )}
                          {user.status === "Active" && (
                            <DropdownMenuItem className="text-red-600">
                              <Ban className="mr-2 h-4 w-4" />
                              Block User
                            </DropdownMenuItem>
                          )}
                          {user.status === "Blocked" && (
                            <DropdownMenuItem className="text-green-600">
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Unblock
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-gray-500">Showing 1 to 5 of 12,847 users</div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
