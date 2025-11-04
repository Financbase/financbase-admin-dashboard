"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
	ArrowLeft,
	AlertCircle,
	Upload,
	FileText,
	CheckCircle,
	RefreshCw,
	ArrowRight,
} from "lucide-react";

const commonErrors = [
	{
		title: "File Format Error",
		description: "The uploaded file is not in a supported format",
		solutions: [
			"Ensure the file is CSV, XLSX, or QBO format",
			"Check that the file isn't corrupted",
			"Verify the file extension matches the format",
			"Try exporting the file again from your source",
		],
	},
	{
		title: "Missing Required Columns",
		description: "The file is missing required column headers",
		solutions: [
			"Check the template for required columns",
			"Ensure column headers match exactly",
			"Verify date formats are correct",
			"Review the import guide for format requirements",
		],
	},
	{
		title: "Data Validation Errors",
		description: "Some data in the file failed validation",
		solutions: [
			"Check error messages for specific issues",
			"Verify all required fields are filled",
			"Ensure dates are in correct format",
			"Check for invalid characters or special symbols",
		],
	},
	{
		title: "File Too Large",
		description: "The file exceeds the maximum size limit",
		solutions: [
			"Split the file into smaller batches",
			"Remove unnecessary data from the file",
			"Compress the file if possible",
			"Contact support for large file imports",
		],
	},
];

const troubleshootingSteps = [
	{
		number: 1,
		title: "Check File Format",
		description: "Verify your file matches the required format",
	},
	{
		number: 2,
		title: "Review Error Messages",
		description: "Read the error messages for specific issues",
	},
	{
		number: 3,
		title: "Validate Data",
		description: "Check your data for missing or invalid values",
	},
	{
		number: 4,
		title: "Try Again",
		description: "Fix the issues and re-upload the file",
	},
];

export default function ImportErrorsPage() {
	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<div className="border-b">
				<div className="container mx-auto px-4 py-6">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="sm" asChild>
							<Link href="/docs/help">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back to Help
							</Link>
						</Button>
						<div>
							<div className="flex items-center gap-2 mb-1">
								<AlertCircle className="h-5 w-5 text-primary" />
								<Badge variant="secondary" className="text-sm font-medium">
									Troubleshooting
								</Badge>
							</div>
							<h1 className="text-2xl font-bold">Import Errors</h1>
						</div>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-16">
				<div className="max-w-4xl mx-auto">
					{/* Overview */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">
							Resolving Import Errors
						</h2>
						<p className="text-muted-foreground mb-8">
							If you're encountering errors when importing data, follow these
							steps to identify and resolve the issues.
						</p>
					</section>

					{/* Common Errors */}
					<section className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">Common Import Errors</h2>
						<div className="space-y-6">
							{commonErrors.map((error, index) => (
								<Card key={index}>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<AlertCircle className="h-5 w-5 text-orange-600" />
											{error.title}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-muted-foreground mb-4">
											{error.description}
										</p>
										<div>
											<p className="font-semibold mb-2">Solutions:</p>
											<ul className="space-y-2">
												{error.solutions.map((solution, solIndex) => (
													<li
														key={solIndex}
														className="flex items-start gap-2 text-sm text-muted-foreground"
													>
														<CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
														<span>{solution}</span>
													</li>
												))}
											</ul>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</section>

					{/* Troubleshooting Steps */}
					<section className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">Troubleshooting Steps</h2>
						<div className="space-y-6">
							{troubleshootingSteps.map((step) => (
								<Card key={step.number}>
									<CardContent className="p-6">
										<div className="flex items-start gap-4">
											<div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
												<span className="font-semibold text-primary">
													{step.number}
												</span>
											</div>
											<div className="flex-1">
												<h3 className="text-xl font-semibold mb-2">
													{step.title}
												</h3>
												<p className="text-muted-foreground">
													{step.description}
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</section>

					{/* Quick Actions */}
					<section className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Button asChild variant="outline" className="justify-start h-auto py-4">
								<Link href="/dashboard">
									<Upload className="h-4 w-4 mr-2" />
									<div className="text-left">
										<div className="font-semibold">Try Import Again</div>
										<div className="text-xs text-muted-foreground">
											Re-attempt your data import
										</div>
									</div>
									<ArrowRight className="h-4 w-4 ml-auto" />
								</Link>
							</Button>
							<Button asChild variant="outline" className="justify-start h-auto py-4">
								<Link href="/support">
									<AlertCircle className="h-4 w-4 mr-2" />
									<div className="text-left">
										<div className="font-semibold">Contact Support</div>
										<div className="text-xs text-muted-foreground">
											Get help with your import
										</div>
									</div>
									<ArrowRight className="h-4 w-4 ml-auto" />
								</Link>
							</Button>
						</div>
					</section>

					{/* Related Articles */}
					<section>
						<h2 className="text-2xl font-semibold mb-6">Related Articles</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Card className="cursor-pointer hover:shadow-md transition-shadow">
								<CardContent className="p-4">
									<Link
										href="/docs/help/performance"
										className="flex items-center justify-between"
									>
										<span className="font-medium">Performance Issues</span>
										<ArrowRight className="h-4 w-4 text-muted-foreground" />
									</Link>
								</CardContent>
							</Card>
							<Card className="cursor-pointer hover:shadow-md transition-shadow">
								<CardContent className="p-4">
									<Link
										href="/docs/help/issues"
										className="flex items-center justify-between"
									>
										<span className="font-medium">Common Issues</span>
										<ArrowRight className="h-4 w-4 text-muted-foreground" />
									</Link>
								</CardContent>
							</Card>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}

