# IRS Direct File Integration - Quick Start

## ✅ What's Been Completed

All client-side integration is complete! The following is ready:

- ✅ Development tools installed (Java 21, Maven, Scala, SBT, Coursier)
- ✅ Fact graph compiled and integrated
- ✅ Client app dependencies installed
- ✅ Database schema created in Neon
- ✅ API proxy routes configured
- ✅ Integration components (wrapper, disclosures, session management)
- ✅ Utility scripts created
- ✅ Comprehensive documentation

## 🚀 Quick Start

### 1. Verify Setup
```bash
npm run direct-file:health
```

### 2. Set Up Environment
```bash
# Source environment setup
source scripts/setup-direct-file-env.sh

# Add to .env.local:
# DIRECT_FILE_API_URL=http://localhost:8080
# DIRECT_FILE_STATE_API_URL=http://localhost:8081
```

### 3. Start Services (when backend is set up)
```bash
npm run direct-file:start
```

## ⚠️ Important Note

**Backend services are not included** in this integration. To complete the setup:

1. Clone/copy the `direct-file/` directory from the IRS repository:
   - https://github.com/IRS-Public/direct-file/tree/main/direct-file

2. Place it at: `lib/irs-direct-file/direct-file/`

3. Follow the backend setup guide:
   - `docs/integrations/irs-direct-file-backend-setup.md`

## 📚 Documentation

- **Main Integration**: `docs/integrations/irs-direct-file.md`
- **Backend Setup**: `docs/integrations/irs-direct-file-backend-setup.md`
- **Security Checklist**: `docs/integrations/irs-direct-file-security-checklist.md`
- **Status**: `docs/integrations/irs-direct-file-backend-setup-status.md`

## 🎯 Current Status

- **Client-Side**: ✅ 100% Complete
- **Backend Infrastructure**: ✅ Ready (waiting for backend services)
- **Database**: ✅ Configured in Neon
- **Security**: ✅ Implemented (no PII/FTI storage)

## 🔗 Access

Once backend services are running:
- **Filing Page**: `/tax/direct-file`
- **Backend API**: Proxied through `/api/direct-file/[...path]`
- **State API**: Proxied through `/api/direct-file/state-api/[...path]`

---

For detailed setup instructions, see the documentation in `docs/integrations/`.

