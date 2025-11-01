import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'About Us | Financbase',
	description:
		'Learn about Financbase and our mission to democratize financial intelligence. We empower businesses of all sizes to make smarter financial decisions.',
	openGraph: {
		title: 'About Us | Financbase',
		description:
			'Learn about Financbase and our mission to democratize financial intelligence. We empower businesses of all sizes to make smarter financial decisions.',
	},
};

export default function AboutLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}

