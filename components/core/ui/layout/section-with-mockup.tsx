/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { Filter } from "lucide-react";
("use client");

import { motion } from "framer-motion";
import Image from "next/image";
import type React from "react";

interface SectionWithMockupProps {
	title?: string | React.ReactNode;
	description?: string | React.ReactNode;
	primaryImageSrc?: string;
	secondaryImageSrc?: string;
	reverseLayout?: boolean;
	// New prop for dynamic content
	data?: {
		title?: string;
		subtitle?: string;
		description?: string;
		primaryImage?: string;
		secondaryImage?: string;
		ctaText?: string;
		ctaUrl?: string;
		layout?: string;
		backgroundColor?: string;
	};
	loading?: boolean;
}

const SectionWithMockup: React.FC<SectionWithMockupProps> = ({
	title,
	description,
	primaryImageSrc,
	secondaryImageSrc,
	reverseLayout = false,
	data,
	loading = false,
}) => {
	// Use data from props or fallback to individual props
	const sectionTitle = data?.title || title;
	const sectionDescription = data?.description || description;
	const primaryImage = data?.primaryImage || primaryImageSrc;
	const secondaryImage = data?.secondaryImage || secondaryImageSrc;

	const containerVariants = {
		hidden: {},
		visible: {
			transition: {
				staggerChildren: 0.2,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 50 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.7, ease: "easeOut" },
		},
	};

	const layoutClasses =
		reverseLayout || data?.layout === "reverse"
			? "md:grid-cols-2 md:grid-flow-col-dense"
			: "md:grid-cols-2";

	const textOrderClass =
		reverseLayout || data?.layout === "reverse" ? "md:col-start-2" : "";
	const imageOrderClass =
		reverseLayout || data?.layout === "reverse" ? "md:col-start-1" : "";

	if (loading) {
		return (
			<section className="relative py-24 md:py-48 bg-black overflow-hidden">
				<div className="container max-w-[1220px] w-full px-6 md:px-10 relative z-10 mx-auto">
					<div className="animate-pulse">
						<div className="h-8 bg-gray-800 rounded mb-4" />
						<div className="h-4 bg-gray-800 rounded mb-2" />
						<div className="h-4 bg-gray-800 rounded mb-2" />
						<div className="h-4 bg-gray-800 rounded w-3/4" />
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="relative py-24 md:py-48 bg-black overflow-hidden">
			<div className="container max-w-[1220px] w-full px-6 md:px-10 relative z-10 mx-auto">
				<motion.div
					className={`grid grid-cols-1 gap-16 md:gap-8 w-full items-center ${layoutClasses}`}
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.2 }}
				>
					{/* Text Content */}
					<motion.div
						className={`flex flex-col items-start gap-4 mt-10 md:mt-0 max-w-[546px] mx-auto md:mx-0 ${textOrderClass}`}
						variants={itemVariants}
					>
						<div className="space-y-2 md:space-y-1">
							<h2 className="text-white text-3xl md:text-[40px] font-semibold leading-tight md:leading-[53px]">
								{sectionTitle}
							</h2>
						</div>

						<p className="text-[#868f97] text-sm md:text-[15px] leading-6">
							{sectionDescription}
						</p>

						{data?.ctaText && data?.ctaUrl && (
							<div className="mt-4">
								<a
									href={data.ctaUrl}
									className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
								>
									{data.ctaText}
								</a>
							</div>
						)}
						{/* Optional: Add a button or link here */}
						{/* <div>
                            <button className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-md">Learn More</button>
                         </div> */}
					</motion.div>

					{/* App mockup/Image Content */}
					<motion.div
						className={`relative mt-10 md:mt-0 mx-auto ${imageOrderClass} w-full max-w-[300px] md:max-w-[471px]`}
						variants={itemVariants}
					>
						{/* Decorative Background Element */}
						<motion.div
							className={
								"absolute w-[300px] h-[317px] md:w-[472px] md:h-[500px] bg-[#090909] rounded-[32px] z-0"
							}
							style={{
								top:
									reverseLayout || data?.layout === "reverse" ? "auto" : "10%",
								bottom:
									reverseLayout || data?.layout === "reverse" ? "10%" : "auto",
								left:
									reverseLayout || data?.layout === "reverse" ? "auto" : "-20%",
								right:
									reverseLayout || data?.layout === "reverse" ? "-20%" : "auto",
								transform:
									reverseLayout || data?.layout === "reverse"
										? "translate(0, 0)"
										: "translateY(10%)",
								filter: "blur(2px)",
							}}
							initial={{
								y: reverseLayout || data?.layout === "reverse" ? 0 : 0,
							}}
							whileInView={{
								y: reverseLayout || data?.layout === "reverse" ? -20 : -30,
							}}
							transition={{ duration: 1.2, ease: "easeOut" }}
							viewport={{ once: true, amount: 0.5 }}
						>
							{secondaryImage && (
								<div
									className="relative w-full h-full bg-cover bg-center rounded-[32px]"
									style={{
										backgroundImage: `url(${secondaryImage})`,
									}}
								/>
							)}
						</motion.div>

						{/* Main Mockup Card */}
						<motion.div
							className="relative w-full h-[405px] md:h-[637px] bg-[#ffffff0a] rounded-[32px] backdrop-blur-[15px] backdrop-brightness-[100%] border-0 z-10 overflow-hidden"
							initial={{
								y: reverseLayout || data?.layout === "reverse" ? 0 : 0,
							}}
							whileInView={{
								y: reverseLayout || data?.layout === "reverse" ? 20 : 30,
							}}
							transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
							viewport={{ once: true, amount: 0.5 }}
						>
							<div className="p-0 h-full">
								<div
									className="h-full relative"
									style={{
										backgroundSize: "100% 100%",
									}}
								>
									{/* Primary Image */}
									{primaryImage && (
										<div
											className="w-full h-full bg-cover bg-center"
											style={{
												backgroundImage: `url(${primaryImage})`,
											}}
										/>
									)}
								</div>
							</div>
						</motion.div>
					</motion.div>
				</motion.div>
			</div>

			{/* Decorative bottom gradient */}
			<div
				className="absolute w-full h-px bottom-0 left-0 z-0"
				style={{
					background:
						"radial-gradient(50% 50% at 50% 50%, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0) 100%)",
				}}
			/>
		</section>
	);
};

export default SectionWithMockup;
