import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	AlertTriangle,
	BarChart3,
	Calendar,
	CheckCircle,
	PieChart,
	Plus,
	Settings,
	Target,
	TrendingDown,
	TrendingUp
} from "lucide-react";

export const metadata: Metadata = {
	title: "Budget Management | Financbase",
	description: "Create, track, and manage your business budgets with AI-powered insights",
};

const budgetCategories = [
	{
		name: "Marketing",
		budgeted: 15000,
		spent: 12500,
		remaining: 2500,
		percentage: 83,
		status: "warning",
		trend: "up",
		transactions: 45,
	},
	{
		name: "Operations",
		budgeted: 25000,
		spent: 18000,
		remaining: 7000,
		percentage: 72,
		status: "good",
		trend: "down",
		transactions: 128,
	},
	{
		name: "Development",
		budgeted: 30000,
		spent: 22000,
		remaining: 8000,
		percentage: 73,
		status: "good",
		trend: "stable",
		transactions: 67,
	},
	{
		name: "Office Expenses",
		budgeted: 8000,
		spent: 9500,
		remaining: -1500,
		percentage: 119,
		status: "over",
		trend: "up",
		transactions: 34,
	},
];

const budgetAlerts = [
	{
		type: "warning",
		message: "Marketing budget is 83% utilized. Consider reducing spend or increasing budget.",
		action: "Adjust Budget",
	},
	{
		type: "success",
		message: "Operations budget is on track with 28% remaining.",
		action: null,
	},
	{
		type: "danger",
		message: "Office expenses exceeded budget by $1,500. Review spending patterns.",
		action: "Review Expenses",
	},
];

