import { ManageAccess } from "@/components/ui/manage-access-component";
import { File, Folder } from "lucide-react";
import * as React from "react";

const ManageAccessDemo = () => {
	// For demo purposes, we'll use a fixed folder ID
	// In a real application, this would come from props or context
	const folderId = 1;

	return (
		<div className="flex items-center justify-center min-h-screen bg-background p-4">
			<ManageAccess
				folderId={folderId}
				fileUrl="https://brainwave.co/file/k373nH"
			/>
		</div>
	);
};

export default ManageAccessDemo;
