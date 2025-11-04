/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	AlertCircle,
	ArrowLeft,
	Building2,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	Key,
	Loader2,
	MessageCircle,
	Pilcrow,
	Star,
	XCircle,
} from "lucide-react";
import * as React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { type Testimonial, useTestimonials } from "@/hooks/use-testimonials";
import { cn } from "@/lib/utils";

// Define the types for the component props for type safety and clarity
interface TestimonialCardProps extends React.HTMLAttributes<HTMLDivElement> {
	logo?: React.ReactNode;
	companyName?: string;
	overallRating?: number;
	totalRatingsText?: string;
	title?: string;
	features?: string[];
	testimonials?: Testimonial[]; // Optional override for static data
	autoPlay?: boolean;
	autoPlayInterval?: number;
	maxTestimonials?: number;
	showRating?: boolean;
	showNavigation?: boolean;
	showFeatures?: boolean;
}

// A small helper component for rendering stars
const StarRating = ({
	rating,
	className,
}: { rating: number; className?: string }) => (
	<div className={cn("flex items-center gap-0.5", className)}>
		{[...Array(5)].map((_, i) => (
			<Star
				key={i}
				className={cn(
					"h-5 w-5",
					i < Math.round(rating)
						? "text-yellow-400 fill-yellow-400"
						: "text-muted-foreground/50",
				)}
			/>
		))}
	</div>
);

