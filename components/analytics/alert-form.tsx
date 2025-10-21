"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Save, X, Bell, AlertTriangle, Info, CheckCircle } from "lucide-react";

interface AlertFormProps {
	mode?: "create" | "edit";
	alertId?: string;
	onSubmit?: (data: any) => void;
	onCancel?: () => void;
}

export function AlertForm({ mode = "create", alertId, onSubmit, onCancel }: AlertFormProps) {
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		type: "info",
		severity: "medium",
		enabled: true,
		conditions: "",
		notificationChannels: ["email"],
		recipients: "",
	});

	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
			onSubmit?.(formData);
		} catch (error) {
			console.error("Error saving alert:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleInputChange = (field: string, value: any) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	return (
		<Card className="max-w-4xl mx-auto">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Bell className="h-5 w-5" />
					{mode === "create" ? "Create New Alert" : "Edit Alert"}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Basic Information */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Basic Information</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="name">Alert Name *</Label>
								<Input
									id="name"
									value={formData.name}
									onChange={(e) => handleInputChange("name", e.target.value)}
									placeholder="Revenue Drop Alert"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="type">Alert Type</Label>
								<Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="info">Information</SelectItem>
										<SelectItem value="warning">Warning</SelectItem>
										<SelectItem value="error">Error</SelectItem>
										<SelectItem value="success">Success</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="severity">Severity Level</Label>
								<Select value={formData.severity} onValueChange={(value) => handleInputChange("severity", value)}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="low">Low</SelectItem>
										<SelectItem value="medium">Medium</SelectItem>
										<SelectItem value="high">High</SelectItem>
										<SelectItem value="critical">Critical</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={formData.description}
								onChange={(e) => handleInputChange("description", e.target.value)}
								placeholder="Describe when this alert should trigger..."
								rows={3}
							/>
						</div>
					</div>

					{/* Conditions */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Alert Conditions</h3>
						<div className="space-y-2">
							<Label htmlFor="conditions">Trigger Conditions</Label>
							<Textarea
								id="conditions"
								value={formData.conditions}
								onChange={(e) => handleInputChange("conditions", e.target.value)}
								placeholder="e.g., Revenue < $10,000 OR Error Rate > 5%"
								rows={3}
							/>
						</div>
					</div>

					{/* Notification Settings */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Notification Settings</h3>

						<div className="flex items-center space-x-2">
							<Switch
								id="enabled"
								checked={formData.enabled}
								onCheckedChange={(checked) => handleInputChange("enabled", checked)}
							/>
							<Label htmlFor="enabled">Enable Alert</Label>
						</div>

						<div className="space-y-2">
							<Label>Notification Channels</Label>
							<div className="flex flex-wrap gap-2">
								{["email", "slack", "sms", "webhook"].map((channel) => (
									<Badge
										key={channel}
										variant={formData.notificationChannels.includes(channel) ? "default" : "outline"}
										className="cursor-pointer"
										onClick={() => {
											const channels = formData.notificationChannels.includes(channel)
												? formData.notificationChannels.filter(c => c !== channel)
												: [...formData.notificationChannels, channel];
											handleInputChange("notificationChannels", channels);
										}}
									>
										{channel}
									</Badge>
								))}
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="recipients">Recipients (Email addresses, comma-separated)</Label>
							<Input
								id="recipients"
								value={formData.recipients}
								onChange={(e) => handleInputChange("recipients", e.target.value)}
								placeholder="admin@company.com, manager@company.com"
							/>
						</div>
					</div>

					{/* Form Actions */}
					<div className="flex justify-end space-x-2 pt-6 border-t">
						<Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
							<X className="h-4 w-4 mr-2" />
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? (
								<>Processing...</>
							) : (
								<>
									<Save className="h-4 w-4 mr-2" />
									{mode === "create" ? "Create Alert" : "Update Alert"}
								</>
							)}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
