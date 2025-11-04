/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { PlayStoreButton } from "@/components/ui/play-store-button";
import { cn } from "@/lib/utils";

export default function DemoOne() {
	return (
		<div className="relative flex min-h-screen w-full flex-col items-center justify-center">
			<div
				aria-hidden="true"
				className={cn(
					"pointer-events-none absolute -top-10 left-1/2 size-full -translate-x-1/2 rounded-full",
					"bg-[radial-gradient(ellipse_at_center,--theme(--color-foreground/.1),transparent_50%)]",
					"blur-[30px]",
				)}
			/>

			<a href="#">
				<PlayStoreButton />
			</a>
		</div>
	);
}
