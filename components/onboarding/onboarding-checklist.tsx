"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
	CheckCircle, 
	Clock, 
	ArrowRight, 
	X,
	ChevronDown,
	ChevronUp
} from "lucide-react";
import { OnboardingProgress } from "@/lib/services/onboarding/onboarding-service";
import { getOnboardingFlow } from "@/lib/data/onboarding-flows";

interface OnboardingChecklistProps {
	onboarding?: OnboardingProgress | null;
	onDismiss?: () => void;
	showDismiss?: boolean;
}

export function OnboardingChecklist({ 
	onboarding, 
	onDismiss, 
	showDismiss = true 
}: OnboardingChecklistProps) {
	const router = useRouter();
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// If no onboarding provided, try to fetch it
	useEffect(() => {
		if (!onboarding) {
			fetchOnboardingStatus();
		}
	}, [onboarding]);

	const fetchOnboardingStatus = async () => {
		try {
			const response = await fetch("/api/onboarding");
			const data = await response.json();
			
			if (data.success && data.onboarding) {
				// If onboarding is complete, don't show the checklist
				if (data.onboarding.userOnboarding.status === "completed") {
					return;
				}
			}
		} catch (error) {
			console.error("Error fetching onboarding status:", error);
		}
	};

	if (!onboarding) {
		return null;
	}

	// Don't show if onboarding is complete
	if (onboarding.userOnboarding.status === "completed") {
		return null;
	}

	const flow = getOnboardingFlow(onboarding.userOnboarding.persona);
	const progressPercentage = onboarding.progress.percentage;

	const handleResumeOnboarding = () => {
		router.push("/onboarding");
	};

	const handleDismiss = () => {
		if (onDismiss) {
			onDismiss();
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "completed":
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case "in_progress":
				return <Clock className="h-4 w-4 text-blue-500" />;
			default:
				return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case "completed":
				return "Completed";
			case "in_progress":
				return "In Progress";
			case "skipped":
				return "Skipped";
			default:
				return "Not Started";
		}
	};

	return (
		<Card className="border-blue-200 bg-blue-50">
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<CardTitle className="text-lg font-semibold text-blue-900">
							🎯 Complete Your Setup
						</CardTitle>
						<Badge variant="outline" className="text-blue-600 border-blue-300">
							{progressPercentage}% Complete
						</Badge>
					</div>
					<div className="flex items-center space-x-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsCollapsed(!isCollapsed)}
							className="text-blue-600 hover:text-blue-700"
						>
							{isCollapsed ? (
								<ChevronDown className="h-4 w-4" />
							) : (
								<ChevronUp className="h-4 w-4" />
							)}
						</Button>
						{showDismiss && (
							<Button
								variant="ghost"
								size="sm"
								onClick={handleDismiss}
								className="text-gray-500 hover:text-gray-700"
							>
								<X className="h-4 w-4" />
							</Button>
						)}
					</div>
				</div>
			</CardHeader>

			{!isCollapsed && (
				<CardContent className="pt-0">
					<div className="space-y-4">
						{/* Progress Bar */}
						<div className="space-y-2">
							<div className="flex justify-between text-sm text-blue-700">
								<span>{onboarding.progress.completed} of {onboarding.progress.total} steps completed</span>
								<span>{flow.estimatedTime} min estimated</span>
							</div>
							<Progress value={progressPercentage} className="h-2" />
						</div>

						{/* Steps List */}
						<div className="space-y-2">
							{flow.steps.slice(0, 3).map((step, index) => {
								const stepStatus = onboarding.steps.find(s => s.stepId === step.stepId);
								const status = stepStatus?.status || "not_started";
								
								return (
									<div key={step.stepId} className="flex items-center space-x-3 py-2">
										{getStatusIcon(status)}
										<div className="flex-1">
											<p className="text-sm font-medium text-blue-900">
												{step.stepName}
											</p>
											<p className="text-xs text-blue-600">
												{getStatusText(status)}
											</p>
										</div>
										{step.isRequired && (
											<Badge variant="destructive" className="text-xs">
												Required
											</Badge>
										)}
									</div>
								);
							})}
							
							{flow.steps.length > 3 && (
								<p className="text-xs text-blue-600 text-center">
									+{flow.steps.length - 3} more steps
								</p>
							)}
						</div>

						{/* Action Buttons */}
						<div className="flex items-center justify-between pt-2 border-t border-blue-200">
							<Button
								onClick={handleResumeOnboarding}
								disabled={isLoading}
								size="sm"
								className="bg-blue-600 hover:bg-blue-700"
							>
								{isLoading ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
										Loading...
									</>
								) : (
									<>
										Continue Setup
										<ArrowRight className="h-4 w-4 ml-1" />
									</>
								)}
							</Button>
							
							<Button
								variant="ghost"
								size="sm"
								onClick={() => router.push("/onboarding/skip")}
								className="text-blue-600 hover:text-blue-700"
							>
								Skip for now
							</Button>
						</div>
					</div>
				</CardContent>
			)}
		</Card>
	);
}
