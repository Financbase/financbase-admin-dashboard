import { FreelancerStatsCard } from "@/components/ui/freelancer-stats-card";
// demo.tsx
import * as React from "react";

// A simple SVG icon to be passed as a prop, as seen in the design.
const LaurelIcon = () => (
	<svg
		width="80"
		height="36"
		viewBox="0 0 80 36"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		className="opacity-20"
		aria-hidden="true"
	>
		<path
			d="M26.6667 35C20 35 15.3333 30.8333 12.6667 22.3333C10 13.8333 10 1 10 1M53.3333 35C60 35 64.6667 30.8333 67.3333 22.3333C70 13.8333 70 1 70 1"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M18 6.83331C19.1667 7.49998 22.3 9.7 20.5 13.5C18.7 17.3 14.8333 15.6666 14 15"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M21.3333 12.3333C22.5 13 25.6333 15.2 23.8333 19C22.0333 22.8 18.1667 21.1666 17.3333 20.5"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M24.6667 17.8333C25.8333 18.5 28.9667 20.7 27.1667 24.5C25.3667 28.3 21.5 26.6666 20.6667 26"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M62 6.83331C60.8333 7.49998 57.7 9.7 59.5 13.5C61.3 17.3 65.1667 15.6666 66 15"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M58.6667 12.3333C57.5 13 54.3667 15.2 56.1667 19C57.9667 22.8 61.8333 21.1666 62.6667 20.5"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M55.3333 17.8333C54.1667 18.5 51.0333 20.7 52.8333 24.5C54.6333 28.3 58.5 26.6666 59.3333 26"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

// Mock data for the demo
const statsCardData = {
	title: "Stats",
	timeFrame: "All Time",
	earnings: {
		amount: 9787.32,
		change: 2456.12,
		changePeriod: "since last month",
	},
	subStats: [
		{ value: 36, label: "projects", subLabel: "5 this month" },
		{ value: 10, label: "clients", subLabel: "3 this month" },
	] as [
		{ value: number; label: string; subLabel: string },
		{ value: number; label: string; subLabel: string },
	], // Type assertion for fixed-length array
	ranking: {
		place: "5th place",
		category: "top-hire freelancers",
		icon: <LaurelIcon />,
	},
	availability: {
		title: "Availability",
		bars: [
			{ level: 1 },
			{ level: 1 },
			{ level: 1 },
			{ level: 1 },
			{ level: 1 },
			{ level: 0.8 },
			{ level: 0.8 },
			{ level: 0.8 },
			{ level: 0.8 },
			{ level: 0.6 },
			{ level: 0.6 },
			{ level: 0.6 },
			{ level: 0.6 },
			{ level: 0.4 },
			{ level: 0.4 },
			{ level: 0.4 },
			{ level: 0.2 },
			{ level: 0.2 },
			{ level: 0.2 },
			{ level: 0.1 },
			{ level: 0.1 },
			{ level: 0.1 },
			{ level: 0.1 },
			{ level: 0.1 },
		],
		label: "100h/month",
	},
};

export default function FreelancerStatsCardDemo() {
	return (
		<div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
			<FreelancerStatsCard {...statsCardData} />
		</div>
	);
}
