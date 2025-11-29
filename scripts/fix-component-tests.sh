#!/bin/bash
# Script to batch-fix component tests by removing duplicate mocks and updating React Query usage
# This script applies the fixes established in the test fixes

echo "Fixing component tests..."

# Find all component test files with duplicate recharts mocks
find __tests__/components -name "*.test.tsx" -type f | while read file; do
  # Check if file has duplicate recharts mock
  if grep -q 'vi.mock.*recharts' "$file"; then
    echo "Fixing: $file"
    
    # Remove duplicate recharts mock (lines between // Mock recharts and closing }))
    # This is a simplified approach - manual review may be needed for complex cases
    sed -i.bak '/\/\/ Mock recharts/,/^})$/d' "$file"
    
    # Add comment about global mock
    if ! grep -q "recharts is mocked globally" "$file"; then
      # Find the first import line and add comment after it
      sed -i.bak '/^import.*from.*vitest/a\
// Note: recharts is mocked globally in __tests__/setup.ts\
// Note: @tanstack/react-query is mocked globally in __tests__/setup.ts
' "$file"
    fi
    
    # Clean up backup files
    rm -f "$file.bak"
  fi
done

echo "Component test fixes applied. Please review and test."

