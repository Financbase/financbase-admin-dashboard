"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Plus,
	Save,
	Download,
	Share,
	Settings,
	Grid,
	BarChart3,
	PieChart,
	TrendingUp,
	Table,
	Type,
	Calendar,
	Users,
	DollarSign,
	Target,
	Move,
	Copy,
	Trash2,
	Edit,
	Layout,
	Filter,
	RefreshCw,
} from "lucide-react";
import { InteractiveChart } from "./advanced-charts";

interface Widget {
	id: string;
	type: "chart" | "kpi" | "table" | "text" | "filter";
	title: string;
	config: any;
	position: { x: number; y: number; w: number; h: number };
	data?: any;
}

interface ReportTemplate {
	id: string;
	name: string;
	description: string;
	category: string;
	widgets: Widget[];
	isPublic: boolean;
	createdBy: string;
}

interface ReportConfig {
	name: string;
	description: string;
	category: string;
	isPublic: boolean;
	isTemplate: boolean;
	filters: any[];
	layout: "grid" | "masonry" | "single";
	refreshInterval?: number;
}

const WIDGET_TYPES = [
	{
		type: "chart",
		name: "Chart",
		icon: BarChart3,
		description: "Visualize data with charts",
		subtypes: ["line", "bar", "area", "pie", "composed"],
	},
	{
		type: "kpi",
		name: "KPI Card",
		icon: Target,
		description: "Display key performance indicators",
		subtypes: ["metric", "percentage", "currency", "number"],
	},
	{
		type: "table",
		name: "Data Table",
		icon: Table,
		description: "Show tabular data",
		subtypes: ["transactions", "clients", "invoices", "expenses"],
	},
	{
		type: "text",
		name: "Text Block",
		icon: Type,
		description: "Add text and descriptions",
		subtypes: ["heading", "paragraph", "note"],
	},
	{
		type: "filter",
		name: "Filters",
		icon: Filter,
		description: "Add data filters",
		subtypes: ["date_range", "category", "status", "client"],
	},
];

const CHART_TEMPLATES = [
	{
		name: "Revenue Trend",
		type: "line",
		data: [
			{ month: "Jan", revenue: 4000 },
			{ month: "Feb", revenue: 3000 },
			{ month: "Mar", revenue: 5000 },
			{ month: "Apr", revenue: 4500 },
			{ month: "May", revenue: 6000 },
			{ month: "Jun", revenue: 5500 },
		],
	},
	{
		name: "Expense Breakdown",
		type: "pie",
		data: [
			{ category: "Marketing", amount: 2000 },
			{ category: "Operations", amount: 1500 },
			{ category: "Software", amount: 800 },
			{ category: "Office", amount: 500 },
		],
	},
	{
		name: "Client Performance",
		type: "bar",
		data: [
			{ client: "Client A", revenue: 15000 },
			{ client: "Client B", revenue: 12000 },
			{ client: "Client C", revenue: 10000 },
			{ client: "Client D", revenue: 8000 },
		],
	},
];

