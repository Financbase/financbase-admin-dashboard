import { VideoMeetingInterface } from '@/components/video-conferencing/meeting-interface';

// Force dynamic rendering to prevent static generation
export const dynamic = 'force-dynamic';

export default function VideoMeetingsPage() {
	return <VideoMeetingInterface />;
}
