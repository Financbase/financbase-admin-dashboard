/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from '@/lib/db';
import {
  siemEvents,
  siemIntegrations,
  immutableAuditTrail,
  logAggregationConfig,
} from '@/lib/db/schemas';
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';
import { createHash } from 'crypto';
import { AuditLoggingService } from '@/lib/services/security/audit-logging-service';
import { EncryptionService } from '@/lib/services/integration/encryption.service';

export interface SIEMEvent {
  id: number;
  organizationId: string;
  eventId: string;
  correlationId?: string;
  sourceEventId?: string;
  eventType: string;
  eventCategory: string;
  eventAction: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'analyzing' | 'investigating' | 'contained' | 'resolved' | 'false_positive' | 'ignored';
  sourceSystem: string;
  sourceComponent?: string;
  sourceIp?: string;
  sourceUser?: string;
  sourceHost?: string;
  targetResource?: string;
  targetType?: string;
  targetUser?: string;
  eventData: Record<string, any>;
  rawEvent?: Record<string, any>;
  normalizedEvent: Record<string, any>;
  timestamp: Date;
  receivedAt: Date;
  processedAt?: Date;
  country?: string;
  region?: string;
  city?: string;
  userAgent?: string;
  deviceType?: string;
  threatIndicators: any[];
  iocMatches: any[];
  riskScore?: number;
  isAlerted: boolean;
  alertIds: string[];
  investigationId?: number;
  complianceRelevant: boolean;
  complianceFrameworks: string[];
  retentionPeriod: number;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SIEMIntegration {
  id: number;
  organizationId: string;
  createdBy?: string;
  name: string;
  integrationType: string;
  description?: string;
  endpoint: string;
  apiKey?: string;
  apiSecret?: string;
  username?: string;
  password?: string;
  additionalConfig: Record<string, any>;
  forwardEvents: boolean;
  eventFilters: Record<string, any>;
  forwardFormat: string;
  isActive: boolean;
  isVerified: boolean;
  lastHealthCheck?: Date;
  healthStatus: string;
  lastError?: string;
  eventsForwarded: number;
  eventsFailed: number;
  lastForwardedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class SIEMIntegrationService {
  /**
   * Get encryption key from environment variable
   */
  private static getEncryptionKey(): string {
    const key = process.env.SIEM_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('SIEM_ENCRYPTION_KEY or ENCRYPTION_KEY environment variable is required for encrypting credentials');
    }
    if (!EncryptionService.validateKey(key)) {
      throw new Error('Encryption key must be a 64-character hex string');
    }
    return key;
  }

  /**
   * Encrypt sensitive credential
   */
  private static async encryptCredential(credential: string | undefined): Promise<string | undefined> {
    if (!credential) {
      return undefined;
    }
    try {
      const key = this.getEncryptionKey();
      return await EncryptionService.encrypt(credential, key);
    } catch (error) {
      console.error('[SIEMIntegration] Failed to encrypt credential:', error);
      throw error;
    }
  }

  /**
   * Decrypt sensitive credential
   */
  private static async decryptCredential(encryptedCredential: string | undefined): Promise<string | undefined> {
    if (!encryptedCredential) {
      return undefined;
    }
    try {
      const key = this.getEncryptionKey();
      return await EncryptionService.decrypt(encryptedCredential, key);
    } catch (error) {
      console.error('[SIEMIntegration] Failed to decrypt credential:', error);
      // If decryption fails, the data might not be encrypted (legacy data)
      // Return the original value as fallback
      return encryptedCredential;
    }
  }

  /**
   * Generate unique event ID
   */
  private static generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Normalize event data for SIEM
   */
  private static normalizeEvent(event: any): Record<string, any> {
    return {
      timestamp: event.timestamp || new Date().toISOString(),
      eventType: event.eventType || event.type,
      eventCategory: event.eventCategory || event.category || 'operational',
      eventAction: event.eventAction || event.action,
      severity: event.severity || 'medium',
      source: {
        system: event.sourceSystem || event.source,
        component: event.sourceComponent || event.component,
        ip: event.sourceIp || event.ipAddress,
        user: event.sourceUser || event.userId,
        host: event.sourceHost || event.hostname,
      },
      target: {
        resource: event.targetResource || event.resource,
        type: event.targetType || event.resourceType,
        user: event.targetUser,
      },
      data: event.eventData || event.data || {},
      metadata: {
        userAgent: event.userAgent,
        deviceType: event.deviceType,
        location: {
          country: event.country,
          region: event.region,
          city: event.city,
        },
      },
    };
  }

  /**
   * Calculate event hash for integrity verification
   */
  private static calculateEventHash(eventData: any): string {
    const dataString = JSON.stringify(eventData);
    return createHash('sha256').update(dataString).digest('hex');
  }

  /**
   * Ingest event into SIEM
   */
  static async ingestEvent(
    organizationId: string,
    event: {
      sourceSystem: string;
      sourceComponent?: string;
      eventType: string;
      eventCategory: string;
      eventAction: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      eventData?: Record<string, any>;
      rawEvent?: Record<string, any>;
      sourceIp?: string;
      sourceUser?: string;
      sourceHost?: string;
      targetResource?: string;
      targetType?: string;
      targetUser?: string;
      timestamp?: Date;
      country?: string;
      region?: string;
      city?: string;
      userAgent?: string;
      deviceType?: string;
      threatIndicators?: any[];
      iocMatches?: any[];
      riskScore?: number;
      complianceRelevant?: boolean;
      complianceFrameworks?: string[];
      tags?: string[];
      metadata?: Record<string, any>;
    }
  ): Promise<SIEMEvent> {
    try {
      const eventId = this.generateEventId();
      const normalizedEvent = this.normalizeEvent(event);
      const timestamp = event.timestamp || new Date();

      // Determine compliance relevance
      const complianceRelevant = event.complianceRelevant || 
        ['security', 'audit', 'data_access', 'authentication', 'authorization'].includes(event.eventCategory.toLowerCase());
      
      const complianceFrameworks = event.complianceFrameworks || 
        (complianceRelevant ? ['SOC2', 'ISO27001', 'HIPAA', 'PCI'] : []);

      const [siemEvent] = await db
        .insert(siemEvents)
        .values({
          organizationId,
          eventId,
          eventType: event.eventType,
          eventCategory: event.eventCategory,
          eventAction: event.eventAction,
          severity: event.severity,
          status: 'new',
          sourceSystem: event.sourceSystem,
          sourceComponent: event.sourceComponent,
          sourceIp: event.sourceIp,
          sourceUser: event.sourceUser,
          sourceHost: event.sourceHost,
          targetResource: event.targetResource,
          targetType: event.targetType,
          targetUser: event.targetUser,
          eventData: event.eventData || {},
          rawEvent: event.rawEvent,
          normalizedEvent,
          timestamp,
          receivedAt: new Date(),
          country: event.country,
          region: event.region,
          city: event.city,
          userAgent: event.userAgent,
          deviceType: event.deviceType,
          threatIndicators: event.threatIndicators || [],
          iocMatches: event.iocMatches || [],
          riskScore: event.riskScore,
          complianceRelevant,
          complianceFrameworks,
          retentionPeriod: 2555, // 7 years
          tags: event.tags || [],
          metadata: event.metadata || {},
        })
        .returning();

      // Store in immutable audit trail if compliance relevant
      if (complianceRelevant) {
        await this.storeImmutableAuditTrail(organizationId, siemEvent);
      }

      // Forward to external SIEM if configured
      await this.forwardToExternalSIEM(organizationId, siemEvent);

      // Process event for alerts
      await this.processEventForAlerts(organizationId, siemEvent);

      return siemEvent;
    } catch (error) {
      console.error('Error ingesting SIEM event:', error);
      throw new Error('Failed to ingest SIEM event');
    }
  }

  /**
   * Store event in immutable audit trail
   */
  private static async storeImmutableAuditTrail(
    organizationId: string,
    event: SIEMEvent
  ): Promise<void> {
    try {
      const eventData = {
        ...event,
        recordedAt: new Date(),
      };
      
      const eventHash = this.calculateEventHash(eventData);
      const retentionUntil = new Date();
      retentionUntil.setDate(retentionUntil.getDate() + event.retentionPeriod);

      await db.insert(immutableAuditTrail).values({
        organizationId,
        eventHash,
        eventId: event.eventId,
        eventType: event.eventType,
        eventData: eventData as any,
        eventMetadata: {
          severity: event.severity,
          complianceFrameworks: event.complianceFrameworks,
          sourceSystem: event.sourceSystem,
        },
        timestamp: event.timestamp,
        recordedAt: new Date(),
        complianceFrameworks: event.complianceFrameworks,
        retentionUntil,
        sourceSystem: event.sourceSystem,
        tags: event.tags,
      });
    } catch (error) {
      console.error('Error storing immutable audit trail:', error);
      // Don't throw - this is a secondary operation
    }
  }

  /**
   * Forward event to external SIEM systems
   */
  private static async forwardToExternalSIEM(
    organizationId: string,
    event: SIEMEvent
  ): Promise<void> {
    try {
      const integrations = await db
        .select()
        .from(siemIntegrations)
        .where(
          and(
            eq(siemIntegrations.organizationId, organizationId),
            eq(siemIntegrations.isActive, true),
            eq(siemIntegrations.forwardEvents, true)
          )
        );

      for (const integration of integrations) {
        try {
          await this.forwardEventToIntegration(integration, event);
          
          // Update statistics
          await db
            .update(siemIntegrations)
            .set({
              eventsForwarded: sql`${siemIntegrations.eventsForwarded} + 1`,
              lastForwardedAt: new Date(),
            })
            .where(eq(siemIntegrations.id, integration.id));
        } catch (error) {
          console.error(`Error forwarding to ${integration.name}:`, error);
          
          // Update error statistics
          await db
            .update(siemIntegrations)
            .set({
              eventsFailed: sql`${siemIntegrations.eventsFailed} + 1`,
              lastError: error instanceof Error ? error.message : 'Unknown error',
            })
            .where(eq(siemIntegrations.id, integration.id));
        }
      }
    } catch (error) {
      console.error('Error forwarding to external SIEM:', error);
      // Don't throw - forwarding is best effort
    }
  }

  /**
   * Forward event to specific SIEM integration
   */
  private static async forwardEventToIntegration(
    integration: SIEMIntegration,
    event: SIEMEvent
  ): Promise<void> {
    // Check if event matches filters
    if (integration.eventFilters && Object.keys(integration.eventFilters).length > 0) {
      if (!this.eventMatchesFilters(event, integration.eventFilters)) {
        return; // Skip forwarding
      }
    }

    // Format event based on integration type
    const formattedEvent = this.formatEventForIntegration(integration, event);

    // Forward based on integration type
    switch (integration.integrationType) {
      case 'datadog':
        await this.forwardToDataDog(integration, formattedEvent);
        break;
      case 'splunk':
      case 'splunk_cloud':
      case 'splunk_enterprise':
        await this.forwardToSplunk(integration, formattedEvent);
        break;
      case 'elastic':
      case 'elastic_cloud':
        await this.forwardToElastic(integration, formattedEvent);
        break;
      case 'sumo_logic':
        await this.forwardToSumoLogic(integration, formattedEvent);
        break;
      case 'azure_sentinel':
        await this.forwardToAzureSentinel(integration, formattedEvent);
        break;
      case 'aws_security_hub':
        await this.forwardToAWSSecurityHub(integration, formattedEvent);
        break;
      default:
        await this.forwardToCustom(integration, formattedEvent);
    }
  }

  /**
   * Check if event matches integration filters
   */
  private static eventMatchesFilters(event: SIEMEvent, filters: Record<string, any>): boolean {
    // Simple filter matching - can be extended
    if (filters.eventTypes && !filters.eventTypes.includes(event.eventType)) {
      return false;
    }
    if (filters.severities && !filters.severities.includes(event.severity)) {
      return false;
    }
    if (filters.sourceSystems && !filters.sourceSystems.includes(event.sourceSystem)) {
      return false;
    }
    return true;
  }

  /**
   * Format event for specific integration
   */
  private static formatEventForIntegration(
    integration: SIEMIntegration,
    event: SIEMEvent
  ): any {
    switch (integration.forwardFormat) {
      case 'syslog':
        return this.formatAsSyslog(event);
      case 'cef':
        return this.formatAsCEF(event);
      case 'leef':
        return this.formatAsLEEF(event);
      default:
        return event.normalizedEvent;
    }
  }

  /**
   * Format event as Syslog
   */
  private static formatAsSyslog(event: SIEMEvent): string {
    const priority = this.getSyslogPriority(event.severity);
    const timestamp = event.timestamp.toISOString();
    const hostname = event.sourceHost || 'unknown';
    const message = JSON.stringify(event.normalizedEvent);
    return `<${priority}>${timestamp} ${hostname} ${event.sourceSystem}: ${message}`;
  }

  /**
   * Format event as CEF (Common Event Format)
   */
  private static formatAsCEF(event: SIEMEvent): string {
    const cefVersion = '0';
    const deviceVendor = 'Financbase';
    const deviceProduct = event.sourceSystem;
    const deviceVersion = '1.0';
    const signatureId = event.eventId;
    const name = event.eventAction;
    const severity = this.getCEFSeverity(event.severity);
    
    const extensions = [
      `src=${event.sourceIp || 'unknown'}`,
      `suser=${event.sourceUser || 'unknown'}`,
      `msg=${event.eventAction}`,
    ].join(' ');

    return `CEF:${cefVersion}|${deviceVendor}|${deviceProduct}|${deviceVersion}|${signatureId}|${name}|${severity}|${extensions}`;
  }

  /**
   * Format event as LEEF (Log Event Extended Format)
   */
  private static formatAsLEEF(event: SIEMEvent): string {
    const version = '2.0';
    const vendor = 'Financbase';
    const product = event.sourceSystem;
    const eventId = event.eventId;
    const attributes = [
      `sev=${this.getLEEFSeverity(event.severity)}`,
      `src=${event.sourceIp || 'unknown'}`,
      `usr=${event.sourceUser || 'unknown'}`,
      `msg=${event.eventAction}`,
    ].join('\t');

    return `LEEF:${version}|${vendor}|${product}|${eventId}|${attributes}`;
  }

  /**
   * Get Syslog priority
   */
  private static getSyslogPriority(severity: string): number {
    const map: Record<string, number> = {
      critical: 2, // Critical
      high: 3, // Error
      medium: 4, // Warning
      low: 6, // Informational
    };
    return map[severity] || 6;
  }

  /**
   * Get CEF severity
   */
  private static getCEFSeverity(severity: string): number {
    const map: Record<string, number> = {
      critical: 10,
      high: 8,
      medium: 5,
      low: 3,
    };
    return map[severity] || 3;
  }

  /**
   * Get LEEF severity
   */
  private static getLEEFSeverity(severity: string): number {
    return this.getCEFSeverity(severity);
  }

  /**
   * Forward to DataDog using DataDog Events API
   */
  private static async forwardToDataDog(integration: SIEMIntegration, event: any): Promise<void> {
    const apiKey = await this.decryptCredential(integration.apiKey);
    const appKey = await this.decryptCredential(integration.apiSecret); // DataDog uses app key as secret
    
    if (!apiKey || !appKey) {
      throw new Error('DataDog API key and app key are required');
    }

    try {
      const datadogEvent = {
        title: event.title || event.type || 'SIEM Event',
        text: event.message || JSON.stringify(event),
        alert_type: event.severity === 'critical' ? 'error' :
                    event.severity === 'high' ? 'warning' : 'info',
        source_type_name: 'Financbase SIEM',
        tags: [
          `organization:${event.organizationId}`,
          `event_type:${event.type}`,
          `severity:${event.severity}`,
          ...(event.tags || []),
        ],
        date_happened: Math.floor(new Date(event.timestamp || Date.now()).getTime() / 1000),
        priority: event.severity === 'critical' ? 'normal' : 'low',
      };

      const response = await fetch('https://api.datadoghq.com/api/v1/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': apiKey,
          'DD-APPLICATION-KEY': appKey,
        },
        body: JSON.stringify(datadogEvent),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DataDog API error: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('[SIEMIntegration] Failed to forward to DataDog:', error);
      throw error;
    }
  }

  /**
   * Forward to Splunk using HTTP Event Collector (HEC)
   */
  private static async forwardToSplunk(integration: SIEMIntegration, event: any): Promise<void> {
    const hecToken = await this.decryptCredential(integration.apiKey);
    const hecUrl = integration.endpoint || 'https://http-inputs.splunkcloud.com/services/collector/event';
    
    if (!hecToken) {
      throw new Error('Splunk HEC token is required');
    }

    try {
      const splunkEvent = {
        time: Math.floor(new Date(event.timestamp || Date.now()).getTime() / 1000),
        host: 'financbase-siem',
        source: 'financbase',
        sourcetype: 'siem_event',
        event: {
          ...event,
          organizationId: event.organizationId,
          severity: event.severity,
          type: event.type,
        },
      };

      const response = await fetch(hecUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Splunk ${hecToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(splunkEvent),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Splunk HEC error: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('[SIEMIntegration] Failed to forward to Splunk:', error);
      throw error;
    }
  }

  /**
   * Forward to Elasticsearch using Elasticsearch API
   */
  private static async forwardToElastic(integration: SIEMIntegration, event: any): Promise<void> {
    const elasticUrl = integration.endpoint || 'https://localhost:9200';
    const apiKey = await this.decryptCredential(integration.apiKey);
    const username = integration.username;
    const password = await this.decryptCredential(integration.password);
    
    if (!apiKey && (!username || !password)) {
      throw new Error('Elasticsearch API key or username/password is required');
    }

    try {
      const indexName = integration.additionalConfig?.indexName || 'siem-events';
      const elasticEvent = {
        '@timestamp': new Date(event.timestamp || Date.now()).toISOString(),
        organizationId: event.organizationId,
        eventType: event.type,
        severity: event.severity,
        title: event.title,
        message: event.message,
        source: 'financbase-siem',
        ...event,
      };

      const authHeader = apiKey 
        ? `ApiKey ${apiKey}`
        : `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

      const response = await fetch(`${elasticUrl}/${indexName}/_doc`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(elasticEvent),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Elasticsearch API error: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('[SIEMIntegration] Failed to forward to Elasticsearch:', error);
      throw error;
    }
  }

  /**
   * Forward to Sumo Logic using HTTP Source Collector
   */
  private static async forwardToSumoLogic(integration: SIEMIntegration, event: any): Promise<void> {
    const collectorUrl = integration.endpoint;
    const accessId = await this.decryptCredential(integration.apiKey);
    const accessKey = await this.decryptCredential(integration.apiSecret);
    
    if (!collectorUrl) {
      throw new Error('Sumo Logic collector URL is required');
    }

    if (!accessId || !accessKey) {
      throw new Error('Sumo Logic access ID and access key are required');
    }

    try {
      const sumoEvent = {
        timestamp: new Date(event.timestamp || Date.now()).toISOString(),
        organizationId: event.organizationId,
        eventType: event.type,
        severity: event.severity,
        title: event.title,
        message: event.message,
        source: 'financbase-siem',
        ...event,
      };

      // Create authentication header
      const timestamp = Date.now();
      const signature = Buffer.from(
        require('crypto').createHmac('sha256', accessKey)
          .update(`POST\n\napplication/json\n${timestamp}`)
          .digest('base64')
      ).toString('base64');

      const response = await fetch(collectorUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sumo-Name': 'Financbase SIEM',
          'X-Sumo-Category': 'siem/events',
        },
        body: JSON.stringify(sumoEvent),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Sumo Logic API error: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('[SIEMIntegration] Failed to forward to Sumo Logic:', error);
      throw error;
    }
  }

  /**
   * Forward to Azure Sentinel using Log Analytics Data Collector API
   */
  private static async forwardToAzureSentinel(integration: SIEMIntegration, event: any): Promise<void> {
    const workspaceId = integration.additionalConfig?.workspaceId;
    const sharedKey = await this.decryptCredential(integration.apiKey);
    const logType = integration.additionalConfig?.logType || 'FinancbaseSIEM_CL';
    
    if (!workspaceId || !sharedKey) {
      throw new Error('Azure Sentinel workspace ID and shared key are required');
    }

    try {
      const azureEvent = {
        TimeGenerated: new Date(event.timestamp || Date.now()).toISOString(),
        OrganizationId: event.organizationId,
        EventType: event.type,
        Severity: event.severity,
        Title: event.title,
        Message: event.message,
        Source: 'financbase-siem',
        ...event,
      };

      // Create authorization signature for Azure Log Analytics
      const date = new Date().toUTCString();
      const contentLength = Buffer.byteLength(JSON.stringify(azureEvent), 'utf8');
      const stringToSign = `POST\n${contentLength}\napplication/json\nx-ms-date:${date}\n/api/logs`;
      const signature = require('crypto')
        .createHmac('sha256', Buffer.from(sharedKey, 'base64'))
        .update(stringToSign, 'utf8')
        .digest('base64');
      const authorization = `SharedKey ${workspaceId}:${signature}`;

      const response = await fetch(
        `https://${workspaceId}.ods.opinsights.azure.com/api/logs?api-version=2016-04-01`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Log-Type': logType,
            'x-ms-date': date,
            'Authorization': authorization,
            'time-generated-field': 'TimeGenerated',
          },
          body: JSON.stringify(azureEvent),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure Sentinel API error: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('[SIEMIntegration] Failed to forward to Azure Sentinel:', error);
      throw error;
    }
  }

  /**
   * Forward to AWS Security Hub using AWS SDK or API
   * Note: This requires AWS SDK v3. For now, using direct API calls.
   */
  private static async forwardToAWSSecurityHub(integration: SIEMIntegration, event: any): Promise<void> {
    const region = integration.additionalConfig?.region || 'us-east-1';
    const accessKeyId = await this.decryptCredential(integration.apiKey);
    const secretAccessKey = await this.decryptCredential(integration.apiSecret);
    
    if (!accessKeyId || !secretAccessKey) {
      throw new Error('AWS Security Hub access key ID and secret access key are required');
    }

    try {
      // AWS Security Hub uses AWS Signature Version 4
      // This is a simplified implementation - in production, use AWS SDK
      const securityHubFinding = {
        SchemaVersion: '2018-10-08',
        Id: event.id || `financbase-${Date.now()}`,
        ProductArn: `arn:aws:securityhub:${region}:${integration.additionalConfig?.accountId || '123456789012'}:product/financbase/financbase`,
        GeneratorId: 'financbase-siem',
        AwsAccountId: integration.additionalConfig?.accountId || '123456789012',
        Types: ['Security Finding'],
        CreatedAt: new Date(event.timestamp || Date.now()).toISOString(),
        UpdatedAt: new Date().toISOString(),
        Severity: {
          Label: event.severity === 'critical' ? 'CRITICAL' :
                 event.severity === 'high' ? 'HIGH' :
                 event.severity === 'medium' ? 'MEDIUM' : 'LOW',
        },
        Title: event.title || 'SIEM Event',
        Description: event.message || JSON.stringify(event),
        Resources: [
          {
            Type: 'Other',
            Id: event.organizationId,
            Region: region,
          },
        ],
        SourceUrl: event.sourceUrl,
        Remediation: {
          Recommendation: {
            Text: event.remediation || 'Review the event details and take appropriate action.',
          },
        },
      };

      // Import AWS SDK dynamically to handle cases where it might not be installed
      let SecurityHubClient: any;
      let BatchImportFindingsCommand: any;
      
      try {
        const awsSdk = await import('@aws-sdk/client-securityhub');
        SecurityHubClient = awsSdk.SecurityHubClient;
        BatchImportFindingsCommand = awsSdk.BatchImportFindingsCommand;
      } catch (importError) {
        console.warn('[SIEMIntegration] AWS SDK not available. Install @aws-sdk/client-securityhub to enable AWS Security Hub integration.');
        console.log('[SIEMIntegration] AWS Security Hub finding (not sent):', JSON.stringify(securityHubFinding, null, 2));
        return; // Exit early if SDK is not available
      }

      // Check if AWS credentials are available
      const accessKeyId = integration.additionalConfig?.awsAccessKeyId || process.env.AWS_ACCESS_KEY_ID;
      const secretAccessKey = integration.additionalConfig?.awsSecretAccessKey || process.env.AWS_SECRET_ACCESS_KEY;
      const awsRegion = integration.additionalConfig?.awsRegion || process.env.AWS_REGION || 'us-east-1';

      if (!accessKeyId || !secretAccessKey) {
        console.warn('[SIEMIntegration] AWS credentials not configured. Skipping AWS Security Hub integration.');
        console.log('[SIEMIntegration] AWS Security Hub finding (not sent):', JSON.stringify(securityHubFinding, null, 2));
        return;
      }

      // Create AWS Security Hub client
      const client = new SecurityHubClient({
        region: awsRegion,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });

      // Send finding to AWS Security Hub
      try {
        const command = new BatchImportFindingsCommand({
          Findings: [securityHubFinding],
        });
        
        const response = await client.send(command);
        
        // Log successful import
        if (response.FailedCount && response.FailedCount > 0) {
          console.error('[SIEMIntegration] Some findings failed to import:', response.FailedFindings);
        } else {
          console.log('[SIEMIntegration] Successfully imported finding to AWS Security Hub:', response.ImportedFindings?.[0]?.Id);
        }
      } catch (awsError: any) {
        console.error('[SIEMIntegration] Failed to import finding to AWS Security Hub:', awsError.message);
        // Don't throw - allow other integrations to continue
      }
    } catch (error) {
      console.error('[SIEMIntegration] Failed to forward to AWS Security Hub:', error);
      throw error;
    }
  }

  /**
   * Forward to custom integration (webhook)
   */
  private static async forwardToCustom(integration: SIEMIntegration, event: any): Promise<void> {
    if (!integration.endpoint) {
      throw new Error('Custom integration endpoint not configured');
    }

      const decryptedApiKey = await this.decryptCredential(integration.apiKey);
      const response = await fetch(integration.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(decryptedApiKey && { 'Authorization': `Bearer ${decryptedApiKey}` }),
        },
        body: JSON.stringify(event),
      });

    if (!response.ok) {
      throw new Error(`Failed to forward event: ${response.statusText}`);
    }
  }

