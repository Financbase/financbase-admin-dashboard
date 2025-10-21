import { TrendingUp, DollarSign, TrendingUp, TrendingDown, TrendingDown, PiggyBank, Banknote, CreditCard } from "lucide-react";
export const FINANCIAL_ANALYSIS_PROMPTS = {
  comprehensive: `You are a financial AI analyst. Analyze the provided financial data and generate comprehensive insights.

Financial Data:
- Income: {income}
- Expenses: {expenses}
- Projects: {projects}
- Properties: {properties}
- Campaigns: {campaigns}

Provide analysis in this JSON format:
{
  "insights": [
    {
      "type": "cash_flow|revenue|expense|profitability|risk|opportunity",
      "title": "Insight title",
      "description": "Detailed description",
      "impact": "high|medium|low",
      "confidence": 85,
      "actionable": true,
      "priority": "critical|high|medium|low",
      "category": "Category name",
      "metrics": {
        "current": 10000,
        "previous": 8000,
        "change": 2000,
        "changePercent": 25
      },
      "recommendations": ["Action 1", "Action 2"],
      "timeframe": "Next 30 days"
    }
  ],
  "predictions": [
    {
      "type": "cash_flow|revenue|expense|profitability",
      "timeframe": "3_months|6_months|12_months",
      "confidence": 80,
      "predictions": [
        {
          "date": "2024-02-01",
          "value": 12000,
          "confidence": 85
        }
      ],
      "factors": [
        {
          "name": "Seasonal trends",
          "impact": 0.3,
          "description": "Historical seasonal patterns"
        }
      ]
    }
  ],
  "healthScore": {
    "overall": 75,
    "cashFlow": 80,
    "revenue": 70,
    "expenses": 85,
    "profitability": 75,
    "debt": 90,
    "budget": 65,
    "trend": "improving|stable|declining",
    "riskLevel": "low|medium|high",
    "breakdown": [
      {
        "factor": "Cash Flow Stability",
        "score": 80,
        "weight": 0.3,
        "impact": "positive"
      }
    ]
  },
  "recommendations": [
    {
      "type": "critical|optimization|growth|risk_mitigation",
      "title": "Recommendation title",
      "description": "Detailed description",
      "impact": "high|medium|low",
      "effort": "low|medium|high",
      "timeframe": "Next 2 weeks",
      "potentialSavings": 5000,
      "potentialRevenue": 10000,
      "confidence": 85,
      "actionable": true,
      "steps": [
        {
          "step": 1,
          "action": "Review current expenses",
          "description": "Analyze all expense categories",
          "estimatedTime": "2 hours"
        }
      ],
      "relatedMetrics": ["expense_ratio", "profit_margin"]
    }
  ],
  "summary": {
    "keyFindings": ["Finding 1", "Finding 2"],
    "criticalIssues": ["Issue 1", "Issue 2"],
    "opportunities": ["Opportunity 1", "Opportunity 2"],
    "nextSteps": ["Step 1", "Step 2"]
  }
}`,

  cashFlow: `Analyze cash flow patterns and predict future cash flow.

Cash Flow Data:
- Historical inflows: {inflows}
- Historical outflows: {outflows}
- Current balance: {balance}
- Payment terms: {paymentTerms}

Provide cash flow analysis in this JSON format:
{
  "timeframe": "3_months|6_months|12_months",
  "predictions": [
    {
      "date": "2024-02-01",
      "inflow": 15000,
      "outflow": 12000,
      "netFlow": 3000,
      "cumulativeBalance": 25000,
      "confidence": 85
    }
  ],
  "factors": [
    {
      "name": "Seasonal revenue",
      "impact": 0.4,
      "description": "Q1 typically shows 20% higher revenue"
    }
  ],
  "riskFactors": ["Late payments from clients", "Unexpected expenses"],
  "opportunities": ["Early payment discounts", "Revenue optimization"],
  "confidence": 80
}`,

  revenue: `Analyze revenue trends and predict future revenue.

Revenue Data:
- Historical revenue: {revenue}
- Revenue sources: {sources}
- Growth rate: {growthRate}
- Seasonality: {seasonality}

Provide revenue analysis in this JSON format:
{
  "timeframe": "3_months|6_months|12_months",
  "predictions": [
    {
      "date": "2024-02-01",
      "revenue": 25000,
      "confidence": 85
    }
  ],
  "growthRate": 0.15,
  "seasonality": [
    {
      "month": "January",
      "factor": 1.2
    }
  ],
  "factors": [
    {
      "name": "Client acquisition",
      "impact": 0.6,
      "description": "New client onboarding rate"
    }
  ],
  "confidence": 80
}`,

  expense: `Analyze expense patterns and predict future expenses.

Expense Data:
- Historical expenses: {expenses}
- Expense categories: {categories}
- Fixed vs variable: {fixedVariable}
- Trends: {trends}

Provide expense analysis in this JSON format:
{
  "timeframe": "3_months|6_months|12_months",
  "predictions": [
    {
      "date": "2024-02-01",
      "totalExpenses": 18000,
      "fixedExpenses": 12000,
      "variableExpenses": 6000,
      "confidence": 85
    }
  ],
  "categories": [
    {
      "category": "Marketing",
      "amount": 5000,
      "trend": "increasing|stable|decreasing"
    }
  ],
  "factors": [
    {
      "name": "Inflation impact",
      "impact": 0.3,
      "description": "General inflation affecting all categories"
    }
  ],
  "confidence": 80
}`,

  profitability: `Analyze profitability trends and predict future profitability.

Profitability Data:
- Revenue: {revenue}
- Expenses: {expenses}
- Profit margins: {margins}
- Cost structure: {costStructure}

Provide profitability analysis in this JSON format:
{
  "timeframe": "3_months|6_months|12_months",
  "predictions": [
    {
      "date": "2024-02-01",
      "revenue": 25000,
      "expenses": 18000,
      "profit": 7000,
      "margin": 0.28,
      "confidence": 85
    }
  ],
  "marginTrend": "improving|stable|declining",
  "factors": [
    {
      "name": "Cost optimization",
      "impact": 0.4,
      "description": "Implemented cost reduction measures"
    }
  ],
  "confidence": 80
}`
};

