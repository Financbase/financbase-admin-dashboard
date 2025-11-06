/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { Component } from "@/components/core/ui/layout/api-rate-limiting-card";
import { Code } from "lucide-react";

export default function DemoOne() {
	return (
		<div className="p-8 bg-neutral-900 min-h-screen">
			<Component hours={24} />
		</div>
	);
}
