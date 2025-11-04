/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
	AlertCircle,
	ArrowUp,
	CheckCircle,
	Code,
	File,
	FileText,
	Filter,
	Folder,
	Image as ImageIcon,
	Key,
	Loader2,
	MessageCircle,
	Upload,
	X,
	XCircle,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

interface FileUploadProps {
	onUploadComplete?: (files: UploadedFile[]) => void;
	onUploadError?: (error: string) => void;
	folder?: string;
	maxFiles?: number;
	maxFileSize?: number; // in MB
	acceptedTypes?: string[];
	className?: string;
}

interface UploadedFile {
	id: number;
	filename: string;
	originalName: string;
	url: string;
	size: number;
	type: string;
	uploadedAt: string;
}

interface UploadProgress {
	file: File;
	progress: number;
	status: "uploading" | "completed" | "error";
	error?: string;
}

const FileUpload = ({
	onUploadComplete,
	onUploadError,
	folder = "uploads",
	maxFiles = 5,
	maxFileSize = 10,
	acceptedTypes = ["image/*", ".pdf", ".doc", ".docx", ".txt"],
	className = "",
}: FileUploadProps) => {
	const [files, setFiles] = useState<File[]>([]);
	const [uploads, setUploads] = useState<UploadProgress[]>([]);
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const maxFileSizeBytes = maxFileSize * 1024 * 1024;

	const getFileIcon = (_type: string) => {
		if (type.startsWith("image/")) {
			return <ImageIcon className="h-4 w-4" />;
		}
		if (type === "application/pdf") {
			return <FileText className="h-4 w-4" />;
		}
		return <File className="h-4 w-4" />;
	};

	const formatFileSize = (_bytes: number) => {
		const bytes = _bytes === 0;
		if (bytes) {
			return "0 Bytes";
		}
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
	};

	const validateFile = (file: File): string | null => {
		if (file.size > maxFileSizeBytes) {
			return `File size exceeds ${maxFileSize}MB limit`;
		}

		const isAccepted = acceptedTypes.some((type) => {
			if (type.startsWith(".")) {
				return file.name.toLowerCase().endsWith(type.toLowerCase());
			}
			return file.type.match(type.replace(/\*/g, ".*"));
		});

		if (!isAccepted) {
			return "File type not supported";
		}

		return null;
	};

	const handleFileSelect = useCallback(
		(selectedFiles: FileList | null) => {
			if (!selectedFiles) {
				return;
			}

			const newFiles = Array.from(selectedFiles);
			const validFiles: File[] = [];
			const errors: string[] = [];

			for (const file of newFiles) {
				const error = validateFile(file);
				if (error) {
					errors.push(`${file.name}: ${error}`);
				} else {
					validFiles.push(file);
				}
			}

			if (errors.length > 0) {
				errors.forEach((error) => toast.error(error));
				onUploadError?.(errors.join("; "));
			}

			if (validFiles.length > 0) {
				const totalFiles = files.length + validFiles.length;
				if (totalFiles > maxFiles) {
					toast.error(`Maximum ${maxFiles} files allowed`);
					return;
				}

				setFiles((prev) => [...prev, ...validFiles]);
			}
		},
		[files, maxFiles, maxFileSizeBytes, acceptedTypes, onUploadError],
	);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setIsDragging(false);
			handleFileSelect(e.dataTransfer.files);
		},
		[handleFileSelect],
	);

	const removeFile = (index: number) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
	};

	const uploadFiles = async () => {
		if (files.length === 0) {
			return;
		}

		const uploadPromises = files.map(async (file, index) => {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("folder", folder);

			setUploads((prev) => [
				...prev,
				{ file, progress: 0, status: "uploading" },
			]);

			try {
				const response = await fetch("/api/upload", {
					method: "POST",
					body: formData,
				});

				if (!response.ok) {
					throw new Error("Upload failed");
				}

				const result = await response.json();

				setUploads((prev) =>
					prev.map((upload, i) =>
						i === index
							? { ...upload, progress: 100, status: "completed" as const }
							: upload,
					),
				);

				return result.file;
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "Upload failed";
				setUploads((prev) =>
					prev.map((upload, i) =>
						i === index
							? {
									...upload,
									progress: 0,
									status: "error" as const,
									error: errorMessage,
								}
							: upload,
					),
				);
				throw error;
			}
		});

		try {
			const uploadedFiles = await Promise.all(uploadPromises);
			toast.success(`Successfully uploaded ${uploadedFiles.length} file(s)`);
			onUploadComplete?.(uploadedFiles);
			setFiles([]);
			setUploads([]);
		} catch (_error) {
			toast.error("Some files failed to upload");
			onUploadError?.("Upload failed");
		}
	};

	const clearAll = () => {
		setFiles([]);
		setUploads([]);
	};

	return (
		<div className={`space-y-4 ${className}`}>
			{/* Upload Area */}
			<Card>
				<CardContent className="p-6">
					<div
						className={
							`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging}`
								? "border-primary bg-primary/5"
								: "border-gray-300 hover:border-gray-400"
						}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
					>
						<Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
						<div className="space-y-2">
							<p className="text-lg font-medium">
								Drop files here or{" "}
								<button
									type="button"
									className="text-primary hover:underline"
									onClick={() => fileInputRef.current?.click()}
								>
									browse
								</button>
							</p>
							<p className="text-sm text-muted-foreground">
								Support for images, PDFs, and documents up to {maxFileSize}MB
								each
							</p>
							<p className="text-xs text-muted-foreground">
								Maximum {maxFiles} files
							</p>
						</div>
						<Input
							ref={fileInputRef}
							type="file"
							multiple={true}
							accept={acceptedTypes.join(",")}
							className="hidden"
							onChange={(e) => handleFileSelect(e.target.files)}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Selected Files */}
			{files.length > 0 && (
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between mb-4">
							<h3 className="font-medium">Selected Files ({files.length})</h3>
							<Button variant="outline" size="sm" onClick={clearAll}>
								Clear All
							</Button>
						</div>
						<div className="space-y-3">
							{files.map((file, index) => (
								<div
									key={`item-${index}`}
									className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
								>
									{getFileIcon(file.type)}
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium truncate">{file.name}</p>
										<p className="text-xs text-muted-foreground">
											{formatFileSize(file.size)}
										</p>
									</div>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => removeFile(index)}
										className="text-red-600 hover:text-red-700"
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							))}
						</div>
						<div className="mt-4 flex justify-end">
							<Button
								onClick={uploadFiles}
								disabled={uploads.some((u) => u.status === "uploading")}
							>
								{uploads.some((u) => u.status === "uploading") && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								Upload {files.length} File{files.length !== 1 ? "s" : ""}
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Upload Progress */}
			{uploads.length > 0 && (
				<Card>
					<CardContent className="p-4">
						<h3 className="font-medium mb-4">Upload Progress</h3>
						<div className="space-y-3">
							{uploads.map((upload, index) => (
								<div key={`item-${index}`} className="space-y-2">
									<div className="flex items-center justify-between">
										<div className="flex items-center space-x-2">
											{getFileIcon(upload.file.type)}
											<span className="text-sm font-medium">
												{upload.file.name}
											</span>
										</div>
										<div className="flex items-center space-x-2">
											{upload.status === "uploading" && (
												<Loader2 className="h-4 w-4 animate-spin" />
											)}
											{upload.status === "completed" && (
												<CheckCircle className="h-4 w-4 text-green-600" />
											)}
											{upload.status === "error" && (
												<AlertCircle className="h-4 w-4 text-red-600" />
											)}
											<span className="text-xs text-muted-foreground">
												{upload.status === "completed"
													? "100%"
													: upload.status === "error"
														? "Failed"
														: "Uploading..."}
											</span>
										</div>
									</div>
									<Progress value={upload.progress} className="h-2" />
									{upload.error && (
										<Alert className="border-red-200 bg-red-50">
											<AlertCircle className="h-4 w-4 text-red-600" />
											<AlertDescription className="text-red-800 text-sm">
												{upload.error}
											</AlertDescription>
										</Alert>
									)}
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default FileUpload;
