# 🧪 Tier 2 Testing Guide

**Date**: October 21, 2025  
**Version**: 2.0.0-beta  
**Status**: Ready for Testing

---

## Quick Start

```bash
# 1. Start development server
pnpm dev

# 2. Open browser
# Navigate to http://localhost:3000

# 3. Sign in with Clerk
# Use your Clerk account or create one
```

---

## Testing Checklist

### ✅ Pre-Flight Checks

- [ ] **Development server running** (`pnpm dev`)
- [ ] **Database connected** (check `.env.local` for `DATABASE_URL`)
- [ ] **Clerk auth working** (check Clerk keys)
- [ ] **OpenAI key set** (for Financbase GPT)
- [ ] **No console errors** on page load

---

## Feature-by-Feature Testing

### 1. 🤖 Financbase GPT (AI Assistant)

**Pages to Test**:

- `/gpt` - Full-page interface
- Any page with floating widget (bottom-right)

**Test Cases**:

#### Test 1.1: Basic Chat

```
1. Navigate to /gpt
2. Type: "Hello, what can you help me with?"
3. ✅ Verify: Streaming response appears
4. ✅ Verify: Message history shows both user and AI messages
```

#### Test 1.2: Financial Context

```
1. Type: "Analyze my monthly expenses"
2. ✅ Verify: AI responds with financial context
3. ✅ Verify: Response mentions specific numbers or asks for data
```

#### Test 1.3: Quick Actions

```
1. Click "Analyze Expenses" button
2. ✅ Verify: Pre-fills input with suggested query
3. Try other quick action buttons
4. ✅ Verify: Each button works correctly
```

#### Test 1.4: Floating Widget

```
1. Navigate to /dashboard
2. Click floating chat button (bottom-right)
3. ✅ Verify: Chat panel opens
4. Send a message
5. ✅ Verify: Works same as full page
6. Click X to close
7. ✅ Verify: Panel closes
```

**Expected Results**:

- ✅ Messages stream in real-time
- ✅ No console errors
- ✅ Typing indicator shows during loading
- ✅ Auto-scrolls to latest message

---

### 2. 📊 Financial Overview Dashboard

**Page to Test**: `/financial`

**Test Cases**:

#### Test 2.1: Overview Tab

```
1. Navigate to /financial
2. ✅ Verify: "Overview" tab is active by default
3. ✅ Verify: Cash Flow Health card displays
4. ✅ Verify: Outstanding Invoices card displays
5. ✅ Verify: Revenue Chart renders
6. ✅ Verify: Expense Breakdown Chart renders
7. ✅ Verify: Cash Flow Chart renders
```

#### Test 2.2: Tab Navigation

```
1. Click "Invoices" tab
2. ✅ Verify: Tab content changes
3. Click "Expenses" tab
4. ✅ Verify: Tab content changes
5. Click "Cash Flow" tab
6. ✅ Verify: Tab content changes
7. Click back to "Overview"
8. ✅ Verify: Returns to overview
```

#### Test 2.3: Health Metrics

```
1. Check Cash Flow Health card
2. ✅ Verify: Shows percentage (0-100%)
3. ✅ Verify: Shows status badge (Healthy/Warning/Critical)
4. ✅ Verify: Progress bar displays correctly
```

#### Test 2.4: Outstanding Invoices

```
1. Check Outstanding Invoices card
2. ✅ Verify: Shows total count
3. ✅ Verify: Shows total amount
4. ✅ Verify: Shows overdue count (if any)
5. ✅ Verify: Shows overdue amount (if any)
```

**Expected Results**:

- ✅ All charts render without errors
- ✅ Data loads correctly (even if empty)
- ✅ Responsive on different screen sizes
- ✅ No console errors

---

### 3. 📄 Invoice Management

**Page to Test**: `/invoices`

**Test Cases**:

#### Test 3.1: Invoice List View

```
1. Navigate to /invoices
2. ✅ Verify: Page loads with title "Invoices"
3. ✅ Verify: Stats cards show (Total, Paid, Pending, Overdue)
4. ✅ Verify: Search bar is present
5. ✅ Verify: Filter dropdowns work
6. ✅ Verify: "New Invoice" button is visible
```

#### Test 3.2: Search Functionality

```
1. Type in search bar
2. ✅ Verify: List filters in real-time
3. Clear search
4. ✅ Verify: Full list returns
```

#### Test 3.3: Status Filter

