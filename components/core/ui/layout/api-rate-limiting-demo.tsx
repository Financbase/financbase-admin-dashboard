import { Component } from "@/components/ui/api-rate-limiting-card";
import { Code } from "lucide-react";

export default function DemoOne() {
	return (
		<div className="p-8 bg-neutral-900 min-h-screen">
			<Component hours={24} />
		</div>
	);
}
