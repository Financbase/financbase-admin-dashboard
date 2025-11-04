# Plugin Development Guide

Learn how to create custom plugins for Financbase to extend functionality and integrate with your specific business needs.

## Table of Contents

1. [Introduction to Plugins](#introduction-to-plugins)
2. [Plugin Architecture](#plugin-architecture)
3. [Creating Your First Plugin](#creating-your-first-plugin)
4. [Plugin API Reference](#plugin-api-reference)
5. [Advanced Features](#advanced-features)
6. [Testing and Debugging](#testing-and-debugging)
7. [Publishing Plugins](#publishing-plugins)

## Introduction to Plugins

Plugins are modular extensions that add new functionality to Financbase. They allow you to:

- **Customize Workflows**: Add new action types and triggers
- **Integrate Services**: Connect with custom APIs and services
- **Extend UI**: Add custom components and pages
- **Enhance Data**: Add custom fields and data processing
- **Automate Tasks**: Create specialized business logic

### Plugin Types

#### 1. Workflow Plugins
Extend the workflow system with new actions and triggers:
- Custom action types
- Specialized triggers
- Data transformations
- External integrations

#### 2. Integration Plugins
Connect with external services:
- API integrations
- Data synchronization
- Authentication providers
- Third-party tools

#### 3. UI Plugins
Add custom user interface elements:
- Dashboard widgets
- Custom pages
- Form components
- Data visualizations

#### 4. Data Plugins
Extend data processing capabilities:
- Custom field types
- Data validation
- Import/export formats
- Data transformations

## Plugin Architecture

### Plugin Structure

```
my-plugin/
├── package.json
├── plugin.json
├── src/
│   ├── index.ts
│   ├── actions/
│   ├── triggers/
│   ├── components/
│   └── utils/
├── tests/
├── docs/
└── README.md
```

### Core Files

#### package.json
```json
{
  "name": "my-financbase-plugin",
  "version": "1.0.0",
  "description": "My custom Financbase plugin",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "@financbase/plugin-sdk": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "jest": "^29.0.0"
  }
}
```

#### plugin.json
```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "description": "A custom plugin for Financbase",
  "version": "1.0.0",
  "author": "Your Name",
  "license": "Proprietary",
  "category": "Integration",
  "tags": ["custom", "api", "automation"],
  "requirements": {
    "financbase": ">=2.0.0"
  },
  "permissions": [
    "workflow.execute",
    "data.read",
    "api.call"
  ],
  "hooks": [
    "workflow.action",
    "workflow.trigger",
    "ui.component"
  ]
}
```

## Creating Your First Plugin

### Step 1: Set Up the Project

1. Create a new directory for your plugin
2. Initialize with npm:
   ```bash
   npm init -y
   ```
3. Install the Financbase Plugin SDK:
   ```bash
   npm install @financbase/plugin-sdk
   ```

### Step 2: Create the Plugin Entry Point

#### src/index.ts
```typescript
import { Plugin, PluginContext } from '@financbase/plugin-sdk';

export class MyPlugin implements Plugin {
  constructor(private context: PluginContext) {}

  async initialize(): Promise<void> {
    // Plugin initialization logic
    console.log('My Plugin initialized');
  }

  async destroy(): Promise<void> {
    // Cleanup logic
    console.log('My Plugin destroyed');
  }

  getActions() {
    return [
      {
        id: 'send-sms',
        name: 'Send SMS',
        description: 'Send SMS message to a phone number',
        config: {
          phoneNumber: {
            type: 'string',
            required: true,
            description: 'Phone number to send SMS to'
          },
          message: {
            type: 'string',
            required: true,
            description: 'SMS message content'
          }
        },
        execute: async (config, variables) => {
          // SMS sending logic
          const phoneNumber = this.interpolate(config.phoneNumber, variables);
          const message = this.interpolate(config.message, variables);
          
          // Call SMS API
          const result = await this.sendSMS(phoneNumber, message);
          
          return {
            success: true,
            data: result
          };
        }
      }
    ];
  }

  getTriggers() {
    return [
      {
        id: 'sms-received',
        name: 'SMS Received',
        description: 'Triggered when SMS is received',
        config: {
          phoneNumber: {
            type: 'string',
            required: true,
            description: 'Phone number to monitor'
          }
        },
        subscribe: async (config, callback) => {
          // Subscribe to SMS webhook
          await this.subscribeToSMS(config.phoneNumber, callback);
        }
      }
    ];
  }

  private interpolate(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  private async sendSMS(phoneNumber: string, message: string): Promise<any> {
    // Implement SMS sending logic
    // This would typically call an SMS service API
    return { messageId: 'msg_123', status: 'sent' };
  }

  private async subscribeToSMS(phoneNumber: string, callback: Function): Promise<void> {
    // Implement SMS webhook subscription
    // This would typically set up a webhook endpoint
  }
}

export default MyPlugin;
```

### Step 3: Create Custom Actions

#### src/actions/sms-action.ts
```typescript
import { Action, ActionConfig, ActionResult } from '@financbase/plugin-sdk';

export class SMSAction implements Action {
  id = 'send-sms';
  name = 'Send SMS';
  description = 'Send SMS message to a phone number';

  getConfig(): ActionConfig {
    return {
      phoneNumber: {
        type: 'string',
        required: true,
        description: 'Phone number to send SMS to',
        validation: {
          pattern: '^\\+?[1-9]\\d{1,14}$',
          message: 'Invalid phone number format'
        }
      },
      message: {
        type: 'string',
        required: true,
        description: 'SMS message content',
        validation: {
          maxLength: 160,
          message: 'Message too long'
        }
      },
      provider: {
        type: 'select',
        required: true,
        description: 'SMS provider',
        options: [
          { value: 'twilio', label: 'Twilio' },
          { value: 'aws-sns', label: 'AWS SNS' },
          { value: 'custom', label: 'Custom API' }
        ]
      }
    };
  }

  async execute(config: any, variables: Record<string, any>): Promise<ActionResult> {
    try {
      const phoneNumber = this.interpolate(config.phoneNumber, variables);
      const message = this.interpolate(config.message, variables);
      
      const result = await this.sendSMS(phoneNumber, message, config.provider);
      
      return {
        success: true,
        data: result,
        logs: [`SMS sent to ${phoneNumber}`]
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        logs: [`SMS failed: ${error.message}`]
      };
    }
  }

  private interpolate(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  private async sendSMS(phoneNumber: string, message: string, provider: string): Promise<any> {
    switch (provider) {
      case 'twilio':
        return await this.sendViaTwilio(phoneNumber, message);
      case 'aws-sns':
        return await this.sendViaAWSSNS(phoneNumber, message);
      case 'custom':
        return await this.sendViaCustomAPI(phoneNumber, message);
      default:
        throw new Error(`Unknown SMS provider: ${provider}`);
    }
  }

  private async sendViaTwilio(phoneNumber: string, message: string): Promise<any> {
    // Twilio implementation
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    // Call Twilio API
    return { messageId: 'twilio_123', status: 'sent' };
  }

  private async sendViaAWSSNS(phoneNumber: string, message: string): Promise<any> {
    // AWS SNS implementation
    return { messageId: 'sns_123', status: 'sent' };
  }

  private async sendViaCustomAPI(phoneNumber: string, message: string): Promise<any> {
    // Custom API implementation
    return { messageId: 'custom_123', status: 'sent' };
  }
}
```

### Step 4: Create Custom Triggers

#### src/triggers/sms-trigger.ts
```typescript
import { Trigger, TriggerConfig } from '@financbase/plugin-sdk';

export class SMSTrigger implements Trigger {
  id = 'sms-received';
  name = 'SMS Received';
  description = 'Triggered when SMS is received';

  getConfig(): TriggerConfig {
    return {
      phoneNumber: {
        type: 'string',
        required: true,
        description: 'Phone number to monitor',
        validation: {
          pattern: '^\\+?[1-9]\\d{1,14}$',
          message: 'Invalid phone number format'
        }
      },
      keywords: {
        type: 'array',
        required: false,
        description: 'Keywords to filter SMS messages',
        items: {
          type: 'string'
        }
      }
    };
  }

  async subscribe(config: any, callback: Function): Promise<void> {
    const phoneNumber = config.phoneNumber;
    const keywords = config.keywords || [];
    
    // Set up webhook endpoint
    const webhookUrl = await this.createWebhookEndpoint(phoneNumber, keywords, callback);
    
    // Register webhook with SMS provider
    await this.registerWebhook(webhookUrl);
  }

  async unsubscribe(): Promise<void> {
    // Clean up webhook endpoint
    await this.removeWebhookEndpoint();
  }

  private async createWebhookEndpoint(phoneNumber: string, keywords: string[], callback: Function): Promise<string> {
    // Create webhook endpoint for SMS
    const webhookUrl = `https://api.financbase.com/plugins/my-plugin/webhooks/sms`;
    
    // Store webhook configuration
    await this.storeWebhookConfig(phoneNumber, keywords, callback);
    
    return webhookUrl;
  }

  private async registerWebhook(webhookUrl: string): Promise<void> {
    // Register webhook with SMS provider
    // This would typically call the provider's API
  }

  private async removeWebhookEndpoint(): Promise<void> {
    // Remove webhook endpoint
    // This would typically call the provider's API
  }

  private async storeWebhookConfig(phoneNumber: string, keywords: string[], callback: Function): Promise<void> {
    // Store webhook configuration in database
  }
}
```

### Step 5: Create UI Components

#### src/components/sms-config.tsx
```typescript
import React from 'react';
import { PluginComponent } from '@financbase/plugin-sdk';

interface SMSConfigProps {
  config: any;
  onChange: (config: any) => void;
}

export const SMSConfig: React.FC<SMSConfigProps> = ({ config, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <input
          type="tel"
          value={config.phoneNumber || ''}
          onChange={(e) => onChange({ ...config, phoneNumber: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="+1234567890"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Message
        </label>
        <textarea
          value={config.message || ''}
          onChange={(e) => onChange({ ...config, message: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={3}
          placeholder="Enter your message here..."
        />
        <p className="mt-1 text-sm text-gray-500">
          {config.message?.length || 0}/160 characters
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Provider
        </label>
        <select
          value={config.provider || 'twilio'}
          onChange={(e) => onChange({ ...config, provider: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="twilio">Twilio</option>
          <option value="aws-sns">AWS SNS</option>
          <option value="custom">Custom API</option>
        </select>
      </div>
    </div>
  );
};

export default SMSConfig;
```

## Plugin API Reference

### Core Interfaces

#### Plugin
```typescript
interface Plugin {
  initialize(): Promise<void>;
  destroy(): Promise<void>;
  getActions(): Action[];
  getTriggers(): Trigger[];
  getComponents(): Component[];
  getHooks(): Hook[];
}
```

#### Action
```typescript
interface Action {
  id: string;
  name: string;
  description: string;
  getConfig(): ActionConfig;
  execute(config: any, variables: Record<string, any>): Promise<ActionResult>;
}
```

#### Trigger
```typescript
interface Trigger {
  id: string;
  name: string;
  description: string;
  getConfig(): TriggerConfig;
  subscribe(config: any, callback: Function): Promise<void>;
  unsubscribe(): Promise<void>;
}
```

#### Component
```typescript
interface Component {
  id: string;
  name: string;
  type: 'config' | 'display' | 'form';
  render(props: any): React.ReactElement;
}
```

### Plugin Context

The plugin context provides access to Financbase services:

```typescript
interface PluginContext {
  // Database access
  db: Database;
  
  // API client
  api: APIClient;
  
  // Event system
  events: EventEmitter;
  
  // Configuration
  config: PluginConfig;
  
  // Logging
  logger: Logger;
  
  // Storage
  storage: Storage;
}
```

### Database Access

```typescript
// Read data
const invoices = await this.context.db.query('SELECT * FROM invoices WHERE status = ?', ['pending']);

// Write data
await this.context.db.query('INSERT INTO custom_data (id, value) VALUES (?, ?)', [id, value]);

// Transactions
await this.context.db.transaction(async (tx) => {
  await tx.query('UPDATE invoices SET status = ? WHERE id = ?', ['paid', invoiceId]);
  await tx.query('INSERT INTO payments (invoice_id, amount) VALUES (?, ?)', [invoiceId, amount]);
});
```

### API Client

```typescript
// Make HTTP requests
const response = await this.context.api.get('/invoices');
const result = await this.context.api.post('/payments', { amount: 100 });

// With authentication
const response = await this.context.api.get('/protected-endpoint', {
  headers: { 'Authorization': 'Bearer token' }
});
```

### Event System

```typescript
// Emit events
this.context.events.emit('plugin.custom-event', { data: 'value' });

// Listen to events
this.context.events.on('invoice.created', (invoice) => {
  console.log('New invoice created:', invoice);
});
```

### Storage

```typescript
// Store plugin data
await this.context.storage.set('plugin.config', { apiKey: 'secret' });

// Retrieve plugin data
const config = await this.context.storage.get('plugin.config');

// Remove plugin data
await this.context.storage.delete('plugin.config');
```

## Advanced Features

### Custom Hooks

```typescript
export class MyPlugin implements Plugin {
  getHooks() {
    return [
      {
        id: 'before-invoice-send',
        name: 'Before Invoice Send',
        description: 'Hook called before sending an invoice',
        execute: async (data) => {
          // Custom logic before sending invoice
          data.customField = 'processed';
          return data;
        }
      }
    ];
  }
}
```

### Custom Field Types

```typescript
export class CustomFieldType implements FieldType {
  id = 'phone-number';
  name = 'Phone Number';
  
  validate(value: any): boolean {
    return /^\+?[1-9]\d{1,14}$/.test(value);
  }
  
  format(value: any): string {
    return value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  }
  
  render(props: FieldProps): React.ReactElement {
    return <PhoneNumberInput {...props} />;
  }
}
```

### Custom Workflow Steps

```typescript
export class CustomWorkflowStep implements WorkflowStep {
  id = 'custom-processing';
  name = 'Custom Processing';
  
  getConfig(): StepConfig {
    return {
      processingType: {
        type: 'select',
        options: ['validate', 'transform', 'enrich']
      },
      rules: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            condition: { type: 'string' },
            action: { type: 'string' }
          }
        }
      }
    };
  }
  
  async execute(config: any, data: any): Promise<any> {
    // Custom processing logic
    return processedData;
  }
}
```

## Testing and Debugging

### Unit Testing

```typescript
import { MyPlugin } from '../src/index';

describe('MyPlugin', () => {
  let plugin: MyPlugin;
  let mockContext: PluginContext;

  beforeEach(() => {
    mockContext = {
      db: mockDatabase,
      api: mockAPIClient,
      events: mockEventEmitter,
      config: mockConfig,
      logger: mockLogger,
      storage: mockStorage
    };
    
    plugin = new MyPlugin(mockContext);
  });

  it('should initialize correctly', async () => {
    await plugin.initialize();
    expect(mockContext.logger.info).toHaveBeenCalledWith('My Plugin initialized');
  });

  it('should execute SMS action', async () => {
    const actions = plugin.getActions();
    const smsAction = actions.find(a => a.id === 'send-sms');
    
    const result = await smsAction.execute({
      phoneNumber: '+1234567890',
      message: 'Test message'
    }, {});
    
    expect(result.success).toBe(true);
  });
});
```

### Integration Testing

```typescript
import { PluginTester } from '@financbase/plugin-sdk/testing';

describe('Plugin Integration', () => {
  let tester: PluginTester;

  beforeEach(async () => {
    tester = new PluginTester();
    await tester.setup();
  });

  it('should handle workflow execution', async () => {
    const workflow = {
      trigger: { type: 'manual' },
      actions: [
        {
          type: 'send-sms',
          config: {
            phoneNumber: '+1234567890',
            message: 'Test message'
          }
        }
      ]
    };
    
    const result = await tester.executeWorkflow(workflow);
    expect(result.success).toBe(true);
  });
});
```

### Debugging

```typescript
export class MyPlugin implements Plugin {
  async execute(config: any, variables: Record<string, any>): Promise<ActionResult> {
    // Enable debug logging
    this.context.logger.debug('Executing SMS action', { config, variables });
    
    try {
      const result = await this.sendSMS(config.phoneNumber, config.message);
      
      this.context.logger.info('SMS sent successfully', { result });
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      this.context.logger.error('SMS failed', { error: error.message });
      
      return {
        success: false,
        error: error.message
      };
    }
  }
}
```

## Publishing Plugins

### 1. Prepare for Publishing

1. **Complete Documentation**
   - README.md with installation instructions
   - API documentation
   - Usage examples
   - Changelog

2. **Test Thoroughly**
   - Unit tests
   - Integration tests
   - Performance tests
   - Security audit

3. **Version Management**
   - Semantic versioning
   - Version tags
   - Release notes

### 2. Package Configuration

#### package.json
```json
{
  "name": "@your-org/financbase-sms-plugin",
  "version": "1.0.0",
  "description": "SMS integration plugin for Financbase",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist/",
    "plugin.json",
    "README.md"
  ],
  "keywords": [
    "financbase",
    "plugin",
    "sms",
    "automation"
  ],
  "author": "Your Name <your.email@example.com>",
  "license": "Proprietary",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/financbase-sms-plugin.git"
  },
  "bugs": {
    "url": "https://github.com/your-org/financbase-sms-plugin/issues"
  },
  "homepage": "https://github.com/your-org/financbase-sms-plugin#readme"
}
```

### 3. Build and Publish

```bash
# Build the plugin
npm run build

# Test the build
npm test

# Publish to npm
npm publish

# Publish to Financbase Marketplace
financbase plugin publish
```

### 4. Marketplace Listing

#### plugin.json
```json
{
  "id": "sms-plugin",
  "name": "SMS Integration",
  "description": "Send SMS messages and receive SMS triggers in your workflows",
  "version": "1.0.0",
  "author": "Your Name",
  "license": "Proprietary",
  "category": "Communication",
  "tags": ["sms", "messaging", "automation"],
  "price": {
    "type": "free"
  },
  "screenshots": [
    "https://example.com/screenshot1.png",
    "https://example.com/screenshot2.png"
  ],
  "documentation": "https://github.com/your-org/financbase-sms-plugin#readme",
  "support": "https://github.com/your-org/financbase-sms-plugin/issues"
}
```

## Best Practices

### 1. Plugin Design

- **Single Responsibility**: Each plugin should have one clear purpose
- **Modularity**: Break functionality into logical modules
- **Reusability**: Design for reuse across different contexts
- **Extensibility**: Allow for future extensions and modifications

### 2. Performance

- **Lazy Loading**: Load resources only when needed
- **Caching**: Cache frequently used data
- **Async Operations**: Use async/await for I/O operations
- **Resource Management**: Clean up resources properly

### 3. Security

- **Input Validation**: Validate all inputs
- **Authentication**: Use secure authentication methods
- **Authorization**: Implement proper access controls
- **Data Protection**: Encrypt sensitive data

### 4. Error Handling

- **Graceful Degradation**: Handle errors gracefully
- **User Feedback**: Provide clear error messages
- **Logging**: Log errors for debugging
- **Recovery**: Implement error recovery mechanisms

### 5. Documentation

- **Code Comments**: Document complex logic
- **API Documentation**: Document all public APIs
- **Usage Examples**: Provide practical examples
- **Troubleshooting**: Include common issues and solutions

## Conclusion

Plugin development for Financbase allows you to extend the platform's functionality and integrate with your specific business needs. Start with simple plugins and gradually add complexity as you become more familiar with the system.

For more information, check out our [API documentation](../api/workflows.md) and [plugin examples](https://github.com/financbase/plugin-examples) (see [External Resources](../EXTERNAL_RESOURCES.md) for repository status - repository not yet created).
