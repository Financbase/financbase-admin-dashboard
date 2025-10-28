import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Mail, 
  Phone, 
  Calendar,
  User,
  Building,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  FileText,
  MapPin,
  Star,
  TrendingUp
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function HRContractorsPage() {
  const contractors = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 123-4567",
      title: "Frontend Developer",
      company: "Contractor Solutions",
      status: "active",
      hourlyRate: 85,
      totalHours: 120,
      totalEarnings: 10200,
      startDate: "2024-09-01",
      endDate: "2024-12-31",
      location: "San Francisco, CA",
      skills: ["React", "TypeScript", "Next.js"],
      rating: 4.8,
      projects: 3,
      lastActive: "2024-10-20"
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "m.chen@freelance.io",
      phone: "+1 (555) 234-5678",
      title: "Backend Developer",
      company: "Independent",
      status: "active",
      hourlyRate: 95,
      totalHours: 95,
      totalEarnings: 9025,
      startDate: "2024-08-15",
      endDate: "2024-11-30",
      location: "Austin, TX",
      skills: ["Node.js", "Python", "PostgreSQL"],
      rating: 4.9,
      projects: 2,
      lastActive: "2024-10-19"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily.r@design.com",
      phone: "+1 (555) 345-6789",
      title: "UI/UX Designer",
      company: "Design Studio Pro",
      status: "pending",
      hourlyRate: 75,
      totalHours: 0,
      totalEarnings: 0,
      startDate: "2024-11-01",
      endDate: "2025-02-28",
      location: "New York, NY",
      skills: ["Figma", "Sketch", "Adobe Creative Suite"],
      rating: 4.7,
      projects: 0,
      lastActive: "Never"
    },
    {
      id: 4,
      name: "David Kim",
      email: "david.kim@dev.com",
      phone: "+1 (555) 456-7890",
      title: "DevOps Engineer",
      company: "Cloud Solutions Inc",
      status: "completed",
      hourlyRate: 110,
      totalHours: 80,
      totalEarnings: 8800,
      startDate: "2024-07-01",
      endDate: "2024-09-30",
      location: "Seattle, WA",
      skills: ["AWS", "Docker", "Kubernetes"],
      rating: 4.9,
      projects: 1,
      lastActive: "2024-09-30"
    },
    {
      id: 5,
      name: "Lisa Thompson",
      email: "lisa.t@marketing.com",
      phone: "+1 (555) 567-8901",
      title: "Digital Marketing Specialist",
      company: "Marketing Agency",
      status: "onboarding",
      hourlyRate: 65,
      totalHours: 0,
      totalEarnings: 0,
      startDate: "2024-10-25",
      endDate: "2025-01-25",
      location: "Chicago, IL",
      skills: ["SEO", "Google Ads", "Social Media"],
      rating: 4.6,
      projects: 0,
      lastActive: "Never"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "onboarding": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-gray-100 text-gray-800";
      case "terminated": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const contractorStats = {
    total: 47,
    active: 12,
    pending: 8,
    onboarding: 5,
    completed: 18,
    terminated: 4
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contractors</h1>
          <p className="text-gray-600 mt-2">
            Manage external contractors and freelancers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Contractor
          </Button>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500">
        <span>Dashboard</span>
        <span>/</span>
        <span>HR Management</span>
        <span>/</span>
        <span className="text-gray-900">Contractors</span>
      </nav>

      {/* Contractor Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contractors</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contractorStats.total}</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +3 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contractors</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contractorStats.active}</div>
            <p className="text-xs text-green-600">
              {((contractorStats.active / contractorStats.total) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contractorStats.pending}</div>
            <p className="text-xs text-yellow-600">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$28,025</div>
            <p className="text-xs text-green-600">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contractor Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contractor Management</CardTitle>
              <CardDescription>
                View and manage all contractors and freelancers
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search contractors..."
                  className="pl-10 w-64"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
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
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({contractorStats.total})</TabsTrigger>
              <TabsTrigger value="active">Active ({contractorStats.active})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({contractorStats.pending})</TabsTrigger>
              <TabsTrigger value="onboarding">Onboarding ({contractorStats.onboarding})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({contractorStats.completed})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="space-y-4">
                {contractors.map((contractor) => (
                  <div key={contractor.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{contractor.name}</h3>
                          <p className="text-sm text-gray-600">{contractor.title}</p>
                        </div>
                        <Badge className={getStatusColor(contractor.status)}>
                          {contractor.status}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{contractor.rating}</span>
                        </div>
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
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Contractor
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" />
                            View Contracts
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule Meeting
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Contractor
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{contractor.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{contractor.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{contractor.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{contractor.company}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Hourly Rate</p>
                        <p className="font-semibold">${contractor.hourlyRate}/hr</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Hours</p>
                        <p className="font-semibold">{contractor.totalHours}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Earnings</p>
                        <p className="font-semibold">${contractor.totalEarnings.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Projects</p>
                        <p className="font-semibold">{contractor.projects}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Contract: {contractor.startDate} - {contractor.endDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Last active: {contractor.lastActive}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {contractor.skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Contractor Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Contractors</CardTitle>
            <CardDescription>Contractors with highest ratings and productivity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contractors
                .filter(c => c.status === 'active' || c.status === 'completed')
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 5)
                .map((contractor, index) => (
                <div key={contractor.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{contractor.name}</p>
                      <p className="text-sm text-gray-600">{contractor.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{contractor.rating}</span>
                    </div>
                    <Badge variant="secondary">{contractor.totalHours}h</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contractor Status Distribution</CardTitle>
            <CardDescription>Current contractor pipeline status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(contractorStats).filter(([key]) => key !== 'total').map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'active' ? 'bg-green-500' :
                      status === 'pending' ? 'bg-yellow-500' :
                      status === 'onboarding' ? 'bg-blue-500' :
                      status === 'completed' ? 'bg-gray-500' :
                      'bg-red-500'
                    }`}></div>
                    <span className="capitalize font-medium">{status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{count} contractors</span>
                    <span className="text-sm text-gray-500">
                      ({((count / contractorStats.total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}