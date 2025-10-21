import { CommunityHubCard } from "@/components/ui/community-hub-card";

// Real Unsplash stock images for avatars
const communityData = {
	title: "Readers Unite",
	subtitle: "Your gateway to literary adventures",
	memberCount: 1234,
	members: [
		{
			src: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
			alt: "Member 1",
			fallback: "M1",
		},
		{
			src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
			alt: "Member 2",
			fallback: "M2",
		},
		{
			src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
			alt: "Member 3",
			fallback: "M3",
		},
		{
			src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
			alt: "Member 4",
			fallback: "M4",
		},
	],
	inviteLink: "https://readersunite.com/invite/Bk7LA3G",
	currentBook: {
		title: "The Great Gatsby",
		progress: 65,
	},
	upcomingBooks: [
		{ title: "To Kill a Mockingbird", author: "Harper Lee" },
		{ title: "1984", author: "George Orwell" },
		{ title: "Pride and Prejudice", author: "Jane Austen" },
	],
};

/**
 * A demo page to showcase the CommunityHubCard component.
 * It passes mock data to the component to render a realistic preview.
 */
export default function CommunityHubCardDemo() {
	return (
		<div className="flex items-center justify-center bg-background p-4 md:p-8 min-h-screen">
			<CommunityHubCard
				title={communityData.title}
				subtitle={communityData.subtitle}
				memberCount={communityData.memberCount}
				members={communityData.members}
				inviteLink={communityData.inviteLink}
				currentBook={communityData.currentBook}
				upcomingBooks={communityData.upcomingBooks}
			/>
		</div>
	);
}
