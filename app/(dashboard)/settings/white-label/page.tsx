/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { Loader2, Upload, Palette, Globe, Mail, Code, Eye, EyeOff } from "lucide-react";
import type { WhiteLabelBranding } from "@/types/white-label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function WhiteLabelSettingsPage() {
	const { selectedWorkspace } = useWorkspaces();
	const { toast } = useToast();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [showCssPreview, setShowCssPreview] = useState(false);
	const [branding, setBranding] = useState<Partial<WhiteLabelBranding>>({});

	// Load current branding
	useEffect(() => {
		if (!selectedWorkspace?.workspaceId) return;

		const loadBranding = async () => {
			try {
				setLoading(true);
				const response = await fetch(
					`/api/settings/white-label?workspaceId=${selectedWorkspace.workspaceId}`
				);
				if (response.ok) {
					const data = await response.json();
					setBranding(data);
				}
			} catch (error) {
				console.error("Error loading branding:", error);
				toast({
					title: "Error",
					description: "Failed to load branding settings",
					variant: "destructive",
				});
			} finally {
				setLoading(false);
			}
		};

		loadBranding();
	}, [selectedWorkspace, toast]);

	const handleSave = async () => {
		if (!selectedWorkspace?.workspaceId) {
			toast({
				title: "Error",
				description: "No workspace selected",
				variant: "destructive",
			});
			return;
		}

		try {
			setSaving(true);
			const response = await fetch("/api/settings/white-label", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					workspaceId: selectedWorkspace.workspaceId,
					branding,
				}),
			});

			if (response.ok) {
				toast({
					title: "Success",
					description: "Branding settings saved successfully",
				});
			} else {
				const error = await response.json();
				throw new Error(error.error || "Failed to save branding");
			}
		} catch (error) {
			toast({
				title: "Error",
				description: error instanceof Error ? error.message : "Failed to save branding settings",
				variant: "destructive",
			});
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (!selectedWorkspace) {
		return (
			<Alert>
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>Please select a workspace to configure white label settings.</AlertDescription>
			</Alert>
		);
	}

	if (selectedWorkspace.plan !== "enterprise") {
		return (
			<Alert>
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>
					White label is only available for enterprise plans. Please upgrade to access this feature.
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-semibold mb-2">White Label Settings</h2>
				<p className="text-muted-foreground">
					Customize your workspace branding, including logos, colors, and domain settings.
				</p>
			</div>

			{/* Branding Overview */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Palette className="h-5 w-5" />
						Branding
					</CardTitle>
					<CardDescription>
						Configure your company branding that will appear throughout the application
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Company Name */}
					<div className="space-y-2">
						<Label htmlFor="companyName">Company Name</Label>
						<Input
							id="companyName"
							value={branding.companyName || ""}
							onChange={(e) => setBranding({ ...branding, companyName: e.target.value })}
							placeholder="Your Company Name"
						/>
					</div>

					{/* Logo URLs */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="logo">Logo URL (Light Mode)</Label>
							<Input
								id="logo"
								value={branding.logo || ""}
								onChange={(e) => setBranding({ ...branding, logo: e.target.value })}
								placeholder="/logo.png or https://example.com/logo.png"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="logoDark">Logo URL (Dark Mode)</Label>
							<Input
								id="logoDark"
								value={branding.logoDark || ""}
								onChange={(e) => setBranding({ ...branding, logoDark: e.target.value })}
								placeholder="/logo-dark.png or https://example.com/logo-dark.png"
							/>
						</div>
					</div>

					{/* Favicon */}
					<div className="space-y-2">
						<Label htmlFor="favicon">Favicon URL</Label>
						<Input
							id="favicon"
							value={branding.favicon || ""}
							onChange={(e) => setBranding({ ...branding, favicon: e.target.value })}
							placeholder="/favicon.ico or https://example.com/favicon.ico"
						/>
					</div>

					{/* Colors */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="primaryColor">Primary Color</Label>
							<div className="flex gap-2">
								<Input
									id="primaryColor"
									type="color"
									value={branding.primaryColor || "#3B82F6"}
									onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
									className="w-20 h-10"
								/>
								<Input
									value={branding.primaryColor || "#3B82F6"}
									onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
									placeholder="#3B82F6"
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="secondaryColor">Secondary Color</Label>
							<div className="flex gap-2">
								<Input
									id="secondaryColor"
									type="color"
									value={branding.secondaryColor || "#6B7280"}
									onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
									className="w-20 h-10"
								/>
								<Input
									value={branding.secondaryColor || "#6B7280"}
									onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
									placeholder="#6B7280"
								/>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Support & Contact */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Mail className="h-5 w-5" />
						Support & Contact
					</CardTitle>
					<CardDescription>
						Configure support contact information for your branded workspace
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="supportEmail">Support Email</Label>
						<Input
							id="supportEmail"
							type="email"
							value={branding.supportEmail || ""}
							onChange={(e) => setBranding({ ...branding, supportEmail: e.target.value })}
							placeholder="support@yourcompany.com"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="supportUrl">Support URL</Label>
						<Input
							id="supportUrl"
							value={branding.supportUrl || ""}
							onChange={(e) => setBranding({ ...branding, supportUrl: e.target.value })}
							placeholder="https://support.yourcompany.com"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="emailFooter">Email Footer (HTML)</Label>
						<Textarea
							id="emailFooter"
							value={branding.emailFooter || ""}
							onChange={(e) => setBranding({ ...branding, emailFooter: e.target.value })}
							placeholder="Custom footer text for emails"
							rows={4}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Custom Domain */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Globe className="h-5 w-5" />
						Custom Domain
					</CardTitle>
					<CardDescription>
						Configure a custom domain for your workspace (requires DNS configuration)
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="customDomain">Custom Domain</Label>
						<Input
							id="customDomain"
							value={branding.customDomain || ""}
							onChange={(e) => setBranding({ ...branding, customDomain: e.target.value })}
							placeholder="app.yourcompany.com"
						/>
						<p className="text-sm text-muted-foreground">
							Enter your custom domain. You'll need to configure DNS records to point to our servers.
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Custom CSS */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Code className="h-5 w-5" />
						Custom CSS
					</CardTitle>
					<CardDescription>
						Add custom CSS to further customize the appearance (advanced)
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<Label htmlFor="customCss">Custom CSS</Label>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setShowCssPreview(!showCssPreview)}
						>
							{showCssPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
							{showCssPreview ? "Hide Preview" : "Show Preview"}
						</Button>
					</div>
					<Textarea
						id="customCss"
						value={branding.customCss || ""}
						onChange={(e) => setBranding({ ...branding, customCss: e.target.value })}
						placeholder="/* Your custom CSS here */"
						rows={10}
						className="font-mono text-sm"
					/>
					{showCssPreview && branding.customCss && (
						<div className="border rounded-lg p-4 bg-muted">
							<style dangerouslySetInnerHTML={{ __html: branding.customCss }} />
							<p className="text-sm text-muted-foreground">CSS Preview</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Advanced Options */}
			<Card>
				<CardHeader>
					<CardTitle>Advanced Options</CardTitle>
					<CardDescription>
						Additional branding configuration options
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label htmlFor="hideFinancbaseBranding">Hide Financbase Branding</Label>
							<p className="text-sm text-muted-foreground">
								Completely hide Financbase branding throughout the application
							</p>
						</div>
						<Switch
							id="hideFinancbaseBranding"
							checked={branding.hideFinancbaseBranding || false}
							onCheckedChange={(checked) =>
								setBranding({ ...branding, hideFinancbaseBranding: checked })
							}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Save Button */}
			<div className="flex justify-end gap-4">
				<Button variant="outline" onClick={() => window.location.reload()}>
					Cancel
				</Button>
				<Button onClick={handleSave} disabled={saving}>
					{saving ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Saving...
						</>
					) : (
						"Save Changes"
					)}
				</Button>
			</div>
		</div>
	);
}