export const RECOMMENDATION_PROMPTS = {
  budgetOptimization: `Based on the financial data, provide budget optimization recommendations.

Data:
- Current budget: {budget}
- Actual spending: {spending}
- Variance: {variance}
- Categories: {categories}

Focus on:
- Areas of overspending
- Cost reduction opportunities
- Budget reallocation suggestions
- Efficiency improvements`,

  expenseReduction: `Analyze expenses and provide reduction opportunities.

Expense Data:
- Total expenses: {total}
- Categories: {categories}
- Trends: {trends}
- Benchmarks: {benchmarks}

Identify:
- Unnecessary expenses
- Negotiation opportunities
- Process improvements
- Technology solutions`,

  revenueGrowth: `Analyze revenue and suggest growth strategies.

Revenue Data:
- Current revenue: {revenue}
- Sources: {sources}
- Growth rate: {growthRate}
- Market conditions: {market}

Suggest:
- New revenue streams
- Pricing optimization
- Market expansion
- Client retention strategies`,

  cashFlowImprovement: `Analyze cash flow and suggest improvements.

Cash Flow Data:
- Current flow: {flow}
- Payment terms: {terms}
- Collection issues: {issues}
- Seasonal patterns: {patterns}

Recommend:
- Payment term optimization
- Collection strategies
- Cash flow forecasting
- Emergency reserves`
};

export const HEALTH_SCORE_PROMPTS = {
  overall: `Calculate overall financial health score based on multiple factors.

Factors to consider:
- Cash flow stability (weight: 0.25)
- Revenue growth (weight: 0.20)
- Expense management (weight: 0.20)
- Profitability (weight: 0.15)
- Debt management (weight: 0.10)
- Budget adherence (weight: 0.10)

Score each factor 0-100 and calculate weighted average.

Provide:
- Overall score (0-100)
- Individual factor scores
- Trend analysis
- Risk assessment
- Improvement areas`,

  cashFlow: `Assess cash flow health based on:
- Flow consistency
- Reserve adequacy
- Payment timing
- Seasonal variations

Score: 0-100`,

  revenue: `Assess revenue health based on:
- Growth rate
- Revenue stability
- Source diversification
- Market position

Score: 0-100`,

  expenses: `Assess expense health based on:
- Expense control
- Category optimization
- Cost efficiency
- Budget adherence

Score: 0-100`,

  profitability: `Assess profitability health based on:
- Profit margins
- Cost structure
- Pricing strategy
- Cost control

Score: 0-100`,

  debt: `Assess debt health based on:
- Debt-to-income ratio
- Payment capacity
- Interest rates
- Debt structure

Score: 0-100`,

  budget: `Assess budget health based on:
- Budget accuracy
- Variance control
- Planning quality
- Execution discipline

Score: 0-100`
};

export const ANOMALY_DETECTION_PROMPTS = {
  expenseSpike: `Detect unusual expense patterns:
- Sudden increases
- Unusual categories
- Timing anomalies
- Amount outliers`,

  revenueDrop: `Detect revenue anomalies:
- Unexpected decreases
- Seasonal deviations
- Source changes
- Market impacts`,

  cashFlowIssues: `Detect cash flow problems:
- Negative trends
- Timing mismatches
- Collection issues
- Payment delays`,

  profitabilityChanges: `Detect profitability anomalies:
- Margin changes
- Cost spikes
- Revenue drops
- Structural shifts`
};
