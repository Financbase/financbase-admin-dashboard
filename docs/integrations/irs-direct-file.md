# IRS Direct File Integration Documentation

## Overview

This document describes the integration of the IRS Direct File open-source project into Financbase's tax platform. IRS Direct File is a public domain project (CC0 1.0 Universal) that provides an interview-based federal tax filing service.

**Important**: This integration allows users to file directly with the IRS. Financbase does not submit returns on behalf of users, does not provide tax advice, and does not store PII (Personally Identifiable Information) or FTI (Federal Tax Information).

## Architecture

### Directory Structure

```
lib/irs-direct-file/          # IRS Direct File source code
  ├── df-client/              # Direct File client application
  ├── fact-graph-scala/       # Fact graph Scala source (needs compilation)
  └── direct-file-integration.tsx  # Integration adapter

components/tax/
  ├── direct-file-wrapper.tsx      # Main wrapper component
  ├── direct-file-disclosure.tsx  # Legal disclosures
  └── direct-file-export.tsx       # Export handler

app/(dashboard)/tax/
  └── direct-file/
      └── page.tsx            # Main filing page at /tax/direct-file

hooks/
  └── use-direct-file-session.ts  # Session management hook

lib/services/
  └── direct-file-service.ts  # Service layer for export metadata

lib/db/schemas/
  └── direct-file.schema.ts  # Database schema (metadata only, no PII/FTI)
```

### Component Architecture

```
┌─────────────────────────────────────┐
│  DirectFilePage (/tax/direct-file) │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     DirectFileWrapper               │
│  - Session Management               │
│  - Cleanup on Unmount               │
│  - Error Handling                   │
└──────────────┬──────────────────────┘
               │
               ├──► DirectFileDisclosure (Legal notices)
               │
               └──► DirectFileApp (IRS Direct File)
                    - Isolated React root
                    - MemoryRouter (isolated from Next.js)
                    - All context providers
```

## Data Flow

### Session Data (Ephemeral)
1. User starts filing → Session initialized in memory
2. User answers questions → Data stored in React state/Redux (in-memory only)
3. User exports return → Data converted to MeF XML/JSON, downloaded
4. User exits → All session data cleared (no persistence)

### Export Metadata (Persisted)
1. User exports return → Metadata (filename, date, format) stored in database
2. NO PII or FTI stored → Only metadata for user's export history
3. User can view export history → Lists filenames and dates only

## Security Considerations

### No PII/FTI Storage
- ✅ All tax return data processed in browser session only
- ✅ No database persistence of PII or FTI
- ✅ Only export metadata stored (filename, date, format)
- ✅ Session data cleared on component unmount
- ✅ Session data cleared on page unload

### Session Management
- Uses `useDirectFileSession` hook for ephemeral session
- Clears all Direct File related storage on unmount
- No localStorage or sessionStorage for PII/FTI

### API Security
- All routes require authentication (Clerk)
- Input validation on all endpoints
- HTTPS enforced in production
- CSRF protection via Next.js

See [Security Checklist](./irs-direct-file-security-checklist.md) for complete details.

## Setup Instructions

### Prerequisites

1. **IRS Direct File Repository**: Source code copied to `lib/irs-direct-file/`
2. **Node.js**: Version 18.20.4 (as required by Direct File)
3. **Backend Services**: Direct File requires Java Spring Boot backend services
4. **Database**: PostgreSQL for Direct File backend (separate from Financbase DB)
5. **Fact Graph**: Scala fact graph needs to be compiled to JavaScript

### Environment Variables

The Direct File integration requires several environment variables. See the IRS Direct File `ONBOARDING.md` for complete list.

Key variables:
- `VITE_PUBLIC_PATH` - Public path for Direct File app
- `VITE_ALLOW_LOADING_TEST_DATA` - Enable test data loading
- Backend API URLs
- Database connection strings

### Backend Setup

The Direct File application requires several backend services:

