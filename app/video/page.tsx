import { VideoUpload } from '@/components/core/ui/layout/video-upload';

// Demo videos for testing
const demoVideos = [
	{
		url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
		name: 'sample-video-1mb.mp4',
		size: 1048576,
		duration: 30
	},
	{
		url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
		name: 'sample-video-2mb.mp4',
		size: 2097152,
		duration: 30
	}
];

export default function VideoUploadDemo() {
	const handleVideoUpdate = (videoUrl: string, thumbnailUrl?: string, metadata?: any) => {
		console.log('Video uploaded:', { videoUrl, thumbnailUrl, metadata });
		// Here you would typically save the video metadata to database
	};

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div>
				<h1 className="text-3xl font-bold mb-2">Video Upload</h1>
				<p className="text-muted-foreground">
					Upload videos with automatic thumbnail generation and metadata extraction.
				</p>
			</div>

			{/* Video Upload Component */}
			<VideoUpload
				onVideoUpdate={handleVideoUpdate}
				maxSize={50}
				acceptedTypes={['video/mp4', 'video/avi', 'video/mov', 'video/webm']}
				generateThumbnail={true}
			/>

			{/* Features */}
			<div className="space-y-4">
				<h2 className="text-xl font-semibold">Features</h2>

				<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
					<div className="flex items-start gap-3 p-3 border rounded-lg">
						<div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
							<span className="text-primary font-bold text-sm">🎬</span>
						</div>
						<div>
							<h4 className="font-medium">Video Support</h4>
							<p className="text-sm text-muted-foreground">MP4, AVI, MOV, WebM formats up to 50MB</p>
						</div>
					</div>

					<div className="flex items-start gap-3 p-3 border rounded-lg">
						<div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
							<span className="text-primary font-bold text-sm">🖼️</span>
						</div>
						<div>
							<h4 className="font-medium">Auto Thumbnails</h4>
							<p className="text-sm text-muted-foreground">Automatic thumbnail generation at 10% of video duration</p>
						</div>
					</div>

					<div className="flex items-start gap-3 p-3 border rounded-lg">
						<div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
							<span className="text-primary font-bold text-sm">📊</span>
						</div>
						<div>
							<h4 className="font-medium">Metadata Extraction</h4>
							<p className="text-sm text-muted-foreground">Duration, dimensions, codec, and file information</p>
						</div>
					</div>

					<div className="flex items-start gap-3 p-3 border rounded-lg">
						<div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
							<span className="text-primary font-bold text-sm">🎯</span>
						</div>
						<div>
							<h4 className="font-medium">AI Integration Ready</h4>
							<p className="text-sm text-muted-foreground">Extend with AI-powered video analysis and tagging</p>
						</div>
					</div>

					<div className="flex items-start gap-3 p-3 border rounded-lg">
						<div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
							<span className="text-primary font-bold text-sm">🔒</span>
						</div>
						<div>
							<h4 className="font-medium">Secure Uploads</h4>
							<p className="text-sm text-muted-foreground">Authentication required, virus scanning ready</p>
						</div>
					</div>

					<div className="flex items-start gap-3 p-3 border rounded-lg">
						<div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
							<span className="text-primary font-bold text-sm">📱</span>
						</div>
						<div>
							<h4 className="font-medium">Mobile Friendly</h4>
							<p className="text-sm text-muted-foreground">Responsive design with touch controls</p>
						</div>
					</div>
				</div>
			</div>

			{/* Usage Examples */}
			<div className="space-y-4">
				<h2 className="text-xl font-semibold">Usage Examples</h2>

				<div className="grid gap-4 md:grid-cols-2">
					<div className="p-4 border rounded-lg">
						<h3 className="font-medium mb-2">Basic Video Upload</h3>
						<pre className="text-sm bg-muted p-3 rounded overflow-x-auto">
{`<VideoUpload
  onVideoUpdate={(url, thumbnail, metadata) => {
    console.log('Video uploaded:', url, thumbnail, metadata);
  }}
  maxSize={100}
  generateThumbnail={true}
/>`}
						</pre>
					</div>

					<div className="p-4 border rounded-lg">
						<h3 className="font-medium mb-2">With Custom Types</h3>
						<pre className="text-sm bg-muted p-3 rounded overflow-x-auto">
{`<VideoUpload
  acceptedTypes={['video/mp4', 'video/webm']}
  maxSize={25}
  uploadEndpoint="/api/uploadthing?endpoint=documentUpload"
  onVideoUpdate={handleVideoUpload}
/>`}
						</pre>
					</div>
				</div>
			</div>

			{/* Integration Notes */}
			<div className="space-y-4">
				<h2 className="text-xl font-semibold">Integration Notes</h2>
				<div className="p-4 border rounded-lg bg-muted/50">
					<h3 className="font-medium mb-2">UploadThing Configuration</h3>
					<p className="text-sm text-muted-foreground mb-2">
						Make sure your UploadThing configuration includes video support:
					</p>
					<pre className="text-sm bg-background p-3 rounded border overflow-x-auto">
{`// lib/upload/uploadthing.ts
export const ourFileRouter = {
  documentUpload: f({
    pdf: { maxFileSize: '8MB' },
    video: { maxFileSize: '16MB' }
  })
}`}
					</pre>
				</div>
			</div>
		</div>
	);
}
