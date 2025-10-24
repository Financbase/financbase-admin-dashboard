"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Users, TrendingUp } from "lucide-react";
import { onboardingFlows } from "@/lib/data/onboarding-flows";
import { Persona } from "@/lib/db/schemas/onboarding.schema";

interface PersonaSelectorProps {
	onPersonaSelect: (persona: Persona) => void;
	isLoading?: boolean;
}

export function PersonaSelector({ onPersonaSelect, isLoading = false }: PersonaSelectorProps) {
	const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);

	const personas = [
		{
			key: "digital_agency" as Persona,
			flow: onboardingFlows.digital_agency,
			features: ["Client Profitability", "Project Tracking", "Team Collaboration", "Invoice Automation"],
			benefits: ["Scale your agency", "Track billable hours", "Identify profitable clients"]
		},
		{
			key: "real_estate" as Persona,
			flow: onboardingFlows.real_estate,
			features: ["Portfolio Management", "Rental Tracking", "ROI Analysis", "Owner Statements"],
			benefits: ["Maximize rental income", "Track property performance", "Generate investor reports"]
		},
		{
			key: "tech_startup" as Persona,
			flow: onboardingFlows.tech_startup,
			features: ["Burn Rate Tracking", "Revenue Analytics", "Investor Reporting", "Runway Forecasting"],
			benefits: ["Monitor cash flow", "Prepare for fundraising", "Track growth metrics"]
		},
		{
			key: "freelancer" as Persona,
			flow: onboardingFlows.freelancer,
			features: ["Invoice Management", "Expense Tracking", "Tax Estimates", "Business Health"],
			benefits: ["Get paid faster", "Maximize deductions", "Stay organized"]
		}
	];

	const handlePersonaSelect = (persona: Persona) => {
		setSelectedPersona(persona);
		onPersonaSelect(persona);
	};

	return (
		<div className="max-w-6xl mx-auto p-6">
			<div className="text-center mb-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-4">
					Welcome to Financbase! 🎉
				</h1>
				<p className="text-lg text-gray-600 max-w-2xl mx-auto">
					Let's personalize your experience. Choose the option that best describes your business to get started with a tailored onboarding flow.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
				{personas.map((persona) => (
					<Card 
						key={persona.key}
						className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
							selectedPersona === persona.key 
								? 'ring-2 ring-blue-500 shadow-lg' 
								: 'hover:shadow-md'
						}`}
						onClick={() => handlePersonaSelect(persona.key)}
					>
						<CardHeader className="pb-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-3">
									<span className="text-3xl">{persona.flow.icon}</span>
									<div>
										<CardTitle className="text-xl">{persona.flow.title}</CardTitle>
										<CardDescription className="text-sm">
											{persona.flow.description}
										</CardDescription>
									</div>
								</div>
								{selectedPersona === persona.key && (
									<CheckCircle className="h-6 w-6 text-blue-500" />
								)}
							</div>
						</CardHeader>

						<CardContent className="pt-0">
							<div className="space-y-4">
								{/* Key Features */}
								<div>
									<h4 className="font-semibold text-sm text-gray-700 mb-2">Key Features:</h4>
									<div className="flex flex-wrap gap-2">
										{persona.features.map((feature) => (
											<Badge key={feature} variant="secondary" className="text-xs">
												{feature}
											</Badge>
										))}
									</div>
								</div>

								{/* Benefits */}
								<div>
									<h4 className="font-semibold text-sm text-gray-700 mb-2">You'll be able to:</h4>
									<ul className="space-y-1">
										{persona.benefits.map((benefit) => (
											<li key={benefit} className="text-sm text-gray-600 flex items-center">
												<CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
												{benefit}
											</li>
										))}
									</ul>
								</div>

								{/* Flow Info */}
								<div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
									<div className="flex items-center space-x-4">
										<div className="flex items-center">
											<Clock className="h-4 w-4 mr-1" />
											{persona.flow.estimatedTime} min
										</div>
										<div className="flex items-center">
											<Users className="h-4 w-4 mr-1" />
											{persona.flow.totalSteps} steps
										</div>
									</div>
									<div className="flex items-center">
										<TrendingUp className="h-4 w-4 mr-1" />
										Quick setup
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Continue Button */}
			<div className="text-center">
				<Button
					onClick={() => selectedPersona && handlePersonaSelect(selectedPersona)}
					disabled={!selectedPersona || isLoading}
					size="lg"
					className="px-8 py-3"
				>
					{isLoading ? (
						<>
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
							Setting up your experience...
						</>
					) : (
						<>
							Continue with {selectedPersona ? personas.find(p => p.key === selectedPersona)?.flow.title : 'selection'}
							<CheckCircle className="ml-2 h-4 w-4" />
						</>
					)}
				</Button>
			</div>

			{/* Help Text */}
			<div className="text-center mt-6">
				<p className="text-sm text-gray-500">
					Don't worry, you can change this later in your settings.
				</p>
			</div>
		</div>
	);
}