```
1. Select "Draft" from status filter
2. ✅ Verify: Only draft invoices show
3. Select "Paid" from status filter
4. ✅ Verify: Only paid invoices show
5. Select "All Statuses"
6. ✅ Verify: All invoices return
```

#### Test 3.4: Create New Invoice (Navigation)

```
1. Click "New Invoice" button
2. ✅ Verify: Navigates to /invoices/new
3. ✅ Verify: Invoice form loads
```

#### Test 3.5: Invoice Actions

```
1. Find an invoice in the list
2. Click "..." menu button
3. ✅ Verify: Dropdown shows options:
   - View Details
   - Edit
   - Send
   - Record Payment
   - Download PDF
   - Delete
4. Try each action (be careful with Delete)
5. ✅ Verify: Each action works or shows appropriate message
```

#### Test 3.6: Pagination

```
1. If more than 10 invoices exist:
2. ✅ Verify: Pagination controls show
3. Click "Next"
4. ✅ Verify: Next page loads
5. Click "Previous"
6. ✅ Verify: Returns to first page
```

**Expected Results**:

- ✅ List loads without errors
- ✅ Empty state shows if no invoices
- ✅ All actions work as expected
- ✅ No console errors

---

### 4. 💰 Expense Tracking

**Page to Test**: `/expenses`

**Test Cases**:

#### Test 4.1: Expense List View

```
1. Navigate to /expenses
2. ✅ Verify: Page loads with title "Expenses"
3. ✅ Verify: Stats cards show:
   - Total Expenses
   - Pending Approval
   - Approved
   - Average Amount
4. ✅ Verify: Search bar is present
5. ✅ Verify: Filter dropdowns work (Status, Category)
6. ✅ Verify: "New Expense" button is visible
```

#### Test 4.2: Search and Filter

```
1. Type in search bar
2. ✅ Verify: Real-time filtering works
3. Select status filter (Pending/Approved/Rejected)
4. ✅ Verify: List updates correctly
5. Select category filter
6. ✅ Verify: List updates correctly
7. Combine filters
8. ✅ Verify: Multiple filters work together
```

#### Test 4.3: Expense Actions

```
1. Find a pending expense
2. Click "..." menu button
3. ✅ Verify: Shows options:
   - View Details
   - Edit
   - Approve (if pending)
   - Reject (if pending)
   - Delete
```

#### Test 4.4: Approve Expense

```
1. Click "Approve" on a pending expense
2. ✅ Verify: Shows confirmation
3. Confirm approval
4. ✅ Verify: Success message appears
5. ✅ Verify: Expense status changes to "Approved"
6. ✅ Verify: Stats update
```

#### Test 4.5: Reject Expense

```
1. Click "Reject" on a pending expense
2. ✅ Verify: Rejection dialog opens
3. Enter rejection reason
4. ✅ Verify: Reason field is required
5. Submit rejection
6. ✅ Verify: Success message appears
7. ✅ Verify: Expense status changes to "Rejected"
```

#### Test 4.6: Default Categories

```
1. Click "New Expense" (to see category dropdown)
2. ✅ Verify: 9 default categories exist:
   - Office Supplies
   - Travel
   - Meals & Entertainment
   - Software & Subscriptions
   - Marketing & Advertising
   - Professional Services
   - Utilities
   - Equipment
   - Other
3. ✅ Verify: Each category has a color badge
```

**Expected Results**:

- ✅ Approval workflow functions correctly
- ✅ Rejection requires reason
- ✅ Stats update in real-time
- ✅ All 9 categories available
- ✅ No console errors

---

### 5. 📈 Reports System ⭐ NEW

**Page to Test**: `/reports`

**Test Cases**:

#### Test 5.1: Reports List View

```
1. Navigate to /reports
2. ✅ Verify: Page loads with title "Reports"
3. ✅ Verify: Search bar present
4. ✅ Verify: Type filter dropdown present
5. ✅ Verify: "Templates" button visible
6. ✅ Verify: "New Report" button visible
```

#### Test 5.2: Report Templates

```
1. Click "Templates" button
2. ✅ Verify: Template gallery dialog opens
3. ✅ Verify: 5 default templates show:
   - Profit & Loss Statement (Popular)
   - Cash Flow Statement (Popular)
   - Balance Sheet
   - Revenue by Customer (Popular)
   - Expense by Category (Popular)
4. ✅ Verify: Popular badge shows on 4 templates
5. ✅ Verify: Each template has description
6. Click on a template
7. ✅ Verify: Can select template (or shows create option)
```

