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
	title: 'Contact Us | Financbase',
	description:
		'Get in touch with the Financbase team. Have questions? We\'d love to hear from you.',
	openGraph: {
		title: 'Contact Us | Financbase',
		description:
			'Get in touch with the Financbase team. Have questions? We\'d love to hear from you.',
	},
};

export default function ContactLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}

