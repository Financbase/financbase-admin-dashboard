import { db } from '@/lib/db';
import {
  integrationConnections,
  integrationSyncs,
  integrationErrors,
  integrationMappings
} from '@/lib/db/schemas';
import { eq, and, desc } from 'drizzle-orm';
import { StripeIntegration } from './stripe-integration';
import { SlackIntegration } from './slack-integration';
import { QuickBooksIntegration } from './quickbooks-integration';

export interface SyncResult {
  success: boolean;
  totalRecords: number;
  processedRecords: number;
  successRecords: number;
  failedRecords: number;
  errors: Array<{
    type: string;
    message: string;
    details?: any;
  }>;
  warnings: Array<{
    type: string;
    message: string;
    details?: any;
  }>;
  duration: number;
}

export interface SyncOptions {
  entityTypes?: string[];
  direction?: 'import' | 'export' | 'bidirectional';
  filters?: Record<string, any>;
  forceFullSync?: boolean;
}

export class IntegrationSyncEngine {
  /**
   * Start sync for a connection
   */
  static async startSync(
    connectionId: number,
    userId: string,
    options: SyncOptions = {}
  ): Promise<string> {
    const syncId = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get connection details
    const connection = await db
      .select()
      .from(integrationConnections)
      .where(and(
        eq(integrationConnections.id, connectionId),
        eq(integrationConnections.userId, userId)
      ))
      .limit(1);

    if (connection.length === 0) {
      throw new Error('Connection not found');
    }

    const connectionData = connection[0];

    // Create sync record
    await db.insert(integrationSyncs).values({
      connectionId,
      userId,
      syncId,
      type: options.forceFullSync ? 'full' : 'incremental',
      direction: options.direction || 'import',
      status: 'pending',
      entityTypes: options.entityTypes || ['customers', 'invoices', 'payments'],
      filters: options.filters || {},
    });

    // Start sync process (in background)
    this.processSync(syncId, connectionData, options).catch(error => {
      console.error('Sync process failed:', error);
      this.updateSyncStatus(syncId, 'failed', { error: error.message });
    });

    return syncId;
  }

