#!/usr/bin/env node

/**
 * Sentry Alert Configuration Script
 * 
 * Configures Sentry alerts and notification channels for production monitoring.
 * This script generates configuration that should be applied in Sentry dashboard.
 */

const fs = require('fs');
const path = require('path');

const alertConfig = {
  // Error Rate Alerts
  errorRate: {
    name: 'High Error Rate',
    description: 'Alert when error rate exceeds 0.1%',
    conditions: [
      {
        type: 'error_rate',
        threshold: 0.001, // 0.1%
        window: '1h',
        comparison: 'above'
      }
    ],
    actions: [
      {
        type: 'email',
        targets: ['engineering@financbase.com', 'oncall@financbase.com']
      },
      {
        type: 'slack',
        channel: '#alerts-production'
      }
    ]
  },

  // Performance Alerts
  performance: {
    name: 'Slow API Response Time',
    description: 'Alert when API response time exceeds 200ms (95th percentile)',
    conditions: [
      {
        type: 'performance',
        metric: 'p95',
        threshold: 200, // milliseconds
        window: '5m',
        comparison: 'above'
      }
    ],
    actions: [
      {
        type: 'email',
        targets: ['engineering@financbase.com']
      }
    ]
  },

  // Critical Errors
  criticalErrors: {
    name: 'Critical Errors',
    description: 'Alert on critical errors (authentication failures, payment errors, etc.)',
    conditions: [
      {
        type: 'error',
        tags: {
          level: 'error',
          category: ['authentication', 'payment', 'database']
        },
        threshold: 1,
        window: '5m'
      }
    ],
    actions: [
      {
        type: 'email',
        targets: ['engineering@financbase.com', 'oncall@financbase.com']
      },
      {
        type: 'slack',
        channel: '#alerts-critical'
      },
      {
        type: 'pagerduty',
        service: 'production-critical'
      }
    ]
  },

  // Database Connection Errors
  databaseErrors: {
    name: 'Database Connection Errors',
    description: 'Alert on database connection failures',
    conditions: [
      {
        type: 'error',
        message: ['ECONNREFUSED', 'connection', 'database', 'timeout'],
        threshold: 5,
        window: '10m'
      }
    ],
    actions: [
      {
        type: 'email',
        targets: ['engineering@financbase.com', 'dba@financbase.com']
      },
      {
        type: 'slack',
        channel: '#alerts-database'
      }
    ]
  },

  // Memory Leaks
  memoryLeaks: {
    name: 'Memory Leak Detection',
    description: 'Alert on potential memory leaks',
    conditions: [
      {
        type: 'memory',
        threshold: 80, // 80% memory usage
        window: '15m',
        comparison: 'above'
      }
    ],
    actions: [
      {
        type: 'email',
        targets: ['engineering@financbase.com']
      }
    ]
  },

  // Release Health
  releaseHealth: {
    name: 'Release Health Degradation',
    description: 'Alert when new release has higher error rate than previous',
    conditions: [
      {
        type: 'release_health',
        threshold: 0.5, // 50% increase in error rate
        window: '1h'
      }
    ],
    actions: [
      {
        type: 'email',
        targets: ['engineering@financbase.com']
      },
      {
        type: 'slack',
        channel: '#alerts-releases'
      }
    ]
  }
};

const notificationChannels = {
  email: [
    {
      name: 'Engineering Team',
      address: 'engineering@financbase.com',
      type: 'email'
    },
    {
      name: 'On-Call Team',
      address: 'oncall@financbase.com',
      type: 'email'
    },
    {
      name: 'Database Team',
      address: 'dba@financbase.com',
      type: 'email'
    }
  ],
  slack: [
    {
      name: 'Production Alerts',
      channel: '#alerts-production',
      workspace: 'financbase'
    },
    {
      name: 'Critical Alerts',
      channel: '#alerts-critical',
      workspace: 'financbase'
    },
    {
      name: 'Database Alerts',
      channel: '#alerts-database',
      workspace: 'financbase'
    },
    {
      name: 'Release Alerts',
      channel: '#alerts-releases',
      workspace: 'financbase'
    }
  ]
};

function generateSentryConfig() {
  const configDir = path.join(process.cwd(), 'config', 'sentry');
  const alertsFile = path.join(configDir, 'alerts.json');
  const channelsFile = path.join(configDir, 'notification-channels.json');

  // Ensure directory exists
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  // Write alert configuration
  fs.writeFileSync(
    alertsFile,
    JSON.stringify(alertConfig, null, 2),
    'utf8'
  );

  // Write notification channels
  fs.writeFileSync(
    channelsFile,
    JSON.stringify(notificationChannels, null, 2),
    'utf8'
  );

  console.log('✅ Sentry alert configuration generated:');
  console.log(`   - ${alertsFile}`);
  console.log(`   - ${channelsFile}`);
  console.log('');
  console.log('📋 Next Steps:');
  console.log('   1. Review the generated configuration files');
  console.log('   2. Update email addresses and Slack channels as needed');
  console.log('   3. Apply these alerts in your Sentry dashboard:');
  console.log('      - Go to Settings > Alerts');
  console.log('      - Create new alerts based on the configuration');
  console.log('   4. Configure notification channels in Sentry:');
  console.log('      - Go to Settings > Integrations');
  console.log('      - Set up email and Slack integrations');
  console.log('');
}

function printAlertSummary() {
  console.log('📊 Alert Configuration Summary:');
  console.log('');
  
  Object.entries(alertConfig).forEach(([key, config]) => {
    console.log(`  • ${config.name}`);
    console.log(`    ${config.description}`);
    console.log('');
  });
}

// Main execution
if (require.main === module) {
  console.log('');
  console.log('🔔 Sentry Alert Configuration Setup');
  console.log('====================================');
  console.log('');
  
  printAlertSummary();
  generateSentryConfig();
  
  console.log('✅ Configuration complete!');
  console.log('');
}

module.exports = { alertConfig, notificationChannels };

