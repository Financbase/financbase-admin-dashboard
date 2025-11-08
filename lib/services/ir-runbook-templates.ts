/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

/**
 * Default IR Runbook Templates
 * These can be used to seed the database with standard incident response procedures
 */

export const defaultRunbooks = [
  {
    name: 'Data Breach Response',
    description: 'Standard procedures for responding to data breaches',
    incidentType: 'data_breach' as const,
    severity: 'critical' as const,
    detectionProcedures: [
      'Monitor security alerts and SIEM logs',
      'Review data access logs for unusual patterns',
      'Check for unauthorized database access',
      'Review system logs for suspicious activity',
    ],
    triageProcedures: [
      'Immediately assess scope of breach',
      'Identify affected data types and records',
      'Determine if breach is ongoing',
      'Assess regulatory reporting requirements',
      'Notify incident coordinator',
    ],
    containmentProcedures: [
      'Isolate affected systems',
      'Revoke compromised credentials',
      'Block malicious IP addresses',
      'Disable affected user accounts',
      'Preserve evidence for forensics',
    ],
    eradicationProcedures: [
      'Remove malware or unauthorized access',
      'Patch vulnerabilities',
      'Update security controls',
      'Verify system integrity',
    ],
    recoveryProcedures: [
      'Restore systems from clean backups',
      'Reset all affected credentials',
      'Monitor for continued threats',
      'Validate system functionality',
    ],
    communicationTemplates: {
      internal: {
        subject: 'Security Incident - Action Required',
        body: 'A security incident has been detected. Please follow instructions from the incident response team.',
      },
      external: {
        subject: 'Security Notice',
        body: 'We have detected a security incident and are taking immediate action to protect your data.',
      },
      regulatory: {
        subject: 'Data Breach Notification',
        body: 'This notification is required under applicable data protection regulations.',
      },
    },
    escalationCriteria: [
      { condition: 'severity === "critical"', action: 'Immediately notify executive sponsor' },
      { condition: 'affectedUsers > 1000', action: 'Escalate to legal counsel' },
      { condition: 'regulatoryReporting.required === true', action: 'Notify compliance officer' },
    ],
    escalationContacts: [
      { role: 'incident_coordinator', priority: 1 },
      { role: 'executive_sponsor', priority: 2 },
      { role: 'legal_counsel', priority: 3 },
    ],
    tools: ['SIEM', 'Forensics tools', 'Log analysis', 'Network monitoring'],
    references: ['GDPR Article 33', 'State breach notification laws', 'Internal security policy'],
  },
  {
    name: 'Unauthorized Access Response',
    description: 'Procedures for responding to unauthorized access attempts',
    incidentType: 'unauthorized_access' as const,
    severity: 'high' as const,
    detectionProcedures: [
      'Monitor failed login attempts',
      'Review access logs for unusual patterns',
      'Check for privilege escalation attempts',
      'Monitor for suspicious API calls',
    ],
    triageProcedures: [
      'Identify source of unauthorized access',
      'Determine scope of access',
      'Assess what data or systems were accessed',
      'Check if access is still active',
    ],
    containmentProcedures: [
      'Immediately revoke access',
      'Disable compromised accounts',
      'Block source IP addresses',
      'Change affected credentials',
    ],
    eradicationProcedures: [
      'Remove unauthorized access points',
      'Patch security vulnerabilities',
      'Update access controls',
    ],
    recoveryProcedures: [
      'Restore normal access controls',
      'Monitor for continued attempts',
      'Review and update security policies',
    ],
    communicationTemplates: {
      internal: {
        subject: 'Unauthorized Access Detected',
        body: 'An unauthorized access attempt has been detected and contained.',
      },
    },
    escalationCriteria: [
      { condition: 'severity === "critical"', action: 'Notify security team immediately' },
    ],
    escalationContacts: [
      { role: 'security_analyst', priority: 1 },
      { role: 'incident_coordinator', priority: 2 },
    ],
    tools: ['Access logs', 'Authentication system', 'Network monitoring'],
    references: ['Access control policy', 'Security monitoring procedures'],
  },
  {
    name: 'System Outage Response',
    description: 'Procedures for responding to system outages',
    incidentType: 'system_outage' as const,
    severity: 'high' as const,
    detectionProcedures: [
      'Monitor system health metrics',
      'Review application logs',
      'Check infrastructure status',
      'Monitor user reports',
    ],
    triageProcedures: [
      'Identify affected systems',
      'Determine root cause',
      'Assess business impact',
      'Estimate recovery time',
    ],
    containmentProcedures: [
      'Isolate affected systems',
      'Prevent cascading failures',
      'Activate backup systems if available',
    ],
    eradicationProcedures: [
      'Fix root cause',
      'Apply necessary patches or fixes',
      'Verify system stability',
    ],
    recoveryProcedures: [
      'Restore services gradually',
      'Monitor system health',
      'Validate functionality',
      'Communicate status updates',
    ],
    communicationTemplates: {
      internal: {
        subject: 'System Outage - Recovery in Progress',
        body: 'We are experiencing a system outage and are working to restore services.',
      },
      external: {
        subject: 'Service Interruption Notice',
        body: 'We are currently experiencing technical difficulties. Services will be restored as soon as possible.',
      },
    },
    escalationCriteria: [
      { condition: 'duration > 60 minutes', action: 'Escalate to technical lead' },
      { condition: 'affectedUsers > 10000', action: 'Notify executive sponsor' },
    ],
    escalationContacts: [
      { role: 'technical_lead', priority: 1 },
      { role: 'incident_coordinator', priority: 2 },
    ],
    tools: ['Monitoring systems', 'Infrastructure management', 'Backup systems'],
    references: ['Business continuity plan', 'Disaster recovery procedures'],
  },
];

