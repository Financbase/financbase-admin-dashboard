/**
 * Cross-Service Integration Service
 * 
 * This service enables better integration between related services,
 * providing seamless data flow and orchestration across the platform.
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { unifiedServiceManager } from './unified-service-layer';

// Integration types
export interface ServiceIntegration {
  id: string;
  name: string;
  sourceService: string;
  targetService: string;
  integrationType: 'data-sync' | 'workflow' | 'event-driven' | 'api-call';
  configuration: Record<string, any>;
  isActive: boolean;
  lastSync?: Date;
  syncFrequency?: 'realtime' | 'hourly' | 'daily' | 'weekly';
}

export interface DataMapping {
  sourceField: string;
  targetField: string;
  transformation?: 'direct' | 'format' | 'calculate' | 'lookup';
  transformationConfig?: Record<string, any>;
}

export interface IntegrationWorkflow {
  id: string;
  name: string;
  trigger: {
    service: string;
    event: string;
    conditions?: Record<string, any>;
  };
  actions: Array<{
    service: string;
    action: string;
    parameters: Record<string, any>;
    dependsOn?: string[];
  }>;
  isActive: boolean;
}

// Cross-service integration manager
export class CrossServiceIntegrationManager {
  private integrations: Map<string, ServiceIntegration> = new Map();
  private workflows: Map<string, IntegrationWorkflow> = new Map();
  private dataMappings: Map<string, DataMapping[]> = new Map();

  constructor() {
    this.initializeDefaultIntegrations();
  }

  /**
   * Initialize default cross-service integrations
   */
  private async initializeDefaultIntegrations() {
    // Financial + HR Integration
    await this.createIntegration({
      id: 'financial-hr-payroll',
      name: 'Payroll to Financial Sync',
      sourceService: 'hr-employee-management',
      targetService: 'financial-expense-management',
      integrationType: 'data-sync',
      configuration: {
        syncFields: ['employee_id', 'salary', 'benefits', 'deductions'],
        syncFrequency: 'weekly'
      },
      isActive: true,
      syncFrequency: 'weekly'
    });

    // Marketing + Financial Integration
    await this.createIntegration({
      id: 'marketing-financial-campaign-costs',
      name: 'Campaign Costs to Financial Tracking',
      sourceService: 'marketing-adboard',
      targetService: 'financial-expense-management',
      integrationType: 'event-driven',
      configuration: {
        triggerEvents: ['campaign_created', 'campaign_updated', 'campaign_completed'],
        expenseCategory: 'marketing'
      },
      isActive: true,
      syncFrequency: 'realtime'
    });

    // AI + Financial Integration
    await this.createIntegration({
      id: 'ai-financial-insights',
      name: 'AI Financial Insights Generation',
      sourceService: 'financial-expense-management',
      targetService: 'ai-assistant',
      integrationType: 'workflow',
      configuration: {
        triggerConditions: {
          expenseThreshold: 1000,
          timeInterval: 'daily'
        },
        aiPrompt: 'Analyze expense patterns and provide insights'
      },
      isActive: true,
      syncFrequency: 'daily'
    });

    // Platform + All Services Integration
    await this.createIntegration({
      id: 'platform-monitoring-all-services',
      name: 'Platform Monitoring for All Services',
      sourceService: 'platform-monitoring',
      targetService: 'platform-workflow-engine',
      integrationType: 'event-driven',
      configuration: {
        monitorAllServices: true,
        alertThresholds: {
          responseTime: 500,
          errorRate: 0.05,
          uptime: 99.0
        }
      },
      isActive: true,
      syncFrequency: 'realtime'
    });

    // Initialize data mappings
    this.initializeDataMappings();
    
    // Initialize integration workflows
    this.initializeIntegrationWorkflows();
  }

  /**
   * Initialize data mappings between services
   */
  private initializeDataMappings() {
    // HR to Financial mapping
    this.dataMappings.set('financial-hr-payroll', [
      {
        sourceField: 'employee.salary',
        targetField: 'expense.amount',
        transformation: 'direct'
      },
      {
        sourceField: 'employee.id',
        targetField: 'expense.employee_id',
        transformation: 'direct'
      },
      {
        sourceField: 'employee.name',
        targetField: 'expense.description',
        transformation: 'format',
        transformationConfig: {
          template: 'Payroll for {employee.name}'
        }
      },
      {
        sourceField: 'payroll.date',
        targetField: 'expense.date',
        transformation: 'direct'
      }
    ]);

    // Marketing to Financial mapping
    this.dataMappings.set('marketing-financial-campaign-costs', [
      {
        sourceField: 'campaign.budget',
        targetField: 'expense.amount',
        transformation: 'direct'
      },
      {
        sourceField: 'campaign.name',
        targetField: 'expense.description',
        transformation: 'format',
        transformationConfig: {
          template: 'Marketing Campaign: {campaign.name}'
        }
      },
      {
        sourceField: 'campaign.platform',
        targetField: 'expense.category',
        transformation: 'lookup',
        transformationConfig: {
          mapping: {
            'facebook': 'Social Media Marketing',
            'google': 'Search Marketing',
            'instagram': 'Social Media Marketing'
          }
        }
      }
    ]);
  }

  /**
   * Initialize integration workflows
   */
  private initializeIntegrationWorkflows() {
    // Automated expense categorization workflow
    this.workflows.set('auto-expense-categorization', {
      id: 'auto-expense-categorization',
      name: 'Automated Expense Categorization',
      trigger: {
        service: 'financial-expense-management',
        event: 'expense_created',
        conditions: {
          amount: { $gte: 50 }
        }
      },
      actions: [
        {
          service: 'ai-assistant',
          action: 'categorize_expense',
          parameters: {
            expenseData: '{{trigger.expense}}',
            categories: ['travel', 'meals', 'office', 'marketing', 'software']
          }
        },
        {
          service: 'financial-expense-management',
          action: 'update_category',
          parameters: {
            expenseId: '{{trigger.expense.id}}',
            category: '{{actions.0.result.category}}'
          },
          dependsOn: ['ai-assistant']
        }
      ],
      isActive: true
    });

    // Marketing campaign ROI tracking workflow
    this.workflows.set('marketing-roi-tracking', {
      id: 'marketing-roi-tracking',
      name: 'Marketing Campaign ROI Tracking',
      trigger: {
        service: 'marketing-adboard',
        event: 'campaign_completed'
      },
      actions: [
        {
          service: 'financial-expense-management',
          action: 'get_campaign_expenses',
          parameters: {
            campaignId: '{{trigger.campaign.id}}',
            dateRange: {
              start: '{{trigger.campaign.start_date}}',
              end: '{{trigger.campaign.end_date}}'
            }
          }
        },
        {
          service: 'marketing-adboard',
          action: 'get_campaign_revenue',
          parameters: {
            campaignId: '{{trigger.campaign.id}}'
          }
        },
        {
          service: 'ai-assistant',
          action: 'calculate_roi',
          parameters: {
            expenses: '{{actions.0.result}}',
            revenue: '{{actions.1.result}}',
            campaignData: '{{trigger.campaign}}'
          },
          dependsOn: ['financial-expense-management', 'marketing-adboard']
        }
      ],
      isActive: true
    });

    // Employee onboarding workflow
    this.workflows.set('employee-onboarding', {
      id: 'employee-onboarding',
      name: 'Employee Onboarding Automation',
      trigger: {
        service: 'hr-employee-management',
        event: 'employee_created'
      },
      actions: [
        {
          service: 'platform-workflow-engine',
          action: 'create_onboarding_tasks',
          parameters: {
            employeeId: '{{trigger.employee.id}}',
            department: '{{trigger.employee.department}}',
            role: '{{trigger.employee.role}}'
          }
        },
        {
          service: 'financial-expense-management',
          action: 'create_employee_expense_account',
          parameters: {
            employeeId: '{{trigger.employee.id}}',
            employeeName: '{{trigger.employee.name}}'
          }
        },
        {
          service: 'ai-assistant',
          action: 'generate_welcome_email',
          parameters: {
            employeeData: '{{trigger.employee}}',
            template: 'employee_welcome'
          },
          dependsOn: ['platform-workflow-engine']
        }
      ],
      isActive: true
    });
  }

  /**
   * Create a new service integration
   */
  async createIntegration(integration: ServiceIntegration): Promise<void> {
    this.integrations.set(integration.id, integration);
    
    // Validate that both services exist
    const sourceService = await unifiedServiceManager.getService(integration.sourceService);
    const targetService = await unifiedServiceManager.getService(integration.targetService);
    
    if (!sourceService || !targetService) {
      throw new Error(`One or both services not found: ${integration.sourceService}, ${integration.targetService}`);
    }
  }

  /**
   * Execute a service integration
   */
  async executeIntegration(integrationId: string, data: any): Promise<any> {
    const integration = this.integrations.get(integrationId);
    if (!integration || !integration.isActive) {
      throw new Error(`Integration ${integrationId} not found or inactive`);
    }

    switch (integration.integrationType) {
      case 'data-sync':
        return this.executeDataSync(integration, data);
      case 'workflow':
        return this.executeWorkflowIntegration(integration, data);
      case 'event-driven':
        return this.executeEventDrivenIntegration(integration, data);
      case 'api-call':
        return this.executeApiCallIntegration(integration, data);
      default:
        throw new Error(`Unknown integration type: ${integration.integrationType}`);
    }
  }

  /**
   * Execute data synchronization between services
   */
  private async executeDataSync(integration: ServiceIntegration, data: any): Promise<any> {
    const mappings = this.dataMappings.get(integration.id);
    if (!mappings) {
      throw new Error(`No data mappings found for integration ${integration.id}`);
    }

    const transformedData: Record<string, any> = {};
    
    for (const mapping of mappings) {
      const sourceValue = this.getNestedValue(data, mapping.sourceField);
      let targetValue = sourceValue;

      // Apply transformation
      switch (mapping.transformation) {
        case 'format':
          targetValue = this.formatValue(sourceValue, mapping.transformationConfig);
          break;
        case 'lookup':
          targetValue = this.lookupValue(sourceValue, mapping.transformationConfig);
          break;
        case 'calculate':
          targetValue = this.calculateValue(sourceValue, mapping.transformationConfig);
          break;
        case 'direct':
        default:
          targetValue = sourceValue;
      }

      this.setNestedValue(transformedData, mapping.targetField, targetValue);
    }

    // Send transformed data to target service
    return this.sendToService(integration.targetService, transformedData);
  }

  /**
   * Execute workflow-based integration
   */
  private async executeWorkflowIntegration(integration: ServiceIntegration, data: any): Promise<any> {
    const workflow = this.workflows.get(integration.id);
    if (!workflow) {
      throw new Error(`No workflow found for integration ${integration.id}`);
    }

    return this.executeWorkflow(workflow, data);
  }

  /**
   * Execute event-driven integration
   */
  private async executeEventDrivenIntegration(integration: ServiceIntegration, data: any): Promise<any> {
    // Check if event matches integration configuration
    const eventType = data.event || data.type;
    const configuredEvents = integration.configuration.triggerEvents || [];
    
    if (!configuredEvents.includes(eventType)) {
      return { status: 'ignored', reason: 'Event type not configured' };
    }

    // Execute the integration based on event
    return this.executeDataSync(integration, data);
  }

  /**
   * Execute API call integration
   */
  private async executeApiCallIntegration(integration: ServiceIntegration, data: any): Promise<any> {
    const targetService = await unifiedServiceManager.getService(integration.targetService);
    if (!targetService) {
      throw new Error(`Target service ${integration.targetService} not found`);
    }

    // Make API call to target service
    return this.makeApiCall(targetService.endpoint, data, integration.configuration);
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflow: IntegrationWorkflow, triggerData: any): Promise<any> {
    if (!workflow.isActive) {
      throw new Error(`Workflow ${workflow.id} is not active`);
    }

    const results: Record<string, any> = {};
    const context = { trigger: triggerData, actions: results };

    // Execute actions in dependency order
    for (const action of workflow.actions) {
      // Check dependencies
      if (action.dependsOn) {
        const allDependenciesMet = action.dependsOn.every(dep => results[dep]);
        if (!allDependenciesMet) {
          throw new Error(`Dependencies not met for action ${action.service}.${action.action}`);
        }
      }

      // Execute action
      const result = await this.executeAction(action, context);
      results[`${action.service}.${action.action}`] = result;
    }

    return results;
  }

  /**
   * Execute a single action
   */
  private async executeAction(action: any, context: any): Promise<any> {
    // Replace template variables in parameters
    const processedParams = this.processTemplateVariables(action.parameters, context);
    
    // Execute the action
    return this.sendToService(action.service, {
      action: action.action,
      parameters: processedParams
    });
  }

  /**
   * Process template variables in parameters
   */
  private processTemplateVariables(params: any, context: any): any {
    if (typeof params === 'string') {
      return this.replaceTemplateVariables(params, context);
    } else if (Array.isArray(params)) {
      return params.map(item => this.processTemplateVariables(item, context));
    } else if (typeof params === 'object' && params !== null) {
      const processed: Record<string, any> = {};
      for (const [key, value] of Object.entries(params)) {
        processed[key] = this.processTemplateVariables(value, context);
      }
      return processed;
    }
    return params;
  }

  /**
   * Replace template variables in strings
   */
  private replaceTemplateVariables(template: string, context: any): any {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      return this.getNestedValue(context, path.trim());
    });
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Set nested value in object using dot notation
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  /**
   * Format value using configuration
   */
  private formatValue(value: any, config: any): string {
    if (!config?.template) return String(value);
    return config.template.replace(/\{([^}]+)\}/g, (match: string, key: string) => {
      return value[key] || value;
    });
  }

  /**
   * Lookup value using mapping configuration
   */
  private lookupValue(value: any, config: any): any {
    if (!config?.mapping) return value;
    return config.mapping[value] || value;
  }

  /**
   * Calculate value using configuration
   */
  private calculateValue(value: any, config: any): any {
    if (!config?.formula) return value;
    // Simple calculation - in production, use a proper expression evaluator
    try {
      return eval(config.formula.replace('value', value));
    } catch {
      return value;
    }
  }

  /**
   * Send data to a service
   */
  private async sendToService(serviceId: string, data: any): Promise<any> {
    const service = await unifiedServiceManager.getService(serviceId);
    if (!service) {
      throw new Error(`Service ${serviceId} not found`);
    }

    // Simulate service call
    console.log(`Sending data to service ${serviceId}:`, data);
    return { serviceId, status: 'success', data };
  }

  /**
   * Make API call
   */
  private async makeApiCall(endpoint: string, data: any, config: any): Promise<any> {
    // Simulate API call
    console.log(`Making API call to ${endpoint}:`, data);
    return { endpoint, status: 'success', data };
  }

  /**
   * Get all integrations
   */
  async getAllIntegrations(): Promise<ServiceIntegration[]> {
    return Array.from(this.integrations.values());
  }

  /**
   * Get integrations by service
   */
  async getIntegrationsByService(serviceId: string): Promise<ServiceIntegration[]> {
    return Array.from(this.integrations.values()).filter(
      integration => integration.sourceService === serviceId || integration.targetService === serviceId
    );
  }

  /**
   * Get integration health
   */
  async getIntegrationHealth(integrationId: string): Promise<{
    status: 'healthy' | 'unhealthy' | 'unknown';
    lastSync?: Date;
    errorCount: number;
    successRate: number;
  }> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      return { status: 'unknown', errorCount: 0, successRate: 0 };
    }

    return {
      status: integration.isActive ? 'healthy' : 'unhealthy',
      lastSync: integration.lastSync,
      errorCount: 0, // Would be tracked in production
      successRate: 0.95 // Would be calculated in production
    };
  }
}

// Export singleton instance
export const crossServiceIntegrationManager = new CrossServiceIntegrationManager();

// Export types
export type { ServiceIntegration, DataMapping, IntegrationWorkflow };
