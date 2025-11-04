/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { VideoMeetingInterface } from '@/components/video-conferencing/meeting-interface';

// Force dynamic rendering to prevent static generation
export const dynamic = 'force-dynamic';

export default function VideoMeetingsPage() {
	return <VideoMeetingInterface />;
}