export const defaultProcedures = [
  {
    title: 'Incident Response Policy',
    procedureType: 'policy',
    category: 'response',
    content: `
# Incident Response Policy

## Purpose
This policy establishes the framework for responding to security incidents in a timely and effective manner.

## Scope
This policy applies to all security incidents affecting organizational systems, data, or operations.

## Responsibilities
- **Incident Coordinator**: Overall responsibility for incident response
- **Security Team**: Technical investigation and containment
- **Legal Counsel**: Regulatory compliance and legal considerations
- **Executive Sponsor**: Strategic decisions and external communications

## Incident Classification
Incidents are classified by severity:
- **Critical**: Immediate threat to operations or data
- **High**: Significant impact requiring urgent response
- **Medium**: Moderate impact requiring timely response
- **Low**: Minimal impact, standard response

## Response Phases
1. **Detection**: Identify and report incidents
2. **Triage**: Assess severity and assign resources
3. **Containment**: Limit impact and prevent escalation
4. **Eradication**: Remove threat and vulnerabilities
5. **Recovery**: Restore normal operations
6. **Post-Mortem**: Review and improve processes

## Reporting Requirements
- Critical incidents: Immediate notification
- High severity: Within 1 hour
- Medium severity: Within 4 hours
- Low severity: Within 24 hours

## Review Cycle
This policy is reviewed annually and updated as needed.
    `,
    reviewFrequency: 'annually',
  },
  {
    title: 'Incident Detection Procedures',
    procedureType: 'procedure',
    category: 'detection',
    content: `
# Incident Detection Procedures

## Monitoring Sources
- Security Information and Event Management (SIEM)
- Application logs
- Network monitoring
- User reports
- Automated alerts

## Detection Indicators
- Unusual login patterns
- Unauthorized access attempts
- System anomalies
- Performance degradation
- Data exfiltration patterns

## Reporting Process
1. Document initial observations
2. Collect relevant logs and evidence
3. Report through incident management system
4. Assign initial severity assessment
    `,
    reviewFrequency: 'quarterly',
  },
  {
    title: 'Communication Templates',
    procedureType: 'template',
    category: 'communication',
    content: `
# Incident Communication Templates

## Internal Notification
Subject: Security Incident - [Severity] - [Incident Number]

A security incident has been detected:
- Type: [Incident Type]
- Severity: [Severity]
- Status: [Current Status]
- Affected Systems: [List]

The incident response team is actively working on containment and resolution.

## External Notification (if required)
Subject: Security Notice

We have detected a security incident affecting our systems. We are taking immediate action to protect your data and will provide updates as the situation develops.

## Regulatory Notification
Subject: Data Breach Notification - [Regulation]

This notification is provided in accordance with [Regulation Name]. A data breach has been detected and we are taking required actions.
    `,
    reviewFrequency: 'annually',
  },
];

