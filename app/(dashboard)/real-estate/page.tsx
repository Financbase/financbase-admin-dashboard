"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Building2,
	TrendingUp,
	MapPin,
	DollarSign,
	Home,
	Users,
	Calculator
} from "lucide-react";

export default function RealEstatePage() {
	return (
		<div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
			<div className="flex items-center justify-between space-y-2">
				<div>
					<h2 className="text-3xl font-bold tracking-tight">
						Real Estate Platform
					</h2>
					<p className="text-muted-foreground">
						Property management and investment analytics
					</p>
				</div>
				<Button>
					<Home className="mr-2 h-4 w-4" />
					Add Property
				</Button>
			</div>

			{/* Key Metrics Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Properties
						</CardTitle>
						<Building2 className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">24</div>
						<p className="text-xs text-muted-foreground">
							+3 new this quarter
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Portfolio Value
						</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">$2.4M</div>
						<p className="text-xs text-muted-foreground">
							+12% from last quarter
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Monthly Rental Income
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">$18,750</div>
						<p className="text-xs text-muted-foreground">
							96% occupancy rate
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							ROI Average
						</CardTitle>
						<Calculator className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">8.5%</div>
						<p className="text-xs text-muted-foreground">
							Above market average
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Properties Overview */}
			<Card>
				<CardHeader>
					<CardTitle>Property Portfolio</CardTitle>
					<CardDescription>
						Manage your real estate investments and track performance
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="text-center py-8">
							<p className="text-gray-500">Property portfolio management integration ready for implementation</p>
							<Button className="mt-4">View Integration Guide</Button>
						</div>
					</div>
					<Button variant="outline" className="w-full mt-4">
						View All Properties
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
