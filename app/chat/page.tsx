import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	FileText,
	Filter,
	Globe,
	Hash,
	Image,
	Lock,
	MessageSquare,
	MoreHorizontal,
	Paperclip,
	Phone,
	Plus,
	Search,
	Send,
	Settings,
	Smile,
	Users,
	Video
} from "lucide-react";

export const metadata: Metadata = {
	title: "Team Chat | Financbase",
	description: "Real-time team communication and collaboration platform",
};

const chatStats = [
	{
		name: "Active Users",
		value: "23",
		change: "+3",
		changeType: "positive",
		icon: Users,
	},
	{
		name: "Messages Today",
		value: "1,247",
		change: "+18%",
		changeType: "positive",
		icon: MessageSquare,
	},
	{
		name: "Channels",
		value: "12",
		change: "+2",
		changeType: "positive",
		icon: Hash,
	},
	{
		name: "Avg Response Time",
		value: "12m",
		change: "-3m",
		changeType: "positive",
		icon: Phone,
	},
];

const channels = [
	{
		name: "general",
		type: "public",
		members: 47,
		unread: 0,
		lastActivity: "2 minutes ago",
		description: "General company discussions",
		icon: Globe,
	},
	{
		name: "engineering",
		type: "public",
		members: 12,
		unread: 5,
		lastActivity: "5 minutes ago",
		description: "Engineering team discussions",
		icon: Hash,
	},
	{
		name: "sales",
		type: "public",
		members: 8,
		unread: 12,
		lastActivity: "1 hour ago",
		description: "Sales team coordination",
		icon: Hash,
	},
	{
		name: "finance-team",
		type: "private",
		members: 4,
		unread: 0,
		lastActivity: "30 minutes ago",
		description: "Finance department only",
		icon: Lock,
	},
	{
		name: "project-alpha",
		type: "private",
		members: 7,
		unread: 3,
		lastActivity: "15 minutes ago",
		description: "Alpha project discussions",
		icon: Lock,
	},
];

const directMessages = [
	{
		name: "Sarah Johnson",
		role: "Engineering Manager",
		lastMessage: "The deployment looks good! 🚀",
		timestamp: "2 minutes ago",
		unread: 0,
		avatar: "SJ",
		online: true,
	},
	{
		name: "Mike Wilson",
		role: "Sales Director",
		lastMessage: "Can we schedule a quick call?",
		timestamp: "15 minutes ago",
		unread: 2,
		avatar: "MW",
		online: true,
	},
	{
		name: "Lisa Chen",
		role: "Marketing Manager",
		lastMessage: "Thanks for the feedback on the campaign",
		timestamp: "1 hour ago",
		unread: 0,
		avatar: "LC",
		online: false,
	},
	{
		name: "David Brown",
		role: "Support Lead",
		lastMessage: "The new feature is working great!",
		timestamp: "3 hours ago",
		unread: 0,
		avatar: "DB",
		online: false,
	},
];

const recentMessages = [
	{
		user: "Sarah Johnson",
		avatar: "SJ",
		message: "Just deployed the new categorization feature! 🎉",
		timestamp: "2 minutes ago",
		channel: "engineering",
	},
	{
		user: "Mike Wilson",
		avatar: "MW",
		message: "Great meeting with the new client today. Moving forward with the proposal.",
		timestamp: "5 minutes ago",
		channel: "sales",
	},
	{
		user: "Alice Thompson",
		avatar: "AT",
		message: "The monthly financial report is ready for review.",
		timestamp: "10 minutes ago",
		channel: "finance-team",
	},
	{
		user: "Bob Martinez",
		avatar: "BM",
		message: "Anyone up for a quick code review session?",
		timestamp: "15 minutes ago",
		channel: "engineering",
	},
];

