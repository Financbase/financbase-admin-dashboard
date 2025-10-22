# ⚡ Quick Test Checklist - Start Here

**Testing Time**: ~15-20 minutes for quick verification  
**Full Testing**: ~2-3 hours for comprehensive testing

---

## 🚀 Get Started (2 minutes)

### 1. Open Your Browser

```
Navigate to: http://localhost:3000
```

### 2. Sign In

- Use your Clerk account
- Or create a new account

### 3. Check for Errors

- Open DevTools (F12)
- Check Console tab for red errors
- ✅ Should see no critical errors

---

## ⚡ 15-Minute Quick Test

### Test 1: Dashboard (1 min)

```
1. Go to http://localhost:3000/dashboard
2. ✅ Page loads without errors
3. ✅ See your name and user info
```

### Test 2: Financial Overview (2 min)

```
1. Go to http://localhost:3000/financial
2. ✅ Cash Flow Health card shows
3. ✅ Outstanding Invoices card shows
4. ✅ Three charts render (Revenue, Expenses, Cash Flow)
5. ✅ Try clicking different tabs
```

### Test 3: Invoices (3 min)

```
1. Go to http://localhost:3000/invoices
2. ✅ Stats cards show at top
3. ✅ Search bar works
4. ✅ Filter dropdowns work
5. ✅ Click "New Invoice" button
6. ✅ Invoice form loads
```

### Test 4: Expenses (3 min)

```
1. Go to http://localhost:3000/expenses
2. ✅ Stats cards show
3. ✅ Filter by Status works
4. ✅ Filter by Category works
5. ✅ See 9 default categories in dropdown
6. ✅ Click "..." on any expense
7. ✅ Menu shows Approve/Reject options
```

### Test 5: Reports ⭐ NEW (3 min)

```
1. Go to http://localhost:3000/reports
2. ✅ Page loads successfully
3. ✅ Click "Templates" button
4. ✅ See 5 report templates:
   - Profit & Loss Statement (Popular)
   - Cash Flow Statement (Popular)
   - Balance Sheet
   - Revenue by Customer (Popular)
   - Expense by Category (Popular)
5. ✅ Click on a template
6. ✅ Close template dialog
7. ✅ If any reports exist, try "Run" button
```

### Test 6: Financbase GPT (2 min)

```
1. Go to http://localhost:3000/gpt
2. ✅ Chat interface loads
3. ✅ Type: "Hello"
4. ✅ See streaming response
5. ✅ Click a quick action button
6. ✅ Try the floating widget on any page (bottom-right button)
```

### Test 7: Settings (1 min)

```
1. Go to http://localhost:3000/settings
2. ✅ Redirects to /settings/profile
3. ✅ See 9 tabs at top
4. ✅ Profile form shows your Clerk data
5. ✅ Click "Notifications" tab
6. ✅ Toggle switches work
```

---

## ✅ Quick Pass Criteria

If all of these work, you're good to go:

- [x] No console errors on any page
- [x] All 7 main pages load successfully
- [x] Navigation works between pages
- [x] Search and filters function
- [x] All 5 report templates visible
- [x] Financbase GPT responds to messages
- [x] Settings tabs all load

---

## 🔍 What to Look For

### Good Signs ✅

- Pages load in < 2 seconds
- No red errors in console
- Smooth transitions between pages
- Data loads correctly (even if empty)
- Buttons and links work
- Forms are responsive

### Red Flags ❌

- Page doesn't load (white screen)
- Console shows errors
- Buttons don't respond
- Forms don't submit
- Data doesn't update
- Navigation broken

---

## 🐛 Found an Issue?

### Quick Fixes

**Issue**: Page not loading

```bash
# Check if dev server is running
# You should see it in terminal

# If not, restart:
pnpm dev
```

**Issue**: Database error

```bash
# Check .env.local has:
DATABASE_URL=postgresql://...
```

**Issue**: Auth not working

```bash
# Check .env.local has:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

**Issue**: AI not responding

```bash
# Check .env.local has:
OPENAI_API_KEY=sk-...
```

---

## 📋 Test Results Template

Copy this and fill it out:

```
## My Test Results

**Date**: [Today's date]
**Browser**: [Chrome/Firefox/Safari/Edge]
**Time Spent**: [X minutes]

### Feature Status
- [ ] Dashboard: PASS / FAIL
- [ ] Financial Overview: PASS / FAIL
- [ ] Invoices: PASS / FAIL
- [ ] Expenses: PASS / FAIL
- [ ] Reports: PASS / FAIL
- [ ] Financbase GPT: PASS / FAIL
- [ ] Settings: PASS / FAIL

### Issues Found
1. [Describe issue if any]
2. [Describe issue if any]
3. [Describe issue if any]

### Overall Status
- [ ] ✅ All tests passed
- [ ] ⚠️ Minor issues found
- [ ] ❌ Major issues need fixing

### Notes
[Any additional observations]
```

---

## 🎯 Next Steps

**If everything passes**:

1. ✅ Mark all features as tested
2. ✅ Move to staging deployment
3. ✅ Share with team for feedback

**If issues found**:

1. ❌ Document the issues
2. 🔧 Fix critical issues first
3. 🔄 Re-test after fixes

**For detailed testing**:

- See `TIER2_TESTING_GUIDE.md` for comprehensive tests
- Test each feature thoroughly
- Test on multiple browsers
- Test on mobile devices

---

## 💡 Pro Tips

1. **Keep Console Open**: Catch errors immediately
2. **Test in Order**: Follow the list above
3. **Use Real Data**: Create sample invoices/expenses
4. **Check Mobile**: Use DevTools device emulation
5. **Time Yourself**: Quick test should take ~15 min

---

## 🎉 Success Indicators

You know it's working when:

✅ You can navigate to all 7 pages without errors  
✅ You can see the 5 report templates  
✅ You can chat with Financbase GPT  
✅ You can filter expenses by category  
✅ You can toggle notification preferences  
✅ Everything looks good and feels responsive  

---

**Start Testing Now!** → Open <http://localhost:3000> 🚀

For detailed testing, see: `TIER2_TESTING_GUIDE.md`
