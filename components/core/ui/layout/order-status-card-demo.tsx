/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import {
	OrderStatusCard,
	type OrderStatusCardProps,
} from "@/components/ui/order-status-card";
import { CheckCircle2, Clock, MessageSquare, User } from "lucide-react";

// --- Demo Component ---
const OrderStatusCardDemo = () => {
	// Mock data to be passed as props
	const orderData: Omit<OrderStatusCardProps, "onContinue"> = {
		title: "Order completed! 🎉",
		description:
			"Order has been completed and feedback request sent to client.",
		timelineItems: [
			{
				icon: <Clock className="h-5 w-5 text-muted-foreground" />,
				title: "Order Duration: 7 days",
			},
			{
				icon: <MessageSquare className="h-5 w-5 text-blue-500" />,
				title: "Feedback request has been sent",
				details: "12 Dec 2024, 12:15 • Company",
				subItems: [
					{
						icon: <User className="h-4 w-4" />,
						text: "Sent to: Jane Doe",
					},
				],
			},
			{
				icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
				title: "Order completed",
				details: "12 Dec 2024, 9:15 • John Smith",
				statusChange: {
					from: "In progress",
					to: "Completed",
				},
			},
		],
		// The onClose prop is optional and can be omitted
		onClose: () => alert("Close button clicked!"),
	};

	return (
		<div className="flex h-full w-full items-center justify-center bg-background p-4">
			<OrderStatusCard
				{...orderData}
				onContinue={() => alert("Continue button clicked!")}
			/>
		</div>
	);
};

export default OrderStatusCardDemo;
