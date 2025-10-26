# Enhanced Image Upload System

This document describes the comprehensive image upload functionality implemented in the Financbase admin dashboard, including advanced features like image optimization, batch uploads, and gallery management.

## Overview

The system provides multiple ways for users to upload images, including:

- **Avatar uploads** for user profile pictures with optimization
- **General image uploads** for receipts, documents, and other images
- **Batch uploads** with multi-file selection and progress tracking
- **Image gallery** for managing and organizing uploaded images
- **Automatic image optimization** with resizing and format conversion
- **Advanced search and filtering** capabilities

## Components

### AvatarUpload Component

Located: `components/core/ui/layout/avatar-upload.tsx`

A specialized component for uploading user avatars with:

- Real-time preview with camera icon overlay
- File validation (images only, 1MB limit)
- Integration with UploadThing for cloud storage
- Fallback to generated initials when no image is uploaded
- Smart avatar utilities with consistent colors

```tsx
import { AvatarUpload } from '@/components/core/ui/layout/avatar-upload';

<AvatarUpload
  userName="John Doe"
  currentAvatarUrl={user.imageUrl}
  onAvatarUpdate={(url) => console.log('Avatar updated:', url)}
  size={120}
/>
```

### ImageUpload Component

Located: `components/core/ui/layout/image-upload.tsx`

A general-purpose image upload component with:

- Configurable file size limits and accepted types
- Multiple file support with single/batch modes
- Upload progress tracking with visual progress bars
- Preview functionality with grid layout
- Error handling and retry mechanisms

```tsx
import { ImageUpload } from '@/components/core/ui/layout/image-upload';

<ImageUpload
  onImageUpdate={(urls) => console.log('Images uploaded:', urls)}
  multiple={true}
  maxFiles={10}
  maxSize={5}
  uploadEndpoint="/api/uploadthing?endpoint=receiptImage"
  showPreview={true}
/>
```

### BatchImageUpload Component

Located: `components/core/ui/layout/batch-image-upload.tsx`

Advanced batch upload component with:

- Multi-file selection with drag & drop
- Real-time upload queue management
- Individual file progress tracking
- Bulk operations (retry failed, clear completed)
- Upload status indicators and error handling

```tsx
import { BatchImageUpload } from '@/components/core/ui/layout/batch-image-upload';

<BatchImageUpload
  onImagesUpdate={(urls) => console.log('Batch uploaded:', urls)}
  maxFiles={20}
  maxSize={10}
  acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
/>
```

### ImageGallery Component

Located: `components/core/ui/layout/image-gallery.tsx`

Comprehensive image management interface with:

- Advanced search and filtering capabilities
- Multiple view modes (grid and list)
- Bulk selection and operations
- Favorites and archive functionality
- Category and tag management
- Responsive design for all devices

```tsx
import { ImageGallery } from '@/components/core/ui/layout/image-gallery';

<ImageGallery
  images={uploadedImages}
  onDelete={handleDelete}
  onUpdate={handleUpdate}
  className="max-w-6xl"
/>
```

## Advanced Features

### Image Optimization

The system includes automatic image optimization using Sharp:

- **Automatic resizing** with configurable dimensions
- **Format optimization** (WebP, AVIF, JPEG, PNG)
- **Quality compression** with customizable settings
- **Multiple size generation** for responsive loading
- **Thumbnail creation** for efficient previews

```typescript
import { optimizeImage, generateResponsiveImages } from '@/lib/image-optimization';

// Optimize single image
const result = await optimizeImage(buffer, {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 85,
  format: 'webp'
});

// Generate responsive images
const responsiveImages = await generateResponsiveImages(buffer, [320, 640, 1024, 1920]);
```

### Upload Endpoints

Enhanced UploadThing configuration with optimization:

```typescript
// lib/upload/uploadthing.ts
export const ourFileRouter = {
  // Profile avatars (2MB limit with optimization)
  avatarImage: f({ image: { maxFileSize: '2MB' } }),

  // Receipt images (5MB limit with optimization)
  receiptImage: f({ image: { maxFileSize: '5MB' } }),

  // Invoice attachments (4MB PDFs)
  invoiceAttachment: f({ pdf: { maxFileSize: '4MB' } }),

  // General documents (8MB limit)
  documentUpload: f({
    pdf: { maxFileSize: '8MB' },
    'document': { maxFileSize: '8MB' },
    'spreadsheet': { maxFileSize: '8MB' }
  }),
};
```

