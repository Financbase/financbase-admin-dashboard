/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { ShareCard } from "@/components/ui/share-card";
import * as React from "react";

// Example folder ID - in a real app, this would come from props or context
const EXAMPLE_FOLDER_ID = "example-folder-id";

export default function ShareCardDemo() {
	return (
		<div className="flex items-center justify-center h-full p-4 bg-background">
			<ShareCard
				folderId={EXAMPLE_FOLDER_ID}
				folderName="Demo Folder"
				itemCount={42}
			/>
		</div>
	);
}
