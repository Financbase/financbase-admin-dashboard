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

