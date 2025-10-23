# 💰 Expense Tracking Training

**Duration**: 25 minutes  
**Difficulty**: Intermediate  
**Prerequisites**: [Getting Started Guide](./getting-started.md)

---

## 🎯 What You'll Learn

By the end of this guide, you'll be able to:
- Submit and manage expense reports
- Set up expense categories and budgets
- Handle approval workflows
- Track expense analytics and reporting
- Manage receipts and attachments
- Configure automated expense rules

---

## 📋 Expense Management Overview

### 1.1 Expense Lifecycle

Understanding the complete expense management process:

```
Submit Expense → Manager Review → Approval/Rejection → Payment → Reimbursement → Archive
     ↓              ↓              ↓              ↓              ↓              ↓
   Pending        Under Review    Approved      Processed     Completed     Archived
```

**Expense States:**
- **Draft**: Being created, not submitted
- **Pending**: Submitted, awaiting approval
- **Under Review**: Manager is reviewing
- **Approved**: Approved for payment
- **Rejected**: Denied with reason
- **Paid**: Reimbursement processed
- **Disputed**: Under dispute resolution
- **Archived**: Completed and stored

### 1.2 Key Features

**Core Capabilities:**
- **Receipt Management**: Photo and document uploads
- **Category System**: Organized expense classification
- **Approval Workflows**: Multi-level approval process
- **Budget Tracking**: Category-wise spending limits
- **Policy Enforcement**: Automatic rule checking
- **Mobile Access**: Submit expenses on the go
- **Integration**: Bank and credit card imports
- **Reporting**: Comprehensive expense analytics

---

## 📝 Submitting Expenses

### 2.1 Creating an Expense Report

**Step 1: Access Expense Creation**
1. **Click** "Expenses" in the sidebar
2. **Click** the "+ New Expense" button
3. **Or use** the floating action button (FAB)
4. **Or use** mobile app for on-the-go submission

**Step 2: Basic Information**
```
Expense Details:
┌─────────────────────────────────────────┐
│ Date: [Expense date]                    │
│ Amount: $125.50                         │
│ Category: [Select from dropdown]        │
│ Description: [What was purchased]       │
│ Vendor: [Where purchased]               │
│ Payment Method: Credit Card             │
│ Receipt: [Upload image/PDF]             │
│ Notes: [Additional details]             │
└─────────────────────────────────────────┘
```

**Step 3: Receipt Upload**
- **Photo capture**: Use mobile camera
- **File upload**: PDF, JPG, PNG files
- **Multiple receipts**: Attach multiple files
- **Receipt validation**: Automatic data extraction

### 2.2 Expense Categories

**Default Categories:**
```
┌─────────────────────────────────────────────────────────┐
│ Office Supplies    │ Stationery, equipment, supplies    │
│ Travel            │ Flights, hotels, meals, transport   │
│ Meals & Entertainment │ Business meals, client events   │
│ Marketing         │ Advertising, promotions, materials   │
│ Software & Tools  │ Subscriptions, licenses, apps      │
│ Professional Services │ Consultants, legal, accounting │
│ Utilities         │ Internet, phone, office rent       │
│ Training          │ Courses, conferences, education     │
│ Other             │ Miscellaneous business expenses     │
└─────────────────────────────────────────────────────────┘
```

**Category Management:**
- **Add custom categories**: Create business-specific categories
- **Set budgets**: Allocate spending limits per category
- **Tax settings**: Configure tax-deductible categories
- **Approval rules**: Different approval processes per category

### 2.3 Receipt Management

**Receipt Types:**
- **Digital receipts**: Email confirmations
- **Scanned receipts**: Physical receipt scans
- **Mobile photos**: Camera-captured receipts
- **PDF documents**: Electronic receipts
- **Bank statements**: Transaction records

**Receipt Processing:**
- **OCR technology**: Automatic text extraction
- **Data validation**: Verify amounts and dates
- **Duplicate detection**: Prevent duplicate submissions
- **Storage**: Secure cloud storage
- **Retrieval**: Easy access for audits

---

## 👥 Approval Workflows

### 3.1 Approval Process

**Standard Approval Flow:**
1. **Employee submits** expense
2. **Manager reviews** and approves/rejects
3. **Finance team** processes approved expenses
4. **Payment** is made to employee
5. **Expense archived** for record keeping

