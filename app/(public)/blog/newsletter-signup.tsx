/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function NewsletterSignup() {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (!email) {
			toast.error("Please enter your email address");
			return;
		}

		setIsLoading(true);
		try {
			const response = await fetch("/api/newsletter/subscribe", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email,
					source: "blog",
					metadata: {
						userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
						timestamp: new Date().toISOString(),
					},
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || data.message || "Failed to subscribe");
			}

			setIsSuccess(true);
			setEmail("");
			toast.success(data.message || "Successfully subscribed to newsletter!");
		} catch (error) {
			console.error("Newsletter subscription error:", error);
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to subscribe. Please try again later."
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<section className="py-16 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border-t">
			<div className="max-w-4xl mx-auto px-6 text-center">
				<h2 className="text-3xl font-bold mb-4">
					Stay Updated
				</h2>
				<p className="text-lg text-muted-foreground mb-8">
					Get the latest insights and updates delivered to your inbox
				</p>
				
				{isSuccess ? (
					<div className="max-w-md mx-auto p-6 bg-green-50 border border-green-200 rounded-lg">
						<p className="text-green-800 font-medium">
							✓ Successfully subscribed! Please check your email for confirmation.
						</p>
					</div>
				) : (
					<form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
					<Input
						placeholder="Enter your email"
						className="flex-1"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						disabled={isLoading}
					/>
					<Button type="submit" className="whitespace-nowrap" disabled={isLoading}>
						{isLoading ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Subscribing...
							</>
						) : (
							"Subscribe"
						)}
					</Button>
				</form>
				)}
			</div>
		</section>
	);
}

