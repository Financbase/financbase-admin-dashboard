/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Pricing | Financbase',
	description:
		'Simple, transparent pricing plans for businesses of all sizes. Start free, scale as you grow.',
	openGraph: {
		title: 'Pricing | Financbase',
		description:
			'Simple, transparent pricing plans for businesses of all sizes. Start free, scale as you grow.',
	},
};

export default function PricingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}

