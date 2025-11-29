/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import {
	OpportunityCard,
	type OpportunityCardProps,
} from "@/components/ui/card-12";
import { Building2, Calendar } from "lucide-react";
import { logger } from '@/lib/logger';

const Demo = () => {
	// Sample data to populate the card
	const opportunityData: Omit<OpportunityCardProps, "onAccept" | "onDecline"> =
		{
			status: "Available",
			postedBy: {
				name: "Jenifer A.",
				avatarUrl:
					"https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
				company: "Meta — Facebook",
				location: "California",
			},
			salaryRange: {
				min: 35000,
				max: 45000,
			},
			deadline: "14 Oct - 2024",
			matchPercentage: 89.5,
			rating: 4.9,
			tags: ["Web Design"],
			description:
				"Need Responsive Website showcase product. Modern and visually appealing design.",
			recruiter: {
				name: "Robert T.",
				avatarUrl:
					"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
				company: "Full Cycle Agency",
				location: "Salt Lake",
			},
		};

	// Handler functions for the buttons
	const handleAccept = () => {
		logger.info("Project Accepted!");
		// Add your accept logic here
	};

	const handleDecline = () => {
		logger.info("Offer Declined.");
		// Add your decline logic here
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<OpportunityCard
				{...opportunityData}
				onAccept={handleAccept}
				onDecline={handleDecline}
			/>
		</div>
	);
};

export default Demo;
