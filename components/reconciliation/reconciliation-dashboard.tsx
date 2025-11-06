/**
 * Reconciliation Dashboard Component
 * Real-time bank reconciliation with AI assistance
 * Uses battle-tested patterns: atomic components, optimistic UI, proper typing
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Clock,
  RefreshCw,
  Target,
  DollarSign,
  Calendar,
  Banknote,
  TrendingUp,
  FileText,
  Check,
  X,
  Eye,
  MessageSquare,
  Brain,
  Zap,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

// Types based on our new schema
interface ReconciliationSession {
  id: string;
  name: string;
  status: "pending" | "in_progress" | "completed" | "failed" | "cancelled";
  completedAt?: string;
  matchedTransactions: number;
  unmatchedTransactions: number;
  aiConfidence?: number;
  difference?: string;
  startDate: string;
  endDate: string;
  accountId: string;
  statementBalance?: string;
  bookBalance?: string;
}

interface ReconciliationMatch {
  id: string;
  sessionId: string;
  status: "matched" | "unmatched" | "disputed" | "resolved";
  confidence: "high" | "medium" | "low" | "manual";
  confidenceScore?: number;
  matchCriteria?: string[];
  matchReason?: string;
  statementAmount?: string;
  statementDescription?: string;
  statementDate?: string;
  bookAmount?: string;
  bookDescription?: string;
  bookDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface Account {
  id: string;
  name: string;
  type: string;
  bankName?: string;
  lastSync?: Date;
  balance: number;
}

interface ReconciliationDashboardProps {
  userId: string;
  className?: string;
}

export function ReconciliationDashboard({ userId, className }: ReconciliationDashboardProps) {
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [showMatchDetails, setShowMatchDetails] = useState<string | null>(null);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const queryClient = useQueryClient();

  // Fetch accounts
  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ['accounts', userId],
    queryFn: async () => {
      const response = await fetch(`/api/accounts?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch accounts');
      return response.json().then(data => data.accounts || []);
    }
  });

  // Fetch reconciliation sessions
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['reconciliation-sessions', userId, selectedAccount],
    queryFn: async () => {
      const response = await fetch(`/api/reconciliation/sessions`);
      if (!response.ok) throw new Error('Failed to fetch sessions');
      return response.json().then(data => data.data || []);
    },
    enabled: true
  });

  // Fetch current reconciliation session matches
  const { data: currentSessionMatches, isLoading: matchesLoading } = useQuery({
    queryKey: ['reconciliation-matches', selectedSession],
    queryFn: async () => {
      if (!selectedSession) return [];
      const response = await fetch(`/api/reconciliation/match/${selectedSession}`);
      if (!response.ok) throw new Error('Failed to fetch matches');
      return response.json().then(data => data.data?.matches || []);
    },
    enabled: !!selectedSession
  });

  // Create reconciliation session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: {
      accountId: string;
      name: string;
      description?: string;
      type: string;
      startDate: string;
      endDate: string;
      statementBalance?: number;
    }) => {
      const response = await fetch('/api/reconciliation/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      });
      if (!response.ok) throw new Error('Failed to create session');
      return response.json().then(data => data.data);
    },
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ['reconciliation-sessions'] });
      setSelectedSession(session.id);
      setShowCreateSession(false);
    }
  });

  // Start matching mutation
  const startMatchingMutation = useMutation({
    mutationFn: async (data: {
      sessionId: string;
      statementTransactions: Array<{
        id: string;
        amount: number;
        description: string;
        date: Date;
        reference?: string;
      }>;
    }) => {
      const response = await fetch('/api/reconciliation/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to find matches');
      return response.json().then(data => data.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reconciliation-matches'] });
    }
  });

  const handleCreateSession = (formData: any) => {
    if (!selectedAccount) return;

    createSessionMutation.mutate({
      accountId: selectedAccount,
      name: formData.name,
      description: formData.description,
      type: formData.type || "bank_statement",
      startDate: formData.startDate,
      endDate: formData.endDate,
      statementBalance: formData.statementBalance ? Number(formData.statementBalance) : undefined,
    });
  };

  const handleStartMatching = async () => {
    if (!selectedSession) return;

    try {
      // Get session details to fetch transactions for the date range
      const session = sessions?.find(s => s.id === selectedSession);
      if (!session) {
        console.error('Session not found');
        return;
      }

      // Fetch statement transactions from API
      // First try to get statement transactions if they exist
      let statementTransactions: Array<{
        id: string;
        amount: number;
        description: string;
        date: Date;
        reference?: string;
      }> = [];

      try {
        // Try to fetch from reconciliation statement transactions endpoint
        const response = await fetch(`/api/reconciliation/statement-transactions/${selectedSession}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            statementTransactions = result.data.map((tx: any) => ({
              id: tx.id,
              amount: parseFloat(tx.amount),
              description: tx.description || '',
              date: new Date(tx.date),
              reference: tx.reference,
            }));
          }
        }
      } catch (error) {
        console.warn('Could not fetch statement transactions, using transactions API:', error);
      }

      // If no statement transactions found, fetch from transactions API as fallback
      if (statementTransactions.length === 0) {
        const transactionsResponse = await fetch(
          `/api/transactions?accountId=${session.accountId}&startDate=${session.startDate}&endDate=${session.endDate}&limit=1000`
        );
        if (transactionsResponse.ok) {
          const transactionsResult = await transactionsResponse.json();
          if (transactionsResult.transactions && transactionsResult.transactions.length > 0) {
            statementTransactions = transactionsResult.transactions.map((tx: any) => ({
              id: tx.id,
              amount: parseFloat(tx.amount),
              description: tx.description || '',
              date: new Date(tx.transactionDate),
              reference: tx.referenceId,
            }));
          }
        }
      }

      // If still no transactions, show a message
      if (statementTransactions.length === 0) {
        toast({
          title: 'No Statement Transactions',
          description: 'Please import bank statement transactions first.',
          variant: 'destructive',
        });
        return;
      }

      startMatchingMutation.mutate({
        sessionId: selectedSession,
        statementTransactions
      });
    } catch (error) {
      console.error('Error fetching statement transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch statement transactions. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return 'bg-green-100 text-green-800';
      case "in_progress":
        return 'bg-blue-100 text-blue-800';
      case "pending":
        return 'bg-yellow-100 text-yellow-800';
      case "failed":
        return 'bg-red-100 text-red-800';
      case "cancelled":
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return "text-gray-600";
    if (confidence >= 80) return "text-green-600";
    if (confidence >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const formatCurrency = (amount: string | number | undefined) => {
    if (!amount) return "$0.00";
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numAmount);
  };

  const currentSession = sessions?.find((s: any) => s.id === selectedSession);

  if (accountsLoading || sessionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading reconciliation data...</span>
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Reconciliation Center</h1>
          <p className="text-muted-foreground">
            Automated transaction matching and intelligent bookkeeping
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>
            <SelectContent>
              {accounts?.map((account: any) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} ({account.bankName})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedAccount && (
            <Button variant="outline" onClick={() => setShowCreateSession(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Session
            </Button>
          )}
        </div>
      </div>

      {/* Sessions Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions?.filter((s: any) => s.status === "in_progress").length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently reconciling
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions?.filter((s: any) => s.status === "completed").length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully finished
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                const completedSessions = sessions?.filter((s: any) => s.status === "completed") || [];
                if (completedSessions.length === 0) return "0%";
                const avgConfidence = completedSessions.reduce((acc: number, s: any) => acc + (s.aiConfidence || 0), 0) / completedSessions.length;
                return `${Math.round(avgConfidence)}%`;
              })()}
            </div>
            <p className="text-xs text-muted-foreground">
              AI matching accuracy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Match Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                const allSessions = sessions || [];
                if (allSessions.length === 0) return "0%";
                const totalTransactions = allSessions.reduce((acc: number, s: any) => acc + s.matchedTransactions + s.unmatchedTransactions, 0);
                const matchedTransactions = allSessions.reduce((acc: number, s: any) => acc + s.matchedTransactions, 0);
                return totalTransactions > 0 ? `${Math.round((matchedTransactions / totalTransactions) * 100)}%` : "0%";
              })()}
            </div>
            <p className="text-xs text-muted-foreground">
              Overall match rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Account Balance Overview */}
      {selectedAccount && currentSession && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Statement Balance</CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(currentSession.statementBalance)}
              </div>
              <p className="text-xs text-muted-foreground">
                From bank statement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Book Balance</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(currentSession.bookBalance)}
              </div>
              <p className="text-xs text-muted-foreground">
                From accounting records
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Difference</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold",
                Math.abs(Number(currentSession.difference || 0)) < 0.01 ? "text-green-600" : "text-red-600"
              )}>
                {formatCurrency(currentSession.difference)}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.abs(Number(currentSession.difference || 0)) < 0.01 ? "Reconciled" : "Needs adjustment"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Reconciliation Session */}
      {currentSession && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>Reconciliation Session: {currentSession.name}</span>
            </CardTitle>
            <CardDescription>
              Period: {new Date(currentSession.startDate).toLocaleDateString()} - {new Date(currentSession.endDate).toLocaleDateString()}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="matches" className="w-full">
              <TabsList>
                <TabsTrigger value="matches">
                  Matches ({currentSessionMatches?.filter((m: any) => m.status === "matched").length || 0})
                </TabsTrigger>
                <TabsTrigger value="unmatched">
                  Unmatched ({currentSessionMatches?.filter((m: any) => m.status === "unmatched").length || 0})
                </TabsTrigger>
                <TabsTrigger value="disputed">
                  Disputed ({currentSessionMatches?.filter((m: any) => m.status === "disputed").length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="matches" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">High Confidence</span>
                      <Badge variant="secondary">
                        {currentSessionMatches?.filter((m: any) => m.confidence === "high").length || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Medium Confidence</span>
                      <Badge variant="secondary">
                        {currentSessionMatches?.filter((m: any) => m.confidence === "medium").length || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium">Low Confidence</span>
                      <Badge variant="secondary">
                        {currentSessionMatches?.filter((m: any) => m.confidence === "low").length || 0}
                      </Badge>
                    </div>
                  </div>

                  <Button onClick={handleStartMatching} disabled={startMatchingMutation.isPending}>
                    <Zap className="h-4 w-4 mr-2" />
                    {startMatchingMutation.isPending ? 'Finding Matches...' : 'Find Matches'}
                  </Button>
                </div>

                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Statement</TableHead>
                        <TableHead>Book</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentSessionMatches
                        ?.filter((match: any) => filterStatus === 'all' || match.status === filterStatus)
                        .slice(0, 10)
                        .map((match: any) => (
                          <MatchRow
                            key={match.id}
                            match={match}
                            onViewDetails={() => setShowMatchDetails(match.id)}
                          />
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="unmatched">
                <UnmatchedTransactions
                  matches={currentSessionMatches?.filter((m: any) => m.status === "unmatched") || []}
                />
              </TabsContent>

              <TabsContent value="disputed">
                <DisputedTransactions
                  matches={currentSessionMatches?.filter((m: any) => m.status === "disputed") || []}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Session Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Reconciliation Sessions</CardTitle>
          <CardDescription>
            Select a session to view details and manage reconciliation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sessions?.map((session: any) => (
              <div
                key={session.id}
                className={cn(
                  "flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50",
                  selectedSession === session.id && "border-primary bg-primary/5"
                )}
                onClick={() => setSelectedSession(session.id)}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{session.name}</h3>
                    <Badge className={getStatusColor(session.status)}>
                      {session.status}
                    </Badge>
                    {session.aiConfidence && (
                      <Badge variant="outline" className={getConfidenceColor(session.aiConfidence)}>
                        <Brain className="h-3 w-3 mr-1" />
                        {Math.round(session.aiConfidence)}%
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{new Date(session.startDate).toLocaleDateString()} - {new Date(session.endDate).toLocaleDateString()}</span>
                    <span>{session.matchedTransactions} matched</span>
                    <span>{session.unmatchedTransactions} unmatched</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {(!sessions || sessions.length === 0) && (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Sessions Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first reconciliation session to get started.
                </p>
                {selectedAccount && (
                  <Button onClick={() => setShowCreateSession(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Session
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Session Dialog */}
      <Dialog open={showCreateSession} onOpenChange={setShowCreateSession}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Reconciliation Session</DialogTitle>
            <DialogDescription>
              Set up a new reconciliation session for the selected account
            </DialogDescription>
          </DialogHeader>

          <SessionForm
            accountId={selectedAccount}
            onSubmit={handleCreateSession}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateSession(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {}}
              disabled={createSessionMutation.isPending}
            >
              {createSessionMutation.isPending ? 'Creating...' : 'Create Session'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Match Details Dialog */}
      <Dialog open={!!showMatchDetails} onOpenChange={() => setShowMatchDetails(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Match Details</DialogTitle>
            <DialogDescription>
              Review and confirm this reconciliation match
            </DialogDescription>
          </DialogHeader>

          {showMatchDetails && currentSessionMatches && (
            <MatchDetails
              match={currentSessionMatches.find((m: any) => m.id === showMatchDetails)!}
              onApprove={() => setShowMatchDetails(null)}
              onDispute={() => setShowMatchDetails(null)}
            />
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMatchDetails(null)}>
              Cancel
            </Button>
            <Button>Confirm Match</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Match row component
interface MatchRowProps {
  match: ReconciliationMatch;
  onViewDetails: () => void;
}

function MatchRow({ match, onViewDetails }: MatchRowProps) {
  const formatCurrency = (amount: string | number | undefined) => {
    if (!amount) return "$0.00";
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numAmount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return 'bg-green-100 text-green-800';
      case "in_progress":
        return 'bg-blue-100 text-blue-800';
      case "pending":
        return 'bg-yellow-100 text-yellow-800';
      case "rejected":
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <TableRow className="cursor-pointer hover:bg-muted/50" onClick={onViewDetails}>
      <TableCell>
        {match.statementDate ? new Date(match.statementDate).toLocaleDateString() : 'N/A'}
      </TableCell>
      <TableCell className="max-w-xs truncate">
        {match.statementDescription || match.matchReason}
      </TableCell>
      <TableCell className="font-mono">
        {formatCurrency(match.statementAmount)}
      </TableCell>
      <TableCell className="font-mono">
        {formatCurrency(match.bookAmount)}
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <span className={cn(
            "font-medium",
            match.confidenceScore && match.confidenceScore >= 80 ? "text-green-600" :
            match.confidenceScore && match.confidenceScore >= 60 ? "text-yellow-600" : "text-red-600"
          )}>
            {match.confidenceScore ? Math.round(match.confidenceScore) : 0}%
          </span>
          <Badge variant="outline" className="text-xs">
            {match.confidence}
          </Badge>
        </div>
      </TableCell>
      <TableCell>
        <Badge className={getStatusColor(match.status)}>
          {match.status}
        </Badge>
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

// Unmatched transactions component
interface UnmatchedTransactionsProps {
  matches: ReconciliationMatch[];
}

function UnmatchedTransactions({ matches }: UnmatchedTransactionsProps) {
  const formatCurrency = (amount: string | number | undefined) => {
    if (!amount) return "$0.00";
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numAmount);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <span className="font-medium">Unmatched Transactions</span>
          <Badge variant="secondary">{matches.length}</Badge>
        </div>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          These transactions couldn't be automatically matched. Review them manually or create adjusting entries.
        </AlertDescription>
      </Alert>

      <div className="grid gap-2">
        {matches.slice(0, 5).map(match => (
          <Card key={match.id} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium">{match.statementDescription || match.matchReason}</p>
                <p className="text-xs text-muted-foreground">
                  {match.statementAmount && formatCurrency(match.statementAmount)} - {match.statementDate ? new Date(match.statementDate).toLocaleDateString() : 'No date'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Disputed transactions component
interface DisputedTransactionsProps {
  matches: ReconciliationMatch[];
}

function DisputedTransactions({ matches }: DisputedTransactionsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <X className="h-5 w-5 text-red-600" />
        <span className="font-medium">Disputed Matches</span>
        <Badge variant="destructive">{matches.length}</Badge>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          These matches have been disputed and need review by an accountant or administrator.
        </AlertDescription>
      </Alert>

      <div className="grid gap-2">
        {matches.map(match => (
          <Card key={match.id} className="p-3 border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium">{match.statementDescription || match.matchReason}</p>
                <p className="text-xs text-muted-foreground">
                  Disputed match - needs review
                </p>
              </div>
              <Button variant="outline" size="sm">
                Review
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Match details component
interface MatchDetailsProps {
  match: ReconciliationMatch;
  onApprove: () => void;
  onDispute: () => void;
}

function MatchDetails({ match, onApprove, onDispute }: MatchDetailsProps) {
  const formatCurrency = (amount: string | number | undefined) => {
    if (!amount) return "$0.00";
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numAmount);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium mb-2">Statement Transaction</h4>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Amount:</span> {formatCurrency(match.statementAmount)}</p>
            <p><span className="font-medium">Description:</span> {match.statementDescription}</p>
            <p><span className="font-medium">Date:</span> {match.statementDate ? new Date(match.statementDate).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Book Transaction</h4>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Amount:</span> {formatCurrency(match.bookAmount)}</p>
            <p><span className="font-medium">Description:</span> {match.bookDescription}</p>
            <p><span className="font-medium">Date:</span> {match.bookDate ? new Date(match.bookDate).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Confidence:</span>
          <span className={cn(
            "font-bold",
            match.confidenceScore && match.confidenceScore >= 80 ? "text-green-600" :
            match.confidenceScore && match.confidenceScore >= 60 ? "text-yellow-600" : "text-red-600"
          )}>
            {match.confidenceScore ? Math.round(match.confidenceScore) : 0}%
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Match Type:</span>
          <Badge variant="outline">{match.confidence}</Badge>
        </div>
      </div>

      {match.matchCriteria && match.matchCriteria.length > 0 && (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Match Criteria:</span>
          <div className="flex gap-1">
            {match.matchCriteria.map((criteria, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {criteria}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {match.matchReason && (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">AI Reasoning:</span>
          <p className="text-sm text-muted-foreground">{match.matchReason}</p>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onDispute}>
          Dispute
        </Button>
        <Button onClick={onApprove}>
          Approve Match
        </Button>
      </div>
    </div>
  );
}

// Session form component
interface SessionFormProps {
  accountId: string;
  onSubmit: (data: any) => void;
}

function SessionForm({ accountId, onSubmit }: SessionFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'bank_statement',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    statementBalance: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="session-name" className="text-sm font-medium">Session Name</label>
          <input
            id="session-name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
            placeholder="Monthly Reconciliation - Jan 2025"
            required
          />
        </div>

        <div>
          <label htmlFor="session-type" className="text-sm font-medium">Type</label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger className="w-full mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bank_statement">Bank Statement</SelectItem>
              <SelectItem value="credit_card">Credit Card</SelectItem>
              <SelectItem value="investment_account">Investment Account</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label htmlFor="session-description" className="text-sm font-medium">Description</label>
        <input
          id="session-description"
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
          placeholder="Optional description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="start-date" className="text-sm font-medium">Start Date</label>
          <input
            id="start-date"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="end-date" className="text-sm font-medium">End Date</label>
          <input
            id="end-date"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="statement-balance" className="text-sm font-medium">Statement Balance</label>
        <input
          id="statement-balance"
          type="number"
          step="0.01"
          value={formData.statementBalance}
          onChange={(e) => setFormData({ ...formData, statementBalance: e.target.value })}
          className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
          placeholder="0.00"
        />
      </div>
    </form>
  );
}
