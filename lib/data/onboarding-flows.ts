/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import type { Persona } from "@/lib/db/schemas/onboarding.schema";

export interface OnboardingStepConfig {
	stepId: string;
	stepName: string;
	stepOrder: number;
	isRequired: boolean;
	stepType: "form" | "import" | "integration" | "demo" | "invite";
	stepConfig: {
		title: string;
		description: string;
		helpText?: string;
		estimatedTime?: number; // in minutes
		fields?: Array<{
			name: string;
			label: string;
			type: "text" | "email" | "select" | "textarea" | "file" | "checkbox";
			required: boolean;
			options?: string[];
			placeholder?: string;
		}>;
		integrations?: string[];
		ctaText?: string;
		skipText?: string;
	};
}

export interface OnboardingFlow {
	persona: Persona;
	title: string;
	description: string;
	icon: string;
	steps: OnboardingStepConfig[];
	totalSteps: number;
	estimatedTime: number; // total minutes
}

// Digital Agency Onboarding Flow
export const digitalAgencyFlow: OnboardingFlow = {
	persona: "digital_agency",
	title: "Digital Agency",
	description: "Track client profitability, manage projects, and scale your agency",
	icon: "🏢",
	estimatedTime: 12,
	totalSteps: 5,
	steps: [
		{
			stepId: "import_clients",
			stepName: "Import Clients & Projects",
			stepOrder: 1,
			isRequired: true,
			stepType: "import",
			stepConfig: {
				title: "Welcome! Let's set up your first client and project",
				description: "Import your existing client and project data to start seeing profit margins instantly.",
				helpText: "You can upload a CSV file, connect to QuickBooks, or start from scratch.",
				estimatedTime: 3,
				fields: [
					{
						name: "importMethod",
						label: "How would you like to import your data?",
						type: "select",
						required: true,
						options: ["CSV Upload", "QuickBooks Connect", "Start from Scratch"]
					}
				],
				ctaText: "Import Data",
				skipText: "I'll add clients manually"
			}
		},
		{
			stepId: "setup_slack",
			stepName: "Connect Slack for Notifications",
			stepOrder: 2,
			isRequired: false,
			stepType: "integration",
			stepConfig: {
				title: "Stay updated with real-time notifications",
				description: "Connect Slack to receive instant alerts about payments, overdue invoices, and project updates.",
				helpText: "This helps your team stay in sync without constantly checking the dashboard.",
				estimatedTime: 2,
				integrations: ["slack"],
				ctaText: "Connect Slack",
				skipText: "Skip for now"
			}
		},
		{
			stepId: "invoice_demo",
			stepName: "Create Your First Invoice",
			stepOrder: 3,
			isRequired: true,
			stepType: "demo",
			stepConfig: {
				title: "Let's create and send an invoice",
				description: "See how easy it is to create professional invoices and track expenses for your clients.",
				helpText: "This demo will show you the complete invoicing workflow.",
				estimatedTime: 4,
				ctaText: "Start Demo",
				skipText: "I know how to invoice"
			}
		},
		{
			stepId: "profitability_dashboard",
			stepName: "Explore Profitability Dashboard",
			stepOrder: 4,
			isRequired: true,
			stepType: "demo",
			stepConfig: {
				title: "See your agency's profitability at a glance",
				description: "Discover how to track profit margins, billable hours, and identify your most profitable clients.",
				helpText: "This dashboard helps you make data-driven decisions about pricing and client selection.",
				estimatedTime: 2,
				ctaText: "View Dashboard",
				skipText: "Skip tour"
			}
		},
		{
			stepId: "invite_team",
			stepName: "Invite Your Team",
			stepOrder: 5,
			isRequired: false,
			stepType: "invite",
			stepConfig: {
				title: "Add account managers and bookkeepers",
				description: "Invite your team members for full transparency and collaboration on client projects.",
				helpText: "Team members can have different permission levels based on their role.",
				estimatedTime: 1,
				fields: [
					{
						name: "teamEmails",
						label: "Team member email addresses",
						type: "textarea",
						required: false,
						placeholder: "manager@agency.com, bookkeeper@agency.com"
					}
				],
				ctaText: "Send Invites",
				skipText: "I'll invite them later"
			}
		}
	]
};

