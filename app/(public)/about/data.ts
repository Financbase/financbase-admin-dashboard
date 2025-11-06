/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

export interface TimelineItem {
	title: string;
	description: string;
	date: string;
	category: string;
	status: "completed" | "current" | "upcoming";
}

export interface CompanyStory {
	title: string;
	subtitle?: string;
	content: string[];
	image?: {
		src: string;
		alt: string;
	};
}

export interface PartnerLogo {
	name: string;
	src: string;
	alt: string;
	href?: string;
}

export interface Value {
	title: string;
	description: string;
	icon?: string;
}

export interface Stat {
	icon: React.ReactNode;
	value: string;
	label: string;
}

export interface Testimonial {
	name: string;
	role: string;
	company: string;
	content: string;
	avatar: string;
	rating: number;
}

export const timelineData: TimelineItem[] = [
	{
		title: "Company Founded",
		description:
			"Financbase was established as a financial and digital marketing consultant agency, providing comprehensive tax preparation services and financial consulting to businesses. Our mission was to help companies navigate the complexities of financial management and digital transformation.",
		date: "2018-01-01",
		category: "Foundation",
		status: "completed",
	},
	{
		title: "COVID-19 Digital Transformation",
		description:
			"The pandemic forced businesses to adapt quickly. We dedicated 2020 to helping small business owners transition their brick-and-mortar services to digital platforms. Simultaneously, we revamped financial technologies to adapt to modern advances and emerging cybersecurity threats.",
		date: "2020-03-01",
		category: "Transformation",
		status: "completed",
	},
	{
		title: "Market Disruption & Repositioning",
		description:
			"2022-2023 brought significant challenges as new technologies and developments by big tech players disrupted the market. We faced a business downturn and had to strategically reposition Financbase for the future, adapting our services and business model to remain competitive.",
		date: "2022-01-01",
		category: "Adaptation",
		status: "completed",
	},
	{
		title: "AI Integration & Automation Era",
		description:
			"2024-2025 marked a pivotal shift as AI technologies became widely adopted by the market and public. We focused on introducing intelligent automations into businesses, advancing their capabilities, and helping them leverage AI for financial management and decision-making.",
		date: "2024-01-01",
		category: "Innovation",
		status: "completed",
	},
	{
		title: "FinancbaseGPT Launch",
		description:
			"Launched FinancbaseGPT on the OpenAI platform, making advanced financial AI accessible to the public. This groundbreaking tool democratizes financial intelligence, allowing users to leverage cutting-edge AI for financial planning, analysis, and decision-making.",
		date: "2024-06-01",
		category: "Innovation",
		status: "completed",
	},
	{
		title: "Proprietary AI Model Development",
		description:
			"Developing proprietary AI models trained on comprehensive datasets including industry insights, scholarly research, market data, and publicly available information from the IRS and other regulatory organizations. These models are enhanced by user-shared data, creating a powerful foundation for the future of Finance AI capabilities.",
		date: "2024-09-01",
		category: "Innovation",
		status: "completed",
	},
	{
		title: "Community-Focused Finance AI Launch",
		description:
			"Launched our community-focused Finance AI initiatives, advancing capabilities specifically for Latin communities and other underrepresented communities. We're making financial intelligence accessible, culturally relevant, and empowering for all businesses, regardless of their background or size.",
		date: "2025-01-01",
		category: "Vision",
		status: "completed",
	},
	{
		title: "Expanding Finance AI for Underserved Communities",
		description:
			"Today, Financbase continues to expand our Finance AI capabilities, with ongoing development and deployment of tools designed specifically for Latin communities and underrepresented communities. We're actively working to ensure financial intelligence is accessible, culturally relevant, and empowering for businesses across all backgrounds.",
		date: "2025-11-06",
		category: "Growth",
		status: "current",
	},
];

