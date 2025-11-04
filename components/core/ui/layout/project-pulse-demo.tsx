/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { XCircle } from "lucide-react";
import ProjectPulseTracker from "./project-pulse-client";
import { ProjectPulseErrorBoundary } from "./project-pulse-error-boundary";

const ProjectPulseDemo = () => {
	return (
		<ProjectPulseErrorBoundary>
			<ProjectPulseTracker />
		</ProjectPulseErrorBoundary>
	);
};

export { ProjectPulseDemo };
