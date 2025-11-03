import { Metadata } from "next";
import { BlogManagementClient } from "./blog-management-client";

export const metadata: Metadata = {
	title: "Blog Management | Financbase",
	description: "Create, manage, and publish blog content for your audience",
};

export default function BlogPage() {
	return <BlogManagementClient />;
}
