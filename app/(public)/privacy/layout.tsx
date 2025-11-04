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
	title: 'Privacy Policy | Financbase',
	description:
		'Learn how Financbase collects, uses, and protects your personal information and data.',
	openGraph: {
		title: 'Privacy Policy | Financbase',
		description:
			'Learn how Financbase collects, uses, and protects your personal information and data.',
	},
};

export default function PrivacyLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}

