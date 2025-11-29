/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { BarChart3, Clock, Key } from "lucide-react";
("use client");

import CookieNotice from "@/components/ui/cookie-notice";
import CookiePreferencesModal from "@/components/ui/cookie-preferences-modal";
import { CookieSettingsButton } from "@/components/core/ui/buttons/cookie-settings-button";
import { useCookiePreferences } from "@/hooks/use-cookie-preferences";
import { useState } from "react";
import { logger } from '@/lib/logger';

export default function CookieNoticeDemo() {
	const { preferences, hasConsented, acceptAll, rejectAll, updatePreferences } =
		useCookiePreferences();
	const [showPreferencesModal, setShowPreferencesModal] = useState(false);

	const cookieDetails = [
		{
			type: "necessary" as const,
			title: "Necessary Cookies",
			description: "Required for basic website functionality",
			status: "Always Active",
			color: "text-green-600",
		},
		{
			type: "analytics" as const,
			title: "Analytics Cookies",
			description: "Help improve our website performance",
			status: preferences.analytics ? "Active" : "Inactive",
			color: preferences.analytics ? "text-green-600" : "text-red-600",
		},
		{
			type: "marketing" as const,
			title: "Marketing Cookies",
			description: "Show relevant advertisements",
			status: preferences.marketing ? "Active" : "Inactive",
			color: preferences.marketing ? "text-green-600" : "text-red-600",
		},
		{
			type: "preferences" as const,
			title: "Preference Cookies",
			description: "Remember your settings",
			status: preferences.preferences ? "Active" : "Inactive",
			color: preferences.preferences ? "text-green-600" : "text-red-600",
		},
	];

	return (
		<div className="min-h-screen bg-background p-8">
			<div className="max-w-4xl mx-auto space-y-8">
				<div className="text-center space-y-4">
					<h1 className="text-4xl font-bold">
						🍪 GDPR-Compliant Cookie Management System
					</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Complete cookie consent management with full GDPR compliance,
						granular controls, and ongoing preference management capabilities.
					</p>
				</div>

				{/* Cookie Status Overview */}
				<div className="bg-card border rounded-lg p-6">
					<h2 className="text-2xl font-semibold mb-6">Current Cookie Status</h2>

					<div className="grid gap-4 md:grid-cols-2">
						{cookieDetails.map((cookie) => (
							<div
								key={cookie.type}
								className="flex items-center justify-between p-4 border rounded-lg"
							>
								<div className="flex-1">
									<h3 className="font-medium">{cookie.title}</h3>
									<p className="text-sm text-muted-foreground">
										{cookie.description}
									</p>
								</div>
								<div className={`font-medium ${cookie.color}`}>
									{cookie.status}
								</div>
							</div>
						))}
					</div>

					<div className="mt-6 p-4 bg-muted rounded-lg">
						<div className="flex items-center justify-between">
							<span className="font-medium">Overall Consent Status:</span>
							<span
								className={`font-bold ${hasConsented ? "text-green-600" : "text-orange-600"}`}
							>
								{hasConsented ? "Consented" : "No Optional Consent Given"}
							</span>
						</div>
					</div>
				</div>

				{/* Control Panel */}
				<div className="bg-card border rounded-lg p-6">
					<h2 className="text-2xl font-semibold mb-6">
						Cookie Management Controls
					</h2>

					<div className="flex flex-wrap gap-4 justify-center">
						<button
							onClick={acceptAll}
							className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
						>
							Accept All Cookies
						</button>

						<button
							onClick={rejectAll}
							className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
						>
							Reject Optional Cookies
						</button>

						<button
							onClick={() => setShowPreferencesModal(true)}
							className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
						>
							Manage Detailed Preferences
						</button>
					</div>

					<div className="mt-6 text-center">
						<CookieSettingsButton variant="outline" className="text-sm" />
					</div>
				</div>

				{/* GDPR Compliance Features */}
				<div className="bg-card border rounded-lg p-6">
					<h2 className="text-2xl font-semibold mb-6">
						✅ GDPR Compliance Features
					</h2>

					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-3">
							<div className="flex items-start space-x-3">
								<div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
								<div>
									<h3 className="font-medium">Granular Consent Control</h3>
									<p className="text-sm text-muted-foreground">
										Users can choose exactly which cookie types to accept or
										reject
									</p>
								</div>
							</div>

							<div className="flex items-start space-x-3">
								<div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
								<div>
									<h3 className="font-medium">Consent Record Keeping</h3>
									<p className="text-sm text-muted-foreground">
										All consent decisions are recorded with timestamps, IP
										addresses, and user agents
									</p>
								</div>
							</div>

							<div className="flex items-start space-x-3">
								<div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
								<div>
									<h3 className="font-medium">Right to Withdraw</h3>
									<p className="text-sm text-muted-foreground">
										Users can change their preferences at any time through the
										settings interface
									</p>
								</div>
							</div>
						</div>

						<div className="space-y-3">
							<div className="flex items-start space-x-3">
								<div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
								<div>
									<h3 className="font-medium">Transparent Information</h3>
									<p className="text-sm text-muted-foreground">
										Clear explanations of what each cookie type does and why
										it's needed
									</p>
								</div>
							</div>

							<div className="flex items-start space-x-3">
								<div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
								<div>
									<h3 className="font-medium">Easy Access Settings</h3>
									<p className="text-sm text-muted-foreground">
										Cookie preferences are accessible from the footer and user
										settings
									</p>
								</div>
							</div>

							<div className="flex items-start space-x-3">
								<div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
								<div>
									<h3 className="font-medium">No Pre-ticked Consent</h3>
									<p className="text-sm text-muted-foreground">
										Optional cookies are opt-in only, never pre-selected
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Cookie Notice Component */}
				<CookieNotice
					onAccept={() => logger.info("Cookies accepted")}
					onReject={() => logger.info("Cookies rejected")}
				/>
			</div>

			{/* Detailed Preferences Modal */}
			<CookiePreferencesModal
				isOpen={showPreferencesModal}
				onClose={() => setShowPreferencesModal(false)}
			/>
		</div>
	);
}
