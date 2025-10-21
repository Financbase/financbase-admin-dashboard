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