export default function BudgetsPage() {
	const totalBudgeted = budgetCategories.reduce((sum, cat) => sum + cat.budgeted, 0);
	const totalSpent = budgetCategories.reduce((sum, cat) => sum + cat.spent, 0);
	const totalRemaining = totalBudgeted - totalSpent;
	const overallPercentage = Math.round((totalSpent / totalBudgeted) * 100);

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">Budget Management</h1>
					<p className="text-muted-foreground">
						Track and manage your business budgets with AI-powered insights and forecasting
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button>
						<Plus className="h-4 w-4 mr-2" />
						Create Budget
					</Button>
					<Button variant="outline">
						<Settings className="h-4 w-4 mr-2" />
						Budget Settings
					</Button>
				</div>
			</div>

			{/* Overview Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Budget</CardTitle>
						<Target className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">${totalBudgeted.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground">Monthly allocation</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Spent</CardTitle>
						<TrendingDown className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground">
							{overallPercentage}% of budget
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Remaining</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
							${Math.abs(totalRemaining).toLocaleString()}
						</div>
						<p className="text-xs text-muted-foreground">
							{totalRemaining >= 0 ? 'Under budget' : 'Over budget'}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Budgets</CardTitle>
						<BarChart3 className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{budgetCategories.length}</div>
						<p className="text-xs text-muted-foreground">Categories tracked</p>
					</CardContent>
				</Card>
			</div>

			{/* Budget Alerts */}
			{budgetAlerts.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<AlertTriangle className="h-5 w-5" />
							Budget Alerts
						</CardTitle>
						<CardDescription>
							Important notifications about your budget status
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{budgetAlerts.map((alert, index) => (
							<div key={`${alert.type}-${alert.message}`} className="flex items-center justify-between p-3 rounded-lg border">
								<div className="flex items-center gap-3">
									{alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
									{alert.type === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
									{alert.type === 'danger' && <AlertTriangle className="h-4 w-4 text-red-500" />}
									<span className="text-sm">{alert.message}</span>
								</div>
								{alert.action && (
									<Button variant="outline" size="sm">
										{alert.action}
									</Button>
								)}
							</div>
						))}
					</CardContent>
				</Card>
			)}

			{/* Budget Categories */}
			<Tabs defaultValue="overview" className="space-y-4">
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="categories">Categories</TabsTrigger>
					<TabsTrigger value="forecast">Forecast</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						{budgetCategories.map((category, index) => (
							<Card key={category.name}>
								<CardHeader className="pb-3">
									<div className="flex items-center justify-between">
										<CardTitle className="text-lg">{category.name}</CardTitle>
										<div className="flex items-center gap-2">
											{category.trend === 'up' && <TrendingUp className="h-4 w-4 text-red-500" />}
											{category.trend === 'down' && <TrendingDown className="h-4 w-4 text-green-500" />}
											{category.trend === 'stable' && <Target className="h-4 w-4 text-blue-500" />}
											<Badge variant={
												category.status === 'good' ? 'default' :
												category.status === 'warning' ? 'secondary' :
												'destructive'
											}>
												{category.status === 'good' ? 'On Track' :
												 category.status === 'warning' ? 'Warning' :
												 'Over Budget'}
											</Badge>
										</div>
									</div>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-2">
										<div className="flex items-center justify-between text-sm">
											<span>Progress</span>
											<span className="font-medium">{category.percentage}%</span>
										</div>
										<Progress value={Math.min(category.percentage, 100)} className="h-2" />
									</div>
									<div className="grid grid-cols-3 gap-4 text-sm">
										<div>
											<p className="text-muted-foreground">Budgeted</p>
											<p className="font-medium">${category.budgeted.toLocaleString()}</p>
										</div>
										<div>
											<p className="text-muted-foreground">Spent</p>
											<p className="font-medium">${category.spent.toLocaleString()}</p>
										</div>
										<div>
											<p className="text-muted-foreground">Remaining</p>
											<p className={`font-medium ${category.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
												{category.remaining >= 0 ? '+' : ''}${category.remaining.toLocaleString()}
											</p>
										</div>
									</div>
									<div className="flex items-center justify-between pt-2 border-t">
										<span className="text-sm text-muted-foreground">
											{category.transactions} transactions
										</span>
										<Button variant="ghost" size="sm">
											View Details
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</TabsContent>

				<TabsContent value="categories" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Budget Categories</CardTitle>
							<CardDescription>
								Manage and configure your budget categories
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{budgetCategories.map((category, index) => (
									<div key={category.name} className="flex items-center justify-between p-4 border rounded-lg">
										<div className="space-y-1">
											<h4 className="font-medium">{category.name}</h4>
											<p className="text-sm text-muted-foreground">
												{category.transactions} transactions • {category.percentage}% utilized
											</p>
										</div>
										<div className="flex items-center gap-2">
											<div className="text-right text-sm">
												<p className="font-medium">${category.spent.toLocaleString()}</p>
												<p className="text-muted-foreground">of ${category.budgeted.toLocaleString()}</p>
											</div>
											<Button variant="outline" size="sm">
												Edit
											</Button>
										</div>
									</div>
								))}
								<Separator />
								<Button className="w-full" variant="outline">
									<Plus className="h-4 w-4 mr-2" />
									Add Budget Category
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="forecast" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<PieChart className="h-5 w-5" />
									Spending Forecast
								</CardTitle>
								<CardDescription>
									AI-powered spending predictions for next month
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<span className="text-sm">Projected Total</span>
										<span className="font-medium">$68,000</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Current Trend</span>
										<span className="font-medium text-green-600">-5% below budget</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Risk Level</span>
										<Badge variant="secondary">Low</Badge>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Calendar className="h-5 w-5" />
									Monthly Trends
								</CardTitle>
								<CardDescription>
									Budget performance over the last 6 months
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-2 text-sm">
									<div className="flex items-center justify-between">
										<span>Oct 2025</span>
										<span className="font-medium">78% utilized</span>
									</div>
									<div className="flex items-center justify-between">
										<span>Sep 2025</span>
										<span className="font-medium">82% utilized</span>
									</div>
									<div className="flex items-center justify-between">
										<span>Aug 2025</span>
										<span className="font-medium">75% utilized</span>
									</div>
									<div className="flex items-center justify-between">
										<span>Jul 2025</span>
										<span className="font-medium">85% utilized</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
