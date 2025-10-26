import { ImageGallery } from '@/components/core/ui/layout/image-gallery';
import type { UploadedImage } from '@/components/core/ui/layout/image-gallery';

// Mock data for demonstration
const mockImages = [
	{
		id: '1',
		url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
		name: 'office-meeting.jpg',
		size: 245760,
		type: 'image/jpeg',
		uploadDate: new Date('2024-01-15T10:30:00'),
		category: 'Meetings',
		tags: ['office', 'team', 'meeting'],
		favorite: true,
		archived: false,
	},
	{
		id: '2',
		url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
		name: 'workspace-setup.jpg',
		size: 184320,
		type: 'image/jpeg',
		uploadDate: new Date('2024-01-14T15:45:00'),
		category: 'Workspace',
		tags: ['desk', 'computer', 'work'],
		favorite: false,
		archived: false,
	},
	{
		id: '3',
		url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
		name: 'team-lunch.jpg',
		size: 307200,
		type: 'image/jpeg',
		uploadDate: new Date('2024-01-13T12:15:00'),
		category: 'Events',
		tags: ['team', 'lunch', 'social'],
		favorite: false,
		archived: false,
	},
	{
		id: '4',
		url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop',
		name: 'presentation-slides.jpg',
		size: 153600,
		type: 'image/jpeg',
		uploadDate: new Date('2024-01-12T09:20:00'),
		category: 'Presentations',
		tags: ['slides', 'presentation', 'business'],
		favorite: true,
		archived: false,
	},
	{
		id: '5',
		url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
		name: 'receipt-scan.jpg',
		size: 122880,
		type: 'image/jpeg',
		uploadDate: new Date('2024-01-11T16:30:00'),
		category: 'Receipts',
		tags: ['receipt', 'scan', 'expense'],
		favorite: false,
		archived: false,
	},
	{
		id: '6',
		url: 'https://images.unsplash.com/photo-1553484771-371a605b060b?w=400&h=300&fit=crop',
		name: 'invoice-document.jpg',
		size: 204800,
		type: 'image/jpeg',
		uploadDate: new Date('2024-01-10T11:00:00'),
		category: 'Documents',
		tags: ['invoice', 'document', 'billing'],
		favorite: false,
		archived: false,
	},
];

export default function ImageGalleryDemo() {
	const handleDelete = (imageId: string) => {
		console.log('Delete image:', imageId);
	};

	const handleUpdate = (imageId: string, updates: Partial<UploadedImage>) => {
		console.log('Update image:', imageId, updates);
	};

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div>
				<h1 className="text-3xl font-bold mb-2">Image Gallery</h1>
				<p className="text-muted-foreground">
					Manage and organize your uploaded images with advanced filtering, search, and bulk operations.
				</p>
			</div>

			<ImageGallery
				images={mockImages}
				onDelete={handleDelete}
				onUpdate={handleUpdate}
			/>

			{/* Usage Examples */}
			<div className="space-y-4">
				<h2 className="text-xl font-semibold">Usage Examples</h2>

				<div className="grid gap-4 md:grid-cols-2">
					<div className="p-4 border rounded-lg">
						<h3 className="font-medium mb-2">Basic Gallery</h3>
						<pre className="text-sm bg-muted p-3 rounded overflow-x-auto">
{`<ImageGallery
  images={uploadedImages}
  onDelete={handleDelete}
  onUpdate={handleUpdate}
/>`}
						</pre>
					</div>

					<div className="p-4 border rounded-lg">
						<h3 className="font-medium mb-2">With Custom Styling</h3>
						<pre className="text-sm bg-muted p-3 rounded overflow-x-auto">
{`<ImageGallery
  images={images}
  className="max-w-4xl"
  onDelete={handleDelete}
/>`}
						</pre>
					</div>
				</div>
			</div>

			{/* Features */}
			<div className="space-y-4">
				<h2 className="text-xl font-semibold">Features</h2>

				<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
					<div className="flex items-start gap-3 p-3 border rounded-lg">
						<div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
							<span className="text-primary font-bold text-sm">🔍</span>
						</div>
						<div>
							<h4 className="font-medium">Advanced Search</h4>
							<p className="text-sm text-muted-foreground">Search by filename and tags</p>
						</div>
					</div>

					<div className="flex items-start gap-3 p-3 border rounded-lg">
						<div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
							<span className="text-primary font-bold text-sm">🏷️</span>
						</div>
						<div>
							<h4 className="font-medium">Category Filtering</h4>
							<p className="text-sm text-muted-foreground">Filter by categories and tags</p>
						</div>
					</div>

					<div className="flex items-start gap-3 p-3 border rounded-lg">
						<div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
							<span className="text-primary font-bold text-sm">⭐</span>
						</div>
						<div>
							<h4 className="font-medium">Favorites & Archive</h4>
							<p className="text-sm text-muted-foreground">Mark favorites and archive images</p>
						</div>
					</div>

					<div className="flex items-start gap-3 p-3 border rounded-lg">
						<div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
							<span className="text-primary font-bold text-sm">📱</span>
						</div>
						<div>
							<h4 className="font-medium">Responsive Design</h4>
							<p className="text-sm text-muted-foreground">Works on all device sizes</p>
						</div>
					</div>

					<div className="flex items-start gap-3 p-3 border rounded-lg">
						<div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
							<span className="text-primary font-bold text-sm">⚡</span>
						</div>
						<div>
							<h4 className="font-medium">Bulk Operations</h4>
							<p className="text-sm text-muted-foreground">Select and manage multiple images</p>
						</div>
					</div>

					<div className="flex items-start gap-3 p-3 border rounded-lg">
						<div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
							<span className="text-primary font-bold text-sm">🔧</span>
						</div>
						<div>
							<h4 className="font-medium">Multiple Views</h4>
							<p className="text-sm text-muted-foreground">Grid and list view modes</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
