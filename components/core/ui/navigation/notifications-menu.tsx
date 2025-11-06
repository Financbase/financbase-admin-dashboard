/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { 
	BarChart3, 
	Bell, 
	File, 
	FileText, 
	Key,
	MessageCircle,
	Users,
	Mail,
	Folder,
	AtSign,
	Heart,
	CheckCircle,
	Settings
} from "lucide-react";
import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Notification = {
	id: number;
	type: string;
	user: {
		name: string;
		avatar: string;
		fallback: string;
	};
	action: string;
	target?: string;
	content?: string;
	timestamp: string;
	timeAgo: string;
	isRead: boolean;
	hasActions?: boolean;
	file?: {
		name: string;
		size: string;
		type: string;
	};
};

// Enhanced notification data with more variety
const notifications: Array<Notification> = [
	{
		id: 1,
		type: "comment",
		user: {
			name: "Amélie",
			avatar:
				"https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
			fallback: "A",
		},
		action: "commented in",
		target: "Dashboard 2.0",
		content:
			"Really love this approach. I think this is the best solution for the document sync UX issue.",
		timestamp: "Friday 3:12 PM",
		timeAgo: "2 hours ago",
		isRead: false,
	},
	{
		id: 2,
		type: "follow",
		user: {
			name: "Sienna",
			avatar:
				"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
			fallback: "S",
		},
		action: "followed you",
		timestamp: "Friday 3:04 PM",
		timeAgo: "2 hours ago",
		isRead: false,
	},
	{
		id: 3,
		type: "invitation",
		user: {
			name: "Ammar",
			avatar:
				"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
			fallback: "A",
		},
		action: "invited you to",
		target: "Blog design",
		timestamp: "Friday 2:22 PM",
		timeAgo: "3 hours ago",
		isRead: true,
		hasActions: true,
	},
	{
		id: 4,
		type: "file_share",
		user: {
			name: "Mathilde",
			avatar:
				"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
			fallback: "M",
		},
		action: "shared a file in",
		target: "Dashboard 2.0",
		file: {
			name: "Prototype recording 01.mp4",
			size: "14 MB",
			type: "MP4",
		},
		timestamp: "Friday 1:40 PM",
		timeAgo: "4 hours ago",
		isRead: true,
	},
	{
		id: 5,
		type: "mention",
		user: {
			name: "James",
			avatar:
				"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
			fallback: "J",
		},
		action: "mentioned you in",
		target: "Project Alpha",
		content:
			"Hey @you, can you review the latest designs when you get a chance?",
		timestamp: "Thursday 11:30 AM",
		timeAgo: "1 day ago",
		isRead: true,
	},
	{
		id: 6,
		type: "like",
		user: {
			name: "Sofia",
			avatar:
				"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
			fallback: "S",
		},
		action: "liked your comment in",
		target: "Team Meeting Notes",
		timestamp: "Thursday 9:15 AM",
		timeAgo: "1 day ago",
		isRead: true,
	},
	{
		id: 7,
		type: "task_completed",
		user: {
			name: "Marcus",
			avatar:
				"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
			fallback: "M",
		},
		action: "completed task",
		target: "Update user permissions",
		timestamp: "Wednesday 4:30 PM",
		timeAgo: "2 days ago",
		isRead: true,
	},
	{
		id: 8,
		type: "system",
		user: {
			name: "System",
			avatar: "",
			fallback: "S",
		},
		action: "updated",
		target: "Database schema",
		content: "New tables added for enhanced analytics tracking.",
		timestamp: "Wednesday 2:15 PM",
		timeAgo: "2 days ago",
		isRead: true,
	},
];

