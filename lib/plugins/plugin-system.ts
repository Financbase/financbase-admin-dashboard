import { db } from '@/lib/db';
import {
  marketplacePlugins,
  installedPlugins,
  pluginSettings,
  pluginLogs,
  pluginHooks
} from '@/lib/db/schemas';
import { eq, and, desc, sql } from 'drizzle-orm';

export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  main: string;
  hooks?: string[];
  permissions?: string[];
  dependencies?: Record<string, string>;
  settings?: Array<{
    key: string;
    type: 'string' | 'number' | 'boolean' | 'json';
    required: boolean;
    default?: any;
    description?: string;
  }>;
}

export interface PluginContext {
  userId: string;
  organizationId?: string;
  pluginId: number;
  installationId: number;
  settings: Record<string, any>;
  permissions: string[];
}

export interface PluginHook {
  name: string;
  callback: (data: any, context: PluginContext) => Promise<any>;
  priority?: number;
}

export interface PluginAPI {
  // Data access
  getInvoices: (filters?: any) => Promise<any[]>;
  getExpenses: (filters?: any) => Promise<any[]>;
  getPayments: (filters?: any) => Promise<any[]>;
  getCustomers: (filters?: any) => Promise<any[]>;
  
  // Data modification
  createInvoice: (data: any) => Promise<any>;
  updateInvoice: (id: string, data: any) => Promise<any>;
  createExpense: (data: any) => Promise<any>;
  createPayment: (data: any) => Promise<any>;
  
  // Notifications
  sendEmail: (to: string, subject: string, body: string) => Promise<void>;
  sendSlackMessage: (channel: string, message: string) => Promise<void>;
  
  // Storage
  getStorage: (key: string) => Promise<any>;
  setStorage: (key: string, value: any) => Promise<void>;
  
  // Logging
  log: (level: 'info' | 'warn' | 'error', message: string, context?: any) => Promise<void>;
}

export class PluginSystem {
  private static plugins: Map<number, any> = new Map();
  private static hooks: Map<string, PluginHook[]> = new Map();

  /**
   * Register a plugin
   */
  static async registerPlugin(
    pluginId: number,
    pluginClass: any,
    manifest: PluginManifest
  ): Promise<void> {
    try {
      // Validate plugin manifest
      this.validateManifest(manifest);
      
      // Initialize plugin
      const plugin = new pluginClass();
      await plugin.initialize();
      
      // Store plugin
      this.plugins.set(pluginId, {
        instance: plugin,
        manifest,
        hooks: [],
      });
      
      // Register hooks
      if (manifest.hooks) {
        for (const hookName of manifest.hooks) {
          if (plugin[hookName]) {
            this.registerHook(hookName, {
              name: hookName,
              callback: plugin[hookName].bind(plugin),
              priority: 0,
            });
          }
        }
      }
      
      await this.logPlugin(pluginId, 'info', 'Plugin registered successfully');
    } catch (error) {
      await this.logPlugin(pluginId, 'error', 'Failed to register plugin', { error: error.message });
      throw error;
    }
  }

