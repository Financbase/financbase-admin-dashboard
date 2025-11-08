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
  securityTrainingPrograms,
  trainingAssignments,
  trainingAssessments,
  trainingCertificates,
  phishingSimulationResults,
} from '@/lib/db/schemas';
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';

export class ComplianceTrainingService {
  /**
   * Create training program
   */
  static async createTrainingProgram(
    organizationId: string,
    program: {
      createdBy?: string;
      title: string;
      description?: string;
      trainingType: string;
      duration?: number;
      content?: string;
      contentUrl?: string;
      isMandatory?: boolean;
      passingScore?: number;
      maxAttempts?: number;
      validFor?: number;
      requiresRefresher?: boolean;
      refresherFrequency?: number;
      tags?: string[];
      metadata?: Record<string, any>;
    }
  ) {
    try {
      const [newProgram] = await db
        .insert(securityTrainingPrograms)
        .values({
          organizationId,
          createdBy: program.createdBy,
          title: program.title,
          description: program.description,
          trainingType: program.trainingType as any,
          duration: program.duration,
          content: program.content,
          contentUrl: program.contentUrl,
          isMandatory: program.isMandatory || false,
          passingScore: program.passingScore || 80,
          maxAttempts: program.maxAttempts,
          validFor: program.validFor || 365,
          requiresRefresher: program.requiresRefresher !== false,
          refresherFrequency: program.refresherFrequency || 365,
          tags: program.tags || [],
          metadata: program.metadata || {},
        })
        .returning();

      return newProgram;
    } catch (error) {
      console.error('Error creating training program:', error);
      throw new Error('Failed to create training program');
    }
  }

  /**
   * Assign training to user
   */
  static async assignTraining(
    organizationId: string,
    assignment: {
      programId: number;
      userId?: string;
      roleId?: string;
      assignedBy: string;
      assignmentType?: string;
      deadline?: Date;
    }
  ) {
    try {
      const program = await db
        .select()
        .from(securityTrainingPrograms)
        .where(eq(securityTrainingPrograms.id, assignment.programId))
        .limit(1);

      if (!program[0]) {
        throw new Error('Training program not found');
      }

      const expiresAt = assignment.deadline || 
        (program[0].validFor ? new Date(Date.now() + program[0].validFor * 24 * 60 * 60 * 1000) : undefined);

      const [newAssignment] = await db
        .insert(trainingAssignments)
        .values({
          organizationId,
          programId: assignment.programId,
          userId: assignment.userId,
          roleId: assignment.roleId,
          assignmentType: assignment.assignmentType as any || 'mandatory',
          assignedBy: assignment.assignedBy,
          deadline: assignment.deadline,
          expiresAt,
          status: 'not_started',
        })
        .returning();

      return newAssignment;
    } catch (error) {
      console.error('Error assigning training:', error);
      throw new Error('Failed to assign training');
    }
  }

  /**
   * Complete training assessment
   */
  static async completeAssessment(
    assignmentId: number,
    assessment: {
      userId: string;
      questions: any[];
      answers: any[];
      score: number;
      maxScore: number;
      startedAt: Date;
      completedAt: Date;
    }
  ) {
    try {
      const passed = assessment.score >= (assessment.maxScore * 0.8); // 80% passing

      // Create assessment record
      await db.insert(trainingAssessments).values({
        assignmentId,
        userId: assessment.userId,
        questions: assessment.questions,
        answers: assessment.answers,
        score: assessment.score,
        maxScore: assessment.maxScore,
        passed,
        startedAt: assessment.startedAt,
        completedAt: assessment.completedAt,
        duration: Math.floor((assessment.completedAt.getTime() - assessment.startedAt.getTime()) / 1000),
      });

      // Update assignment
      const [assignment] = await db
        .select()
        .from(trainingAssignments)
        .where(eq(trainingAssignments.id, assignmentId))
        .limit(1);

      if (assignment) {
        await db
          .update(trainingAssignments)
          .set({
            status: passed ? 'completed' : 'failed',
            completedAt: assessment.completedAt,
            score: assessment.score,
            passed,
            attempts: sql`${trainingAssignments.attempts} + 1`,
            progress: 100,
            updatedAt: new Date(),
          })
          .where(eq(trainingAssignments.id, assignmentId));

        // Generate certificate if passed
        if (passed) {
          await this.generateCertificate(assignmentId, assignment.userId!, assignment.programId, assessment.score);
        }
      }
    } catch (error) {
      console.error('Error completing assessment:', error);
      throw new Error('Failed to complete assessment');
    }
  }

  /**
   * Generate training certificate
   */
  private static async generateCertificate(
    assignmentId: number,
    userId: string,
    programId: number,
    score: number
  ) {
    try {
      const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const program = await db
        .select()
        .from(securityTrainingPrograms)
        .where(eq(securityTrainingPrograms.id, programId))
        .limit(1);

      const expiresAt = program[0]?.requiresRefresher && program[0]?.refresherFrequency
        ? new Date(Date.now() + program[0].refresherFrequency * 24 * 60 * 60 * 1000)
        : undefined;

      await db.insert(trainingCertificates).values({
        assignmentId,
        userId,
        programId,
        certificateNumber,
        score,
        expiresAt,
        certificateData: {
          programTitle: program[0]?.title,
          issuedDate: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error generating certificate:', error);
      // Don't throw - certificate generation is secondary
    }
  }

  /**
   * Get training assignments
   */
  static async getTrainingAssignments(
    organizationId: string,
    filters?: {
      userId?: string;
      status?: string;
      programId?: number;
    }
  ) {
    try {
      const conditions: any[] = [eq(trainingAssignments.organizationId, organizationId)];

      if (filters?.userId) {
        conditions.push(eq(trainingAssignments.userId, filters.userId));
      }
      if (filters?.status) {
        conditions.push(eq(trainingAssignments.status, filters.status as any));
      }
      if (filters?.programId) {
        conditions.push(eq(trainingAssignments.programId, filters.programId));
      }

      const assignments = await db
        .select()
        .from(trainingAssignments)
        .where(and(...conditions))
        .orderBy(desc(trainingAssignments.assignedAt));

      return assignments;
    } catch (error) {
      console.error('Error getting training assignments:', error);
      throw new Error('Failed to get training assignments');
    }
  }
}

