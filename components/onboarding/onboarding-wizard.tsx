/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
	ChevronLeft, 
	ChevronRight, 
	CheckCircle, 
	Clock, 
	SkipForward,
	ArrowRight,
	Sparkles
} from "lucide-react";
import { OnboardingProgress, StepCompletionData } from "@/lib/services/onboarding/onboarding-service";
import { getOnboardingFlow, getNextStep, getPreviousStep } from "@/lib/data/onboarding-flows";
import { Persona } from "@/lib/db/schemas/onboarding.schema";
import { toast } from "sonner";

// Import step components
import { AgencyWelcomeStep } from "./steps/agency-welcome-step";
import { AgencyImportDataStep } from "./steps/agency-import-data-step";
import { ConnectSlackStep } from "./steps/connect-slack-step";
import { AgencyInvoiceExpenseStep } from "./steps/agency-invoice-expense-step";
import { AgencyDashboardStep } from "./steps/agency-dashboard-step";
import { InviteTeamStep } from "./steps/invite-team-step";
import { RealEstateWelcomeStep } from "./steps/real-estate-welcome-step";
import { RealEstatePropertyStep } from "./steps/real-estate-property-step";
import { RealEstateRentalDetailsStep } from "./steps/real-estate-rental-details-step";
import { RealEstateOwnerStatementStep } from "./steps/real-estate-owner-statement-step";
import { RealEstatePortfolioDashboardStep } from "./steps/real-estate-portfolio-dashboard-step";
import { InviteStakeholdersStep } from "./steps/invite-stakeholders-step";
import { StartupWelcomeStep } from "./steps/startup-welcome-step";
import { StartupDataImportStep } from "./steps/startup-data-import-step";
import { ConnectStripeStep } from "./steps/connect-stripe-step";
import { BurnRateDashboardStep } from "./steps/burn-rate-dashboard-step";
import { SetupWorkflowsStep } from "./steps/setup-workflows-step";
import { InviteAdvisorsStep } from "./steps/invite-advisors-step";
import { FreelancerWelcomeStep } from "./steps/freelancer-welcome-step";
import { FreelancerProfileStep } from "./steps/freelancer-profile-step";
import { CreateInvoiceStep } from "./steps/create-invoice-step";
import { ExpenseTrackingStep } from "./steps/expense-tracking-step";
import { BusinessHealthStep } from "./steps/business-health-step";
import { logger } from '@/lib/logger';

interface OnboardingWizardProps {
	onboarding: OnboardingProgress;
	persona: Persona;
	onStepComplete: (stepId: string, data: Record<string, any>) => Promise<void>;
	onStepSkip: (stepId: string) => Promise<void>;
	onComplete: () => void;
}

// Step components mapping
const stepComponents: Record<string, React.ComponentType<any>> = {
	// Agency steps
	AgencyWelcomeStep,
	AgencyImportDataStep,
	ConnectSlackStep,
	AgencyInvoiceExpenseStep,
	AgencyDashboardStep,
	InviteTeamStep,
	
	// Real Estate steps
	RealEstateWelcomeStep,
	RealEstatePropertyStep,
	RealEstateRentalDetailsStep,
	RealEstateOwnerStatementStep,
	RealEstatePortfolioDashboardStep,
	InviteStakeholdersStep,
	
	// Tech Startup steps
	StartupWelcomeStep,
	StartupDataImportStep,
	ConnectStripeStep,
	BurnRateDashboardStep,
	SetupWorkflowsStep,
	InviteAdvisorsStep,
	
	// Freelancer steps
	FreelancerWelcomeStep,
	FreelancerProfileStep,
	CreateInvoiceStep,
	ExpenseTrackingStep,
	BusinessHealthStep,
};

