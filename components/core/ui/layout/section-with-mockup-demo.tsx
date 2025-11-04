/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import React from "react";

// Ensure this import path is correct for your project structure
import SectionWithMockup from "./section-with-mockup";

// Data for the first section (default layout)
const exampleData1 = {
	title: (
		<>
			Intelligence,
			<br />
			delivered to you.
		</>
	),
	description: (
		<>
			Get a tailored Monday morning brief directly in
			<br />
			your inbox, crafted by your virtual personal
			<br />
			analyst, spotlighting essential watchlist stories
			<br />
			and earnings for the week ahead.
		</>
	),
	primaryImageSrc:
		"https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
	secondaryImageSrc:
		"https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
};

// Changed from 'export default function ...' to 'export function ...'
export function SectionMockupDemoPage() {
	return (
		<SectionWithMockup
			title={exampleData1.title}
			description={exampleData1.description}
			primaryImageSrc={exampleData1.primaryImageSrc}
			secondaryImageSrc={exampleData1.secondaryImageSrc}
		/>
	);
}