  /**
   * Process sync for a connection
   */
  private static async processSync(
    syncId: string,
    connection: any,
    options: SyncOptions
  ): Promise<void> {
    const startTime = Date.now();
    let result: SyncResult = {
      success: false,
      totalRecords: 0,
      processedRecords: 0,
      successRecords: 0,
      failedRecords: 0,
      errors: [],
      warnings: [],
      duration: 0,
    };

    try {
      // Update sync status to running
      await this.updateSyncStatus(syncId, 'running', { startedAt: new Date() });

      // Get integration service
      const integration = this.getIntegrationService(connection);
      if (!integration) {
        throw new Error('Unsupported integration type');
      }

      // Process each entity type
      for (const entityType of options.entityTypes || ['customers', 'invoices', 'payments']) {
        try {
          const entityResult = await this.syncEntityType(
            integration,
            entityType,
            connection,
            options
          );
          
          result.totalRecords += entityResult.totalRecords;
          result.processedRecords += entityResult.processedRecords;
          result.successRecords += entityResult.successRecords;
          result.failedRecords += entityResult.failedRecords;
          result.errors.push(...entityResult.errors);
          result.warnings.push(...entityResult.warnings);
        } catch (error) {
          result.errors.push({
            type: 'sync_error',
            message: `Failed to sync ${entityType}`,
            details: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      result.success = result.errors.length === 0;
      result.duration = Date.now() - startTime;

      // Update sync record
      await this.updateSyncStatus(syncId, 'completed', {
        completedAt: new Date(),
        duration: result.duration,
        result,
      });

      // Update connection stats
      await this.updateConnectionStats(connection.id, result);

    } catch (error) {
      result.success = false;
      result.duration = Date.now() - startTime;
      result.errors.push({
        type: 'sync_error',
        message: 'Sync process failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });

      await this.updateSyncStatus(syncId, 'failed', {
        completedAt: new Date(),
        duration: result.duration,
        result,
      });
    }
  }

  /**
   * Sync specific entity type
   */
  private static async syncEntityType(
    integration: any,
    entityType: string,
    connection: any,
    options: SyncOptions
  ): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      totalRecords: 0,
      processedRecords: 0,
      successRecords: 0,
      failedRecords: 0,
      errors: [],
      warnings: [],
      duration: 0,
    };

    try {
      let data: any[] = [];

      // Fetch data from external service
      switch (entityType) {
        case 'customers':
          if (integration.syncCustomers) {
            data = await integration.syncCustomers(100);
          }
          break;
        case 'invoices':
          if (integration.syncInvoices) {
            data = await integration.syncInvoices(100);
          }
          break;
        case 'payments':
          if (integration.syncPayments) {
            data = await integration.syncPayments(100);
          }
          break;
        default:
          throw new Error(`Unsupported entity type: ${entityType}`);
      }

      result.totalRecords = data.length;

      // Process each record
      for (const record of data) {
        try {
          await this.processRecord(record, entityType, connection);
          result.successRecords++;
        } catch (error) {
          result.failedRecords++;
          result.errors.push({
            type: 'record_error',
            message: `Failed to process ${entityType} record`,
            details: error instanceof Error ? error.message : 'Unknown error',
          });
        }
        result.processedRecords++;
      }

    } catch (error) {
      result.success = false;
      result.errors.push({
        type: 'fetch_error',
        message: `Failed to fetch ${entityType} data`,
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    return result;
  }

  /**
   * Process individual record
   */
  private static async processRecord(
    record: any,
    entityType: string,
    connection: any
  ): Promise<void> {
    // Get field mappings for this entity type
    const mappings = await db
      .select()
      .from(integrationMappings)
      .where(and(
        eq(integrationMappings.connectionId, connection.id),
        eq(integrationMappings.entityType, entityType),
        eq(integrationMappings.isActive, true)
      ));

    if (mappings.length === 0) {
      // No mappings configured, skip
      return;
    }

    const mapping = mappings[0];
    const fieldMappings = mapping.fieldMappings as Record<string, string>;
    const transformations = mapping.transformations as Record<string, any>;

    // Transform record according to mappings
    const transformedRecord: Record<string, any> = {};
    
    for (const [externalField, internalField] of Object.entries(fieldMappings)) {
      let value = this.getNestedValue(record, externalField);
      
      // Apply transformations
      if (transformations[externalField]) {
        value = this.applyTransformation(value, transformations[externalField]);
      }
      
      transformedRecord[internalField] = value;
    }

    // Save to database (this would integrate with your existing services)
    await this.saveTransformedRecord(transformedRecord, entityType, connection.userId);
  }

  /**
   * Get integration service instance
   */
  private static getIntegrationService(connection: any): any {
    const integration = connection.integration;
    
    switch (integration.slug) {
      case 'stripe':
        return new StripeIntegration(connection.accessToken);
      case 'slack':
        return new SlackIntegration(connection.accessToken);
      case 'quickbooks':
        return new QuickBooksIntegration(connection.accessToken, connection.externalId);
      default:
        return null;
    }
  }

  /**
   * Update sync status
   */
  private static async updateSyncStatus(
    syncId: string,
    status: string,
    updates: Record<string, any>
  ): Promise<void> {
    await db
      .update(integrationSyncs)
      .set({
        status,
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(integrationSyncs.syncId, syncId));
  }

  /**
   * Update connection statistics
   */
  private static async updateConnectionStats(
    connectionId: number,
    result: SyncResult
  ): Promise<void> {
    await db
      .update(integrationConnections)
      .set({
        lastSyncAt: new Date(),
        syncCount: db.select().from(integrationSyncs).where(eq(integrationSyncs.connectionId, connectionId)).then(count => count.length),
        successCount: result.successRecords,
        failureCount: result.failedRecords,
        updatedAt: new Date(),
      })
      .where(eq(integrationConnections.id, connectionId));
  }

  /**
   * Save transformed record to database
   */
  private static async saveTransformedRecord(
    record: Record<string, any>,
    entityType: string,
    userId: string
  ): Promise<void> {
    // This would integrate with your existing services
    // For now, just log the record
    console.log(`Saving ${entityType} record:`, record);
  }

  /**
   * Get nested value from object
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Apply transformation to value
   */
  private static applyTransformation(value: any, transformation: any): any {
    switch (transformation.type) {
      case 'format_date':
        return new Date(value).toISOString();
      case 'format_currency':
        return Math.round(value * 100); // Convert to cents
      case 'uppercase':
        return String(value).toUpperCase();
      case 'lowercase':
        return String(value).toLowerCase();
      case 'trim':
        return String(value).trim();
      default:
        return value;
    }
  }

  /**
   * Get sync status
   */
  static async getSyncStatus(syncId: string): Promise<any> {
    const sync = await db
      .select()
      .from(integrationSyncs)
      .where(eq(integrationSyncs.syncId, syncId))
      .limit(1);

    return sync[0] || null;
  }

  /**
   * Get sync history for connection
   */
  static async getSyncHistory(
    connectionId: number,
    userId: string,
    limit: number = 50
  ): Promise<any[]> {
    return await db
      .select()
      .from(integrationSyncs)
      .where(and(
        eq(integrationSyncs.connectionId, connectionId),
        eq(integrationSyncs.userId, userId)
      ))
      .orderBy(desc(integrationSyncs.createdAt))
      .limit(limit);
  }

  /**
   * Cancel sync
   */
  static async cancelSync(syncId: string): Promise<void> {
    await this.updateSyncStatus(syncId, 'cancelled', {
      completedAt: new Date(),
    });
  }
}
