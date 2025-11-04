# External Resources and Links

This document maps external resources referenced in the documentation and provides local alternatives when those resources are not yet available.

## Documentation Sites

### docs.financbase.com

**Status**: Not yet deployed  
**Local Alternative**: This documentation (`/docs` directory)

- **API Documentation**: See [API Documentation](./api/README.md)
- **Components**: See [Architecture Documentation](./architecture/README.md)
- **Deployment**: See [Deployment Documentation](./deployment/README.md)
- **General**: See [Documentation Index](./README.md)

### help.financbase.com

**Status**: Not yet deployed  
**Local Alternative**: See [User Guides](./user-guides/) and [User Training](./user-training/)

### developers.financbase.com

**Status**: Not yet deployed  
**Local Alternative**: See [Developer Documentation](./developer/) and [Developer Guide](./developer-guide/)

### status.financbase.com

**Status**: Not yet deployed  
**Alternative**: [System Status Page](/status) - Real-time status monitoring with health check integration

## GitHub Repositories

### github.com/financbase/financbase-admin-dashboard

**Status**: Repository not yet created  
**Local Alternative**: This codebase

- **Issues**: Use internal issue tracking system
- **Discussions**: Use internal team communication channels

### github.com/financbase/sdk

**Status**: Repository not yet created  
**Local Alternative**: See [API Integration Guide](./developer/api-integration.md)

The SDK will be available when the repository is created. For now, use direct API integration.

### github.com/financbase/plugin-examples

**Status**: Repository not yet created  
**Local Alternative**: See [Plugin Development Guide](./developer/plugin-development.md)

Plugin examples will be available when the repository is created. For now, refer to the plugin development documentation.

## Product Pages

### app.financbase.com

**Status**: Not yet deployed  
**Local Alternative**: Local development at `http://localhost:3000`

### financbase.com/enterprise

**Status**: ✅ **IMPLEMENTED**  
**Local Alternative**: [Enterprise Solutions Page](/enterprise) - Enterprise features, pricing, and sales contact form

### financbase.com/consulting

**Status**: ✅ **IMPLEMENTED**  
**Local Alternative**: [Consulting Services Page](/consulting) - Consulting services, offerings, and contact form

### financbase.com/training

**Status**: ✅ **IMPLEMENTED**  
**Local Alternative**: [Training Programs Page](/training) - Comprehensive training materials and learning paths

## API Documentation

### api.financbase.com/docs

**Status**: ✅ **IMPLEMENTED**  
**Local Alternative**: [API Documentation Page](/docs/api) - Interactive API documentation with OpenAPI spec integration

## External Documentation Links

### Next.js Documentation

- **Link**: https://nextjs.org/docs/app/building-your-application/routing/error-handling
- **Status**: Valid external link
- **Note**: This is a working external resource

## Local Development

### localhost:3000

**Status**: Local development server  
**Usage**: Run `npm run dev` to start local development server

## Implementation Status

### ✅ Implemented Pages

The following pages have been implemented and are available:

- **Enterprise Solutions** - `/enterprise` - Full enterprise page with features, benefits, and sales contact form
- **Consulting Services** - `/consulting` - Consulting services page with offerings and contact form
- **Training Programs** - `/training` - Comprehensive training programs and learning paths
- **System Status** - `/status` - Real-time system status with health check integration
- **API Documentation** - `/docs/api` - Interactive API documentation with OpenAPI spec links

### 📝 Still Pending

- Documentation sites (docs.financbase.com, help.financbase.com, developers.financbase.com) - Use local documentation
- GitHub repositories (financbase-admin-dashboard, sdk, plugin-examples) - Use local documentation
- External domain deployments (app.financbase.com, status.financbase.com) - Use localhost or implemented pages

## Notes

- Pages marked with ✅ **IMPLEMENTED** are fully functional and available
- External resources marked as "Not yet deployed" will be available in the future
- Use local documentation as alternatives until external resources are available
- Update this document when external resources become available
- Remove references from skip lists in link checker when resources are deployed

## Updating References

When external resources become available:

1. Update this document with the actual URLs
2. Update links in documentation files
3. Remove domains from skip list in `scripts/check-external-links.js`
4. Run link checker to verify all links work

