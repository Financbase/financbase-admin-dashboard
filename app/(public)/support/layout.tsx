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
	title: 'Support | Financbase',
	description:
		'Get help with Financbase. Browse our knowledge base, submit a support ticket, or contact our team.',
	openGraph: {
		title: 'Support | Financbase',
		description:
			'Get help with Financbase. Browse our knowledge base, submit a support ticket, or contact our team.',
	},
};

export default function SupportLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}

