import { PropertyPortfolio } from '@/components/real-estate/property-portfolio';

export default function RealEstatePage() {
	return (
		<div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
			<div className="flex items-center justify-between space-y-2">
				<div>
					<h2 className="text-3xl font-bold tracking-tight">
						Real Estate Platform
					</h2>
					<p className="text-muted-foreground">
						Property management and investment analytics
					</p>
				</div>
			</div>

			<PropertyPortfolio />
		</div>
	);
}
