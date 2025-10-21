import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle } from "lucide-react";
import { useState } from "react";
import StatisticsCard5 from "./statistics-card-5";

// Sample data for different scenarios
const demoScenarios = {
	portfolio: {
		balance: 10976.95,
		delta: 5.7,
		currencies: [
			{
				code: "USD",
				percent: 30,
				color: "bg-gradient-to-r from-white to-gray-200",
				amount: 3293.09,
			},
			{
				code: "GBP",
				percent: 20,
				color: "bg-gradient-to-r from-indigo-400 to-indigo-500",
				amount: 2195.39,
			},
			{
				code: "EUR",
				percent: 15,
				color: "bg-gradient-to-r from-blue-500 to-blue-600",
				amount: 1646.54,
			},
			{
				code: "JPY",
				percent: 20,
				color: "bg-gradient-to-r from-violet-600 to-violet-700",
				amount: 2195.39,
			},
			{
				code: "CNY",
				percent: 15,
				color: "bg-gradient-to-r from-fuchsia-600 to-fuchsia-700",
				amount: 1646.54,
			},
		],
	},
	crypto: {
		balance: 2847.32,
		delta: -2.4,
		currencies: [
			{
				code: "BTC",
				percent: 45,
				color: "bg-gradient-to-r from-orange-400 to-orange-600",
				amount: 1281.29,
			},
			{
				code: "ETH",
				percent: 35,
				color: "bg-gradient-to-r from-blue-400 to-blue-600",
				amount: 996.56,
			},
			{
				code: "ADA",
				percent: 10,
				color: "bg-gradient-to-r from-cyan-400 to-cyan-600",
				amount: 284.73,
			},
			{
				code: "DOT",
				percent: 10,
				color: "bg-gradient-to-r from-pink-400 to-pink-600",
				amount: 284.73,
			},
		],
	},
	savings: {
		balance: 25643.87,
		delta: 12.3,
		currencies: [
			{
				code: "USD",
				percent: 60,
				color: "bg-gradient-to-r from-green-400 to-green-600",
				amount: 15386.32,
			},
			{
				code: "EUR",
				percent: 25,
				color: "bg-gradient-to-r from-emerald-400 to-emerald-600",
				amount: 6410.97,
			},
			{
				code: "GBP",
				percent: 15,
				color: "bg-gradient-to-r from-teal-400 to-teal-600",
				amount: 3846.58,
			},
		],
	},
	investments: {
		balance: 45231.67,
		delta: 8.9,
		currencies: [
			{
				code: "AAPL",
				percent: 25,
				color: "bg-gradient-to-r from-gray-400 to-gray-600",
				amount: 11307.92,
			},
			{
				code: "MSFT",
				percent: 20,
				color: "bg-gradient-to-r from-blue-500 to-blue-700",
				amount: 9046.33,
			},
			{
				code: "GOOGL",
				percent: 18,
				color: "bg-gradient-to-r from-red-400 to-red-600",
				amount: 8141.7,
			},
			{
				code: "AMZN",
				percent: 17,
				color: "bg-gradient-to-r from-yellow-400 to-yellow-600",
				amount: 7689.38,
			},
			{
				code: "TSLA",
				percent: 20,
				color: "bg-gradient-to-r from-slate-400 to-slate-600",
				amount: 9046.33,
			},
		],
	},
};

