/**
 * Email Service
 * 
 * Provides email sending functionality using Resend
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { resend } from '@/lib/email';
import { db } from '@/lib/db';
import { emailTemplates } from '@/lib/db/schemas/email-templates.schema';
import { eq, and } from 'drizzle-orm';
import { readFile } from 'fs/promises';
import { join } from 'path';

export interface SendEmailOptions {
  to: string | string[];
  from?: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
  tags?: Array<{ name: string; value: string }>;
  metadata?: Record<string, string>;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(
  options: SendEmailOptions
): Promise<SendEmailResult> {
  try {
    const from = options.from || process.env.RESEND_FROM_EMAIL || 'noreply@financbase.com';
    
    const result = await resend.emails.send({
      from,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
      reply_to: options.replyTo,
      cc: options.cc,
      bcc: options.bcc,
      attachments: options.attachments?.map(att => ({
        filename: att.filename,
        content: typeof att.content === 'string' 
          ? Buffer.from(att.content, 'utf-8')
          : att.content,
        content_type: att.contentType,
      })),
      tags: options.tags,
      metadata: options.metadata,
    });

    if (result.error) {
      return {
        success: false,
        error: result.error.message || 'Failed to send email',
      };
    }

    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error) {
    console.error('Email service error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Built-in email templates
 */
const BUILT_IN_TEMPLATES: Record<string, { subject: string; html: string; text: string }> = {
  welcome: {
    subject: 'Welcome to {{appName}}!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">Welcome to {{appName}}!</h1>
          <p>Hi {{name}},</p>
          <p>Thank you for joining {{appName}}. We're excited to have you on board!</p>
          {{#if message}}
          <p>{{message}}</p>
          {{/if}}
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Best regards,<br>The {{appName}} Team</p>
        </body>
      </html>
    `,
    text: `
Welcome to {{appName}}!

Hi {{name}},

Thank you for joining {{appName}}. We're excited to have you on board!

{{#if message}}
{{message}}
{{/if}}

If you have any questions, feel free to reach out to our support team.

Best regards,
The {{appName}} Team
    `,
  },
  password_reset: {
    subject: 'Reset Your Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">Reset Your Password</h1>
          <p>Hi {{name}},</p>
          <p>You requested to reset your password. Click the button below to reset it:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="{{resetUrl}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #2563eb;">{{resetUrl}}</p>
          <p>This link will expire in {{expiryHours}} hours.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </body>
      </html>
    `,
    text: `
Reset Your Password

Hi {{name}},

You requested to reset your password. Visit the following link to reset it:

{{resetUrl}}

This link will expire in {{expiryHours}} hours.

If you didn't request this, please ignore this email.
    `,
  },
  invoice: {
    subject: 'Invoice {{invoiceNumber}} from {{companyName}}',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">Invoice {{invoiceNumber}}</h1>
          <p>Hi {{customerName}},</p>
          <p>Please find your invoice attached below.</p>
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Invoice Number:</strong> {{invoiceNumber}}</p>
            <p><strong>Amount:</strong> {{amount}}</p>
            <p><strong>Due Date:</strong> {{dueDate}}</p>
          </div>
          <p>Thank you for your business!</p>
        </body>
      </html>
    `,
    text: `
Invoice {{invoiceNumber}}

Hi {{customerName}},

Please find your invoice details below.

Invoice Number: {{invoiceNumber}}
Amount: {{amount}}
Due Date: {{dueDate}}

Thank you for your business!
    `,
  },
};

/**
 * Simple template engine that replaces {{variable}} placeholders
 * Supports basic conditionals with {{#if variable}}...{{/if}}
 */
function renderTemplate(template: string, data: Record<string, unknown>): string {
  let result = template;
  
  // Replace variables: {{variable}}
  result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = data[key];
    return value !== undefined && value !== null ? String(value) : match;
  });
  
  // Handle conditionals: {{#if variable}}...{{/if}}
  result = result.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, key, content) => {
    const value = data[key];
    if (value && value !== false && value !== null && value !== undefined && value !== '') {
      // Recursively process the content inside the conditional
      return renderTemplate(content, data);
    }
    return '';
  });
  
  return result.trim();
}

/**
 * Send a template email
 * Supports built-in templates and custom templates stored in database or filesystem
 */
export async function sendTemplateEmail(
  templateId: string,
  to: string | string[],
  templateData: Record<string, unknown>,
  organizationId?: string
): Promise<SendEmailResult> {
  try {
    // Get template (built-in or from database/filesystem)
    let template = BUILT_IN_TEMPLATES[templateId];
    
    if (!template) {
      // Try to load from database if organizationId is provided
      if (organizationId) {
        const [dbTemplate] = await db
          .select()
          .from(emailTemplates)
          .where(
            and(
              eq(emailTemplates.templateId, templateId),
              eq(emailTemplates.organizationId, organizationId),
              eq(emailTemplates.isActive, true)
            )
          )
          .limit(1);
        
        if (dbTemplate) {
          template = {
            subject: dbTemplate.subject,
            html: dbTemplate.html,
            text: dbTemplate.text,
          };
        }
      }
      
      // If still not found, try filesystem (optional fallback)
      if (!template) {
        try {
          const templatePath = join(process.cwd(), 'templates', 'email', `${templateId}.json`);
          const templateFile = await readFile(templatePath, 'utf-8');
          const filesystemTemplate = JSON.parse(templateFile);
          template = {
            subject: filesystemTemplate.subject,
            html: filesystemTemplate.html,
            text: filesystemTemplate.text,
          };
        } catch (fsError) {
          // Filesystem template not found, continue to error
        }
      }
      
      // If template still not found, return error
      if (!template) {
        return {
          success: false,
          error: `Template "${templateId}" not found in built-in templates, database, or filesystem`,
        };
      }
    }
    
    // Merge template data with default values
    const data = {
      appName: process.env.NEXT_PUBLIC_APP_NAME || 'Financbase',
      ...templateData,
    };
    
    // Render template with data
    const subject = renderTemplate(template.subject, data);
    const html = renderTemplate(template.html, data);
    const text = renderTemplate(template.text, data);
    
    // Send email using the standard sendEmail function
    return await sendEmail({
      to,
      subject,
      html,
      text,
      metadata: {
        templateId,
        templateVersion: '1.0',
      },
    });
  } catch (error) {
    console.error('Template email error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

