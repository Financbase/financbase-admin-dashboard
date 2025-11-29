# Public API Endpoints Documentation

**Last Updated:** 2025-01-XX  
**Total Public Endpoints:** 35

## Overview

This document catalogs all public API endpoints that do not require authentication. These endpoints are intentionally public and serve various purposes including health checks, public content, webhooks, and user-facing features.

## Security Considerations

All public endpoints should have:
- ✅ Rate limiting (recommended: 100 requests/minute per IP)
- ✅ Input validation
- ✅ CORS configuration
- ✅ Request size limits
- ✅ Error handling that doesn't leak sensitive information

## Endpoint Categories

### 1. Health & Monitoring (2 endpoints)

#### `GET /api/health`
- **Purpose:** Application health check for monitoring systems
- **Authentication:** None (public)
- **Rate Limit:** 60 requests/minute
- **Response:** JSON with health status, database status, service status
- **Use Case:** Uptime monitoring, load balancer health checks
- **Security Notes:** Returns system status but no sensitive data

#### `GET /api/v1/health`
- **Purpose:** Versioned health check endpoint
- **Authentication:** None (public)
- **Rate Limit:** 60 requests/minute
- **Response:** JSON with health status
- **Use Case:** API versioning, backward compatibility

---

### 2. Public Content (10 endpoints)

#### `GET /api/blog`
- **Purpose:** List published blog posts
- **Authentication:** None (public access to published posts)
- **Rate Limit:** 100 requests/minute
- **Response:** Paginated list of published blog posts
- **Use Case:** Public blog listing, RSS feeds
- **Security Notes:** Only published posts are returned to non-admin users

#### `GET /api/blog/[id]`
- **Purpose:** Get blog post by ID or slug
- **Authentication:** None (for published posts), Admin required for drafts
- **Rate Limit:** 100 requests/minute
- **Response:** Blog post details
- **Use Case:** Blog post viewing
- **Security Notes:** Numeric IDs require admin access, slugs are public for published posts

#### `POST /api/blog/[id]/like`
- **Purpose:** Like a blog post
- **Authentication:** None (public)
- **Rate Limit:** 10 requests/minute per IP
- **Response:** Success confirmation
- **Use Case:** Public engagement feature
- **Security Notes:** Should implement IP-based rate limiting to prevent abuse

#### `GET /api/blog/categories`
- **Purpose:** Get blog categories
- **Authentication:** None (public)
- **Rate Limit:** 60 requests/minute
- **Response:** List of blog categories
- **Use Case:** Category navigation

#### `GET /api/blog/stats`
- **Purpose:** Get blog statistics
- **Authentication:** None (public)
- **Rate Limit:** 60 requests/minute
- **Response:** Blog statistics (post count, views, etc.)
- **Use Case:** Public blog metrics

#### `GET /api/guides`
- **Purpose:** List published guides
- **Authentication:** None (public)
- **Rate Limit:** 100 requests/minute
- **Response:** List of guides
- **Use Case:** Public documentation access

#### `GET /api/guides/[id]`
- **Purpose:** Get guide by ID
- **Authentication:** None (public)
- **Rate Limit:** 100 requests/minute
- **Response:** Guide content
- **Use Case:** Guide viewing

#### `GET /api/guides/slug/[slug]`
- **Purpose:** Get guide by slug
- **Authentication:** None (public)
- **Rate Limit:** 100 requests/minute
- **Response:** Guide content
- **Use Case:** SEO-friendly guide URLs

#### `GET /api/careers`
- **Purpose:** List job openings
- **Authentication:** None (public)
- **Rate Limit:** 60 requests/minute
- **Response:** List of active job postings
- **Use Case:** Public careers page

#### `GET /api/careers/[id]`
- **Purpose:** Get job posting details
- **Authentication:** None (public)
- **Rate Limit:** 60 requests/minute
- **Response:** Job posting details
- **Use Case:** Job application pages

---

### 3. Support & Contact (4 endpoints)

#### `POST /api/contact`
- **Purpose:** Submit contact form
- **Authentication:** None (public)
- **Rate Limit:** 5 requests/minute per IP
- **Response:** Success confirmation
- **Use Case:** Contact form submissions
- **Security Notes:** Should implement CAPTCHA or similar anti-spam measures

