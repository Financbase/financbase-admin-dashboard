/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PersonaSelector } from "@/components/onboarding/persona-selector";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Persona } from "@/lib/db/schemas/onboarding.schema";
import { OnboardingProgress } from "@/lib/services/onboarding/onboarding-service";

export default function OnboardingPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useState(true);
	const [onboarding, setOnboarding] = useState<OnboardingProgress | null>(null);
	const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
	const [isInitializing, setIsInitializing] = useState(false);

	// Check for persona in URL params
	const personaParam = searchParams.get("persona") as Persona | null;

	useEffect(() => {
		checkOnboardingStatus();
	}, []);

	useEffect(() => {
		if (personaParam && !selectedPersona) {
			setSelectedPersona(personaParam);
		}
	}, [personaParam, selectedPersona]);

	const checkOnboardingStatus = async () => {
		try {
			const response = await fetch("/api/onboarding");
			const data = await response.json();

			if (data.success && data.onboarding) {
				setOnboarding(data.onboarding);
				
				// If onboarding is complete, redirect to dashboard
				if (data.onboarding.userOnboarding.status === "completed") {
					router.push("/dashboard");
					return;
				}
			}
		} catch (error) {
			console.error("Error checking onboarding status:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handlePersonaSelect = async (persona: Persona) => {
		setIsInitializing(true);
		try {
			const response = await fetch("/api/onboarding", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ persona })
			});

			const data = await response.json();

			if (data.success) {
				setOnboarding(data.onboarding);
				setSelectedPersona(persona);
				toast.success("Onboarding initialized! Let's get started.");
			} else {
				throw new Error(data.error || "Failed to initialize onboarding");
			}
		} catch (error) {
			console.error("Error initializing onboarding:", error);
			toast.error("Failed to start onboarding. Please try again.");
		} finally {
			setIsInitializing(false);
		}
	};

	const handleStepComplete = async (stepId: string, data: Record<string, any>) => {
		try {
			const response = await fetch(`/api/onboarding/steps/${stepId}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ stepData: data })
			});

			const result = await response.json();

			if (result.success) {
				setOnboarding(result.onboarding);
			} else {
				throw new Error(result.error || "Failed to complete step");
			}
		} catch (error) {
			console.error("Error completing step:", error);
			throw error;
		}
	};

	const handleStepSkip = async (stepId: string) => {
		try {
			const response = await fetch(`/api/onboarding/steps/${stepId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ reason: "User chose to skip" })
			});

			const result = await response.json();

			if (result.success) {
				setOnboarding(result.onboarding);
			} else {
				throw new Error(result.error || "Failed to skip step");
			}
		} catch (error) {
			console.error("Error skipping step:", error);
			throw error;
		}
	};

	const handleOnboardingComplete = () => {
		toast.success("🎉 Congratulations! Your onboarding is complete!");
		router.push("/onboarding/complete");
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
					<p className="text-gray-600">Loading your onboarding...</p>
				</div>
			</div>
		);
	}

	// If no onboarding exists, show persona selector
	if (!onboarding) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
				<PersonaSelector 
					onPersonaSelect={handlePersonaSelect}
					isLoading={isInitializing}
				/>
			</div>
		);
	}

	// If onboarding exists, show wizard
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
			<OnboardingWizard
				onboarding={onboarding}
				persona={onboarding.userOnboarding.persona}
				onStepComplete={handleStepComplete}
				onStepSkip={handleStepSkip}
				onComplete={handleOnboardingComplete}
			/>
		</div>
	);
}