export const companyStory: CompanyStory = {
	title: "Our Story",
	subtitle: "From Consulting to AI-Powered Financial Solutions",
	content: [
		"Financbase began in 2018 as a financial and digital marketing consultant agency, providing tax preparation services and helping businesses navigate their financial challenges. We started with a simple mission: to make financial management accessible and understandable for businesses of all sizes.",
		"When COVID-19 hit in 2020, the world changed overnight. Small businesses needed to rapidly transition from brick-and-mortar operations to digital platforms. We dedicated ourselves to helping these businesses adapt, while simultaneously revamping our financial technologies to address modern advances and emerging cybersecurity threats.",
		"The years 2022-2023 brought significant disruption as big tech players and new technologies reshaped the market. We faced challenges that forced us to rethink our approach. This period of repositioning and adaptation was crucial—it taught us resilience and the importance of staying ahead of technological trends.",
		"Today, in 2024-2025, we've embraced the AI revolution. As artificial intelligence technologies became widely adopted, we've focused on introducing intelligent automations into businesses, advancing their capabilities, and helping them leverage AI for smarter financial decisions. We launched FinancbaseGPT on the OpenAI platform, making advanced financial AI accessible to the public, and are developing proprietary AI models trained on industry, scholarly, market, and regulatory data—enhanced by user contributions.",
		"Our commitment extends beyond technology. We're dedicated to advancing Finance AI capabilities in Latin communities and other underrepresented communities, ensuring that financial intelligence is accessible, culturally relevant, and empowering for all. Financbase now stands as a provider of cutting-edge financial and AI tools, with a mission to democratize financial intelligence and help businesses of all backgrounds thrive in an increasingly digital and automated world.",
	],
	image: {
		src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop",
		alt: "Financbase team collaborating",
	},
};

export const partnerLogos: PartnerLogo[] = [
	{
		name: "TechCorp",
		src: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop",
		alt: "TechCorp logo",
	},
	{
		name: "InnovateLabs",
		src: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=100&fit=crop",
		alt: "InnovateLabs logo",
	},
	{
		name: "GrowthVentures",
		src: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200&h=100&fit=crop",
		alt: "GrowthVentures logo",
	},
	{
		name: "ScaleUp",
		src: "https://images.unsplash.com/photo-1556155092-490a1ba16284?w=200&h=100&fit=crop",
		alt: "ScaleUp logo",
	},
	{
		name: "DigitalFirst",
		src: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=200&h=100&fit=crop",
		alt: "DigitalFirst logo",
	},
	{
		name: "CloudTech",
		src: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200&h=100&fit=crop",
		alt: "CloudTech logo",
	},
];

export interface Innovation {
	title: string;
	description: string;
	icon?: string;
	features?: string[];
}

export const innovations: Innovation[] = [
	{
		title: "FinancbaseGPT",
		description:
			"Available on the OpenAI platform for public use, FinancbaseGPT democratizes advanced financial AI, making sophisticated financial planning, analysis, and decision-making tools accessible to everyone.",
		features: [
			"Publicly available on OpenAI platform",
			"Advanced financial planning and analysis",
			"Real-time financial insights",
			"Accessible to businesses of all sizes",
		],
	},
	{
		title: "Proprietary AI Models",
		description:
			"Our proprietary AI models are trained on comprehensive datasets including industry insights, scholarly research, market data, IRS and regulatory information, enhanced by user-contributed data to advance Finance AI capabilities.",
		features: [
			"Trained on industry, scholarly, and market data",
			"IRS and regulatory organization data integration",
			"Enhanced by user-shared data",
			"Continuously improving AI capabilities",
		],
	},
	{
		title: "Community-Focused AI",
		description:
			"Advancing Finance AI capabilities specifically for Latin communities and underrepresented communities, ensuring financial intelligence is accessible, culturally relevant, and empowering for all.",
		features: [
			"Cultural relevance and accessibility",
			"Multilingual support",
			"Community-specific financial insights",
			"Empowering underrepresented businesses",
		],
	},
];

export const values: Value[] = [
	{
		title: "Innovation",
		description:
			"Leveraging AI and machine learning to transform financial management and decision-making processes.",
	},
	{
		title: "Accessibility",
		description:
			"Making enterprise-grade financial tools available to businesses of all sizes and industries.",
	},
	{
		title: "Growth",
		description:
			"Empowering businesses to scale with confidence, clarity, and data-driven insights.",
	},
];

export const testimonials: Testimonial[] = [
	{
		name: "Sarah Johnson",
		role: "CEO",
		company: "TechStart Inc.",
		content:
			"Financbase transformed how we manage our finances. The AI insights are incredible and have helped us make better decisions faster.",
		avatar: "SJ",
		rating: 5,
	},
	{
		name: "Mike Chen",
		role: "CFO",
		company: "GrowthCorp",
		content:
			"Finally, a financial platform that actually understands our business needs. The automation features saved us countless hours.",
		avatar: "MC",
		rating: 5,
	},
	{
		name: "Emily Davis",
		role: "Founder",
		company: "StartupHub",
		content:
			"The real-time analytics helped us identify opportunities we never knew existed. Our revenue increased by 30% in just 6 months.",
		avatar: "ED",
		rating: 5,
	},
];

