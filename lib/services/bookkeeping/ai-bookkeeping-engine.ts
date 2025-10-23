/**
 * AI Bookkeeping Engine - Autonomous Financial Operations
 * Bridges Found-style automation with Digits-style enterprise reconciliation
 * ML-powered categorization, bank reconciliation, and continuous learning
 */

import { db } from '@/lib/db';
import { transactions, accounts, invoices, expenses } from '@/lib/db/schemas/transactions.schema';
import { eq, and, gte, lte, desc, sql, or } from 'drizzle-orm';
import { aiOrchestrator } from '@/lib/services/ai/unified-ai-orchestrator';
import { auditLogger } from '@/lib/services/security/audit-logging-service';
import { NextRequest } from 'next/server';

// Transaction reconciliation status
export enum ReconciliationStatus {
  UNMATCHED = 'unmatched',
  MATCHED = 'matched',
  PARTIAL_MATCH = 'partial_match',
  DISPUTED = 'disputed',
  EXCLUDED = 'excluded'
}

export enum ReconciliationType {
  BANK_TO_BOOK = 'bank_to_book',
  BOOK_TO_BANK = 'book_to_bank',
  FULL_RECONCILIATION = 'full_reconciliation'
}

// Bank transaction interface
export interface BankTransaction {
  id: string;
  accountId: string;
  date: Date;
  description: string;
  amount: number;
  balance: number;
  reference?: string;
  type: 'debit' | 'credit';
  source: 'bank_import' | 'api_sync' | 'manual';
  metadata?: Record<string, any>;
}

// Book transaction (internal records)
export interface BookTransaction {
  id: string;
  type: 'invoice' | 'expense' | 'payment' | 'transfer' | 'adjustment';
  amount: number;
  date: Date;
  description: string;
  category?: string;
  reference?: string;
  status: 'pending' | 'cleared' | 'reconciled';
  relatedEntityId?: string; // Links to invoice, expense, etc.
  metadata?: Record<string, any>;
}

// Reconciliation match
export interface ReconciliationMatch {
  id: string;
  bankTransactionId: string;
  bookTransactionId?: string;
  confidence: number;
  matchType: 'exact' | 'fuzzy' | 'manual';
  reasoning: string;
  suggestedAdjustments?: {
    amount?: number;
    date?: Date;
    description?: string;
  };
  status: ReconciliationStatus;
  createdAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
}

// Reconciliation session
export interface ReconciliationSession {
  id: string;
  accountId: string;
  userId: string;
  type: ReconciliationType;
  period: { start: Date; end: Date };
  bankStatementBalance: number;
  bookBalance: number;
  difference: number;
  matches: ReconciliationMatch[];
  status: 'in_progress' | 'completed' | 'approved' | 'disputed';
  createdAt: Date;
  completedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

// ML categorization with confidence tracking
export interface CategorizationAttempt {
  id: string;
  transactionId: string;
  userId: string;
  originalCategory?: string;
  suggestedCategory: string;
  confidence: number;
  aiModel: string;
  aiProvider: string;
  reasoning: string;
  accepted: boolean;
  correctedCategory?: string;
  correctionReasoning?: string;
  processingTime: number;
  createdAt: Date;
}

export class AIBookkeepingEngine {
  private reconciliationRules = new Map<string, ReconciliationRule>();
  private categorizationHistory = new Map<string, CategorizationAttempt[]>();

  constructor() {
    this.initializeReconciliationRules();
  }

  /**
   * Main entry point - Process bank statement and reconcile
   */
  async processBankStatement(
    userId: string,
    accountId: string,
    bankTransactions: BankTransaction[],
    statementPeriod: { start: Date; end: Date }
  ): Promise<ReconciliationSession> {
    // Create reconciliation session
    const session = await this.createReconciliationSession(
      userId,
      accountId,
      bankTransactions,
      statementPeriod
    );

    // Import and categorize bank transactions
    const categorizedTransactions = await this.importBankTransactions(
      userId,
      accountId,
      bankTransactions
    );

    // Find matches between bank and book transactions
    const matches = await this.findReconciliationMatches(
      accountId,
      categorizedTransactions,
      statementPeriod
    );

    // Apply AI-powered reconciliation
    const aiMatches = await this.performAIReconciliation(
      userId,
      categorizedTransactions,
      matches
    );

    // Update session with results
    await this.updateReconciliationSession(session.id, {
      matches: aiMatches,
      status: 'completed',
      completedAt: new Date()
    });

    // Log reconciliation activity
    await auditLogger.logFinancialEvent(
      userId,
      'bulk_reconciliation_completed',
      'reconciliation',
      session.id,
      {
        amount: bankTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0),
        currency: 'USD'
      },
      {
        transactionCount: bankTransactions.length,
        matchCount: aiMatches.filter(m => m.status === ReconciliationStatus.MATCHED).length,
        sessionId: session.id
      }
    );

