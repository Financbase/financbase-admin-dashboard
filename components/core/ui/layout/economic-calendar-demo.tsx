/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

// demo.tsx
import { EconomicCalendar } from "@/components/ui/economic-calendar";

export default function EconomicCalendarDemo() {
	return (
		<div className="w-full bg-background flex items-center justify-center py-12">
			<EconomicCalendar
				title="Economic Calendar"
				limit={20}
				country="US"
				impact="high"
			/>
		</div>
	);
}
