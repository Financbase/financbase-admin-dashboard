/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import {} from "lucide-react";
("use client");

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useCookiePreferences } from "@/hooks/use-cookie-preferences";
import { cn } from "@/lib/utils";
import React, { useState } from "react";

interface CookiePreferencesModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function CookiePreferencesModal({
	isOpen,
	onClose,
}: CookiePreferencesModalProps) {
	const { preferences, loading, error, updatePreferences } =
		useCookiePreferences();
	const [localPreferences, setLocalPreferences] = useState(preferences);

	// Update local state when preferences change
	React.useEffect(() => {
		setLocalPreferences(preferences);
	}, [preferences]);

	if (!isOpen) return null;

	const handleSavePreferences = async () => {
		await updatePreferences(localPreferences);
		onClose();
	};

	const handleAcceptAll = async () => {
		await updatePreferences({
			analytics: true,
			marketing: true,
			preferences: true,
		});
		onClose();
	};

	const handleRejectAll = async () => {
		await updatePreferences({
			analytics: false,
			marketing: false,
			preferences: false,
		});
		onClose();
	};

	const cookieDetails = [
		{
			type: "necessary" as const,
			title: "Necessary Cookies",
			description:
				"Required for the website to function properly. These cannot be disabled.",
			required: true,
			details:
				"These cookies are essential for basic site functionality like page navigation, access to secure areas, and remembering your login status.",
		},
		{
			type: "analytics" as const,
			title: "Analytics Cookies",
			description: "Help us understand how visitors interact with our website.",
			required: false,
			details:
				"We use analytics cookies to collect information about how you use our website, which pages you visit, and any errors you encounter.",
		},
		{
			type: "marketing" as const,
			title: "Marketing Cookies",
			description:
				"Used to deliver relevant advertisements and track their effectiveness.",
			required: false,
			details:
				"Marketing cookies help us show you relevant ads on other websites and measure the effectiveness of our marketing campaigns.",
		},
		{
			type: "preferences" as const,
			title: "Preference Cookies",
			description:
				"Remember your settings and preferences for a personalized experience.",
			required: false,
			details:
				"These cookies remember your language preference, theme settings, and other personalization choices you make.",
		},
	];

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
			<Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<span className="text-2xl">🍪</span>
						<span>Cookie Preferences</span>
					</CardTitle>
					<CardDescription>
						Manage your cookie preferences. You can change these settings at any
						time.
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-6">
					{error && (
						<div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
							{error?.message || String(error)}
						</div>
					)}

					<div className="space-y-4">
						{cookieDetails.map((cookie) => (
							<div key={cookie.type} className="border rounded-lg p-4">
								<div className="flex items-start justify-between mb-2">
									<div className="flex-1">
										<h3 className="font-medium flex items-center space-x-2">
											<span>{cookie.title}</span>
											{cookie.required && (
												<span className="text-xs bg-muted px-2 py-1 rounded">
													Required
												</span>
											)}
										</h3>
										<p className="text-sm text-muted-foreground mt-1">
											{cookie.description}
										</p>
									</div>
									{cookie.required ? (
										<div className="text-green-600 font-medium">
											Always Active
										</div>
									) : (
										<Switch
											checked={localPreferences[cookie.type as keyof typeof localPreferences]}
											onCheckedChange={(checked) =>
												setLocalPreferences((prev) => ({
													...prev,
													[cookie.type]: checked,
												}))
											}
											disabled={loading}
										/>
									)}
								</div>
								<details className="mt-2">
									<summary className="text-sm text-primary cursor-pointer hover:underline">
										Learn more about this cookie type
									</summary>
									<p className="text-xs text-muted-foreground mt-2">
										{cookie.details}
									</p>
								</details>
							</div>
						))}
					</div>

					<div className="flex flex-wrap gap-2 pt-4 border-t">
						<Button
							variant="outline"
							onClick={handleRejectAll}
							disabled={loading}
							className="flex-1 min-w-[120px]"
						>
							Reject All
						</Button>
						<Button
							variant="outline"
							onClick={handleAcceptAll}
							disabled={loading}
							className="flex-1 min-w-[120px]"
						>
							Accept All
						</Button>
						<Button
							onClick={handleSavePreferences}
							disabled={loading}
							className="flex-1 min-w-[120px]"
						>
							{loading ? "Saving..." : "Save Preferences"}
						</Button>
					</div>

					<div className="text-center pt-2">
						<button
							onClick={onClose}
							className="text-sm text-muted-foreground hover:text-foreground underline"
						>
							Close
						</button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
