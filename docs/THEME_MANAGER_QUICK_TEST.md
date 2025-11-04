# ThemeManager Quick Browser Test

## 🚀 Quick Start (2 minutes)

### Step 1: Open Test Page

Navigate to: **<http://localhost:3000/test/theme>**

### Step 2: Test Theme Toggle

1. Look for the theme toggle buttons in the test component
2. Click "Toggle" or "Dark" button
3. **Expected**: Page immediately switches to dark theme
4. **Verify**: Background becomes dark, text becomes light

### Step 3: Test Persistence

1. Refresh the page (F5 or Cmd+R)
2. **Expected**: Theme stays dark (or whatever you set)
3. **Verify**: No flash of wrong theme

### Step 4: Test Settings Sync

1. Navigate to: **<http://localhost:3000/settings/preferences>**
2. Find "Theme" dropdown in Appearance section
3. Change theme (e.g., Dark → Light)
4. **Expected**: Theme changes immediately
5. Go back to test page - theme should match

### Step 5: Check Test Component

On `/test/theme` page, verify:

- ✅ Theme State shows correct mode
- ✅ Color samples display correctly
- ✅ Chart colors (1-5) show different colors
- ✅ CSS Variables section can be expanded
- ✅ No console errors (F12 → Console tab)

## 🎯 Visual Verification Checklist

### Theme Toggle in Navigation

- [ ] Theme toggle button visible in top navigation
- [ ] Click toggles theme instantly
- [ ] Icon changes (moon ↔ sun)
- [ ] No console errors

### Test Component (`/test/theme`)

- [ ] Theme state displays correctly
- [ ] All buttons work (Light/Dark/System/Toggle)
- [ ] Color samples show actual colors
- [ ] Chart colors display correctly
- [ ] CSS variables expandable list works
- [ ] Status indicators show correct states

### Theme Persistence

- [ ] Theme persists after page refresh
- [ ] Theme persists after navigation
- [ ] Theme persists after browser restart (if localStorage works)

### User Preferences Sync

- [ ] Settings page theme selector works
- [ ] Theme changes immediately when selected
- [ ] API call visible in Network tab (PUT /api/settings/preferences)
- [ ] Theme persists after refresh

## 🔍 What to Look For

### ✅ Success Indicators

- Theme switches instantly (no delay)
- Colors update correctly
- No console errors
- Theme persists across refreshes
- API calls succeed

### ❌ Issues to Report

- Theme doesn't change
- Console errors
- Colors don't update
- Theme doesn't persist
- API calls failing

## 📊 Expected Results

### Theme State

- **Mode**: light | dark | system
- **Resolved**: light | dark
- **Is Dark**: true | false
- **Is System**: true | false

### Color Samples

Should show actual color boxes for:

- Primary (main brand color)
- Background (page background)
- Foreground (text color)
- Accent (accent color)
- Destructive (error/danger color)

### Chart Colors

Should show 5 different colors for charts:

- Chart 1 (usually primary)
- Chart 2 (usually secondary/green)
- Chart 3 (usually yellow/orange)
- Chart 4 (usually purple)
- Chart 5 (usually red/orange)

## 🐛 Troubleshooting

### Theme Not Changing?

1. Check console for errors (F12)
2. Verify ThemeProvider is in `app/providers.tsx`
3. Check localStorage: `localStorage.getItem('financbase-theme')`

### Colors Not Showing?

1. Check if globals.css is loaded
2. Verify CSS variables in DevTools
3. Check console for CSS errors

### API Not Syncing?

1. Check Network tab in DevTools
2. Verify `/api/settings/preferences` endpoint works
3. Check authentication status

## ✅ Test Complete When

- [x] Theme toggle works in navigation
- [x] Theme toggle works in test component
- [x] Theme persists after refresh
- [x] Settings sync works
- [x] Colors display correctly
- [x] No console errors
- [x] All test component features work

## 📝 Quick Test URLs

- **Main Test**: <http://localhost:3000/test>
- **Theme Test**: <http://localhost:3000/test/theme>
- **Settings**: <http://localhost:3000/settings/preferences>
- **Dashboard**: <http://localhost:3000/dashboard> (has theme toggle in nav)

---

**Total Test Time**: ~5 minutes
**Expected Result**: All features working smoothly
