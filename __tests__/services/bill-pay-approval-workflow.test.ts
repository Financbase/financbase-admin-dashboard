/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * Tests for bill pay approval workflow with database persistence
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BillPayAutomationService } from '@/lib/services/bill-pay/bill-pay-service-backup';
import { db } from '@/lib/db';
import { billApprovals, bills } from '@/lib/db/schemas/bill-pay.schema';
import { eq } from 'drizzle-orm';

// Mock dependencies
vi.mock('@/lib/db', () => ({
	db: {
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		update: vi.fn().mockReturnThis(),
		set: vi.fn().mockReturnThis(),
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockResolvedValue(undefined),
	},
}));

vi.mock('@/lib/db/schemas/bill-pay.schema', () => ({
	billApprovals: {
		id: 'id',
		billId: 'bill_id',
		status: 'status',
		currentStep: 'current_step',
		steps: 'steps',
		approvalHistory: 'approval_history',
	},
	bills: {
		id: 'id',
		status: 'status',
	},
}));

describe('Bill Pay Approval Workflow', () => {
	let service: BillPayAutomationService;
	const mockUserId = 'user_123';
	const mockApprovalId = 'approval_123';
	const mockBillId = 'bill_123';

	beforeEach(() => {
		vi.clearAllMocks();
		service = new BillPayAutomationService();
	});

	it('should persist approval decision to database', async () => {
		const mockApproval = {
			id: mockApprovalId,
			billId: mockBillId,
			workflowId: 'workflow_123',
			currentStep: 1,
			totalSteps: 2,
			status: 'pending' as const,
			steps: [
				{
					step: 1,
					status: 'pending',
					approverId: mockUserId,
				},
				{
					step: 2,
					status: 'pending',
					approverId: 'user_456',
				},
			],
			approvalHistory: [],
		};

		const mockBill = {
			id: mockBillId,
			description: 'Test Bill',
			status: 'pending_approval',
		};

		// Mock getBillApproval
		vi.spyOn(service, 'getBillApproval').mockResolvedValue(mockApproval as any);
		vi.spyOn(service, 'getBill').mockResolvedValue(mockBill as any);
		vi.spyOn(service, 'scheduleApprovedPayment').mockResolvedValue(undefined);

		const mockUpdate = vi.fn().mockReturnValue({
			set: vi.fn().mockReturnValue({
				where: vi.fn().mockResolvedValue(undefined),
			}),
		});

		vi.mocked(db.update).mockReturnValue({
			set: vi.fn().mockReturnValue({
				where: vi.fn().mockResolvedValue(undefined),
			}),
		} as any);

		// Mock the getBillApproval to return updated approval after update
		vi.spyOn(service, 'getBillApproval')
			.mockResolvedValueOnce(mockApproval as any)
			.mockResolvedValueOnce({
				...mockApproval,
				status: 'pending',
				currentStep: 2,
				steps: [
					{
						...mockApproval.steps[0],
						status: 'approved',
						decidedBy: mockUserId,
					},
					mockApproval.steps[1],
				],
			} as any);

		const result = await service.processApproval(mockUserId, mockApprovalId, 'approve', 'Looks good');

		expect(result).toBeDefined();
		expect(db.update).toHaveBeenCalled();
	});

	it('should update bill status when fully approved', async () => {
		const mockApproval = {
			id: mockApprovalId,
			billId: mockBillId,
			currentStep: 2,
			totalSteps: 2,
			status: 'pending' as const,
			steps: [
				{
					step: 1,
					status: 'approved',
				},
				{
					step: 2,
					status: 'pending',
					approverId: mockUserId,
				},
			],
			approvalHistory: [],
		};

		const mockBill = {
			id: mockBillId,
			description: 'Test Bill',
			status: 'pending_approval',
		};

		vi.spyOn(service, 'getBillApproval')
			.mockResolvedValueOnce(mockApproval as any)
			.mockResolvedValueOnce({
				...mockApproval,
				status: 'approved',
			} as any);
		vi.spyOn(service, 'getBill').mockResolvedValue(mockBill as any);
		vi.spyOn(service, 'scheduleApprovedPayment').mockResolvedValue(undefined);

		vi.mocked(db.update).mockReturnValue({
			set: vi.fn().mockReturnValue({
				where: vi.fn().mockResolvedValue(undefined),
			}),
		} as any);

		await service.processApproval(mockUserId, mockApprovalId, 'approve');

		// Verify bill status update was called
		expect(db.update).toHaveBeenCalled();
	});
});

