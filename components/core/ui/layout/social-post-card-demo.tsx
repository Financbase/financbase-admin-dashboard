/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { SocialPostCard } from "@/components/ui/social-post-card";

const DemoOne = () => {
	return <SocialPostCard 
		author={{ name: "John Doe", handle: "@johndoe" }}
		content="This is a sample social media post"
		timestamp="2 hours ago"
		likes={42}
		comments={5}
		shares={3}
	/>;
};

export { DemoOne };
