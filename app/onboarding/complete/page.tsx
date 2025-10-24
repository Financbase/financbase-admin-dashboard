"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
	CheckCircle, 
	Sparkles, 
	ArrowRight, 
	TrendingUp, 
	Users, 
	BarChart3,
	Rocket
} from "lucide-react";
import { toast } from "sonner";

export default function OnboardingCompletePage() {
	const router = useRouter();
	const [persona, setPersona] = useState<string>("");
	const [completedSteps, setCompletedSteps] = useState<number>(0);

	useEffect(() => {
		// Get onboarding completion data from localStorage or API
		const onboardingData = localStorage.getItem("onboarding-complete");
		if (onboardingData) {
			const data = JSON.parse(onboardingData);
			setPersona(data.persona || "");
			setCompletedSteps(data.completedSteps || 0);
		}

		// Show confetti effect
		toast.success("🎉 Welcome to Financbase! Your setup is complete!");
	}, []);

	const getPersonaInfo = (persona: string) => {
		const personas = {
			digital_agency: {
				title: "Digital Agency",
				icon: "🏢",
				description: "Your agency's growth command center is ready!",
				nextSteps: [
					"Import your first client data",
					"Set up project tracking",
					"Invite your team members",
					"Configure automated workflows"
				],
				dashboardUrl: "/dashboard?highlight=agency"
			},
			real_estate: {
				title: "Real Estate",
				icon: "🏠",
				description: "Your real estate portfolio HQ is ready!",
				nextSteps: [
					"Add your first property",
					"Set up rental income tracking",
					"Generate owner statements",
					"Monitor portfolio performance"
				],
				dashboardUrl: "/dashboard?highlight=real-estate"
			},
			tech_startup: {
				title: "Tech Startup",
				icon: "🚀",
				description: "Your startup's financial edge is ready!",
				nextSteps: [
					"Connect your Stripe account",
					"Set up burn rate tracking",
					"Configure investor reporting",
					"Invite your advisors"
				],
				dashboardUrl: "/dashboard?highlight=startup"
			},
			freelancer: {
				title: "Freelancer",
				icon: "💼",
				description: "Your freelance financial peace of mind is ready!",
				nextSteps: [
					"Create your first invoice",
					"Set up expense tracking",
					"Monitor business health",
					"Plan for tax season"
				],
				dashboardUrl: "/dashboard?highlight=freelancer"
			}
		};

		return personas[persona as keyof typeof personas] || personas.freelancer;
	};

	const personaInfo = getPersonaInfo(persona);

	const handleGoToDashboard = () => {
		router.push(personaInfo.dashboardUrl);
	};

	const handleExploreFeatures = () => {
		router.push("/dashboard?tour=true");
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
			<div className="max-w-4xl w-full">
				{/* Success Header */}
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
						<CheckCircle className="h-10 w-10 text-green-600" />
					</div>
					<h1 className="text-4xl font-bold text-gray-900 mb-4">
						🎉 Congratulations!
					</h1>
					<p className="text-xl text-gray-600 mb-2">
						{personaInfo.description}
					</p>
					<Badge variant="outline" className="text-green-600 border-green-200">
						<CheckCircle className="h-4 w-4 mr-1" />
						{completedSteps} steps completed
					</Badge>
				</div>

				{/* Main Content */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
					{/* What's Next */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<Sparkles className="h-5 w-5 mr-2 text-blue-500" />
								What's Next?
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-gray-600 mb-4">
								You're all set up! Here are some recommended next steps to get the most out of Financbase:
							</p>
							<ul className="space-y-3">
								{personaInfo.nextSteps.map((step, index) => (
									<li key={index} className="flex items-start">
										<CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
										<span className="text-sm text-gray-700">{step}</span>
									</li>
								))}
							</ul>
						</CardContent>
					</Card>

					{/* Quick Stats */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
								Your Setup Summary
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-sm text-gray-600">Persona</span>
									<Badge variant="secondary">
										{personaInfo.icon} {personaInfo.title}
									</Badge>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm text-gray-600">Steps Completed</span>
									<span className="font-semibold text-green-600">{completedSteps}</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm text-gray-600">Setup Time</span>
									<span className="font-semibold">~5 minutes</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm text-gray-600">Status</span>
									<Badge variant="outline" className="text-green-600 border-green-200">
										<CheckCircle className="h-3 w-3 mr-1" />
										Complete
									</Badge>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Action Buttons */}
				<div className="text-center space-y-4">
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button
							onClick={handleGoToDashboard}
							size="lg"
							className="px-8 py-3"
						>
							<Rocket className="h-5 w-5 mr-2" />
							Go to Dashboard
							<ArrowRight className="h-4 w-4 ml-2" />
						</Button>
						
						<Button
							onClick={handleExploreFeatures}
							variant="outline"
							size="lg"
							className="px-8 py-3"
						>
							<TrendingUp className="h-5 w-5 mr-2" />
							Take a Tour
						</Button>
					</div>

					<p className="text-sm text-gray-500">
						Need help? Check out our{" "}
						<a href="/docs" className="text-blue-600 hover:underline">
							documentation
						</a>{" "}
						or contact{" "}
						<a href="mailto:support@financbase.com" className="text-blue-600 hover:underline">
							support
						</a>
					</p>
				</div>

				{/* Tips Section */}
				<Card className="mt-8 bg-blue-50 border-blue-200">
					<CardContent className="pt-6">
						<div className="flex items-start">
							<Users className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
							<div>
								<h3 className="font-semibold text-blue-900 mb-2">
									Pro Tip: Invite Your Team
								</h3>
								<p className="text-sm text-blue-800">
									{persona === "digital_agency" && "Invite your account managers and bookkeepers to collaborate on client projects."}
									{persona === "real_estate" && "Invite property managers and stakeholders to help manage your portfolio."}
									{persona === "tech_startup" && "Invite your advisors and investors to view financial reports and metrics."}
									{persona === "freelancer" && "Consider inviting your accountant or tax professional for better financial planning."}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