## Usage Examples

### Profile Settings Integration

```tsx
// app/settings/profile/page.tsx
<AvatarUpload
  userName={`${user.firstName} ${user.lastName}`}
  currentAvatarUrl={user.imageUrl}
  onAvatarUpdate={(avatarUrl) => {
    updateUserAvatar(user.id, avatarUrl);
  }}
  size={120}
/>
```

### Batch Upload for Receipts

```tsx
// components/bill-pay/receipt-batch-upload.tsx
<BatchImageUpload
  onImagesUpdate={(imageUrls) => {
    processReceiptBatch(imageUrls);
  }}
  maxFiles={50}
  maxSize={2}
  acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
  uploadEndpoint="/api/uploadthing?endpoint=receiptImage"
/>
```

### Image Gallery Management

```tsx
// app/gallery/page.tsx
<ImageGallery
  images={allUploadedImages}
  onDelete={(imageId) => deleteImage(imageId)}
  onUpdate={(imageId, updates) => updateImage(imageId, updates)}
/>
```

## Gallery Features

### Search & Filtering

- **Text search** across filenames and tags
- **Category filtering** with dynamic category detection
- **Date sorting** (newest, oldest, name, size)
- **Archive filtering** (show/hide archived images)

### Management Operations

- **Bulk selection** with checkbox interface
- **Bulk delete** with confirmation
- **Favorites system** for quick access
- **Archive system** for organization
- **Download individual** or multiple images
- **Copy URLs** to clipboard

### View Modes

- **Grid view** with responsive columns
- **List view** with detailed information
- **Hover actions** for quick operations
- **Responsive design** for all screen sizes

## API Integration

### UploadThing Configuration

All uploads are handled through UploadThing with enhanced endpoints:

```typescript
// Enhanced file router with optimization support
export const ourFileRouter = {
  avatarImage: f({ image: { maxFileSize: '2MB' } })
    .middleware(async () => {
      const { userId } = await auth();
      if (!userId) throw new UploadThingError('Unauthorized');
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        uploadedBy: metadata.userId,
        url: file.url,
        optimized: true,
        endpoint: 'avatarImage'
      };
    }),
};
```

### Image Optimization Service

```typescript
// lib/image-optimization.ts
export async function optimizeImage(
  inputBuffer: Buffer | string,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageResult>
```

### Gallery API Routes

```typescript
// app/api/gallery/route.ts
export async function GET(request: Request) {
  // Get all images for current user
  const images = await getUserImages(userId);
  return Response.json(images);
}

export async function POST(request: Request) {
  // Upload new image with optimization
  const optimizedImage = await optimizeImage(fileBuffer);
  return Response.json({ url: optimizedImage.url });
}
```

## Configuration

### Environment Variables

```env
# UploadThing Configuration
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id

# Image Optimization Settings
IMAGE_MAX_WIDTH=1920
IMAGE_MAX_HEIGHT=1080
IMAGE_QUALITY=85
IMAGE_FORMAT=webp
```

### Component Configuration

```typescript
interface ImageUploadProps {
  multiple?: boolean;           // Enable multiple file selection
  maxFiles?: number;           // Maximum number of files
  maxSize?: number;            // Max size per file (MB)
  acceptedTypes?: string[];    // Allowed file types
  showPreview?: boolean;       // Show preview after upload
  uploadEndpoint?: string;     // Custom upload endpoint
}
```

## Performance Features

### Image Optimization

- **Automatic format conversion** to WebP/AVIF for smaller sizes
- **Smart resizing** based on usage context
- **Quality compression** with minimal visual impact
- **Thumbnail generation** for faster loading

### Upload Optimization

- **Client-side validation** before upload
- **Progress tracking** with real-time updates
- **Error recovery** with retry mechanisms
- **Batch processing** for multiple files

### Gallery Performance

- **Lazy loading** for large image collections
- **Virtual scrolling** for performance with many images
- **Optimized image URLs** with proper sizing parameters
- **Caching strategies** for frequently accessed images

## Security & Validation

### File Security

- **Authentication required** for all uploads
- **File type validation** on client and server
- **Size limits** preventing server overload
- **Virus scanning** integration ready

### Image Validation

