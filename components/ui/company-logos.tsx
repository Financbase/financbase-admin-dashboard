/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { PartnerLogo } from "@/app/(public)/about/data";

interface CompanyLogosProps {
	logos: PartnerLogo[];
	title?: string;
	description?: string;
	className?: string;
}

export function CompanyLogos({
	logos,
	title = "Valued by clients worldwide",
	description,
	className,
}: CompanyLogosProps) {
	if (!logos || logos.length === 0) {
		return null;
	}

	return (
		<section
			className={cn("py-16 bg-muted/30", className)}
			aria-label="Partner companies"
		>
			<div className="max-w-6xl mx-auto px-6">
				{(title || description) && (
					<div className="text-center mb-12">
						{title && (
							<h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
								{title}
							</h2>
						)}
						{description && (
							<p className="text-muted-foreground max-w-2xl mx-auto">
								{description}
							</p>
						)}
					</div>
				)}

				<div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 md:gap-12">
					{logos.map((logo, index) => {
						const content = (
							<motion.div
								key={logo.name}
								className="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 0.6, y: 0 }}
								viewport={{ once: true, margin: "-50px" }}
								transition={{
									duration: 0.5,
									delay: index * 0.1,
									ease: "easeOut",
								}}
								whileHover={{ scale: 1.05, opacity: 1 }}
							>
								<Image
									src={logo.src}
									alt={logo.alt}
									width={120}
									height={60}
									className="h-6 w-auto sm:h-8 md:h-12 object-contain max-w-[120px]"
									loading="lazy"
								/>
							</motion.div>
						);

						if (logo.href) {
							return (
								<Link
									key={logo.name}
									href={logo.href}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={`Visit ${logo.name}`}
								>
									{content}
								</Link>
							);
						}

						return content;
					})}
				</div>
			</div>
		</section>
	);
}

