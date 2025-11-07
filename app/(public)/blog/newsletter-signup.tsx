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

export function NewsletterSignup() {
	const [email, setEmail] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// TODO: Implement newsletter subscription
		console.log("Newsletter signup:", email);
		setEmail("");
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
				
				<form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
					<Input
						placeholder="Enter your email"
						className="flex-1"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
					<Button type="submit" className="whitespace-nowrap">
						Subscribe
					</Button>
				</form>
			</div>
		</section>
	);
}