function NotificationItem({ notification }: { notification: Notification }) {
	const getNotificationIcon = (type: string) => {
		const iconClass = "h-4 w-4 text-muted-foreground";
		switch (type) {
			case "comment":
				return <MessageCircle className={iconClass} />;
			case "follow":
				return <Users className={iconClass} />;
			case "invitation":
				return <Mail className={iconClass} />;
			case "file_share":
				return <Folder className={iconClass} />;
			case "mention":
				return <AtSign className={iconClass} />;
			case "like":
				return <Heart className={iconClass} />;
			case "task_completed":
				return <CheckCircle className={iconClass} />;
			case "system":
				return <Settings className={iconClass} />;
			default:
				return <Bell className={iconClass} />;
		}
	};

	return (
		<div className="w-full py-4 first:pt-0 last:pb-0 group hover:bg-muted/30 transition-colors">
			<div className="flex gap-3">
				{notification.user.avatar ? (
					<Avatar className="size-11">
						<AvatarImage
							src={notification.user.avatar}
							alt={`${notification.user.name}'s profile picture`}
							className="object-cover ring-1 ring-border"
						/>
						<AvatarFallback>{notification.user.fallback}</AvatarFallback>
					</Avatar>
				) : (
					<div className="size-11 rounded-full bg-muted flex items-center justify-center text-sm font-medium ring-1 ring-border">
						{notification.user.fallback}
					</div>
				)}

				<div className="flex flex-1 flex-col space-y-2">
					<div className="w-full items-start">
						<div className="flex items-center justify-between gap-2">
							<div className="text-sm">
								<span className="font-medium">{notification.user.name}</span>
								<span className="text-muted-foreground">
									{" "}
									{notification.action}{" "}
								</span>
								{notification.target && (
									<span className="font-medium">{notification.target}</span>
								)}
							</div>
							<div className="flex items-center gap-2">
								{!notification.isRead && (
									<div className="size-2 rounded-full bg-primary" />
								)}
								<div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
									{notification.timeAgo}
								</div>
							</div>
						</div>
						<div className="text-xs text-muted-foreground mt-1">
							{notification.timestamp}
						</div>
					</div>

					{notification.content && (
						<div className="rounded-lg bg-muted p-2.5 text-sm tracking-[-0.006em]">
							{notification.content}
						</div>
					)}

					{notification.file && (
						<div className="flex items-center gap-2 rounded-lg bg-muted p-2">
							<div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
								<Folder className="h-4 w-4 text-primary" />
							</div>
							<div className="flex-1">
								<div className="text-sm font-medium">
									{notification.file.name}
								</div>
								<div className="text-xs text-muted-foreground">
									{notification.file.type} • {notification.file.size}
								</div>
							</div>
							<Button variant="ghost" size="icon" className="size-8">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="1em"
									height="1em"
									viewBox="0 0 24 24"
									className="size-4"
								>
									<path
										fill="currentColor"
										d="M12.554 16.506a.75.75 0 0 1-1.107 0l-4-4.375a.75.75 0 0 1 1.107-1.012l2.696 2.95V3a.75.75 0 0 1 1.5 0v11.068l2.697-2.95a.75.75 0 1 1 1.107 1.013z"
									/>
									<path
										fill="currentColor"
										d="M3.75 15a.75.75 0 0 0-1.5 0v.055c0 1.367 0 2.47.117 3.337c.12.9.38 1.658.981 2.26c.602.602 1.36.86 2.26.982c.867.116 1.97.116 3.337.116h6.11c1.367 0 2.47 0 3.337-.116c.9-.122 1.658-.38 2.26-.982s.86-1.36.982-2.26c.116-.867.116-1.97.116-3.337V15a.75.75 0 0 0-1.5 0c0 1.435-.002 2.436-.103 3.192c-.099.734-.28 1.122-.556 1.399c-.277.277-.665.457-1.4.556c-.755.101-1.756.103-3.191.103H9c-1.435 0-2.437-.002-3.192-.103c-.734-.099-1.122-.28-1.399-.556c-.277-.277-.457-.665-.556-1.4c-.101-.755-.103-1.756-.103-3.191"
									/>
								</svg>
							</Button>
						</div>
					)}

					{notification.hasActions && (
						<div className="flex gap-2">
							<Button variant="outline" size="sm" className="h-7 text-xs">
								Decline
							</Button>
							<Button size="sm" className="h-7 text-xs">
								Accept
							</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export const Component = () => {
	const [activeTab, setActiveTab] = React.useState<string>("all");

	const verifiedCount = notifications.filter(
		(n) =>
			n.type === "follow" || n.type === "like" || n.type === "task_completed",
	).length;
	const mentionCount = notifications.filter((n) => n.type === "mention").length;
	const systemCount = notifications.filter((n) => n.type === "system").length;

	const getFilteredNotifications = () => {
		switch (activeTab) {
			case "verified":
				return notifications.filter(
					(n) =>
						n.type === "follow" ||
						n.type === "like" ||
						n.type === "task_completed",
				);
			case "mentions":
				return notifications.filter((n) => n.type === "mention");
			case "system":
				return notifications.filter((n) => n.type === "system");
			default:
				return notifications;
		}
	};

	const filteredNotifications = getFilteredNotifications();

	return (
		<Card className="flex w-full max-w-[520px] flex-col gap-6 p-4 shadow-lg md:p-8">
			<CardHeader className="p-0">
				<div className="flex items-center justify-between">
					<CardTitle className="text-lg leading-none font-semibold">
						Notifications
					</CardTitle>
					<div className="flex items-center gap-2">
						<Button className="size-8" variant="ghost" size="icon">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="1em"
								height="1em"
								viewBox="0 0 24 24"
								className="size-4 text-muted-foreground"
							>
								<path
									fill="currentColor"
									fillRule="evenodd"
									d="M15.493 6.935a.75.75 0 0 1 .072 1.058l-7.857 9a.75.75 0 0 1-1.13 0l-3.143-3.6a.75.75 0 0 1 1.13-.986l2.578 2.953l7.292-8.353a.75.75 0 0 1 1.058-.072m5.025.085c.3.285.311.76.025 1.06l-8.571 9a.75.75 0 0 1-1.14-.063l-.429-.563a.75.75 0 0 1 1.076-1.032l7.978-8.377a.75.75 0 0 1 1.06-.026"
									clipRule="evenodd"
								/>
							</svg>
						</Button>
						<Button className="size-8" variant="ghost" size="icon">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="1em"
								height="1em"
								viewBox="0 0 24 24"
								className="size-4 text-muted-foreground"
							>
								<g fill="currentColor" fillRule="evenodd" clipRule="evenodd">
									<path d="M12 8.25a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5M9.75 12a2.25 2.25 0 1 1 4.5 0a2.25 2.25 0 0 1-4.5 0" />
									<path d="M11.975 1.25c-.445 0-.816 0-1.12.02a2.8 2.8 0 0 0-.907.19a2.75 2.75 0 0 0-1.489 1.488c-.145.35-.184.72-.2 1.122a.87.87 0 0 1-.415.731a.87.87 0 0 1-.841-.005c-.356-.188-.696-.339-1.072-.389a2.75 2.75 0 0 0-2.033.545a2.8 2.8 0 0 0-.617.691c-.17.254-.356.575-.578.96l-.025.044c-.223.385-.408.706-.542.98c-.14.286-.25.568-.29.88a2.75 2.75 0 0 0 .544 2.033c.231.301.532.52.872.734a.87.87 0 0 1 .426.726a.87.87 0 0 1-.426.726c-.34.214-.64.433-.872.734a2.75 2.75 0 0 0-.545 2.033c.041.312.15.594.29.88c.135.274.32.595.543.98l.025.044c.222.385.408.706.578.96c.177.263.367.5.617.69a2.75 2.75 0 0 0 2.033.546c.376-.05.716-.2 1.072-.389a.87.87 0 0 1 .84-.005a.86.86 0 0 1 .417.731c.015.402.054.772.2 1.122a2.75 2.75 0 0 0 1.488 1.489c.29.12.59.167.907.188c.304.021.675.021 1.12.021h.05c.445 0 .816 0 1.12-.02c.318-.022.617-.069.907-.19a2.75 2.75 0 0 0 1.489-1.488c.145-.35.184-.72.2-1.122a.87.87 0 0 1 .415-.732a.87.87 0 0 1 .841.006c.356.188.696.339 1.072.388a2.75 2.75 0 0 0 2.033-.544c.25-.192.44-.428.617-.691c.17-.254.356-.575.578-.96l.025-.044c.223-.385.408-.706.542-.98c.14-.286.25-.569.29-.88a2.75 2.75 0 0 0-.544-2.033c-.231-.301-.532-.52-.872-.734a.87.87 0 0 1-.426-.726c0-.278.152-.554.426-.726c.34-.214.64-.433.872-.734a2.75 2.75 0 0 0 .545-2.033a2.8 2.8 0 0 0-.29-.88a18 18 0 0 0-.543-.98l-.025-.044a18 18 0 0 0-.578-.96a2.8 2.8 0 0 0-.617-.69a2.75 2.75 0 0 0-2.033-.546c-.376.05-.716.2-1.072.389a.87.87 0 0 1-.84.005a.87.87 0 0 1-.417-.731c-.015-.402-.054-.772-.2-1.122a2.75 2.75 0 0 0-1.488-1.489c-.29-.12-.59-.167-.907-.188c-.304-.021-.675-.021-1.12-.021zm-1.453 1.595c.077-.032.194-.061.435-.078c.247-.017.567-.017 1.043-.017s.796 0 1.043.017c.241.017.358.046.435.078c.307.127.55.37.677.677c.04.096.073.247.086.604c.03.792.439 1.555 1.165 1.974s1.591.392 2.292.022c.316-.167.463-.214.567-.227a1.25 1.25 0 0 1 .924.247c.066.051.15.138.285.338c.139.206.299.483.537.895s.397.69.506.912c.107.217.14.333.15.416a1.25 1.25 0 0 1-.247.924c-.064.083-.178.187-.48.377c-.672.422-1.128 1.158-1.128 1.996s.456 1.574 1.128 1.996c.302.19.416.294.48.377c.202.263.29.595.247.924c-.01.083-.044.2-.15.416c-.109.223-.268.5-.506.912s-.399.689-.537.895c-.135.2-.219.287-.285.338a1.25 1.25 0 0 1-.924.247c-.104-.013-.25-.06-.567-.227c-.7-.37-1.566-.398-2.292.021s-1.135 1.183-1.165 1.975c-.013.357-.046.508-.086.604a1.25 1.25 0 0 1-.677.677c-.077.032-.194.061-.435.078c-.247.017-.567.017-1.043.017s-.796 0-1.043-.017c-.241-.017-.358-.046-.435-.078a1.25 1.25 0 0 1-.677-.677c-.04-.096-.073-.247-.086-.604c-.03-.792-.439-1.555-1.165-1.974s-1.591-.392-2.292-.022c-.316.167-.463.214-.567.227a1.25 1.25 0 0 1-.924-.247c-.066-.051-.15-.138-.285-.338a17 17 0 0 1-.537-.895c-.238-.412-.397-.69-.506-.912c-.107-.217-.14-.333-.15-.416a1.25 1.25 0 0 1 .247-.924c.064-.083.178-.187.48-.377c.672-.422 1.128-1.158 1.128-1.996s-.456-1.574-1.128-1.996c-.302-.19-.416-.294-.48-.377a1.25 1.25 0 0 1-.247-.924c.01-.083.044-.2.15-.416c.109-.223.268-.5.506-.912s.399-.689.537-.895c.135-.2.219-.287.285-.338a1.25 1.25 0 0 1 .924-.247c.104.013.25.06.567.227c.7.37 1.566.398 2.292-.022c.726-.419 1.135-1.182 1.165-1.974c.013-.357.046-.508.086-.604c.127-.307.37-.55.677-.677" />
								</g>
							</svg>
						</Button>
					</div>
				</div>

				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="all">
							All
							<Badge variant="secondary" className="ml-1">
								{notifications.length}
							</Badge>
						</TabsTrigger>
						<TabsTrigger value="verified">
							Verified
							<Badge variant="secondary" className="ml-1">
								{verifiedCount}
							</Badge>
						</TabsTrigger>
						<TabsTrigger value="mentions">
							Mentions
							<Badge variant="secondary" className="ml-1">
								{mentionCount}
							</Badge>
						</TabsTrigger>
						<TabsTrigger value="system">
							System
							<Badge variant="secondary" className="ml-1">
								{systemCount}
							</Badge>
						</TabsTrigger>
					</TabsList>

					<TabsContent value={activeTab} className="mt-4">
						<div className="space-y-0">
							{filteredNotifications.length > 0 ? (
								filteredNotifications.map((notification) => (
									<NotificationItem
										key={notification.id}
										notification={notification}
									/>
								))
							) : (
								<div className="flex flex-col items-center justify-center space-y-2 py-12 text-center">
									<div className="rounded-full bg-muted p-4">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="text-muted-foreground"
										>
											<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
											<path d="m13.73 21a2 2 0 0 1-3.46 0" />
										</svg>
									</div>
									<p className="text-sm font-medium text-muted-foreground">
										{activeTab === "all"
											? "No notifications yet."
											: `No ${activeTab} notifications.`}
									</p>
								</div>
							)}
						</div>
					</TabsContent>
				</Tabs>
			</CardHeader>
		</Card>
	);
};
