# IRS Direct File Integration - Security Review Checklist

## Overview
This checklist ensures compliance with security requirements for the IRS Direct File integration, specifically regarding PII (Personally Identifiable Information) and FTI (Federal Tax Information) handling.

## Data Handling Requirements

### ✅ No PII/FTI Storage
- [x] **Database Schema Review**: Confirmed `direct_file_exports` table stores only metadata (filename, export date, format) - no PII/FTI
- [x] **API Endpoints**: `/api/tax/direct-file/exports` only accepts and stores metadata
- [x] **Session Management**: All session data cleared on component unmount
- [x] **Storage Cleanup**: `useDirectFileSession` hook clears all Direct File related storage on unmount
- [x] **Export Service**: `direct-file-service.ts` only handles metadata, never PII/FTI

### ✅ Session Data Management
- [x] **Ephemeral Storage**: All tax return data stored only in memory during session
- [x] **Cleanup on Unmount**: `DirectFileWrapper` component clears all session/localStorage on unmount
- [x] **Before Unload Handler**: Session cleanup triggered on page unload
- [x] **No Persistence**: No localStorage or sessionStorage used for PII/FTI

### ✅ Security Measures
- [x] **HTTPS Enforcement**: All routes require HTTPS (enforced by Next.js in production)
- [x] **Authentication**: Route protected with Clerk authentication (`currentUser()` check)
- [x] **Input Validation**: API endpoints validate input and reject invalid data
- [x] **CSRF Protection**: Next.js provides built-in CSRF protection
- [x] **Error Handling**: Errors logged without exposing PII/FTI

### ✅ Audit Logging
- [ ] **Access Logging**: Log access to Direct File route (without PII)
- [ ] **Export Logging**: Log export events (metadata only)
- [ ] **Error Logging**: Log errors without PII/FTI

### ✅ Compliance
- [x] **Licensing**: IRS Direct File is public domain (CC0 1.0 Universal)
- [x] **Attribution**: Attribution included in disclosure component
- [x] **User Disclosures**: Clear disclosures about IRS direct filing and no PII storage

## Implementation Details

### Database Schema
```sql
-- direct_file_exports table stores ONLY:
-- - id (generated)
-- - user_id (Clerk ID, not PII)
-- - filename (just filename, not content)
-- - format ("mef-xml" or "json")
-- - file_size (bytes)
-- - export_date (timestamp)
-- NO PII or FTI fields
```

### API Endpoints
- `GET /api/tax/direct-file/exports` - Returns metadata only
- `POST /api/tax/direct-file/exports` - Accepts metadata only, validates format

### Component Security
- `DirectFileWrapper` - Clears all storage on unmount
- `useDirectFileSession` - Manages ephemeral session, clears on unmount
- `DirectFileDisclosure` - Informs users about data handling

## Testing Checklist

### Security Tests
- [ ] Verify no PII in database after session completion
- [ ] Test session cleanup on component unmount
- [ ] Test session cleanup on page navigation
- [ ] Test session cleanup on browser close
- [ ] Verify HTTPS enforcement in production
- [ ] Test input validation on API endpoints
- [ ] Test authentication requirements

### Data Flow Tests
- [ ] Verify export metadata stored correctly (no PII)
- [ ] Verify export data not stored in database
- [ ] Test export download functionality
- [ ] Verify session data cleared after export

## Known Limitations

1. **Backend Integration**: Full Direct File backend services not yet integrated
2. **Fact Graph**: Scala fact graph compilation not yet set up
3. **Routing Adapter**: Direct File's BrowserRouter needs adaptation to MemoryRouter
4. **Environment Variables**: Full environment variable setup required

## Recommendations

1. **Regular Audits**: Conduct quarterly security audits of data handling
2. **Monitoring**: Set up alerts for any PII/FTI storage attempts
3. **Documentation**: Keep this checklist updated as integration progresses
4. **Training**: Ensure all developers understand PII/FTI handling requirements

## Sign-off

- [ ] Security Review Completed
- [ ] Data Handling Verified
- [ ] Compliance Confirmed
- [ ] Ready for Staging Deployment

---

**Last Updated**: 2025-01-28
**Reviewer**: [To be filled]
**Status**: In Progress