**Multi-level Approval:**
- **Amount-based**: Different approvers for different amounts
- **Category-based**: Specific approvers for specific categories
- **Department-based**: Role-based approval chains
- **Emergency**: Fast-track for urgent expenses

### 3.2 Manager Review

**Review Interface:**
```
┌─────────────────────────────────────────────────────────┐
│ Employee: John Smith                                   │
│ Amount: $125.50                                        │
│ Category: Travel                                        │
│ Date: 2024-10-15                                       │
│ Description: Client meeting lunch                      │
│ Receipt: [View/Download]                               │
│ Policy Check: ✅ Compliant                             │
│ Budget Status: ✅ Within limit                          │
│ [Approve] [Reject] [Request Info]                      │
└─────────────────────────────────────────────────────────┘
```

**Review Actions:**
- **Approve**: Accept expense for payment
- **Reject**: Deny with reason
- **Request Info**: Ask for additional details
- **Modify**: Change amount or category
- **Bulk Actions**: Process multiple expenses

### 3.3 Approval Rules

**Automatic Approval:**
- **Amount limits**: Auto-approve under certain amounts
- **Category rules**: Auto-approve for specific categories
- **Employee level**: Auto-approve for senior staff
- **Policy compliance**: Auto-approve compliant expenses

**Escalation Rules:**
- **Time-based**: Escalate if not reviewed in X days
- **Amount-based**: Escalate high-value expenses
- **Policy violations**: Escalate non-compliant expenses
- **Manager unavailable**: Escalate to backup approver

---

## 📊 Expense Analytics

### 4.1 Expense Dashboard

**Key Metrics:**
```
┌─────────────────┬─────────────────┬─────────────────┐
│ Total Expenses  │ This Month      │ Pending         │
│ $45,230         │ $8,900          │ $2,450          │
│ YTD             │ 23 expenses     │ 8 expenses      │
└─────────────────┴─────────────────┴─────────────────┘
```

**Analytics Available:**
- **Spending by category**: Where money is being spent
- **Employee spending**: Individual expense patterns
- **Monthly trends**: Month-over-month analysis
- **Budget vs. actual**: Spending against budgets
- **Policy compliance**: Adherence to expense policies

### 4.2 Category Analysis

**Spending Breakdown:**
```
┌─────────────────────────────────────────────────────────┐
│ Travel            │ $15,200 │ 34% │ ↗ +12% vs. budget │
│ Meals & Entertainment│ $8,900 │ 20% │ ↗ +5% vs. budget  │
│ Office Supplies    │ $5,400  │ 12% │ ↘ -3% vs. budget  │
│ Marketing          │ $7,200  │ 16% │ ↗ +8% vs. budget  │
│ Software & Tools   │ $4,500  │ 10% │ ↗ +15% vs. budget │
│ Other             │ $4,030  │ 8%  │ ↗ +2% vs. budget  │
└─────────────────────────────────────────────────────────┘
```

**Category Insights:**
- **Top spending categories**: Highest expense areas
- **Budget performance**: Over/under budget analysis
- **Trend analysis**: Category spending over time
- **Seasonal patterns**: Spending by time of year
- **Policy violations**: Non-compliant expenses

### 4.3 Employee Analytics

**Individual Spending:**
- **Total expenses**: Per employee spending
- **Category preferences**: Top spending categories
- **Approval rates**: Percentage of approved expenses
- **Policy compliance**: Adherence to expense policies
- **Trend analysis**: Spending patterns over time

**Team Comparison:**
- **Department spending**: Team vs. team analysis
- **Role-based patterns**: Spending by job function
- **Geographic analysis**: Spending by location
- **Time-based analysis**: Spending by time periods

---

## 💳 Payment & Reimbursement

### 5.1 Payment Processing

**Payment Methods:**
- **Direct deposit**: Bank account transfer
- **Payroll integration**: Add to regular paycheck
- **Company credit card**: Direct payment to vendor
- **Petty cash**: Cash reimbursement
- **Check**: Physical check payment

**Payment Workflow:**
1. **Expense approved** by manager
2. **Finance team** processes payment
3. **Payment method** selected
4. **Payment processed** and recorded
5. **Employee notified** of payment
6. **Receipt archived** for records

### 5.2 Reimbursement Tracking