#### Test 5.3: Create Report from Template

```
1. In templates dialog, click on "Profit & Loss Statement"
2. ✅ Verify: Shows template details or creates report
3. If created, check reports list
4. ✅ Verify: New report appears in list
```

#### Test 5.4: Filter Reports by Type

```
1. Select "Profit & Loss" from type filter
2. ✅ Verify: Only P&L reports show
3. Select "Cash Flow" from type filter
4. ✅ Verify: Only cash flow reports show
5. Select "All Types"
6. ✅ Verify: All reports return
```

#### Test 5.5: Search Reports

```
1. Type in search bar
2. ✅ Verify: Filters by report name/description
3. Clear search
4. ✅ Verify: Full list returns
```

#### Test 5.6: Run a Report

```
1. Find any report in the list
2. Click "Run" button
3. ✅ Verify: Loading indicator shows
4. ✅ Verify: Success message appears
5. ✅ Verify: "Last Run" timestamp updates
```

#### Test 5.7: Toggle Favorites

```
1. Click "..." menu on any report
2. Select "Add to favorites"
3. ✅ Verify: Star icon appears next to report name
4. ✅ Verify: Success message or visual feedback
5. Click "..." menu again
6. Select "Remove from favorites"
7. ✅ Verify: Star icon disappears
```

#### Test 5.8: Report Actions Menu

```
1. Click "..." on any report
2. ✅ Verify: Menu shows options:
   - Edit
   - Add/Remove from favorites
   - Export
   - Delete
3. Try "Export" (may show placeholder)
4. ✅ Verify: Shows message or downloads
```

#### Test 5.9: Delete Report

```
1. Click "..." menu
2. Select "Delete"
3. ✅ Verify: Confirmation prompt (if implemented)
4. Confirm deletion
5. ✅ Verify: Report removed from list
6. ✅ Verify: Success message appears
```

#### Test 5.10: Empty State

```
1. If no reports exist (or delete all)
2. ✅ Verify: Empty state shows with:
   - Icon
   - Message: "No reports yet"
   - "Create your first report" button
```

**Expected Results**:

- ✅ All 5 templates load correctly
- ✅ Report creation works
- ✅ Run report functions without errors
- ✅ Favorites toggle works
- ✅ Delete removes report
- ✅ No console errors

---

### 6. 🔔 Notifications System

**Component**: Notification bell icon (top-right)

**Test Cases**:

#### Test 6.1: Notification Panel

```
1. Click bell icon in header
2. ✅ Verify: Notification panel opens
3. ✅ Verify: Shows recent notifications (if any)
4. ✅ Verify: Unread count badge displays correctly
```

#### Test 6.2: Mark as Read

```
1. Click on an unread notification
2. ✅ Verify: Notification marked as read
3. ✅ Verify: Unread count decreases
4. ✅ Verify: Visual styling changes
```

#### Test 6.3: Mark All as Read

```
1. If "Mark all as read" button exists
2. Click it
3. ✅ Verify: All notifications marked as read
4. ✅ Verify: Unread count goes to 0
```

#### Test 6.4: Notification Actions

```
1. Click on a notification with action URL
2. ✅ Verify: Navigates to correct page
```

**Expected Results**:

- ✅ Notifications load correctly
- ✅ Read/unread states work
- ✅ Badge count accurate
- ✅ No console errors

---

### 7. ⚙️ Settings System

**Page to Test**: `/settings`

**Test Cases**:

#### Test 7.1: Settings Navigation

```
1. Navigate to /settings
2. ✅ Verify: Redirects to /settings/profile
3. ✅ Verify: 9 tabs visible:
   - Profile
   - Security
   - Notifications
   - Billing
   - Team
   - Roles
   - Preferences
   - Privacy
   - Appearance
```

#### Test 7.2: Profile Settings

```
1. Click "Profile" tab
2. ✅ Verify: Profile form loads
3. ✅ Verify: Shows Clerk user data:
   - First name
   - Last name
   - Email
   - Avatar
4. ✅ Verify: Additional fields present:
   - Phone
   - Bio
   - Location
   - Website
   - Timezone
   - Language
5. Try editing a field
6. Click "Save" (if button exists)
7. ✅ Verify: Success message or update confirmation
```

#### Test 7.3: Notification Settings

