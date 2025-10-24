import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
	Building,
	Settings,
	Users,
	Globe,
	MapPin,
	Phone,
	Mail,
	Calendar,
	Edit,
	Plus,
	Shield,
	BarChart3,
	Target,
	TrendingUp
} from "lucide-react";

export const metadata: Metadata = {
	title: "Organization Settings | Financbase",
	description: "Manage your organization settings, structure, and company information",
};

const companyInfo = {
	name: "Financbase Inc.",
	industry: "Financial Technology",
	size: "50-100 employees",
	founded: "2020",
	website: "https://financbase.com",
	description: "Leading financial management platform for businesses",
};

const locations = [
	{
		name: "Headquarters",
		address: "123 Financial Street, San Francisco, CA 94105",
		phone: "+1 (555) 123-4567",
		email: "hq@financbase.com",
		employees: 28,
		type: "primary",
	},
	{
		name: "New York Office",
		address: "456 Wall Street, New York, NY 10005",
		phone: "+1 (555) 987-6543",
		email: "ny@financbase.com",
		employees: 12,
		type: "branch",
	},
	{
		name: "Remote Team",
		address: "Distributed across US time zones",
		phone: null,
		email: "remote@financbase.com",
		employees: 7,
		type: "remote",
	},
];

const subsidiaries = [
	{
		name: "Financbase Payments LLC",
		type: "Subsidiary",
		industry: "Payment Processing",
		employees: 15,
		status: "active",
	},
	{
		name: "Financbase Analytics Ltd",
		type: "Subsidiary",
		industry: "Data Analytics",
		employees: 8,
		status: "active",
	},
];

const orgMetrics = [
	{
		name: "Total Revenue",
		value: "$2.4M",
		change: "+18%",
		changeType: "positive",
		icon: TrendingUp,
	},
	{
		name: "Market Cap",
		value: "$12M",
		change: "+25%",
		changeType: "positive",
		icon: BarChart3,
	},
	{
		name: "Customer Base",
		value: "1,247",
		change: "+12%",
		changeType: "positive",
		icon: Users,
	},
	{
		name: "Market Share",
		value: "3.2%",
		change: "+0.8%",
		changeType: "positive",
		icon: Target,
	},
];

