/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { AnimatedTestimonialGrid } from "@/components/ui/testimonial-2";
import { User } from "lucide-react";

// --- SAMPLE DATA ---
const testimonials = [
	{
		imgSrc:
			"https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300",
		alt: "Professional Man",
	},
	{
		imgSrc:
			"https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=300",
		alt: "Smiling Man",
	},
	{
		imgSrc:
			"https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300",
		alt: "Professional Woman",
	},
	{
		imgSrc:
			"https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300",
		alt: "Smiling Woman",
	},
	{
		imgSrc:
			"https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300",
		alt: "Man in a suit",
	},
	{
		imgSrc:
			"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300",
		alt: "Bearded Man",
	},
	{
		imgSrc:
			"https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=300",
		alt: "Man in a blue shirt",
	},
	{
		imgSrc:
			"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300",
		alt: "Older Man",
	},
	{
		imgSrc:
			"https://images.unsplash.com/photo-1619895862022-09114b41f16f?q=80&w=300",
		alt: "Woman with curly hair",
	},
	{
		imgSrc:
			"https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=300",
		alt: "Woman in an office",
	},
	{
		imgSrc:
			"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=300",
		alt: "Woman with glasses",
	},
	{
		imgSrc:
			"https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300",
		alt: "Woman with a dog",
	},
];

export default function TestimonialSectionDemo() {
	return (
		<div className="w-full bg-background">
			<AnimatedTestimonialGrid
				testimonials={testimonials}
				title={
					<>
						Trusted by leaders
						<br />
						from various industries
					</>
				}
				description="Learn why professionals trust our solutions to complete their customer journeys."
				ctaText="Read Success Stories"
				ctaHref="#"
			/>
		</div>
	);
}
