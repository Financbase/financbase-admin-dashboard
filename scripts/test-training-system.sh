#!/bin/bash
# Test script for training system functionality using psql

echo "🧪 Testing Training System Functionality..."
echo ""

PASSED=0
FAILED=0

# Test 1: Verify training programs exist
echo "Test 1: Verify training programs exist"
PROGRAM_COUNT=$(psql $DATABASE_URL -t -c "SELECT COUNT(*) FROM training_programs WHERE is_active = true;" 2>/dev/null | xargs)
if [ "$PROGRAM_COUNT" -ge 6 ]; then
    echo "  ✅ PASS: Found $PROGRAM_COUNT training programs"
    PASSED=$((PASSED + 1))
else
    echo "  ❌ FAIL: Expected at least 6 programs, found $PROGRAM_COUNT"
    FAILED=$((FAILED + 1))
fi

# Test 2: Verify learning paths exist
echo ""
echo "Test 2: Verify learning paths exist"
PATH_COUNT=$(psql $DATABASE_URL -t -c "SELECT COUNT(*) FROM learning_paths WHERE is_active = true;" 2>/dev/null | xargs)
if [ "$PATH_COUNT" -ge 3 ]; then
    echo "  ✅ PASS: Found $PATH_COUNT learning paths"
    PASSED=$((PASSED + 1))
else
    echo "  ❌ FAIL: Expected at least 3 learning paths, found $PATH_COUNT"
    FAILED=$((FAILED + 1))
fi

# Test 3: Verify enum types
echo ""
echo "Test 3: Verify enum types exist"
DIFFICULTY_ENUM=$(psql $DATABASE_URL -t -c "SELECT COUNT(*) FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'training_difficulty');" 2>/dev/null | xargs)
STATUS_ENUM=$(psql $DATABASE_URL -t -c "SELECT COUNT(*) FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'training_status');" 2>/dev/null | xargs)
if [ "$DIFFICULTY_ENUM" -eq 3 ] && [ "$STATUS_ENUM" -eq 3 ]; then
    echo "  ✅ PASS: Enum types are correct (difficulty: $DIFFICULTY_ENUM, status: $STATUS_ENUM)"
    PASSED=$((PASSED + 1))
else
    echo "  ❌ FAIL: Enum types incorrect (difficulty: $DIFFICULTY_ENUM, status: $STATUS_ENUM)"
    FAILED=$((FAILED + 1))
fi

# Test 4: Verify table structure
echo ""
echo "Test 4: Verify training_progress table structure"
COLUMN_COUNT=$(psql $DATABASE_URL -t -c "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'training_progress';" 2>/dev/null | xargs)
if [ "$COLUMN_COUNT" -ge 10 ]; then
    echo "  ✅ PASS: Table has $COLUMN_COUNT columns (expected at least 10)"
    PASSED=$((PASSED + 1))
else
    echo "  ❌ FAIL: Table has only $COLUMN_COUNT columns"
    FAILED=$((FAILED + 1))
fi

# Test 5: Verify foreign keys
echo ""
echo "Test 5: Verify foreign key constraints"
FK_COUNT=$(psql $DATABASE_URL -t -c "SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public' AND table_name IN ('training_progress', 'learning_path_progress');" 2>/dev/null | xargs)
if [ "$FK_COUNT" -ge 4 ]; then
    echo "  ✅ PASS: Found $FK_COUNT foreign key constraints"
    PASSED=$((PASSED + 1))
else
    echo "  ❌ FAIL: Expected at least 4 foreign keys, found $FK_COUNT"
    FAILED=$((FAILED + 1))
fi

# Test 6: Verify indexes
echo ""
echo "Test 6: Verify indexes exist"
INDEX_COUNT=$(psql $DATABASE_URL -t -c "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND tablename IN ('training_programs', 'training_progress', 'learning_paths', 'learning_path_progress');" 2>/dev/null | xargs)
if [ "$INDEX_COUNT" -ge 4 ]; then
    echo "  ✅ PASS: Found $INDEX_COUNT indexes"
    PASSED=$((PASSED + 1))
else
    echo "  ⚠️  WARN: Found $INDEX_COUNT indexes (expected at least 4)"
fi

# Test 7: Verify data integrity
echo ""
echo "Test 7: Verify data integrity"
INTEGRITY_CHECK=$(psql $DATABASE_URL -t -c "
SELECT COUNT(*) 
FROM learning_paths lp
WHERE is_active = true
AND EXISTS (
    SELECT 1 FROM jsonb_array_elements_text(lp.program_ids) AS pid
    WHERE NOT EXISTS (
        SELECT 1 FROM training_programs tp WHERE tp.id::text = pid
    )
);" 2>/dev/null | xargs)
if [ "$INTEGRITY_CHECK" -eq 0 ]; then
    echo "  ✅ PASS: All learning path program references are valid"
    PASSED=$((PASSED + 1))
else
    echo "  ❌ FAIL: Found $INTEGRITY_CHECK learning paths with invalid program references"
    FAILED=$((FAILED + 1))
fi

# Test 8: Verify program data structure
echo ""
echo "Test 8: Verify program data structure"
PROGRAM_STRUCT=$(psql $DATABASE_URL -t -c "
SELECT COUNT(*) 
FROM training_programs 
WHERE is_active = true 
AND title IS NOT NULL 
AND difficulty IS NOT NULL 
AND topics IS NOT NULL;" 2>/dev/null | xargs)
if [ "$PROGRAM_STRUCT" -eq "$PROGRAM_COUNT" ]; then
    echo "  ✅ PASS: All programs have required fields"
    PASSED=$((PASSED + 1))
else
    echo "  ❌ FAIL: Some programs missing required fields"
    FAILED=$((FAILED + 1))
fi

# Summary
echo ""
echo "=================================================="
echo "📊 Test Summary"
echo "=================================================="
echo "✅ Passed: $PASSED"
echo "❌ Failed: $FAILED"
TOTAL=$((PASSED + FAILED))
if [ "$TOTAL" -gt 0 ]; then
    SUCCESS_RATE=$(echo "scale=1; $PASSED * 100 / $TOTAL" | bc)
    echo "📈 Success Rate: ${SUCCESS_RATE}%"
fi

if [ "$FAILED" -gt 0 ]; then
    echo ""
    echo "❌ Some tests failed. Please review the errors above."
    exit 1
else
    echo ""
    echo "🎉 All tests passed! Training system is functional."
    exit 0
fi

