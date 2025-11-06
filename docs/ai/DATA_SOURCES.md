# AI & GPT Service Data Sources

**Last Updated:** November 6, 2025  
**Service:** FinancbaseGPT & Proprietary AI Models

## Overview

This document outlines all data sources used by Financbase's AI and GPT services, including FinancbaseGPT (OpenAI platform) and proprietary AI models.

---

## 1. Internal Database Sources

### Primary Financial Data Tables

#### **Invoices Table** (`financbase_invoices`)

**Location:** `lib/db/schemas/invoices.ts`, `lib/db/schema/invoices.ts`

**Data Extracted:**

- Total revenue (sum of paid invoices)
- Outstanding invoices count
- Overdue invoices count
- Invoice status tracking
- Payment dates and amounts
- Monthly revenue growth calculations

**Usage in AI:**

- Revenue analysis and forecasting
- Cash flow predictions
- Invoice management recommendations
- Payment tracking insights

#### **Expenses Table** (`expenses`)

**Location:** `lib/db/schemas/expenses.ts`, `lib/db/schema/expenses.ts`

**Data Extracted:**

- Total expenses
- Expense categories and amounts
- Top expenses by category
- Expense percentages
- Tax-deductible expenses
- Recurring expense patterns

**Usage in AI:**

- Expense categorization
- Budget analysis
- Cost optimization recommendations
- Tax planning insights

#### **Transactions Table** (`transactions`)

**Location:** `lib/db/schemas/transactions.schema.ts`

**Data Extracted:**

- Recent transactions (last 10)
- Transaction amounts and categories
- Transaction dates and descriptions
- Payment methods
- Transaction types (income, expense, transfer, payment)

**Usage in AI:**

- Transaction pattern analysis
- Spending behavior insights
- Cash flow tracking
- Financial activity summaries

#### **Clients Table** (`financbase_clients`)

**Location:** `lib/db/schemas/clients.schema.ts`

**Data Extracted:**

- Client information
- Total invoiced amounts
- Total paid amounts
- Outstanding balances
- Payment terms

**Usage in AI:**

- Client relationship insights
- Payment behavior analysis
- Revenue source identification

### Additional Database Tables

#### **Income Table** (`income`)

- Income streams and sources
- Income patterns and trends

#### **Freelance Projects** (`freelance_projects`)

- Project-based revenue
- Project timelines and budgets

#### **Properties** (`properties`)

- Real estate financial data
- Property income and expenses

#### **Adboard Campaigns** (`adboard_campaigns`)

- Marketing campaign performance
- Advertising spend and ROI

---

## 2. External API Data Sources

### OpenAI API

**Location:** `lib/services/business/financbase-gpt-service.ts`

**Configuration:**

- API Key: `process.env.OPENAI_API_KEY`
- Model: `gpt-4-turbo-preview` (configurable)
- Base URL: `https://api.openai.com/v1`

**Usage:**

- FinancbaseGPT chat completions
- Financial analysis and insights
- Natural language processing
- Response generation

### Exchange Rate API

**Location:** `lib/services/integration/currency.service.ts`

**Configuration:**

- API Key: `process.env.EXCHANGE_RATE_API_KEY`
- Base URL: `process.env.EXCHANGE_RATE_API_URL` (default: exchangerate-api.com)

**Data:**

- Real-time currency exchange rates
- Historical rate data
- Multi-currency support

**Usage:**

- Currency conversion for international transactions
- Multi-currency financial analysis

### Multi-Provider AI Services

**Supported Providers:**

1. **OpenAI** - GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
2. **Anthropic** - Claude 3 Opus, Sonnet, Haiku
3. **Google AI** - Gemini Pro, Gemini Pro Vision
4. **xAI** - Grok-1
5. **OpenRouter** - Multi-provider routing

**Location:** `lib/services/ai/unified-ai-orchestrator.ts`, `lib/services/byok-service.ts`

**Configuration:**

- BYOK (Bring Your Own Key) support
- Provider-specific API keys
- Cost optimization and routing

---

## 3. User-Contributed Data

### User Financial Data

**Location:** `lib/services/business/financbase-gpt-service.ts` - `getFinancialContext()`

**Data Sources:**

- User invoices (user-specific)
- User expenses (user-specific)
- User transactions (user-specific)
- User clients and relationships
- User preferences and settings

**Privacy:**

- All data is user-scoped (`userId` filtering)
- No cross-user data sharing
- Encrypted storage for sensitive data

### User Feedback and Learning

**Location:** `lib/services/ai/unified-ai-orchestrator.ts`

**Data:**

- User feedback on AI categorizations
- User corrections to AI suggestions
- Learning patterns from user behavior
- Custom categorization rules

**Usage:**

- Improving AI accuracy
- Personalizing recommendations
- Adapting to user preferences

---

## 4. Proprietary AI Model Training Data Sources

### Industry Data

**Status:** Referenced in about page, implementation pending

**Planned Sources:**

- Industry benchmarks and standards
- Sector-specific financial patterns
- Industry best practices
- Market trends and analysis

### Scholarly Research Data

**Status:** Referenced in about page, implementation pending

**Planned Sources:**

- Academic financial research papers
- Economic studies and reports
- Financial theory and models
- Peer-reviewed research data

### Market Data

**Status:** Referenced in about page, implementation pending

**Planned Sources:**

- Stock market data
- Economic indicators
- Market trends and forecasts
- Industry performance metrics

### IRS & Regulatory Data