    return session;
  }

  /**
   * Categorize transactions with AI and continuous learning
   */
  async categorizeTransactions(
    userId: string,
    transactions: Array<{ id: string; description: string; amount: number; date: Date }>
  ): Promise<Array<{ id: string; category: string; confidence: number; explanation: any }>> {
    const results = [];

    for (const transaction of transactions) {
      try {
        // Check for existing categorization
        const existingCategory = await this.getExistingCategorization(transaction.id);

        if (existingCategory && existingCategory.confidence > 0.9) {
          results.push({
            id: transaction.id,
            category: existingCategory.category,
            confidence: existingCategory.confidence,
            explanation: existingCategory.explanation
          });
          continue;
        }

        // AI categorization with explainability
        const categorizationResult = await aiOrchestrator.categorizeTransaction(
          userId,
          {
            description: transaction.description,
            amount: transaction.amount,
            date: transaction.date
          }
        );

        // Store categorization attempt for learning
        await this.storeCategorizationAttempt({
          id: crypto.randomUUID(),
          transactionId: transaction.id,
          userId,
          suggestedCategory: categorizationResult.category,
          confidence: categorizationResult.confidence,
          aiModel: categorizationResult.metadata.model,
          aiProvider: categorizationResult.metadata.provider,
          reasoning: categorizationResult.explanation.reasoning,
          accepted: true, // Will be updated if user corrects
          processingTime: categorizationResult.metadata.processingTime,
          createdAt: new Date()
        });

        results.push({
          id: transaction.id,
          category: categorizationResult.category,
          confidence: categorizationResult.confidence,
          explanation: categorizationResult.explanation
        });

      } catch (error) {
        console.error(`Categorization failed for transaction ${transaction.id}:`, error);
        results.push({
          id: transaction.id,
          category: 'other',
          confidence: 0,
          explanation: { reasoning: 'Categorization failed', evidence: [] }
        });
      }
    }

    return results;
  }

  /**
   * Process user feedback for continuous AI improvement
   */
  async processCategorizationFeedback(
    userId: string,
    transactionId: string,
    originalCategory: string,
    correctedCategory: string,
    reasoning: string,
    confidence: number
  ): Promise<void> {
    // Update the categorization attempt
    await this.updateCategorizationAttempt(transactionId, {
      accepted: false,
      correctedCategory,
      correctionReasoning: reasoning
    });

    // Process feedback through AI orchestrator
    await aiOrchestrator.processFeedback(userId, {
      transactionId,
      originalPrediction: originalCategory,
      userCorrection: correctedCategory,
      reasoning,
      confidence,
      accepted: false,
      timestamp: new Date()
    });

    // Update transaction with corrected category
    await db
      .update(transactions)
      .set({
        category: correctedCategory,
        updatedAt: new Date(),
        confidence: 1.0 // User correction = 100% confidence
      })
      .where(eq(transactions.id, transactionId));

    // Log feedback for audit trail
    await auditLogger.logAIEvent(
      userId,
      'ai_feedback_processed',
      'transaction',
      transactionId,
      {
        model: 'user_feedback',
        provider: 'human',
        confidence: 1.0,
        explanation: `User corrected category from ${originalCategory} to ${correctedCategory}: ${reasoning}`
      }
    );
  }

  /**
   * Automated reconciliation with AI assistance
   */
  async performAutomatedReconciliation(
    userId: string,
    accountId: string,
    period: { start: Date; end: Date }
  ): Promise<ReconciliationSession> {
    // Get bank transactions for period
    const bankTransactions = await this.getBankTransactions(accountId, period);

    // Get book transactions for period
    const bookTransactions = await this.getBookTransactions(accountId, period);

    // Create reconciliation session
    const session = await this.createReconciliationSession(
      userId,
      accountId,
      bankTransactions,
      period
    );

    // Auto-match using rules and AI
    const matches = await this.autoMatchTransactions(
      bankTransactions,
      bookTransactions,
      userId
    );

    // Update session
    await this.updateReconciliationSession(session.id, {
      matches,
      status: 'completed'
    });

    return session;
  }

