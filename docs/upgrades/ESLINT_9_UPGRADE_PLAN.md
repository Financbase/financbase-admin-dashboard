# ESLint 9 Upgrade Plan

## Current Status
- **Current Version:** ESLint 8.57.1
- **Target Version:** ESLint 9.x
- **Reason:** Fix dependency vulnerability in `inflight@1.0.6` (Medium severity - Missing Release of Resource)

## Vulnerability Details
The `inflight` package has a resource leak vulnerability. Upgrading ESLint to 9.0.0 will resolve this by updating the dependency chain:
- `eslint@8.57.1` → `babel-jest@29.7.0` → `@jest/transform@29.7.0` → `babel-plugin-istanbul@6.1.1` → `test-exclude@6.0.0` → `glob@7.2.3` → `inflight@1.0.6` ❌
- `eslint@9.0.0` → (updated dependency chain) ✅

## Breaking Changes in ESLint 9

### 1. Flat Config (New Configuration Format)
ESLint 9 uses a new "flat config" format instead of the legacy `.eslintrc` files.

**Current Format (`.eslintrc.json` or `eslint.config.js` with legacy format):**
```json
{
  "extends": ["next/core-web-vitals", "prettier"],
  "rules": { ... }
}
```

**New Flat Config Format (`eslint.config.js` or `eslint.config.mjs`):**
```javascript
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import nextPlugin from "eslint-config-next";
import prettier from "eslint-config-prettier";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default [
  js.configs.recommended,
  ...fixupConfigRules(compat.extends("next/core-web-vitals")),
  ...fixupConfigRules(compat.extends("prettier")),
  {
    rules: {
      // Your custom rules
    },
  },
];
```

### 2. Required Packages
- `@eslint/compat` - For compatibility with old configs
- `@eslint/eslintrc` - For FlatCompat utility
- `@eslint/js` - New JavaScript config

### 3. Removed Features
- **Legacy `.eslintrc.*` files** - No longer supported (need migration)
- **`eslint-plugin-node`** - Replaced with `@eslint/js` and native Node.js support
- **Some deprecated rules** - Check ESLint 9 migration guide

### 4. Configuration File Location
- Must be named `eslint.config.js` (or `.mjs` for ES modules)
- No longer looks for `.eslintrc.*` files

## Migration Steps

### Step 1: Install New Dependencies
```bash
pnpm add -D eslint@^9.0.0 @eslint/compat @eslint/eslintrc @eslint/js
```

### Step 2: Install Compatibility Tools
```bash
pnpm add -D @eslint/compat
```

### Step 3: Create Migration Script
Use ESLint's built-in migration tool:
```bash
npx @eslint/migrate-config eslint.config.js
```

Or manually convert:

1. **Identify Current Config:**
   - Check for `.eslintrc.json`, `.eslintrc.js`, or `eslintConfig` in `package.json`
   - Note all extends, plugins, and rules

2. **Create New `eslint.config.mjs`:**
   ```javascript
   import { FlatCompat } from "@eslint/eslintrc";
   import { dirname } from "path";
   import { fileURLToPath } from "url";
   
   const __filename = fileURLToPath(import.meta.url);
   const __dirname = dirname(__filename);
   
   const compat = new FlatCompat({
     baseDirectory: __dirname,
   });
   
   export default [
     ...compat.extends("next/core-web-vitals", "prettier"),
     {
       rules: {
         // Your custom rules here
       },
     },
   ];
   ```

### Step 4: Update Package.json Scripts
Ensure scripts use the correct config:
```json
{
  "scripts": {
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix"
  }
}
```

With flat config, the command is simpler:
```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

### Step 5: Update IDE/Editor Settings
- **VS Code:** Update ESLint extension settings
- **WebStorm/IntelliJ:** Should auto-detect, but verify settings
- **Vim/Neovim:** Update ESLint plugin configuration

### Step 6: Test Migration
```bash
# Run linter to check for issues
pnpm run lint