  /**
   * Process event for alerts (delegates to RealTimeAlertingService)
   */
  private static async processEventForAlerts(
    organizationId: string,
    event: SIEMEvent
  ): Promise<void> {
    // This will be called by RealTimeAlertingService
    // Import here to avoid circular dependency
    const { RealTimeAlertingService } = await import('./real-time-alerting-service');
    await RealTimeAlertingService.processEvent(organizationId, event);
  }

  /**
   * Create SIEM integration
   */
  static async createIntegration(
    organizationId: string,
    integration: {
      createdBy?: string;
      name: string;
      integrationType: string;
      description?: string;
      endpoint: string;
      apiKey?: string;
      apiSecret?: string;
      username?: string;
      password?: string;
      additionalConfig?: Record<string, any>;
      forwardEvents?: boolean;
      eventFilters?: Record<string, any>;
      forwardFormat?: string;
    }
  ): Promise<SIEMIntegration> {
    try {
      // Encrypt sensitive credentials before storing
      const encryptedApiKey = integration.apiKey ? await this.encryptCredential(integration.apiKey) : undefined;
      const encryptedApiSecret = integration.apiSecret ? await this.encryptCredential(integration.apiSecret) : undefined;
      const encryptedPassword = integration.password ? await this.encryptCredential(integration.password) : undefined;

      const [newIntegration] = await db
        .insert(siemIntegrations)
        .values({
          organizationId,
          createdBy: integration.createdBy,
          name: integration.name,
          integrationType: integration.integrationType as any,
          description: integration.description,
          endpoint: integration.endpoint,
          apiKey: encryptedApiKey,
          apiSecret: encryptedApiSecret,
          username: integration.username,
          password: encryptedPassword,
          additionalConfig: integration.additionalConfig || {},
          forwardEvents: integration.forwardEvents !== false,
          eventFilters: integration.eventFilters || {},
          forwardFormat: integration.forwardFormat || 'json',
          isActive: true,
          isVerified: false,
          healthStatus: 'unknown',
          eventsForwarded: 0,
          eventsFailed: 0,
        })
        .returning();

      return newIntegration;
    } catch (error) {
      console.error('Error creating SIEM integration:', error);
      throw new Error('Failed to create SIEM integration');
    }
  }