**Reimbursement Status:**
- **Pending payment**: Approved, awaiting payment
- **Payment processed**: Payment has been made
- **Payment confirmed**: Employee confirms receipt
- **Disputed**: Payment issue requires resolution
- **Completed**: Full reimbursement cycle complete

**Payment History:**
- **Payment date**: When payment was made
- **Payment method**: How payment was made
- **Payment amount**: Total amount reimbursed
- **Reference number**: Payment tracking number
- **Confirmation**: Employee receipt confirmation

### 5.3 Budget Management

**Budget Types:**
- **Annual budgets**: Yearly spending limits
- **Monthly budgets**: Monthly spending caps
- **Category budgets**: Per-category limits
- **Employee budgets**: Individual spending limits
- **Project budgets**: Project-specific limits

**Budget Monitoring:**
- **Current spending**: Year-to-date expenses
- **Remaining budget**: Available spending amount
- **Projected spending**: Forecasted year-end total
- **Budget alerts**: Notifications when approaching limits
- **Overage tracking**: Spending beyond budget

---

## 📱 Mobile Expense Management

### 6.1 Mobile App Features

**Core Mobile Features:**
- **Receipt capture**: Camera integration
- **Expense submission**: Quick expense entry
- **Approval workflow**: Manager review on mobile
- **Expense tracking**: Real-time status updates
- **Offline capability**: Submit without internet

**Mobile Workflow:**
1. **Capture receipt** with camera
2. **Enter expense details** quickly
3. **Submit for approval** immediately
4. **Track status** in real-time
5. **Receive notifications** for updates

### 6.2 Mobile Best Practices

**Receipt Photography:**
- **Good lighting**: Ensure receipt is clearly visible
- **Full receipt**: Capture entire receipt
- **No shadows**: Avoid shadows on receipt
- **Straight angle**: Hold phone perpendicular to receipt
- **Multiple angles**: Take multiple photos if needed

**Quick Submission:**
- **Pre-filled data**: Use saved vendor information
- **Category shortcuts**: Quick category selection
- **Amount recognition**: Automatic amount detection
- **Location services**: Automatic location tagging
- **Voice notes**: Add voice descriptions

---

## 🔧 Advanced Features

### 7.1 Automated Rules

**Rule Types:**
- **Category rules**: Auto-categorize based on vendor
- **Amount limits**: Flag expenses over certain amounts
- **Policy enforcement**: Check against expense policies
- **Duplicate detection**: Prevent duplicate submissions
- **Receipt requirements**: Enforce receipt uploads

**Rule Configuration:**
```
┌─────────────────────────────────────────────────────────┐
│ Rule: Auto-categorize Uber expenses                    │
│ Condition: Vendor contains "Uber"                      │
│ Action: Set category to "Travel"                       │
│ Status: Active                                         │
└─────────────────────────────────────────────────────────┘
```

### 7.2 Integration Features

**Bank Integration:**
- **Transaction import**: Automatic expense import
- **Receipt matching**: Match receipts to transactions
- **Duplicate prevention**: Avoid duplicate expenses
- **Reconciliation**: Match expenses to bank records

**Credit Card Integration:**
- **Statement import**: Import credit card statements
- **Transaction categorization**: Auto-categorize transactions
- **Receipt matching**: Link receipts to transactions
- **Spending analysis**: Credit card spending patterns

### 7.3 Reporting & Analytics

**Standard Reports:**
- **Expense summary**: Total expenses by period
- **Category breakdown**: Spending by category
- **Employee expenses**: Individual spending reports
- **Budget vs. actual**: Budget performance analysis
- **Policy compliance**: Adherence to expense policies

**Custom Reports:**
- **Date range selection**: Custom time periods
- **Filter options**: Employee, category, amount filters
- **Export formats**: PDF, Excel, CSV export
- **Scheduled reports**: Automatic report generation
- **Dashboard widgets**: Real-time analytics

---

## 🎯 Best Practices

### 8.1 Expense Submission

**Best Practices:**
- **Submit promptly**: Submit expenses within 48 hours
- **Clear descriptions**: Detailed expense descriptions
- **Complete receipts**: Include all required documentation
- **Accurate amounts**: Double-check all amounts
- **Policy compliance**: Follow company expense policies

