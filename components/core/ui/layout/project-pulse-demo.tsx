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
