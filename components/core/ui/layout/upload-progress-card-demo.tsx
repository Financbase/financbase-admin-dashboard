/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { Button } from "@/components/ui/button";
import { UploadProgressCard } from "@/components/ui/progress-card";
import { FileText } from "lucide-react";
import React, { useState, useEffect } from "react";
import { logger } from '@/lib/logger';

export default function UploadProgressCardDemo() {
	const [progress, setProgress] = useState(0);
	const [isUploading, setIsUploading] = useState(false);
	const [status, setStatus] = useState<"uploading" | "complete">("uploading");

	// Simulate upload progress
	useEffect(() => {
		let interval: NodeJS.Timeout | null = null;
		if (isUploading && progress < 100) {
			interval = setInterval(() => {
				setProgress((prev) => {
					const next = prev + Math.random() * 10;
					if (next >= 100) {
						clearInterval(interval!);
						setIsUploading(false);
						setStatus("complete");
						return 100;
					}
					return next;
				});
			}, 300);
		}
		return () => {
			if (interval) clearInterval(interval);
		};
	}, [isUploading, progress]);

	const handleStartUpload = () => {
		setProgress(0);
		setStatus("uploading");
		setIsUploading(true);
	};

	const handleCancel = () => {
		setIsUploading(false);
		logger.info("Upload cancelled by user.");
	};

	return (
		<div className="flex w-full flex-col items-center space-y-4 p-4">
			{!isUploading && progress === 0 && (
				<Button onClick={handleStartUpload}>Simulate File Upload</Button>
			)}

			{(isUploading || progress > 0) && (
				<UploadProgressCard
					fileName="Brief new project.pdf"
					fileSize={8100000} // 8.1 MB in bytes
					progress={progress}
					status={status}
					onCancel={handleCancel}
					icon={<FileText className="h-8 w-8 text-red-500" />}
				/>
			)}
		</div>
	);
}
