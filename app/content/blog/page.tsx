/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { Metadata } from "next";
import { BlogManagementClient } from "./blog-management-client";

export const metadata: Metadata = {
	title: "Blog Management | Financbase",
	description: "Create, manage, and publish blog content for your audience",
};

export default function BlogPage() {
	return <BlogManagementClient />;
}
