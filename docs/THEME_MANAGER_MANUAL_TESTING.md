# ThemeManager Manual Testing Guide

## Quick Access

### Test Pages

- **Main Test Page**: `/test` - Contains ThemeManager test component
- **Dedicated Theme Test Page**: `/test/theme` - Full theme testing interface

## Testing Steps

### 1. Test Theme Toggling

**Location**: Any page with theme toggle buttons (navbar, settings, test pages)

**Steps**:

1. Navigate to any page in the application
2. Look for the theme toggle button (moon/sun icon) in the navigation
3. Click the toggle button
4. **Expected**: Theme switches immediately between light and dark
5. **Verify**:
   - Page background changes
   - Text colors adjust
   - All UI elements update correctly
   - No console errors

**Alternative Test Locations**:

- `/test` - Has theme toggle and test component
- `/test/theme` - Dedicated theme testing page
- `/settings/preferences` - Settings page with theme selector

### 2. Verify Theme Persistence

**Steps**:

1. Set theme to dark mode (or light mode)
2. Refresh the page (F5 or Cmd+R)
3. **Expected**: Theme persists after refresh
4. **Verify**:
   - Theme is still in the same mode
   - No flash of wrong theme
   - localStorage contains the theme value

**Check localStorage** (DevTools):

```javascript
// Open DevTools Console (F12)
localStorage.getItem('financbase-theme')
// Should return: 'light', 'dark', or 'system'
```

### 3. Test User Preferences Sync

**Steps**:

1. Navigate to `/settings/preferences`
2. Find the "Theme" dropdown in the Appearance section
3. Select a different theme (e.g., if current is "Light", select "Dark")
4. **Expected**:
   - Theme changes immediately in the UI
   - After ~1 second, preference is saved to database
5. **Verify**:
   - Refresh the page
   - Theme should match what was selected in settings
   - Check API call in Network tab: `PUT /api/settings/preferences`

**Test Different Options**:

- Light mode
- Dark mode
- System (if enabled)

### 4. Visual Test Component

**Location**: `/test` or `/test/theme`

**What to Test**:

#### Theme State Display

- ✅ Mode shows current theme (light/dark/system)
- ✅ Resolved shows actual theme (light/dark)
- ✅ Is Dark badge updates correctly
- ✅ Is System badge shows if using system theme

#### Theme Controls

- ✅ Light button switches to light theme
- ✅ Dark button switches to dark theme
- ✅ System button switches to system theme
- ✅ Toggle button toggles between light/dark
- ✅ ThemeToggle component works

#### Color Samples

- ✅ Primary color displays correctly
- ✅ Background color displays correctly
- ✅ Foreground color displays correctly
- ✅ Accent color displays correctly
- ✅ Destructive color displays correctly
- ✅ Colors update when switching themes

#### Chart Colors

- ✅ Chart 1-5 colors display correctly
- ✅ Colors are different from each other
- ✅ Colors update when switching themes

#### CSS Variables

- ✅ Total variable count is displayed
- ✅ Expandable list shows all variables
- ✅ Variables match globals.css values
- ✅ Variables update when switching themes

#### Status Indicators

- ✅ Loading state shows during theme changes
- ✅ Mounted state shows as "Yes" after load
- ✅ Error state displays if there's an issue

### 5. Test Theme Toggle Components

**Locations**:

- Navigation bar (top right)
- Settings page
- Test pages

**Components to Test**:

1. **Standard ThemeToggle** (`components/ui/theme-toggle.tsx`)
   - Moon icon in light mode
   - Sun icon in dark mode
   - Click toggles theme

2. **Sky ThemeToggle** (`components/core/ui/layout/theme-toggle.tsx`)
   - Animated sky toggle switch
   - Click toggles theme
   - Visual animation matches theme

### 6. Test Integration Points

#### CSS Variables Integration

1. Open DevTools (F12)
2. Go to Elements/Inspector tab
3. Select `<html>` element
4. Check computed styles
5. **Verify**: CSS variables from `globals.css` are applied
   - `--background`, `--foreground`, `--primary`, etc.
   - Variables change when theme changes
   - Dark mode variables are different from light mode

#### next-themes Integration

1. Check that `ThemeProvider` is in `app/providers.tsx`
2. Verify theme changes work across all pages
3. Check that theme persists across navigation

#### User Preferences API Integration

1. Open DevTools → Network tab
2. Change theme in settings
3. **Verify**:
   - API call to `/api/settings/preferences` with `PUT` method
   - Request body contains `{"theme": "dark"}` (or light/system)
   - Response is successful (200 status)
   - Theme updates immediately (optimistic update)

### 7. Test Edge Cases

#### System Theme Detection

1. Enable system theme support (if configured)
2. Change system theme preference (OS settings)
3. **Verify**: Theme updates automatically

#### Multiple Tabs

1. Open application in two browser tabs
2. Change theme in one tab
3. **Verify**: Other tab updates automatically (storage event)

#### Error Handling

1. Disable network (offline mode)
2. Try to change theme
3. **Verify**: Theme still changes locally
4. **Verify**: Error is shown but doesn't break functionality

#### Rapid Toggling

1. Click theme toggle rapidly multiple times
2. **Verify**: No errors occur
3. **Verify**: Theme settles on final state
4. **Verify**: Only one API call is made (debounced)

## Expected Results

### ✅ Success Indicators

- Theme switches instantly (no delay)
- No console errors
- Theme persists across page refreshes
- User preferences sync successfully
- Colors update correctly
- All theme toggle components work
- CSS variables are accessible
- Chart colors are available

### ❌ Issues to Report

- Theme doesn't change when clicking toggle
- Theme doesn't persist after refresh
- Console errors related to theme
- Colors don't update correctly
- API calls failing
- Theme toggle components not working
- CSS variables not accessible

## Browser Compatibility

Test in:

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (if applicable)

## Reporting Results

After testing, document:

1. ✅ Which features worked perfectly
2. ⚠️ Any issues found
3. 📝 Browser and version tested
4. 🔍 Console errors (if any)
5. 📊 Performance observations

## Quick Test Checklist

- [ ] Theme toggle works in navigation
- [ ] Theme persists after refresh
- [ ] Settings page theme selector works
- [ ] Test component displays correctly
- [ ] Color samples update with theme
- [ ] Chart colors accessible
- [ ] CSS variables load correctly
- [ ] No console errors
- [ ] User preferences sync works
- [ ] Multiple tabs sync correctly

## Next Steps After Testing

1. If all tests pass: ✅ Ready for production
2. If issues found: Document in GitHub issues or project tracking
3. If performance concerns: Profile and optimize
4. If missing features: Add to roadmap
