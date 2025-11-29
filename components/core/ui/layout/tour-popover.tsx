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
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useTour } from "@/hooks/use-tour";
import {
import { logger } from '@/lib/logger';
	AlertCircle,
	Headphones,
	HelpCircle,
	Home,
	Info,
	Keyboard,
	type LucideIcon,
	Minus,
	Settings,
	Users,
	XCircle,
} from "lucide-react";

interface TourStep {
	icon: LucideIcon;
	title: string;
	description: string;
}

const tourSteps: TourStep[] = [
	{
		icon: Home,
		title: "Workspace",
		description:
			"This is your workspace. Here you can manage projects, activities, and settings.",
	},
	{
		icon: Settings,
		title: "Toolbar & Settings",
		description:
			"Use the toolbar to create new projects, invite team members, or adjust your preferences.",
	},
	{
		icon: HelpCircle,
		title: "Support",
		description:
			"Need help? Click the support icon in the top-right corner to access our help center and documentation.",
	},
	{
		icon: Keyboard,
		title: "Command Palette",
		description:
			"Press ⌘K to open the command palette for quick navigation and actions.",
	},
];

function TourPopover() {
	const {
		currentStep,
		completedSteps,
		isCompleted,
		isLoading,
		error,
		nextStep,
		prevStep,
		restartTour,
	} = useTour();

	const currentStepData = tourSteps[currentStep];
	if (!currentStepData) {
		return (
			<Button variant="outline" disabled>
				Tour unavailable
			</Button>
		);
	}

	const Icon = currentStepData.icon;
	const progress = ((currentStep + 1) / tourSteps.length) * 100;

	const handleNext = async () => {
		try {
			await nextStep();
		} catch (err) {
			logger.error("Error advancing to next step:", err);
		}
	};

	const handlePrev = async () => {
		try {
			await prevStep();
		} catch (err) {
			logger.error("Error going to previous step:", err);
		}
	};

	const handleRestart = async () => {
		try {
			await restartTour();
		} catch (err) {
			logger.error("Error restarting tour:", err);
		}
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" disabled={isLoading}>
					{isLoading ? "Loading..." : "Start tour"}
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-80 space-y-4 p-4"
				side="bottom"
				align="center"
			>
				{/* Error display */}
				{error && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							Failed to load tour progress. Please try again.
						</AlertDescription>
					</Alert>
				)}

				{/* Step header */}
				<div className="flex items-center gap-3">
					<div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
						<Icon size={20} />
					</div>
					<div>
						<p className="text-sm font-medium">{currentStepData.title}</p>
						<p className="text-xs text-muted-foreground">
							Step {currentStep + 1} of {tourSteps.length}
						</p>
					</div>
				</div>

				<Separator />

				{/* Description */}
				<p className="text-sm leading-relaxed">{currentStepData.description}</p>

				{/* Progress bar */}
				<Progress value={progress} className="h-2" />

				{/* Controls */}
				<div className="flex items-center justify-between pt-1">
					{currentStep > 0 ? (
						<Button
							variant="ghost"
							size="sm"
							onClick={handlePrev}
							disabled={isLoading}
						>
							Back
						</Button>
					) : (
						<div />
					)}

					{isCompleted || currentStep === tourSteps.length - 1 ? (
						<Button size="sm" onClick={handleRestart} disabled={isLoading}>
							Restart
						</Button>
					) : (
						<Button size="sm" onClick={handleNext} disabled={isLoading}>
							Next
						</Button>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}

export { TourPopover };
