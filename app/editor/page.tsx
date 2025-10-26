import { ImageEditor } from '@/components/core/ui/layout/image-editor';

// Demo images for testing
const demoImages = [
	{
		url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop',
		name: 'office-meeting.jpg'
	},
	{
		url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
		name: 'workspace-setup.jpg'
	},
	{
		url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
		name: 'team-lunch.jpg'
	},
	{
		url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop',
		name: 'presentation-slides.jpg'
	},
];

export default function ImageEditorDemo() {
	const handleSave = (editedImageUrl: string, metadata?: any) => {
		console.log('Image saved:', editedImageUrl, metadata);
		// Here you would typically upload the edited image and update the database
	};

	const handleCancel = () => {
		console.log('Edit cancelled');
	};

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div>
				<h1 className="text-3xl font-bold mb-2">Image Editor</h1>
				<p className="text-muted-foreground">
					Edit your images with professional tools: crop, rotate, apply filters, and adjust brightness/contrast.
				</p>
			</div>

			{/* Image Selection */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
				{demoImages.map((image, index) => (
					<div key={index} className="relative group cursor-pointer">
						<img
							src={image.url}
							alt={image.name}
							className="w-full h-32 object-cover rounded-lg border hover:opacity-80 transition-opacity"
							onClick={() => {
								// This would open the editor with the selected image
								console.log('Open editor for:', image.name);
							}}
						/>
						<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-lg">
							<p className="text-white text-sm font-medium">{image.name}</p>
						</div>
					</div>
				))}
			</div>

			{/* Example Usage */}
			<ImageEditor
				imageUrl={demoImages[0].url}
				imageName={demoImages[0].name}
				onSave={handleSave}
				onCancel={handleCancel}
			/>

			{/* Features */}
			<div className="space-y-4">
				<h2 className="text-xl font-semibold">Features</h2>

				<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
					<div className="flex items-start gap-3 p-3 border rounded-lg">
						<div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
							<span className="text-primary font-bold text-sm">🔄</span>
						</div>
						<div>
							<h4 className="font-medium">Rotation & Flip</h4>
							<p className="text-sm text-muted-foreground">Rotate 90° clockwise/counterclockwise, flip horizontally/vertically</p>
						</div>
					</div>

					<div className="flex items-start gap-3 p-3 border rounded-lg">
						<div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
							<span className="text-primary font-bold text-sm">🎨</span>
						</div>
						<div>
							<h4 className="font-medium">Filter Presets</h4>
							<p className="text-sm text-muted-foreground">Vintage, Black & White, Sepia, High Contrast, and more</p>
						</div>
					</div>

					<div className="flex items-start gap-3 p-3 border rounded-lg">
						<div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
							<span className="text-primary font-bold text-sm">⚡</span>
						</div>
						<div>
							<h4 className="font-medium">Adjustments</h4>
							<p className="text-sm text-muted-foreground">Fine-tune brightness, contrast, saturation, and blur</p>
						</div>
					</div>

					<div className="flex items-start gap-3 p-3 border rounded-lg">
						<div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
							<span className="text-primary font-bold text-sm">✂️</span>
						</div>
						<div>
							<h4 className="font-medium">Crop (Coming Soon)</h4>
							<p className="text-sm text-muted-foreground">Select and crop specific areas of images</p>
						</div>
					</div>

					<div className="flex items-start gap-3 p-3 border rounded-lg">
						<div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
							<span className="text-primary font-bold text-sm">📱</span>
						</div>
						<div>
							<h4 className="font-medium">Responsive</h4>
							<p className="text-sm text-muted-foreground">Works on all screen sizes with touch support</p>
						</div>
					</div>

					<div className="flex items-start gap-3 p-3 border rounded-lg">
						<div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
							<span className="text-primary font-bold text-sm">🔧</span>
						</div>
						<div>
							<h4 className="font-medium">Undo/Redo</h4>
							<p className="text-sm text-muted-foreground">Full history with unlimited undo/redo operations</p>
						</div>
					</div>
				</div>
			</div>

			{/* Usage Examples */}
			<div className="space-y-4">
				<h2 className="text-xl font-semibold">Usage Examples</h2>

				<div className="grid gap-4 md:grid-cols-2">
					<div className="p-4 border rounded-lg">
						<h3 className="font-medium mb-2">Basic Editor</h3>
						<pre className="text-sm bg-muted p-3 rounded overflow-x-auto">
{`<ImageEditor
  imageUrl="https://example.com/image.jpg"
  imageName="my-image"
  onSave={handleSave}
  onCancel={handleCancel}
/>`}
						</pre>
					</div>

					<div className="p-4 border rounded-lg">
						<h3 className="font-medium mb-2">With Custom Styling</h3>
						<pre className="text-sm bg-muted p-3 rounded overflow-x-auto">
{`<ImageEditor
  imageUrl={selectedImage}
  className="max-w-4xl"
  onSave={(url, metadata) => {
    // Upload edited image
    uploadEditedImage(url, metadata);
  }}
/>`}
						</pre>
					</div>
				</div>
			</div>

			{/* Integration with Gallery */}
			<div className="space-y-4">
				<h2 className="text-xl font-semibold">Integration with Gallery</h2>
				<p className="text-muted-foreground">
					The Image Editor seamlessly integrates with the Image Gallery. Click the edit button on any image to open the editor.
				</p>
				<div className="p-4 border rounded-lg bg-muted/50">
					<h3 className="font-medium mb-2">Gallery Integration Example</h3>
					<pre className="text-sm bg-background p-3 rounded border overflow-x-auto">
{`// In your gallery component
const handleEditImage = (image) => {
  setEditingImage(image);
};

// In the edit modal
{editingImage && (
  <ImageEditor
    imageUrl={editingImage.url}
    imageName={editingImage.name}
    onSave={async (editedUrl, metadata) => {
      await updateImage(editingImage.id, { url: editedUrl, metadata });
      setEditingImage(null);
    }}
    onCancel={() => setEditingImage(null)}
  />
)}`}
					</pre>
				</div>
			</div>
		</div>
	);
}