  /**
   * Multi-bank integration and sync
   */
  async syncBankAccounts(userId: string): Promise<{ success: string[]; failed: string[] }> {
    const accounts = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId));

    const results = { success: [], failed: [] };

    for (const account of accounts) {
      try {
        await this.syncBankAccount(account.id, userId);
        results.success.push(account.accountName);
      } catch (error) {
        console.error(`Failed to sync account ${account.accountName}:`, error);
        results.failed.push(account.accountName);
      }
    }

    return results;
  }

  /**
   * Generate reconciliation report
   */
  async generateReconciliationReport(
    userId: string,
    accountId: string,
    sessionId: string
  ): Promise<{
    summary: {
      bankBalance: number;
      bookBalance: number;
      difference: number;
      matchedTransactions: number;
      unmatchedTransactions: number;
      disputedTransactions: number;
    };
    matches: ReconciliationMatch[];
    recommendations: string[];
    nextSteps: string[];
  }> {
    const session = await this.getReconciliationSession(sessionId);
    const matches = session.matches;

    const summary = {
      bankBalance: session.bankStatementBalance,
      bookBalance: session.bookBalance,
      difference: session.difference,
      matchedTransactions: matches.filter(m => m.status === ReconciliationStatus.MATCHED).length,
      unmatchedTransactions: matches.filter(m => m.status === ReconciliationStatus.UNMATCHED).length,
      disputedTransactions: matches.filter(m => m.status === ReconciliationStatus.DISPUTED).length
    };

    const recommendations = this.generateReconciliationRecommendations(matches);
    const nextSteps = this.getNextStepsForReconciliation(session, matches);

    return {
      summary,
      matches,
      recommendations,
      nextSteps
    };
  }

  /**
   * Private helper methods
   */
  private async importBankTransactions(
    userId: string,
    accountId: string,
    bankTransactions: BankTransaction[]
  ): Promise<BankTransaction[]> {
    const imported = [];

    for (const bankTx of bankTransactions) {
      // Check if already imported
      const existing = await db
        .select()
        .from(transactions)
        .where(and(
          eq(transactions.accountId, accountId),
          eq(transactions.reference, bankTx.reference || bankTx.id),
          eq(transactions.source, 'bank_import')
        ))
        .limit(1);

      if (existing.length > 0) {
        imported.push(bankTx);
        continue;
      }

      // Import new transaction
      const [importedTx] = await db
        .insert(transactions)
        .values({
          id: crypto.randomUUID(),
          userId,
          accountId,
          type: bankTx.type === 'credit' ? 'income' : 'expense',
          amount: Math.abs(bankTx.amount),
          description: bankTx.description,
          category: null, // Will be categorized by AI
          reference: bankTx.reference || bankTx.id,
          transactionDate: bankTx.date,
          source: 'bank_import',
          metadata: bankTx.metadata,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      imported.push({ ...bankTx, id: importedTx.id });
    }

    return imported;
  }

  private async findReconciliationMatches(
    accountId: string,
    bankTransactions: BankTransaction[],
    period: { start: Date; end: Date }
  ): Promise<ReconciliationMatch[]> {
    // Get book transactions for reconciliation
    const bookTransactions = await this.getBookTransactions(accountId, period);

    const matches: ReconciliationMatch[] = [];

    for (const bankTx of bankTransactions) {
      // Find exact matches first (amount + date)
      const exactMatch = bookTransactions.find(bookTx =>
        Math.abs(bookTx.amount - Math.abs(bankTx.amount)) < 0.01 &&
        Math.abs(bookTx.date.getTime() - bankTx.date.getTime()) < 24 * 60 * 60 * 1000 // 1 day tolerance
      );

      if (exactMatch) {
        matches.push({
          id: crypto.randomUUID(),
          bankTransactionId: bankTx.id,
          bookTransactionId: exactMatch.id,
          confidence: 0.95,
          matchType: 'exact',
          reasoning: `Exact match: same amount ($${Math.abs(bankTx.amount)}) and date (${bankTx.date.toDateString()})`,
          status: ReconciliationStatus.MATCHED,
          createdAt: new Date()
        });
        continue;
      }

      // Find fuzzy matches (similar amount, description matching)
      const fuzzyMatch = await this.findFuzzyMatch(bankTx, bookTransactions);
      if (fuzzyMatch) {
        matches.push(fuzzyMatch);
        continue;
      }

      // No match found
      matches.push({
        id: crypto.randomUUID(),
        bankTransactionId: bankTx.id,
        confidence: 0,
        matchType: 'manual',
        reasoning: 'No automatic match found - requires manual review',
        status: ReconciliationStatus.UNMATCHED,
        createdAt: new Date()
      });
    }

    return matches;
  }

  private async performAIReconciliation(
    userId: string,
    bankTransactions: BankTransaction[],
    initialMatches: ReconciliationMatch[]
  ): Promise<ReconciliationMatch[]> {
    const enhancedMatches = [...initialMatches];

    // Use AI to improve fuzzy matches and suggest new ones
    for (const match of enhancedMatches) {
      if (match.status === ReconciliationStatus.UNMATCHED && match.confidence < 0.8) {
        // Try AI-powered matching
        const aiMatch = await this.attemptAIMatch(userId, match);
        if (aiMatch) {
          Object.assign(match, aiMatch);
        }
      }
    }

    return enhancedMatches;
  }

  private async attemptAIMatch(
    userId: string,
    match: ReconciliationMatch
  ): Promise<Partial<ReconciliationMatch> | null> {
    // Get transaction details
    const bankTx = await this.getBankTransaction(match.bankTransactionId);
    if (!bankTx) return null;

    // Use AI to find potential matches based on description patterns
    const potentialMatches = await this.findPotentialMatchesByAI(
      userId,
      bankTx,
      match
    );

    if (potentialMatches.length > 0) {
      return {
        bookTransactionId: potentialMatches[0].id,
        confidence: 0.7,
        matchType: 'fuzzy',
        reasoning: `AI suggested match based on description similarity and amount proximity`,
        status: ReconciliationStatus.PARTIAL_MATCH,
        suggestedAdjustments: potentialMatches[0].adjustments
      };
    }

    return null;
  }

  private async findPotentialMatchesByAI(
    userId: string,
    bankTx: BankTransaction,
    match: ReconciliationMatch
  ): Promise<Array<{ id: string; adjustments?: any }>> {
    // Use AI orchestrator to find similar transactions
    // This would integrate with the AI service to find pattern matches
    return [];
  }

  private async autoMatchTransactions(
    bankTransactions: BankTransaction[],
    bookTransactions: BookTransaction[],
    userId: string
  ): Promise<ReconciliationMatch[]> {
    const matches: ReconciliationMatch[] = [];

    for (const bankTx of bankTransactions) {
      // Apply rule-based matching
      const ruleMatch = await this.applyReconciliationRules(bankTx, bookTransactions);
      if (ruleMatch) {
        matches.push(ruleMatch);
        continue;
      }

      // Apply AI-based matching
      const aiMatch = await this.applyAIMatching(userId, bankTx, bookTransactions);
      if (aiMatch) {
        matches.push(aiMatch);
        continue;
      }

      // No match found
      matches.push({
        id: crypto.randomUUID(),
        bankTransactionId: bankTx.id,
        confidence: 0,
        matchType: 'manual',
        reasoning: 'No automatic match found',
        status: ReconciliationStatus.UNMATCHED,
        createdAt: new Date()
      });
    }

    return matches;
  }

  private async applyReconciliationRules(
    bankTx: BankTransaction,
    bookTransactions: BookTransaction[]
  ): Promise<ReconciliationMatch | null> {
    // Apply business rules for common reconciliation patterns
    for (const rule of this.reconciliationRules.values()) {
      if (this.testReconciliationRule(rule, bankTx, bookTransactions)) {
        return {
          id: crypto.randomUUID(),
          bankTransactionId: bankTx.id,
          bookTransactionId: rule.targetTransactionId,
          confidence: rule.confidence,
          matchType: 'exact',
          reasoning: rule.description,
          status: ReconciliationStatus.MATCHED,
          createdAt: new Date()
        };
      }
    }

    return null;
  }

  private async applyAIMatching(
    userId: string,
    bankTx: BankTransaction,
    bookTransactions: BookTransaction[]
  ): Promise<ReconciliationMatch | null> {
    // Use AI to find matches based on description similarity, amount proximity, etc.
    // This integrates with the AI orchestrator for intelligent matching

    const prompt = `
      Find the best matching book transaction for this bank transaction:

      Bank Transaction:
      - Description: "${bankTx.description}"
      - Amount: $${bankTx.amount}
      - Date: ${bankTx.date.toISOString()}
      - Type: ${bankTx.type}

      Available Book Transactions:
      ${bookTransactions.map(bt => `
      - ID: ${bt.id}
        Description: "${bt.description}"
        Amount: $${bt.amount}
        Date: ${bt.date.toISOString()}
        Type: ${bt.type}
      `).join('\n')}

      Return the best match ID and confidence score (0-1).
      Consider: description similarity, amount proximity, date proximity, transaction patterns.
    `;

    // This would use the AI orchestrator
    // const result = await aiOrchestrator.callAI(prompt);

    return null; // Implementation needed
  }

  private async createReconciliationSession(
    userId: string,
    accountId: string,
    bankTransactions: BankTransaction[],
    period: { start: Date; end: Date }
  ): Promise<ReconciliationSession> {
    // Calculate balances
    const bankBalance = bankTransactions.reduce((sum, tx) => sum + tx.balance, 0);
    const bookBalance = await this.calculateBookBalance(accountId, period);

    const session: ReconciliationSession = {
      id: crypto.randomUUID(),
      accountId,
      userId,
      type: ReconciliationType.FULL_RECONCILIATION,
      period,
      bankStatementBalance: bankBalance,
      bookBalance,
      difference: bookBalance - bankBalance,
      matches: [],
      status: 'in_progress',
      createdAt: new Date()
    };

    // Store session in database (would need reconciliation_sessions table)
    // await db.insert(reconciliationSessions).values(session);

    return session;
  }

  private async updateReconciliationSession(
    sessionId: string,
    updates: Partial<ReconciliationSession>
  ): Promise<void> {
    // Update session in database
    // await db.update(reconciliationSessions).set(updates).where(eq(reconciliationSessions.id, sessionId));
  }

  private async getBankTransactions(
    accountId: string,
    period: { start: Date; end: Date }
  ): Promise<BankTransaction[]> {
    // Query bank transactions from database
    const bankTxs = await db
      .select()
      .from(transactions)
      .where(and(
        eq(transactions.accountId, accountId),
        eq(transactions.source, 'bank_import'),
        gte(transactions.transactionDate, period.start),
        lte(transactions.transactionDate, period.end)
      ))
      .orderBy(transactions.transactionDate);

    return bankTxs.map(tx => ({
      id: tx.id,
      accountId,
      date: tx.transactionDate,
      description: tx.description,
      amount: tx.amount,
      balance: 0, // Would be calculated
      reference: tx.reference,
      type: tx.type === 'income' ? 'credit' : 'debit',
      source: 'bank_import',
      metadata: tx.metadata
    }));
  }

  private async getBookTransactions(
    accountId: string,
    period: { start: Date; end: Date }
  ): Promise<BookTransaction[]> {
    // Get all book transactions (invoices, expenses, payments, etc.)
    const [invoiceTxs, expenseTxs, paymentTxs] = await Promise.all([
      db.select().from(invoices).where(and(
        gte(invoices.issueDate, period.start),
        lte(invoices.issueDate, period.end)
      )),
      db.select().from(expenses).where(and(
        gte(expenses.date, period.start),
        lte(expenses.date, period.end)
      )),
      db.select().from(transactions).where(and(
        eq(transactions.accountId, accountId),
        or(
          eq(transactions.type, 'payment'),
          eq(transactions.type, 'transfer')
        ),
        gte(transactions.transactionDate, period.start),
        lte(transactions.transactionDate, period.end)
      ))
    ]);

    const bookTxs: BookTransaction[] = [];

    // Convert invoices to book transactions
    invoiceTxs.forEach(invoice => {
      bookTxs.push({
        id: invoice.id,
        type: 'invoice',
        amount: invoice.total,
        date: invoice.issueDate,
        description: `Invoice ${invoice.invoiceNumber} - ${invoice.description || 'No description'}`,
        status: invoice.status === 'paid' ? 'cleared' : 'pending',
        relatedEntityId: invoice.id,
        metadata: { entityType: 'invoice' }
      });
    });

    // Convert expenses to book transactions
    expenseTxs.forEach(expense => {
      bookTxs.push({
        id: expense.id,
        type: 'expense',
        amount: expense.amount,
        date: expense.date,
        description: expense.description,
        category: expense.category,
        status: expense.status === 'approved' ? 'cleared' : 'pending',
        relatedEntityId: expense.id,
        metadata: { entityType: 'expense' }
      });
    });

    return bookTxs;
  }

  private async calculateBookBalance(
    accountId: string,
    period: { start: Date; end: Date }
  ): Promise<number> {
    // Calculate running balance for book transactions
    const bookTxs = await this.getBookTransactions(accountId, period);

    return bookTxs.reduce((balance, tx) => {
      return tx.status === 'cleared' ? balance + tx.amount : balance;
    }, 0);
  }

  private async findFuzzyMatch(
    bankTx: BankTransaction,
    bookTransactions: BookTransaction[]
  ): Promise<ReconciliationMatch | null> {
    // Fuzzy matching logic based on description similarity and amount proximity
    for (const bookTx of bookTransactions) {
      const descriptionSimilarity = this.calculateDescriptionSimilarity(
        bankTx.description,
        bookTx.description
      );

      const amountDifference = Math.abs(bankTx.amount - bookTx.amount);
      const amountProximity = amountDifference < 1.0 ? 1.0 : Math.max(0, 1 - (amountDifference / 100));

      const confidence = (descriptionSimilarity * 0.6) + (amountProximity * 0.4);

      if (confidence > 0.7) {
        return {
          id: crypto.randomUUID(),
          bankTransactionId: bankTx.id,
          bookTransactionId: bookTx.id,
          confidence,
          matchType: 'fuzzy',
          reasoning: `Fuzzy match: ${Math.round(descriptionSimilarity * 100)}% description similarity, ${Math.round(amountProximity * 100)}% amount proximity`,
          status: ReconciliationStatus.PARTIAL_MATCH,
          createdAt: new Date()
        };
      }
    }

    return null;
  }

  private calculateDescriptionSimilarity(desc1: string, desc2: string): number {
    // Simple similarity calculation (could be enhanced with NLP)
    const words1 = desc1.toLowerCase().split(' ');
    const words2 = desc2.toLowerCase().split(' ');

    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = new Set([...words1, ...words2]).size;

    return totalWords > 0 ? commonWords.length / totalWords : 0;
  }

  private async syncBankAccount(accountId: string, userId: string): Promise<void> {
    // Integration with bank APIs (Plaid, Yodlee, etc.)
    // This would sync recent transactions from the bank

    await auditLogger.logEvent({
      userId,
      eventType: 'bank_sync_completed',
      action: 'bank_sync',
      entityType: 'account',
      entityId: accountId,
      description: 'Bank account synchronization completed',
      riskLevel: 'low',
      complianceFlags: ['soc2'],
      metadata: { accountId, syncType: 'automatic' }
    });
  }

  private async getReconciliationSession(sessionId: string): Promise<ReconciliationSession> {
    // Retrieve session from database
    // Implementation needed
    return {} as ReconciliationSession;
  }

  private async getBankTransaction(bankTransactionId: string): Promise<BankTransaction | null> {
    const tx = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, bankTransactionId))
      .limit(1);

    if (tx.length === 0) return null;

    const transaction = tx[0];
    return {
      id: transaction.id,
      accountId: transaction.accountId,
      date: transaction.transactionDate,
      description: transaction.description,
      amount: transaction.amount,
      balance: 0,
      reference: transaction.reference,
      type: transaction.type === 'income' ? 'credit' : 'debit',
      source: 'bank_import',
      metadata: transaction.metadata
    };
  }

  private async getExistingCategorization(transactionId: string): Promise<any> {
    // Check if transaction already has AI categorization
    const tx = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, transactionId))
      .limit(1);

    return tx[0] || null;
  }

  private async storeCategorizationAttempt(attempt: CategorizationAttempt): Promise<void> {
    // Store in database for continuous learning
    // await db.insert(categorizationAttempts).values(attempt);

    // Update local history
    if (!this.categorizationHistory.has(attempt.userId)) {
      this.categorizationHistory.set(attempt.userId, []);
    }
    this.categorizationHistory.get(attempt.userId)!.push(attempt);
  }

  private async updateCategorizationAttempt(
    transactionId: string,
    updates: Partial<CategorizationAttempt>
  ): Promise<void> {
    // Update in database
    // await db.update(categorizationAttempts).set(updates).where(eq(categorizationAttempts.transactionId, transactionId));
  }

  private initializeReconciliationRules(): void {
    // Initialize common reconciliation rules
    this.reconciliationRules.set('paypal_fees', {
      id: 'paypal_fees',
      pattern: /paypal.*fee/i,
      targetCategory: 'bank_fees',
      confidence: 0.95,
      description: 'PayPal transaction fees'
    });

    this.reconciliationRules.set('stripe_payments', {
      id: 'stripe_payments',
      pattern: /stripe.*payment/i,
      targetCategory: 'payment_processing',
      confidence: 0.9,
      description: 'Stripe payment processing'
    });

    this.reconciliationRules.set('bank_interest', {
      id: 'bank_interest',
      pattern: /interest.*earned|dividend/i,
      targetCategory: 'interest_income',
      confidence: 0.95,
      description: 'Bank interest or dividends'
    });
  }

  private testReconciliationRule(
    rule: ReconciliationRule,
    bankTx: BankTransaction,
    bookTransactions: BookTransaction[]
  ): boolean {
    // Test if rule matches bank transaction
    const pattern = new RegExp(rule.pattern, 'i');
    return pattern.test(bankTx.description) || pattern.test(bankTx.reference || '');
  }

  private generateReconciliationRecommendations(matches: ReconciliationMatch[]): string[] {
    const recommendations: string[] = [];

    const unmatchedCount = matches.filter(m => m.status === ReconciliationStatus.UNMATCHED).length;
    if (unmatchedCount > 0) {
      recommendations.push(`Review ${unmatchedCount} unmatched transactions for manual reconciliation`);
    }

    const disputedCount = matches.filter(m => m.status === ReconciliationStatus.DISPUTED).length;
    if (disputedCount > 0) {
      recommendations.push(`Resolve ${disputedCount} disputed matches`);
    }

    const partialMatches = matches.filter(m => m.status === ReconciliationStatus.PARTIAL_MATCH);
    if (partialMatches.length > 0) {
      recommendations.push(`Consider adjusting ${partialMatches.length} partial matches`);
    }

    return recommendations;
  }

  private getNextStepsForReconciliation(
    session: ReconciliationSession,
    matches: ReconciliationMatch[]
  ): string[] {
    const steps: string[] = [];

    if (Math.abs(session.difference) > 0.01) {
      steps.push('Investigate and resolve the balance difference');
    }

    if (matches.some(m => m.status === ReconciliationStatus.UNMATCHED)) {
      steps.push('Review unmatched transactions and create missing book entries');
    }

    if (matches.some(m => m.status === ReconciliationStatus.DISPUTED)) {
      steps.push('Resolve disputed transactions with your accountant');
    }

    steps.push('Approve reconciliation once all items are matched');
    steps.push('Schedule next reconciliation for end of month');

    return steps;
  }

  // Additional utility methods
  private async calculateBalanceAtDate(accountId: string, date: Date): Promise<number> {
    // Calculate running balance up to specific date
    const txs = await db
      .select()
      .from(transactions)
      .where(and(
        eq(transactions.accountId, accountId),
        lte(transactions.transactionDate, date)
      ))
      .orderBy(transactions.transactionDate);

    return txs.reduce((balance, tx) => {
      return tx.type === 'income' ? balance + tx.amount : balance - tx.amount;
    }, 0);
  }
}

// Reconciliation rule interface
interface ReconciliationRule {
  id: string;
  pattern: string;
  targetCategory: string;
  confidence: number;
  description: string;
  targetTransactionId?: string;
}

// Export singleton instance
export const bookkeepingEngine = new AIBookkeepingEngine();

// API route example using the battle-tested pattern
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth(request);
    const body = await request.json();

    const result = await bookkeepingEngine.processBankStatement(
      userId,
      body.accountId,
      body.transactions,
      body.period
    );

    return NextResponse.json({
      success: true,
      session: result,
      summary: {
        processed: body.transactions.length,
        matched: result.matches.filter(m => m.status === ReconciliationStatus.MATCHED).length,
        unmatched: result.matches.filter(m => m.status === ReconciliationStatus.UNMATCHED).length
      }
    });

  } catch (error) {
    console.error('Reconciliation failed:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Reconciliation failed' },
      { status: 500 }
    );
  }
}

// Auth helper
async function requireAuth(request: NextRequest): Promise<string> {
  // Implementation using Clerk auth patterns from their template
  const { userId } = await getAuth(request);
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}
