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

	// Auto-initialize onboarding if persona is provided in URL and no onboarding exists
	useEffect(() => {
		const autoInitializeOnboarding = async () => {
			// Only auto-initialize if:
			// 1. Persona is in URL
			// 2. No onboarding exists yet
			// 3. Not currently initializing
			// 4. Not loading
			if (personaParam && !onboarding && !isInitializing && !isLoading) {
				// Validate persona is a valid Persona type
				const validPersonas: Persona[] = ["digital_agency", "real_estate", "tech_startup", "freelancer"];
				if (validPersonas.includes(personaParam as Persona)) {
					setIsInitializing(true);
					try {
						const response = await fetch("/api/onboarding", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ persona: personaParam })
						});

						// Handle 401 Unauthorized - session might not be ready yet
						if (response.status === 401) {
							// Wait a bit for session to initialize, then retry
							await new Promise(resolve => setTimeout(resolve, 1500));
							const retryResponse = await fetch("/api/onboarding", {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({ persona: personaParam })
							});
							
							if (retryResponse.status === 401) {
								toast.error("Please sign in to continue");
								router.push("/auth/sign-in");
								setIsInitializing(false);
								return;
							}

							const retryData = await retryResponse.json();
							if (retryData.success) {
								setOnboarding(retryData.onboarding);
								setSelectedPersona(personaParam as Persona);
								toast.success("Onboarding initialized! Let's get started.");
							} else {
								throw new Error(retryData.error || "Failed to initialize onboarding");
							}
							setIsInitializing(false);
							return;
						}

						if (!response.ok) {
							throw new Error(`HTTP error! status: ${response.status}`);
						}

						const data = await response.json();

						if (data.success) {
							setOnboarding(data.onboarding);
							setSelectedPersona(personaParam as Persona);
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
				}
			}
		};

		autoInitializeOnboarding();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [personaParam, onboarding, isInitializing, isLoading]);

	const checkOnboardingStatus = async () => {
		try {
			const response = await fetch("/api/onboarding");
			
			// Handle 401 Unauthorized - user might not be fully authenticated yet
			if (response.status === 401) {
				// Wait a bit and retry (session might still be initializing)
				await new Promise(resolve => setTimeout(resolve, 1000));
				const retryResponse = await fetch("/api/onboarding");
				if (retryResponse.status === 401) {
					// Still unauthorized after retry - redirect to sign-in
					router.push("/auth/sign-in");
					return;
				}
				const retryData = await retryResponse.json();
				if (retryData.success && retryData.onboarding) {
					setOnboarding(retryData.onboarding);
					if (retryData.onboarding.userOnboarding.status === "completed") {
						router.push("/dashboard");
						return;
					}
				}
				setIsLoading(false);
				return;
			}

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

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
			// If it's a network error or other issue, don't block the user
			// They can still proceed with persona selection
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