1. **Backend API** (`/direct-file/backend`) - Main API service
2. **State API** (`/direct-file/state-api`) - State tax filing handoff
3. **Email Service** (`/direct-file/email-service`) - Email notifications
4. **Submit Service** (`/direct-file/submit`) - MeF submission
5. **Status Service** (`/direct-file/status`) - MeF status polling

These services need to be running for the full Direct File functionality.

### Fact Graph Compilation

The fact graph is written in Scala and needs to be compiled to JavaScript:

```bash
cd lib/irs-direct-file/fact-graph-scala
sbt fastOptJS
```

Then copy the compiled JavaScript to the client app.

### Integration Steps

1. **Copy Source Code**: ✅ Completed - Source in `lib/irs-direct-file/`
2. **Create Wrapper Components**: ✅ Completed
3. **Set Up Routing**: ✅ Completed - Route at `/tax/direct-file`
4. **Implement Session Management**: ✅ Completed
5. **Add Disclosures**: ✅ Completed
6. **Set Up Backend Services**: ⏳ Pending
7. **Compile Fact Graph**: ⏳ Pending
8. **Adapt Routing**: ⏳ Pending (BrowserRouter → MemoryRouter)
9. **Configure Environment**: ⏳ Pending

## Current Status

### ✅ Completed
- Repository cloned and analyzed
- Integration architecture designed
- Wrapper components created
- Session management implemented
- Legal disclosures added
- Export functionality structure created
- Route created and integrated
- Database schema for export metadata
- API endpoints for export metadata
- Security review checklist

### ⏳ In Progress
- Full Direct File app integration
- Backend services setup
- Fact graph compilation
- Routing adapter (BrowserRouter → MemoryRouter)

### 📋 Pending
- Mock data setup
- Testing
- Production deployment

## Usage

### For Users

1. Navigate to **Tax Management** page
2. Click **"File Federal Taxes"** button
3. Read and acknowledge disclosures
4. Complete the interview-based tax filing
5. Export return in MeF XML or JSON format
6. File directly with IRS (not through Financbase)

### For Developers

#### Adding Export Metadata

```typescript
import { storeExportMetadata } from "@/lib/services/direct-file-service";

await storeExportMetadata({
  userId: user.id,
  filename: "tax-return-2024.xml",
  format: "mef-xml",
  fileSize: 12345,
});
```

#### Accessing Export History

```typescript
import { getExportHistory } from "@/lib/services/direct-file-service";

const exports = await getExportHistory(userId);
// Returns metadata only (no PII/FTI)
```

## Limitations

1. **Federal Only**: State filing not included
2. **Self-Service**: No tax advice or filing on behalf of users
3. **Individual Users**: Business filing not supported
4. **No EIN/EFIN Required**: Direct user filing only
5. **Backend Required**: Full functionality requires Direct File backend services

## Troubleshooting

### Direct File App Not Loading

1. Check browser console for errors
2. Verify environment variables are set
3. Check that backend services are running
4. Verify fact graph is compiled

### Session Data Not Clearing

1. Check `useDirectFileSession` hook is being used
2. Verify cleanup function is called on unmount
3. Check browser storage manually

### Export Not Working

1. Verify API endpoint is accessible
2. Check authentication is working
3. Verify database schema is migrated

## Future Enhancements

1. **Full Backend Integration**: Complete Direct File backend setup
2. **State Filing Handoff**: Integrate state API for state tax filing
3. **Export History UI**: Show user's export history
4. **Progress Saving**: Allow users to save progress (with encryption)
5. **Multi-Year Support**: Support multiple tax years

## References

- [IRS Direct File Repository](https://github.com/IRS-Public/direct-file)
- [IRS Direct File ONBOARDING.md](https://github.com/IRS-Public/direct-file/blob/main/ONBOARDING.md)
- [Security Checklist](./irs-direct-file-security-checklist.md)
- [IRS Direct File License](https://github.com/IRS-Public/direct-file/blob/main/LICENSE)

## Support

For issues or questions:
1. Check this documentation
2. Review security checklist
3. Consult IRS Direct File repository documentation
4. Contact development team

---

**Last Updated**: 2025-01-28
**Version**: 1.0.0

