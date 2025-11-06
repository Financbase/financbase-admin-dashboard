/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { TestimonialCard } from "@/components/core/ui/layout/testimonial-card-1";
import { ArrowLeft, Building2, Database, User, Users } from "lucide-react";

// A simple SVG component for the Trustpilot logo to keep the demo self-contained.
const TrustpilotLogo = () => (
	<svg
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M18.332 8.52227L12.0001 6.33398L5.66816 8.52227L7.02641 15.0163L2 19.6673L8.60458 17.0759L12.0001 22.0004L15.3956 17.0759L22 19.6673L16.9737 15.0163L18.332 8.52227Z"
			fill="#00B67A"
		/>
		<path
			d="M12 2L9.44 8.6L2 11L9.44 13.4L12 20L14.56 13.4L22 11L14.56 8.6L12 2Z"
			fill="white"
			transform="translate(-1, -1.5) scale(1.1)"
		/>
	</svg>
);

// Static fallback data for when API is not available
const staticFeaturesData = [
	"51K Happy customers",
	"4.4 Avg ratings",
	"6 months money back guarantee!",
	"Unlimited messaging with your provider",
];

const staticTestimonialsData = [
	{
		id: "1",
		name: "Laura Shouse",
		rating: 5,
		title: "Life-changing experience",
		quote:
			"When I met Dr. Naji I knew my life was about to change. I have lost over 27 pounds since April of this year. he develops a very specific treatment plan for you that really works.",
		company: "Healthcare Plus",
		role: "Patient",
		avatar:
			"https://images.unsplash.com/photo-1494790108755-2616b612b17c?w=100&h=100&fit=crop&crop=face",
		featured: true,
		status: "approved" as const,
		source: "website",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: "2",
		name: "Alex Johnson",
		rating: 5,
		title: "Seamless experience",
		quote:
			"A seamless experience from start to finish. The results exceeded all my expectations. Highly recommended for anyone looking for quality and reliability.",
		company: "TechCorp",
		role: "Software Engineer",
		avatar:
			"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
		featured: true,
		status: "approved" as const,
		source: "website",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: "3",
		name: "Samantha Lee",
		rating: 4,
		title: "Professional service",
		quote:
			"Great service and a very professional team. They addressed all my concerns promptly. The final product was fantastic, though there was a slight delay.",
		company: "Design Studio",
		role: "Creative Director",
		avatar:
			"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
		featured: false,
		status: "approved" as const,
		source: "website",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
];

export default function TestimonialCardDemo() {
	return (
		<div className="flex min-h-[600px] w-full items-center justify-center bg-background p-4">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl">
				{/* API-powered testimonial card */}
				<div className="space-y-4">
					<h2 className="text-2xl font-bold text-center">
						Live Testimonials (API)
					</h2>
					<p className="text-sm text-muted-foreground text-center">
						This component fetches real testimonials from the database API
					</p>
					<TestimonialCard
						logo={<TrustpilotLogo />}
						overallRating={4.4}
						totalRatingsText="4.4 out of 5 stars"
						title="Real customer experiences"
						features={staticFeaturesData}
						autoPlay={true}
						autoPlayInterval={4000}
						maxTestimonials={10}
					/>
				</div>

				{/* Static testimonial card for comparison */}
				<div className="space-y-4">
					<h2 className="text-2xl font-bold text-center">
						Static Testimonials
					</h2>
					<p className="text-sm text-muted-foreground text-center">
						This component uses static data for demonstration
					</p>
					<TestimonialCard
						logo={<TrustpilotLogo />}
						overallRating={4.4}
						totalRatingsText="4.4 out of 5 stars"
						title="Static customer experiences"
						features={staticFeaturesData}
						testimonials={staticTestimonialsData.map(({ featured, status, source, createdAt, updatedAt, quote, ...rest }) => ({
							...rest,
							content: quote || rest.title || '',
						}))}
						autoPlay={true}
						autoPlayInterval={4000}
					/>
				</div>
			</div>
		</div>
	);
}
