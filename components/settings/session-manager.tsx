/**
 * Session Management Components
 * Reusable components for managing active sessions
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Monitor, Smartphone, Tablet, MapPin, Clock, Trash2, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Session {
	id: string;
	userAgent: string;
	ipAddress: string;
	location: string;
	lastActive: string;
	isCurrent: boolean;
	device: string;
}

interface SessionData {
	sessions: Session[];
	totalActive: number;
	maxAllowed: number;
}

export function SessionManager() {
	const [sessionData, setSessionData] = useState<SessionData | null>(null);
	const [loading, setLoading] = useState(true);

	const loadSessions = useCallback(async () => {
		try {
			const response = await fetch('/api/settings/security/sessions');
			if (response.ok) {
				const data = await response.json();
				setSessionData(data);
			}
		} catch (error) {
			console.error('Error loading sessions:', error);
			toast.error('Failed to load sessions');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadSessions();
	}, [loadSessions]);

	const revokeSession = async (sessionId: string) => {
		try {
			const response = await fetch('/api/settings/security/sessions/revoke', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sessionId }),
			});

			if (response.ok) {
				loadSessions();
				toast.success('Session revoked successfully');
			} else {
				const error = await response.json();
				toast.error(error.error || 'Failed to revoke session');
			}
		} catch (error) {
			console.error('Error revoking session:', error);
			toast.error('Failed to revoke session');
		}
	};

	const revokeAllSessions = async () => {
		try {
			const response = await fetch('/api/settings/security/sessions/revoke-all', {
				method: 'DELETE',
			});

			if (response.ok) {
				loadSessions();
				toast.success('All sessions revoked successfully');
			} else {
				const error = await response.json();
				toast.error(error.error || 'Failed to revoke sessions');
			}
		} catch (error) {
			console.error('Error revoking all sessions:', error);
			toast.error('Failed to revoke sessions');
		}
	};

	const getDeviceIcon = (device: string) => {
		switch (device.toLowerCase()) {
			case 'desktop computer':
			case 'desktop':
				return <Monitor className="h-4 w-4" />;
			case 'iphone':
			case 'android':
			case 'mobile':
				return <Smartphone className="h-4 w-4" />;
			default:
				return <Tablet className="h-4 w-4" />;
		}
	};

	const getDeviceType = (userAgent: string) => {
		if (userAgent.includes('Mobile')) return 'Mobile';
		if (userAgent.includes('Tablet')) return 'Tablet';
		return 'Desktop';
	};

	const formatLastActive = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

		if (diffMinutes < 1) return 'Just now';
		if (diffMinutes < 60) return `${diffMinutes}m ago`;

		const diffHours = Math.floor(diffMinutes / 60);
		if (diffHours < 24) return `${diffHours}h ago`;

		const diffDays = Math.floor(diffHours / 24);
		return `${diffDays}d ago`;
	};

	if (loading) {
		return <div className="flex justify-center p-8">Loading sessions...</div>;
	}

	if (!sessionData) {
		return (
			<Card>
				<CardContent className="flex justify-center p-8">
					<p className="text-muted-foreground">Failed to load session data</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h3 className="text-lg font-medium">Active Sessions</h3>
					<p className="text-sm text-muted-foreground">
						View and manage your active sessions across devices
					</p>
				</div>
				{sessionData.sessions.length > 1 && (
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button variant="outline">
								<Trash2 className="h-4 w-4 mr-2" />
								Revoke All
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Revoke All Sessions</AlertDialogTitle>
								<AlertDialogDescription>
									This will sign you out from all devices except this one. You'll need to sign in again on those devices.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction onClick={revokeAllSessions}>
									Revoke All
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				)}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card>
					<CardContent className="pt-6">
						<div className="text-2xl font-bold">{sessionData.totalActive}</div>
						<p className="text-xs text-muted-foreground">Active Sessions</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="text-2xl font-bold text-green-600">{sessionData.maxAllowed}</div>
						<p className="text-xs text-muted-foreground">Max Allowed</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="text-2xl font-bold">
							{sessionData.totalActive <= sessionData.maxAllowed ? (
								<span className="text-green-600">✓</span>
							) : (
								<span className="text-red-600">✗</span>
							)}
						</div>
						<p className="text-xs text-muted-foreground">Within Limits</p>
					</CardContent>
				</Card>
			</div>

			{sessionData.sessions.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-8">
						<Shield className="h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-medium mb-2">No active sessions</h3>
						<p className="text-muted-foreground">
							You don't have any active sessions.
						</p>
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardHeader>
						<CardTitle>Session Details</CardTitle>
						<CardDescription>
							Information about your active sessions
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Device</TableHead>
									<TableHead>Location</TableHead>
									<TableHead>Last Active</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{sessionData.sessions.map((session) => (
									<TableRow key={session.id}>
										<TableCell>
											<div className="flex items-center gap-2">
												{getDeviceIcon(session.device)}
												<div>
													<div className="font-medium">{session.device}</div>
													<div className="text-sm text-muted-foreground">
														{getDeviceType(session.userAgent)}
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<MapPin className="h-4 w-4 text-muted-foreground" />
												{session.location}
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Clock className="h-4 w-4 text-muted-foreground" />
												{formatLastActive(session.lastActive)}
											</div>
										</TableCell>
										<TableCell>
											{session.isCurrent ? (
												<Badge variant="default">Current</Badge>
											) : (
												<Badge variant="secondary">Active</Badge>
											)}
										</TableCell>
										<TableCell>
											{!session.isCurrent && (
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<Button size="sm" variant="outline">
															<Trash2 className="h-4 w-4" />
														</Button>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>Revoke Session</AlertDialogTitle>
															<AlertDialogDescription>
																Are you sure you want to revoke this session? The user will be signed out from this device.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>Cancel</AlertDialogCancel>
															<AlertDialogAction onClick={() => revokeSession(session.id)}>
																Revoke
															</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
