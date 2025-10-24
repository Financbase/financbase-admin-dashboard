export const WORKFLOW_TEMPLATES = [
  {
    id: 1,
    name: 'Invoice Approval Flow',
    description: 'Automatically route invoices for approval based on amount',
    category: 'invoice',
    isOfficial: true,
    isPopular: true,
    usageCount: 1250,
    tags: ['invoice', 'approval', 'automation'],
    version: '1.0.0',
    isActive: true,
    templateConfig: {
      steps: [
        {
          id: 'step_1',
          name: 'Check Invoice Amount',
          type: 'condition',
          configuration: {
            conditions: {
              'trigger_data.amount': {
                operator: 'greater_than',
                value: 1000
              }
            }
          },
          order: 1
        },
        {
          id: 'step_2',
          name: 'Send to Manager',
          type: 'email',
          configuration: {
            to: '{{trigger_data.manager_email}}',
            subject: 'Invoice Approval Required - {{trigger_data.invoice_number}}',
            template: 'invoice_approval',
            body: 'Please review and approve invoice {{trigger_data.invoice_number}} for ${{trigger_data.amount}}'
          },
          order: 2
        },
        {
          id: 'step_3',
          name: 'Auto Approve',
          type: 'action',
          configuration: {
            actionType: 'approve_invoice',
            parameters: {
              invoiceId: '{{trigger_data.invoice_id}}',
              approvedBy: 'system'
            }
          },
          order: 3
        }
      ],
      triggers: [
        {
          id: 'trigger_1',
          eventType: 'invoice_created',
          conditions: {
            status: 'pending'
          },
          isActive: true
        }
      ],
      variables: {
        approval_threshold: 1000,
        manager_email: 'manager@company.com'
      },
      settings: {
        timeout: 3600,
        retryCount: 3
      }
    }
  },
  {
    id: 2,
    name: 'Overdue Invoice Reminders',
    description: 'Send automated reminders for overdue invoices',
    category: 'invoice',
    isOfficial: true,
    isPopular: true,
    usageCount: 980,
    tags: ['invoice', 'reminders', 'collections'],
    version: '1.0.0',
    isActive: true,
    templateConfig: {
      steps: [
        {
          id: 'step_1',
          name: 'Check Overdue Status',
          type: 'condition',
          configuration: {
            conditions: {
              'trigger_data.days_overdue': {
                operator: 'greater_than',
                value: 0
              }
            }
          },
          order: 1
        },
        {
          id: 'step_2',
          name: 'Send First Reminder',
          type: 'email',
          configuration: {
            to: '{{trigger_data.client_email}}',
            subject: 'Payment Reminder - Invoice {{trigger_data.invoice_number}}',
            template: 'payment_reminder',
            body: 'This is a friendly reminder that payment for invoice {{trigger_data.invoice_number}} is overdue by {{trigger_data.days_overdue}} days.'
          },
          order: 2
        },
        {
          id: 'step_3',
          name: 'Wait 3 Days',
          type: 'delay',
          configuration: {
            duration: '3 days'
          },
          order: 3
        },
        {
          id: 'step_4',
          name: 'Send Final Notice',
          type: 'email',
          configuration: {
            to: '{{trigger_data.client_email}}',
            subject: 'Final Notice - Overdue Invoice {{trigger_data.invoice_number}}',
            template: 'final_notice',
            body: 'This is a final notice regarding overdue invoice {{trigger_data.invoice_number}}. Please remit payment immediately.'
          },
          order: 4
        }
      ],
      triggers: [
        {
          id: 'trigger_1',
          eventType: 'schedule',
          configuration: {
            scheduleExpression: '0 9 * * *' // Daily at 9 AM
          },
          isActive: true
        }
      ],
      variables: {
        reminder_days: [7, 14, 30],
        final_notice_days: 45
      },
      settings: {
        timeout: 7200,
        retryCount: 2
      }
    }
  },
  {
    id: 3,
    name: 'Expense Report Automation',
    description: 'Generate monthly expense reports automatically',
    category: 'expense',
    isOfficial: true,
    isPopular: false,
    usageCount: 450,
    tags: ['expense', 'reporting', 'monthly'],
    version: '1.0.0',
    isActive: true,
    templateConfig: {
      steps: [
        {
          id: 'step_1',
          name: 'Generate Report',
          type: 'action',
          configuration: {
            actionType: 'generate_expense_report',
            parameters: {
              month: '{{trigger_data.month}}',
              year: '{{trigger_data.year}}'
            }
          },
          order: 1
        },
        {
          id: 'step_2',
          name: 'AI Analysis',
          type: 'gpt',
          configuration: {
            query: 'Analyze the expense report for {{trigger_data.month}} {{trigger_data.year}} and provide insights on spending patterns, anomalies, and recommendations.',
            analysisType: 'expense_analysis'
          },
          order: 2
        },
        {
          id: 'step_3',
          name: 'Send Report',
          type: 'email',
          configuration: {
            to: '{{trigger_data.manager_email}}',
            subject: 'Monthly Expense Report - {{trigger_data.month}} {{trigger_data.year}}',
            template: 'expense_report',
            body: 'Please find attached the monthly expense report with AI-generated insights.'
          },
          order: 3
        }
      ],
      triggers: [
        {
          id: 'trigger_1',
          eventType: 'schedule',
          configuration: {
            scheduleExpression: '0 9 1 * *' // First day of every month at 9 AM
          },
          isActive: true
        }
      ],
      variables: {
        manager_email: 'manager@company.com',
        report_format: 'pdf'
      },
      settings: {
        timeout: 1800,
        retryCount: 1
      }
    }
  },
  {
    id: 4,
    name: 'Client Onboarding',
    description: 'Automated welcome sequence for new clients',
    category: 'client',
    isOfficial: true,
    isPopular: true,
    usageCount: 750,
    tags: ['client', 'onboarding', 'welcome'],
    version: '1.0.0',
    isActive: true,
    templateConfig: {
      steps: [
        {
          id: 'step_1',
          name: 'Send Welcome Email',
          type: 'email',
          configuration: {
            to: '{{trigger_data.client_email}}',
            subject: 'Welcome to {{trigger_data.company_name}}!',
            template: 'client_welcome',
            body: 'Welcome {{trigger_data.client_name}}! We\'re excited to have you on board.'
          },
          order: 1
        },
        {
          id: 'step_2',
          name: 'Create Client Portal',
          type: 'action',
          configuration: {
            actionType: 'create_client_portal',
            parameters: {
              clientId: '{{trigger_data.client_id}}',
              clientName: '{{trigger_data.client_name}}'
            }
          },
          order: 2
        },
        {
          id: 'step_3',
          name: 'Send Portal Access',
          type: 'email',
          configuration: {
            to: '{{trigger_data.client_email}}',
            subject: 'Your Client Portal Access',
            template: 'portal_access',
            body: 'Your client portal is ready! Access it with the credentials provided.'
          },
          order: 3
        },
        {
          id: 'step_4',
          name: 'Schedule Follow-up',
          type: 'action',
          configuration: {
            actionType: 'schedule_followup',
            parameters: {
              clientId: '{{trigger_data.client_id}}',
              followupDate: '{{trigger_data.followup_date}}'
            }
          },
          order: 4
        }
      ],
      triggers: [
        {
          id: 'trigger_1',
          eventType: 'client_created',
          conditions: {
            status: 'active'
          },
          isActive: true
        }
      ],
      variables: {
        company_name: 'Your Company',
        followup_days: 7
      },
      settings: {
        timeout: 3600,
        retryCount: 2
      }
    }
  },
  {
    id: 5,
    name: 'Monthly Financial Summary',
    description: 'Generate and distribute monthly financial summaries',
    category: 'reporting',
    isOfficial: true,
    isPopular: false,
    usageCount: 320,
    tags: ['reporting', 'monthly', 'financial'],
    version: '1.0.0',
    isActive: true,
    templateConfig: {
      steps: [
        {
          id: 'step_1',
          name: 'Collect Financial Data',
          type: 'action',
          configuration: {
            actionType: 'collect_financial_data',
            parameters: {
              month: '{{trigger_data.month}}',
              year: '{{trigger_data.year}}'
            }
          },
          order: 1
        },
        {
          id: 'step_2',
          name: 'Generate Summary',
          type: 'action',
          configuration: {
            actionType: 'generate_financial_summary',
            parameters: {
              data: '{{step_results.step_1.data}}'
            }
          },
          order: 2
        },
        {
          id: 'step_3',
          name: 'AI Analysis',
          type: 'gpt',
          configuration: {
            query: 'Analyze the financial data for {{trigger_data.month}} {{trigger_data.year}} and provide insights on revenue, expenses, and profitability trends.',
            analysisType: 'financial_analysis'
          },
          order: 3
        },
        {
          id: 'step_4',
          name: 'Send to Stakeholders',
          type: 'email',
          configuration: {
            to: '{{trigger_data.stakeholder_emails}}',
            subject: 'Monthly Financial Summary - {{trigger_data.month}} {{trigger_data.year}}',
            template: 'financial_summary',
            body: 'Please find attached the monthly financial summary with AI-generated insights.'
          },
          order: 4
        }
      ],
      triggers: [
        {
          id: 'trigger_1',
          eventType: 'schedule',
          configuration: {
            scheduleExpression: '0 10 1 * *' // First day of every month at 10 AM
          },
          isActive: true
        }
      ],
      variables: {
        stakeholder_emails: ['ceo@company.com', 'cfo@company.com'],
        report_format: 'pdf'
      },
      settings: {
        timeout: 3600,
        retryCount: 1
      }
    }
  },
  {
    id: 6,
    name: 'Budget Alert System',
    description: 'Monitor budget thresholds and send alerts',
    category: 'automation',
    isOfficial: true,
    isPopular: true,
    usageCount: 680,
    tags: ['budget', 'alerts', 'monitoring'],
    version: '1.0.0',
    isActive: true,
    templateConfig: {
      steps: [
        {
          id: 'step_1',
          name: 'Check Budget Status',
          type: 'condition',
          configuration: {
            conditions: {
              'trigger_data.budget_used_percentage': {
                operator: 'greater_than',
                value: 80
              }
            }
          },
          order: 1
        },
        {
          id: 'step_2',
          name: 'Send Alert',
          type: 'notification',
          configuration: {
            type: 'budget_alert',
            title: 'Budget Alert - {{trigger_data.category}}',
            message: 'Budget for {{trigger_data.category}} is {{trigger_data.budget_used_percentage}}% used.',
            priority: 'high'
          },
          order: 2
        },
        {
          id: 'step_3',
          name: 'Email Notification',
          type: 'email',
          configuration: {
            to: '{{trigger_data.manager_email}}',
            subject: 'Budget Alert: {{trigger_data.category}}',
            template: 'budget_alert',
            body: 'Budget for {{trigger_data.category}} has reached {{trigger_data.budget_used_percentage}}% of the allocated amount.'
          },
          order: 3
        }
      ],
      triggers: [
        {
          id: 'trigger_1',
          eventType: 'budget_threshold_reached',
          conditions: {
            threshold: 80
          },
          isActive: true
        }
      ],
      variables: {
        manager_email: 'manager@company.com',
        alert_thresholds: [80, 90, 95]
      },
      settings: {
        timeout: 300,
        retryCount: 3
      }
    }
  }
];
