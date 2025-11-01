"use client";

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	MessageSquare,
	Reply,
	AtSign,
	Paperclip,
	Send,
	MoreVertical,
	Eye,
	EyeOff,
	Lock,
	Unlock,
	Flag,
	Edit,
	Trash2,
	ThumbsUp,
	ThumbsDown,
	Star,
	Search,
	Filter,
	Calendar,
	User
} from 'lucide-react';
import { Comment } from '@/types/auth';
import { workspaceService } from '@/lib/services/workspace-service';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CommentSystemProps {
	workspaceId: string;
	entityType: Comment['entityType'];
	entityId: string;
	entityTitle?: string;
}

interface CommentThreadProps {
	comment: Comment;
	replies: Comment[];
	onReply: (parentId: string, content: string) => void;
	onEdit: (commentId: string, content: string) => void;
	onDelete: (commentId: string) => void;
	onResolve: (commentId: string) => void;
}

function CommentThread({ comment, replies, onReply, onEdit, onDelete, onResolve }: CommentThreadProps) {
	const [showReplyForm, setShowReplyForm] = useState(false);
	const [replyContent, setReplyContent] = useState('');
	const [isEditing, setIsEditing] = useState(false);
	const [editContent, setEditContent] = useState(comment.content);

	const handleReply = () => {
		if (replyContent.trim()) {
			onReply(comment.id, replyContent);
			setReplyContent('');
			setShowReplyForm(false);
		}
	};

	const handleEdit = () => {
		if (editContent.trim() && editContent !== comment.content) {
			onEdit(comment.id, editContent);
			setIsEditing(false);
		}
	};

	return (
		<div className="space-y-3">
			{/* Main Comment */}
			<div className={cn(
				"flex gap-3 p-3 rounded-lg border",
				comment.status === 'resolved' && "bg-green-50 border-green-200",
				comment.status === 'archived' && "opacity-60"
			)}>
				<Avatar className="w-8 h-8">
					<AvatarImage src={comment.authorAvatar} />
					<AvatarFallback className="text-xs">
						{comment.authorName.split(' ').map(n => n[0]).join('').toUpperCase()}
					</AvatarFallback>
				</Avatar>

				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-1">
						<span className="font-medium text-sm">{comment.authorName}</span>
						<span className="text-xs text-muted-foreground">
							{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
						</span>
						{comment.isInternal && (
							<Badge variant="outline" className="text-xs">
								<Lock className="mr-1 h-3 w-3" />
								Internal
							</Badge>
						)}
						<Badge variant={comment.status === 'resolved' ? 'default' : 'secondary'} className="text-xs">
							{comment.status}
						</Badge>
					</div>

					{isEditing ? (
						<div className="space-y-2">
							<Textarea
								value={editContent}
								onChange={(e) => setEditContent(e.target.value)}
								className="min-h-[80px]"
							/>
							<div className="flex gap-2">
								<Button size="sm" onClick={handleEdit}>
									Save
								</Button>
								<Button size="sm" variant="outline" onClick={() => {
									setIsEditing(false);
									setEditContent(comment.content);
								}}>
									Cancel
								</Button>
							</div>
						</div>
					) : (
						<div className="space-y-2">
							<p className="text-sm whitespace-pre-wrap">{comment.content}</p>

							{/* Attachments */}
							{comment.attachments && comment.attachments.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{comment.attachments.map((attachment) => (
										<div key={attachment.id} className="flex items-center gap-2 p-2 bg-muted rounded text-xs">
											<Paperclip className="h-3 w-3" />
											<span className="font-medium">{attachment.name}</span>
											<span className="text-muted-foreground">
												{(attachment.size / 1024 / 1024).toFixed(1)}MB
											</span>
										</div>
									))}
								</div>
							)}

							{/* Mentions */}
							{comment.mentions.length > 0 && (
								<div className="flex flex-wrap gap-1">
									{comment.mentions.map((mentionId) => (
										<Badge key={mentionId} variant="outline" className="text-xs">
											<AtSign className="mr-1 h-3 w-3" />
											{mentionId}
										</Badge>
									))}
								</div>
							)}
						</div>
					)}

					{/* Comment Actions */}
					<div className="flex items-center gap-2 mt-2">
						<Button
							size="sm"
							variant="ghost"
							onClick={() => setShowReplyForm(!showReplyForm)}
							className="text-xs h-6"
						>
							<Reply className="mr-1 h-3 w-3" />
							Reply
						</Button>

						<Button
							size="sm"
							variant="ghost"
							onClick={() => setIsEditing(!isEditing)}
							className="text-xs h-6"
						>
							<Edit className="mr-1 h-3 w-3" />
							Edit
						</Button>

						<Button
							size="sm"
							variant="ghost"
							onClick={() => onResolve(comment.id)}
							className="text-xs h-6"
						>
							{comment.status === 'resolved' ? 'Reopen' : 'Resolve'}
						</Button>

						<Button
							size="sm"
							variant="ghost"
							onClick={() => onDelete(comment.id)}
							className="text-xs h-6 text-red-600 hover:text-red-700"
						>
							<Trash2 className="mr-1 h-3 w-3" />
							Delete
						</Button>
					</div>
				</div>
			</div>

			{/* Reply Form */}
			{showReplyForm && (
				<div className="ml-11 space-y-2">
					<Textarea
						value={replyContent}
						onChange={(e) => setReplyContent(e.target.value)}
						placeholder="Write a reply..."
						className="min-h-[80px]"
					/>
					<div className="flex gap-2">
						<Button size="sm" onClick={handleReply} disabled={!replyContent.trim()}>
							<Send className="mr-1 h-3 w-3" />
							Reply
						</Button>
						<Button size="sm" variant="outline" onClick={() => {
							setShowReplyForm(false);
							setReplyContent('');
						}}>
							Cancel
						</Button>
					</div>
				</div>
			)}

			{/* Replies */}
			{replies.length > 0 && (
				<div className="ml-11 space-y-2">
					{replies.map((reply) => (
						<div key={reply.id} className="flex gap-3 p-2 rounded border-l-2 border-muted bg-muted/30">
							<Avatar className="w-6 h-6">
								<AvatarImage src={reply.authorAvatar} />
								<AvatarFallback className="text-xs">
									{reply.authorName.split(' ').map(n => n[0]).join('').toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2 mb-1">
									<span className="font-medium text-xs">{reply.authorName}</span>
									<span className="text-xs text-muted-foreground">
										{formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
									</span>
								</div>
								<p className="text-xs">{reply.content}</p>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export function CommentSystem({ workspaceId, entityType, entityId, entityTitle }: CommentSystemProps) {
	const { user } = useUser();
	const { toast } = useToast();
	const [comments, setComments] = useState<Comment[]>([]);
	const [newComment, setNewComment] = useState('');
	const [isInternal, setIsInternal] = useState(false);
	const [loading, setLoading] = useState(true);
	const [showNewCommentForm, setShowNewCommentForm] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		loadComments();
	}, [workspaceId, entityType, entityId]);

	const loadComments = async () => {
		try {
			setLoading(true);
			const commentData = await workspaceService.getComments(workspaceId, entityType, entityId);
			setComments(commentData);
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to load comments',
				variant: 'destructive',
			});
		} finally {
			setLoading(false);
		}
	};

	const handleCreateComment = async () => {
		if (!newComment.trim()) return;

		if (!user?.id) {
			toast({
				title: 'Error',
				description: 'User not authenticated',
				variant: 'destructive',
			});
			return;
		}

		// Extract mentions from content (simple @ mention extraction)
		const mentionMatches = newComment.match(/@(\w+)/g) || [];
		const mentions = mentionMatches.map(m => m.substring(1)); // Remove @ symbol

		const authorName = user.fullName || 
			`${user.firstName || ''} ${user.lastName || ''}`.trim() || 
			user.emailAddresses[0]?.emailAddress || 
			'User';

		try {
			const comment = await workspaceService.createComment({
				workspaceId,
				entityType,
				entityId,
				content: newComment,
				authorId: user.id,
				authorName,
				mentions,
				isInternal,
				status: 'active',
			});

			setComments(prev => [comment, ...prev]);
			setNewComment('');
			setIsInternal(false);
			setShowNewCommentForm(false);

			toast({
				title: 'Success',
				description: 'Comment added successfully',
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to add comment',
				variant: 'destructive',
			});
		}
	};

	const handleReply = async (parentId: string, content: string) => {
		if (!user?.id) {
			toast({
				title: 'Error',
				description: 'User not authenticated',
				variant: 'destructive',
			});
			return;
		}

		// Extract mentions from content
		const mentionMatches = content.match(/@(\w+)/g) || [];
		const mentions = mentionMatches.map(m => m.substring(1));

		const authorName = user.fullName || 
			`${user.firstName || ''} ${user.lastName || ''}`.trim() || 
			user.emailAddresses[0]?.emailAddress || 
			'User';

		try {
			const reply = await workspaceService.createComment({
				workspaceId,
				entityType,
				entityId,
				content,
				authorId: user.id,
				authorName,
				parentId,
				mentions,
				isInternal,
				status: 'active',
			});

			setComments(prev => [reply, ...prev]);
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to add reply',
				variant: 'destructive',
			});
		}
	};

	const handleEditComment = async (commentId: string, content: string) => {
		try {
			const updatedComment = await workspaceService.updateComment(workspaceId, commentId, {
				content,
			});

			setComments(prev => prev.map(c => c.id === commentId ? updatedComment : c));
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to update comment',
				variant: 'destructive',
			});
		}
	};

	const handleDeleteComment = async (commentId: string) => {
		try {
			await workspaceService.deleteComment(workspaceId, commentId);
			setComments(prev => prev.filter(c => c.id !== commentId));
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to delete comment',
				variant: 'destructive',
			});
		}
	};

	const handleResolveComment = async (commentId: string) => {
		try {
			const updatedComment = await workspaceService.updateComment(workspaceId, commentId, {
				status: comments.find(c => c.id === commentId)?.status === 'resolved' ? 'active' : 'resolved',
			});

			setComments(prev => prev.map(c => c.id === commentId ? updatedComment : c));
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to update comment status',
				variant: 'destructive',
			});
		}
	};

	// Group comments by thread (comments with parentId are replies)
	const { mainComments, replies } = comments.reduce(
		(acc, comment) => {
			if (comment.parentId) {
				acc.replies.push(comment);
			} else {
				acc.mainComments.push(comment);
			}
			return acc;
		},
		{ mainComments: [] as Comment[], replies: [] as Comment[] }
	);

	// Group replies by parent comment
	const repliesByParent = replies.reduce((acc, reply) => {
		if (!acc[reply.parentId!]) {
			acc[reply.parentId!] = [];
		}
		acc[reply.parentId!].push(reply);
		return acc;
	}, {} as Record<string, Comment[]>);

	if (loading) {
		return (
			<Card>
				<CardContent className="p-6">
					<div className="flex items-center justify-center">
						<MessageSquare className="h-8 w-8 text-muted-foreground mr-2" />
						<p className="text-muted-foreground">Loading comments...</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<MessageSquare className="h-5 w-5" />
						<span>Comments</span>
						{entityTitle && (
							<span className="text-sm font-normal text-muted-foreground">
								on {entityTitle}
							</span>
						)}
					</div>
					<Button onClick={() => setShowNewCommentForm(!showNewCommentForm)}>
						<MessageSquare className="mr-2 h-4 w-4" />
						New Comment
					</Button>
				</CardTitle>
				<CardDescription>
					Collaborate and discuss with your team
				</CardDescription>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* New Comment Form */}
				{showNewCommentForm && (
					<div className="space-y-3 p-3 border rounded-lg bg-muted/30">
						<Textarea
							ref={textareaRef}
							value={newComment}
							onChange={(e) => setNewComment(e.target.value)}
							placeholder="Write a comment..."
							className="min-h-[100px]"
						/>

						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Button size="sm" variant="ghost">
									<AtSign className="h-4 w-4" />
								</Button>
								<Button size="sm" variant="ghost">
									<Paperclip className="h-4 w-4" />
								</Button>
								<div className="flex items-center gap-2">
									<Switch
										checked={isInternal}
										onCheckedChange={setIsInternal}
									/>
									<Label className="text-xs">Internal note</Label>
									{isInternal && <Lock className="h-3 w-3 text-muted-foreground" />}
								</div>
							</div>

							<div className="flex gap-2">
								<Button
									size="sm"
									variant="outline"
									onClick={() => {
										setShowNewCommentForm(false);
										setNewComment('');
										setIsInternal(false);
									}}
								>
									Cancel
								</Button>
								<Button
									size="sm"
									onClick={handleCreateComment}
									disabled={!newComment.trim()}
								>
									<Send className="mr-1 h-3 w-3" />
									Comment
								</Button>
							</div>
						</div>
					</div>
				)}

				{/* Comments List */}
				<div className="space-y-4">
					{mainComments.map((comment) => (
						<CommentThread
							key={comment.id}
							comment={comment}
							replies={repliesByParent[comment.id] || []}
							onReply={handleReply}
							onEdit={handleEditComment}
							onDelete={handleDeleteComment}
							onResolve={handleResolveComment}
						/>
					))}

					{comments.length === 0 && (
						<div className="text-center py-8">
							<MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<p className="text-muted-foreground">No comments yet</p>
							<p className="text-sm text-muted-foreground">
								Start a discussion by adding a comment
							</p>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
