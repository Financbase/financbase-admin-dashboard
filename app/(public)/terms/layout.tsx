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