**Status:** Referenced in about page, implementation pending

**Planned Sources:**

- IRS tax regulations and guidelines
- Publicly available IRS data
- Regulatory compliance requirements
- Tax code updates and changes
- Other regulatory organization data (SEC, FINRA, etc.)

### Public Financial Data

**Status:** Referenced in about page, implementation pending

**Planned Sources:**

- Public company financial statements
- Government financial data
- Economic indicators
- Public financial reports

---

## 5. Real-Time Context Data

### Financial Context Structure

**Location:** `lib/services/business/types/financbase-gpt-types.ts`

**Data Included:**

```typescript
interface FinancialContext {
  userId: string;
  totalRevenue: number;
  totalExpenses: number;
  cashFlow: number;
  outstandingInvoices: number;
  overdueInvoices: number;
  monthlyGrowth: number;
  topExpenses: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  recentTransactions: Array<{
    id: string;
    amount: number;
    category: string;
    date: string;
    description: string;
  }>;
  budgetStatus: {
    totalBudget: number;
    spent: number;
    remaining: number;
    overBudgetCategories: string[];
  };
  performance: {
    profitMargin: number;
    burnRate: number;
    runway: number; // months
  };
}
```

### Conversation History

**Location:** `lib/services/business/financbase-gpt-service.ts`

**Data:**

- Last 10 messages in conversation
- User preferences and context
- Previous analysis results
- Session metadata

---

## 6. System Prompts and Knowledge Base

### System Prompts

**Location:** `lib/services/business/financbase-gpt-service.ts` - `buildSystemPrompt()`

**Content:**

- Financial expertise definitions
- Analysis capabilities
- Response formatting guidelines
- User context integration

### AI Prompts Library

**Location:** `lib/services/ai/ai-prompts.ts`

**Content:**

- Pre-defined prompts for different analysis types
- Categorization prompts
- Insight generation prompts
- Recommendation templates

---

## 7. Data Flow Architecture

### FinancbaseGPT Service Flow

1. **User Query** → `POST /api/ai/financbase-gpt`
2. **Get Financial Context** → Query database (invoices, expenses, transactions)
3. **Build System Prompt** → Include financial context
4. **Call OpenAI API** → Send prompt with context
5. **Parse Response** → Extract insights and recommendations
6. **Return Analysis** → Structured response with data

### Data Processing Pipeline

```
User Query
    ↓
Financial Context Retrieval (Database)
    ↓
System Prompt Building (Context + Knowledge)
    ↓
AI Provider API Call (OpenAI/Claude/Google)
    ↓
Response Parsing & Enhancement
    ↓
Structured Analysis Return
```

---

## 8. Data Privacy & Security

### Data Isolation

- All queries are user-scoped
- No cross-user data access
- User authentication required (Clerk)

### Data Encryption

- Sensitive data encrypted at rest
- API keys encrypted in database
- Secure API communication (HTTPS)

### Data Retention

- Conversation history stored per session
- User can clear history
- Compliance with data protection regulations

---

## 9. Future Data Sources (Planned)

### Latin Community Financial Data

**Status:** Planned for community-focused AI

**Planned Sources:**

- Latin business financial patterns
- Cultural financial practices
- Regional economic data
- Community-specific insights

### Underserved Community Data

**Status:** Planned for community-focused AI

**Planned Sources:**

- Financial patterns from underrepresented communities
- Accessibility-focused financial data
- Multilingual financial resources
- Community-specific best practices

---

## 10. Configuration & Environment Variables

### Required Environment Variables

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# FinancbaseGPT Service
FINANCBASE_GPT_SERVICE_URL=http://localhost:8001

# Exchange Rates
EXCHANGE_RATE_API_KEY=your_exchange_rate_api_key
EXCHANGE_RATE_API_URL=https://api.exchangerate-api.com

# Multi-Provider AI (Optional)
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_AI_API_KEY=your_google_ai_key
```

---

## 11. Key Files Reference

### Core Service Files

- `lib/services/business/financbase-gpt-service.ts` - Main FinancbaseGPT service
- `lib/services/ai/unified-ai-orchestrator.ts` - Multi-provider AI orchestrator
- `lib/services/ai/financial-ai-service.ts` - Financial-specific AI service
- `app/api/ai/financbase-gpt/route.ts` - API endpoint

### Type Definitions

- `lib/services/business/types/financbase-gpt-types.ts` - TypeScript types
- `lib/services/types/financbase-gpt-types.ts` - Additional types

### Database Schemas

- `lib/db/schemas/invoices.ts` - Invoice schema
- `lib/db/schemas/expenses.ts` - Expense schema
- `lib/db/schemas/transactions.schema.ts` - Transaction schema
- `lib/db/schemas/clients.schema.ts` - Client schema

---

## Summary

**Current Active Data Sources:**

1. ✅ Internal database (invoices, expenses, transactions, clients)
2. ✅ OpenAI API (for FinancbaseGPT)
3. ✅ User-contributed financial data
4. ✅ Exchange rate APIs
5. ✅ Multi-provider AI services (BYOK)

**Planned Data Sources:**

1. ⏳ Industry data
2. ⏳ Scholarly research data
3. ⏳ Market data
4. ⏳ IRS & regulatory data
5. ⏳ Latin community financial data
6. ⏳ Underserved community data

**Data Flow:**

- Real-time financial context from database
- Enhanced with AI provider knowledge
- Personalized with user history and preferences
- Returned as actionable insights and recommendations
