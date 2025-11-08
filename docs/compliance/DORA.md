# DORA Compliance

## Overview

The Digital Operational Resilience Act (DORA) is a European Union regulation that came into effect on January 17, 2025. It requires financial entities and their ICT service providers to implement robust digital operational resilience measures.

## Implementation

### Features

1. **ICT Incident Reporting**
   - Track and report ICT incidents per DORA requirements
   - Classify incidents by severity (low, medium, high, critical)
   - Monitor incident lifecycle (detected → investigating → contained → resolved → closed)
   - Report to authorities when required

2. **Resilience Testing**
   - Schedule and manage resilience tests
   - Track test results and vulnerabilities
   - Support multiple test types:
     - Vulnerability assessments
     - Penetration tests
     - Load tests
     - Disaster recovery tests
     - Business continuity tests
     - Threat-led penetration tests

3. **Third-Party Risk Management**
   - Assess third-party ICT service provider risks
   - Track compliance certifications
   - Monitor security assessments
   - Manage contracts and agreements

### API Endpoints

#### Incidents
- `POST /api/compliance/dora/incidents` - Report new ICT incident
- `GET /api/compliance/dora/incidents` - List incidents
- `GET /api/compliance/dora/incidents/[id]` - Get incident details
- `PATCH /api/compliance/dora/incidents/[id]` - Update incident status

#### Resilience Tests
- `POST /api/compliance/dora/resilience-tests` - Schedule resilience test
- `GET /api/compliance/dora/resilience-tests` - List tests
- `GET /api/compliance/dora/resilience-tests/[id]` - Get test details
- `PATCH /api/compliance/dora/resilience-tests/[id]` - Update test

#### Third-Party Risks
- `POST /api/compliance/dora/third-party-risks` - Create risk assessment
- `GET /api/compliance/dora/third-party-risks` - List assessments
- `GET /api/compliance/dora/third-party-risks/[id]` - Get assessment details
- `PATCH /api/compliance/dora/third-party-risks/[id]` - Update assessment

### Usage

```typescript
import { DORAComplianceService } from '@/lib/services/dora-compliance-service';

// Report an incident
const incident = await DORAComplianceService.reportICTIncident(orgId, {
  incidentTitle: 'System Outage',
  incidentDescription: 'Database server unavailable',
  incidentType: 'system_outage',
  severity: 'high',
  affectedSystems: ['database-server-01'],
  affectedServices: ['api', 'dashboard'],
});

// Schedule a resilience test
const test = await DORAComplianceService.scheduleResilienceTest(orgId, {
  testName: 'Q1 Penetration Test',
  testType: 'penetration_test',
  scheduledDate: new Date('2025-12-01'),
  criticalFunctions: ['payment-processing', 'data-storage'],
});

// Assess third-party risk
const risk = await DORAComplianceService.assessThirdPartyRisk(orgId, {
  providerName: 'Cloud Provider Inc',
  providerType: 'cloud_service',
  riskLevel: 'medium',
  servicesProvided: ['hosting', 'storage'],
  criticalServices: ['hosting'],
});
```

### Compliance Reporting

Generate DORA compliance reports:

```typescript
import { ComplianceService } from '@/lib/services/compliance-service';

const report = await ComplianceService.generateDORAReport(orgId, userId, {
  dateFrom: new Date('2025-01-01'),
  dateTo: new Date('2025-12-31'),
});
```

## Requirements

- Annual resilience testing
- Threat-led penetration testing for critical functions
- ICT incident classification and reporting
- Third-party ICT risk management
- Operational resilience monitoring

## Monitoring

Use the compliance monitoring service to track DORA compliance:

```typescript
import { ComplianceMonitoringService } from '@/lib/services/compliance-monitoring-service';

const alerts = await ComplianceMonitoringService.monitorDORACompliance(orgId);
const resilience = await DORAComplianceService.trackOperationalResilience(orgId);
```