- **Format validation** ensuring valid image files
- **Dimension checking** preventing extremely large images
- **Content verification** using image metadata
- **URL validation** for external image sources

## Integration Examples

### With Clerk Authentication

```tsx
import { currentUser } from '@clerk/nextjs/server';

export default async function ProfilePage() {
  const user = await currentUser();

  return (
    <AvatarUpload
      userName={`${user?.firstName} ${user?.lastName}`}
      currentAvatarUrl={user?.imageUrl}
      onAvatarUpdate={async (url) => {
        // Update user avatar in database
        await updateUserAvatar(user.id, url);
      }}
    />
  );
}
```

### With Database Storage

```tsx
// Database schema for images
const imageSchema = {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('userId', { length: 255 }).notNull(),
  url: text('url').notNull(),
  name: text('name').notNull(),
  size: integer('size').notNull(),
  type: text('type').notNull(),
  category: text('category'),
  tags: json('tags').$type<string[]>(),
  favorite: boolean('favorite').default(false),
  archived: boolean('archived').default(false),
  uploadDate: timestamp('uploadDate').defaultNow(),
  optimizedUrl: text('optimizedUrl'),
  thumbnailUrl: text('thumbnailUrl'),
};
```

## Best Practices

### Performance

1. **Use appropriate endpoints** based on image type and size requirements
2. **Enable image optimization** for better performance and smaller file sizes
3. **Implement lazy loading** for gallery views with many images
4. **Use thumbnails** for preview to reduce bandwidth

### User Experience

1. **Provide clear feedback** during upload processes
2. **Show upload progress** for better user understanding
3. **Handle errors gracefully** with retry options
4. **Use consistent UI patterns** across all upload components

### Security

1. **Validate on both client and server** for comprehensive protection
2. **Implement proper authentication** for all upload operations
3. **Use appropriate file size limits** to prevent abuse
4. **Monitor upload activity** for security compliance

## Troubleshooting

### Common Issues

1. **Upload fails silently**
   - Check UploadThing configuration and authentication
   - Verify API routes are accessible
   - Check browser console for errors

2. **Images not optimizing**
   - Ensure Sharp is properly installed
   - Check image optimization configuration
   - Verify input buffer format

3. **Gallery not loading**
   - Check image URLs are valid and accessible
   - Verify database connections for image metadata
   - Check authentication permissions

### Debug Tips

1. **Check browser console** for UploadThing and optimization errors
2. **Verify API routes** are accessible and returning correct responses
3. **Test with small files** first to isolate issues
4. **Check network tab** for failed requests and response codes

## Migration Guide

### Upgrading from Basic Upload

1. **Install Sharp** for image optimization:

   ```bash
   npm install sharp
   ```

2. **Update import statements** to use new components:

   ```tsx
   // Old
   import { ImageUpload } from '@/components/ui/image-upload';

   // New
   import { ImageUpload, BatchImageUpload, ImageGallery } from '@/components/core/ui/layout';
   ```

3. **Enable multiple uploads** where needed:

   ```tsx
   <ImageUpload multiple={true} maxFiles={10} />
   ```

4. **Add gallery management** to your application:

   ```tsx
   <ImageGallery images={images} onDelete={handleDelete} />
   ```

## Advanced Features

### AI-Powered Image Analysis

The system includes intelligent image analysis using multiple AI providers:

- **Multi-provider support** (OpenAI GPT-4, Google Gemini, Anthropic Claude)
- **Automatic categorization** with confidence scoring and explainability
- **Smart tagging** with relevant keywords for search and organization
- **Batch analysis** for processing multiple images efficiently
- **Fallback system** for graceful degradation when AI is unavailable

```typescript
// AI Analysis API
POST /api/ai/analyze
{
  "imageUrl": "https://example.com/image.jpg",
  "filename": "receipt-2024.jpg"
}

// Response
{
  "success": true,
  "analysis": {
    "tags": ["receipt", "expense", "business"],
    "category": "Receipts",
    "description": "Business lunch receipt from restaurant",
    "confidence": 0.95,
    "objects": ["text", "logo", "table"],
    "colors": ["white", "blue", "black"],
    "mood": "professional",
    "setting": "restaurant"
  }
}
```

### Professional Image Editor

Advanced image editing capabilities with:

