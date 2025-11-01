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

