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

