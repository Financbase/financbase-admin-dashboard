import { Button } from "@/components/ui/button";
import SharePopoverDemo from "@/components/ui/popover-demo";
import { Share2 } from "lucide-react";
import type React from "react";

interface ShareableItem {
	id: string | number;
	title: string;
	description?: string;
	type: string;
}

interface ShareButtonProps {
	item: ShareableItem;
	variant?: "default" | "outline" | "ghost" | "link";
	size?: "default" | "sm" | "lg" | "icon";
	className?: string;
	children?: React.ReactNode;
}

/**
 * ShareButton - A reusable component for sharing different types of content
 *
 * @param item - The item to be shared (project, product, post, etc.)
 * @param variant - Button variant style
 * @param size - Button size
 * @param className - Additional CSS classes
 * @param children - Custom trigger content (optional)
 */
export function ShareButton({
	item,
	variant = "outline",
	size = "sm",
	className,
	children,
}: ShareButtonProps) {
	// Transform the item data for the popover component
	const itemData = {
		id: String(item.id),
		title: item.title,
		description: item.description || "",
		type: item.type,
	};

	return <SharePopoverDemo itemData={itemData} />;
}

// Export the SharePopoverDemo for direct use when needed
export { default as SharePopover } from "@/components/ui/popover-demo";
