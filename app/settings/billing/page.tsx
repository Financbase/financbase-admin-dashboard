/**
 * Billing Settings Page
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Receipt, Package } from 'lucide-react';

export default function BillingSettingsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-semibold mb-2">Billing</h2>
				<p className="text-muted-foreground">
					Manage your subscription and payment methods
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Package className="h-5 w-5" />
						<CardTitle>Current Plan</CardTitle>
					</div>
					<CardDescription>
						View and manage your current subscription plan
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Subscription management coming soon.
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<CreditCard className="h-5 w-5" />
						<CardTitle>Payment Methods</CardTitle>
					</div>
					<CardDescription>
						Manage your saved payment methods
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Payment method management coming soon.
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Receipt className="h-5 w-5" />
						<CardTitle>Billing History</CardTitle>
					</div>
					<CardDescription>
						View your past invoices and transactions
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Billing history coming soon.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