# Fix auto-fixable issues
pnpm run lint:fix

# Run tests to ensure nothing broke
pnpm test
```

## Potential Issues & Solutions

### Issue 1: Next.js ESLint Config Compatibility
**Problem:** `eslint-config-next` may not be fully compatible with flat config.

**Solution:** Use `@eslint/eslintrc` FlatCompat wrapper:
```javascript
import { FlatCompat } from "@eslint/eslintrc";
const compat = new FlatCompat({ baseDirectory: __dirname });
export default [...compat.extends("next/core-web-vitals")];
```

### Issue 2: TypeScript ESLint Parser
**Problem:** `@typescript-eslint/parser` might need updates.

**Solution:** Ensure versions are compatible:
```bash
pnpm add -D @typescript-eslint/eslint-plugin@^7.0.0 @typescript-eslint/parser@^7.0.0
```

### Issue 3: Prettier Integration
**Problem:** Prettier config might conflict.

**Solution:** Continue using `eslint-config-prettier` with FlatCompat:
```javascript
...compat.extends("prettier")
```

### Issue 4: Custom Rules/Plugins
**Problem:** Custom rules might need updates.

**Solution:** Test all custom rules and update as needed based on ESLint 9 API changes.

## Testing Checklist

- [ ] Linter runs without errors
- [ ] All existing rules still work
- [ ] Auto-fix works correctly
- [ ] IDE integration works
- [ ] CI/CD pipeline passes
- [ ] No false positives introduced
- [ ] Build process unchanged

## Rollback Plan

If issues arise:

1. **Revert package.json:**
   ```bash
   pnpm add -D eslint@^8.57.1
   ```

2. **Restore old config:**
   - Keep backup of `.eslintrc.json`
   - Restore if needed

3. **Remove new files:**
   ```bash
   rm eslint.config.mjs
   ```

## Timeline Recommendation

### Phase 1: Preparation (Week 1)
- [ ] Review breaking changes
- [ ] Audit current ESLint configuration
- [ ] Document all custom rules and plugins
- [ ] Create backup of current config

### Phase 2: Development Migration (Week 2)
- [ ] Create feature branch
- [ ] Install new dependencies
- [ ] Convert configuration file
- [ ] Test locally
- [ ] Fix any issues

### Phase 3: Testing (Week 2-3)
- [ ] Run full lint on codebase
- [ ] Fix all linting errors
- [ ] Test in CI/CD
- [ ] Verify IDE integration

### Phase 4: Deployment (Week 3)
- [ ] Merge to develop branch
- [ ] Deploy to staging
- [ ] Monitor for issues
- [ ] Deploy to production

## Alternative: Postpone Upgrade

If migration is too complex, consider:
1. **Accept Risk:** Medium severity, dev dependency only
2. **Mitigate:** Update Jest/Babel dependencies separately
3. **Monitor:** Watch for critical security updates

## Resources

- [ESLint 9.0.0 Release Notes](https://eslint.org/blog/2024/04/eslint-v9.0.0-released/)
- [Migration Guide](https://eslint.org/docs/latest/use/migrate-to-9.0.0)
- [Flat Config Documentation](https://eslint.org/docs/latest/use/configure/configuration-files-new)
- [FlatCompat API](https://eslint.org/docs/latest/use/configure/migration-guide#using-flatcompat)

## Decision Matrix

| Factor | Weight | ESLint 9 | ESLint 8 |
|--------|--------|----------|----------|
| Security Fix | High | ✅ Fixed | ❌ Vulnerable |
| Breaking Changes | Medium | ⚠️ Significant | ✅ None |
| Migration Effort | Medium | ⚠️ Moderate | ✅ None |
| Long-term Support | High | ✅ Better | ⚠️ EOL Soon |
| **Total Score** | | **Recommended** | **Acceptable** |

**Recommendation:** Proceed with upgrade in Q1 2025 with proper planning and testing.

