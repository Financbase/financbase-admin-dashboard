# Mock Data Evaluation and Documentation

This document categorizes all mock data used in the codebase, indicating which should be replaced with real implementations versus which are intentionally static for development/demo purposes.

## Summary

**Total Mock Data Instances:** 15+  
**Needs Replacement:** 8  
**Intentionally Static (Acceptable):** 7+

---

## Mock Data That Needs Replacement

These instances should be replaced with real data sources or API integrations.

### 1. API Routes with Mock Data

#### `app/api/dashboard/ai-insights/route.ts`
- **Status:** ⚠️ **NEEDS REPLACEMENT**
- **Location:** Lines 17-38
- **Current Implementation:** Returns hardcoded AI insights
- **Action Required:** 
  - Connect to actual AI service (OpenAI, Anthropic, etc.) OR
  - Implement financial data analysis algorithms OR
  - Remove endpoint if AI features are not planned
- **Priority:** Medium (feature enhancement)

#### `app/api/dashboard/top-products/route.ts`
- **Status:** ⚠️ **NEEDS REPLACEMENT**
- **Location:** Lines 19-28
- **Current Implementation:** Returns hardcoded product/service list
- **Action Required:**
  - Create `products` or `services` database schema OR
  - Query from `invoices` table grouped by service/product name OR
  - Document as intentionally static if services are not trackable
- **Priority:** Medium (depends on business requirements)
- **Note:** Comment indicates "since we don't have services/products schema" - schema may need to be created

### 2. Dashboard Pages with Mock Data

#### `app/(dashboard)/real-estate/buyer/page.tsx`
- **Status:** ⚠️ **NEEDS REPLACEMENT**
- **Location:** Lines 45-92
- **Current Implementation:** Hardcoded stats and saved properties
- **Action Required:**
  - Connect to real estate API endpoints (already created in `app/api/real-estate/buyer/`)
  - Replace with API calls using `useQuery` or similar
- **Priority:** High (production feature)
- **API Endpoints Available:** `/api/real-estate/buyer/stats`, `/api/real-estate/buyer/saved-properties`

#### `app/(dashboard)/real-estate/realtor/page.tsx`
- **Status:** ⚠️ **NEEDS REPLACEMENT**
- **Location:** Lines 55-173
- **Current Implementation:** Hardcoded stats, leads, and listings
- **Action Required:**
  - Connect to real estate API endpoints (already created)
  - Replace with API calls
- **Priority:** High (production feature)
- **API Endpoints Available:** `/api/real-estate/realtor/stats`, `/api/real-estate/realtor/leads`, `/api/real-estate/realtor/listings`

### 3. Component Mock Data

#### `components/dashboard/dashboard-builder.tsx`
- **Status:** ⚠️ **NEEDS REPLACEMENT**
- **Location:** Lines 1137-1187
- **Current Implementation:** `fetchWidgetData` function returns mock data for all widget types
- **Action Required:**
  - Implement real API calls based on widget configuration
  - Each widget type should call appropriate dashboard API endpoints
  - Map widget filters to API parameters
- **Priority:** High (core functionality)
- **Related APIs:** `/api/dashboard/overview`, `/api/analytics/*`

#### `app/analytics/upload/page.tsx`
- **Status:** ⚠️ **NEEDS REPLACEMENT**
- **Location:** Lines 68-102
- **Current Implementation:** Mock upload analytics metrics
- **Action Required:**
  - Create API endpoint `/api/analytics/uploads`
  - Query from upload/asset tables
  - Calculate real metrics from database
- **Priority:** Medium (feature enhancement)

#### `components/freelancer/dashboard-overview.tsx`
- **Status:** ⚠️ **NEEDS REPLACEMENT**
- **Location:** Lines 54-128
- **Current Implementation:** Mock freelancer data, stats, and activities
- **Action Required:**
  - Create freelancer-specific API endpoints
  - Connect to user/project database tables
- **Priority:** Medium (depends on freelancer feature roadmap)

---

## Mock Data That Is Intentionally Static (Acceptable)

These instances are acceptable for development, demos, or static content.

### 1. Development/Demo Data

#### `components/core/ui/layout/modern-hero.tsx`
- **Status:** ✅ **INTENTIONALLY STATIC**
- **Location:** Multiple lines (news feed, features, testimonials)
- **Reason:** Landing page static content
- **Action:** None required - this is marketing/demo content
- **Note:** May be replaced with CMS content in future

### 2. Test/Debug Data

#### Mock data in test files (`**/*.test.ts`, `**/*.spec.ts`)
- **Status:** ✅ **INTENTIONALLY STATIC**
- **Reason:** Test fixtures are expected to be mock data
- **Action:** None required

### 3. Placeholder Content

#### Default/fallback values in components
- **Status:** ✅ **ACCEPTABLE**
- **Reason:** Provides graceful fallbacks when real data unavailable
- **Action:** None required

---

## Recommendations

### Immediate Actions (High Priority)

1. **Real Estate Dashboards** - Connect buyer and realtor pages to existing API endpoints
   - Estimated effort: 2-4 hours
   - Impact: High (user-facing feature)

2. **Dashboard Builder Widget Data** - Implement real data fetching
   - Estimated effort: 4-6 hours
   - Impact: High (core functionality)

### Short-term Actions (Medium Priority)

3. **AI Insights API** - Decide on approach:
   - Option A: Integrate with OpenAI/Anthropic API
   - Option B: Implement financial analysis algorithms
   - Option C: Remove feature if not needed
   - Estimated effort: 8-16 hours (depending on option)

4. **Top Products API** - Create services/products schema or query from invoices
   - Estimated effort: 4-8 hours
   - Impact: Medium (enhancement feature)

5. **Upload Analytics** - Create real API endpoint
   - Estimated effort: 3-5 hours
   - Impact: Medium (analytics feature)

### Long-term Actions (Lower Priority)

6. **Freelancer Dashboard** - Depends on product roadmap
   - Only implement if freelancer features are production requirements

7. **Landing Page Content** - Consider CMS integration
   - Can remain static for MVP

---

## Migration Checklist

For each mock data instance that needs replacement:

- [ ] Identify real data source (API, database, external service)
- [ ] Create or verify API endpoint exists
- [ ] Implement data fetching (React Query, SWR, etc.)
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add data validation
- [ ] Update tests
- [ ] Remove mock data comments/code

---

## Notes

- **Test User IDs:** Already fixed in previous audit (11 Real Estate API routes)
- **Hardcoded User Context:** Already fixed in collaboration components
- **Dashboard Metrics:** Already fixed (change calculations, satisfaction score)
- **Environment Variables:** See `ENVIRONMENT_VARIABLES.md` for placeholder documentation

---

## Version History

- **2024-01-XX:** Initial audit and categorization
- Mock data instances identified and documented
- Priority levels assigned

