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
   * Forward to DataDog (placeholder - implement actual API call)
   */
  private static async forwardToDataDog(integration: SIEMIntegration, event: any): Promise<void> {
    // TODO: Implement DataDog API integration
    console.log('Forwarding to DataDog:', integration.name, event);
  }

  /**
   * Forward to Splunk (placeholder - implement actual API call)
   */
  private static async forwardToSplunk(integration: SIEMIntegration, event: any): Promise<void> {
    // TODO: Implement Splunk API integration
    console.log('Forwarding to Splunk:', integration.name, event);
  }

  /**
   * Forward to Elastic (placeholder - implement actual API call)
   */
  private static async forwardToElastic(integration: SIEMIntegration, event: any): Promise<void> {
    // TODO: Implement Elastic API integration
    console.log('Forwarding to Elastic:', integration.name, event);
  }

  /**
   * Forward to Sumo Logic (placeholder - implement actual API call)
   */
  private static async forwardToSumoLogic(integration: SIEMIntegration, event: any): Promise<void> {
    // TODO: Implement Sumo Logic API integration
    console.log('Forwarding to Sumo Logic:', integration.name, event);
  }

  /**
   * Forward to Azure Sentinel (placeholder - implement actual API call)
   */
  private static async forwardToAzureSentinel(integration: SIEMIntegration, event: any): Promise<void> {
    // TODO: Implement Azure Sentinel API integration
    console.log('Forwarding to Azure Sentinel:', integration.name, event);
  }

  /**
   * Forward to AWS Security Hub (placeholder - implement actual API call)
   */
  private static async forwardToAWSSecurityHub(integration: SIEMIntegration, event: any): Promise<void> {
    // TODO: Implement AWS Security Hub API integration
    console.log('Forwarding to AWS Security Hub:', integration.name, event);
  }

  /**
   * Forward to custom integration (webhook)
   */
  private static async forwardToCustom(integration: SIEMIntegration, event: any): Promise<void> {
    if (!integration.endpoint) {
      throw new Error('Custom integration endpoint not configured');
    }

    const response = await fetch(integration.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(integration.apiKey && { 'Authorization': `Bearer ${integration.apiKey}` }),
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
      const [newIntegration] = await db
        .insert(siemIntegrations)
        .values({
          organizationId,
          createdBy: integration.createdBy,
          name: integration.name,
          integrationType: integration.integrationType as any,
          description: integration.description,
          endpoint: integration.endpoint,
          apiKey: integration.apiKey, // TODO: Encrypt
          apiSecret: integration.apiSecret, // TODO: Encrypt
          username: integration.username,
          password: integration.password, // TODO: Encrypt
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

