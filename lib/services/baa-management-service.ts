/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from '@/lib/db';
import {
  businessAssociates,
  baaComplianceChecklist,
} from '@/lib/db/schemas';
import { eq, and, desc, gte, lte } from 'drizzle-orm';

export class BAAManagementService {
  /**
   * Create business associate record
   */
  static async createBusinessAssociate(
    organizationId: string,
    vendor: {
      createdBy?: string;
      vendorName: string;
      vendorType: string;
      contactName?: string;
      contactEmail?: string;
      contactPhone?: string;
      vendorAddress?: string;
      servicesProvided?: string[];
      description?: string;
      baaDocumentUrl?: string;
      baaSignedDate?: Date;
      baaExpiryDate?: Date;
      hipaaCompliant?: boolean;
      complianceCertifications?: string[];
      tags?: string[];
      metadata?: Record<string, any>;
    }
  ) {
    try {
      // Calculate renewal date (90 days before expiry)
      let baaRenewalDate: Date | undefined;
      if (vendor.baaExpiryDate) {
        baaRenewalDate = new Date(vendor.baaExpiryDate);
        baaRenewalDate.setDate(baaRenewalDate.getDate() - 90);
      }

      const [newVendor] = await db
        .insert(businessAssociates)
        .values({
          organizationId,
          createdBy: vendor.createdBy,
          vendorName: vendor.vendorName,
          vendorType: vendor.vendorType as any,
          contactName: vendor.contactName,
          contactEmail: vendor.contactEmail,
          contactPhone: vendor.contactPhone,
          vendorAddress: vendor.vendorAddress,
          servicesProvided: vendor.servicesProvided || [],
          description: vendor.description,
          baaStatus: vendor.baaSignedDate ? 'signed' : 'pending',
          baaDocumentUrl: vendor.baaDocumentUrl,
          baaSignedDate: vendor.baaSignedDate,
          baaExpiryDate: vendor.baaExpiryDate,
          baaRenewalDate,
          hipaaCompliant: vendor.hipaaCompliant || false,
          complianceCertifications: vendor.complianceCertifications || [],
          tags: vendor.tags || [],
          metadata: vendor.metadata || {},
        })
        .returning();

      // Create compliance checklist
      await db.insert(baaComplianceChecklist).values({
        businessAssociateId: newVendor.id,
        checklistItems: [
          { id: 1, item: 'BAA document signed', required: true },
          { id: 2, item: 'BAA document stored securely', required: true },
          { id: 3, item: 'Vendor HIPAA compliance verified', required: true },
          { id: 4, item: 'Services documented', required: true },
          { id: 5, item: 'Renewal date set', required: true },
        ],
        completedItems: [],
        completionPercentage: 0,
      });

      return newVendor;
    } catch (error) {
      console.error('Error creating business associate:', error);
      throw new Error('Failed to create business associate');
    }
  }

  /**
   * Get business associates
   */
  static async getBusinessAssociates(
    organizationId: string,
    filters?: {
      vendorType?: string;
      baaStatus?: string;
      isActive?: boolean;
    }
  ) {
    try {
      const conditions: any[] = [eq(businessAssociates.organizationId, organizationId)];

      if (filters?.vendorType) {
        conditions.push(eq(businessAssociates.vendorType, filters.vendorType as any));
      }
      if (filters?.baaStatus) {
        conditions.push(eq(businessAssociates.baaStatus, filters.baaStatus as any));
      }
      if (filters?.isActive !== undefined) {
        conditions.push(eq(businessAssociates.isActive, filters.isActive));
      }

      const vendors = await db
        .select()
        .from(businessAssociates)
        .where(and(...conditions))
        .orderBy(desc(businessAssociates.createdAt));

      return vendors;
    } catch (error) {
      console.error('Error getting business associates:', error);
      throw new Error('Failed to get business associates');
    }
  }

  /**
   * Update BAA status
   */
  static async updateBAAStatus(
    vendorId: number,
    updateData: {
      baaStatus?: string;
      baaDocumentUrl?: string;
      baaSignedDate?: Date;
      baaExpiryDate?: Date;
    }
  ) {
    try {
      const updateFields: any = {
        updatedAt: new Date(),
      };

      if (updateData.baaStatus) {
        updateFields.baaStatus = updateData.baaStatus;
      }
      if (updateData.baaDocumentUrl) {
        updateFields.baaDocumentUrl = updateData.baaDocumentUrl;
      }
      if (updateData.baaSignedDate) {
        updateFields.baaSignedDate = updateData.baaSignedDate;
      }
      if (updateData.baaExpiryDate) {
        updateFields.baaExpiryDate = updateData.baaExpiryDate;
        // Calculate renewal date
        const renewalDate = new Date(updateData.baaExpiryDate);
        renewalDate.setDate(renewalDate.getDate() - 90);
        updateFields.baaRenewalDate = renewalDate;
      }

      await db
        .update(businessAssociates)
        .set(updateFields)
        .where(eq(businessAssociates.id, vendorId));
    } catch (error) {
      console.error('Error updating BAA status:', error);
      throw new Error('Failed to update BAA status');
    }
  }

  /**
   * Get vendors with renewal due
   */
  static async getVendorsWithRenewalDue(organizationId: string) {
    try {
      const now = new Date();
      const vendors = await db
        .select()
        .from(businessAssociates)
        .where(
          and(
            eq(businessAssociates.organizationId, organizationId),
            eq(businessAssociates.isActive, true),
            lte(businessAssociates.baaRenewalDate, now)
          )
        )
        .orderBy(desc(businessAssociates.baaRenewalDate));

      return vendors;
    } catch (error) {
      console.error('Error getting vendors with renewal due:', error);
      throw new Error('Failed to get vendors with renewal due');
    }
  }
}

