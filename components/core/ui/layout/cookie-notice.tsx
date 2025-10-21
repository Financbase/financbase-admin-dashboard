import { BarChart3, Code, Save, Settings, XCircle } from "lucide-react";
("use client");

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CookiePreferencesModal from "@/components/ui/cookie-preferences-modal";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface CookiePreferences {
	necessary: boolean;
	analytics: boolean;
	marketing: boolean;
	preferences: boolean;
}

interface CookieNoticeProps {
	onAccept?: () => void;
	onReject?: () => void;
	className?: string;
}

export default function CookieNotice({
	onAccept,
	onReject,
	className,
}: CookieNoticeProps) {
	const [visible, setVisible] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showPreferencesModal, setShowPreferencesModal] = useState(false);

	// Check if user has already made a choice
	useEffect(() => {
		checkExistingPreferences();
	}, []);

	const checkExistingPreferences = async () => {
		try {
			const response = await fetch("/api/cookies/preferences");
			if (response.ok) {
				const data = await response.json();
				if (data.hasConsented) {
					// User has already made a choice, hide the notice
					setVisible(false);
					return;
				}
			}
			// Show notice if no preferences found or user hasn't consented
			setVisible(true);
		} catch (error) {
			console.error("Error checking cookie preferences:", error);
			// Show notice by default if we can't check preferences
			setVisible(true);
		}
	};

	const handleAcceptAll = async () => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/cookies/accept-all", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error("Failed to accept cookies");
			}

			setVisible(false);
			onAccept?.();
		} catch (error) {
			console.error("Error accepting cookies:", error);
			setError("Failed to save cookie preferences. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleRejectAll = async () => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/cookies/reject-all", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error("Failed to reject cookies");
			}

			setVisible(false);
			onReject?.();
		} catch (error) {
			console.error("Error rejecting cookies:", error);
			setError("Failed to save cookie preferences. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleManagePreferences = () => {
		setShowPreferencesModal(true);
	};

	const handlePreferencesModalClose = () => {
		setShowPreferencesModal(false);
		// Re-check preferences in case they were updated
		checkExistingPreferences();
	};

	if (!visible) return null;

	return (
		<>
			<div
				className={cn(
					"fixed bottom-6 left-1/4 -translate-x-1/2 z-50",
					className,
				)}
			>
				<Card className="w-[350px] shadow-lg rounded-2xl border bg-background text-foreground">
					<CardContent className="p-5">
						<div className="flex flex-col space-y-3">
							<div className="flex items-center space-x-2">
								<span className="text-lg">🍪</span>
								<h2 className="font-semibold">Cookie Notice</h2>
							</div>

							<p className="text-sm text-muted-foreground">
								We use cookies to ensure that we give you the best experience on
								our website.{" "}
								<a
									href="/privacy-policy"
									className="underline text-primary hover:text-primary/80"
									target="_blank"
									rel="noopener noreferrer"
								>
									Read our privacy policy.
								</a>
							</p>

							{error && (
								<div className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
									{error}
								</div>
							)}

							<div className="flex justify-between items-center pt-2">
								<button
									onClick={handleManagePreferences}
									className="text-sm underline hover:text-primary transition"
									disabled={loading}
								>
									Manage preferences
								</button>

								<div className="flex space-x-2">
									<Button
										size="sm"
										variant="outline"
										onClick={handleRejectAll}
										disabled={loading}
										className="rounded-lg px-3 py-1"
									>
										{loading ? "Saving..." : "Reject"}
									</Button>

									<Button
										size="sm"
										onClick={handleAcceptAll}
										disabled={loading}
										className={cn(
											"rounded-lg px-4 py-1 text-white",
											"bg-primary hover:bg-primary/90",
										)}
									>
										{loading ? "Saving..." : "Accept All"}
									</Button>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<CookiePreferencesModal
				isOpen={showPreferencesModal}
				onClose={handlePreferencesModalClose}
			/>
		</>
	);
}
