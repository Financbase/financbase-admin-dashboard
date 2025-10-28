import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  MapPin,
  DollarSign,
  UserCheck,
  UserX
} from "lucide-react";

export const metadata: Metadata = {
  title: "Employees - HR Management",
  description: "Manage employee records and information",
};

const employees = [
  {
    id: "EMP-001",
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    phone: "+1 (555) 123-4567",
    position: "Senior Developer",
    department: "Engineering",
    status: "active",
    startDate: "2023-01-15",
    salary: "$95,000",
    location: "San Francisco, CA",
    avatar: "/avatars/sarah.jpg"
  },
  {
    id: "EMP-002",
    name: "Mike Chen",
    email: "mike.chen@company.com",
    phone: "+1 (555) 234-5678",
    position: "Product Manager",
    department: "Product",
    status: "active",
    startDate: "2022-08-20",
    salary: "$110,000",
    location: "New York, NY",
    avatar: "/avatars/mike.jpg"
  },
  {
    id: "EMP-003",
    name: "Emily Rodriguez",
    email: "emily.rodriguez@company.com",
    phone: "+1 (555) 345-6789",
    position: "UX Designer",
    department: "Design",
    status: "active",
    startDate: "2023-03-10",
    salary: "$85,000",
    location: "Austin, TX",
    avatar: "/avatars/emily.jpg"
  },
  {
    id: "EMP-004",
    name: "David Kim",
    email: "david.kim@company.com",
    phone: "+1 (555) 456-7890",
    position: "Marketing Specialist",
    department: "Marketing",
    status: "on-leave",
    startDate: "2022-11-05",
    salary: "$70,000",
    location: "Seattle, WA",
    avatar: "/avatars/david.jpg"
  },
  {
    id: "EMP-005",
    name: "Lisa Wang",
    email: "lisa.wang@company.com",
    phone: "+1 (555) 567-8901",
    position: "Data Analyst",
    department: "Analytics",
    status: "active",
    startDate: "2023-06-01",
    salary: "$80,000",
    location: "Boston, MA",
    avatar: "/avatars/lisa.jpg"
  }
];

const departments = [
  { name: "Engineering", count: 15, color: "bg-blue-500" },
  { name: "Product", count: 8, color: "bg-green-500" },
  { name: "Design", count: 6, color: "bg-purple-500" },
  { name: "Marketing", count: 12, color: "bg-orange-500" },
  { name: "Analytics", count: 4, color: "bg-pink-500" },
  { name: "Sales", count: 10, color: "bg-indigo-500" },
];

export default function EmployeesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Employees
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Manage employee records and information
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Total Employees
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    47
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Active
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    42
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    On Leave
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    3
                  </p>
                </div>
                <UserX className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Departments
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    6
                  </p>
                </div>
                <Filter className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Departments */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Departments</CardTitle>
                <CardDescription>
                  Employee distribution by department
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {departments.map((dept) => (
                  <div key={dept.name} className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${dept.color}`} />
                      <span className="font-medium">{dept.name}</span>
                    </div>
                    <Badge variant="secondary">{dept.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Employee List */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Employee Directory</CardTitle>
                    <CardDescription>
                      Complete list of all employees
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employees.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center gap-4 p-4 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{employee.name}</h3>
                          <Badge
                            variant={employee.status === "active" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {employee.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {employee.position} • {employee.department}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {employee.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {employee.phone}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {employee.location}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600 dark:text-green-400">
                          {employee.salary}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Started {employee.startDate}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