export default function StatisticsCardDemo() {
	const [selectedScenario, setSelectedScenario] =
		useState<keyof typeof demoScenarios>("portfolio");
	const [showAnimations, setShowAnimations] = useState(true);
	const [showDetails, setShowDetails] = useState(true);

	const currentData = demoScenarios[selectedScenario];

	return (
		<div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 p-6">
			<div className="max-w-7xl mx-auto space-y-8">
				{/* Header */}
				<div className="text-center space-y-4">
					<div className="inline-flex items-center gap-2 bg-gradient-to-r from-zinc-800 to-zinc-900 text-white px-4 py-2 rounded-full text-sm font-medium">
						<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
						Enhanced Statistics Card Demo
					</div>
					<h1 className="text-4xl font-bold bg-gradient-to-r from-zinc-800 to-zinc-600 bg-clip-text text-transparent">
						Interactive Financial Dashboard
					</h1>
					<p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
						Experience our beautifully animated statistics card with hover
						effects, tooltips, and customizable data visualization.
					</p>
				</div>

				<div className="grid lg:grid-cols-3 gap-8">
					{/* Controls Panel */}
					<Card className="lg:col-span-1">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<div className="w-2 h-2 bg-blue-400 rounded-full" />
								Customization Panel
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Scenario Selection */}
							<div className="space-y-3">
								<Label className="text-sm font-medium">Data Scenario</Label>
								<Select
									value={selectedScenario}
									onValueChange={(value) =>
										setSelectedScenario(value as keyof typeof demoScenarios)
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="portfolio">
											Investment Portfolio
										</SelectItem>
										<SelectItem value="crypto">
											Cryptocurrency Holdings
										</SelectItem>
										<SelectItem value="savings">Savings Accounts</SelectItem>
										<SelectItem value="investments">
											Stock Investments
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<Separator />

							{/* Feature Toggles */}
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<Label htmlFor="animations" className="text-sm font-medium">
										Enable Animations
									</Label>
									<Switch
										id="animations"
										checked={showAnimations}
										onCheckedChange={setShowAnimations}
									/>
								</div>

								<div className="flex items-center justify-between">
									<Label htmlFor="details" className="text-sm font-medium">
										Show Details
									</Label>
									<Switch
										id="details"
										checked={showDetails}
										onCheckedChange={setShowDetails}
									/>
								</div>
							</div>

							<Separator />

							{/* Current Data Preview */}
							<div className="space-y-3">
								<Label className="text-sm font-medium">Current Data</Label>
								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span className="text-zinc-600 dark:text-zinc-400">
											Balance:
										</span>
										<span className="font-medium">
											${currentData.balance.toLocaleString()}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-zinc-600 dark:text-zinc-400">
											Change:
										</span>
										<Badge
											variant={
												currentData.delta >= 0 ? "success" : "destructive"
											}
											className="text-xs"
										>
											{currentData.delta >= 0 ? "+" : ""}
											{currentData.delta}%
										</Badge>
									</div>
									<div className="flex justify-between">
										<span className="text-zinc-600 dark:text-zinc-400">
											Assets:
										</span>
										<span className="font-medium">
											{currentData.currencies.length} currencies
										</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Main Demo */}
					<Card className="lg:col-span-2">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
								Live Preview
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex justify-center">
								<StatisticsCard5
									data={currentData}
									animated={showAnimations}
									showDetails={showDetails}
									className="w-full max-w-lg"
								/>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Feature Highlights */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<div className="w-2 h-2 bg-purple-400 rounded-full" />
							Interactive Features
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
							<div className="text-center space-y-2">
								<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto">
									<div className="w-6 h-6 bg-white rounded-full animate-pulse" />
								</div>
								<h3 className="font-medium">Smooth Animations</h3>
								<p className="text-sm text-zinc-600 dark:text-zinc-400">
									Staggered entrance animations with hover effects
								</p>
							</div>

							<div className="text-center space-y-2">
								<div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto">
									<div className="w-6 h-6 bg-white rounded-full" />
								</div>
								<h3 className="font-medium">Interactive Tooltips</h3>
								<p className="text-sm text-zinc-600 dark:text-zinc-400">
									Hover over segments to see detailed amounts
								</p>
							</div>

							<div className="text-center space-y-2">
								<div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto">
									<div className="w-6 h-6 bg-white rounded-full animate-bounce" />
								</div>
								<h3 className="font-medium">Privacy Toggle</h3>
								<p className="text-sm text-zinc-600 dark:text-zinc-400">
									Hide/show balance with eye icon for privacy
								</p>
							</div>

							<div className="text-center space-y-2">
								<div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto">
									<div className="w-6 h-6 bg-white rounded-full" />
								</div>
								<h3 className="font-medium">Responsive Design</h3>
								<p className="text-sm text-zinc-600 dark:text-zinc-400">
									Works perfectly on all screen sizes
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Usage Examples */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<div className="w-2 h-2 bg-indigo-400 rounded-full" />
							Usage Examples
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Tabs defaultValue="basic" className="w-full">
							<TabsList className="grid w-full grid-cols-3">
								<TabsTrigger value="basic">Basic Usage</TabsTrigger>
								<TabsTrigger value="custom">Custom Data</TabsTrigger>
								<TabsTrigger value="minimal">Minimal</TabsTrigger>
							</TabsList>

							<TabsContent value="basic" className="space-y-4">
								<div className="bg-zinc-900 text-zinc-100 p-4 rounded-lg">
									<pre className="text-sm overflow-x-auto">
										{`import StatisticsCard5 from '@/components/ui/statistics-card-5';

export default function Dashboard() {
  return (
    <StatisticsCard5
      animated={true}
      showDetails={true}
    />
  );
}`}
									</pre>
								</div>
							</TabsContent>

							<TabsContent value="custom" className="space-y-4">
								<div className="bg-zinc-900 text-zinc-100 p-4 rounded-lg">
									<pre className="text-sm overflow-x-auto">
										{`import StatisticsCard5 from '@/components/ui/statistics-card-5';

const customData = {
  balance: 50000,
  delta: 8.5,
  currencies: [
    { code: 'USD', percent: 40, color: 'bg-blue-500', amount: 20000 },
    { code: 'EUR', percent: 35, color: 'bg-green-500', amount: 17500 },
    { code: 'BTC', percent: 25, color: 'bg-orange-500', amount: 12500 },
  ],
};

export default function Portfolio() {
  return (
    <StatisticsCard5
      data={customData}
      animated={true}
      showDetails={true}
    />
  );
}`}
									</pre>
								</div>
							</TabsContent>

							<TabsContent value="minimal" className="space-y-4">
								<div className="bg-zinc-900 text-zinc-100 p-4 rounded-lg">
									<pre className="text-sm overflow-x-auto">
										{`import StatisticsCard5 from '@/components/ui/statistics-card-5';

export default function SimpleView() {
  return (
    <StatisticsCard5
      animated={false}
      showDetails={false}
    />
  );
}`}
									</pre>
								</div>
							</TabsContent>
						</Tabs>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
