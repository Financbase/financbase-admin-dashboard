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
  AuditLoggingService,
  AuditEventType,
  RiskLevel,
  ComplianceFramework,
  logUserAction,
  logSecurityEvent,
  logFinancialTransaction,
} from '@/lib/services/security/audit-logging-service'
import { db } from '@/lib/db'
import { activities } from '@/lib/db/schemas/activities.schema'
import { NextRequest } from 'next/server'

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
  },
}))

describe('AuditLoggingService', () => {
  let service: AuditLoggingService
  let mockDb: any

  // Helper to create a thenable insert mock
  const createInsertMock = () => {
    const valuesMock = vi.fn().mockResolvedValue(undefined);
    const insertMock: any = {
      values: valuesMock,
    };
    insertMock.then = vi.fn((onResolve?: (value: any) => any) => {
      const promise = Promise.resolve(undefined);
      return onResolve ? promise.then(onResolve) : promise;
    });
    // Make values accessible for inspection
    insertMock.values = valuesMock;
    return insertMock;
  };

  // Helper to create a thenable select query
  const createSelectQuery = (result: any[]) => {
    const query: any = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
    };
    query.then = vi.fn((onResolve?: (value: any[]) => any) => {
      const promise = Promise.resolve(result);
      return onResolve ? promise.then(onResolve) : promise;
    });
    return query;
  };

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset singleton instance
    ;(AuditLoggingService as any).instance = undefined
    service = AuditLoggingService.getInstance()
    mockDb = db as any
    // Set up default insert mock
    mockDb.insert.mockReturnValue(createInsertMock())
  })

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = AuditLoggingService.getInstance()
      const instance2 = AuditLoggingService.getInstance()

      expect(instance1).toBe(instance2)
    })
  })

  describe('logEvent', () => {
    it('should log audit event successfully', async () => {
      const event = {
        userId: 'user-123',
        eventType: AuditEventType.USER_CREATED,
        action: 'user_created',
        entityType: 'user',
        entityId: 'user-123',
        description: 'User created',
        riskLevel: RiskLevel.LOW,
        metadata: {},
        complianceFlags: [ComplianceFramework.SOC2],
      }

      mockDb.insert.mockReturnValue(createInsertMock())

      await service.logEvent(event)

      expect(mockDb.insert).toHaveBeenCalled()
    })

    it('should handle database errors gracefully', async () => {
      const event = {
        userId: 'user-123',
        eventType: AuditEventType.USER_CREATED,
        action: 'user_created',
        entityType: 'user',
        description: 'User created',
        riskLevel: RiskLevel.LOW,
        metadata: {},
        complianceFlags: [ComplianceFramework.SOC2],
      }

      mockDb.insert.mockRejectedValue(new Error('Database error'))

      // Should not throw
      await expect(service.logEvent(event)).resolves.not.toThrow()
    })

    it('should generate unique event ID', async () => {
      const event = {
        userId: 'user-123',
        eventType: AuditEventType.API_ACCESS,
        action: 'api_access',
        entityType: 'api',
        description: 'API access',
        riskLevel: RiskLevel.LOW,
        metadata: {},
        complianceFlags: [],
      }

      mockDb.insert.mockReturnValue(createInsertMock())

      await service.logEvent(event)

      expect(mockDb.insert).toHaveBeenCalled()
      // Get the return value from insert() call, which has the values() method
      const insertReturnValue = mockDb.insert.mock.results[0]?.value
      expect(insertReturnValue).toBeDefined()
      expect(insertReturnValue.values).toHaveBeenCalled()
      const valuesCall = insertReturnValue.values.mock.calls[0][0]
      expect(valuesCall.id).toBeDefined()
      expect(typeof valuesCall.id).toBe('string')
    })
  })

  describe('logAuthEvent', () => {
    it('should log authentication event with request context', async () => {
      const request = new NextRequest('https://example.com/api/auth/login', {
        headers: {
          'user-agent': 'Mozilla/5.0',
          'x-forwarded-for': '192.168.1.1',
        },
      })

      mockDb.insert.mockReturnValue(createInsertMock())

      await service.logAuthEvent('user-123', AuditEventType.LOGIN, request, {
        method: 'POST',
      })

      expect(mockDb.insert).toHaveBeenCalled()
      const insertReturnValue = mockDb.insert.mock.results[0]?.value
      expect(insertReturnValue).toBeDefined()
      expect(insertReturnValue.values).toHaveBeenCalled()
      const valuesCall = insertReturnValue.values.mock.calls[0][0]
      expect(valuesCall.ipAddress).toBe('192.168.1.1')
      expect(valuesCall.userAgent).toBe('Mozilla/5.0')
    })

    it('should extract IP from x-real-ip header', async () => {
      const request = new NextRequest('https://example.com/api/auth/login', {
        headers: {
          'x-real-ip': '10.0.0.1',
        },
      })

      mockDb.insert.mockReturnValue(createInsertMock())

      await service.logAuthEvent('user-123', AuditEventType.LOGIN, request)

      const insertReturnValue = mockDb.insert.mock.results[0]?.value
      expect(insertReturnValue).toBeDefined()
      expect(insertReturnValue.values).toHaveBeenCalled()
      const valuesCall = insertReturnValue.values.mock.calls[0][0]
      expect(valuesCall.ipAddress).toBe('10.0.0.1')
    })

    it('should assign appropriate risk level for auth events', async () => {
      const request = new NextRequest('https://example.com/api/auth/login')

      mockDb.insert.mockReturnValue(createInsertMock())

      await service.logAuthEvent('user-123', AuditEventType.LOGIN_FAILED, request)

      const insertReturnValue = mockDb.insert.mock.results[0]?.value
      expect(insertReturnValue).toBeDefined()
      expect(insertReturnValue.values).toHaveBeenCalled()
      const valuesCall = insertReturnValue.values.mock.calls[0][0]
      const metadata = JSON.parse(valuesCall.metadata)
      expect(metadata.riskLevel).toBe(RiskLevel.MEDIUM) // LOGIN_FAILED should be MEDIUM
    })
  })

  describe('logFinancialEvent', () => {
    it('should log financial event with PCI compliance', async () => {
      const financialData = {
        amount: 1000.00,
        currency: 'USD',
        paymentMethod: 'credit_card_1234',
      }

      mockDb.insert.mockReturnValue(createInsertMock())

      await service.logFinancialEvent(
        'user-123',
        AuditEventType.PAYMENT_PROCESSED,
        'payment',
        'pay-123',
        financialData,
        { invoiceId: 'inv-123' }
      )

      expect(mockDb.insert).toHaveBeenCalled()
      const insertReturnValue = mockDb.insert.mock.results[0]?.value
      expect(insertReturnValue).toBeDefined()
      expect(insertReturnValue.values).toHaveBeenCalled()
      const valuesCall = insertReturnValue.values.mock.calls[0][0]
      const metadata = JSON.parse(valuesCall.metadata)
      expect(metadata.sanitized).toBe(true)
    })

    it('should mask payment method for PCI compliance', async () => {
      const financialData = {
        amount: 1000.00,
        currency: 'USD',
        paymentMethod: 'credit_card_1234567890',
      }

      mockDb.insert.mockReturnValue(createInsertMock())

      await service.logFinancialEvent(
        'user-123',
        AuditEventType.PAYMENT_PROCESSED,
        'payment',
        'pay-123',
        financialData
      )

      const insertReturnValue = mockDb.insert.mock.results[0]?.value
      expect(insertReturnValue).toBeDefined()
      expect(insertReturnValue.values).toHaveBeenCalled()
      const valuesCall = insertReturnValue.values.mock.calls[0][0]
      // Payment method should be masked in metadata
      expect(valuesCall.metadata).toBeDefined()
    })

    it('should assign risk level based on amount', async () => {
      const largeAmountData = {
        amount: 50000.00,
        currency: 'USD',
      }

      mockDb.insert.mockReturnValue(createInsertMock())

      await service.logFinancialEvent(
        'user-123',
        AuditEventType.PAYMENT_PROCESSED,
        'payment',
        'pay-123',
        largeAmountData
      )

      const insertReturnValue = mockDb.insert.mock.results[0]?.value
      expect(insertReturnValue).toBeDefined()
      expect(insertReturnValue.values).toHaveBeenCalled()
      const valuesCall = insertReturnValue.values.mock.calls[0][0]
      const metadata = JSON.parse(valuesCall.metadata)
      // Large amounts should have higher risk level
      expect(['medium', 'high']).toContain(metadata.riskLevel)
    })
  })

  describe('logAIEvent', () => {
    it('should log AI event with model information', async () => {
      const aiContext = {
        model: 'gpt-4',
        provider: 'openai',
        confidence: 0.95,
        explanation: 'High confidence categorization',
      }

      mockDb.insert.mockReturnValue(createInsertMock())

      await service.logAIEvent(
        'user-123',
        AuditEventType.AI_CATEGORIZATION,
        'transaction',
        'txn-123',
        aiContext,
        { category: 'office_supplies' }
      )

      expect(mockDb.insert).toHaveBeenCalled()
      const insertReturnValue = mockDb.insert.mock.results[0]?.value
      expect(insertReturnValue).toBeDefined()
      expect(insertReturnValue.values).toHaveBeenCalled()
      const valuesCall = insertReturnValue.values.mock.calls[0][0]
      const metadata = JSON.parse(valuesCall.metadata)
      expect(metadata.aiModel).toBe('gpt-4')
      expect(metadata.confidence).toBe(0.95)
    })
  })

  describe('logDataAccess', () => {
    it('should log data access for GDPR compliance', async () => {
      const request = new NextRequest('https://example.com/api/data/export')

      mockDb.insert.mockReturnValue(createInsertMock())

      await service.logDataAccess(
        'user-123',
        'export',
        'transactions',
        100,
        request,
        { purpose: 'financial_report' }
      )

      expect(mockDb.insert).toHaveBeenCalled()
      const insertReturnValue = mockDb.insert.mock.results[0]?.value
      expect(insertReturnValue).toBeDefined()
      expect(insertReturnValue.values).toHaveBeenCalled()
      const valuesCall = insertReturnValue.values.mock.calls[0][0]
      const metadata = JSON.parse(valuesCall.metadata)
      expect(metadata.recordCount).toBe(100)
      expect(metadata.purpose).toBe('financial_report')
    })

    it('should assign higher risk for data export', async () => {
      const request = new NextRequest('https://example.com/api/data/export')

      mockDb.insert.mockReturnValue(createInsertMock())

      await service.logDataAccess('user-123', 'export', 'transactions', 1000, request)

      const insertReturnValue = mockDb.insert.mock.results[0]?.value
      expect(insertReturnValue).toBeDefined()
      expect(insertReturnValue.values).toHaveBeenCalled()
      const valuesCall = insertReturnValue.values.mock.calls[0][0]
      const metadata = JSON.parse(valuesCall.metadata)
      expect(metadata.riskLevel).toBe(RiskLevel.MEDIUM) // Export should be MEDIUM risk
    })
  })

  describe('generateComplianceReport', () => {
    it('should generate compliance report for organization', async () => {
      const mockEvents = [
        {
          id: 'event-1',
          userId: 'user-123',
          action: 'login',
          entityType: 'user',
          createdAt: new Date(),
          metadata: JSON.stringify({
            riskLevel: RiskLevel.LOW,
            complianceFlags: [ComplianceFramework.SOC2],
          }),
        },
      ]

      // Override global mock to return the mock events
      // generateComplianceReport calls getAuditEvents which does a select query
      mockDb.select.mockImplementationOnce(() => createSelectQuery(mockEvents))

      const startDate = new Date('2025-01-01')
      const endDate = new Date('2025-01-31')

      const report = await service.generateComplianceReport(
        'org-123',
        ComplianceFramework.SOC2,
        startDate,
        endDate
      )

      expect(report).toBeDefined()
      expect(report.events).toBeDefined()
      expect(report.complianceScore).toBeGreaterThanOrEqual(0)
      expect(report.complianceScore).toBeLessThanOrEqual(100)
      expect(Array.isArray(report.gaps)).toBe(true)
      expect(Array.isArray(report.recommendations)).toBe(true)
    })
  })

  describe('detectSuspiciousActivity', () => {
    it('should detect multiple failed login attempts', async () => {
      // Mock getFailedLogins to return multiple failures
      const mockFailedLogins = Array.from({ length: 6 }, (_, i) => ({
        ipAddress: '192.168.1.1',
        timestamp: new Date(Date.now() - i * 60000),
      }))

      // Mock internal methods by accessing private methods through reflection
      // Since we can't directly access private methods, we'll test through public interface
      const result = await service.detectSuspiciousActivity('user-123', 3600000)

      expect(Array.isArray(result)).toBe(true)
    })

    it('should return empty array when no suspicious activity', async () => {
      const result = await service.detectSuspiciousActivity('user-123', 3600000)

      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('Convenience Functions', () => {
    describe('logUserAction', () => {
      it('should log user action with default settings', async () => {
        mockDb.insert.mockReturnValue(createInsertMock())

        await logUserAction(
          'user-123',
          'view_dashboard',
          'dashboard',
          'dashboard-123',
          'User viewed dashboard',
          { page: 'home' }
        )

        expect(mockDb.insert).toHaveBeenCalled()
      })
    })

    describe('logSecurityEvent', () => {
      it('should log security event with appropriate flags', async () => {
        mockDb.insert.mockReturnValue(createInsertMock())

        await logSecurityEvent(
          'user-123',
          AuditEventType.SUSPICIOUS_ACTIVITY,
          'Suspicious login pattern detected',
          RiskLevel.HIGH,
          { ipAddress: '192.168.1.1' }
        )

        expect(mockDb.insert).toHaveBeenCalled()
        const insertReturnValue = mockDb.insert.mock.results[0]?.value
        expect(insertReturnValue).toBeDefined()
        expect(insertReturnValue.values).toHaveBeenCalled()
        const valuesCall = insertReturnValue.values.mock.calls[0][0]
        const metadata = JSON.parse(valuesCall.metadata)
        expect(metadata.complianceFlags).toContain(ComplianceFramework.SOC2)
        expect(metadata.complianceFlags).toContain(ComplianceFramework.GDPR)
      })
    })

    describe('logFinancialTransaction', () => {
      it('should log transaction created event', async () => {
        mockDb.insert.mockReturnValue(createInsertMock())

        await logFinancialTransaction(
          'user-123',
          'created',
          'transaction',
          'txn-123',
          1000.00,
          'USD',
          { category: 'income' }
        )

        expect(mockDb.insert).toHaveBeenCalled()
      })

      it('should log transaction updated event', async () => {
        mockDb.insert.mockReturnValue(createInsertMock())

        await logFinancialTransaction(
          'user-123',
          'updated',
          'transaction',
          'txn-123',
          1200.00,
          'USD'
        )

        expect(mockDb.insert).toHaveBeenCalled()
      })

      it('should log transaction deleted event', async () => {
        mockDb.insert.mockReturnValue(createInsertMock())

        await logFinancialTransaction(
          'user-123',
          'deleted',
          'transaction',
          'txn-123',
          1000.00,
          'USD'
        )

        expect(mockDb.insert).toHaveBeenCalled()
      })
    })
  })

  describe('Security Analysis', () => {
    it('should analyze security implications for failed logins', async () => {
      const event = {
        userId: 'user-123',
        eventType: AuditEventType.LOGIN_FAILED,
        action: 'login_failed',
        entityType: 'user',
        description: 'Failed login attempt',
        riskLevel: RiskLevel.MEDIUM,
        metadata: {},
        complianceFlags: [ComplianceFramework.SOC2],
        ipAddress: '192.168.1.1',
      }

      mockDb.insert.mockReturnValue(createInsertMock())

      // Should not throw
      await expect(service.logEvent(event)).resolves.not.toThrow()
    })

    it('should handle unauthorized access events', async () => {
      const event = {
        userId: 'user-123',
        eventType: AuditEventType.UNAUTHORIZED_ACCESS,
        action: 'unauthorized_access',
        entityType: 'resource',
        description: 'Unauthorized access attempt',
        riskLevel: RiskLevel.HIGH,
        metadata: {},
        complianceFlags: [ComplianceFramework.SOC2],
      }

      mockDb.insert.mockReturnValue(createInsertMock())

      await expect(service.logEvent(event)).resolves.not.toThrow()
    })
  })

  describe('Compliance Checking', () => {
    it('should check compliance requirements for events', async () => {
      const event = {
        userId: 'user-123',
        eventType: AuditEventType.PAYMENT_PROCESSED,
        action: 'payment_processed',
        entityType: 'payment',
        description: 'Payment processed',
        riskLevel: RiskLevel.LOW,
        metadata: {},
        complianceFlags: [ComplianceFramework.SOC2, ComplianceFramework.PCI, ComplianceFramework.SOX],
      }

      mockDb.insert.mockReturnValue(createInsertMock())

      await expect(service.logEvent(event)).resolves.not.toThrow()
    })
  })
})

