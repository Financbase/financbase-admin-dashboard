# State Privacy Laws Compliance

## Overview

Support for state-specific privacy laws including CPRA (California), CCPA, VCDPA (Virginia), CTDPA (Connecticut), CDPA (Colorado), UCPA (Utah), and others.

## Supported State Laws

- **CPRA** (California Privacy Rights Act)
- **CCPA** (California Consumer Privacy Act)
- **VCDPA** (Virginia Consumer Data Protection Act)
- **CTDPA** (Connecticut Data Privacy Act)
- **CDPA** (Colorado Privacy Act)
- **UCPA** (Utah Consumer Privacy Act)
- **TDPA** (Texas Data Privacy Act)
- **MCDPA** (Montana Consumer Data Privacy Act)
- **IDPA** (Iowa Data Privacy Act)
- **TDPA Tennessee** (Tennessee Data Privacy Act)
- **ODPA** (Oregon Data Privacy Act)

## Features

### 1. Compliance Assessment
- Automated compliance checking for each state law
- Track compliance scores and requirements
- Identify compliance gaps

### 2. Data Subject Rights
- Support for state-specific data subject rights:
  - Right to access
  - Right to delete
  - Right to correct
  - Right to opt-out
  - Right to portability
  - Right to non-discrimination

### 3. Consent Management
- Track consent for data processing
- Manage consent preferences
- Support opt-in/opt-out mechanisms

### 4. Breach Notification
- Track breach notification processes
- Monitor notification timelines
- Ensure timely reporting

## API Endpoints

### State Privacy Compliance
- `GET /api/compliance/state-privacy` - Get compliance records
- `POST /api/compliance/state-privacy/check` - Perform compliance check

## Usage

### Check CPRA Compliance

```typescript
import { StatePrivacyService } from '@/lib/services/state-privacy-service';

const compliance = await StatePrivacyService.checkCPRACompliance(orgId);
```

### Check Any State Law

```typescript
const compliance = await StatePrivacyService.checkStatePrivacyLaws(orgId, 'vcdpa');
```

### Get Compliance Records

```typescript
const records = await StatePrivacyService.getStatePrivacyCompliance(orgId);
// Or for a specific state
const caRecord = await StatePrivacyService.getStatePrivacyCompliance(orgId, 'cpra');
```

### Generate Compliance Report

```typescript
const report = await StatePrivacyService.generateStateComplianceReport(orgId);
// Or for a specific state
const caReport = await StatePrivacyService.generateStateComplianceReport(orgId, 'cpra');
```

## Compliance Reporting

Generate state privacy compliance reports:

```typescript
import { ComplianceService } from '@/lib/services/compliance-service';

const report = await ComplianceService.generateStatePrivacyReport(orgId, userId, {
  stateLaw: 'cpra', // optional, omit for all states
});
```

## Monitoring

Monitor state privacy compliance:

```typescript
import { ComplianceMonitoringService } from '@/lib/services/compliance-monitoring-service';

const alerts = await ComplianceMonitoringService.monitorDataPrivacy(orgId);
```

## Requirements by State

### CPRA (California)
- Right to know
- Right to delete
- Right to correct
- Right to opt-out
- Right to limit
- Right to non-discrimination
- Right to portability
- Opt-in for minors
- Do not sell my data
- Sensitive personal information protection

### VCDPA (Virginia)
- Right to access
- Right to delete
- Right to correct
- Right to opt-out
- Right to portability
- Right to non-discrimination

### Other States
Similar requirements with variations in implementation details.

## Best Practices

1. **Regular assessments**: Perform compliance assessments quarterly
2. **Track requirements**: Monitor which requirements are met vs pending
3. **Update policies**: Keep privacy policies up to date
4. **Automate checks**: Use automated compliance checking
5. **Document actions**: Track remediation plans and action items

