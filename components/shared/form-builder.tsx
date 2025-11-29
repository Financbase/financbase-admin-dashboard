"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
// Validation patterns - define locally if module doesn't exist
const VALIDATION_PATTERNS: Record<string, RegExp> = {
	email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
	phone: /^\+?[\d\s\-()]+$/,
	url: /^https?:\/\/.+/,
	zipCode: /^\d{5}(-\d{4})?$/,
};

type ValidationPatternKey = keyof typeof VALIDATION_PATTERNS;

const safeRegex = (pattern: string): RegExp => {
	try {
		return new RegExp(pattern);
	} catch {
		return /.*/; // Default to match all
	}
};
import {
	AlertCircle,
	CheckCircle2,
	Eye,
	EyeOff,
	File,
	MessageCircle,
	Plus,
	Save,
	Shield,
	Trash2,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { logger } from '@/lib/logger';

export type FieldType =
	| "text"
	| "email"
	| "password"
	| "number"
	| "textarea"
	| "select"
	| "checkbox"
	| "radio"
	| "date"
	| "file";

export interface FormField {
	id: string;
	type: FieldType;
	label: string;
	placeholder?: string;
	required?: boolean;
	options?: string[];
	validation?: {
		min?: number;
		max?: number;
		pattern?: string; // Use predefined ValidationPatternKey for security
		patternKey?: ValidationPatternKey; // Recommended: use safe predefined patterns
		message?: string;
	};
}

export interface FormBuilderProps {
	fields: FormField[];
	onSubmit: (data: Record<string, any>) => void;
	onFieldChange?: (fieldId: string, value: any) => void;
	onFieldAdd?: (field: FormField) => void;
	onFieldRemove?: (fieldId: string) => void;
	onFieldUpdate?: (fieldId: string, updates: Partial<FormField>) => void;
	loading?: boolean;
	submitLabel?: string;
	showPreview?: boolean;
	editable?: boolean;
}

export function FormBuilder({
	fields,
	onSubmit,
	onFieldChange,
	onFieldAdd,
	onFieldRemove,
	onFieldUpdate,
	loading = false,
	submitLabel = "Submit",
	showPreview = false,
	editable = false,
}: FormBuilderProps) {
	const [formData, setFormData] = useState<Record<string, any>>({});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [showPreviewMode, setShowPreviewMode] = useState(showPreview);

	const handleFieldChange = (fieldId: string, value: any) => {
		setFormData((prev) => ({ ...prev, [fieldId]: value }));
		onFieldChange?.(fieldId, value);

		// Clear error when user starts typing
		if (errors[fieldId]) {
			setErrors((prev) => ({ ...prev, [fieldId]: "" }));
		}
	};

	const validateField = (field: FormField, value: any): string | null => {
		if (field.required && (!value || value === "")) {
			return `${field.label} is required`;
		}

		if (field.validation) {
			const { min, max, pattern, patternKey, message } = field.validation;

			if (min !== undefined && value < min) {
				return message || `${field.label} must be at least ${min}`;
			}

			if (max !== undefined && value > max) {
				return message || `${field.label} must be at most ${max}`;
			}

			// SECURITY: Use predefined safe patterns instead of dynamic regex
			// This prevents Regular Expression Denial of Service (ReDoS) attacks
			if (patternKey) {
				// Recommended approach: use predefined safe patterns
				const safePattern = VALIDATION_PATTERNS[patternKey];
				if (safePattern && !safePattern.test(value)) {
					return message || `${field.label} format is invalid`;
				}
			} else if (pattern) {
				// Fallback: validate custom pattern with safety checks
				logger.warn(
					`[Security] Using custom regex pattern for field "${field.label}". Consider using predefined patterns via 'patternKey' instead.`,
				);

				const validationRegex = safeRegex(pattern);
				if (validationRegex === null) {
					logger.error(
						`[Security] Unsafe regex pattern rejected for field "${field.label}": ${pattern}`,
					);
					return message || `${field.label} validation pattern is unsafe`;
				}

				if (!validationRegex.test(value)) {
					return message || `${field.label} format is invalid`;
				}
			}
		}

		return null;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const newErrors: Record<string, string> = {};
		let hasErrors = false;

		fields.forEach((field) => {
			const error = validateField(field, formData[field.id]);
			if (error) {
				newErrors[field.id] = error;
				hasErrors = true;
			}
		});

		setErrors(newErrors);

		if (!hasErrors) {
			onSubmit(formData);
		}
	};

	const renderField = (field: FormField) => {
		const value = formData[field.id] || "";
		const error = errors[field.id];

		switch (field.type) {
			case "text":
			case "email":
			case "password":
			case "number":
			case "date":
				return (
					<div key={field.id} className="space-y-2">
						<Label htmlFor={field.id}>
							{field.label}
							{field.required && <span className="text-red-500 ml-1">*</span>}
						</Label>
						<Input
							id={field.id}
							type={field.type}
							placeholder={field.placeholder}
							value={value}
							onChange={(e) => handleFieldChange(field.id, e.target.value)}
							className={error ? "border-red-500" : ""}
						/>
						{error && (
							<p className="text-sm text-red-500 flex items-center gap-1">
								<AlertCircle className="h-4 w-4" />
								{error}
							</p>
						)}
					</div>
				);

			case "textarea":
				return (
					<div key={field.id} className="space-y-2">
						<Label htmlFor={field.id}>
							{field.label}
							{field.required && <span className="text-red-500 ml-1">*</span>}
						</Label>
						<Textarea
							id={field.id}
							placeholder={field.placeholder}
							value={value}
							onChange={(e) => handleFieldChange(field.id, e.target.value)}
							className={error ? "border-red-500" : ""}
						/>
						{error && (
							<p className="text-sm text-red-500 flex items-center gap-1">
								<AlertCircle className="h-4 w-4" />
								{error}
							</p>
						)}
					</div>
				);

			case "select":
				return (
					<div key={field.id} className="space-y-2">
						<Label htmlFor={field.id}>
							{field.label}
							{field.required && <span className="text-red-500 ml-1">*</span>}
						</Label>
						<Select
							value={value}
							onValueChange={(value) => handleFieldChange(field.id, value)}
						>
							<SelectTrigger className={error ? "border-red-500" : ""}>
								<SelectValue placeholder={field.placeholder} />
							</SelectTrigger>
							<SelectContent>
								{field.options?.map((option) => (
									<SelectItem key={option} value={option}>
										{option}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{error && (
							<p className="text-sm text-red-500 flex items-center gap-1">
								<AlertCircle className="h-4 w-4" />
								{error}
							</p>
						)}
					</div>
				);

			case "checkbox":
				return (
					<div key={field.id} className="space-y-2">
						<div className="flex items-center space-x-2">
							<Checkbox
								id={field.id}
								checked={value}
								onCheckedChange={(checked) =>
									handleFieldChange(field.id, checked)
								}
							/>
							<Label htmlFor={field.id}>
								{field.label}
								{field.required && <span className="text-red-500 ml-1">*</span>}
							</Label>
						</div>
						{error && (
							<p className="text-sm text-red-500 flex items-center gap-1">
								<AlertCircle className="h-4 w-4" />
								{error}
							</p>
						)}
					</div>
				);

			case "radio":
				return (
					<div key={field.id} className="space-y-2">
						<Label>
							{field.label}
							{field.required && <span className="text-red-500 ml-1">*</span>}
						</Label>
						<RadioGroup
							value={value}
							onValueChange={(value) => handleFieldChange(field.id, value)}
						>
							{field.options?.map((option) => (
								<div key={option} className="flex items-center space-x-2">
									<RadioGroupItem value={option} id={`${field.id}-${option}`} />
									<Label htmlFor={`${field.id}-${option}`}>{option}</Label>
								</div>
							))}
						</RadioGroup>
						{error && (
							<p className="text-sm text-red-500 flex items-center gap-1">
								<AlertCircle className="h-4 w-4" />
								{error}
							</p>
						)}
					</div>
				);

			case "file":
				return (
					<div key={field.id} className="space-y-2">
						<Label htmlFor={field.id}>
							{field.label}
							{field.required && <span className="text-red-500 ml-1">*</span>}
						</Label>
						<Input
							id={field.id}
							type="file"
							onChange={(e) => handleFieldChange(field.id, e.target.files?.[0])}
							className={error ? "border-red-500" : ""}
						/>
						{error && (
							<p className="text-sm text-red-500 flex items-center gap-1">
								<AlertCircle className="h-4 w-4" />
								{error}
							</p>
						)}
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Form Builder</CardTitle>
						<CardDescription>
							{showPreviewMode ? "Preview Mode" : "Edit Mode"} - {fields.length}{" "}
							fields
						</CardDescription>
					</div>
					{editable && (
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setShowPreviewMode(!showPreviewMode)}
							>
								{showPreviewMode ? (
									<EyeOff className="h-4 w-4 mr-2" />
								) : (
									<Eye className="h-4 w-4 mr-2" />
								)}
								{showPreviewMode ? "Edit" : "Preview"}
							</Button>
						</div>
					)}
				</div>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-6">
					{fields.map(renderField)}

					<div className="flex items-center justify-end gap-2 pt-4 border-t">
						<Button type="submit" disabled={loading}>
							{loading ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
									Processing...
								</>
							) : (
								<>
									<Save className="h-4 w-4 mr-2" />
									{submitLabel}
								</>
							)}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