#### `POST /api/support/public`
- **Purpose:** Submit public support ticket
- **Authentication:** None (public)
- **Rate Limit:** 10 requests/minute per IP
- **Response:** Ticket creation confirmation
- **Use Case:** Public support requests
- **Security Notes:** Rate limiting critical to prevent abuse

#### `GET /api/support/search`
- **Purpose:** Search support articles
- **Authentication:** None (public)
- **Rate Limit:** 60 requests/minute
- **Response:** Search results
- **Use Case:** Public knowledge base search

#### `GET /api/support/category/[slug]`
- **Purpose:** Get support articles by category
- **Authentication:** None (public)
- **Rate Limit:** 60 requests/minute
- **Response:** Category articles
- **Use Case:** Support category browsing

---

### 4. Marketing & Engagement (4 endpoints)

#### `POST /api/newsletter/subscribe`
- **Purpose:** Subscribe to newsletter
- **Authentication:** None (public)
- **Rate Limit:** 5 requests/minute per IP
- **Response:** Subscription confirmation
- **Use Case:** Newsletter signups
- **Security Notes:** Should validate email format, implement double opt-in

#### `GET /api/home/metrics`
- **Purpose:** Get public homepage metrics
- **Authentication:** None (public)
- **Rate Limit:** 60 requests/minute
- **Response:** Public metrics (user count, etc.)
- **Use Case:** Homepage statistics display

#### `GET /api/home/stats`
- **Purpose:** Get public homepage statistics
- **Authentication:** None (public)
- **Rate Limit:** 60 requests/minute
- **Response:** Public statistics
- **Use Case:** Homepage statistics display

#### `GET /api/home/testimonials`
- **Purpose:** Get public testimonials
- **Authentication:** None (public)
- **Rate Limit:** 60 requests/minute
- **Response:** List of testimonials
- **Use Case:** Homepage testimonials display

---

### 5. Webhooks & OAuth (2 endpoints)

#### `POST /api/webhooks/clerk`
- **Purpose:** Receive Clerk authentication webhooks
- **Authentication:** Webhook signature verification (not user auth)
- **Rate Limit:** 1000 requests/minute (webhook provider)
- **Response:** Webhook processing confirmation
- **Use Case:** User creation, organization sync
- **Security Notes:** Must verify webhook signature, not user authentication

#### `POST /api/video-conferencing/oauth/callback`
- **Purpose:** OAuth callback for video conferencing integration
- **Authentication:** OAuth flow (not user auth)
- **Rate Limit:** 60 requests/minute
- **Response:** OAuth token exchange
- **Use Case:** OAuth callback handling
- **Security Notes:** OAuth state validation required

---

### 6. Public Services (3 endpoints)

#### `GET /api/settings/billing/plans`
- **Purpose:** Get public pricing plans
- **Authentication:** None (public)
- **Rate Limit:** 60 requests/minute
- **Response:** List of pricing plans
- **Use Case:** Pricing page display
- **Security Notes:** Should only return public plan information

#### `GET /api/docs`
- **Purpose:** Get API documentation
- **Authentication:** None (public)
- **Rate Limit:** 60 requests/minute
- **Response:** API documentation
- **Use Case:** Public API docs
- **Security Notes:** Should not expose internal endpoints or sensitive information

#### `POST /api/ai/categorize`
- **Purpose:** AI-powered transaction categorization (public demo)
- **Authentication:** None (public)
- **Rate Limit:** 10 requests/minute per IP
- **Response:** Categorization result
- **Use Case:** Public AI demo feature
- **Security Notes:** Should have strict rate limits and input validation

---

### 7. File Upload (1 endpoint)

#### `POST /api/uploadthing`
- **Purpose:** File upload endpoint (via UploadThing)
- **Authentication:** Handled by UploadThing service
- **Rate Limit:** Handled by UploadThing
- **Response:** Upload confirmation
- **Use Case:** Public file uploads
- **Security Notes:** UploadThing handles authentication and rate limiting

---

### 8. Test & Development (9 endpoints)

**Note:** These endpoints should be disabled or secured in production.

#### `GET /api/test`
- **Purpose:** Test endpoint
- **Status:** ⚠️ Should be disabled in production
- **Rate Limit:** N/A (should be disabled)

