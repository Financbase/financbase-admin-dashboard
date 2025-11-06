/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

export interface ActivityLog {
  id: string;
  action: string;
  timestamp: Date;
  userId?: string;
}

export function logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>): void {
  // Stub implementation
  console.log('Activity logged:', activity);
}

export function getRecentActivities(limit: number = 10): ActivityLog[] {
  // Stub implementation
  return [];
}

export function useActivityLogger() {
  return {
    activities: [] as ActivityLog[],
    logActivity: logActivity,
    getRecentActivities: getRecentActivities,
    logProjectCreated: (projectId: string, projectName: string, userId: string) => {
      logActivity({ action: `Project created: ${projectName}`, userId });
    },
    logPaymentReceived: (paymentId: string, amount: number, userId: string) => {
      logActivity({ action: `Payment received: $${amount}`, userId });
    },
    logUserRegistration: (userId: string, userName: string) => {
      logActivity({ action: `User registered: ${userName}`, userId });
    },
    logTaskCompleted: (taskId: string, taskName: string, userId: string) => {
      logActivity({ action: `Task completed: ${taskName}`, userId });
    },
  };
}

