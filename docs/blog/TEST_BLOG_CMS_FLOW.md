# Blog CMS Full Flow Test Guide

## ✅ System Status
- ✅ Blog page (`/blog`) is working
- ✅ CMS interface (`/content/blog`) is implemented
- ✅ API routes are functional
- ✅ Database schema is in place

## Manual Testing Steps

### Step 1: Access CMS Interface
1. Open your browser
2. Navigate to: `http://localhost:3001/content/blog`
3. **Expected**: You should see:
   - Blog Management dashboard
   - Statistics cards (Total Posts, Published Posts, etc.)
   - "New Post" button
   - List of existing posts (if any)

### Step 2: Create a New Blog Post
1. Click the **"New Post"** button
2. You'll be redirected to: `http://localhost:3001/content/blog/new`
3. Fill in the form:
   - **Title**: `Getting Started with Financbase`
   - **Slug**: Will auto-generate as `getting-started-with-financbase` (or customize)
   - **Excerpt**: `Learn how to get started with Financbase and manage your finances effectively`
   - **Content**: 
     ```html
     <p>Financbase is a comprehensive financial management platform designed for modern businesses.</p>
     <h2>Key Features</h2>
     <ul>
       <li>Real-time financial tracking</li>
       <li>AI-powered insights</li>
       <li>Automated invoicing</li>
     </ul>
     ```
   - **Featured Image** (optional): `https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop`
   - **Category**: Select from dropdown (if categories exist)
   - **Status**: Choose **"Published"** (or "Draft" to publish later)
   - **Featured**: Toggle if you want to feature this post
4. Click **"Publish"** button (or "Save Draft" if status is draft)
5. **Expected**: 
   - Success toast notification
   - Redirect to edit page: `/content/blog/[id]/edit`

### Step 3: Verify Post in CMS
1. Navigate back to: `http://localhost:3001/content/blog`
2. **Expected**: 
   - Your new post appears in the list
   - Status badge shows "Published" (green badge)
   - Statistics update (Published Posts count increases)

### Step 4: Verify Post on Public Blog
1. Navigate to: `http://localhost:3001/blog`
2. **Expected**:
   - Your post appears in the blog listing
   - Post card shows:
     - Featured image (if provided)
     - Title: "Getting Started with Financbase"
     - Excerpt
     - View count (0 initially)
     - Like count (0)
     - "Read More" button

### Step 5: View Individual Post
1. Click on the post card or "Read More" button
2. You'll be redirected to: `http://localhost:3001/blog/getting-started-with-financbase`
3. **Expected**:
   - Full post content displayed
   - Post header with title, excerpt, date
   - Featured image (if provided)
   - Category badge (if assigned)
   - View count increments automatically
   - Share buttons (Like, Share)
   - "Back to Blog" navigation

### Step 6: Publish a Draft (Alternative Flow)
If you saved a post as "Draft":
1. Go to `/content/blog`
2. Find your draft post
3. Click the **"Publish"** button (or edit icon → Publish button)
4. **Expected**: Status changes to "Published", post appears on public blog

## API Testing (Alternative)

If you prefer to test via API directly:

### 1. Create Post
```bash
curl -X POST http://localhost:3001/api/blog \
  -H "Content-Type: application/json" \
  -H "Cookie: [your-auth-cookie]" \
  -d '{
    "title": "Test Blog Post",
    "slug": "test-blog-post",
    "excerpt": "This is a test post",
    "content": "<p>Test content here</p>",
    "status": "published",
    "isFeatured": false
  }'
```

### 2. Get Published Posts
```bash
curl http://localhost:3001/api/blog?status=published
```

### 3. Publish a Draft
```bash
curl -X POST http://localhost:3001/api/blog/[id]/publish \
  -H "Cookie: [your-auth-cookie]"
```

## Troubleshooting

### Issue: CMS page requires authentication
**Solution**: Ensure you're logged in as an admin user. The CMS requires admin privileges.

### Issue: Post not appearing on public blog
**Check**:
- Post status is "published" (not "draft")
- Refresh the page
- Check browser console for errors
- Verify API endpoint: `GET /api/blog?status=published`

### Issue: 404 on individual post page
**Check**:
- Slug matches exactly (case-sensitive, hyphenated)
- Post status is "published"
- Post exists in database

### Issue: View count not incrementing
**Note**: View count increments asynchronously. Check after a few seconds.

## Expected Results Summary

✅ **CMS Interface**: Loads with dashboard and post list  
✅ **Create Post**: Form saves successfully  
✅ **Publish Post**: Status changes to published  
✅ **Public Blog**: Displays published posts  
✅ **Individual Post**: Shows full content with tracking  
✅ **View Count**: Increments on post view  

## Next Steps After Testing

Once verified working:
1. Create categories for better organization
2. Add more blog posts
3. Customize featured images
4. Test search functionality (when implemented)
5. Test category filtering

