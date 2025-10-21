"use client";

import {
	ArrowUpRight,
	Building,
	Github,
	Image,
	Key,
	Linkedin,
	Mail,
	MapPin,
	Phone,
	Twitter,
	UserCog,
	Users,
} from "lucide-react";
import type React from "react";
import { useState } from "react";

/**
 * Generic Profile Card Props Interface
 */
interface ProfileCardProps {
	/** Profile image URL */
	avatarUrl?: string;
	/** User's full name */
	name: string;
	/** Job title/position */
	title?: string;
	/** Department or organization */
	department?: string;
	/** Short bio or description */
	bio?: string;
	/** Contact information */
	contact?: {
		email?: string;
		phone?: string;
		location?: string;
	};
	/** Social media links */
	socialLinks?: Array<{
		id: string;
		icon: React.ElementType;
		label: string;
		href: string;
	}>;
	/** Action button configuration */
	actionButton?: {
		text: string;
		href: string;
		onClick?: () => void;
	};
	/** Additional custom content to display */
	children?: React.ReactNode;
	/** Card styling variant */
	variant?: "default" | "employee" | "team";
}

/**
 * Flexible Profile Card Component
 * A responsive, animated profile card that can display various types of profile information
 */
export const ProfileCard: React.FC<ProfileCardProps> = ({
	avatarUrl,
	name,
	title,
	department,
	bio,
	contact,
	socialLinks = [],
	actionButton,
	children,
	variant = "default",
}) => {
	const [hoveredItem, setHoveredItem] = useState<string | null>(null);

	// Generate avatar URL if not provided
	const displayAvatarUrl =
		avatarUrl ||
		"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face&auto=format";

	// Create initials fallback for avatar
	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase())
			.slice(0, 2)
			.join("");
	};

	return (
		<div className="relative w-full max-w-sm mx-auto">
			<div
				className="relative flex flex-col items-center p-6 rounded-2xl border transition-all duration-500 ease-out backdrop-blur-xl bg-card/40 border-white/10"
				style={{
					boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
				}}
			>
				{/* Avatar Section */}
				<div className="w-24 h-24 mb-4 rounded-full p-1 border-2 border-white/20 bg-gradient-to-br from-primary/20 to-secondary/20">
					{displayAvatarUrl ? (
						<img
							src={displayAvatarUrl}
							alt={`${name}'s Avatar`}
							className="w-full h-full rounded-full object-cover"
							onError={(e) => {
								e.currentTarget.onerror = null;
								e.currentTarget.src = `https://placehold.co/96x96/6366f1/white?text=${getInitials(name)}`;
							}}
						/>
					) : (
						<div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-lg">
							{getInitials(name)}
						</div>
					)}
				</div>

				{/* Name and Title */}
				<h2 className="text-xl font-bold text-card-foreground text-center">
					{name}
				</h2>
				{title && (
					<p className="mt-1 text-sm font-medium text-primary text-center">
						{title}
					</p>
				)}
				{department && (
					<p className="mt-1 text-xs text-muted-foreground text-center flex items-center gap-1">
						<Building size={12} />
						{department}
					</p>
				)}

				{/* Bio */}
				{bio && (
					<p className="mt-4 text-center text-sm leading-relaxed text-muted-foreground">
						{bio}
					</p>
				)}

				{/* Contact Information */}
				{contact && (contact.email || contact.phone || contact.location) && (
					<>
						<div className="w-1/2 h-px my-4 rounded-full bg-border" />
						<div className="flex flex-col gap-2 w-full">
							{contact.email && (
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<Mail size={14} />
									<span className="truncate">{contact.email}</span>
								</div>
							)}
							{contact.phone && (
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<Phone size={14} />
									<span>{contact.phone}</span>
								</div>
							)}
							{contact.location && (
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<MapPin size={14} />
									<span className="truncate">{contact.location}</span>
								</div>
							)}
						</div>
					</>
				)}

				{/* Social Links */}
				{socialLinks.length > 0 && (
					<>
						<div className="w-1/2 h-px my-4 rounded-full bg-border" />
						<div className="flex items-center justify-center gap-3">
							{socialLinks.map((item) => (
								<SocialButton
									key={item.id}
									item={item}
									setHoveredItem={setHoveredItem}
									hoveredItem={hoveredItem}
								/>
							))}
						</div>
					</>
				)}

				{/* Action Button */}
				{actionButton && <ActionButton action={actionButton} />}

				{/* Custom Content */}
				{children && (
					<>
						<div className="w-1/2 h-px my-4 rounded-full bg-border" />
						{children}
					</>
				)}
			</div>

			{/* Background Glow Effect */}
			<div className="absolute inset-0 rounded-2xl -z-10 transition-all duration-500 ease-out blur-2xl opacity-30 bg-gradient-to-r from-indigo-500/50 to-purple-500/50" />
		</div>
	);
};

// Social Button Component
const SocialButton = ({
	item,
	setHoveredItem,
	hoveredItem,
}: {
	item: ProfileCardProps["socialLinks"][0];
	setHoveredItem: (id: string | null) => void;
	hoveredItem: string | null;
}) => (
	<div className="relative">
		<a
			href={item.href}
			onClick={(e) => e.preventDefault()}
			className="relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ease-out group overflow-hidden bg-secondary/50 hover:bg-secondary"
			onMouseEnter={() => setHoveredItem(item.id)}
			onMouseLeave={() => setHoveredItem(null)}
			aria-label={item.label}
		>
			<div className="relative z-10 flex items-center justify-center">
				<item.icon
					size={20}
					className="transition-all duration-200 ease-out text-secondary-foreground/70 group-hover:text-secondary-foreground"
				/>
			</div>
		</a>
		<Tooltip item={item} hoveredItem={hoveredItem} />
	</div>
);

// Action Button Component
const ActionButton = ({
	action,
}: { action: ProfileCardProps["actionButton"] }) => (
	<a
		href={action?.href}
		onClick={(e) => {
			e.preventDefault();
			action?.onClick?.();
		}}
		className="flex items-center gap-2 px-6 py-3 mt-6 rounded-full font-semibold text-base backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.03] active:scale-95 group bg-primary text-primary-foreground"
		style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
	>
		<span>{action?.text}</span>
		<ArrowUpRight
			size={16}
			className="transition-transform duration-300 ease-out group-hover:rotate-45"
		/>
	</a>
);

// Tooltip Component
const Tooltip = ({
	item,
	hoveredItem,
}: {
	item: ProfileCardProps["socialLinks"][0];
	hoveredItem: string | null;
}) => (
	<div
		role="tooltip"
		className={`absolute -top-12 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-lg backdrop-blur-md border text-xs font-medium whitespace-nowrap transition-all duration-300 ease-out pointer-events-none bg-popover text-popover-foreground border-border ${hoveredItem === item.id ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
		style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
	>
		{item.label}
		<div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-popover border-b border-r border-border" />
	</div>
);