  /**
   * Get SIEM events
   */
  static async getEvents(
    organizationId: string,
    filters?: {
      eventType?: string;
      severity?: string;
      status?: string;
      dateFrom?: Date;
      dateTo?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<SIEMEvent[]> {
    try {
      const conditions: any[] = [eq(siemEvents.organizationId, organizationId)];

      if (filters?.eventType) {
        conditions.push(eq(siemEvents.eventType, filters.eventType));
      }
      if (filters?.severity) {
        conditions.push(eq(siemEvents.severity, filters.severity as any));
      }
      if (filters?.status) {
        conditions.push(eq(siemEvents.status, filters.status as any));
      }
      if (filters?.dateFrom) {
        conditions.push(gte(siemEvents.timestamp, filters.dateFrom));
      }
      if (filters?.dateTo) {
        conditions.push(lte(siemEvents.timestamp, filters.dateTo));
      }

      const events = await db
        .select()
        .from(siemEvents)
        .where(and(...conditions))
        .orderBy(desc(siemEvents.timestamp))
        .limit(filters?.limit || 100)
        .offset(filters?.offset || 0);

      return events;
    } catch (error) {
      console.error('Error getting SIEM events:', error);
      throw new Error('Failed to get SIEM events');
    }
  }

  /**
   * Get SIEM integrations
   */
  static async getIntegrations(organizationId: string): Promise<SIEMIntegration[]> {
    try {
      const integrations = await db
        .select()
        .from(siemIntegrations)
        .where(eq(siemIntegrations.organizationId, organizationId))
        .orderBy(desc(siemIntegrations.createdAt));

      return integrations;
    } catch (error) {
      console.error('Error getting SIEM integrations:', error);
      throw new Error('Failed to get SIEM integrations');
    }
  }
}

