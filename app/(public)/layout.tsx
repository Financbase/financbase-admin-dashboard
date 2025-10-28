"use client";

import { PublicFooter } from "@/components/layout/public-footer";
import { ModernNavbar } from "@/components/layout/modern-navbar";

export default function PublicLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen flex flex-col bg-background">
			<ModernNavbar />
			<main className="flex-1">{children}</main>
			<PublicFooter />
		</div>
	);
}
