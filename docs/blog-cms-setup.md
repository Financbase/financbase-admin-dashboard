# Blog CMS Setup Guide

## Overview

The Blog CMS system has been fully implemented and connects the admin dashboard (`/content/blog`) to the public blog page (`/blog`). This guide covers setup and usage.

## Database Migration

The blog CMS requires database tables to be created. Apply the migration:

```bash
# Option 1: Push schema directly (recommended for development)
pnpm db:push

# Option 2: Generate and apply migration (recommended for production)
pnpm db:generate
pnpm db:push
```

The migration creates three tables:
- `financbase_blog_categories` - Blog categories
- `financbase_blog_posts` - Blog posts
- `financbase_blog_comments` - Blog comments (for future use)

## API Endpoints

### Public Endpoints (No Authentication Required)

- `GET /api/blog` - List published blog posts
  - Query params: `page`, `limit`, `categoryId`, `search`, `featured`
- `GET /api/blog/[slug]` - Get single post by slug
- `GET /api/blog/categories` - Get all categories

### Admin Endpoints (Authentication + Admin Role Required)

- `POST /api/blog` - Create new blog post
- `GET /api/blog/[id]` - Get post by ID (for editing)
- `PUT /api/blog/[id]` - Update blog post
- `DELETE /api/blog/[id]` - Delete/archive blog post
- `POST /api/blog/[id]/publish` - Publish a draft post
- `POST /api/blog/categories` - Create category
- `GET /api/blog/stats` - Get blog statistics

## Usage

### Creating a Blog Post

1. Navigate to `/content/blog`
2. Click "New Post" button
3. Fill in the form:
   - **Title** - Required, auto-generates slug
   - **Slug** - URL-friendly identifier (auto-generated from title)
   - **Excerpt** - Brief description (optional, max 500 chars)
   - **Content** - Full post content (HTML supported)
   - **Featured Image** - Image URL (optional)
   - **Category** - Select from existing categories
   - **Status** - Draft, Published, or Scheduled
   - **Featured** - Toggle to feature the post
4. Click "Save Draft" or "Publish"

### Editing a Blog Post

1. Navigate to `/content/blog`
2. Find the post in the list
3. Click "Edit" button
4. Make changes and click "Save Changes"

### Publishing a Draft

1. From the blog management page, find the draft post
2. Click "Publish" button
3. The post will immediately become available on the public blog

### Viewing Published Posts

Published posts are automatically displayed on `/blog` with:
- Category filtering
- Search functionality
- Individual post pages at `/blog/[slug]`

## Features

### Automatic Slug Generation
- Slugs are auto-generated from titles
- Ensures uniqueness (appends number if needed)
- URL-friendly format (lowercase, hyphens)

### View Tracking
- View counts are automatically incremented when published posts are viewed
- Only counts views from non-author users

### Status Management
- **Draft** - Not visible to public
- **Published** - Visible on public blog
- **Scheduled** - Will be published at scheduled time (future feature)
- **Archived** - Soft-deleted, hidden from public

### Caching
- Blog posts are cached in Redis for 1 hour
- Cache is invalidated when posts are updated or deleted
- Public blog listings use Next.js revalidation

## Content Editor

Currently uses a simple textarea. For production, consider upgrading to:
- **TipTap** - Modern, extensible rich text editor
- **Quill** - Lightweight WYSIWYG editor
- **React MDX Editor** - Markdown editor with React components

## Security

- All admin operations require authentication + admin role
- Public endpoints only return published posts
- Input validation using Zod schemas
- SQL injection protection via Drizzle ORM
- XSS protection for content (sanitize HTML in production)

## Performance

- Database indexes on frequently queried columns
- Redis caching for post listings
- Next.js server-side rendering for public pages
- Efficient slug lookups with unique indexes

## Future Enhancements

- Rich text editor integration
- Image upload/management
- Post scheduling automation
- Comment moderation system
- SEO optimization (meta tags, sitemap)
- Analytics integration
- Related posts suggestions
- Author management
- Post versioning/history

## Troubleshooting

### Posts not appearing on public blog
- Verify post status is "published"
- Check database migration was applied
- Verify API endpoint is accessible
- Check browser console for errors

### Cannot create/edit posts
- Verify user has admin role
- Check authentication is working
- Verify API endpoints return 401/403 if unauthorized

### Slug conflicts
- System automatically handles slug conflicts
- If manual slug conflicts occur, try a different slug

### Migration errors
- Verify database connection string is correct
- Check if tables already exist (may need to drop first)
- Verify schema matches migration file

## API Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional message",
  "pagination": { /* pagination info for list endpoints */ }
}
```

Error responses:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "timestamp": "ISO timestamp",
    "requestId": "req_xxx"
  }
}
```

