# Infrastructure Setup Guide

This guide covers the setup and verification of critical infrastructure components for the Financbase Admin Dashboard.

## Table of Contents

1. [PartyKit WebSocket Setup (Cloudflare)](#partykit-websocket-setup-cloudflare)
2. [Cloudflare R2 File Storage Setup](#cloudflare-r2-file-storage-setup)
3. [Verification Checklist](#verification-checklist)

---

## PartyKit WebSocket Setup (Cloudflare)

PartyKit is used for real-time collaboration, notifications, and WebSocket connections throughout the application.

### Prerequisites

- Cloudflare account with PartyKit enabled
- Node.js installed (for deploying PartyKit server)

### Setup Steps

1. **Install PartyKit CLI** (if not already installed):
   ```bash
   npm install -g partykit
   ```

2. **Deploy PartyKit Server**:
   ```bash
   npx partykit deploy
   ```

3. **Get Your PartyKit Host URL**:
   - After deployment, PartyKit will provide a URL like: `your-project.your-subdomain.partykit.dev`
   - Or check your Cloudflare dashboard for the PartyKit deployment URL

4. **Configure Environment Variables**:
   Add to your `.env.local` or production environment:
   ```env
   NEXT_PUBLIC_PARTYKIT_HOST=your-project.your-subdomain.partykit.dev
   PARTYKIT_SECRET=your-partykit-secret-token  # Optional, for authenticated API calls
   PARTYKIT_ROOM_ID=financbase-main  # Optional, default room ID
   ```

5. **Verify Server File**:
   - Server implementation: `partykit/server.ts`
   - Configuration: `partykit.json`
   - Party name: `financbase-partykit`

### Features Enabled

- Real-time collaboration (`contexts/collaboration-context.tsx`)
- WebSocket connections (`contexts/websocket-context.tsx`)
- Real-time notifications (`lib/services/notification-service.ts`)
- Live presence indicators
- Real-time messaging and chat

### URL Format

- **WebSocket**: `wss://your-host/parties/financbase-partykit/room-id`
- **HTTP API**: `https://your-host/parties/financbase-partykit/room-id`

### Local Development

For local development, use:
```env
NEXT_PUBLIC_PARTYKIT_HOST=localhost:1999
```

Then run:
```bash
npx partykit dev
```

---

## Cloudflare R2 File Storage Setup

Cloudflare R2 is used for file uploads, audio recordings, document storage, and proposal documents.

### Prerequisites

- Cloudflare account with R2 enabled
- R2 bucket created
- R2 API token generated

### Setup Steps

1. **Create R2 Bucket**:
   - Go to Cloudflare Dashboard → R2 → Create bucket
   - Recommended bucket name: `cms-admin-files`

2. **Generate R2 API Token**:
   - Go to Cloudflare Dashboard → R2 → Manage R2 API Tokens
   - Click "Create API Token"
   - Grant read/write permissions
   - Save the Access Key ID and Secret Access Key

3. **Get Your Cloudflare Account ID**:
   - Found in Cloudflare Dashboard → Right sidebar → Account ID

4. **Configure Environment Variables**:
   Add to your `.env.local` or production environment:
   ```env
   # Required
   CLOUDFLARE_ACCOUNT_ID=your-account-id
   R2_ACCESS_KEY_ID=your-r2-access-key-id
   R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
   R2_BUCKET=cms-admin-files

   # Optional
   R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
   R2_PUBLIC_DOMAIN=https://cdn.financbase.com  # For CDN-cached public URLs
   ```

### Features Using R2

1. **Data Bank File Storage** (`lib/services/integration/data-bank-service.ts`)
   - File uploads
   - File retrieval
   - File deletion

2. **Audio Recording Storage** (`lib/services/business/audio-recording.service.ts`)
   - Presigned URL generation for audio uploads
   - Audio file storage

3. **Proposal Document Storage** (`lib/services/marketing/proposal-document.service.ts`)
   - Document uploads
   - Document deletion

4. **Bill Pay Document Processing** (`lib/services/bill-pay/bill-pay-service.ts`)
   - Invoice/receipt storage
   - Document processing

### Storage Structure

Files are organized in the following structure:
```
R2_BUCKET/
├── data-bank/
│   └── {organizationId}/
│       └── {timestamp}-{random}-{filename}
├── audio-recordings/
│   └── {userId}/
│       └── {timestamp}-{filename}
├── proposal-documents/
│   └── {userId}/
│       └── {documentId}-{filename}
└── document-processing/
    └── {userId}/
        └── {documentId}-{filename}
```

### Public URL Configuration (Optional)

If you want to serve files via a CDN:

1. **Create Custom Domain**:
   - Go to R2 bucket → Settings → Custom Domain
   - Add your custom domain (e.g., `cdn.financbase.com`)
   - Configure DNS records as instructed

2. **Set Environment Variable**:
   ```env
   R2_PUBLIC_DOMAIN=https://cdn.financbase.com
   ```

---

## Verification Checklist

### PartyKit Verification

- [ ] PartyKit server deployed to Cloudflare
- [ ] `NEXT_PUBLIC_PARTYKIT_HOST` environment variable set
- [ ] WebSocket connections work (check browser console)
- [ ] Real-time notifications are received
- [ ] Collaboration features function correctly

**Test PartyKit Connection:**
1. Open browser console
2. Navigate to a page using WebSocket (e.g., collaboration page)
3. Look for: `"Connecting to PartyKit: wss://..."`
4. Should see: `"Connected to collaboration server"`

### R2 Storage Verification

- [ ] R2 bucket created
- [ ] R2 API token generated
- [ ] All R2 environment variables set
- [ ] File uploads work
- [ ] File retrieval works
- [ ] File deletion works

**Test R2 Storage:**
1. Upload a file through the application
2. Check R2 bucket in Cloudflare dashboard - file should appear
3. Retrieve the file - should download successfully
4. Delete the file - should be removed from bucket

### Environment Variables Checklist

```env
# PartyKit
NEXT_PUBLIC_PARTYKIT_HOST=your-project.your-subdomain.partykit.dev

# R2 Storage
CLOUDFLARE_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET=cms-admin-files
```

### Code Locations

**PartyKit:**
- Server: `partykit/server.ts`
- Client: `contexts/websocket-context.tsx`
- Collaboration: `contexts/collaboration-context.tsx`
- Notifications: `lib/services/notification-service.ts`

**R2 Storage:**
- Data Bank: `lib/services/integration/data-bank-service.ts`
- Audio Recording: `lib/services/business/audio-recording.service.ts`
- Proposal Documents: `lib/services/marketing/proposal-document.service.ts`
- Bill Pay: `lib/services/bill-pay/bill-pay-service.ts`

---

## Troubleshooting

### PartyKit Connection Issues

**Problem**: WebSocket connection fails
- **Solution**: Verify `NEXT_PUBLIC_PARTYKIT_HOST` is correct
- **Solution**: Check that PartyKit server is deployed
- **Solution**: Ensure using `wss://` protocol for production (not `ws://`)

**Problem**: Real-time notifications not working
- **Solution**: Check `PARTYKIT_SECRET` if authentication is enabled
- **Solution**: Verify PartyKit server is running

### R2 Storage Issues

**Problem**: File upload fails
- **Solution**: Verify all R2 environment variables are set
- **Solution**: Check R2 API token has write permissions
- **Solution**: Verify bucket name matches `R2_BUCKET`

**Problem**: File deletion fails
- **Solution**: Check R2 API token has delete permissions
- **Solution**: Verify file key format is correct

**Problem**: Files not accessible via public URL
- **Solution**: Configure `R2_PUBLIC_DOMAIN` if using CDN
- **Solution**: Check custom domain DNS configuration

---

## Next Steps

After completing setup:

1. Test all features that use PartyKit (collaboration, notifications)
2. Test all file operations (upload, download, delete)
3. Monitor Cloudflare dashboard for usage and errors
4. Set up monitoring/alerts for both services
5. Configure backups if needed for R2 storage

---

## Support

For issues or questions:
- PartyKit Documentation: https://docs.partykit.dev
- Cloudflare R2 Documentation: https://developers.cloudflare.com/r2/
- Project Documentation: `docs/` directory

