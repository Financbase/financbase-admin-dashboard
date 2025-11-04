# API Version Status

This document tracks the status and lifecycle of all API versions.

## Current Versions

### v1 (Stable) - Recommended for Production

**Status**: ✅ Stable  
**Release Date**: 2024-01-01  
**Deprecation Date**: TBD  
**Sunset Date**: TBD

**Description**: Stable API version recommended for production use. All endpoints are fully supported and maintained.

**Features:**

- Complete RESTful API coverage
- Comprehensive error handling
- Rate limiting support
- Webhook support
- Full documentation

**Migration Notes**: None - this is the current stable version.

### v2 (Beta) - Next Generation

**Status**: 🧪 Beta  
**Release Date**: 2024-12-01  
**Deprecation Date**: TBD  
**Sunset Date**: TBD

**Description**: Next-generation API with improved features and performance. Currently in beta testing.

**Features:**

- Enhanced performance
- Improved error handling
- Additional endpoints
- Better pagination support
- Enhanced webhook system

**Migration Notes**:

- v2 is backward compatible with v1 for most endpoints
- New features available only in v2
- Check migration guide before upgrading

## Version Lifecycle

### Version States

1. **Development** - In active development, not yet available
2. **Beta** - Available for testing, may have breaking changes
3. **Stable** - Production-ready, recommended for use
4. **Deprecated** - Still supported but will be sunset
5. **Sunset** - No longer available

### Version Support Policy

- **Stable Versions**: Fully supported, security updates, bug fixes
- **Deprecated Versions**: Security updates only, no new features
- **Beta Versions**: Best effort support, may have breaking changes
- **Sunset Versions**: No support, requests will fail

## Version Headers

All API responses include version information in headers:

```text
X-API-Version: v1
X-API-Deprecated: false
X-API-Deprecated-Version: null
Sunset: null
```

### Deprecated Version Warnings

When using a deprecated version, responses include:

```text
X-API-Deprecated: true
X-API-Deprecated-Version: v1
Sunset: 2025-06-01
Warning: 299 - "Using deprecated API version. Migrate to v2 before 2025-06-01"
Link: <https://api.financbase.com/api/v2>; rel="successor-version"
```

## Migration Guide

### From v1 to v2

1. **Update Base URL**

   ```javascript
   // Old
   const baseUrl = 'https://api.financbase.com/api/v1';
   
   // New
   const baseUrl = 'https://api.financbase.com/api/v2';
   ```

2. **Check Breaking Changes**
   - Review changelog for breaking changes
   - Test all endpoints in staging environment
   - Update error handling if needed

3. **Update Client Libraries**
   - Use latest SDK version
   - Check for new features and improvements

## Version Endpoints

### Health Check

```bash
# v1
curl https://api.financbase.com/api/v1/health

# v2
curl https://api.financbase.com/api/v2/health
```

### Version Information

All endpoints accept version in URL path:

- `/api/v1/*` - Version 1
- `/api/v2/*` - Version 2

## Deprecation Timeline

### v1 Deprecation Schedule

- **Announced**: TBD
- **Deprecation Date**: TBD (6 months after announcement)
- **Sunset Date**: TBD (12 months after deprecation)

Users will receive:

- 6 months notice before deprecation
- 12 months notice before sunset
- Migration guides and support

## Best Practices

1. **Use Latest Stable Version**
   - Always use the latest stable version for new projects
   - Check version status regularly

2. **Monitor Deprecation Warnings**
   - Check response headers for deprecation warnings
   - Plan migration before sunset date

3. **Test Version Updates**
   - Test in staging environment first
   - Review changelog for breaking changes
   - Update client libraries

4. **Stay Updated**
   - Subscribe to API changelog
   - Monitor version status page
   - Follow migration guides

## Related Documentation

- [API Versioning Guide](./API_VERSIONING.md) - Versioning implementation
- [API Documentation](./README.md) - Complete API reference
- [Migration Guide](./API_VERSIONING.md#migration) - Version migration instructions
