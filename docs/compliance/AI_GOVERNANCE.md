# AI Governance Compliance

## Overview

AI governance ensures responsible AI usage by tracking model decisions, detecting bias, and providing explainability for AI/ML model outputs.

## Features

### 1. Decision Logging
- Automatically log all AI model decisions
- Track input data, output data, and context
- Record processing time, token usage, and costs
- Identify GDPR-relevant decisions

### 2. Bias Detection
- Perform bias checks on model decisions
- Support multiple bias detection methods:
  - Statistical parity
  - Equalized odds
  - Demographic parity
  - Custom checks
- Track fairness scores

### 3. Explainability
- Generate explainability reports for decisions
- Track feature importance
- Provide human-readable explanations

### 4. Performance Tracking
- Monitor model performance metrics
- Track decision confidence scores
- Analyze token usage and costs

## API Endpoints

### Decisions
- `POST /api/compliance/ai-governance/decisions` - Log AI decision
- `GET /api/compliance/ai-governance/decisions` - Query decision logs
- `GET /api/compliance/ai-governance/decisions/[id]` - Get decision with explainability

### Bias Checks
- `POST /api/compliance/ai-governance/bias-checks` - Run bias detection
- `GET /api/compliance/ai-governance/bias-checks` - List bias checks
- `GET /api/compliance/ai-governance/bias-checks/[id]` - Get bias check details

## Usage

### Automatic Logging

AI decisions are automatically logged when using the `withAIDecisionLogging` wrapper:

```typescript
import { withAIDecisionLogging } from '@/lib/middleware/ai-decision-logger';

const result = await withAIDecisionLogging(
  orgId,
  userId,
  'financial-analysis-model',
  requestBody,
  async () => {
    // Your AI model call
    return await aiModel.analyze(data);
  },
  {
    useCase: 'financial_analysis',
    decisionType: 'financial_analysis',
  }
);
```

### Manual Logging

```typescript
import { AIGovernanceService } from '@/lib/services/ai-governance-service';

const decision = await AIGovernanceService.logModelDecision(orgId, {
  modelName: 'gpt-4',
  modelProvider: 'openai',
  decisionType: 'financial_analysis',
  decisionDescription: 'Analyzed quarterly financial data',
  inputData: { revenue: 100000, expenses: 50000 },
  outputData: { insights: ['Revenue increased 10%'] },
  decisionConfidence: 85,
  useCase: 'financial_analysis',
});
```

### Bias Detection

```typescript
const biasCheck = await AIGovernanceService.detectBias(orgId, {
  modelDecisionId: decision.id,
  checkType: 'statistical_parity',
  protectedAttributes: ['gender', 'age'],
  testDataset: testData,
});
```

### Explainability Reports

```typescript
const explainability = await AIGovernanceService.generateExplainabilityReport(decisionId);
```

## Compliance Reporting

Generate AI governance compliance reports:

```typescript
import { ComplianceService } from '@/lib/services/compliance-service';

const report = await ComplianceService.generateAIGovernanceReport(orgId, userId, {
  dateFrom: new Date('2025-01-01'),
  dateTo: new Date('2025-12-31'),
  modelName: 'gpt-4', // optional
});
```

## Monitoring

Track AI governance compliance:

```typescript
import { ComplianceMonitoringService } from '@/lib/services/compliance-monitoring-service';

const alerts = await ComplianceMonitoringService.monitorAIGovernance(orgId);
const audit = await AIGovernanceService.auditModelUsage(orgId);
const performance = await AIGovernanceService.trackModelPerformance(orgId);
```

## Best Practices

1. **Always log decisions**: Use the automatic logging wrapper for all AI model calls
2. **Regular bias checks**: Perform bias detection on high-risk decisions
3. **Monitor coverage**: Ensure bias check coverage is above 50%
4. **Review explainability**: Provide explanations for critical decisions
5. **Track performance**: Monitor model performance and costs regularly

