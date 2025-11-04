import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
	ArrowRight,
	BarChart3,
	BookOpen,
	ChevronRight,
	Code,
	FileText,
	HelpCircle,
	Search,
	Settings,
	Shield,
	Smartphone,
	Users,
} from "lucide-react";

// ISR configuration
export const revalidate = 3600; // Revalidate every hour

// Server-side data fetching
async function getDocsPageData() {
	// Simulate database fetch - in production this would come from CMS/database
	await new Promise((resolve) => setTimeout(resolve, 100));

	return {
		docSections: [
			{
				title: "Getting Started",
				description: "Quick start guides and setup instructions",
				icon: BookOpen,
				color: "bg-blue-500",
				items: [
					{
						title: "Installation",
						href: "/docs/installation",
						description: "Set up Financbase in minutes",
					},
					{
						title: "First Steps",
						href: "/docs/first-steps",
						description: "Create your first account",
					},
					{
						title: "Dashboard Overview",
						href: "/docs/dashboard",
						description: "Navigate the main interface",
					},
					{
						title: "Account Setup",
						href: "/docs/account-setup",
						description: "Configure your profile",
					},
				],
			},
			{
				title: "API Reference",
				description: "Technical documentation for developers",
				icon: Code,
				color: "bg-green-500",
				items: [
					{
						title: "Authentication",
						href: "/docs/api/auth",
						description: "API keys and authentication",
					},
					{
						title: "Endpoints",
						href: "/docs/api/endpoints",
						description: "Complete API reference",
					},
					{
						title: "SDKs",
						href: "/docs/api/sdks",
						description: "Client libraries and SDKs",
					},
					{
						title: "Webhooks",
						href: "/docs/api/webhooks",
						description: "Real-time event notifications",
					},
				],
			},
			{
				title: "Help Center",
				description: "FAQs and troubleshooting guides",
				icon: HelpCircle,
				color: "bg-purple-500",
				items: [
					{
						title: "Common Issues",
						href: "/docs/help/issues",
						description: "Troubleshoot common problems",
					},
					{
						title: "Best Practices",
						href: "/docs/help/best-practices",
						description: "Optimize your workflow",
					},
					{
						title: "Security Guide",
						href: "/docs/help/security",
						description: "Keep your data secure",
					},
					{
						title: "Contact Support",
						href: "/docs/help/support",
						description: "Get help from our team",
					},
				],
			},
		],
		quickLinks: [
			{
				title: "API Documentation",
				href: "/docs/api",
				icon: Code,
				description: "Complete API reference",
			},
			{
				title: "Integration Guides",
				href: "/docs/integrations",
				icon: Settings,
				description: "Connect with third-party tools",
			},
			{
				title: "Security & Compliance",
				href: "/docs/security",
				icon: Shield,
				description: "Data protection and compliance",
			},
			{
				title: "Mobile SDK",
				href: "/docs/mobile",
				icon: Smartphone,
				description: "iOS and Android development",
			},
			{
				title: "Analytics",
				href: "/docs/analytics",
				icon: BarChart3,
				description: "Track and analyze data",
			},
			{
				title: "Multi-tenant",
				href: "/docs/multi-tenant",
				icon: Users,
				description: "Build for multiple organizations",
			},
		],
		popularArticles: [
			{
				title: "Getting Started with Financbase API",
				href: "/docs/api",
				views: "2.1k",
			},
			{
				title: "Setting up Webhooks",
				href: "/docs/api/webhooks",
				views: "1.8k",
			},
			{
				title: "Authentication Best Practices",
				href: "/docs/api/auth",
				views: "1.5k",
			},
			{
				title: "Analytics Dashboard Guide",
				href: "/docs/analytics",
				views: "1.2k",
			},
		],
	};
}

interface DocsPageProps {
	searchParams: {
		search?: string;
	};
}

// Helper function to filter items based on search query
function filterItems<T extends { title: string; description?: string }>(
	items: T[],
	query: string
): T[] {
	if (!query.trim()) return items;
	const lowerQuery = query.toLowerCase();
	return items.filter(
		(item) =>
			item.title.toLowerCase().includes(lowerQuery) ||
			item.description?.toLowerCase().includes(lowerQuery)
	);
}

// Helper function to filter sections based on search query
function filterSections<T extends { title: string; description: string; items: Array<{ title: string; description?: string }> }>(
	sections: T[],
	query: string
): T[] {
	if (!query.trim()) return sections;
	const lowerQuery = query.toLowerCase();
	return sections
		.map((section) => {
			const matchesTitle = section.title.toLowerCase().includes(lowerQuery);
			const matchesDescription = section.description.toLowerCase().includes(lowerQuery);
			const filteredItems = filterItems(section.items, query);
			const hasMatchingItems = filteredItems.length > 0;

			if (matchesTitle || matchesDescription || hasMatchingItems) {
				return {
					...section,
					items: hasMatchingItems ? filteredItems : section.items,
				};
			}
			return null;
		})
		.filter((section): section is T => section !== null);
}