const TestimonialCard = React.forwardRef<HTMLDivElement, TestimonialCardProps>(
	(
		{
			className,
			logo,
			companyName = "Trustpilot",
			overallRating = 4.4,
			totalRatingsText = "4.4 Ratings",
			title = "Join thousands of happy customers",
			features = [
				"51K Happy customers",
				"4.4 Avg ratings",
				"6 months money back guarantee!",
				"Unlimited messaging with your provider",
			],
			testimonials: staticTestimonials,
			autoPlay = false,
			autoPlayInterval = 5000,
			maxTestimonials = 10,
			showRating = true,
			showNavigation = true,
			showFeatures = true,
			...props
		},
		ref,
	) => {
		const [currentIndex, setCurrentIndex] = useState(0);
		const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);

		// Fetch testimonials from API unless static data is provided
		const {
			data: apiTestimonials,
			isLoading,
			error,
			refetch,
		} = useTestimonials({
			featured: true,
			limit: maxTestimonials,
		});

		// Use static data if provided, otherwise use API data
		const testimonials =
			staticTestimonials || apiTestimonials?.data?.testimonials || [];

		// Auto-play functionality
		React.useEffect(() => {
			if (!isAutoPlaying || testimonials.length <= 1) return;

			const interval = setInterval(() => {
				setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
			}, autoPlayInterval);

			return () => clearInterval(interval);
		}, [isAutoPlaying, testimonials.length, autoPlayInterval]);

		// Pause auto-play on hover
		const handleMouseEnter = () => setIsAutoPlaying(false);
		const handleMouseLeave = () => setIsAutoPlaying(autoPlay);

		const handleNext = () => {
			setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
			setIsAutoPlaying(false);
		};

		const handlePrev = () => {
			setCurrentIndex(
				(prevIndex) =>
					(prevIndex - 1 + testimonials.length) % testimonials.length,
			);
			setIsAutoPlaying(false);
		};

		const currentTestimonial = testimonials[currentIndex];

		// Loading state
		if (isLoading && !staticTestimonials) {
			return (
				<div
					ref={ref}
					className={cn(
						"w-full max-w-md rounded-xl border bg-card text-card-foreground shadow-lg p-6 sm:p-8 space-y-6 flex items-center justify-center min-h-[400px]",
						className,
					)}
					{...props}
				>
					<div className="flex flex-col items-center gap-4">
						<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
						<p className="text-sm text-muted-foreground">
							Loading testimonials...
						</p>
					</div>
				</div>
			);
		}

		// Error state
		if (error && !staticTestimonials) {
			return (
				<div
					ref={ref}
					className={cn(
						"w-full max-w-md rounded-xl border bg-card text-card-foreground shadow-lg p-6 sm:p-8 space-y-6",
						className,
					)}
					{...props}
				>
					<div className="flex flex-col items-center gap-4 text-center">
						<AlertCircle className="h-8 w-8 text-destructive" />
						<div className="space-y-2">
							<p className="text-sm font-medium">Failed to load testimonials</p>
							<p className="text-xs text-muted-foreground">
								{error instanceof Error ? error.message : "Unknown error"}
							</p>
						</div>
						<Button variant="outline" size="sm" onClick={() => refetch()}>
							Try Again
						</Button>
					</div>
				</div>
			);
		}

		// No testimonials state
		if (!currentTestimonial) {
			return (
				<div
					ref={ref}
					className={cn(
						"w-full max-w-md rounded-xl border bg-card text-card-foreground shadow-lg p-6 sm:p-8 space-y-6 text-center",
						className,
					)}
					{...props}
				>
					<div className="space-y-2">
						<p className="text-sm font-medium">No testimonials available</p>
						<p className="text-xs text-muted-foreground">
							Be the first to share your experience!
						</p>
					</div>
				</div>
			);
		}

		return (
			<div
				ref={ref}
				className={cn(
					"w-full max-w-md rounded-xl border bg-card text-card-foreground shadow-lg p-6 sm:p-8 space-y-6",
					className,
				)}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				{...props}
			>
				{/* Header Section */}
				{logo && (
					<div className="flex items-center gap-3">
						{logo}
						<span className="text-xl font-bold">{companyName}</span>
					</div>
				)}

				{/* Overall Rating Section */}
				{showRating && (
					<div className="flex items-center gap-2">
						<div className="flex items-center gap-1">
							{[...Array(5)].map((_, i) => (
								<Star
									key={i}
									className="h-7 w-7 text-green-500 fill-green-500"
								/>
							))}
						</div>
						<p className="text-muted-foreground text-sm">{totalRatingsText}</p>
					</div>
				)}

				{/* Features Section */}
				{showFeatures && features.length > 0 && (
					<div className="space-y-3">
						<h3 className="text-lg font-semibold">{title}</h3>
						<ul className="space-y-2 text-muted-foreground">
							{features.map((feature, index) => (
								<li key={index} className="flex items-center gap-2">
									<CheckCircle2 className="h-5 w-5 text-green-500" />
									<span>{feature}</span>
								</li>
							))}
						</ul>
					</div>
				)}

				{/* Testimonial Slider Section */}
				<div className="rounded-lg bg-muted p-4 space-y-4 relative overflow-hidden">
					<AnimatePresence mode="wait">
						<motion.div
							key={currentIndex}
							initial={{ opacity: 0, x: 50 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -50 }}
							transition={{ duration: 0.3, ease: "easeInOut" }}
							className="space-y-3"
						>
							<StarRating rating={currentTestimonial.rating} />
							<div className="flex items-center gap-3">
								{currentTestimonial.avatar && (
									<img
										src={currentTestimonial.avatar}
										alt={currentTestimonial.name}
										className="w-10 h-10 rounded-full object-cover"
									/>
								)}
								<div>
									<p className="font-semibold text-card-foreground">
										{currentTestimonial.name}
									</p>
									{(currentTestimonial.company || currentTestimonial.role) && (
										<p className="text-xs text-muted-foreground">
											{currentTestimonial.role}
											{currentTestimonial.company &&
												` at ${currentTestimonial.company}`}
										</p>
									)}
								</div>
							</div>
							{currentTestimonial.title && (
								<p className="font-medium text-card-foreground">
									"{currentTestimonial.title}"
								</p>
							)}
							<blockquote className="text-sm text-muted-foreground italic leading-relaxed">
								"{currentTestimonial.quote}"
							</blockquote>
						</motion.div>
					</AnimatePresence>

					{/* Navigation Buttons */}
					{showNavigation && testimonials.length > 1 && (
						<div className="flex items-center justify-between pt-2">
							<Button
								variant="outline"
								size="icon"
								className="h-8 w-8 rounded-full"
								onClick={handlePrev}
								aria-label="Previous testimonial"
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>

							{/* Pagination dots */}
							<div className="flex items-center gap-1">
								{testimonials.slice(0, 5).map((_, index) => (
									<button
										key={index}
										className={cn(
											"w-2 h-2 rounded-full transition-colors",
											index === currentIndex % 5
												? "bg-primary"
												: "bg-muted-foreground/30",
										)}
										onClick={() => setCurrentIndex(index)}
										aria-label={`Go to testimonial ${index + 1}`}
									/>
								))}
							</div>

							<Button
								variant="outline"
								size="icon"
								className="h-8 w-8 rounded-full"
								onClick={handleNext}
								aria-label="Next testimonial"
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					)}
				</div>
			</div>
		);
	},
);
TestimonialCard.displayName = "TestimonialCard";

export { TestimonialCard };
