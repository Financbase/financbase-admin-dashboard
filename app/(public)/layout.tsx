/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { PublicFooter } from "@/components/layout/public-footer";
import { ModernNavbar } from "@/components/layout/modern-navbar";
import { PageAnimationWrapper } from "@/components/layout/public-page-animations";
import { FloatingPaths } from "@/components/auth/floating-paths";

export default function PublicLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="relative min-h-screen flex flex-col bg-background">
			{/* Global Floating Paths Background Animation - Same as sign-up page */}
			<div className="fixed inset-0 z-0 pointer-events-none">
				<FloatingPaths position={1} />
				<FloatingPaths position={-1} />
			</div>
			<div className="fixed inset-0 z-[1] bg-gradient-to-t from-background to-transparent pointer-events-none" />
			
			<div className="relative z-10 min-h-screen flex flex-col">
				<ModernNavbar />
				<main className="flex-1">
					<PageAnimationWrapper delay={0.1}>
						{children}
					</PageAnimationWrapper>
				</main>
				<PageAnimationWrapper delay={0.2}>
					<PublicFooter />
				</PageAnimationWrapper>
			</div>
		</div>
	);
}
