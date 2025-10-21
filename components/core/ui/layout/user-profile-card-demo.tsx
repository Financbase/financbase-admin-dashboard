import { XCircle } from "lucide-react";
("use client");

import {
	Component,
	UserProfileCardProps,
} from "@/components/ui/user-profile-card";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useState } from "react";

export default function UserProfileCardDemo() {
	const { user, isLoading, error, refetch, updateProfile } = useUserProfile({
		onError: (error) => {
			console.error("Profile error:", error);
		},
		onSuccess: (user) => {
			console.log("Profile loaded:", user);
		},
	});

	const [showStats, setShowStats] = useState(true);
	const [compact, setCompact] = useState(false);

	const handleViewProfile = () => {
		// In a real app, this would navigate to the full profile page
		console.log("View full profile clicked");
	};

	const handleUpdateProfile = async () => {
		if (!user) return;

		try {
			await updateProfile({
				firstName: user.firstName || "Updated",
			});
		} catch (error) {
			console.error("Failed to update profile:", error);
		}
	};

	return (
		<div className="p-8 space-y-6">
			<div className="space-y-4">
				<h1 className="text-2xl font-bold">User Profile Card Demo</h1>

				<div className="flex gap-4 flex-wrap">
					<button
						onClick={() => setShowStats(!showStats)}
						className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
					>
						{showStats ? "Hide Stats" : "Show Stats"}
					</button>

					<button
						onClick={() => setCompact(!compact)}
						className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
					>
						{compact ? "Normal View" : "Compact View"}
					</button>

					<button
						onClick={refetch}
						className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
					>
						Refresh Data
					</button>

					<button
						onClick={handleUpdateProfile}
						className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
						disabled={isLoading || !user}
					>
						Update Profile
					</button>
				</div>
			</div>

			<div className="flex justify-center">
				<Component
					isLoading={isLoading}
					error={error}
					onViewProfile={handleViewProfile}
					showStats={showStats}
					compact={compact}
					className="max-w-sm"
				/>
			</div>

			{user && (
				<div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
					<h3 className="text-lg font-semibold mb-2">Current User Data:</h3>
					<pre className="text-sm overflow-x-auto">
						{JSON.stringify(user, null, 2)}
					</pre>
				</div>
			)}

			{error && (
				<div className="mt-8 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
					<h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
						Error:
					</h3>
					<p className="text-red-600 dark:text-red-400">{error}</p>
				</div>
			)}
		</div>
	);
}