**Common Mistakes to Avoid:**
- **Vague descriptions**: "Business expense" vs. "Client lunch meeting"
- **Missing receipts**: Submit without required documentation
- **Personal expenses**: Mixing personal and business expenses
- **Late submissions**: Submitting expenses weeks later
- **Incomplete information**: Missing required fields

### 8.2 Receipt Management

**Receipt Best Practices:**
- **Keep originals**: Store physical receipts safely
- **Digital backup**: Scan or photograph receipts
- **Organize by date**: File receipts chronologically
- **Note details**: Add context to receipts
- **Retain records**: Keep receipts for required period

**Receipt Organization:**
- **Date-based filing**: Organize by expense date
- **Category-based filing**: Group by expense type
- **Employee-based filing**: Separate by employee
- **Project-based filing**: Group by project or client
- **Digital filing**: Cloud-based storage system

### 8.3 Approval Management

**Manager Best Practices:**
- **Review promptly**: Process approvals within 48 hours
- **Check compliance**: Verify policy adherence
- **Provide feedback**: Give clear approval/rejection reasons
- **Train employees**: Educate on expense policies
- **Monitor trends**: Watch for spending patterns

**Approval Efficiency:**
- **Batch processing**: Review multiple expenses together
- **Template responses**: Use standard approval messages
- **Delegation**: Assign backup approvers
- **Automation**: Use rules for routine approvals
- **Communication**: Keep employees informed of status

---

## 🚨 Troubleshooting

### 9.1 Common Issues

**Issue: Receipt not uploading**
**Solutions:**
- Check file size (max 10MB)
- Verify file format (JPG, PNG, PDF)
- Try different browser
- Clear browser cache
- Contact support if issue persists

**Issue: Expense not submitting**
**Solutions:**
- Check all required fields are filled
- Verify internet connection
- Try refreshing the page
- Clear browser cache
- Check for system updates

**Issue: Approval not received**
**Solutions:**
- Check if manager is available
- Verify approval workflow settings
- Check email notifications
- Contact manager directly
- Escalate to backup approver

### 9.2 Data Issues

**Issue: Missing expense data**
**Solutions:**
- Check date range filters
- Verify user permissions
- Refresh data connection
- Check for system updates
- Contact administrator

**Issue: Incorrect calculations**
**Solutions:**
- Review tax rate settings
- Check currency conversion
- Verify amount entries
- Update system settings
- Recalculate manually

---

## 🎓 Practice Exercises

### Exercise 1: Submit Your First Expense
1. **Create** a new expense for a sample business meal
2. **Upload** a sample receipt image
3. **Categorize** as "Meals & Entertainment"
4. **Add** detailed description
5. **Submit** for approval

### Exercise 2: Category Management
1. **Create** 3 custom expense categories
2. **Set** budget limits for each category
3. **Configure** approval rules
4. **Test** category assignment
5. **Generate** category spending report

### Exercise 3: Approval Workflow
1. **Submit** 5 different expense types
2. **Review** as manager and approve/reject
3. **Test** bulk approval process
4. **Configure** automated rules
5. **Generate** approval analytics report

---

## ✅ Knowledge Check

**Test your understanding:**

1. **What is the first step in submitting an expense?**
   - [ ] Upload receipt
   - [ ] Select category and enter basic information
   - [ ] Get manager approval
   - [ ] Set budget limits

2. **How do you handle receipt management?**
   - [ ] Only keep digital copies
   - [ ] Capture clear photos, organize by date, and maintain both digital and physical copies
   - [ ] Only keep physical receipts
   - [ ] Don't worry about receipts

3. **What should you do if an expense is rejected?**
   - [ ] Submit it again without changes
   - [ ] Review the rejection reason, make necessary corrections, and resubmit
   - [ ] Ignore the rejection
   - [ ] Contact support immediately

**Answers:** 1-B, 2-B, 3-B

---

## 🎉 Congratulations!

You've mastered expense tracking in Financbase! You now understand:

✅ How to submit and manage expenses  
✅ How to handle approval workflows  
✅ How to track spending analytics  
✅ How to manage receipts and attachments  
✅ How to configure automated rules  

**Next steps:**
- **For reporting**: [Reports Training](./reports-training.md)
- **For AI assistance**: [AI Assistant Guide](./ai-assistant-training.md)
- **For advanced features**: [Advanced Features Training](./advanced-features-training.md)

---

*Need help? Use the in-app AI assistant or contact our support team.*