  /**
   * Install a plugin for a user
   */
  static async installPlugin(
    pluginId: number,
    userId: string,
    organizationId?: string
  ): Promise<number> {
    try {
      // Check if plugin exists
      const plugin = await db
        .select()
        .from(marketplacePlugins)
        .where(eq(marketplacePlugins.id, pluginId))
        .limit(1);

      if (plugin.length === 0) {
        throw new Error('Plugin not found');
      }

      // Check if already installed
      const existing = await db
        .select()
        .from(installedPlugins)
        .where(and(
          eq(installedPlugins.pluginId, pluginId),
          eq(installedPlugins.userId, userId)
        ))
        .limit(1);

      if (existing.length > 0) {
        throw new Error('Plugin already installed');
      }

      // Install plugin
      const installation = await db.insert(installedPlugins).values({
        userId,
        organizationId,
        pluginId,
        version: plugin[0].version,
        isActive: true,
        isEnabled: true,
        settings: {},
        permissions: plugin[0].permissions || [],
      }).returning();

      // Update plugin install count
      await db
        .update(marketplacePlugins)
        .set({
          installCount: sql`${marketplacePlugins.installCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(marketplacePlugins.id, pluginId));

      // Initialize plugin settings
      if (plugin[0].manifest?.settings) {
        for (const setting of plugin[0].manifest.settings) {
          await db.insert(pluginSettings).values({
            installationId: installation[0].id,
            userId,
            settingKey: setting.key,
            settingValue: JSON.stringify(setting.default || ''),
            settingType: setting.type,
            isRequired: setting.required,
            defaultValue: JSON.stringify(setting.default || ''),
            description: setting.description,
          });
        }
      }

      // Register plugin if not already registered
      if (!this.plugins.has(pluginId)) {
        // In a real implementation, this would load the plugin code
        // For now, we'll just log the installation
        await this.logPlugin(pluginId, 'info', 'Plugin installed', { 
          installationId: installation[0].id,
          userId 
        });
      }

      return installation[0].id;
    } catch (error) {
      await this.logPlugin(pluginId, 'error', 'Failed to install plugin', { error: error.message });
      throw error;
    }
  }

  /**
   * Uninstall a plugin
   */
  static async uninstallPlugin(
    installationId: number,
    userId: string
  ): Promise<void> {
    try {
      // Get installation details
      const installation = await db
        .select()
        .from(installedPlugins)
        .where(and(
          eq(installedPlugins.id, installationId),
          eq(installedPlugins.userId, userId)
        ))
        .limit(1);

      if (installation.length === 0) {
        throw new Error('Plugin installation not found');
      }

      const pluginId = installation[0].pluginId;

      // Deactivate plugin
      await db
        .update(installedPlugins)
        .set({
          isActive: false,
          isEnabled: false,
          updatedAt: new Date(),
        })
        .where(eq(installedPlugins.id, installationId));

      // Update plugin install count (decrement)
      await db
        .update(marketplacePlugins)
        .set({
          installCount: sql`GREATEST(${marketplacePlugins.installCount} - 1, 0)`,
          updatedAt: new Date(),
        })
        .where(eq(marketplacePlugins.id, pluginId));

      // Remove plugin settings
      await db
        .delete(pluginSettings)
        .where(eq(pluginSettings.installationId, installationId));

      // Remove plugin logs
      await db
        .delete(pluginLogs)
        .where(eq(pluginLogs.installationId, installationId));

      // Unregister plugin hooks
      const hooks = await db
        .select()
        .from(pluginHooks)
        .where(eq(pluginHooks.pluginId, installation[0].pluginId));

      for (const hook of hooks) {
        await this.unregisterHook(hook.hookName, installation[0].pluginId);
      }

      // Finally delete the installation
      await db
        .delete(installedPlugins)
        .where(eq(installedPlugins.id, installationId));

      await this.logPlugin(installation[0].pluginId, 'info', 'Plugin uninstalled', { 
        installationId,
        userId 
      });
    } catch (error) {
      await this.logPlugin(installation[0]?.pluginId || 0, 'error', 'Failed to uninstall plugin', { 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Activate/Deactivate a plugin
   */
  static async togglePlugin(
    installationId: number,
    userId: string,
    isActive: boolean
  ): Promise<void> {
    try {
      await db
        .update(installedPlugins)
        .set({
          isActive,
          isEnabled: isActive,
          updatedAt: new Date(),
        })
        .where(and(
          eq(installedPlugins.id, installationId),
          eq(installedPlugins.userId, userId)
        ));

      await this.logPlugin(installationId, 'info', `Plugin ${isActive ? 'activated' : 'deactivated'}`, { 
        installationId,
        userId 
      });
    } catch (error) {
      await this.logPlugin(installationId, 'error', 'Failed to toggle plugin', { 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Execute a plugin hook
   */
  static async executeHook(
    hookName: string,
    data: any,
    context: PluginContext
  ): Promise<any[]> {
    const hooks = this.hooks.get(hookName) || [];
    const results = [];

    // Sort hooks by priority
    const sortedHooks = hooks.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    for (const hook of sortedHooks) {
      try {
        const result = await hook.callback(data, context);
        results.push(result);
        
        await this.logPlugin(context.pluginId, 'info', `Hook ${hookName} executed successfully`, {
          hookName,
          pluginId: context.pluginId,
        });
      } catch (error) {
        await this.logPlugin(context.pluginId, 'error', `Hook ${hookName} failed`, {
          hookName,
          error: error.message,
          pluginId: context.pluginId,
        });
        
        // Continue with other hooks even if one fails
        results.push({ error: error.message });
      }
    }

    return results;
  }

  /**
   * Get plugin API for a specific installation
   */
  static async getPluginAPI(
    installationId: number,
    userId: string
  ): Promise<PluginAPI> {
    // Get installation details
    const installation = await db
      .select()
      .from(installedPlugins)
      .where(and(
        eq(installedPlugins.id, installationId),
        eq(installedPlugins.userId, userId)
      ))
      .limit(1);

    if (installation.length === 0) {
      throw new Error('Plugin installation not found');
    }

    // Get plugin settings
    const settings = await db
      .select()
      .from(pluginSettings)
      .where(eq(pluginSettings.installationId, installationId));

    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.settingKey] = JSON.parse(setting.settingValue);
      return acc;
    }, {} as Record<string, any>);

    const context: PluginContext = {
      userId,
      organizationId: installation[0].organizationId || undefined,
      pluginId: installation[0].pluginId,
      installationId,
      settings: settingsMap,
      permissions: installation[0].permissions || [],
    };

    return {
      // Data access methods would be implemented here
      getInvoices: async (filters) => {
        // Implementation would query the database
        return [];
      },
      getExpenses: async (filters) => {
        return [];
      },
      getPayments: async (filters) => {
        return [];
      },
      getCustomers: async (filters) => {
        return [];
      },
      
      createInvoice: async (data) => {
        // Implementation would create invoice
        return {};
      },
      updateInvoice: async (id, data) => {
        return {};
      },
      createExpense: async (data) => {
        return {};
      },
      createPayment: async (data) => {
        return {};
      },
      
      sendEmail: async (to, subject, body) => {
        // Implementation would send email
      },
      sendSlackMessage: async (channel, message) => {
        // Implementation would send Slack message
      },
      
      getStorage: async (key) => {
        // Implementation would get from plugin storage
        return null;
      },
      setStorage: async (key, value) => {
        // Implementation would set plugin storage
      },
      
      log: async (level, message, context) => {
        await this.logPlugin(installation[0].pluginId, level, message, context);
      },
    };
  }

  /**
   * Register a plugin hook
   */
  private static registerHook(hookName: string, hook: PluginHook): void {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }
    this.hooks.get(hookName)!.push(hook);
  }

  /**
   * Unregister a plugin hook
   */
  private static unregisterHook(hookName: string, pluginId: number): void {
    const hooks = this.hooks.get(hookName);
    if (hooks) {
      const filteredHooks = hooks.filter(hook => 
        // In a real implementation, we'd track which plugin registered each hook
        true
      );
      this.hooks.set(hookName, filteredHooks);
    }
  }

  /**
   * Validate plugin manifest
   */
  private static validateManifest(manifest: PluginManifest): void {
    if (!manifest.name || !manifest.version || !manifest.description || !manifest.author) {
      throw new Error('Invalid plugin manifest: missing required fields');
    }
    
    if (!manifest.main) {
      throw new Error('Invalid plugin manifest: missing main entry point');
    }
  }

  /**
   * Log plugin activity
   */
  private static async logPlugin(
    pluginId: number,
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    context?: any
  ): Promise<void> {
    try {
      await db.insert(pluginLogs).values({
        pluginId,
        userId: 'system', // System log
        level,
        message,
        context: context || {},
        executionTime: 0,
        memoryUsage: 0,
      });
    } catch (error) {
      console.error('Failed to log plugin activity:', error);
    }
  }

  /**
   * Get installed plugins for user
   */
  static async getUserPlugins(
    userId: string,
    organizationId?: string
  ): Promise<any[]> {
    return await db
      .select({
        installation: installedPlugins,
        plugin: marketplacePlugins,
      })
      .from(installedPlugins)
      .innerJoin(marketplacePlugins, eq(installedPlugins.pluginId, marketplacePlugins.id))
      .where(and(
        eq(installedPlugins.userId, userId),
        organizationId ? eq(installedPlugins.organizationId, organizationId) : undefined
      ))
      .orderBy(desc(installedPlugins.installedAt));
  }

  /**
   * Get plugin logs
   */
  static async getPluginLogs(
    installationId: number,
    userId: string,
    limit: number = 50
  ): Promise<any[]> {
    return await db
      .select()
      .from(pluginLogs)
      .where(and(
        eq(pluginLogs.installationId, installationId),
        eq(pluginLogs.userId, userId)
      ))
      .orderBy(desc(pluginLogs.createdAt))
      .limit(limit);
  }

  /**
   * Update plugin settings
   */
  static async updatePluginSettings(
    installationId: number,
    userId: string,
    settings: Record<string, any>
  ): Promise<void> {
    for (const [key, value] of Object.entries(settings)) {
      await db
        .update(pluginSettings)
        .set({
          settingValue: JSON.stringify(value),
          updatedAt: new Date(),
        })
        .where(and(
          eq(pluginSettings.installationId, installationId),
          eq(pluginSettings.settingKey, key)
        ));
    }
  }
}