```
1. Click "Notifications" tab
2. ✅ Verify: Shows notification preferences:
   - Email notifications (Invoices, Expenses, Reports, Alerts)
   - Push notifications (Real-time, Daily)
   - Slack integration (Enable, Webhook)
3. Toggle a switch
4. ✅ Verify: Setting updates
5. ✅ Verify: Success message appears
```

#### Test 7.4: Other Settings Tabs

```
1. Click each remaining tab:
   - Security
   - Billing
   - Team
   - Roles
   - Preferences
   - Privacy
   - Appearance
2. ✅ Verify: Each tab loads without error
3. ✅ Verify: Shows placeholder or actual content
4. ✅ Verify: No console errors
```

**Expected Results**:

- ✅ All tabs load successfully
- ✅ Clerk integration works
- ✅ Form updates save correctly
- ✅ No console errors

---

## API Testing

### Manual API Testing

Use the browser's Network tab or a tool like Postman/Insomnia:

#### Invoice APIs

```bash
# List invoices
GET /api/invoices

# Create invoice
POST /api/invoices
Body: { clientName, amount, items, ... }

# Get single invoice
GET /api/invoices/1

# Update invoice
PUT /api/invoices/1

# Delete invoice
DELETE /api/invoices/1

# Invoice statistics
GET /api/invoices/stats
```

#### Expense APIs

```bash
# List expenses
GET /api/expenses

# Create expense
POST /api/expenses
Body: { description, amount, category, ... }

# Approve expense
POST /api/expenses/1/approve

# Reject expense
POST /api/expenses/1/reject
Body: { reason: "..." }

# Expense statistics
GET /api/expenses/stats

# List categories
GET /api/expenses/categories
```

#### Report APIs

```bash
# List reports
GET /api/reports

# Create report
POST /api/reports
Body: { name, type, config, ... }

# Run report
POST /api/reports/1/run

# List templates
GET /api/reports/templates

# Create from template
POST /api/reports/templates
Body: { templateId, customizations }
```

#### AI API

```bash
# Chat with Financbase GPT
POST /api/ai/financbase-gpt
Body: { messages: [...] }
# Expect: Streaming response
```

#### Notification APIs

```bash
# List notifications
GET /api/notifications

# Mark as read
POST /api/notifications/1/read

# Mark all as read
POST /api/notifications/mark-all-read
```

---

## Database Verification

### Check Tables Exist

```sql
-- In your database client or Drizzle Studio

-- Settings tables
SELECT COUNT(*) FROM notification_preferences;
SELECT COUNT(*) FROM user_preferences;
SELECT COUNT(*) FROM privacy_settings;
SELECT COUNT(*) FROM security_settings;

-- Invoice tables
SELECT COUNT(*) FROM financbase_clients;
SELECT COUNT(*) FROM financbase_invoices;
SELECT COUNT(*) FROM financbase_invoice_payments;
SELECT COUNT(*) FROM financbase_invoice_templates;

-- Expense tables
SELECT COUNT(*) FROM financbase_expenses;
SELECT COUNT(*) FROM financbase_expense_categories;
SELECT COUNT(*) FROM financbase_expense_attachments;
SELECT COUNT(*) FROM financbase_expense_approval_log;

-- Report tables
SELECT COUNT(*) FROM financbase_reports;
SELECT COUNT(*) FROM financbase_report_schedules;
SELECT COUNT(*) FROM financbase_report_history;
SELECT COUNT(*) FROM financbase_report_templates;
```

### Verify Default Data

```sql
-- Should return 9 categories
SELECT name FROM financbase_expense_categories 
WHERE user_id = 'default' 
ORDER BY name;

-- Should return 5 templates
SELECT name, is_popular FROM financbase_report_templates 
ORDER BY is_popular DESC, name;
```

---

## Performance Testing

### Load Time Checks

```
1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to each page
4. ✅ Verify: Initial load < 2 seconds
5. ✅ Verify: No failed requests (red items)
6. ✅ Verify: No 404 errors
```

### Console Errors

```
1. Open browser Console (F12)
2. Navigate through all pages
3. ✅ Verify: No red errors
4. ✅ Verify: No yellow warnings (or only expected ones)
```

### Memory Leaks

```
1. Open Performance Monitor in DevTools
2. Navigate between pages multiple times
3. ✅ Verify: Memory usage stays stable
4. ✅ Verify: No continuous growth
```

---

## Accessibility Testing

### Keyboard Navigation