export default function OrganizationPage() {
	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
					<p className="text-muted-foreground">
						Manage your organization structure, company information, and settings
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline">
						<Settings className="h-4 w-4 mr-2" />
						Settings
					</Button>
					<Button>
						<Edit className="h-4 w-4 mr-2" />
						Edit Company
					</Button>
				</div>
			</div>

			{/* Company Overview */}
			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Building className="h-5 w-5" />
							Company Information
						</CardTitle>
						<CardDescription>
							Basic company details and profile
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Company Name</span>
								<span className="text-sm">{companyInfo.name}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Industry</span>
								<span className="text-sm">{companyInfo.industry}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Company Size</span>
								<span className="text-sm">{companyInfo.size}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Founded</span>
								<span className="text-sm">{companyInfo.founded}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Website</span>
								<span className="text-sm">{companyInfo.website}</span>
							</div>
						</div>
						<Separator />
						<div className="space-y-2">
							<h4 className="font-medium">Description</h4>
							<p className="text-sm text-muted-foreground">{companyInfo.description}</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<BarChart3 className="h-5 w-5" />
							Organization Metrics
						</CardTitle>
						<CardDescription>
							Key performance indicators and growth metrics
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{orgMetrics.map((metric, index) => (
								<div key={metric.name} className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<metric.icon className="h-4 w-4 text-muted-foreground" />
										<span className="text-sm font-medium">{metric.name}</span>
									</div>
									<div className="text-right">
										<span className="font-medium">{metric.value}</span>
										<p className={`text-xs ${metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
											{metric.change}
										</p>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Organization Structure */}
			<Tabs defaultValue="locations" className="space-y-4">
				<TabsList>
					<TabsTrigger value="locations">Locations</TabsTrigger>
					<TabsTrigger value="subsidiaries">Subsidiaries</TabsTrigger>
					<TabsTrigger value="structure">Org Structure</TabsTrigger>
					<TabsTrigger value="compliance">Compliance</TabsTrigger>
				</TabsList>

				<TabsContent value="locations" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Office Locations</CardTitle>
							<CardDescription>
								Manage your office locations and facilities
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{locations.map((location, index) => (
									<div key={location.name} className="flex items-center justify-between p-4 border rounded-lg">
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<h4 className="font-medium">{location.name}</h4>
												<Badge variant={
													location.type === 'primary' ? 'default' :
													location.type === 'branch' ? 'secondary' :
													'outline'
												}>
													{location.type}
												</Badge>
											</div>
											<div className="space-y-1 text-sm text-muted-foreground">
												<div className="flex items-center gap-1">
													<MapPin className="h-3 w-3" />
													{location.address}
												</div>
												{location.phone && (
													<div className="flex items-center gap-1">
														<Phone className="h-3 w-3" />
														{location.phone}
													</div>
												)}
												<div className="flex items-center gap-1">
													<Mail className="h-3 w-3" />
													{location.email}
												</div>
											</div>
											<p className="text-sm">
												{location.employees} employees
											</p>
										</div>
										<div className="flex items-center gap-2">
											<Button variant="outline" size="sm">
												View Details
											</Button>
											<Button variant="outline" size="sm">
												Edit
											</Button>
										</div>
									</div>
								))}
								<Separator />
								<Button variant="outline" className="w-full">
									<Plus className="h-4 w-4 mr-2" />
									Add Location
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="subsidiaries" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Subsidiaries & Affiliates</CardTitle>
							<CardDescription>
								Manage subsidiary companies and business entities
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{subsidiaries.map((subsidiary, index) => (
									<div key={subsidiary.name} className="flex items-center justify-between p-4 border rounded-lg">
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<h4 className="font-medium">{subsidiary.name}</h4>
												<Badge variant="outline">{subsidiary.type}</Badge>
												<Badge variant="secondary">{subsidiary.status}</Badge>
											</div>
											<p className="text-sm text-muted-foreground">
												{subsidiary.industry} • {subsidiary.employees} employees
											</p>
										</div>
										<div className="flex items-center gap-2">
											<Button variant="outline" size="sm">
												View Details
											</Button>
											<Button variant="outline" size="sm">
												Manage
											</Button>
										</div>
									</div>
								))}
								<Separator />
								<Button variant="outline" className="w-full">
									<Plus className="h-4 w-4 mr-2" />
									Add Subsidiary
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="structure" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Organizational Structure</CardTitle>
							<CardDescription>
								Manage reporting structure and team hierarchy
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="text-center py-8 text-muted-foreground">
									<Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
									<h3 className="font-medium mb-2">Organizational Chart</h3>
									<p className="text-sm mb-4">
										Interactive organizational chart showing reporting structure and team hierarchy
									</p>
									<Button variant="outline">
										<Building className="h-4 w-4 mr-2" />
										View Org Chart
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="compliance" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Shield className="h-5 w-5" />
								Compliance & Legal
							</CardTitle>
							<CardDescription>
								Manage legal compliance, certifications, and regulatory requirements
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="grid gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<h4 className="font-medium">Certifications</h4>
										<div className="space-y-2">
											<div className="flex items-center justify-between">
												<span className="text-sm">SOC 2 Type II</span>
												<Badge variant="default">Active</Badge>
											</div>
											<div className="flex items-center justify-between">
												<span className="text-sm">GDPR Compliant</span>
												<Badge variant="default">Active</Badge>
											</div>
											<div className="flex items-center justify-between">
												<span className="text-sm">PCI DSS</span>
												<Badge variant="default">Active</Badge>
											</div>
										</div>
									</div>
									<div className="space-y-2">
										<h4 className="font-medium">Legal Documents</h4>
										<div className="space-y-2">
											<Button variant="outline" size="sm" className="w-full justify-start">
												Terms of Service
											</Button>
											<Button variant="outline" size="sm" className="w-full justify-start">
												Privacy Policy
											</Button>
											<Button variant="outline" size="sm" className="w-full justify-start">
												Compliance Reports
											</Button>
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
