# Priority 4: Workflow & Automation Engine - Test Plan

**Date:** November 2024  
**Status:** Planning  
**Target Coverage:** 70%

## Overview

Build comprehensive test coverage for the workflow and automation engine, building on existing partial coverage.

## Files to Test

### 1. `lib/services/workflow-engine.ts`
**Current Status:** Partially tested  
**Key Functions:**
- `executeWorkflow` - Main workflow execution
- `testWorkflow` - Workflow testing/dry-run
- `executeSteps` - Step execution logic
- `executeStepsParallel` - Parallel step execution
- `executeStep` - Individual step execution
- `evaluateCondition` - Condition evaluation
- `interpolateVariables` - Variable interpolation
- `getWorkflow` - Retrieve workflow definition
- `createExecutionRecord` - Create execution tracking
- `updateExecutionRecord` - Update execution status
- `logWorkflowEvent` - Event logging

**Test Strategy:**
- ✅ Workflow execution flows (success, failure, partial)
- ✅ Step sequencing and dependencies
- ✅ Parallel vs sequential execution
- ✅ Condition evaluation (if/else logic)
- ✅ Variable interpolation
- ✅ Error handling and retries
- ✅ Timeout handling
- ✅ Workflow state management

### 2. `lib/services/workflow-service.ts`
**Current Status:** Not tested  
**Key Functions:**
- Workflow CRUD operations
- Workflow triggers management
- Workflow execution history
- Workflow statistics

**Test Strategy:**
- ✅ Create workflow
- ✅ Update workflow
- ✅ Delete workflow
- ✅ Get workflow by ID
- ✅ List workflows
- ✅ Manage triggers
- ✅ Execution history queries
- ✅ Workflow statistics

### 3. `components/workflows/**`
**Current Status:** 2.91% coverage  
**Test Strategy:**
- ✅ Component rendering
- ✅ User interactions
- ✅ Form submissions
- ✅ State management
- ✅ Error states

## Test Implementation Plan

### Phase 1: Workflow Engine Core (Day 1)
- [ ] `executeWorkflow` - Main execution flow
- [ ] `testWorkflow` - Dry-run testing
- [ ] `executeSteps` - Step sequencing
- [ ] `executeStep` - Individual step execution
- [ ] Error handling and retries

### Phase 2: Workflow Engine Advanced (Day 2)
- [ ] `executeStepsParallel` - Parallel execution
- [ ] `evaluateCondition` - Condition logic
- [ ] `interpolateVariables` - Variable substitution
- [ ] Timeout handling
- [ ] Workflow state management

### Phase 3: Workflow Service (Day 3)
- [ ] Workflow CRUD operations
- [ ] Trigger management
- [ ] Execution history
- [ ] Statistics and analytics

### Phase 4: Component Tests (Day 4)
- [ ] Workflow builder component
- [ ] Workflow list component
- [ ] Execution history component
- [ ] Form interactions

## Mock Strategy

### Dependencies to Mock
- `@/lib/db` - Database operations
- `@/lib/services/email-service` - Email sending
- `@/lib/services/webhook-service` - Webhook delivery
- `@/lib/services/business/financbase-gpt-service` - GPT integration
- `@/lib/services/notification-service` - Notifications

### Mock Patterns
- Use `createThenableQuery` for Drizzle ORM queries
- Mock async service calls with proper return values
- Test error scenarios with rejected promises
- Test retry logic with sequential mock calls

## Expected Coverage Increase

**Target:** +0.6% overall coverage

**Breakdown:**
- Workflow Engine: +0.3%
- Workflow Service: +0.2%
- Components: +0.1%

## Success Criteria

- [ ] All workflow execution paths tested
- [ ] Error handling comprehensively covered
- [ ] Retry logic tested
- [ ] Parallel execution tested
- [ ] Condition evaluation tested
- [ ] Variable interpolation tested
- [ ] Workflow CRUD operations tested
- [ ] Component interactions tested

## Notes

- Build on existing `__tests__/integration/workflow-execution.test.ts`
- Use `createThenableQuery` pattern for Drizzle mocks
- Test both success and failure scenarios
- Include edge cases (empty workflows, invalid steps, etc.)

---

**Next Steps:**
1. Review existing workflow-engine tests
2. Create workflow-service tests
3. Add component tests
4. Review coverage improvement

