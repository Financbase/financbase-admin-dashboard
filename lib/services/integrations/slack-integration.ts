/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { createOAuthHandler } from '@/lib/oauth/oauth-handler';

export interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
  is_archived: boolean;
  created: number;
  creator: string;
}

export interface SlackMessage {
  text: string;
  channel: string;
  user: string;
  timestamp: string;
  thread_ts?: string;
  attachments?: any[];
}

export interface SlackUser {
  id: string;
  name: string;
  real_name: string;
  email: string;
  is_bot: boolean;
  deleted: boolean;
}

export class SlackIntegration {
  private oauthHandler: any;
  private accessToken: string;
  private botToken?: string;

  constructor(accessToken: string, botToken?: string) {
    this.accessToken = accessToken;
    this.botToken = botToken;
    this.oauthHandler = createOAuthHandler('slack', {
      clientId: process.env.SLACK_CLIENT_ID!,
      clientSecret: process.env.SLACK_CLIENT_SECRET!,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/slack/callback`,
      authorizationUrl: 'https://slack.com/oauth/v2/authorize',
      tokenUrl: 'https://slack.com/api/oauth.v2.access',
      scope: ['channels:read', 'chat:write', 'files:read', 'users:read'],
    });
  }

  /**
   * Get workspace information
   */
  async getWorkspaceInfo(): Promise<any> {
    const response = await this.oauthHandler.makeAuthenticatedRequest(
      'https://slack.com/api/team.info',
      this.accessToken
    );

    if (!response.ok) {
      throw new Error(`Failed to get workspace info: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.ok) {
      throw new Error(`Slack API error: ${data.error}`);
    }

    return data.team;
  }

  /**
   * Get channels
   */
  async getChannels(): Promise<SlackChannel[]> {
    const response = await this.oauthHandler.makeAuthenticatedRequest(
      'https://slack.com/api/conversations.list',
      this.accessToken
    );

    if (!response.ok) {
      throw new Error(`Failed to get channels: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.ok) {
      throw new Error(`Slack API error: ${data.error}`);
    }

    return data.channels.map((channel: any) => ({
      id: channel.id,
      name: channel.name,
      is_private: channel.is_private,
      is_archived: channel.is_archived,
      created: channel.created,
      creator: channel.creator,
    }));
  }

  /**
   * Get users
   */
  async getUsers(): Promise<SlackUser[]> {
    const response = await this.oauthHandler.makeAuthenticatedRequest(
      'https://slack.com/api/users.list',
      this.accessToken
    );

    if (!response.ok) {
      throw new Error(`Failed to get users: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.ok) {
      throw new Error(`Slack API error: ${data.error}`);
    }

    return data.members.map((user: any) => ({
      id: user.id,
      name: user.name,
      real_name: user.real_name,
      email: user.profile?.email || '',
      is_bot: user.is_bot,
      deleted: user.deleted,
    }));
  }

  /**
   * Send message to channel
   */
  async sendMessage(channel: string, text: string, options?: {
    thread_ts?: string;
    attachments?: any[];
    blocks?: any[];
  }): Promise<any> {
    const token = this.botToken || this.accessToken;
    
    const response = await this.oauthHandler.makeAuthenticatedRequest(
      'https://slack.com/api/chat.postMessage',
      token,
      {
        method: 'POST',
        body: JSON.stringify({
          channel,
          text,
          ...options,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.ok) {
      throw new Error(`Slack API error: ${data.error}`);
    }

    return data;
  }

  /**
   * Send notification about invoice
   */
  async sendInvoiceNotification(invoice: {
    id: string;
    amount: number;
    currency: string;
    customer: string;
    status: string;
    dueDate?: string;
  }, channel: string): Promise<any> {
    const message = `📄 *Invoice ${invoice.id}*\n` +
      `💰 Amount: ${invoice.currency.toUpperCase()} ${(invoice.amount / 100).toFixed(2)}\n` +
      `👤 Customer: ${invoice.customer}\n` +
      `📊 Status: ${invoice.status}\n` +
      (invoice.dueDate ? `📅 Due: ${invoice.dueDate}\n` : '') +
      `🔗 View in Financbase: ${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoice.id}`;

    return this.sendMessage(channel, message, {
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: message,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Invoice',
              },
              url: `${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoice.id}`,
            },
          ],
        },
      ],
    });
  }

  /**
   * Send notification about payment
   */
  async sendPaymentNotification(payment: {
    id: string;
    amount: number;
    currency: string;
    customer: string;
    status: string;
    method: string;
  }, channel: string): Promise<any> {
    const message = `💳 *Payment ${payment.id}*\n` +
      `💰 Amount: ${payment.currency.toUpperCase()} ${(payment.amount / 100).toFixed(2)}\n` +
      `👤 Customer: ${payment.customer}\n` +
      `📊 Status: ${payment.status}\n` +
      `💳 Method: ${payment.method}\n` +
      `🔗 View in Financbase: ${process.env.NEXT_PUBLIC_APP_URL}/payments/${payment.id}`;

    return this.sendMessage(channel, message, {
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: message,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Payment',
              },
              url: `${process.env.NEXT_PUBLIC_APP_URL}/payments/${payment.id}`,
            },
          ],
        },
      ],
    });
  }

  /**
   * Send daily summary
   */
  async sendDailySummary(summary: {
    date: string;
    totalRevenue: number;
    totalExpenses: number;
    newInvoices: number;
    paidInvoices: number;
    currency: string;
  }, channel: string): Promise<any> {
    const message = `📊 *Daily Summary - ${summary.date}*\n\n` +
      `💰 Revenue: ${summary.currency.toUpperCase()} ${summary.totalRevenue.toFixed(2)}\n` +
      `💸 Expenses: ${summary.currency.toUpperCase()} ${summary.totalExpenses.toFixed(2)}\n` +
      `📄 New Invoices: ${summary.newInvoices}\n` +
      `✅ Paid Invoices: ${summary.paidInvoices}\n` +
      `📈 Net: ${summary.currency.toUpperCase()} ${(summary.totalRevenue - summary.totalExpenses).toFixed(2)}`;

    return this.sendMessage(channel, message, {
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: message,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Dashboard',
              },
              url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
            },
          ],
        },
      ],
    });
  }

  /**
   * Test the connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getWorkspaceInfo();
      return true;
    } catch (error) {
      console.error('Slack connection test failed:', error);
      return false;
    }
  }

  /**
   * Get message history from channel
   */
  async getChannelHistory(channel: string, limit: number = 100): Promise<SlackMessage[]> {
    const response = await this.oauthHandler.makeAuthenticatedRequest(
      `https://slack.com/api/conversations.history?channel=${channel}&limit=${limit}`,
      this.accessToken
    );

    if (!response.ok) {
      throw new Error(`Failed to get channel history: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.ok) {
      throw new Error(`Slack API error: ${data.error}`);
    }

    return data.messages.map((message: any) => ({
      text: message.text,
      channel: message.channel,
      user: message.user,
      timestamp: message.ts,
      thread_ts: message.thread_ts,
      attachments: message.attachments,
    }));
  }
}
