"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Plus,
	Search,
	MoreHorizontal,
	Receipt,
	DollarSign,
	Calendar,
	Tag
} from "lucide-react";
import { useState } from "react";

export default function ExpensesPage() {
	const [searchQuery, setSearchQuery] = useState("");

	// Sample expense data
	const expenses = [
		{
			id: "EXP-2024-001",
			description: "Office Supplies",
			amount: 250.00,
			category: "Office",
			date: "2024-12-15",
			vendor: "Office Depot",
			status: "Approved",
		},
		{
			id: "EXP-2024-002",
			description: "Software Licenses",
			amount: 899.99,
			category: "Software",
			date: "2024-12-14",
			vendor: "Adobe Inc",
			status: "Pending",
		},
		{
			id: "EXP-2024-003",
			description: "Cloud Hosting",
			amount: 150.00,
			category: "Utilities",
			date: "2024-12-13",
			vendor: "AWS",
			status: "Approved",
		},
	];

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case "Approved":
				return "default";
			case "Pending":
				return "secondary";
			case "Rejected":
				return "destructive";
			default:
				return "outline";
		}
	};

	return (
		<div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
					<p className="text-muted-foreground">
						Track and manage your business expenses
					</p>
				</div>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					New Expense
				</Button>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Expenses
						</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">$1,299.99</div>
						<p className="text-xs text-muted-foreground">
							+8% from last month
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Pending Approval
						</CardTitle>
						<Receipt className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">1</div>
						<p className="text-xs text-muted-foreground">
							$899.99 awaiting review
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Approved This Month
						</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">$400.00</div>
						<p className="text-xs text-muted-foreground">
							2 expenses approved
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Top Category
						</CardTitle>
						<Tag className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">Software</div>
						<p className="text-xs text-muted-foreground">
							$899.99 this month
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Search and Filters */}
			<Card>
				<CardHeader>
					<CardTitle>All Expenses</CardTitle>
					<CardDescription>
						View and manage all your expenses
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center space-x-2 mb-4">
						<div className="flex-1">
							<Label htmlFor="search" className="sr-only">
								Search
							</Label>
							<div className="relative">
								<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									id="search"
									placeholder="Search expenses..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-8"
								/>
							</div>
						</div>
					</div>

					{/* Expenses Table */}
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Expense #</TableHead>
									<TableHead>Description</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Amount</TableHead>
									<TableHead>Vendor</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Date</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{expenses.map((expense) => (
									<TableRow key={expense.id}>
										<TableCell className="font-medium">
											{expense.id}
										</TableCell>
										<TableCell>{expense.description}</TableCell>
										<TableCell>{expense.category}</TableCell>
										<TableCell>${expense.amount.toLocaleString()}</TableCell>
										<TableCell>{expense.vendor}</TableCell>
										<TableCell>
											<Badge variant={getStatusBadgeVariant(expense.status)}>
												{expense.status}
											</Badge>
										</TableCell>
										<TableCell>{expense.date}</TableCell>
										<TableCell className="text-right">
											<Button variant="ghost" size="icon">
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