export default async function DocsPage({ searchParams }: { searchParams: { search?: string } }) {
	const data = await getDocsPageData();
	const searchQuery = searchParams?.search || "";

	// Filter data based on search query
	const filteredQuickLinks = filterItems(data.quickLinks, searchQuery);
	const filteredDocSections = filterSections(data.docSections, searchQuery);
	const filteredPopularArticles = filterItems(data.popularArticles, searchQuery);
	const hasSearchResults =
		filteredQuickLinks.length > 0 ||
		filteredDocSections.length > 0 ||
		filteredPopularArticles.length > 0;

	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<div className="border-b bg-gradient-to-br from-background via-background to-muted/20">
				<div className="container mx-auto px-4 py-16">
					<div className="max-w-4xl mx-auto text-center">
						<div className="flex items-center justify-center gap-2 mb-4">
							<BookOpen className="h-6 w-6 text-primary" />
							<Badge variant="secondary" className="text-sm font-medium">
								Documentation
							</Badge>
						</div>
						<h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
							Everything you need to know about{" "}
							<span className="text-primary">Financbase</span>
						</h1>
						<p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
							Comprehensive guides, API documentation, and resources to help you
							build amazing financial applications.
						</p>

						{/* Search Form */}
						<form
							className="relative max-w-2xl mx-auto"
							action="/docs"
							method="GET"
						>
							<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
							<Input
								type="text"
								name="search"
								placeholder="Search documentation..."
								defaultValue={searchQuery}
								className="pl-12 pr-4 py-3 text-lg"
							/>
							<Button
								type="submit"
								className="absolute right-2 top-1/2 transform -translate-y-1/2"
							>
								Search
							</Button>
						</form>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-16">
				<div className="max-w-6xl mx-auto">
					{searchQuery && !hasSearchResults && (
						<div className="mb-8 text-center py-12">
							<Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
							<h3 className="text-xl font-semibold mb-2">No results found</h3>
							<p className="text-muted-foreground mb-4">
								Try searching with different keywords or browse our documentation below.
							</p>
						</div>
					)}

					{searchQuery && hasSearchResults && (
						<div className="mb-8">
							<p className="text-muted-foreground">
								Found results for: <span className="font-semibold text-foreground">"{searchQuery}"</span>
							</p>
						</div>
					)}

					{/* Quick Links */}
					{filteredQuickLinks.length > 0 && (
					<div className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">Quick Links</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{filteredQuickLinks.map((link) => (
								<Link key={link.title} href={link.href}>
									<Card className="group hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
										<CardContent className="p-6">
											<div className="flex items-start gap-4">
												<div className="p-2 rounded-lg bg-primary/10 text-primary">
													<link.icon className="h-5 w-5" />
												</div>
												<div className="flex-1">
													<h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
														{link.title}
													</h3>
													<p className="text-sm text-muted-foreground">
														{link.description}
													</p>
												</div>
												<ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
											</div>
										</CardContent>
									</Card>
								</Link>
							))}
						</div>
					</div>
					)}

					{/* Documentation Sections */}
					{filteredDocSections.length > 0 && (
					<div className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">
							Documentation Sections
						</h2>
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
								{filteredDocSections.map((section) => (
								<Card
									key={section.title}
									className="group hover:shadow-lg transition-all duration-200"
								>
									<CardHeader>
										<div className="flex items-center gap-3 mb-2">
											<div
												className={`p-2 rounded-lg ${section.color} text-white`}
											>
												<section.icon className="h-5 w-5" />
											</div>
											<h3 className="text-xl font-semibold">{section.title}</h3>
										</div>
										<p className="text-muted-foreground">
											{section.description}
										</p>
									</CardHeader>
									<CardContent>
										<div className="space-y-3">
											{section.items.map((item) => (
												<Link key={item.title} href={item.href}>
													<div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group">
														<div>
															<h4 className="font-medium group-hover:text-primary transition-colors">
																{item.title}
															</h4>
															<p className="text-sm text-muted-foreground">
																{item.description}
															</p>
														</div>
														<ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
													</div>
												</Link>
											))}
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
					)}

					{/* Popular Articles */}
					{filteredPopularArticles.length > 0 && (
					<div className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">Popular Articles</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{filteredPopularArticles.map((article) => (
								<Link key={article.title} href={article.href}>
									<Card className="group hover:shadow-md transition-all duration-200">
										<CardContent className="p-6">
											<div className="flex items-center justify-between">
												<div className="flex-1">
													<h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
														{article.title}
													</h3>
													<div className="flex items-center gap-2 text-sm text-muted-foreground">
														<FileText className="h-4 w-4" />
														<span>{article.views} views</span>
													</div>
												</div>
												<ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
											</div>
										</CardContent>
									</Card>
								</Link>
							))}
						</div>
					</div>
					)}

					{/* Support Section */}
					<Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
						<CardContent className="p-8 text-center">
							<div className="max-w-2xl mx-auto">
								<h3 className="text-2xl font-semibold mb-4">Need Help?</h3>
								<p className="text-muted-foreground mb-6">
									Can't find what you're looking for? Our support team is here
									to help you get the most out of Financbase.
								</p>
								<div className="flex flex-col sm:flex-row gap-4 justify-center">
									<Button asChild>
										<Link href="/support">
											<HelpCircle className="h-4 w-4 mr-2" />
											Contact Support
										</Link>
									</Button>
									<Button variant="outline" asChild>
										<Link href="/support">
											<BookOpen className="h-4 w-4 mr-2" />
											Browse Help Center
										</Link>
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
