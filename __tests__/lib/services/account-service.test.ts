/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createAccount,
  getAccountById,
  getPaginatedAccounts,
  updateAccount,
  deleteAccount,
  updateAccountBalance,
  reconcileAccount,
  getAccountStats,
  setPrimaryAccount,
} from '@/lib/services/account-service'
import { db } from '@/lib/db'
import { accounts, transactions } from '@/lib/db/schemas'
import { NotificationHelpers } from '@/lib/services/notification-service'

// Unmock account service to test actual implementation
vi.unmock('@/lib/services/account-service')

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    query: {
      accounts: {
        findFirst: vi.fn(),
      },
    },
  },
}))

// Mock notification service
vi.mock('@/lib/services/notification-service', () => ({
  NotificationHelpers: {
    createFinancialNotification: vi.fn(),
    sendAccountCreated: vi.fn(),
    sendAccountDeleted: vi.fn(),
    sendAccountReconciled: vi.fn(),
    sendAccountUpdated: vi.fn(),
  },
}))

describe('Account Service', () => {
  let mockDb: any

  // Helper to create a thenable query builder
  const createThenableQuery = (result: any[]) => {
    const query: any = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockReturnThis(),
      groupBy: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
    };
    query.then = vi.fn((onResolve?: (value: any[]) => any) => {
      const promise = Promise.resolve(result);
      return onResolve ? promise.then(onResolve) : promise;
    });
    query.catch = vi.fn((onReject?: (error: any) => any) => {
      const promise = Promise.resolve(result);
      return onReject ? promise.catch(onReject) : promise;
    });
    Object.defineProperty(query, Symbol.toStringTag, { value: 'Promise' });
    return query;
  };

  beforeEach(() => {
    vi.clearAllMocks()
    mockDb = db as any
    // Reset select mock to use default implementation
    mockDb.select.mockReset()
    mockDb.select.mockReturnValue(createThenableQuery([]))
  })

  describe('createAccount', () => {
    it('should create account successfully', async () => {
      const input = {
        userId: 'user-123',
        accountName: 'Checking Account',
        accountType: 'checking' as const,
        bankName: 'Test Bank',
        openingBalance: 1000.00,
        currency: 'USD',
      }

      const mockAccount = {
        id: 'acc-123',
        ...input,
        currentBalance: '1000.00',
        availableBalance: '1000.00',
        createdAt: new Date(),
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockAccount]),
        }),
      })

      const result = await createAccount(input)

      expect(result).toEqual(mockAccount)
      expect(mockDb.insert).toHaveBeenCalled()
      expect(NotificationHelpers.sendAccountCreated).toHaveBeenCalledWith('acc-123', 'user-123')
    })

    it('should handle credit card accounts with credit limit', async () => {
      const input = {
        userId: 'user-123',
        accountName: 'Credit Card',
        accountType: 'credit_card' as const,
        creditLimit: 5000.00,
        currency: 'USD',
      }

      const mockAccount = {
        id: 'acc-123',
        ...input,
        creditLimit: '5000.00',
        currentBalance: '0',
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockAccount]),
        }),
      })

      const result = await createAccount(input)

      expect(result.accountType).toBe('credit_card')
      expect(result.creditLimit).toBe('5000.00')
    })
  })

  describe('getAccountById', () => {
    it('should retrieve account by ID', async () => {
      const mockAccount = {
        id: 'acc-123',
        userId: 'user-123',
        accountName: 'Checking Account',
        accountType: 'checking',
      }

      mockDb.query.accounts.findFirst.mockResolvedValue(mockAccount)

      const result = await getAccountById('acc-123', 'user-123')

      expect(result).toEqual(mockAccount)
    })

    it('should return null if account not found', async () => {
      mockDb.query.accounts.findFirst.mockResolvedValue(null)

      const result = await getAccountById('acc-123', 'user-123')

      expect(result).toBeNull()
    })
  })

  describe('getPaginatedAccounts', () => {
    it('should return paginated accounts', async () => {
      const mockAccounts = [
        { id: 'acc-1', accountName: 'Account 1' },
        { id: 'acc-2', accountName: 'Account 2' },
      ]

      mockDb.select
        .mockImplementationOnce(() => createThenableQuery(mockAccounts))
        .mockImplementationOnce(() => createThenableQuery([{ count: 2 }]))

      const result = await getPaginatedAccounts('user-123', { page: 1, limit: 10 })

      expect(result.accounts).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
    })
  })

  describe('updateAccount', () => {
    it('should update account successfully', async () => {
      const updateData = {
        accountName: 'Updated Account Name',
      }

      const mockUpdatedAccount = {
        id: 'acc-123',
        userId: 'user-123',
        ...updateData,
        updatedAt: new Date(),
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedAccount]),
          }),
        }),
      })

      const result = await updateAccount('acc-123', 'user-123', updateData)

      expect(result.accountName).toBe('Updated Account Name')
      expect(NotificationHelpers.sendAccountUpdated).toHaveBeenCalled()
    })

    it('should throw error if account not found', async () => {
      // Mock update returns empty array (account not found)
      mockDb.update.mockReturnValueOnce({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]), // Account not found
          }),
        }),
      })

      await expect(
        updateAccount('acc-123', 'user-123', { accountName: 'Updated' })
      ).rejects.toThrow('Failed to update account')
    })
  })

  describe('deleteAccount', () => {
    it('should delete account successfully', async () => {
      // Mock transaction count check (no transactions)
      mockDb.select.mockImplementationOnce(() => createThenableQuery([{ count: 0 }]))

      // Mock delete
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      })

      await deleteAccount('acc-123', 'user-123')

      expect(mockDb.delete).toHaveBeenCalled()
      expect(NotificationHelpers.sendAccountDeleted).toHaveBeenCalled()
    })

    it('should throw error if account has transactions', async () => {
      // Mock transaction count check (has transactions)
      mockDb.select.mockImplementationOnce(() => createThenableQuery([{ count: 5 }])) // Has transactions

      await expect(deleteAccount('acc-123', 'user-123')).rejects.toThrow(
        'Failed to delete account'
      )
    })
  })

  describe('updateAccountBalance', () => {
    it('should update account balance successfully', async () => {
      const mockUpdatedAccount = {
        id: 'acc-123',
        userId: 'user-123',
        currentBalance: '1500.00',
        availableBalance: '1500.00',
        accountType: 'checking',
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedAccount]),
          }),
        }),
      })

      const result = await updateAccountBalance('acc-123', 'user-123', 1500.00)

      expect(Number(result.currentBalance)).toBe(1500.00)
    })

    it('should throw error if account not found', async () => {
      // Mock update returns empty array (account not found)
      mockDb.update.mockReturnValueOnce({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]), // Account not found
          }),
        }),
      })

      await expect(updateAccountBalance('acc-123', 'user-123', 1500.00)).rejects.toThrow(
        'Failed to update account balance'
      )
    })
  })

  describe('reconcileAccount', () => {
    it('should reconcile account successfully', async () => {
      const mockAccount = {
        id: 'acc-123',
        userId: 'user-123',
        currentBalance: '1000.00',
        accountType: 'checking',
      }

      // Mock getAccountById call
      mockDb.query.accounts.findFirst.mockResolvedValue(mockAccount)

      const mockUpdatedAccount = {
        ...mockAccount,
        lastReconciledAt: new Date(),
        isReconciled: true,
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedAccount]),
          }),
        }),
      })

      const result = await reconcileAccount('acc-123', 'user-123', 1050.00)

      expect(result).toBeDefined()
      expect(result.lastReconciledAt).toBeDefined()
      expect(NotificationHelpers.sendAccountReconciled).toHaveBeenCalled()
    })

    it('should throw error if account not found', async () => {
      // Mock getAccountById returns null (account doesn't exist)
      mockDb.query.accounts.findFirst.mockResolvedValueOnce(null)

      await expect(reconcileAccount('acc-123', 'user-123', 1050.00)).rejects.toThrow(
        'Failed to reconcile account'
      )
    })
  })

  describe('getAccountStats', () => {
    it('should return account statistics', async () => {
      const mockBasicStats = {
        totalAccounts: 5,
        activeAccounts: 4,
        totalBalance: 10000,
        totalCreditLimit: 5000,
      }

      const mockAccountsByType = []
      const mockRecentActivity = []
      const mockAccountNames = []

      // Mock multiple queries for stats
      mockDb.select
        .mockImplementationOnce(() => createThenableQuery([mockBasicStats]))
        .mockImplementationOnce(() => createThenableQuery(mockAccountsByType))
        .mockImplementationOnce(() => createThenableQuery(mockRecentActivity))
        .mockImplementationOnce(() => createThenableQuery(mockAccountNames))

      const result = await getAccountStats('user-123')

      expect(result).toBeDefined()
      expect(result.totalAccounts).toBe(5)
      expect(result.activeAccounts).toBe(4)
    })
  })

  describe('setPrimaryAccount', () => {
    it('should set account as primary', async () => {
      const mockAccount = {
        id: 'acc-123',
        userId: 'user-123',
        isPrimary: true,
      }

      // Mock unset other primaries
      mockDb.update.mockReturnValueOnce({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      })

      // Mock set new primary
      mockDb.update.mockReturnValueOnce({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockAccount]),
          }),
        }),
      })

      const result = await setPrimaryAccount('acc-123', 'user-123')

      expect(result.isPrimary).toBe(true)
      expect(mockDb.update).toHaveBeenCalledTimes(2)
    })

    it('should throw error if account not found', async () => {
      // Mock unset other primaries
      mockDb.update.mockReturnValueOnce({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      })

      // Mock set new primary (returns empty array - account not found)
      mockDb.update.mockReturnValueOnce({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]), // Account not found
          }),
        }),
      })

      await expect(setPrimaryAccount('acc-123', 'user-123')).rejects.toThrow(
        'Failed to set primary account'
      )
    })
  })
})

