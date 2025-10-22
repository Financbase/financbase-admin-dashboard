import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Briefcase, Clock, DollarSign, Users } from "lucide-react";

export default function FreelancePage() {
	const projects = [
		{ id: "PRJ-001", name: "Website Redesign", client: "Acme Corp", status: "in-progress", budget: 12000, spent: 8400, deadline: "2024-11-15", hoursLogged: 84, progress: 70 },
		{ id: "PRJ-002", name: "Mobile App Development", client: "TechStart Inc", status: "in-progress", budget: 25000, spent: 18750, deadline: "2024-12-20", hoursLogged: 187, progress: 75 },
		{ id: "PRJ-003", name: "Brand Identity Design", client: "Creative Studios", status: "completed", budget: 8000, spent: 7500, deadline: "2024-10-30", hoursLogged: 75, progress: 100 },
		{ id: "PRJ-004", name: "E-commerce Platform", client: "Global Industries", status: "planning", budget: 45000, spent: 0, deadline: "2025-02-28", hoursLogged: 0, progress: 5 },
		{ id: "PRJ-005", name: "Marketing Campaign", client: "Innovation Corp", status: "in-progress", budget: 15000, spent: 4500, deadline: "2024-11-30", hoursLogged: 45, progress: 30 },
	];

	const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
	const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
	const totalHours = projects.reduce((sum, p) => sum + p.hoursLogged, 0);
	const activeProjects = projects.filter(p => p.status === 'in-progress').length;

	return (
		<div className="space-y-8 p-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Freelance Hub</h1>
					<p className="text-muted-foreground">
						Manage your freelance projects, clients, and billing
					</p>
				</div>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					New Project
				</Button>
			</div>

			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Active Projects</h3>
						<Briefcase className="h-5 w-5 text-blue-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">{activeProjects}</div>
						<p className="text-xs text-muted-foreground mt-1">
							Out of {projects.length} total projects
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Total Budget</h3>
						<DollarSign className="h-5 w-5 text-green-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground mt-1">
							${totalSpent.toLocaleString()} spent ({((totalSpent/totalBudget)*100).toFixed(1)}%)
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Hours Logged</h3>
						<Clock className="h-5 w-5 text-purple-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">{totalHours}h</div>
						<p className="text-xs text-muted-foreground mt-1">
							Across all projects
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Clients</h3>
						<Users className="h-5 w-5 text-orange-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">{new Set(projects.map(p => p.client)).size}</div>
						<p className="text-xs text-muted-foreground mt-1">
							Active relationships
						</p>
					</div>
				</div>
			</div>

			{/* Projects Table */}
			<div className="rounded-lg border bg-card">
				<div className="p-6 border-b">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-semibold">All Projects</h3>
							<p className="text-sm text-muted-foreground">Track and manage your freelance work</p>
						</div>
						<div className="flex items-center gap-2">
							<Button variant="outline" size="sm">Filter</Button>
							<Button variant="outline" size="sm">Export</Button>
						</div>
					</div>
					<div className="mt-4">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search projects..."
								className="pl-10"
							/>
						</div>
					</div>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="border-b bg-muted/50">
							<tr>
								<th className="text-left p-4 font-medium text-sm">Project ID</th>
								<th className="text-left p-4 font-medium text-sm">Name</th>
								<th className="text-left p-4 font-medium text-sm">Client</th>
								<th className="text-left p-4 font-medium text-sm">Budget</th>
								<th className="text-left p-4 font-medium text-sm">Spent</th>
								<th className="text-left p-4 font-medium text-sm">Hours</th>
								<th className="text-left p-4 font-medium text-sm">Deadline</th>
								<th className="text-left p-4 font-medium text-sm">Progress</th>
								<th className="text-left p-4 font-medium text-sm">Status</th>
								<th className="text-left p-4 font-medium text-sm">Actions</th>
							</tr>
						</thead>
						<tbody>
							{projects.map((project) => (
								<tr key={project.id} className="border-b hover:bg-muted/50 transition-colors">
									<td className="p-4 font-mono text-sm">{project.id}</td>
									<td className="p-4 font-medium">{project.name}</td>
									<td className="p-4 text-sm">{project.client}</td>
									<td className="p-4 text-sm">${project.budget.toLocaleString()}</td>
									<td className="p-4 text-sm">${project.spent.toLocaleString()}</td>
									<td className="p-4 text-sm">{project.hoursLogged}h</td>
									<td className="p-4 text-sm">{project.deadline}</td>
									<td className="p-4">
										<div className="flex items-center gap-2">
											<div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[100px]">
												<div 
													className={`h-full rounded-full ${
														project.progress >= 75 ? 'bg-green-600' : 
														project.progress >= 50 ? 'bg-blue-600' : 
														'bg-yellow-600'
													}`}
													style={{ width: `${project.progress}%` }}
												></div>
											</div>
											<span className="text-sm font-medium">{project.progress}%</span>
										</div>
									</td>
									<td className="p-4">
										<Badge 
											variant={
												project.status === 'completed' ? 'default' : 
												project.status === 'in-progress' ? 'secondary' : 
												'outline'
											}
											className="text-xs"
										>
											{project.status}
										</Badge>
									</td>
									<td className="p-4">
										<Button variant="ghost" size="sm">View</Button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Quick Stats */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Recent Activity */}
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Recent Activity</h3>
						<p className="text-sm text-muted-foreground">Latest updates across projects</p>
					</div>
					<div className="p-6 space-y-3">
						{[
							{ project: "Website Redesign", activity: "Logged 8 hours", time: "2 hours ago", type: "time" },
							{ project: "Mobile App Development", activity: "Client feedback received", time: "5 hours ago", type: "update" },
							{ project: "Brand Identity Design", activity: "Project completed", time: "1 day ago", type: "milestone" },
							{ project: "E-commerce Platform", activity: "Proposal sent to client", time: "2 days ago", type: "update" },
						].map((activity, index) => (
							<div key={index} className="flex items-center justify-between p-3 rounded-lg border">
								<div>
									<p className="font-medium text-sm">{activity.project}</p>
									<p className="text-xs text-muted-foreground">{activity.activity}</p>
								</div>
								<div className="text-right">
									<Badge variant="outline" className="text-xs">{activity.type}</Badge>
									<p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Upcoming Deadlines */}
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Upcoming Deadlines</h3>
						<p className="text-sm text-muted-foreground">Projects requiring attention</p>
					</div>
					<div className="p-6 space-y-3">
						{projects
							.filter(p => p.status !== 'completed')
							.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
							.map((project) => {
								const daysUntil = Math.ceil((new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
								return (
									<div key={project.id} className="flex items-center justify-between p-3 rounded-lg border">
										<div>
											<p className="font-medium text-sm">{project.name}</p>
											<p className="text-xs text-muted-foreground">{project.client}</p>
										</div>
										<div className="text-right">
											<p className="text-sm font-medium">{project.deadline}</p>
											<Badge 
												variant={daysUntil < 7 ? 'destructive' : daysUntil < 30 ? 'secondary' : 'outline'}
												className="text-xs mt-1"
											>
												{daysUntil} days
											</Badge>
										</div>
									</div>
								);
							})}
					</div>
				</div>
			</div>
		</div>
	);
}

