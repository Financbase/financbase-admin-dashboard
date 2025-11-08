# IRS Direct File Integration

This directory contains the IRS Direct File open-source project integrated into Financbase.

## Attribution

**IRS Direct File** is a work of the United States Government and is in the public domain within the United States of America.

Additionally, copyright and related rights in the work worldwide are waived through the CC0 1.0 Universal public domain dedication.

- **Repository**: https://github.com/IRS-Public/direct-file
- **License**: CC0 1.0 Universal (Public Domain)
- **License File**: See [LICENSE](https://github.com/IRS-Public/direct-file/blob/main/LICENSE) in the original repository

## Source Code

The source code in this directory is copied from the IRS Direct File repository. The original codebase includes:

- **df-client/**: React/TypeScript frontend application
- **fact-graph-scala/**: Scala-based fact graph logic (needs compilation to JavaScript)
- **backend/**: Java Spring Boot backend services
- **state-api/**: State tax filing handoff API
- **submit/**: MeF submission service
- **status/**: MeF status polling service
- **email-service/**: Email notification service

## Integration Status

This integration is currently in progress. The following components are implemented:

- ✅ Wrapper components for embedding Direct File
- ✅ Session management (ephemeral, no PII/FTI storage)
- ✅ Legal disclosures
- ✅ Export functionality structure
- ⏳ Full app integration (requires backend setup)
- ⏳ Fact graph compilation
- ⏳ Routing adapter

## Important Notes

1. **No PII/FTI Storage**: This integration does not store any Personally Identifiable Information (PII) or Federal Tax Information (FTI) on Financbase servers.

2. **Direct Filing**: Users file directly with the IRS. Financbase does not submit returns on behalf of users.

3. **No Tax Advice**: Financbase does not provide tax advice or recommendations.

4. **Backend Required**: Full functionality requires the Direct File backend services to be running.

## Setup

See [docs/integrations/irs-direct-file.md](../../docs/integrations/irs-direct-file.md) for complete setup instructions.

## License

As a work of the United States government, this project is in the public domain within the United States of America.

Additionally, we waive copyright and related rights in the work worldwide through the CC0 1.0 Universal public domain dedication.

You can copy, modify, distribute, and perform the work, even for commercial purposes, all without asking permission.

---

**Original Repository**: https://github.com/IRS-Public/direct-file
**Original License**: CC0 1.0 Universal

