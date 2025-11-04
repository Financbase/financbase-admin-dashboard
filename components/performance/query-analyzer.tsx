/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { 
  Database, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  RefreshCw,
  Play,
  Pause
} from 'lucide-react';

export function QueryAnalyzer() {
  const [selectedQuery, setSelectedQuery] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch slow queries
  const { data: slowQueries, isLoading: queriesLoading, refetch: refetchQueries } = useQuery({
    queryKey: ['slow-queries'],
    queryFn: async () => {
      const response = await fetch('/api/performance/slow-queries');
      return response.json();
    },
  });

  // Fetch query analysis
  const { data: queryAnalysis, isLoading: analysisLoading } = useQuery({
    queryKey: ['query-analysis', selectedQuery],
    queryFn: async () => {
      if (!selectedQuery) return null;
      const response = await fetch(`/api/performance/analyze-query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: selectedQuery }),
      });
      return response.json();
    },
    enabled: !!selectedQuery,
  });

  const getPerformanceColor = (executionTime: number) => {
    if (executionTime > 5000) return 'text-red-600 bg-red-50';
    if (executionTime > 1000) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getPerformanceIcon = (executionTime: number) => {
    if (executionTime > 5000) return <AlertTriangle className="h-4 w-4 text-red-600" />;
    if (executionTime > 1000) return <Clock className="h-4 w-4 text-yellow-600" />;
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  const formatQuery = (query: string) => {
    // Truncate long queries for display
    if (query.length > 100) {
      return query.substring(0, 100) + '...';
    }
    return query;
  };

  const handleAnalyzeQuery = (query: string) => {
    setSelectedQuery(query);
    setIsAnalyzing(true);
  };

  const handleStopAnalysis = () => {
    setSelectedQuery(null);
    setIsAnalyzing(false);
  };

  if (queriesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Slow Queries Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Slow Queries Analysis
          </CardTitle>
          <CardDescription>
            Identify and analyze slow-performing database queries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {slowQueries?.length || 0} slow queries detected
              </div>
              <Button variant="outline" onClick={() => refetchQueries()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Query</TableHead>
                  <TableHead>Execution Time</TableHead>
                  <TableHead>Rows</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slowQueries?.map((query: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="max-w-md">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {formatQuery(query.query)}
                        </code>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getPerformanceIcon(query.executionTime)}
                        <span className="font-mono">
                          {query.executionTime.toFixed(0)}ms
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono">{query.rowsReturned}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono">{query.cost.toFixed(2)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs', getPerformanceColor(query.executionTime))}>
                        {query.isSlow ? 'Slow' : 'Normal'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAnalyzeQuery(query.query)}
                        disabled={isAnalyzing}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Analyze
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Query Analysis Results */}
      {selectedQuery && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Query Analysis Results
            </CardTitle>
            <CardDescription>
              Detailed analysis of the selected query
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Analyzing query performance...
                </div>
                <Button variant="outline" onClick={handleStopAnalysis}>
                  <Pause className="h-4 w-4 mr-2" />
                  Stop Analysis
                </Button>
              </div>

              {analysisLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : queryAnalysis ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{queryAnalysis.executionTime}ms</div>
                      <div className="text-sm text-muted-foreground">Execution Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{queryAnalysis.rowsReturned}</div>
                      <div className="text-sm text-muted-foreground">Rows Returned</div>
                    </div>
                  </div>

                  {queryAnalysis.recommendations?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Optimization Recommendations</h4>
                      {queryAnalysis.recommendations.map((rec: string, index: number) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No analysis results available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Optimization Tips
          </CardTitle>
          <CardDescription>
            Best practices for database query optimization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <div className="text-sm">
                <strong>Use indexes:</strong> Create indexes on frequently queried columns
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <div className="text-sm">
                <strong>Avoid SELECT *:</strong> Only select the columns you need
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <div className="text-sm">
                <strong>Use LIMIT:</strong> Add LIMIT clauses to prevent large result sets
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <div className="text-sm">
                <strong>Optimize JOINs:</strong> Use appropriate JOIN types and conditions
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <div className="text-sm">
                <strong>Use EXPLAIN:</strong> Analyze query execution plans
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
