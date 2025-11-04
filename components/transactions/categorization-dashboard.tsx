/**
 * Transaction Categorization Component with Human-in-the-Loop AI
 * Uses battle-tested patterns: atomic components, optimistic UI, TypeScript safety
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Brain,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Target,
  DollarSign,
  Calendar,
  Filter,
  Download,
  Upload,
  Plus,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { bookkeepingEngine } from '@/lib/services/bookkeeping/ai-bookkeeping-engine';
import { aiOrchestrator } from '@/lib/services/ai/unified-ai-orchestrator';
import { TransactionCategorization } from '@/components/transactions/transaction-categorization';

// Transaction interfaces
interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: Date;
  category?: string;
  confidence?: number;
  merchant?: string;
  reference?: string;
  accountId: string;
  status: 'pending' | 'categorized' | 'reviewed';
  aiExplanation?: {
    reasoning: string;
    evidence: string[];
    confidence: number;
    alternatives?: Array<{ category: string; confidence: number; reasoning: string }>;
  };
}

// Categorization feedback schema
const feedbackSchema = z.object({
  userCorrection: z.string().min(1, 'Please select or enter a category'),
  reasoning: z.string().min(10, 'Please provide detailed feedback (minimum 10 characters)'),
  confidence: z.number().min(1).max(5)
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface TransactionCategorizationProps {
  userId: string;
  accountId?: string;
  className?: string;
}

export function TransactionCategorizationDashboard({
  userId,
  accountId,
  className
}: TransactionCategorizationProps) {
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterConfidence, setFilterConfidence] = useState<string>('all');
  const [showFeedbackDialog, setShowFeedbackDialog] = useState<string | null>(null);
  const [showBulkCategorize, setShowBulkCategorize] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const queryClient = useQueryClient();

  // Fetch uncategorized transactions
  const { data: transactions, isLoading, refetch } = useQuery({
    queryKey: ['uncategorized-transactions', userId, accountId],
    queryFn: async () => {
      // This would fetch from your API
      return [] as Transaction[];
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch categorization statistics
  const { data: stats } = useQuery({
    queryKey: ['categorization-stats', userId],
    queryFn: async () => {
      // This would fetch from your API
      return {
        total: 0,
        categorized: 0,
        pending: 0,
        lowConfidence: 0,
        accuracy: 0.95
      };
    }
  });

  // Individual categorization mutation
  const categorizeMutation = useMutation({
    mutationFn: async (transactionIds: string[]) => {
      const txs = transactions?.filter(t => transactionIds.includes(t.id)) || [];
      return await bookkeepingEngine.categorizeTransactions(
        userId,
        txs.map(t => ({
          id: t.id,
          description: t.description,
          amount: t.amount,
          date: t.date
        }))
      );
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['uncategorized-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['categorization-stats'] });
    },
    onError: (error) => {
      console.error('Categorization failed:', error);
    }
  });

  // Bulk categorization mutation
  const bulkCategorizeMutation = useMutation({
    mutationFn: async (transactionIds: string[]) => {
      return await categorizeTransactions(transactionIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uncategorized-transactions'] });
      setShowBulkCategorize(false);
      setSelectedTransactions([]);
    }
  });

  // Feedback submission mutation
  const feedbackMutation = useMutation({
    mutationFn: async ({
      transactionId,
      originalCategory,
      correctedCategory,
      reasoning,
      confidence
    }: {
      transactionId: string;
      originalCategory: string;
      correctedCategory: string;
      reasoning: string;
      confidence: number;
    }) => {
      return await bookkeepingEngine.processCategorizationFeedback(
        userId,
        transactionId,
        originalCategory,
        correctedCategory,
        reasoning,
        confidence
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uncategorized-transactions'] });
      setShowFeedbackDialog(null);
    }
  });

  const feedbackForm = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      userCorrection: '',
      reasoning: '',
      confidence: 3
    }
  });

  // Filter transactions based on current filters
  const filteredTransactions = React.useMemo(() => {
    if (!transactions) return [];

    return transactions.filter(transaction => {
      const categoryMatch = filterCategory === 'all' || transaction.category === filterCategory;
      const confidenceMatch =
        filterConfidence === 'all' ||
        (filterConfidence === 'low' && (transaction.confidence || 0) < 0.6) ||
        (filterConfidence === 'medium' && (transaction.confidence || 0) >= 0.6 && (transaction.confidence || 0) < 0.8) ||
        (filterConfidence === 'high' && (transaction.confidence || 0) >= 0.8);

      return categoryMatch && confidenceMatch;
    });
  }, [transactions, filterCategory, filterConfidence]);

  const handleCategorizeSelected = async () => {
    if (selectedTransactions.length === 0) return;

    categorizeMutation.mutate(selectedTransactions);
  };

  const handleBulkCategorize = async () => {
    const uncategorizedIds = transactions?.filter(t => !t.category).map(t => t.id) || [];
    bulkCategorizeMutation.mutate(uncategorizedIds);
  };

  const handleFeedbackSubmit = async (data: FeedbackFormData) => {
    if (!showFeedbackDialog) return;

    const transaction = transactions?.find(t => t.id === showFeedbackDialog);
    if (!transaction || !transaction.category) return;

    await feedbackMutation.mutateAsync({
      transactionId: showFeedbackDialog,
      originalCategory: transaction.category,
      correctedCategory: data.userCorrection,
      reasoning: data.reasoning,
      confidence: data.confidence / 5 // Convert 1-5 to 0-1
    });

    feedbackForm.reset();
  };

  const handleFileUpload = async (file: File) => {
    setUploadProgress(0);

    // Simulate file processing
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          refetch(); // Refresh transactions
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // This would process the uploaded file and extract transactions
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('File upload failed:', error);
    }
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-gray-600';
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence?: number) => {
    if (!confidence) return <Badge variant="secondary">Unreviewed</Badge>;
    if (confidence >= 0.8) return <Badge className="bg-green-100 text-green-800">High</Badge>;
    if (confidence >= 0.6) return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
    return <Badge className="bg-red-100 text-red-800">Low</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transaction Categorization</h1>
          <p className="text-muted-foreground">
            AI-powered categorization with continuous learning from your feedback
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>

          <div className="relative">
            <input
              type="file"
              accept=".csv,.xlsx,.tsv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="file-upload"
            />
            <Button variant="outline" asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </label>
            </Button>
          </div>

          <Button onClick={() => setShowBulkCategorize(true)}>
            <Brain className="h-4 w-4 mr-2" />
            Bulk Categorize
          </Button>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Processing uploaded transactions... {uploadProgress}%
            <Progress value={uploadProgress} className="mt-2" />
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pending} pending categorization
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Accuracy</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {Math.round(stats.accuracy * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Based on user feedback
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Confidence</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.lowConfidence}</div>
              <p className="text-xs text-muted-foreground">
                Need manual review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Auto-Categorized</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.categorized}</div>
              <p className="text-xs text-muted-foreground">
                High confidence matches
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Review</CardTitle>
          <CardDescription>
            Review and correct AI categorizations to improve future accuracy
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="office_supplies">Office Supplies</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Select value={filterConfidence} onValueChange={setFilterConfidence}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Confidence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Confidence</SelectItem>
                  <SelectItem value="high">High (80%+)</SelectItem>
                  <SelectItem value="medium">Medium (60-80%)</SelectItem>
                  <SelectItem value="low">Low (&lt;60%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {selectedTransactions.length} selected
              </span>

              {selectedTransactions.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCategorizeSelected}
                  disabled={categorizeMutation.isPending}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Categorize Selected
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkCategorize}
                disabled={bulkCategorizeMutation.isPending}
              >
                <Target className="h-4 w-4 mr-2" />
                Categorize All
              </Button>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.length === filteredTransactions.length && filteredTransactions.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTransactions(filteredTransactions.map(t => t.id));
                        } else {
                          setSelectedTransactions([]);
                        }
                      }}
                      className="rounded"
                    />
                  </TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>AI Category</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map(transaction => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    isSelected={selectedTransactions.includes(transaction.id)}
                    onSelect={(checked) => {
                      if (checked) {
                        setSelectedTransactions(prev => [...prev, transaction.id]);
                      } else {
                        setSelectedTransactions(prev => prev.filter(id => id !== transaction.id));
                      }
                    }}
                    onFeedback={() => setShowFeedbackDialog(transaction.id)}
                    onViewExplanation={() => {
                      // Show explanation in a modal or expand inline
                    }}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Categorization Dialog */}
      <Dialog open={showBulkCategorize} onOpenChange={setShowBulkCategorize}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk AI Categorization</DialogTitle>
            <DialogDescription>
              Use AI to automatically categorize all uncategorized transactions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uncategorized Transactions</span>
                <Badge variant="secondary">
                  {transactions?.filter(t => !t.category).length || 0}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                AI will analyze each transaction and suggest the most appropriate category
              </p>
            </div>

            <Alert>
              <Brain className="h-4 w-4" />
              <AlertDescription>
                You can review and correct any categorizations after processing. Your feedback helps improve future accuracy.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkCategorize(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkCategorize}
              disabled={bulkCategorizeMutation.isPending}
            >
              {bulkCategorizeMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Start AI Categorization
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={!!showFeedbackDialog} onOpenChange={() => setShowFeedbackDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Provide Feedback</DialogTitle>
            <DialogDescription>
              Help improve our AI by correcting this categorization
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={feedbackForm.handleSubmit(handleFeedbackSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Correct Category</label>
              <Select
                value={feedbackForm.watch('userCorrection')}
                onValueChange={(value) => feedbackForm.setValue('userCorrection', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select the correct category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="office_supplies">Office Supplies</SelectItem>
                  <SelectItem value="software">Software & Tools</SelectItem>
                  <SelectItem value="marketing">Marketing & Advertising</SelectItem>
                  <SelectItem value="travel">Travel & Transportation</SelectItem>
                  <SelectItem value="meals">Meals & Entertainment</SelectItem>
                  <SelectItem value="professional_services">Professional Services</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
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
                className="w-full h-24 p-2 border rounded-md text-sm mt-1"
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
                <SelectTrigger className="w-full mt-1">
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
                onClick={() => setShowFeedbackDialog(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={feedbackMutation.isPending}>
                {feedbackMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Individual transaction row component
interface TransactionRowProps {
  transaction: Transaction;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onFeedback: () => void;
  onViewExplanation: () => void;
}

function TransactionRow({
  transaction,
  isSelected,
  onSelect,
  onFeedback,
  onViewExplanation
}: TransactionRowProps) {
  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          className="rounded"
        />
      </TableCell>

      <TableCell>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{transaction.date.toLocaleDateString()}</span>
        </div>
      </TableCell>

      <TableCell>
        <div className="max-w-xs">
          <p className="font-medium truncate">{transaction.description}</p>
          {transaction.merchant && (
            <p className="text-xs text-muted-foreground">{transaction.merchant}</p>
          )}
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center space-x-1">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono">{formatCurrency(transaction.amount)}</span>
        </div>
      </TableCell>

      <TableCell>
        {transaction.category ? (
          <Badge variant="secondary">{transaction.category.replace('_', ' ')}</Badge>
        ) : (
          <Badge variant="outline">Uncategorized</Badge>
        )}
      </TableCell>

      <TableCell>
        <div className="flex items-center space-x-2">
          {getConfidenceBadge(transaction.confidence)}
          {transaction.confidence && (
            <span className={cn("text-xs font-medium", getConfidenceColor(transaction.confidence))}>
              {Math.round((transaction.confidence || 0) * 100)}%
            </span>
          )}
        </div>
      </TableCell>

      <TableCell>
        <Badge
          variant={transaction.status === 'categorized' ? 'default' : 'secondary'}
        >
          {transaction.status}
        </Badge>
      </TableCell>

      <TableCell>
        <div className="flex items-center space-x-1">
          {transaction.aiExplanation && (
            <Button variant="ghost" size="sm" onClick={onViewExplanation}>
              <Eye className="h-4 w-4" />
            </Button>
          )}

          {transaction.category && (
            <Button variant="ghost" size="sm" onClick={onFeedback}>
              <MessageSquare className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

// Bulk categorization function
async function categorizeTransactions(transactionIds: string[]) {
  // This would use the AI orchestration service
  // Implementation would call the categorizeTransactions API
  return [];
}
