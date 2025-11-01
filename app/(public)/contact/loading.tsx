import { PublicPageTemplate } from '@/components/layout/public-templates';
import { PublicSection } from '@/components/layout/public-section';
import { Skeleton } from '@/components/ui/skeleton';

export default function ContactLoading() {
	return (
		<PublicPageTemplate
			hero={{
				title: 'Get in Touch',
				description: 'Have questions about Financbase? We\'d love to hear from you.',
			}}
		>
			<PublicSection>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
					{/* Contact Form Skeleton */}
					<div>
						<Skeleton className="h-8 w-48 mb-8" />
						<div className="space-y-6">
							<Skeleton className="h-12 w-full" />
							<Skeleton className="h-12 w-full" />
							<Skeleton className="h-12 w-full" />
							<Skeleton className="h-32 w-full" />
							<Skeleton className="h-12 w-full" />
						</div>
					</div>

					{/* Contact Information Skeleton */}
					<div>
						<Skeleton className="h-8 w-48 mb-8" />
						<div className="space-y-4">
							{[...Array(4)].map((_, i) => (
								<div key={i} className="flex items-start space-x-4">
									<Skeleton className="h-12 w-12 rounded" />
									<div className="flex-1 space-y-2">
										<Skeleton className="h-5 w-24" />
										<Skeleton className="h-4 w-full" />
										<Skeleton className="h-4 w-3/4" />
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</PublicSection>
		</PublicPageTemplate>
	);
}

