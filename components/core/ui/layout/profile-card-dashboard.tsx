/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, Phone } from "lucide-react";
import React from "react";

interface ContactInfo {
	email?: string;
	phone?: string;
	location?: string;
}

interface ProfileCardProps {
	name: string;
	title?: string;
	contact?: ContactInfo;
	avatarUrl?: string;
	variant?: "employee" | "customer" | "default";
	bio?: string;
	className?: string;
}

export function ProfileCard({
	name,
	title,
	contact,
	avatarUrl,
	variant = "default",
	bio,
	className = "",
}: ProfileCardProps) {
	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	const getVariantStyles = () => {
		switch (variant) {
			case "employee":
				return {
					cardClass: "border-blue-200 bg-blue-50/50",
					badgeClass: "bg-blue-100 text-blue-800",
					iconClass: "text-blue-600",
				};
			case "customer":
				return {
					cardClass: "border-green-200 bg-green-50/50",
					badgeClass: "bg-green-100 text-green-800",
					iconClass: "text-green-600",
				};
			default:
				return {
					cardClass: "border-gray-200 bg-gray-50/50",
					badgeClass: "bg-gray-100 text-gray-800",
					iconClass: "text-gray-600",
				};
		}
	};

	const styles = getVariantStyles();

	return (
		<Card className={`w-full max-w-sm ${styles.cardClass} ${className}`}>
			<CardContent className="p-6">
				<div className="flex flex-col items-center text-center space-y-4">
					{/* Avatar */}
					<Avatar className="w-20 h-20">
						<AvatarImage src={avatarUrl} alt={`${name}'s avatar`} />
						<AvatarFallback
							className={`text-lg font-semibold ${styles.iconClass}`}
						>
							{getInitials(name)}
						</AvatarFallback>
					</Avatar>

					{/* Name and Title */}
					<div className="space-y-1">
						<h3 className="text-xl font-semibold text-gray-900">{name}</h3>
						{title && <p className="text-sm text-gray-600">{title}</p>}
					</div>

					{/* Variant Badge */}
					<Badge className={styles.badgeClass}>
						{variant.charAt(0).toUpperCase() + variant.slice(1)}
					</Badge>

					{/* Bio */}
					{bio && (
						<p className="text-sm text-gray-600 leading-relaxed">{bio}</p>
					)}

					{/* Contact Information */}
					{contact && (
						<div className="w-full space-y-2 pt-2">
							{contact.email && (
								<div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
									<Mail className={`w-4 h-4 ${styles.iconClass}`} />
									<span className="truncate">{contact.email}</span>
								</div>
							)}
							{contact.phone && (
								<div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
									<Phone className={`w-4 h-4 ${styles.iconClass}`} />
									<span>{contact.phone}</span>
								</div>
							)}
							{contact.location && (
								<div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
									<MapPin className={`w-4 h-4 ${styles.iconClass}`} />
									<span>{contact.location}</span>
								</div>
							)}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