export function ReportBuilder() {
	const [currentReport, setCurrentReport] = useState<ReportConfig>({
		name: "",
		description: "",
		category: "",
		isPublic: false,
		isTemplate: false,
		filters: [],
		layout: "grid",
	});
	const [widgets, setWidgets] = useState<Widget[]>([]);
	const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
	const [isPreviewMode, setIsPreviewMode] = useState(false);
	const [showWidgetLibrary, setShowWidgetLibrary] = useState(true);
	const [templates, setTemplates] = useState<ReportTemplate[]>([]);

	const addWidget = useCallback((widgetType: string, subtype?: string) => {
		const newWidget: Widget = {
			id: `widget-${Date.now()}`,
			type: widgetType as any,
			title: `${widgetType.charAt(0).toUpperCase() + widgetType.slice(1)} Widget`,
			config: {
				chartType: subtype || "line",
				dataSource: "revenue",
				period: "12m",
				...getDefaultConfig(widgetType),
			},
			position: {
				x: (widgets.length % 3) * 4,
				y: Math.floor(widgets.length / 3) * 3,
				w: 4,
				h: 3,
			},
			data: getSampleData(widgetType, subtype),
		};

		setWidgets((prev) => [...prev, newWidget]);
		setSelectedWidget(newWidget.id);
	}, [widgets.length]);

	const updateWidget = useCallback((widgetId: string, updates: Partial<Widget>) => {
		setWidgets((prev) =>
			prev.map((widget) =>
				widget.id === widgetId ? { ...widget, ...updates } : widget
			)
		);
	}, []);

	const deleteWidget = useCallback((widgetId: string) => {
		setWidgets((prev) => prev.filter((widget) => widget.id !== widgetId));
		if (selectedWidget === widgetId) {
			setSelectedWidget(null);
		}
	}, [selectedWidget]);

	const duplicateWidget = useCallback((widgetId: string) => {
		const widget = widgets.find((w) => w.id === widgetId);
		if (widget) {
			const newWidget: Widget = {
				...widget,
				id: `widget-${Date.now()}`,
				title: `${widget.title} (Copy)`,
				position: {
					...widget.position,
					x: widget.position.x + 1,
					y: widget.position.y + 1,
				},
			};
			setWidgets((prev) => [...prev, newWidget]);
			setSelectedWidget(newWidget.id);
		}
	}, [widgets]);

	const saveReport = useCallback(async () => {
		try {
			const response = await fetch('/api/reports', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: currentReport.name || 'Untitled Report',
					description: currentReport.description || '',
					type: 'custom',
					config: {
						dateRange: currentReport.filters?.dateRange,
						filters: currentReport.filters,
						widgets: widgets.map(w => ({
							id: w.id,
							type: w.type,
							config: w.config,
							position: w.position,
						})),
					},
					visualizationType: currentReport.layout,
					chartConfig: {},
					isPublic: currentReport.isPublic,
					isFavorite: false,
					tags: [],
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to save report');
			}

			const savedReport = await response.json();
			console.log("Report saved:", savedReport);
			// You might want to show a toast notification here
		} catch (error) {
			console.error('Error saving report:', error);
			// You might want to show an error toast here
		}
	}, [currentReport, widgets]);

	const exportReport = useCallback(async (format: 'csv' | 'excel' | 'pdf' | 'json') => {
		try {
			// Extract data from widgets for export
			const exportData = widgets.map(widget => {
				const data = widget.data || [];
				if (Array.isArray(data)) {
					return data;
				}
				return [];
			}).flat();

			if (exportData.length === 0) {
				console.warn('No data to export');
				return;
			}

			// Use the ReportExecutionService for export
			const response = await fetch('/api/reports/export', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					data: exportData,
					format,
					reportName: currentReport.name || 'report',
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to export report');
			}

			const blob = await response.blob();
			// Security: blob: URLs from createObjectURL are safe - generated by browser, not user input
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${currentReport.name || 'report'}.${format}`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		} catch (error) {
			console.error(`Error exporting report as ${format}:`, error);
		}
	}, [currentReport, widgets]);

	const loadTemplate = useCallback((template: ReportTemplate) => {
		setWidgets(template.widgets);
		setCurrentReport({
			name: template.name,
			description: template.description,
			category: template.category,
			isPublic: template.isPublic,
			isTemplate: false,
			filters: [],
			layout: "grid",
		});
	}, []);

	const getDefaultConfig = (type: string) => {
		switch (type) {
			case "chart":
				return {
					chartType: "line",
					showLegend: true,
					showGrid: true,
					showTooltip: true,
				};
			case "kpi":
				return {
					format: "currency",
					showTrend: true,
					showComparison: true,
				};
			case "table":
				return {
					showHeaders: true,
					sortable: true,
					pagination: true,
				};
			case "text":
				return {
					fontSize: "medium",
					fontWeight: "normal",
					textAlign: "left",
				};
			case "filter":
				return {
					multiSelect: false,
					showAll: true,
					defaultValue: "all",
				};
			default:
				return {};
		}
	};

	const getSampleData = (type: string, subtype?: string) => {
		const template = CHART_TEMPLATES.find((t) => t.type === subtype);
		return template?.data || [];
	};

	const renderWidget = (widget: Widget) => {
		switch (widget.type) {
			case "chart":
				return (
					<InteractiveChart
						config={{
							type: widget.config.chartType,
							data: widget.data || [],
							xAxisKey: widget.config.xAxisKey || "month",
							yAxisKeys: widget.config.yAxisKeys || ["value"],
							colors: widget.config.colors || ["#3b82f6"],
							title: widget.title,
							showGrid: widget.config.showGrid,
							showTooltip: widget.config.showTooltip,
							showLegend: widget.config.showLegend,
						}}
						height={250}
					/>
				);
			case "kpi":
				return (
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">
								{widget.title}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{widget.config.format === "currency"
									? `$${widget.data?.value || 0}`
									: widget.data?.value || 0}
							</div>
							{widget.config.showTrend && (
								<div className="text-xs text-muted-foreground">
									+12% from last month
								</div>
							)}
						</CardContent>
					</Card>
				);
			case "table":
				return (
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">
								{widget.title}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-xs text-muted-foreground">
								Table data would be displayed here
							</div>
						</CardContent>
					</Card>
				);
			case "text":
				return (
					<Card>
						<CardContent className="p-4">
							<div
								className={`text-${widget.config.fontSize} font-${widget.config.fontWeight} text-${widget.config.textAlign}`}
							>
								{widget.data?.content || "Text content"}
							</div>
						</CardContent>
					</Card>
				);
			case "filter":
				return (
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">
								{widget.title}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<Select defaultValue={widget.config.defaultValue}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All</SelectItem>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="inactive">Inactive</SelectItem>
								</SelectContent>
							</Select>
						</CardContent>
					</Card>
				);
			default:
				return <div>Unknown widget type</div>;
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
						<Layout className="h-6 w-6" />
						Custom Report Builder
					</h2>
					<p className="text-muted-foreground">
						Build interactive dashboards and reports with drag-and-drop widgets
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						onClick={() => setIsPreviewMode(!isPreviewMode)}
					>
						{isPreviewMode ? "Edit" : "Preview"}
					</Button>
					<Button variant="outline" onClick={saveReport}>
						<Save className="h-4 w-4 mr-2" />
						Save
					</Button>
					<Button variant="outline" onClick={() => exportReport("pdf")}>
						<Download className="h-4 w-4 mr-2" />
						Export
					</Button>
				</div>
			</div>

			{/* Report Configuration */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Settings className="h-5 w-5" />
						Report Configuration
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						<div className="space-y-2">
							<Label htmlFor="report-name">Report Name</Label>
							<Input
								id="report-name"
								value={currentReport.name}
								onChange={(e) =>
									setCurrentReport((prev) => ({
										...prev,
										name: e.target.value,
									}))
								}
								placeholder="Enter report name"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="report-category">Category</Label>
							<Select
								value={currentReport.category}
								onValueChange={(value) =>
									setCurrentReport((prev) => ({
										...prev,
										category: value,
									}))
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select category" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="financial">Financial</SelectItem>
									<SelectItem value="sales">Sales</SelectItem>
									<SelectItem value="marketing">Marketing</SelectItem>
									<SelectItem value="operations">Operations</SelectItem>
									<SelectItem value="executive">Executive</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="report-layout">Layout</Label>
							<Select
								value={currentReport.layout}
								onValueChange={(value: "grid" | "masonry" | "single") =>
									setCurrentReport((prev) => ({
										...prev,
										layout: value,
									}))
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="grid">Grid</SelectItem>
									<SelectItem value="masonry">Masonry</SelectItem>
									<SelectItem value="single">Single Column</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="report-description">Description</Label>
						<Textarea
							id="report-description"
							value={currentReport.description}
							onChange={(e) =>
								setCurrentReport((prev) => ({
									...prev,
									description: e.target.value,
								}))
							}
							placeholder="Describe what this report shows"
							rows={3}
						/>
					</div>
					<div className="flex items-center gap-6">
						<div className="flex items-center space-x-2">
							<Switch
								id="is-public"
								checked={currentReport.isPublic}
								onCheckedChange={(checked) =>
									setCurrentReport((prev) => ({
										...prev,
										isPublic: checked,
									}))
								}
							/>
							<Label htmlFor="is-public">Make Public</Label>
						</div>
						<div className="flex items-center space-x-2">
							<Switch
								id="is-template"
								checked={currentReport.isTemplate}
								onCheckedChange={(checked) =>
									setCurrentReport((prev) => ({
										...prev,
										isTemplate: checked,
									}))
								}
							/>
							<Label htmlFor="is-template">Save as Template</Label>
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				{/* Widget Library Sidebar */}
				{showWidgetLibrary && (
					<Card className="lg:col-span-1">
						<CardHeader>
							<CardTitle className="text-lg">Widget Library</CardTitle>
							<CardDescription>Add widgets to your report</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							{WIDGET_TYPES.map((widgetType) => (
								<div key={widgetType.type} className="space-y-2">
									<div className="flex items-center gap-2 p-2 rounded-lg border hover:bg-muted cursor-pointer">
										<widgetType.icon className="h-4 w-4" />
										<div className="flex-1">
											<div className="text-sm font-medium">
												{widgetType.name}
											</div>
											<div className="text-xs text-muted-foreground">
												{widgetType.description}
											</div>
										</div>
									</div>
									<div className="ml-6 space-y-1">
										{widgetType.subtypes.map((subtype) => (
											<Button
												key={subtype}
												variant="ghost"
												size="sm"
												className="w-full justify-start text-xs h-8"
												onClick={() => addWidget(widgetType.type, subtype)}
											>
												<Plus className="h-3 w-3 mr-1" />
												{subtype.charAt(0).toUpperCase() + subtype.slice(1)}
											</Button>
										))}
									</div>
								</div>
							))}
						</CardContent>
					</Card>
				)}

				{/* Main Canvas */}
				<div className="lg:col-span-3">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<div>
								<CardTitle className="flex items-center gap-2">
									<Grid className="h-5 w-5" />
									Report Canvas
								</CardTitle>
								<CardDescription>
									{widgets.length} widgets • {currentReport.name || "Untitled Report"}
								</CardDescription>
							</div>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setShowWidgetLibrary(!showWidgetLibrary)}
								>
									{showWidgetLibrary ? "Hide" : "Show"} Library
								</Button>
								<Button variant="outline" size="sm">
									<RefreshCw className="h-4 w-4" />
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							{widgets.length === 0 ? (
								<div className="flex flex-col items-center justify-center h-96 text-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
									<Grid className="h-12 w-12 text-muted-foreground mb-4" />
									<h3 className="text-lg font-semibold mb-2">
										Start Building Your Report
									</h3>
									<p className="text-muted-foreground mb-4">
										Add widgets from the library to create your custom dashboard
									</p>
									<Button onClick={() => addWidget("kpi")}>
										<Plus className="h-4 w-4 mr-2" />
										Add First Widget
									</Button>
								</div>
							) : (
								<div className="space-y-4">
									{/* Widget Grid */}
									<div
										className={`grid gap-4 ${
											currentReport.layout === "grid"
												? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
												: currentReport.layout === "masonry"
												? "columns-1 md:columns-2 lg:columns-3"
												: "grid-cols-1"
										}`}
									>
										{widgets.map((widget) => (
											<div
												key={widget.id}
												className={`relative group ${
													selectedWidget === widget.id ? "ring-2 ring-primary" : ""
												}`}
												style={
													currentReport.layout === "grid"
														? {
																gridColumn: `span ${Math.min(widget.position.w, 3)}`,
																gridRow: `span ${Math.min(widget.position.h, 2)}`,
														  }
														: {}
												}
											>
												{/* Widget Controls */}
												<div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
													<div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-md p-1">
														<Button
															variant="ghost"
															size="sm"
															className="h-6 w-6 p-0"
															onClick={() => duplicateWidget(widget.id)}
														>
															<Copy className="h-3 w-3" />
														</Button>
														<Button
															variant="ghost"
															size="sm"
															className="h-6 w-6 p-0"
															onClick={() => deleteWidget(widget.id)}
														>
															<Trash2 className="h-3 w-3" />
														</Button>
													</div>
												</div>

												{/* Widget Content */}
												<div className="h-full">
													{renderWidget(widget)}
												</div>
											</div>
										))}
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Templates */}
			<Card>
				<CardHeader>
					<CardTitle>Quick Templates</CardTitle>
					<CardDescription>Start with pre-built report templates</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{[
							{
								name: "Executive Dashboard",
								description: "High-level KPIs and trends",
								widgets: 6,
							},
							{
								name: "Financial Overview",
								description: "Revenue, expenses, and cash flow",
								widgets: 4,
							},
							{
								name: "Sales Performance",
								description: "Sales metrics and client data",
								widgets: 5,
							},
							{
								name: "Custom Report",
								description: "Start from scratch",
								widgets: 0,
							},
						].map((template, index) => (
							<Card
								key={index}
								className="cursor-pointer hover:bg-muted/50 transition-colors"
								onClick={() => {
									if (template.name !== "Custom Report") {
										// Load template
									}
								}}
							>
								<CardContent className="p-4">
									<h4 className="font-semibold mb-1">{template.name}</h4>
									<p className="text-sm text-muted-foreground mb-2">
										{template.description}
									</p>
									<div className="flex items-center justify-between">
										<Badge variant="secondary">
											{template.widgets} widgets
										</Badge>
										<Button size="sm" variant="ghost">
											Use
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
