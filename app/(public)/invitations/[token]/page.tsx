/**
 * Invitation Acceptance Page
 * 
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Building2, Check, X } from 'lucide-react';

export default function InvitationPage() {
	const params = useParams();
	const router = useRouter();
	const token = params.token as string;
	const { toast } = useToast();

	const [loading, setLoading] = useState(true);
	const [processing, setProcessing] = useState(false);
	const [invitation, setInvitation] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Note: In a real implementation, you'd fetch invitation details by token
		// For now, we'll handle acceptance directly
		setLoading(false);
	}, [token]);

	const handleAccept = async () => {
		try {
			setProcessing(true);
			setError(null);

			// Get current user ID first
			const userResponse = await fetch('/api/auth/me');
			if (!userResponse.ok) {
				throw new Error('Please sign in to accept the invitation');
			}
			const userData = await userResponse.json();
			const userId = userData.user?.id;

			if (!userId) {
				throw new Error('User not found. Please sign in first.');
			}

			// Find invitation by token and accept it
			// We need to find which organization this invitation belongs to
			// For now, we'll use a workaround - accept via the service directly
			const response = await fetch(`/api/organizations/invitations/accept`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token }),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Failed to accept invitation');
			}

			toast({
				title: 'Invitation accepted',
				description: 'You have successfully joined the organization',
			});

			// Redirect to dashboard
			router.push('/dashboard');
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to accept invitation';
			setError(message);
			toast({
				title: 'Error',
				description: message,
				variant: 'destructive',
			});
		} finally {
			setProcessing(false);
		}
	};

	const handleDecline = async () => {
		try {
			setProcessing(true);
			setError(null);

			const response = await fetch(`/api/organizations/invitations/decline`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token }),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Failed to decline invitation');
			}

			toast({
				title: 'Invitation declined',
				description: 'You have declined the invitation',
			});

			router.push('/');
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to decline invitation';
			setError(message);
			toast({
				title: 'Error',
				description: message,
				variant: 'destructive',
			});
		} finally {
			setProcessing(false);
		}
	};

	if (loading) {
		return (
			<div className="container mx-auto py-12 flex items-center justify-center min-h-screen">
				<div className="text-center">Loading invitation...</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-12 flex items-center justify-center min-h-screen">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
						<Building2 className="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Organization Invitation</CardTitle>
					<CardDescription>
						You've been invited to join an organization
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{error && (
						<div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
							{error}
						</div>
					)}

					<div className="space-y-2">
						<p className="text-sm text-muted-foreground">
							Accept this invitation to join the organization and start collaborating.
						</p>
					</div>

					<div className="flex gap-2">
						<Button
							variant="outline"
							className="flex-1"
							onClick={handleDecline}
							disabled={processing}
						>
							<X className="mr-2 h-4 w-4" />
							Decline
						</Button>
						<Button
							className="flex-1"
							onClick={handleAccept}
							disabled={processing}
						>
							<Check className="mr-2 h-4 w-4" />
							{processing ? 'Processing...' : 'Accept'}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

