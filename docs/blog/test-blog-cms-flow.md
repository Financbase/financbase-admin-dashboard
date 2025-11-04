# Blog CMS Flow Test Guide

## Test Steps

### 1. Navigate to CMS Interface
- **URL**: `http://localhost:3001/content/blog`
- **Expected**: Blog Management Dashboard with:
  - Statistics cards (Total Posts, Published Posts, Total Views, Engagement Rate)
  - Post list with search/filter
  - "New Post" button

### 2. Create a New Blog Post
- **URL**: `http://localhost:3001/content/blog/new`
- **Steps**:
  1. Click "New Post" button
  2. Fill in the form:
     - **Title**: "Getting Started with Financbase"
     - **Slug**: Auto-generated from title (or custom: "getting-started-with-financbase")
     - **Excerpt**: "Learn how to get started with Financbase and manage your finances effectively"
     - **Content**: `<p>Financbase is a comprehensive financial management platform...</p>`
     - **Featured Image**: (Optional) `https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop`
     - **Category**: Select or leave empty
     - **Status**: Choose "Draft" or "Published"
  3. Click "Save Draft" or "Publish" button
  4. **Expected**: Success toast, redirect to edit page

### 3. Verify Post Creation
- **Check**: Post appears in `/content/blog` list
- **Status Badge**: Should show "Draft" or "Published"

### 4. Publish the Post (if saved as draft)
- **Option A**: Edit page has "Publish" button
- **Option B**: Use publish endpoint via API
- **Expected**: Status changes to "Published", `publishedAt` timestamp set

### 5. Verify on Public Blog
- **URL**: `http://localhost:3001/blog`
- **Expected**: 
  - Post appears in blog listing
  - Post card shows title, excerpt, featured image
  - Click post → Navigate to `/blog/[slug]`
  - Individual post page displays full content

## API Endpoints for Testing

### Create Post (Admin Only)
```bash
POST /api/blog
Headers: {
  "Content-Type": "application/json",
  "Authorization": "Bearer [admin_token]"
}
Body: {
  "title": "Test Blog Post",
  "slug": "test-blog-post",
  "excerpt": "This is a test post",
  "content": "<p>Test content here</p>",
  "status": "published",
  "isFeatured": false
}
```

### Publish Post (Admin Only)
```bash
POST /api/blog/[id]/publish
Headers: {
  "Authorization": "Bearer [admin_token]"
}
```

### Get Published Posts (Public)
```bash
GET /api/blog?status=published
```

## Expected Results

✅ **CMS Interface**: Should load with dashboard
✅ **Create Post**: Should save successfully
✅ **Publish Post**: Should change status to published
✅ **Public Blog**: Should display published posts
✅ **Individual Post**: Should show full content with view tracking

## Troubleshooting

- **Authentication Error**: Ensure you're logged in as admin
- **Post Not Appearing**: Check status is "published" not "draft"
- **404 on Post Page**: Verify slug matches the post slug
- **Empty Blog**: Check database for published posts