export function OnboardingWizard({ 
	onboarding, 
	persona, 
	onStepComplete, 
	onStepSkip, 
	onComplete 
}: OnboardingWizardProps) {
	const router = useRouter();
	const [currentStepIndex, setCurrentStepIndex] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [stepData, setStepData] = useState<Record<string, any>>({});
	const [startTime, setStartTime] = useState<Date>(new Date());

	const flow = getOnboardingFlow(persona);
	const currentStep = flow.steps[currentStepIndex];
	const isLastStep = currentStepIndex === flow.steps.length - 1;
	const isFirstStep = currentStepIndex === 0;

	// Render the appropriate step component
	const renderStepComponent = () => {
		// Map step IDs to components (matching flow definitions)
		const stepIdToComponent: Record<string, string> = {
			// Digital Agency steps
			'import_clients': 'AgencyImportDataStep',
			'setup_slack': 'ConnectSlackStep',
			'invoice_demo': 'AgencyInvoiceExpenseStep',
			'profitability_dashboard': 'AgencyDashboardStep',
			'invite_team': 'InviteTeamStep',
			// Real Estate steps
			'add_property': 'RealEstatePropertyStep',
			'rental_details': 'RealEstateRentalDetailsStep',
			'owner_statement': 'RealEstateOwnerStatementStep',
			'portfolio_dashboard': 'RealEstatePortfolioDashboardStep',
			'invite_stakeholders': 'InviteStakeholdersStep',
			// Tech Startup steps
			'import_financials': 'StartupDataImportStep',
			'connect_stripe': 'ConnectStripeStep',
			'burn_rate_dashboard': 'BurnRateDashboardStep',
			'setup_workflows': 'SetupWorkflowsStep',
			'invite_advisors': 'InviteAdvisorsStep',
			// Freelancer steps
			'setup_profile': 'FreelancerProfileStep',
			'create_invoice': 'CreateInvoiceStep',
			'expense_tracking': 'ExpenseTrackingStep',
			'business_health': 'BusinessHealthStep',
		};
		
		const componentName = stepIdToComponent[currentStep.stepId] || currentStep.stepId;
		const StepComponent = stepComponents[componentName];
		if (!StepComponent) {
			return (
				<div className="min-h-[200px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
					<div className="text-center text-gray-500">
						<p className="text-lg font-medium">Step Component Not Found</p>
						<p className="text-sm">Step ID: {currentStep.stepId}</p>
						<p className="text-xs mt-2">Component: {componentName}</p>
					</div>
				</div>
			);
		}

		return (
			<StepComponent
				onComplete={(data: any) => handleStepComplete(data)}
				onSkip={() => handleSkip()}
			/>
		);
	};

	// Auto-save progress every 30 seconds
	useEffect(() => {
		const interval = setInterval(() => {
			if (Object.keys(stepData).length > 0) {
				// Auto-save current step data
				logger.info("Auto-saving step data:", stepData);
			}
		}, 30000);

		return () => clearInterval(interval);
	}, [stepData]);

	const handleNext = useCallback(async () => {
		if (!currentStep) return;

		setIsLoading(true);
		try {
			// Complete current step
			await onStepComplete(currentStep.stepId, stepData);
			
			// Move to next step or complete onboarding
			if (isLastStep) {
				onComplete();
			} else {
				setCurrentStepIndex(prev => prev + 1);
				setStepData({});
			}
			
			toast.success("Step completed successfully!");
		} catch (error) {
			logger.error("Error completing step:", error);
			toast.error("Failed to complete step. Please try again.");
		} finally {
			setIsLoading(false);
		}
	}, [currentStep, stepData, isLastStep, onStepComplete, onComplete]);

	const handleStepComplete = useCallback(async (data: any) => {
		if (!currentStep) return;
		
		setStepData(prev => ({ ...prev, [currentStep.stepId]: data }));
		await onStepComplete(currentStep.stepId, data);
	}, [currentStep, onStepComplete]);

	const handleSkip = useCallback(async () => {
		if (!currentStep) return;

		setIsLoading(true);
		try {
			await onStepSkip(currentStep.stepId);
			
			// Move to next step or complete onboarding
			if (isLastStep) {
				onComplete();
			} else {
				setCurrentStepIndex(prev => prev + 1);
				setStepData({});
			}
			
			toast.info("Step skipped");
		} catch (error) {
			logger.error("Error skipping step:", error);
			toast.error("Failed to skip step. Please try again.");
		} finally {
			setIsLoading(false);
		}
	}, [currentStep, isLastStep, onStepSkip, onComplete]);

	const handlePrevious = useCallback(() => {
		if (!isFirstStep) {
			setCurrentStepIndex(prev => prev - 1);
			setStepData({});
		}
	}, [isFirstStep]);

	const handleSkipOnboarding = useCallback(async () => {
		if (confirm("Are you sure you want to skip the entire onboarding? You can always complete it later from your dashboard.")) {
			setIsLoading(true);
			try {
				await fetch("/api/onboarding/skip", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ reason: "User chose to skip" })
				});
				
				router.push("/dashboard");
				toast.info("Onboarding skipped. You can complete it later from your dashboard.");
			} catch (error) {
				logger.error("Error skipping onboarding:", error);
				toast.error("Failed to skip onboarding. Please try again.");
			} finally {
				setIsLoading(false);
			}
		}
	}, [router]);

	const updateStepData = (data: Record<string, any>) => {
		setStepData(prev => ({ ...prev, ...data }));
	};

	if (!currentStep) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4" />
					<p className="text-gray-600">Loading step...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto p-6">
			{/* Progress Header */}
			<div className="mb-8">
				<div className="flex items-center justify-between mb-4">
					<div>
						<h1 className="text-2xl font-bold text-gray-900">
							{currentStep.stepConfig.title}
						</h1>
						<p className="text-gray-600 mt-1">
							{currentStep.stepConfig.description}
						</p>
					</div>
					<Badge variant="outline" className="flex items-center">
						<Clock className="h-4 w-4 mr-1" />
						{currentStep.stepConfig.estimatedTime || 2} min
					</Badge>
				</div>

				{/* Progress Bar */}
				<div className="space-y-2">
					<div className="flex justify-between text-sm text-gray-600">
						<span>Step {currentStepIndex + 1} of {flow.steps.length}</span>
						<span>{onboarding.progress.percentage}% complete</span>
					</div>
					<Progress 
						value={(currentStepIndex / flow.steps.length) * 100} 
						className="h-2"
					/>
				</div>
			</div>

			{/* Step Content */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="flex items-center">
						{currentStep.stepConfig.title}
						{currentStep.isRequired && (
							<Badge variant="destructive" className="ml-2 text-xs">
								Required
							</Badge>
						)}
					</CardTitle>
				</CardHeader>
				<CardContent>
					{currentStep.stepConfig.helpText && (
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
							<p className="text-sm text-blue-800">
								💡 {currentStep.stepConfig.helpText}
							</p>
						</div>
					)}

					{/* Step-specific content */}
					<div className="min-h-[200px]">
						{renderStepComponent()}
					</div>
				</CardContent>
			</Card>

			{/* Navigation */}
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-3">
					<Button
						variant="outline"
						onClick={handlePrevious}
						disabled={isFirstStep || isLoading}
					>
						<ChevronLeft className="h-4 w-4 mr-1" />
						Previous
					</Button>

					<Button
						variant="ghost"
						onClick={handleSkipOnboarding}
						disabled={isLoading}
						className="text-gray-500 hover:text-gray-700"
					>
						Skip onboarding
					</Button>
				</div>

				<div className="flex items-center space-x-3">
					{!currentStep.isRequired && (
						<Button
							variant="outline"
							onClick={handleSkip}
							disabled={isLoading}
						>
							<SkipForward className="h-4 w-4 mr-1" />
							{currentStep.stepConfig.skipText || "Skip"}
						</Button>
					)}

					<Button
						onClick={handleNext}
						disabled={isLoading}
						className="min-w-[120px]"
					>
						{isLoading ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
								Processing...
							</>
						) : isLastStep ? (
							<>
								<Sparkles className="h-4 w-4 mr-1" />
								Complete Setup
							</>
						) : (
							<>
								{currentStep.stepConfig.ctaText || "Continue"}
								<ArrowRight className="h-4 w-4 ml-1" />
							</>
						)}
					</Button>
				</div>
			</div>

			{/* Step Indicators */}
			<div className="mt-8">
				<div className="flex items-center justify-center space-x-2">
					{flow.steps.map((_, index) => (
						<div
							key={index}
							className={`h-2 w-2 rounded-full transition-colors ${
								index === currentStepIndex
									? "bg-blue-500"
									: index < currentStepIndex
									? "bg-green-500"
									: "bg-gray-300"
							}`}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