// Real Estate Onboarding Flow
export const realEstateFlow: OnboardingFlow = {
	persona: "real_estate",
	title: "Real Estate",
	description: "Manage rental properties, track ROI, and generate owner statements",
	icon: "🏠",
	estimatedTime: 10,
	totalSteps: 5,
	steps: [
		{
			stepId: "add_property",
			stepName: "Add Your First Property",
			stepOrder: 1,
			isRequired: true,
			stepType: "form",
			stepConfig: {
				title: "Portfolio Performance at Your Fingertips",
				description: "Add your first property to start tracking rental income and expenses.",
				helpText: "You can import from a spreadsheet or enter details manually.",
				estimatedTime: 3,
				fields: [
					{
						name: "propertyName",
						label: "Property Name/Address",
						type: "text",
						required: true,
						placeholder: "123 Main St, Apartment 2B"
					},
					{
						name: "propertyType",
						label: "Property Type",
						type: "select",
						required: true,
						options: ["Single Family", "Multi-Family", "Condo", "Townhouse", "Commercial"]
					},
					{
						name: "purchasePrice",
						label: "Purchase Price",
						type: "text",
						required: false,
						placeholder: "$250,000"
					}
				],
				ctaText: "Add Property",
				skipText: "Import from CSV"
			}
		},
		{
			stepId: "rental_details",
			stepName: "Set Up Rental Details",
			stepOrder: 2,
			isRequired: true,
			stepType: "form",
			stepConfig: {
				title: "Configure rental income and tenant information",
				description: "Enter tenant details, rental income, and main expense categories.",
				helpText: "This helps us calculate accurate ROI and cash flow projections.",
				estimatedTime: 3,
				fields: [
					{
						name: "monthlyRent",
						label: "Monthly Rental Income",
						type: "text",
						required: true,
						placeholder: "$1,500"
					},
					{
						name: "tenantName",
						label: "Tenant Name",
						type: "text",
						required: false,
						placeholder: "John Smith"
					},
					{
						name: "leaseEndDate",
						label: "Lease End Date",
						type: "text",
						required: false,
						placeholder: "MM/DD/YYYY"
					}
				],
				ctaText: "Save Details",
				skipText: "Skip for now"
			}
		},
		{
			stepId: "owner_statement",
			stepName: "Generate Owner Statement",
			stepOrder: 3,
			isRequired: true,
			stepType: "demo",
			stepConfig: {
				title: "Create your first owner statement report",
				description: "See how to generate detailed reports for yourself or co-owners showing rental performance.",
				helpText: "Owner statements help you track ROI and share performance with stakeholders.",
				estimatedTime: 2,
				ctaText: "Generate Report",
				skipText: "Skip demo"
			}
		},
		{
			stepId: "portfolio_dashboard",
			stepName: "Explore Portfolio Dashboard",
			stepOrder: 4,
			isRequired: true,
			stepType: "demo",
			stepConfig: {
				title: "Monitor your real estate portfolio",
				description: "View properties, upcoming lease expiries, and rental trends in one place.",
				helpText: "This dashboard gives you a complete overview of your investment performance.",
				estimatedTime: 1,
				ctaText: "View Dashboard",
				skipText: "Skip tour"
			}
		},
		{
			stepId: "invite_stakeholders",
			stepName: "Invite Property Managers",
			stepOrder: 5,
			isRequired: false,
			stepType: "invite",
			stepConfig: {
				title: "Invite property managers or stakeholders",
				description: "Give property managers access to update rental information and track maintenance.",
				helpText: "Stakeholders can have read-only or limited edit access based on their role.",
				estimatedTime: 1,
				fields: [
					{
						name: "stakeholderEmails",
						label: "Property manager/stakeholder emails",
						type: "textarea",
						required: false,
						placeholder: "manager@pm.com, investor@email.com"
					}
				],
				ctaText: "Send Invites",
				skipText: "I'll invite them later"
			}
		}
	]
};

