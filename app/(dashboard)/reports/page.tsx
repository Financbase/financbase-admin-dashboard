import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Download, FileText, Calendar, TrendingUp, PieChart } from "lucide-react";

export default function ReportsPage() {
	const reports = [
		{ id: "RPT-001", name: "Monthly Financial Summary", type: "Financial", period: "October 2024", generated: "2024-10-21", status: "ready", size: "2.4 MB" },
		{ id: "RPT-002", name: "Q3 Performance Report", type: "Performance", period: "Q3 2024", generated: "2024-10-15", status: "ready", size: "5.1 MB" },
		{ id: "RPT-003", name: "Tax Report 2024", type: "Tax", period: "2024", generated: "2024-10-10", status: "ready", size: "3.8 MB" },
		{ id: "RPT-004", name: "Client Revenue Analysis", type: "Analytics", period: "September 2024", generated: "2024-10-05", status: "ready", size: "1.9 MB" },
		{ id: "RPT-005", name: "Expense Breakdown", type: "Expense", period: "October 2024", generated: "2024-10-01", status: "ready", size: "1.2 MB" },
		{ id: "RPT-006", name: "Cash Flow Statement", type: "Financial", period: "September 2024", generated: "2024-09-28", status: "ready", size: "2.1 MB" },
	];

	const templates = [
		{ id: "TPL-001", name: "Monthly Financial Report", category: "Financial", frequency: "Monthly", lastRun: "2024-10-21" },
		{ id: "TPL-002", name: "Quarterly Performance", category: "Performance", frequency: "Quarterly", lastRun: "2024-10-15" },
		{ id: "TPL-003", name: "Annual Tax Report", category: "Tax", frequency: "Yearly", lastRun: "2024-10-10" },
		{ id: "TPL-004", name: "Weekly Cash Flow", category: "Financial", frequency: "Weekly", lastRun: "2024-10-20" },
	];

	return (
		<div className="space-y-8 p-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Reports</h1>
					<p className="text-muted-foreground">
						Generate and manage financial reports and analytics
					</p>
				</div>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					Create Report
				</Button>
			</div>

			{/* Quick Stats */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Total Reports</h3>
						<FileText className="h-5 w-5 text-blue-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">{reports.length}</div>
						<p className="text-xs text-muted-foreground mt-1">
							Available reports
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Templates</h3>
						<Calendar className="h-5 w-5 text-purple-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">{templates.length}</div>
						<p className="text-xs text-muted-foreground mt-1">
							Report templates
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">This Month</h3>
						<TrendingUp className="h-5 w-5 text-green-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">8</div>
						<p className="text-xs text-muted-foreground mt-1">
							Reports generated
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Scheduled</h3>
						<PieChart className="h-5 w-5 text-orange-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">12</div>
						<p className="text-xs text-muted-foreground mt-1">
							Automated reports
						</p>
					</div>
				</div>
			</div>

			{/* Report Templates */}
			<div className="rounded-lg border bg-card">
				<div className="p-6 border-b">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-semibold">Report Templates</h3>
							<p className="text-sm text-muted-foreground">Pre-configured report templates</p>
						</div>
						<Button variant="outline" size="sm">
							<Plus className="mr-2 h-4 w-4" />
							New Template
						</Button>
					</div>
				</div>

				<div className="p-6">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						{templates.map((template) => (
							<div key={template.id} className="rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
								<div className="flex items-start justify-between mb-3">
									<FileText className="h-5 w-5 text-blue-600" />
									<Badge variant="outline" className="text-xs">{template.frequency}</Badge>
								</div>
								<h4 className="font-semibold mb-1">{template.name}</h4>
								<p className="text-xs text-muted-foreground mb-3">{template.category}</p>
								<div className="flex items-center justify-between text-xs text-muted-foreground">
									<span>Last run:</span>
									<span>{template.lastRun}</span>
								</div>
								<Button variant="outline" size="sm" className="w-full mt-3">
									Generate Now
								</Button>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Recent Reports */}
			<div className="rounded-lg border bg-card">
				<div className="p-6 border-b">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-semibold">Recent Reports</h3>
							<p className="text-sm text-muted-foreground">Your latest generated reports</p>
						</div>
						<Button variant="outline" size="sm">
							View All
						</Button>
					</div>
					<div className="mt-4">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search reports..."
								className="pl-10"
							/>
						</div>
					</div>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="border-b bg-muted/50">
							<tr>
								<th className="text-left p-4 font-medium text-sm">Report ID</th>
								<th className="text-left p-4 font-medium text-sm">Name</th>
								<th className="text-left p-4 font-medium text-sm">Type</th>
								<th className="text-left p-4 font-medium text-sm">Period</th>
								<th className="text-left p-4 font-medium text-sm">Generated</th>
								<th className="text-left p-4 font-medium text-sm">Size</th>
								<th className="text-left p-4 font-medium text-sm">Status</th>
								<th className="text-left p-4 font-medium text-sm">Actions</th>
							</tr>
						</thead>
						<tbody>
							{reports.map((report) => (
								<tr key={report.id} className="border-b hover:bg-muted/50 transition-colors">
									<td className="p-4 font-mono text-sm">{report.id}</td>
									<td className="p-4 font-medium">{report.name}</td>
									<td className="p-4 text-sm">
										<Badge variant="outline" className="text-xs">
											{report.type}
										</Badge>
									</td>
									<td className="p-4 text-sm">{report.period}</td>
									<td className="p-4 text-sm">{report.generated}</td>
									<td className="p-4 text-sm text-muted-foreground">{report.size}</td>
									<td className="p-4">
										<Badge variant="default" className="text-xs">
											{report.status}
										</Badge>
									</td>
									<td className="p-4">
										<div className="flex items-center gap-2">
											<Button variant="ghost" size="sm">View</Button>
											<Button variant="ghost" size="sm">
												<Download className="h-4 w-4" />
											</Button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Report Categories */}
			<div className="grid gap-6 lg:grid-cols-3">
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">By Category</h3>
						<p className="text-sm text-muted-foreground">Report distribution</p>
					</div>
					<div className="p-6 space-y-3">
						{[
							{ category: "Financial", count: 2, color: "bg-blue-600" },
							{ category: "Performance", count: 1, color: "bg-purple-600" },
							{ category: "Tax", count: 1, color: "bg-green-600" },
							{ category: "Analytics", count: 1, color: "bg-orange-600" },
							{ category: "Expense", count: 1, color: "bg-red-600" },
						].map((cat) => (
							<div key={cat.category} className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className={`h-3 w-3 rounded-full ${cat.color}`}></div>
									<span className="text-sm font-medium">{cat.category}</span>
								</div>
								<span className="text-sm text-muted-foreground">{cat.count}</span>
							</div>
						))}
					</div>
				</div>

				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Scheduled Reports</h3>
						<p className="text-sm text-muted-foreground">Upcoming automated reports</p>
					</div>
					<div className="p-6 space-y-3">
						{[
							{ name: "Weekly Cash Flow", next: "Oct 28", frequency: "Weekly" },
							{ name: "Monthly Financial", next: "Nov 1", frequency: "Monthly" },
							{ name: "Quarterly Performance", next: "Jan 1", frequency: "Quarterly" },
						].map((scheduled, index) => (
							<div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
								<div>
									<p className="font-medium text-sm">{scheduled.name}</p>
									<p className="text-xs text-muted-foreground">{scheduled.frequency}</p>
								</div>
								<Badge variant="outline" className="text-xs">
									{scheduled.next}
								</Badge>
							</div>
						))}
					</div>
				</div>

				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Quick Actions</h3>
						<p className="text-sm text-muted-foreground">Common report tasks</p>
					</div>
					<div className="p-6 space-y-2">
						<Button variant="outline" className="w-full justify-start">
							<FileText className="mr-2 h-4 w-4" />
							Monthly Summary
						</Button>
						<Button variant="outline" className="w-full justify-start">
							<TrendingUp className="mr-2 h-4 w-4" />
							Performance Report
						</Button>
						<Button variant="outline" className="w-full justify-start">
							<PieChart className="mr-2 h-4 w-4" />
							Expense Analysis
						</Button>
						<Button variant="outline" className="w-full justify-start">
							<Calendar className="mr-2 h-4 w-4" />
							Custom Report
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

