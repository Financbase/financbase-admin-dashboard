/**
 * Billing Settings Page
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Receipt, Package } from 'lucide-react';
import { SubscriptionManager } from '@/components/settings/subscription-manager';
import { PaymentMethodsManager } from '@/components/settings/payment-methods-manager';

export default function BillingSettingsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-semibold mb-2">Billing</h2>
				<p className="text-muted-foreground">
					Manage your subscription and payment methods
				</p>
			</div>

			<SubscriptionManager />

			<PaymentMethodsManager />
		</div>
	);
}