#### `GET /api/test-db`
- **Purpose:** Database test endpoint
- **Status:** ⚠️ Should be disabled in production
- **Rate Limit:** N/A (should be disabled)

#### `GET /api/test-dashboard/ai-insights`
- **Purpose:** Test dashboard insights
- **Status:** ⚠️ Should be disabled in production
- **Rate Limit:** N/A (should be disabled)

#### `GET /api/test-dashboard/overview`
- **Purpose:** Test dashboard overview
- **Status:** ⚠️ Should be disabled in production
- **Rate Limit:** N/A (should be disabled)

#### `GET /api/test-dashboard/recent-activity`
- **Purpose:** Test dashboard activity
- **Status:** ⚠️ Should be disabled in production
- **Rate Limit:** N/A (should be disabled)

#### `GET /api/test-dashboard-activity`
- **Purpose:** Test dashboard activity
- **Status:** ⚠️ Should be disabled in production
- **Rate Limit:** N/A (should be disabled)

#### `GET /api/test-dashboard-insights`
- **Purpose:** Test dashboard insights
- **Status:** ⚠️ Should be disabled in production
- **Rate Limit:** N/A (should be disabled)

#### `GET /api/test-dashboard-overview`
- **Purpose:** Test dashboard overview
- **Status:** ⚠️ Should be disabled in production
- **Rate Limit:** N/A (should be disabled)

#### `GET /api/test-minimal-final`
- **Purpose:** Minimal test endpoint
- **Status:** ⚠️ Should be disabled in production
- **Rate Limit:** N/A (should be disabled)

---

### 9. Monitoring (1 endpoint)

#### `GET /api/monitoring/snapshot-queries`
- **Purpose:** Monitoring snapshot queries
- **Authentication:** None (public)
- **Rate Limit:** 10 requests/minute
- **Response:** Monitoring data
- **Use Case:** Public monitoring dashboard
- **Security Notes:** Should only return non-sensitive monitoring data

---

### 10. Cron Jobs (1 endpoint)

#### `GET /api/cron/subscription-grace-period`
- **Purpose:** Cron job for subscription grace period processing
- **Authentication:** None (cron job)
- **Rate Limit:** N/A (internal cron)
- **Response:** Processing confirmation
- **Use Case:** Scheduled subscription processing
- **Security Notes:** Should be protected by cron secret or IP whitelist

---

## Rate Limiting Recommendations

### By Endpoint Type

1. **Health Checks:** 60 requests/minute
2. **Public Content:** 100 requests/minute
3. **Contact Forms:** 5 requests/minute per IP
4. **Newsletter:** 5 requests/minute per IP
5. **Webhooks:** 1000 requests/minute (provider-dependent)
6. **OAuth Callbacks:** 60 requests/minute
7. **File Uploads:** Handled by UploadThing
8. **Test Endpoints:** Disabled in production

## Implementation Checklist

- [ ] Implement rate limiting middleware for all public endpoints
- [ ] Add CAPTCHA to contact forms and newsletter signup
- [ ] Configure CORS for public endpoints
- [ ] Add request size limits
- [ ] Implement IP-based rate limiting for form submissions
- [ ] Disable or secure test endpoints in production
- [ ] Add monitoring and alerting for public endpoint abuse
- [ ] Document rate limits in API responses
- [ ] Implement proper error handling that doesn't leak information
- [ ] Add logging for all public endpoint access

## Security Best Practices

1. **Input Validation:** All inputs should be validated and sanitized
2. **Output Encoding:** All outputs should be properly encoded
3. **Error Messages:** Should not reveal system internals
4. **Rate Limiting:** Implement at multiple levels (IP, user, endpoint)
5. **Monitoring:** Monitor for abuse patterns and DDoS attempts
6. **CORS:** Configure appropriate CORS policies
7. **Content Security:** Validate file uploads and content types
8. **Secrets:** Never expose secrets or API keys in public endpoints

## Next Steps

1. ✅ Documented all 35 public endpoints
2. ⏳ Implement rate limiting middleware
3. ⏳ Add CAPTCHA to form submissions
4. ⏳ Configure CORS policies
5. ⏳ Disable test endpoints in production
6. ⏳ Add monitoring and alerting

