// demo.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
	FeedbackWidget,
	FeedbackWidgetProps,
} from "@/components/ui/feedback-widget";
import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Toaster } from "sonner"; // Using sonner for notifications, a shadcn favorite

export default function FeedbackWidgetDemo() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="flex min-h-[350px] w-full items-center justify-center rounded-lg border border-dashed bg-background p-8">
			<Button onClick={() => setIsOpen(true)}>Leave Feedback</Button>

			{/* Required for toast notifications */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */
}
			<Toaster richColors />

			{/* AnimatePresence handles the exit animation */}
			<AnimatePresence>
				{isOpen && (
					<FeedbackWidget
						onClose={() => setIsOpen(false)}
						placeholder="Solid answer, but could use more implementation steps"
						category="demo"
					/>
				)}
			</AnimatePresence>
		</div>
	);
}
