/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NotificationService, NotificationHelpers } from '@/lib/services/notification-service'
import { db } from '@/lib/db'
import { sendNotificationEmail } from '@/lib/services/email-templates'

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

// Mock email templates
vi.mock('@/lib/services/email-templates', () => ({
  sendNotificationEmail: vi.fn(),
}))

// Mock fetch for PartyKit
global.fetch = vi.fn()

// Unmock notification service to test actual implementation
vi.unmock('@/lib/services/notification-service')

describe('NotificationService', () => {
  let mockDb: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockDb = db as any
    process.env.NEXT_PUBLIC_PARTYKIT_HOST = 'localhost:1999'
  })

  describe('create', () => {
    it('should create a new notification', async () => {
      const notificationData = {
        userId: 'user-123',
        type: 'invoice' as const,
        title: 'New Invoice',
        message: 'You have a new invoice',
      }

      const mockNotification = {
        id: 1,
        ...notificationData,
        category: 'general',
        priority: 'normal',
        isRead: false,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockNotification]),
        }),
      })

      const result = await NotificationService.create(notificationData)

      expect(result).toEqual(mockNotification)
    })

    it('should create notification with all fields', async () => {
      const notificationData = {
        userId: 'user-123',
        type: 'alert' as const,
        category: 'security' as const,
        priority: 'urgent' as const,
        title: 'Security Alert',
        message: 'Unusual activity detected',
        data: { alertId: 'alert-123' },
        actionUrl: '/alerts/alert-123',
        actionLabel: 'View Alert',
        expiresAt: new Date('2025-12-31'),
        metadata: { source: 'system' },
      }

      const mockNotification = {
        id: 1,
        ...notificationData,
        isRead: false,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockNotification]),
        }),
      })

      const result = await NotificationService.create(notificationData)

      expect(result).toBeDefined()
      expect(result.category).toBe('security')
      expect(result.priority).toBe('urgent')
    })

    it('should handle creation errors', async () => {
      const notificationData = {
        userId: 'user-123',
        type: 'invoice' as const,
        title: 'New Invoice',
        message: 'You have a new invoice',
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      })

      await expect(NotificationService.create(notificationData)).rejects.toThrow()
    })
  })

  describe('getForUser', () => {
    it('should get notifications for user', async () => {
      const mockNotifications = [
        {
          id: 1,
          userId: 'user-123',
          type: 'invoice',
          title: 'New Invoice',
          message: 'You have a new invoice',
          isRead: false,
          createdAt: new Date(),
        },
      ]

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue(mockNotifications),
              }),
            }),
          }),
        }),
      })

      const result = await NotificationService.getForUser('user-123')

      expect(result).toEqual(mockNotifications)
    })

    it('should filter unread notifications', async () => {
      const mockNotifications = [
        {
          id: 1,
          userId: 'user-123',
          type: 'invoice',
          title: 'New Invoice',
          message: 'You have a new invoice',
          isRead: false,
          createdAt: new Date(),
        },
      ]

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue(mockNotifications),
              }),
            }),
          }),
        }),
      })

      const result = await NotificationService.getForUser('user-123', { unreadOnly: true })

      expect(result).toBeDefined()
    })

    it('should filter by type', async () => {
      const mockNotifications = [
        {
          id: 1,
          userId: 'user-123',
          type: 'invoice',
          title: 'New Invoice',
          message: 'You have a new invoice',
          isRead: false,
          createdAt: new Date(),
        },
      ]

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue(mockNotifications),
              }),
            }),
          }),
        }),
      })

      const result = await NotificationService.getForUser('user-123', { type: 'invoice' })

      expect(result).toBeDefined()
    })

    it('should handle invalid userId', async () => {
      await expect(NotificationService.getForUser('' as any)).rejects.toThrow('Invalid userId')
    })
  })

  describe('getUnreadCount', () => {
    it('should get unread count for user', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 5 }]),
        }),
      })

      const result = await NotificationService.getUnreadCount('user-123')

      expect(result).toBe(5)
    })

    it('should return 0 for invalid userId', async () => {
      const result = await NotificationService.getUnreadCount('' as any)

      expect(result).toBe(0)
    })

    it('should handle bigint count', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: BigInt(10) }]),
        }),
      })

      const result = await NotificationService.getUnreadCount('user-123')

      expect(result).toBe(10)
    })
  })

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ id: 1, isRead: true }]),
          }),
        }),
      })

      const result = await NotificationService.markAsRead(1, 'user-123')

      expect(result).toBe(true)
    })

    it('should return false when notification not found', async () => {
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      })

      const result = await NotificationService.markAsRead(999, 'user-123')

      expect(result).toBe(false)
    })
  })

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
          }),
        }),
      })

      const result = await NotificationService.markAllAsRead('user-123')

      expect(result).toBe(true)
    })

    it('should return false when no notifications to mark', async () => {
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      })

      const result = await NotificationService.markAllAsRead('user-123')

      expect(result).toBe(false)
    })
  })

  describe('delete', () => {
    it('should delete notification', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 1 }]),
        }),
      })

      const result = await NotificationService.delete(1, 'user-123')

      expect(result).toBe(true)
    })

    it('should return false when notification not found', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      })

      const result = await NotificationService.delete(999, 'user-123')

      expect(result).toBe(false)
    })
  })

  describe('getUserPreferences', () => {
    it('should get user notification preferences', async () => {
      const mockPreferences = {
        userId: 'user-123',
        emailInvoices: true,
        emailExpenses: false,
        emailReports: true,
        emailAlerts: true,
      }

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockPreferences]),
          }),
        }),
      })

      const result = await NotificationService.getUserPreferences('user-123')

      expect(result).toEqual(mockPreferences)
    })

    it('should return null when preferences not found', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      })

      const result = await NotificationService.getUserPreferences('user-123')

      expect(result).toBeNull()
    })
  })

  describe('updateUserPreferences', () => {
    it('should update user notification preferences', async () => {
      const preferences = {
        emailInvoices: true,
        emailExpenses: false,
      }

      const mockUpdatedPreferences = {
        userId: 'user-123',
        ...preferences,
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          onConflictDoUpdate: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedPreferences]),
          }),
        }),
      })

      const result = await NotificationService.updateUserPreferences('user-123', preferences)

      expect(result).toEqual(mockUpdatedPreferences)
    })
  })

  describe('createFinancialNotification', () => {
    it('should create financial notification', async () => {
      const mockNotification = {
        id: 1,
        userId: 'user-123',
        type: 'invoice',
        category: 'financial',
        title: 'New Invoice',
        message: 'Invoice created',
        priority: 'normal',
        createdAt: new Date(),
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockNotification]),
        }),
      })

      const result = await NotificationService.createFinancialNotification(
        'user-123',
        'invoice',
        'New Invoice',
        'Invoice created',
        { invoiceId: 'inv-123' },
        '/invoices/inv-123'
      )

      expect(result).toBeDefined()
    })
  })

  describe('createSystemAlert', () => {
    it('should create system alert', async () => {
      const mockNotification = {
        id: 1,
        userId: 'user-123',
        type: 'alert',
        category: 'system',
        title: 'System Alert',
        message: 'System maintenance scheduled',
        priority: 'high',
        createdAt: new Date(),
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockNotification]),
        }),
      })

      const result = await NotificationService.createSystemAlert(
        'user-123',
        'System Alert',
        'System maintenance scheduled',
        'high',
        '/alerts/1'
      )

      expect(result).toBeDefined()
    })
  })

  describe('NotificationHelpers', () => {
    it('should export expense helpers', () => {
      expect(NotificationHelpers.expense.created).toBeDefined()
      expect(NotificationHelpers.expense.approved).toBeDefined()
      expect(NotificationHelpers.expense.rejected).toBeDefined()
    })

    it('should export client helpers', () => {
      expect(NotificationHelpers.client.created).toBeDefined()
    })

    it('should export helper functions', () => {
      expect(NotificationHelpers.getForUser).toBe(NotificationService.getForUser)
      expect(NotificationHelpers.markAsRead).toBe(NotificationService.markAsRead)
      expect(NotificationHelpers.markAllAsRead).toBe(NotificationService.markAllAsRead)
      expect(NotificationHelpers.delete).toBe(NotificationService.delete)
      expect(NotificationHelpers.getUnreadCount).toBe(NotificationService.getUnreadCount)
    })
  })
})

