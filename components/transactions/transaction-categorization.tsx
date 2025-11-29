/**
 * Enhanced Transaction Categorization Component
 * AI-powered categorization with explainability and feedback loops
 * Bridges Found-style automation with Digits-style transparency
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Eye,
  MessageSquare,
  Brain,
  Target,
  Clock,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { aiOrchestrator } from '@/lib/services/ai/unified-ai-orchestrator';
import type {
import { logger } from '@/lib/logger';
  CategorizationResult,
  AIExplanation,
  AIFeedback
} from '@/lib/services/ai/unified-ai-orchestrator';

// Transaction categories for manual override
const TRANSACTION_CATEGORIES = [
  { value: 'office_supplies', label: 'Office Supplies', color: 'bg-blue-100 text-blue-800' },
  { value: 'software', label: 'Software & Tools', color: 'bg-purple-100 text-purple-800' },
  { value: 'marketing', label: 'Marketing & Advertising', color: 'bg-green-100 text-green-800' },
  { value: 'travel', label: 'Travel & Transportation', color: 'bg-orange-100 text-orange-800' },
  { value: 'meals', label: 'Meals & Entertainment', color: 'bg-red-100 text-red-800' },
  { value: 'professional_services', label: 'Professional Services', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'utilities', label: 'Utilities', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'insurance', label: 'Insurance', color: 'bg-pink-100 text-pink-800' },
  { value: 'rent', label: 'Rent & Facilities', color: 'bg-gray-100 text-gray-800' },
  { value: 'other', label: 'Other', color: 'bg-slate-100 text-slate-800' }
];

// Form validation schema
const feedbackSchema = z.object({
  userCorrection: z.string().min(1, 'Please select or enter a category'),
  reasoning: z.string().min(10, 'Please provide detailed feedback (minimum 10 characters)'),
  confidence: z.number().min(1).max(5)
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface TransactionData {
  id: string;
  description: string;
  amount: number;
  date: Date;
  reference?: string;
  merchant?: string;
  accountId?: string;
}

interface TransactionCategorizationProps {
  transaction: TransactionData;
  onCategoryChange?: (category: string, confidence: number) => void;
  onFeedbackSubmit?: (feedback: AIFeedback) => void;
  showExplanation?: boolean;
  autoCategorize?: boolean;
  className?: string;
}

export function TransactionCategorization({
  transaction,
  onCategoryChange,
  onFeedbackSubmit,
  showExplanation = true,
  autoCategorize = true,
  className
}: TransactionCategorizationProps) {
  const [result, setResult] = useState<CategorizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [explanationExpanded, setExplanationExpanded] = useState(false);

  const feedbackForm = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      userCorrection: result?.category || '',
      reasoning: '',
      confidence: 3
    }
  });

  // Auto-categorize on mount if enabled
  useEffect(() => {
    if (autoCategorize && !result) {
      categorizeTransaction();
    }
  }, [autoCategorize, transaction]);

  const categorizeTransaction = async () => {
    setLoading(true);
    setError(null);

    try {
      const categorizationResult = await aiOrchestrator.categorizeTransaction(
        'current-user-id', // This would come from auth context
        {
          description: transaction.description,
          amount: transaction.amount,
          date: transaction.date,
          reference: transaction.reference,
          merchant: transaction.merchant
        }
      );

      setResult(categorizationResult);
      onCategoryChange?.(categorizationResult.category, categorizationResult.confidence);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Categorization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (data: FeedbackFormData) => {
    if (!result) return;

    const feedback: AIFeedback = {
      id: crypto.randomUUID(),
      transactionId: transaction.id,
      userId: 'current-user-id', // From auth context
      originalPrediction: result.category,
      userCorrection: data.userCorrection,
      reasoning: data.reasoning,
      confidence: data.confidence / 5, // Convert 1-5 scale to 0-1
      accepted: data.userCorrection === result.category,
      timestamp: new Date()
    };

    try {
      await aiOrchestrator.processFeedback('current-user-id', feedback);
      onFeedbackSubmit?.(feedback);
      setShowFeedbackDialog(false);
      feedbackForm.reset();
    } catch (err) {
      logger.error('Failed to submit feedback:', err);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="h-4 w-4" />;
    if (confidence >= 0.6) return <AlertTriangle className="h-4 w-4" />;
    return <Info className="h-4 w-4" />;
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">AI Categorization</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={categorizeTransaction}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Recategorize
          </Button>
        </div>
        <CardDescription>
          Intelligent transaction categorization with explainability
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Transaction Summary */}
        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="font-medium">{transaction.description}</p>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                <span className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  ${transaction.amount.toLocaleString()}
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {transaction.date.toLocaleDateString()}
                </span>
                {transaction.merchant && (
                  <span className="flex items-center">
                    <Target className="h-4 w-4 mr-1" />
                    {transaction.merchant}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">Analyzing transaction...</span>
            </div>
            <Progress value={undefined} className="h-2" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Categorization Result */}
        {result && !loading && (
          <div className="space-y-4">
            {/* Category Result */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {getConfidenceIcon(result.confidence)}
                  <Badge
                    variant="secondary"
                    className={TRANSACTION_CATEGORIES.find(c => c.value === result.category)?.color}
                  >
                    {TRANSACTION_CATEGORIES.find(c => c.value === result.category)?.label || result.category}
                  </Badge>
                </div>
                <div className={cn("text-sm font-medium", getConfidenceColor(result.confidence))}>
                  {Math.round(result.confidence * 100)}% confidence
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFeedbackDialog(true)}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Feedback
                </Button>
                {showExplanation && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExplanationExpanded(!explanationExpanded)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {explanationExpanded ? 'Hide' : 'Show'} Explanation
                  </Button>
                )}
              </div>
            </div>

            {/* AI Explanation */}
            {showExplanation && explanationExpanded && result.explanation && (
              <Tabs defaultValue="reasoning" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="reasoning">Reasoning</TabsTrigger>
                  <TabsTrigger value="evidence">Evidence</TabsTrigger>
                  <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
                </TabsList>

                <TabsContent value="reasoning" className="space-y-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center">
                        <Brain className="h-4 w-4 mr-2" />
                        AI Reasoning
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground">
                        {result.explanation.reasoning}
                      </p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <div className="text-xs text-muted-foreground">
                          Model: {result.explanation.model} • Provider: {result.explanation.provider}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Processed in {result.metadata.processingTime}ms
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="evidence" className="space-y-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Evidence Points</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-2">
                        {result.explanation.evidence.map((evidence, index) => (
                          <li key={index} className="flex items-start space-x-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{evidence}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="alternatives" className="space-y-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Alternative Categorizations</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {result.explanation.alternatives?.map((alt, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">
                                {TRANSACTION_CATEGORIES.find(c => c.value === alt.option)?.label || alt.option}
                              </Badge>
                              <span className={cn("text-sm font-medium", getConfidenceColor(alt.confidence))}>
                                {Math.round(alt.confidence * 100)}%
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground max-w-xs">
                              {alt.reasoning}
                            </p>
                          </div>
                        )) || (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No alternatives generated
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}

            {/* Data Sources */}
            <div className="text-xs text-muted-foreground">
              <strong>Sources:</strong> {result.explanation.sources.join(', ')}
            </div>
          </div>
        )}

        {/* Manual Override */}
        <div className="pt-4 border-t">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium">Manual Override:</span>
            <Select
              value={result?.category || ''}
              onValueChange={(value) => {
                setResult(prev => prev ? {
                  ...prev,
                  category: value,
                  confidence: 1.0,
                  explanation: {
                    ...prev.explanation,
                    reasoning: 'Manually overridden by user',
                    confidence: 1.0,
                    timestamp: new Date(),
                    model: 'user_override',
                    provider: prev.explanation.provider
                  }
                } : null);
                onCategoryChange?.(value, 1.0);
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {TRANSACTION_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>

      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Provide Feedback</DialogTitle>
            <DialogDescription>
              Help improve our AI by providing feedback on this categorization.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={feedbackForm.handleSubmit(handleFeedbackSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Correct Category</label>
              <Select
                value={feedbackForm.watch('userCorrection')}
                onValueChange={(value) => feedbackForm.setValue('userCorrection', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select the correct category" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {feedbackForm.formState.errors.userCorrection && (
                <p className="text-sm text-destructive mt-1">
                  {feedbackForm.formState.errors.userCorrection.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Your Reasoning</label>
              <textarea
                {...feedbackForm.register('reasoning')}
                className="w-full h-24 p-2 border rounded-md text-sm"
                placeholder="Why is this categorization incorrect? What context would help the AI improve?"
              />
              {feedbackForm.formState.errors.reasoning && (
                <p className="text-sm text-destructive mt-1">
                  {feedbackForm.formState.errors.reasoning.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">
                How confident are you in this correction? (1-5)
              </label>
              <Select
                value={feedbackForm.watch('confidence').toString()}
                onValueChange={(value) => feedbackForm.setValue('confidence', parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Not very confident</SelectItem>
                  <SelectItem value="2">2 - Somewhat confident</SelectItem>
                  <SelectItem value="3">3 - Moderately confident</SelectItem>
                  <SelectItem value="4">4 - Quite confident</SelectItem>
                  <SelectItem value="5">5 - Very confident</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFeedbackDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={feedbackForm.formState.isSubmitting}>
                {feedbackForm.formState.isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Bulk categorization component for multiple transactions
interface BulkTransactionCategorizationProps {
  transactions: TransactionData[];
  onBulkCategoryChange?: (results: Array<{ id: string; category: string; confidence: number }>) => void;
  className?: string;
}

export function BulkTransactionCategorization({
  transactions,
  onBulkCategoryChange,
  className
}: BulkTransactionCategorizationProps) {
  const [results, setResults] = useState<Map<string, CategorizationResult>>(new Map());
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const categorizeAll = async () => {
    setLoading(true);
    setProgress(0);

    const newResults = new Map<string, CategorizationResult>();

    for (let i = 0; i < transactions.length; i++) {
      try {
        const result = await aiOrchestrator.categorizeTransaction(
          'current-user-id',
          {
            description: transactions[i].description,
            amount: transactions[i].amount,
            date: transactions[i].date,
            reference: transactions[i].reference,
            merchant: transactions[i].merchant
          }
        );

        newResults.set(transactions[i].id, result);
        setProgress((i + 1) / transactions.length * 100);
      } catch (error) {
        logger.error(`Failed to categorize transaction ${transactions[i].id}:`, error);
      }
    }

    setResults(newResults);
    setLoading(false);

    // Notify parent component
    const bulkResults = Array.from(newResults.entries()).map(([id, result]) => ({
      id,
      category: result.category,
      confidence: result.confidence
    }));

    onBulkCategoryChange?.(bulkResults);
  };

  const uncategorizedCount = transactions.length - results.size;
  const lowConfidenceCount = Array.from(results.values()).filter(r => r.confidence < 0.6).length;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Bulk AI Categorization</CardTitle>
            <CardDescription>
              Automatically categorize multiple transactions
            </CardDescription>
          </div>
          <Button onClick={categorizeAll} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Categorize All'
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processing transactions...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{transactions.length}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-700">{uncategorizedCount}</div>
            <div className="text-sm text-yellow-600">Uncategorized</div>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-700">{lowConfidenceCount}</div>
            <div className="text-sm text-red-600">Low Confidence</div>
          </div>
        </div>

        {results.size > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Results Preview</h4>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {Array.from(results.entries()).slice(0, 5).map(([id, result]) => {
                const transaction = transactions.find(t => t.id === id);
                return (
                  <div key={id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1 truncate">
                      <p className="text-sm font-medium truncate">{transaction?.description}</p>
                      <p className="text-xs text-muted-foreground">
                        ${transaction?.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {TRANSACTION_CATEGORIES.find(c => c.value === result.category)?.label}
                      </Badge>
                      <span className={cn(
                        "text-xs font-medium",
                        result.confidence >= 0.8 ? "text-green-600" :
                        result.confidence >= 0.6 ? "text-yellow-600" : "text-red-600"
                      )}>
                        {Math.round(result.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
