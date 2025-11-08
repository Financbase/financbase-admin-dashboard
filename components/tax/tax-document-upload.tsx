/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/core/ui/forms/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCreateTaxDocument } from "@/hooks/use-tax";
import { useUser } from "@clerk/nextjs";
import {
	createTaxDocumentSchema,
	type CreateTaxDocumentInput,
} from "@/lib/validation-schemas";
import { Loader2, Upload, FileText, X } from "lucide-react";
import { toast } from "sonner";

const documentTypes = [
	{ value: "w2", label: "W-2 Form" },
	{ value: "1099", label: "1099 Form" },
	{ value: "tax_return", label: "Tax Return" },
	{ value: "receipt", label: "Receipt" },
	{ value: "invoice", label: "Invoice" },
	{ value: "expense_report", label: "Expense Report" },
	{ value: "other", label: "Other" },
];

interface TaxDocumentUploadProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

export function TaxDocumentUpload({
	open,
	onOpenChange,
	onSuccess,
}: TaxDocumentUploadProps) {
	const { user } = useUser();
	const createMutation = useCreateTaxDocument();
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isUploading, setIsUploading] = useState(false);
	const [fileUrl, setFileUrl] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const currentYear = new Date().getFullYear();

	const form = useForm<Omit<CreateTaxDocumentInput, "fileUrl" | "fileSize" | "fileName" | "mimeType">>({
		resolver: zodResolver(
			createTaxDocumentSchema.omit({
				fileUrl: true,
				fileSize: true,
				fileName: true,
				mimeType: true,
			})
		),
		defaultValues: {
			userId: user?.id || "",
			name: "",
			type: "receipt",
			year: currentYear,
			description: "",
		},
	});

	const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file type
		const allowedTypes = [
			"image/jpeg",
			"image/png",
			"image/gif",
			"image/webp",
			"application/pdf",
			"application/msword",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		];
		if (!allowedTypes.includes(file.type)) {
			toast.error("Invalid file type. Please upload PDF, images, or Word documents.");
			return;
		}

		// Validate file size (10MB max)
		const maxSize = 10 * 1024 * 1024;
		if (file.size > maxSize) {
			toast.error("File size must be less than 10MB");
			return;
		}

		setSelectedFile(file);
	}, []);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();

			const file = e.dataTransfer.files[0];
			if (file) {
				const event = {
					target: { files: [file] },
				} as any;
				handleFileSelect(event);
			}
		},
		[handleFileSelect]
	);

	const uploadFile = async (file: File): Promise<string> => {
		setIsUploading(true);
		setUploadProgress(0);

		try {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("folder", "tax-documents");

			// Simulate progress
			const progressInterval = setInterval(() => {
				setUploadProgress((prev) => {
					if (prev >= 90) {
						clearInterval(progressInterval);
						return 90;
					}
					return prev + 10;
				});
			}, 200);

			// Use uploadthing for document uploads
			const response = await fetch("/api/uploadthing?endpoint=documentUploader", {
				method: "POST",
				body: formData,
			});

			clearInterval(progressInterval);
			setUploadProgress(100);

			if (!response.ok) {
				throw new Error("Upload failed");
			}

			const result = await response.json();
			// Uploadthing returns the URL in different formats depending on the response
			const url = result.url || result.data?.url || result.file?.url || (Array.isArray(result) && result[0]?.url);

			if (!url) {
				throw new Error("No URL returned from upload");
			}

			return url;
		} catch (error) {
			setIsUploading(false);
			setUploadProgress(0);
			throw error;
		} finally {
			setIsUploading(false);
		}
	};

	const onSubmit = async (
		data: Omit<CreateTaxDocumentInput, "fileUrl" | "fileSize" | "fileName" | "mimeType">
	) => {
		if (!selectedFile) {
			toast.error("Please select a file to upload");
			return;
		}

		try {
			// Upload file first
			const uploadedUrl = await uploadFile(selectedFile);

			// Create document record
			await createMutation.mutateAsync({
				...data,
				fileUrl: uploadedUrl,
				fileSize: selectedFile.size,
				fileName: selectedFile.name,
				mimeType: selectedFile.type,
			} as CreateTaxDocumentInput);

			onOpenChange(false);
			form.reset();
			setSelectedFile(null);
			setFileUrl(null);
			setUploadProgress(0);
			onSuccess?.();
		} catch (error) {
			console.error("Failed to upload document:", error);
			toast.error("Failed to upload document. Please try again.");
		}
	};

	const removeFile = () => {
		setSelectedFile(null);
		setFileUrl(null);
		setUploadProgress(0);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Upload Tax Document</DialogTitle>
					<DialogDescription>
						Upload a tax-related document for your records
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Document Name *</FormLabel>
										<FormControl>
											<Input
												placeholder="e.g., 2024 Tax Summary"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="type"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Document Type *</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select type" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{documentTypes.map((type) => (
													<SelectItem key={type.value} value={type.value}>
														{type.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="year"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Year *</FormLabel>
									<FormControl>
										<Input
											type="number"
											min="2000"
											max="2100"
											placeholder={currentYear.toString()}
											{...field}
											onChange={(e) =>
												field.onChange(parseInt(e.target.value) || currentYear)
											}
											value={field.value || ""}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Additional details about this document"
											{...field}
											value={field.value || ""}
											rows={3}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* File Upload Area */}
						<div className="space-y-2">
							<FormLabel>File *</FormLabel>
							{!selectedFile ? (
								<div
									onDragOver={handleDragOver}
									onDrop={handleDrop}
									className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
									onClick={() => fileInputRef.current?.click()}
								>
									<Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
									<p className="text-sm font-medium mb-2">
										Click to upload or drag and drop
									</p>
									<p className="text-xs text-muted-foreground">
										PDF, Images, or Word documents (max 10MB)
									</p>
									<input
										ref={fileInputRef}
										type="file"
										className="hidden"
										onChange={handleFileSelect}
										accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx"
									/>
								</div>
							) : (
								<div className="border rounded-lg p-4">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<FileText className="h-5 w-5 text-muted-foreground" />
											<div>
												<p className="text-sm font-medium">{selectedFile.name}</p>
												<p className="text-xs text-muted-foreground">
													{formatFileSize(selectedFile.size)}
												</p>
											</div>
										</div>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={removeFile}
											disabled={isUploading}
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
									{isUploading && (
										<div className="mt-2">
											<div className="flex items-center gap-2 mb-1">
												<Loader2 className="h-4 w-4 animate-spin" />
												<span className="text-xs text-muted-foreground">
													Uploading... {uploadProgress}%
												</span>
											</div>
										</div>
									)}
								</div>
							)}
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									onOpenChange(false);
									removeFile();
								}}
								disabled={isUploading || createMutation.isPending}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={!selectedFile || isUploading || createMutation.isPending}
							>
								{(isUploading || createMutation.isPending) && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								Upload Document
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

