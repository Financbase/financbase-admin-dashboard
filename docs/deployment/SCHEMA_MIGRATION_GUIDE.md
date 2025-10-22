# 🔄 Schema Migration Guide

**Transaction Type Migration: credit/debit → income/expense/transfer/payment**

---

## 📋 Background

### Why This Migration Was Necessary

The original transaction system used `credit`/`debit` terminology, which is more accounting-focused and less intuitive for business users. The new system uses `income`/`expense`/`transfer`/`payment` which better aligns with:

- **Business Domain Model**: More intuitive for non-accounting users
- **User Experience**: Clearer transaction categorization
- **Financial Intelligence**: Better AI analysis and insights
- **Reporting**: More meaningful financial reports

### Impact Assessment

- **Database**: ENUM type change affects all transaction records
- **API**: Validation schemas updated
- **UI**: Display logic and icons updated
- **Services**: All financial calculations updated
- **Tests**: Test data generation updated

---

## 🔧 Changes Made

### 1. Database Migration

**File**: `drizzle/0001_thankful_cloak.sql`

```sql
-- OLD
CREATE TYPE "public"."transaction_type" AS ENUM('credit', 'debit');

-- NEW
CREATE TYPE "public"."transaction_type" AS ENUM('income', 'expense', 'transfer', 'payment');
```

**Additional Changes**:

- Made `description` column nullable
- Changed `category` column from ENUM to text type
- Updated table constraints

### 2. Service Layer Updates

**Files Updated**:

- `lib/services/analytics/analytics-service.ts`
- `lib/services/unified-dashboard-service.ts`
- `lib/services/ai/financial-intelligence-service.ts`

**Changes**:

```typescript
// OLD
sum(case when ${transactions.type} = 'credit' then ${transactions.amount}::numeric else 0 end)
sum(case when ${transactions.type} = 'debit' then ${transactions.amount}::numeric else 0 end)

// NEW
sum(case when ${transactions.type} = 'income' then ${transactions.amount}::numeric else 0 end)
sum(case when ${transactions.type} = 'expense' then ${transactions.amount}::numeric else 0 end)
```

### 3. UI Component Updates

**File**: `app/(dashboard)/unified/page.tsx`

**Changes**:

```typescript
// OLD
const getTransactionIcon = (type: string) => {
  return type === 'credit' ? (
    <TrendingUp className="h-4 w-4 text-green-600" />
  ) : (
    <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
  );
};

// NEW
const getTransactionIcon = (type: string) => {
  return type === 'income' ? (
    <TrendingUp className="h-4 w-4 text-green-600" />
  ) : (
    <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
  );
};
```

### 4. API Validation Updates

**File**: `app/api/transactions/[id]/route.ts`

```typescript
// OLD
type: z.enum(['credit', 'debit']).optional(),

// NEW
type: z.enum(['income', 'expense', 'transfer', 'payment']).optional(),
```

### 5. Test Data Updates

**File**: `__tests__/advanced-test-data.ts`

```typescript
// OLD
type: faker.helpers.arrayElement(['credit', 'debit']),

// NEW
type: faker.helpers.arrayElement(['income', 'expense', 'transfer', 'payment']),
```

---

## 🚀 Migration Steps

### Step 1: Backup Database

```bash
# Create database backup
pg_dump $DATABASE_URL > backup_before_migration.sql

# Verify backup
ls -la backup_before_migration.sql
```

### Step 2: Apply Schema Changes

```bash
# Generate new migration
pnpm db:generate

# Apply migration
pnpm db:push

# Verify schema
pnpm db:check
```

### Step 3: Update Existing Data

If you have existing transaction records, you'll need to update them:

```sql
-- Update existing credit transactions to income
UPDATE transactions 
SET type = 'income' 
WHERE type = 'credit';

-- Update existing debit transactions to expense
UPDATE transactions 
SET type = 'expense' 
WHERE type = 'debit';
```

### Step 4: Verify Changes

```bash
# Run tests
pnpm test

# Run E2E tests
pnpm e2e

# Check for any remaining old references
grep -r "credit\|debit" --include="*.ts" --include="*.tsx" lib/ app/
```

---

## ✅ Verification

### 1. Database Verification

```sql
-- Check transaction types
SELECT DISTINCT type FROM transactions;

-- Should return: income, expense, transfer, payment
```

### 2. API Verification

```bash
# Test transaction creation
curl -X POST /api/transactions \
  -H "Content-Type: application/json" \
  -d '{"type": "income", "amount": 1000, "description": "Test income"}'

# Should return 200 OK
```

### 3. UI Verification

1. Navigate to `/dashboard`
2. Check transaction icons display correctly
3. Verify amount colors (green for income, red for expense)
4. Test transaction creation form

### 4. Service Verification

```bash
# Test analytics service
curl /api/analytics/dashboard

# Should return correct cash flow calculations
```

---

## 🔄 Rollback Plan

### If Issues Are Discovered

1. **Stop Application**

   ```bash
   # Stop all running instances
   pkill -f "next"
   ```

2. **Restore Database**

   ```bash
   # Restore from backup
   psql $DATABASE_URL < backup_before_migration.sql
   ```

3. **Revert Code Changes**

   ```bash
   # Revert to previous commit
   git revert <commit-hash>
   ```

4. **Restart Application**

   ```bash
   pnpm dev
   ```

### Rollback Verification

```bash
# Verify old transaction types work
curl -X POST /api/transactions \
  -H "Content-Type: application/json" \
  -d '{"type": "credit", "amount": 1000}'

# Should work if rollback successful
```

---

## 📊 Data Migration Scripts

### For Existing Production Data

```sql
-- Create migration script for existing data
BEGIN;

-- Update transaction types
UPDATE transactions 
SET type = CASE 
  WHEN type = 'credit' THEN 'income'
  WHEN type = 'debit' THEN 'expense'
  ELSE type
END;

-- Update any related records
UPDATE invoice_payments 
SET transaction_type = CASE 
  WHEN transaction_type = 'credit' THEN 'income'
  WHEN transaction_type = 'debit' THEN 'expense'
  ELSE transaction_type
END;

COMMIT;
```

### Validation Queries

```sql
-- Check migration results
SELECT 
  type,
  COUNT(*) as count
FROM transactions 
GROUP BY type;

-- Should show: income, expense, transfer, payment
```

---

## 🚨 Important Notes

### 1. Breaking Changes

- **API**: All transaction type references must be updated
- **Database**: Existing data needs migration
- **UI**: All transaction displays need updates
- **Tests**: All test data needs updating

### 2. Performance Considerations

- **Index Updates**: May need to rebuild indexes
- **Query Performance**: Test all financial queries
- **Caching**: Clear any cached financial data

### 3. User Communication

- **Documentation**: Update all user guides
- **Training**: Inform users of new transaction types
- **Support**: Prepare for user questions

---

## 📞 Support

### If Issues Arise

1. **Check Logs**: Review application and database logs
2. **Verify Schema**: Run `pnpm db:check`
3. **Test Queries**: Verify all financial calculations
4. **Rollback**: Use rollback plan if necessary

### Contact Information

- **Technical Lead**: [Your Name]
- **Database Admin**: [Database Admin]
- **DevOps Team**: [DevOps Team]

---

**Migration Date**: December 2024  
**Version**: 2.0.0-beta  
**Status**: ✅ Complete