// Tech Startup Onboarding Flow
export const techStartupFlow: OnboardingFlow = {
	persona: "tech_startup",
	title: "Tech Startup & SaaS",
	description: "Track runway, revenue, and growth metrics in real time",
	icon: "🚀",
	estimatedTime: 8,
	totalSteps: 5,
	steps: [
		{
			stepId: "import_financials",
			stepName: "Import Financial Data",
			stepOrder: 1,
			isRequired: true,
			stepType: "import",
			stepConfig: {
				title: "Track your runway, revenue, and growth in real time",
				description: "Upload your historical revenue and expense data to get instant insights.",
				helpText: "Connect to Stripe, upload CSV files, or enter data manually.",
				estimatedTime: 3,
				fields: [
					{
						name: "importMethod",
						label: "How would you like to import your data?",
						type: "select",
						required: true,
						options: ["Stripe Connect", "CSV Upload", "Manual Entry"]
					}
				],
				ctaText: "Import Data",
				skipText: "Enter manually"
			}
		},
		{
			stepId: "connect_stripe",
			stepName: "Connect Stripe",
			stepOrder: 2,
			isRequired: false,
			stepType: "integration",
			stepConfig: {
				title: "Sync revenue data automatically",
				description: "Connect your Stripe account to automatically track revenue and customer metrics.",
				helpText: "This gives you real-time insights into your SaaS metrics and growth.",
				estimatedTime: 2,
				integrations: ["stripe"],
				ctaText: "Connect Stripe",
				skipText: "Skip for now"
			}
		},
		{
			stepId: "burn_rate_dashboard",
			stepName: "Explore Burn Rate Dashboard",
			stepOrder: 3,
			isRequired: true,
			stepType: "demo",
			stepConfig: {
				title: "Monitor your burn rate and runway",
				description: "See your monthly spending trends, burn rate, and runway projections.",
				helpText: "This dashboard helps you make informed decisions about fundraising and spending.",
				estimatedTime: 2,
				ctaText: "View Dashboard",
				skipText: "Skip tour"
			}
		},
		{
			stepId: "setup_workflows",
			stepName: "Set Up Financial Workflows",
			stepOrder: 4,
			isRequired: false,
			stepType: "demo",
			stepConfig: {
				title: "Automate your financial reporting",
				description: "Set up automated workflows for AR reminders, expense approvals, and investor reports.",
				helpText: "Automation saves time and ensures nothing falls through the cracks.",
				estimatedTime: 2,
				ctaText: "Set Up Workflows",
				skipText: "Skip for now"
			}
		},
		{
			stepId: "invite_advisors",
			stepName: "Invite Advisors & Investors",
			stepOrder: 5,
			isRequired: false,
			stepType: "invite",
			stepConfig: {
				title: "Give advisors read-only access",
				description: "Invite your advisors and investors to view financial reports and metrics.",
				helpText: "Advisors can monitor your progress without needing full access to your account.",
				estimatedTime: 1,
				fields: [
					{
						name: "advisorEmails",
						label: "Advisor/investor email addresses",
						type: "textarea",
						required: false,
						placeholder: "advisor@vc.com, investor@fund.com"
					}
				],
				ctaText: "Send Invites",
				skipText: "I'll invite them later"
			}
		}
	]
};