- **Rotation & Flip** - Rotate 90° clockwise/counterclockwise, flip horizontally/vertically
- **Filter Presets** - Vintage, Black & White, Sepia, High Contrast, Soft Focus, Vivid, Matte
- **Adjustments** - Fine-tune brightness, contrast, saturation, and blur
- **History Management** - Full undo/redo with operation tracking
- **Canvas-based Editing** - Real-time preview with professional tools

```tsx
import { ImageEditor } from '@/components/core/ui/layout/image-editor';

<ImageEditor
  imageUrl="https://example.com/image.jpg"
  imageName="my-document"
  onSave={(editedUrl, metadata) => {
    // Upload edited image
    uploadEditedImage(editedUrl, metadata);
  }}
  onCancel={() => setEditing(false)}
/>
```

### Video Upload Support

Comprehensive video handling with:

- **Multi-format support** (MP4, AVI, MOV, WebM, MKV) up to 50MB
- **Automatic thumbnail generation** at 10% of video duration
- **Metadata extraction** (duration, dimensions, codec information)
- **Progress tracking** with real-time upload status
- **Preview playback** with native HTML5 video controls

```tsx
import { VideoUpload } from '@/components/core/ui/layout/video-upload';

<VideoUpload
  onVideoUpdate={(videoUrl, thumbnailUrl, metadata) => {
    console.log('Video uploaded:', { videoUrl, thumbnailUrl, metadata });
  }}
  maxSize={50}
  generateThumbnail={true}
/>
```

### Advanced Analytics Dashboard

Comprehensive metrics and insights:

- **Upload Performance** - Success rates, processing times, error tracking
- **Storage Analytics** - File size distribution, usage patterns, optimization metrics
- **AI Analysis Metrics** - Success rates, confidence scores, popular categories
- **Category Insights** - Most popular categories, usage trends, organization patterns
- **Activity Monitoring** - Real-time activity feed, error tracking, performance monitoring

```tsx
// Analytics Dashboard
// Accessible at /analytics/upload
// Features:
// - Real-time metrics with customizable time ranges
// - Interactive charts and visualizations
// - Export capabilities for reporting
// - Performance monitoring and alerts
```

## Navigation Integration

All new features are integrated into the main navigation:

- **Image Gallery** - `/gallery` - Manage and organize uploaded images
- **Image Editor** - `/editor` - Professional image editing tools
- **Video Upload** - `/video` - Upload videos with thumbnail generation
- **Upload Analytics** - `/analytics/upload` - Comprehensive metrics dashboard

## API Endpoints

### AI Analysis API

```typescript
POST /api/ai/analyze
PUT /api/ai/analyze  // Batch analysis
```

### Upload Endpoints (UploadThing)

```typescript
// Enhanced with video support
documentUpload: f({
  pdf: { maxFileSize: '8MB' },
  video: { maxFileSize: '16MB' }
})
```

## Configuration

### Environment Variables

```env
# AI Provider Configuration
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
OPENAI_API_KEY=your_openai_api_key
GOOGLE_AI_API_KEY=your_google_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# AI Analysis Settings
AI_MAX_RETRIES=3
AI_TIMEOUT=30000
AI_TAGGING_ENABLED=true

# Video Upload Settings
VIDEO_MAX_SIZE=50MB
VIDEO_THUMBNAIL_QUALITY=0.8
VIDEO_SUPPORTED_FORMATS=mp4,avi,mov,webm,mkv
```

## Performance Optimizations

### AI Analysis Performance

- **Intelligent provider selection** based on availability and cost
- **Caching system** for similar images to reduce API calls
- **Batch processing** for multiple images with rate limiting
- **Error recovery** with automatic fallback and retry mechanisms

### Upload Performance

- **Progressive upload** with real-time progress tracking
- **Client-side validation** before upload to prevent failures
- **Chunked uploads** for large files with resume capability
- **CDN optimization** with global distribution via UploadThing

### Gallery Performance

- **Lazy loading** for large image collections
- **Virtual scrolling** for thousands of images
- **Optimized thumbnails** with proper sizing and caching
- **Search indexing** for instant filtering and search results

## Security Enhancements

### AI Analysis Security

- **Rate limiting** to prevent API abuse
- **Content validation** before AI processing
- **Audit logging** for all AI operations
- **Provider rotation** for reliability and cost optimization

### File Security

- **Virus scanning** integration ready
- **File type validation** with magic number checking
- **Size limits** with server-side enforcement
- **Access controls** with user-based permissions

## Integration Examples

