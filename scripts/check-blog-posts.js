require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const { sql } = require('drizzle-orm');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

const neonSql = neon(DATABASE_URL);

async function checkBlogPosts() {
  console.log('🔍 Checking for blog posts in database...\n');
  
  try {
    // First check what schema the table is in
    const schemaCheck = await neonSql`
      SELECT table_schema, table_name
      FROM information_schema.tables 
      WHERE table_name = 'financbase_blog_posts'
      ORDER BY table_schema
    `;
    
    if (schemaCheck.length === 0) {
      console.log('❌ Blog posts table does not exist yet.');
      console.log('   Run database migrations: pnpm db:push');
      process.exit(0);
    }
    
    const schema = schemaCheck[0].table_schema;
    console.log(`📋 Found table in schema: ${schema}\n`);
    
    // Check if table exists and count posts
    const tableName = `${schema}.financbase_blog_posts`;
    const result = await neonSql(`
      SELECT 
        COUNT(*) as total_posts,
        COUNT(*) FILTER (WHERE status = 'published') as published_posts,
        COUNT(*) FILTER (WHERE status = 'draft') as draft_posts,
        COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled_posts,
        COUNT(*) FILTER (WHERE status = 'archived') as archived_posts
      FROM ${tableName}
    `);
    
    const stats = result[0];
    
    console.log('📊 Blog Posts Statistics:');
    console.log(`   Total Posts: ${stats.total_posts}`);
    console.log(`   Published: ${stats.published_posts}`);
    console.log(`   Drafts: ${stats.draft_posts}`);
    console.log(`   Scheduled: ${stats.scheduled_posts}`);
    console.log(`   Archived: ${stats.archived_posts}`);
    console.log('');
    
    if (stats.total_posts > 0) {
      // Get list of posts
      const posts = await neonSql(`
        SELECT 
          id,
          title,
          slug,
          status,
          created_at,
          published_at,
          view_count
        FROM ${tableName}
        ORDER BY created_at DESC
        LIMIT 10
      `);
      
      console.log('📝 Recent Posts:');
      posts.forEach((post, index) => {
        console.log(`   ${index + 1}. [${post.status}] ${post.title}`);
        console.log(`      Slug: ${post.slug}`);
        console.log(`      Created: ${new Date(post.created_at).toLocaleDateString()}`);
        if (post.published_at) {
          console.log(`      Published: ${new Date(post.published_at).toLocaleDateString()}`);
        }
        console.log(`      Views: ${post.view_count}`);
        console.log('');
      });
    } else {
      console.log('ℹ️  No blog posts found in the database.');
      console.log('   You can create posts at: http://localhost:3001/content/blog/new');
    }
    
  } catch (error) {
    if (error.message.includes('does not exist') || error.message.includes('relation')) {
      console.log('❌ Blog posts table does not exist yet.');
      console.log('   Run database migrations: pnpm db:push');
    } else {
      console.error('❌ Error checking blog posts:', error.message);
      console.error(error);
    }
  }
  
  process.exit(0);
}

checkBlogPosts();