// Freelancer Onboarding Flow
export const freelancerFlow: OnboardingFlow = {
	persona: "freelancer",
	title: "Freelancer/Solopreneur",
	description: "One-stop business finances for freelancers",
	icon: "💼",
	estimatedTime: 6,
	totalSteps: 4,
	steps: [
		{
			stepId: "setup_profile",
			stepName: "Set Up Contractor Profile",
			stepOrder: 1,
			isRequired: true,
			stepType: "form",
			stepConfig: {
				title: "One-stop business finances for freelancers",
				description: "Set up your contractor profile and business information.",
				helpText: "This helps us customize your experience and provide relevant tax guidance.",
				estimatedTime: 2,
				fields: [
					{
						name: "businessName",
						label: "Business Name",
						type: "text",
						required: true,
						placeholder: "John Smith Consulting"
					},
					{
						name: "businessType",
						label: "Business Type",
						type: "select",
						required: true,
						options: ["Sole Proprietorship", "LLC", "S-Corp", "C-Corp"]
					},
					{
						name: "industry",
						label: "Industry",
						type: "text",
						required: false,
						placeholder: "Web Development, Design, Writing, etc."
					}
				],
				ctaText: "Save Profile",
				skipText: "Skip for now"
			}
		},
		{
			stepId: "create_invoice",
			stepName: "Create Your First Invoice",
			stepOrder: 2,
			isRequired: true,
			stepType: "demo",
			stepConfig: {
				title: "Create and send your first invoice",
				description: "Set up a professional invoice template and see how easy it is to get paid faster.",
				helpText: "Customize your invoice with your logo and branding for a professional look.",
				estimatedTime: 3,
				ctaText: "Create Invoice",
				skipText: "Skip demo"
			}
		},
		{
			stepId: "expense_tracking",
			stepName: "Set Up Expense Tracking",
			stepOrder: 3,
			isRequired: true,
			stepType: "demo",
			stepConfig: {
				title: "Track expenses and never miss a write-off",
				description: "Learn how to log expenses on the go and snap photos of receipts.",
				helpText: "Proper expense tracking helps maximize your tax deductions and business insights.",
				estimatedTime: 2,
				ctaText: "Start Tracking",
				skipText: "Skip demo"
			}
		},
		{
			stepId: "business_health",
			stepName: "Monitor Business Health",
			stepOrder: 4,
			isRequired: true,
			stepType: "demo",
			stepConfig: {
				title: "Monitor your business health",
				description: "See real-time income/expenses and estimated taxes owed.",
				helpText: "This dashboard helps you stay on top of your finances and plan for tax season.",
				estimatedTime: 1,
				ctaText: "View Dashboard",
				skipText: "Skip tour"
			}
		}
	]
};

// Export all flows
export const onboardingFlows: Record<Persona, OnboardingFlow> = {
	digital_agency: digitalAgencyFlow,
	real_estate: realEstateFlow,
	tech_startup: techStartupFlow,
	freelancer: freelancerFlow,
};

// Helper functions
export function getOnboardingFlow(persona: Persona): OnboardingFlow {
	return onboardingFlows[persona];
}

export function getOnboardingStep(persona: Persona, stepId: string): OnboardingStepConfig | undefined {
	const flow = getOnboardingFlow(persona);
	return flow.steps.find(step => step.stepId === stepId);
}

export function getNextStep(persona: Persona, currentStepId: string): OnboardingStepConfig | undefined {
	const flow = getOnboardingFlow(persona);
	const currentIndex = flow.steps.findIndex(step => step.stepId === currentStepId);
	if (currentIndex === -1 || currentIndex === flow.steps.length - 1) {
		return undefined;
	}
	return flow.steps[currentIndex + 1];
}

export function getPreviousStep(persona: Persona, currentStepId: string): OnboardingStepConfig | undefined {
	const flow = getOnboardingFlow(persona);
	const currentIndex = flow.steps.findIndex(step => step.stepId === currentStepId);
	if (currentIndex <= 0) {
		return undefined;
	}
	return flow.steps[currentIndex - 1];
}
