import { TrendingUp, TrendingUp, TrendingDown, TrendingDown, PiggyBank, CheckCircle, XCircle, MessageCircle } from "lucide-react";
export interface FinancialInsight {
  id: string;
  type: 'cash_flow' | 'revenue' | 'expense' | 'profitability' | 'risk' | 'opportunity';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number; // 0-100
  actionable: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  metrics: {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
  };
  recommendations: string[];
  timeframe: string;
  createdAt: Date;
}

export interface PredictiveModel {
  id: string;
  type: 'cash_flow' | 'revenue' | 'expense' | 'profitability';
  timeframe: '3_months' | '6_months' | '12_months';
  confidence: number;
  predictions: {
    date: string;
    value: number;
    confidence: number;
  }[];
  factors: {
    name: string;
    impact: number;
    description: string;
  }[];
  accuracy?: number;
  lastUpdated: Date;
}

export interface FinancialHealthScore {
  overall: number; // 0-100
  cashFlow: number;
  revenue: number;
  expenses: number;
  profitability: number;
  debt: number;
  budget: number;
  trend: 'improving' | 'stable' | 'declining';
  riskLevel: 'low' | 'medium' | 'high';
  lastCalculated: Date;
  breakdown: {
    factor: string;
    score: number;
    weight: number;
    impact: 'positive' | 'negative' | 'neutral';
  }[];
}

export interface AIRecommendation {
  id: string;
  type: 'critical' | 'optimization' | 'growth' | 'risk_mitigation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  timeframe: string;
  potentialSavings?: number;
  potentialRevenue?: number;
  confidence: number;
  actionable: boolean;
  steps: {
    step: number;
    action: string;
    description: string;
    estimatedTime: string;
  }[];
  relatedMetrics: string[];
  createdAt: Date;
}

export interface FinancialAnalysis {
  id: string;
  userId: string;
  analysisType: 'comprehensive' | 'cash_flow' | 'revenue' | 'expense' | 'profitability';
  timeframe: {
    start: Date;
    end: Date;
  };
  insights: FinancialInsight[];
  predictions: PredictiveModel[];
  healthScore: FinancialHealthScore;
  recommendations: AIRecommendation[];
  summary: {
    keyFindings: string[];
    criticalIssues: string[];
    opportunities: string[];
    nextSteps: string[];
  };
  generatedAt: Date;
}

export interface AIAnalysisRequest {
  type: 'comprehensive' | 'cash_flow' | 'revenue' | 'expense' | 'profitability';
  timeframe?: {
    start: Date;
    end: Date;
  };
  focusAreas?: string[];
  includePredictions?: boolean;
  includeRecommendations?: boolean;
}

export interface AIAnalysisResponse {
  success: boolean;
  data?: FinancialAnalysis;
  error?: string;
  processingTime?: number;
}

export interface CashFlowPrediction {
  timeframe: '3_months' | '6_months' | '12_months';
  predictions: {
    date: string;
    inflow: number;
    outflow: number;
    netFlow: number;
    cumulativeBalance: number;
    confidence: number;
  }[];
  factors: {
    name: string;
    impact: number;
    description: string;
  }[];
  riskFactors: string[];
  opportunities: string[];
  confidence: number;
}

export interface RevenuePrediction {
  timeframe: '3_months' | '6_months' | '12_months';
  predictions: {
    date: string;
    revenue: number;
    confidence: number;
  }[];
  growthRate: number;
  seasonality: {
    month: string;
    factor: number;
  }[];
  factors: {
    name: string;
    impact: number;
    description: string;
  }[];
  confidence: number;
}

export interface ExpensePrediction {
  timeframe: '3_months' | '6_months' | '12_months';
  predictions: {
    date: string;
    totalExpenses: number;
    fixedExpenses: number;
    variableExpenses: number;
    confidence: number;
  }[];
  categories: {
    category: string;
    amount: number;
    trend: 'increasing' | 'stable' | 'decreasing';
  }[];
  factors: {
    name: string;
    impact: number;
    description: string;
  }[];
  confidence: number;
}

export interface ProfitabilityPrediction {
  timeframe: '3_months' | '6_months' | '12_months';
  predictions: {
    date: string;
    revenue: number;
    expenses: number;
    profit: number;
    margin: number;
    confidence: number;
  }[];
  marginTrend: 'improving' | 'stable' | 'declining';
  factors: {
    name: string;
    impact: number;
    description: string;
  }[];
  confidence: number;
}

export interface AIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

export interface AIUsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  tokensUsed: number;
  cost: number;
  lastUpdated: Date;
}
