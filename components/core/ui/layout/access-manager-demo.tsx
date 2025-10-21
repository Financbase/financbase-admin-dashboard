"use client";

import { AccessManagerCard } from "@/components/ui/access-manager-card";
import { Folder, ShieldCheck, Users } from "lucide-react";
import * as React from "react";

export default function AccessManagerDemo() {
	// For demo purposes, we'll create a mock folder ID
	// In a real app, this would come from the URL or context
	const folderId = 1; // This would be dynamic in a real implementation

	return (
		<div className="flex h-full min-h-screen items-center justify-center bg-background p-6">
			<AccessManagerCard
				folderId={folderId}
				title="Project Access"
				description="Manage team permissions easily."
				folderName="AI Research Docs"
				itemCount={48}
				folderIcon={<ShieldCheck className="h-6 w-6 text-primary" />}
			/>
		</div>
	);
}
