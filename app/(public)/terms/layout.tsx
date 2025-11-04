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
	title: 'Terms of Service | Financbase',
	description: 'Terms of Service for using the Financbase platform and services.',
	openGraph: {
		title: 'Terms of Service | Financbase',
		description: 'Terms of Service for using the Financbase platform and services.',
	},
};

export default function TermsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}

