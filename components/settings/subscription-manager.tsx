/**
 * Subscription Management Components
 * Reusable components for managing subscriptions and billing
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
import { Progress } from '@/components/ui/progress';
import { Check, Crown, Zap, Star, Calendar, CreditCard, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SubscriptionPlan {
	id: string;
	name: string;
	description: string;
	priceMonthly: number;
	priceYearly: number;
	interval: 'monthly' | 'yearly' | 'lifetime';
	features: Record<string, any>;
	limits: Record<string, any>;
	isPopular: boolean;
	isEnterprise: boolean;
	sortOrder: number;
	isActive: boolean;
}

interface UserSubscription {
	id: string;
	planId: string;
	status: 'active' | 'inactive' | 'cancelled' | 'expired' | 'suspended' | 'trial';
	currentPeriodStart: string;
	currentPeriodEnd: string;
	trialStart: string | null;
	trialEnd: string | null;
	cancelledAt: string | null;
	cancelReason: string | null;
	nextBillingDate: string | null;
	autoRenew: boolean;
	createdAt: string;
	updatedAt: string;
}

interface SubscriptionData {
	subscription: UserSubscription | null;
	plan: SubscriptionPlan | null;
}

export function SubscriptionManager() {
	const [data, setData] = useState<SubscriptionData | null>(null);
	const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
	const [loading, setLoading] = useState(true);
	const [upgrading, setUpgrading] = useState(false);

	const loadData = useCallback(async () => {
		try {
			// Load subscription data
			const subscriptionResponse = await fetch('/api/settings/billing/subscription');
			if (subscriptionResponse.ok) {
				const subscriptionData = await subscriptionResponse.json();
				setData(subscriptionData);
			}

			// Load available plans
			const plansResponse = await fetch('/api/settings/billing/plans');
			if (plansResponse.ok) {
				const plansData = await plansResponse.json();
				setPlans(plansData.plans);
			}
		} catch (error) {
			console.error('Error loading subscription data:', error);
			toast.error('Failed to load subscription information');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const upgradeSubscription = async (planId: string) => {
		setUpgrading(true);
		try {
			const response = await fetch('/api/settings/billing/subscription', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ planId }),
			});

			if (response.ok) {
				await loadData();
				toast.success('Subscription updated successfully');
			} else {
				const error = await response.json();
				toast.error(error.error || 'Failed to update subscription');
			}
		} catch (error) {
			console.error('Error upgrading subscription:', error);
			toast.error('Failed to update subscription');
		} finally {
			setUpgrading(false);
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	const getStatusBadge = (status: string) => {
		const variants = {
			active: 'default',
			trial: 'secondary',
			cancelled: 'destructive',
			expired: 'outline',
			suspended: 'destructive',
			inactive: 'outline',
		} as const;

		const colors = {
			active: 'text-green-600',
			trial: 'text-blue-600',
			cancelled: 'text-red-600',
			expired: 'text-gray-600',
			suspended: 'text-red-600',
			inactive: 'text-gray-600',
		};

		return (
			<Badge variant={variants[status as keyof typeof variants] || 'outline'}>
				{status.charAt(0).toUpperCase() + status.slice(1)}
			</Badge>
		);
	};

	const getPlanIcon = (planName: string) => {
		switch (planName.toLowerCase()) {
			case 'enterprise':
				return <Crown className="h-5 w-5" />;
			case 'pro':
				return <Zap className="h-5 w-5" />;
			case 'free':
				return <Star className="h-5 w-5" />;
			default:
				return <Check className="h-5 w-5" />;
		}
	};

	const getUsagePercentage = (current: number, limit: number) => {
		if (!limit) return 0;
		return Math.min((current / limit) * 100, 100);
	};

	if (loading) {
		return <div className="flex justify-center p-8">Loading subscription...</div>;
	}

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">Current Plan</h3>
				<p className="text-sm text-muted-foreground">
					Manage your subscription and billing
				</p>
			</div>

			{data?.subscription && data?.plan ? (
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								{getPlanIcon(data.plan.name)}
								<CardTitle>{data.plan.name} Plan</CardTitle>
							</div>
							{getStatusBadge(data.subscription.status)}
						</div>
						<CardDescription>{data.plan.description}</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Billing Period</span>
								<span className="text-sm text-muted-foreground">
									{formatDate(data.subscription.currentPeriodStart)} - {formatDate(data.subscription.currentPeriodEnd)}
								</span>
							</div>

							{data.subscription.status === 'trial' && data.subscription.trialEnd && (
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium">Trial Period</span>
										<span className="text-sm text-muted-foreground">
											Ends {formatDate(data.subscription.trialEnd)}
										</span>
									</div>
									<Progress
										value={getUsagePercentage(
											new Date().getTime() - new Date(data.subscription.trialStart || '').getTime(),
											new Date(data.subscription.trialEnd).getTime() - new Date(data.subscription.trialStart || '').getTime()
										)}
										className="w-full"
									/>
								</div>
							)}

							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Auto-renewal</span>
								<Badge variant={data.subscription.autoRenew ? 'default' : 'outline'}>
									{data.subscription.autoRenew ? 'Enabled' : 'Disabled'}
								</Badge>
							</div>

							{data.subscription.nextBillingDate && (
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium">Next Billing Date</span>
									<span className="text-sm text-muted-foreground">
										{formatDate(data.subscription.nextBillingDate)}
									</span>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardHeader>
						<CardTitle>Free Plan</CardTitle>
						<CardDescription>
							You're currently on the free plan. Upgrade for more features and higher limits.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="text-sm text-muted-foreground">
							Basic features with limited usage
						</div>
					</CardContent>
				</Card>
			)}

			<Card>
				<CardHeader>
					<CardTitle>Available Plans</CardTitle>
					<CardDescription>
						Choose the plan that best fits your needs
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{plans.map((plan) => (
							<Card key={plan.id} className={`relative ${plan.isPopular ? 'border-primary' : ''}`}>
								{plan.isPopular && (
									<div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
										<Badge className="bg-primary">Most Popular</Badge>
									</div>
								)}
								<CardHeader>
									<div className="flex items-center gap-2">
										{getPlanIcon(plan.name)}
										<CardTitle className="text-lg">{plan.name}</CardTitle>
									</div>
									<CardDescription>{plan.description}</CardDescription>
									<div className="mt-4">
										<div className="text-3xl font-bold">
											{plan.priceMonthly === 0 ? 'Free' : formatCurrency(plan.priceMonthly)}
											{plan.priceMonthly > 0 && (
												<span className="text-sm font-normal text-muted-foreground">/month</span>
											)}
										</div>
										{plan.priceYearly > 0 && plan.priceMonthly > 0 && (
											<div className="text-sm text-muted-foreground">
												{formatCurrency(plan.priceYearly)}/year (Save{' '}
												{Math.round((1 - plan.priceYearly / (plan.priceMonthly * 12)) * 100)}%)
											</div>
										)}
									</div>
								</CardHeader>
								<CardContent>
									<div className="space-y-2">
										{Object.entries(plan.features).map(([feature, enabled]) => (
											<div key={feature} className="flex items-center gap-2">
												<Check className="h-4 w-4 text-green-600" />
												<span className="text-sm">
													{feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
												</span>
											</div>
										))}
									</div>
									<Button
										className="w-full mt-4"
										variant={plan.isPopular ? 'default' : 'outline'}
										disabled={upgrading || data?.plan?.id === plan.id}
										onClick={() => upgradeSubscription(plan.id)}
									>
										{data?.plan?.id === plan.id ? 'Current Plan' : `Upgrade to ${plan.name}`}
									</Button>
								</CardContent>
							</Card>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