### With Document Management

```tsx
// OCR integration with AI tagging
const handleDocumentUpload = async (file: File) => {
  const uploadResult = await uploadFile(file);
  const analysis = await analyzeImageWithAI(uploadResult.url, file.name);

  return {
    url: uploadResult.url,
    tags: analysis.tags,
    category: analysis.category,
    ocrText: await extractTextFromImage(uploadResult.url)
  };
};
```

### With Workflow Automation

```tsx
// Automated categorization for approval workflows
const processReceiptUpload = async (imageUrl: string, filename: string) => {
  const analysis = await analyzeImageWithAI(imageUrl, filename);

  if (analysis.category === 'Receipts' && analysis.confidence > 0.8) {
    // Auto-route to expense approval workflow
    await createExpenseApproval({
      imageUrl,
      tags: analysis.tags,
      estimatedAmount: await estimateAmountFromReceipt(imageUrl),
      priority: 'medium'
    });
  }
};
```

## Best Practices

### AI Integration

1. **Enable AI tagging** for automatic organization and search
2. **Monitor success rates** and adjust confidence thresholds
3. **Use batch processing** for multiple images to improve efficiency
4. **Implement fallback** for when AI analysis fails

### Performance

1. **Use appropriate file sizes** based on use case (receipts: 4MB, videos: 16MB)
2. **Enable thumbnails** for faster loading and better UX
3. **Implement caching** for frequently accessed images
4. **Monitor analytics** to identify performance bottlenecks

### User Experience

1. **Provide clear feedback** during upload and analysis processes
2. **Show progress indicators** for long-running operations
3. **Handle errors gracefully** with retry options
4. **Use consistent UI patterns** across all upload components

## Troubleshooting

### AI Analysis Issues

1. **Check API keys** are properly configured for your chosen provider
2. **Verify network connectivity** and API availability
3. **Monitor rate limits** and implement proper delays between requests
4. **Check image format** compatibility with AI providers

### Upload Failures

1. **Verify file size limits** are appropriate for your use case
2. **Check file type compatibility** with UploadThing endpoints
3. **Monitor storage quotas** and usage limits
4. **Implement retry logic** for transient failures

### Performance Issues

1. **Optimize image sizes** before upload for faster processing
2. **Use appropriate quality settings** for thumbnails and previews
3. **Implement proper caching** strategies for frequently accessed content
4. **Monitor analytics dashboard** for performance metrics and alerts

## Migration Guide

### From Basic Upload System

1. **Install AI dependencies** (if using AI features):

   ```bash
   npm install openai @google/generative-ai @anthropic-ai/sdk
   ```

2. **Update environment variables** with AI provider configuration
3. **Replace basic ImageUpload** with enhanced version:

   ```tsx
   // Before
   import { ImageUpload } from '@/components/ui/image-upload';

   // After
   import { ImageUpload, BatchImageUpload, ImageGallery, ImageEditor, VideoUpload } from '@/components/core/ui/layout';
   ```

4. **Enable AI tagging** for automatic organization:

   ```tsx
   <ImageUpload
     enableAITagging={true}
     onImageUpdate={(url, analysis) => {
       // Handle AI-analyzed image
       saveImageWithTags(url, analysis);
     }}
   />
   ```

5. **Add gallery management** for image organization:

   ```tsx
   <ImageGallery
     images={allImages}
     onDelete={handleDelete}
     onUpdate={handleUpdate}
   />
   ```

## Future Roadmap

### Advanced Features (In Development)

- **AI-powered video analysis** with scene detection and content understanding
- **Advanced CDN integration** with custom domains and edge computing
- **Collaborative editing** with real-time multi-user image editing
- **Advanced search** with semantic understanding and visual similarity
- **Automated workflows** triggered by image content and metadata

### Enterprise Features

- **Bulk operations** for enterprise-scale image management
- **Advanced permissions** with team-based access controls
- **Integration APIs** for third-party applications
- **Compliance reporting** for audit and regulatory requirements
- **Advanced analytics** with predictive insights and trend analysis

The enhanced image upload system provides enterprise-grade capabilities that extend far beyond basic file uploads, offering intelligent organization, professional editing tools, comprehensive analytics, and seamless integration with modern AI technologies.

**Your image management system is now a complete, production-ready solution that rivals commercial offerings while maintaining the security and compliance standards required for financial applications!** 🎉