export default function ChatPage() {
	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">Team Chat</h1>
					<p className="text-muted-foreground">
						Real-time team communication and collaboration platform
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline">
						<Video className="h-4 w-4 mr-2" />
						Start Meeting
					</Button>
					<Button>
						<Plus className="h-4 w-4 mr-2" />
						New Channel
					</Button>
				</div>
			</div>

			{/* Stats Overview */}
			<div className="grid gap-4 md:grid-cols-4">
				{chatStats.map((stat, index) => (
					<Card key={stat.name}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
							<stat.icon className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stat.value}</div>
							<p className={`text-xs ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
								{stat.change} from yesterday
							</p>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Chat Interface */}
			<div className="grid gap-6 lg:grid-cols-4">
				{/* Channels and DMs Sidebar */}
				<div className="lg:col-span-1 space-y-6">
					{/* Channels */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-lg">Channels</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							{channels.map((channel, index) => (
								<div key={channel.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer">
									<div className="flex items-center gap-2">
										<channel.icon className="h-4 w-4" />
										<div>
											<p className="text-sm font-medium">#{channel.name}</p>
											<p className="text-xs text-muted-foreground">{channel.members} members</p>
										</div>
									</div>
									{channel.unread > 0 && (
										<Badge variant="destructive" className="text-xs">
											{channel.unread}
										</Badge>
									)}
								</div>
							))}
						</CardContent>
					</Card>

					{/* Direct Messages */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-lg">Direct Messages</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							{directMessages.map((dm, index) => (
								<div key={dm.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer">
									<div className="flex items-center gap-2">
										<div className="relative">
											<div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
												{dm.avatar}
											</div>
											{dm.online && (
												<div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
											)}
										</div>
										<div>
											<p className="text-sm font-medium">{dm.name}</p>
											<p className="text-xs text-muted-foreground truncate max-w-24">{dm.lastMessage}</p>
										</div>
									</div>
									{dm.unread > 0 && (
										<Badge variant="destructive" className="text-xs">
											{dm.unread}
										</Badge>
									)}
								</div>
							))}
						</CardContent>
					</Card>
				</div>

				{/* Main Chat Area */}
				<div className="lg:col-span-3">
					<Card className="h-[600px] flex flex-col">
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Hash className="h-5 w-5" />
									<CardTitle>#engineering</CardTitle>
									<Badge variant="secondary">12 members</Badge>
								</div>
								<div className="flex items-center gap-2">
									<Button variant="outline" size="sm">
										<Phone className="h-4 w-4 mr-1" />
										Call
									</Button>
									<Button variant="outline" size="sm">
										<Video className="h-4 w-4 mr-1" />
										Video
									</Button>
									<Button variant="outline" size="sm">
										<Settings className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</CardHeader>
						<CardContent className="flex-1 flex flex-col">
							{/* Messages Area */}
							<div className="flex-1 space-y-4 overflow-y-auto">
								{recentMessages.map((message, index) => (
									<div key={`${message.user}-${message.timestamp}-${message.channel}`} className="flex items-start gap-3">
										<div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
											{message.avatar}
										</div>
										<div className="flex-1 space-y-1">
											<div className="flex items-center gap-2">
												<span className="text-sm font-medium">{message.user}</span>
												<span className="text-xs text-muted-foreground">{message.timestamp}</span>
											</div>
											<p className="text-sm">{message.message}</p>
										</div>
									</div>
								))}
							</div>

							{/* Message Input */}
							<div className="pt-4 border-t">
								<div className="flex items-center gap-2">
									<Button variant="outline" size="icon">
										<Paperclip className="h-4 w-4" />
									</Button>
									<div className="flex-1 relative">
										<input
											type="text"
											placeholder="Type a message..."
											className="w-full px-3 py-2 border rounded-lg pr-12"
										/>
										<Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2">
											<Smile className="h-4 w-4" />
										</Button>
									</div>
									<Button>
										<Send className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Recent Activity */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Activity</CardTitle>
					<CardDescription>
						Latest messages and activity across all channels
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{recentMessages.map((activity, index) => (
							<div key={`${activity.user}-${activity.timestamp}-${activity.channel}`} className="flex items-center justify-between p-3 rounded-lg border">
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
										{activity.avatar}
									</div>
									<div>
										<p className="text-sm font-medium">{activity.user}</p>
										<p className="text-sm text-muted-foreground truncate max-w-md">{activity.message}</p>
									</div>
									<Badge variant="outline">#{activity.channel}</Badge>
								</div>
								<div className="text-right">
									<p className="text-xs text-muted-foreground">{activity.timestamp}</p>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