```
1. Use only Tab key to navigate
2. ✅ Verify: Can reach all interactive elements
3. ✅ Verify: Focus indicators visible
4. Use Enter/Space to activate buttons
5. ✅ Verify: All buttons work with keyboard
```

### Screen Reader

```
1. Enable screen reader (VoiceOver on Mac, NVDA on Windows)
2. Navigate through pages
3. ✅ Verify: All content is announced
4. ✅ Verify: Buttons have descriptive labels
5. ✅ Verify: Form fields have labels
```

---

## Browser Compatibility

Test in multiple browsers:

- [ ] **Chrome** (latest)
- [ ] **Firefox** (latest)
- [ ] **Safari** (latest)
- [ ] **Edge** (latest)

For each browser, verify:

- ✅ All pages load
- ✅ Styling looks correct
- ✅ Interactive features work
- ✅ No console errors

---

## Mobile Testing

Test on mobile devices or using DevTools device emulation:

- [ ] **iPhone** (Safari/Chrome)
- [ ] **Android** (Chrome)
- [ ] **Tablet** (iPad/Android)

For each device, verify:

- ✅ Responsive layout works
- ✅ Touch interactions work
- ✅ Navigation is usable
- ✅ Forms are usable

---

## Integration Testing

### End-to-End Flow 1: Invoice Creation to Payment

```
1. Create a new client
2. Create an invoice for that client
3. Send the invoice
4. Record a payment
5. ✅ Verify: Invoice status updates to "Paid"
6. ✅ Verify: Statistics reflect the payment
```

### End-to-End Flow 2: Expense Submission to Approval

```
1. Submit a new expense
2. Add receipt attachment (if implemented)
3. Submit for approval
4. ✅ Verify: Expense shows as "Pending"
5. Approve the expense
6. ✅ Verify: Expense shows as "Approved"
7. ✅ Verify: Stats update
8. ✅ Verify: Notification sent (if implemented)
```

### End-to-End Flow 3: Report Generation

```
1. Create a report from template
2. Customize report settings
3. Save report
4. Run the report
5. ✅ Verify: Report history created
6. ✅ Verify: Results displayed
7. Toggle favorite
8. ✅ Verify: Shows in favorites
```

---

## Bug Reporting Template

If you find issues, document them like this:

```markdown
**Title**: Brief description of the bug

**Severity**: Critical / High / Medium / Low

**Steps to Reproduce**:
1. Navigate to...
2. Click on...
3. Enter...
4. Observe...

**Expected Result**:
What should happen

**Actual Result**:
What actually happens

**Environment**:
- Browser: Chrome 120
- OS: macOS 14
- Screen size: 1920x1080

**Console Errors** (if any):
```

Error message here

```

**Screenshots** (if applicable):
[Attach screenshot]
```

---

## Testing Summary Checklist

After completing all tests, check off:

### Features Tested

- [ ] Financbase GPT (AI Assistant)
- [ ] Financial Overview Dashboard
- [ ] Invoice Management
- [ ] Expense Tracking
- [ ] Reports System
- [ ] Notifications
- [ ] Settings

### Test Types Completed

- [ ] Functional testing
- [ ] API testing
- [ ] Database verification
- [ ] Performance testing
- [ ] Accessibility testing
- [ ] Browser compatibility
- [ ] Mobile responsiveness
- [ ] Integration testing

### Issues Found

- [ ] Critical issues: ___
- [ ] High priority: ___
- [ ] Medium priority: ___
- [ ] Low priority: ___

### Overall Status

- [ ] ✅ **PASS** - Ready for staging deployment
- [ ] ⚠️ **PASS WITH ISSUES** - Minor issues to fix
- [ ] ❌ **FAIL** - Major issues need resolution

---

## Next Steps After Testing

1. **If all tests pass**:
   - Deploy to staging environment
   - Conduct user acceptance testing
   - Prepare for production deployment

2. **If issues found**:
   - Document all bugs
   - Prioritize fixes
   - Re-test after fixes
   - Repeat until all critical issues resolved

3. **Performance optimization**:
   - Profile slow pages
   - Optimize database queries
   - Add caching where needed
   - Lazy load heavy components

4. **Documentation**:
   - Update user guides
   - Create API documentation
   - Write deployment guide
   - Document known limitations

---

**Testing Status**: 🚧 **READY TO BEGIN**  
**Last Updated**: October 21, 2025  
**Version**: 2.0.0-beta

---

*For questions or issues during testing, refer to `QUICK_START.md` or `TIER2_100_PERCENT_COMPLETE.md`*
