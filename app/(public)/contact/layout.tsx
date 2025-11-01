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

