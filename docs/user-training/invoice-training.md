# 📄 Invoice Management Training

**Duration**: 30 minutes  
**Difficulty**: Intermediate  
**Prerequisites**: [Getting Started Guide](./getting-started.md)

---

## 🎯 What You'll Learn

By the end of this guide, you'll be able to:

- Create professional invoices with line items
- Manage client information and relationships
- Track invoice status and payments
- Send invoices via email
- Generate invoice reports and analytics
- Set up automated invoice workflows

---

## 📋 Invoice Management Overview

### 1.1 Invoice Lifecycle

Understanding the complete invoice process:

```
Create Invoice → Send to Client → Track Status → Receive Payment → Record Payment → Archive
     ↓              ↓              ↓              ↓              ↓              ↓
   Draft         Sent           Outstanding    Paid           Completed     Archived
```

**Invoice States:**

- **Draft**: Being created, not sent
- **Sent**: Delivered to client
- **Viewed**: Client has opened the invoice
- **Outstanding**: Past due date, unpaid
- **Paid**: Payment received and recorded
- **Overdue**: Past due date, requires follow-up
- **Cancelled**: Invoice voided
- **Refunded**: Payment returned to client

### 1.2 Key Features

**Core Capabilities:**

- **Professional Templates**: Multiple invoice designs
- **Line Item Management**: Detailed product/service breakdown
- **Client Management**: Customer database integration
- **Payment Tracking**: Real-time payment status
- **Automated Reminders**: Follow-up on overdue invoices
- **Multi-currency Support**: International invoicing
- **Tax Calculations**: Automatic tax computation
- **PDF Generation**: Professional invoice documents

---

## 🆕 Creating Your First Invoice

### 2.1 Invoice Creation Process

**Step 1: Access Invoice Creation**

1. **Click** "Invoices" in the sidebar
2. **Click** the "+ New Invoice" button
3. **Or use** the floating action button (FAB)
4. **Or use** keyboard shortcut: Ctrl + N

**Step 2: Basic Information**

```
Invoice Details:
┌─────────────────────────────────────────┐
│ Invoice #: INV-2024-001                 │
│ Date: [Today's date]                   │
│ Due Date: [30 days from today]          │
│ Status: Draft                           │
│ Client: [Select or add new]             │
│ Currency: USD                           │
│ Tax Rate: 8.5%                          │
└─────────────────────────────────────────┘
```

**Step 3: Client Selection**

- **Existing Client**: Select from dropdown
- **New Client**: Click "Add New Client"
- **Client Details**: Name, email, address, phone

### 2.2 Adding Line Items

**Line Item Structure:**

```
┌─────────────────────────────────────────────────────────────┐
│ Description        │ Qty │ Rate    │ Amount  │ Tax   │ Total │
├─────────────────────────────────────────────────────────────┤
│ Web Development    │ 40  │ $75.00  │ $3,000  │ $255  │ $3,255│
│ Design Services    │ 20  │ $50.00  │ $1,000  │ $85   │ $1,085│
│ Consultation       │ 5   │ $100.00 │ $500    │ $42.50│ $542.50│
├─────────────────────────────────────────────────────────────┤
│ Subtotal: $4,500                                           │
│ Tax (8.5%): $382.50                                        │
│ Total: $4,882.50                                           │
└─────────────────────────────────────────────────────────────┘
```

**How to add line items:**

1. **Click** "Add Line Item"
2. **Enter** description
3. **Set** quantity and rate
4. **Choose** tax category
5. **Save** line item
6. **Repeat** for additional items

### 2.3 Invoice Customization

**Template Options:**

- **Professional**: Clean, business-focused design
- **Modern**: Contemporary styling with colors
- **Minimal**: Simple, text-focused layout
- **Custom**: Upload your own template

**Customization Options:**

- **Logo**: Upload company logo
- **Colors**: Brand color scheme
- **Fonts**: Typography selection
- **Layout**: Field positioning
- **Terms**: Payment terms and conditions
- **Notes**: Additional information

---

## 👥 Client Management

### 3.1 Client Database

**Client Information Fields:**

```
┌─────────────────────────────────────────┐
│ Company Name: Acme Corp                 │
│ Contact Person: John Smith              │
│ Email: john@acmecorp.com                │
│ Phone: +1 (555) 123-4567               │
│ Address: 123 Business St               │
│ City, State, ZIP: New York, NY 10001   │
│ Country: United States                  │
│ Tax ID: 12-3456789                      │
│ Payment Terms: Net 30                   │
│ Currency: USD                           │
└─────────────────────────────────────────┘
```

**How to add a new client:**

1. **Click** "Clients" in the sidebar
2. **Click** "Add New Client"
3. **Fill in** required information
4. **Set** payment terms and preferences
5. **Save** client record

### 3.2 Client Categories

**Client Types:**

- **Individual**: Personal clients
- **Business**: Corporate clients
- **Non-profit**: Charitable organizations
- **Government**: Public sector clients
- **International**: Foreign clients

**Benefits of categorization:**

- **Targeted communication**: Role-specific messaging
- **Custom pricing**: Different rates per category
- **Compliance**: Tax and legal requirements
- **Reporting**: Category-based analytics

### 3.3 Client Communication

**Communication Features:**

- **Email templates**: Pre-written messages
- **Bulk communication**: Send to multiple clients
- **Follow-up sequences**: Automated reminder series
- **Delivery tracking**: Know when emails are opened
- **Response management**: Handle client replies

---

## 📤 Sending Invoices

### 4.1 Email Delivery

**Sending Process:**

1. **Review** invoice details
2. **Click** "Send Invoice"
3. **Choose** email template
4. **Customize** message if needed
5. **Add** additional recipients
6. **Send** invoice

**Email Templates:**

- **Standard**: Professional, formal tone
- **Friendly**: Casual, relationship-focused
- **Urgent**: Payment reminder style
- **Custom**: Your own template

### 4.2 Delivery Options

**Delivery Methods:**

- **Email only**: PDF attachment
- **Email + Link**: Online invoice portal
- **Print**: Physical mail option
- **Portal**: Client self-service access

**Client Portal Features:**

- **View invoices**: Online invoice viewing
- **Make payments**: Integrated payment processing
- **Download PDFs**: Save invoice copies
- **Message center**: Communication with you
- **Payment history**: Past transaction records

### 4.3 Follow-up Automation

**Automated Reminders:**

- **7 days**: Gentle reminder
- **14 days**: Payment due soon
- **30 days**: Overdue notice
- **45 days**: Final notice
- **60 days**: Collection notice

**Customization Options:**

- **Message content**: Personalized reminders
- **Timing**: Custom reminder schedules
- **Escalation**: Different approaches per stage
- **Exceptions**: Skip reminders for specific clients

---

## 💰 Payment Tracking

### 5.1 Payment Recording

**Recording a Payment:**

1. **Open** the invoice
2. **Click** "Record Payment"
3. **Enter** payment details:

   ```
   Payment Amount: $4,882.50
   Payment Date: [Today's date]
   Payment Method: Bank Transfer
   Reference: Txn-123456
   Notes: [Optional]
   ```

4. **Save** payment record

**Payment Methods:**

- **Bank Transfer**: ACH, wire transfers
- **Credit Card**: Visa, MasterCard, Amex
- **Check**: Physical check payments
- **Cash**: Cash transactions
- **Other**: Cryptocurrency, barter, etc.

### 5.2 Partial Payments

**Handling Partial Payments:**

- **Record amount received**: Enter actual payment
- **Update invoice status**: Mark as partially paid
- **Track remaining balance**: Show outstanding amount
- **Generate receipt**: Confirm payment received
- **Follow up**: Remind about remaining balance

**Partial Payment Scenarios:**

- **Installment plans**: Regular payment schedule
- **Deposits**: Upfront payment for services
- **Milestone payments**: Project-based payments
- **Dispute resolution**: Reduced payment amounts

### 5.3 Payment Reconciliation

**Reconciliation Process:**

1. **Match payments** to invoices
2. **Verify amounts** and dates
3. **Update invoice status** to paid
4. **Generate receipts** for clients
5. **Update accounting records**

**Reconciliation Tools:**

- **Bank import**: Automatic payment matching
- **Bulk processing**: Handle multiple payments
- **Exception handling**: Unmatched payments
- **Audit trail**: Complete payment history

---

## 📊 Invoice Analytics

### 6.1 Invoice Dashboard

**Key Metrics:**

```
┌─────────────────┬─────────────────┬─────────────────┐
│ Total Invoices  │ Outstanding     │ Overdue         │
│ 156             │ $45,230         │ $12,450         │
│ This Month      │ 23 invoices     │ 8 invoices      │
└─────────────────┴─────────────────┴─────────────────┘
```

**Analytics Available:**

- **Revenue by month**: Monthly invoice totals
- **Client analysis**: Top clients by revenue
- **Payment trends**: Average payment time
- **Overdue analysis**: Aging of outstanding invoices
- **Seasonal patterns**: Revenue by time of year

### 6.2 Revenue Reports

**Revenue Analysis:**

- **Monthly revenue**: Month-over-month comparison
- **Client revenue**: Revenue by client
- **Service revenue**: Revenue by service type
- **Geographic revenue**: Revenue by location
- **Growth trends**: Revenue growth over time

**Report Generation:**

1. **Select** report type
2. **Choose** date range
3. **Apply** filters (client, service, status)
4. **Generate** report
5. **Export** to PDF/Excel

### 6.3 Aging Reports

**Aging Analysis:**

```
┌─────────────────────────────────────────────────────────┐
│ Current (0-30 days)    │ $25,000 │ 55% of outstanding │
│ 31-60 days             │ $12,000 │ 27% of outstanding │
│ 61-90 days             │ $5,000  │ 11% of outstanding │
│ Over 90 days           │ $3,230  │ 7% of outstanding  │
└─────────────────────────────────────────────────────────┘
```

**Aging Benefits:**

- **Identify** slow-paying clients
- **Prioritize** collection efforts
- **Assess** credit risk
- **Plan** cash flow management

---

## 🔄 Invoice Workflows

### 7.1 Automated Workflows

**Workflow Triggers:**

- **Invoice created**: Automatic client notification
- **Invoice viewed**: Track client engagement
- **Payment received**: Update status and send receipt
- **Invoice overdue**: Automatic reminder sequence
- **Payment late**: Escalation to management

**Workflow Actions:**

- **Send emails**: Automated notifications
- **Update status**: Change invoice state
- **Create tasks**: Follow-up reminders
- **Generate reports**: Regular analytics
- **Notify team**: Alert relevant staff

### 7.2 Approval Workflows

**Approval Process:**

1. **Invoice created** by team member
2. **Sent for approval** to manager
3. **Manager reviews** and approves/rejects
4. **If approved**: Invoice sent to client
5. **If rejected**: Returned with feedback

**Approval Levels:**

- **Amount-based**: Different approvers for different amounts
- **Client-based**: Specific approvers for specific clients
- **Department-based**: Role-based approvals
- **Emergency**: Fast-track for urgent invoices

### 7.3 Integration Workflows

**System Integrations:**

- **Accounting software**: QuickBooks, Xero, Sage
- **Payment processors**: Stripe, PayPal, Square
- **CRM systems**: Salesforce, HubSpot, Pipedrive
- **Banking**: Direct bank account integration
- **Email**: Gmail, Outlook integration

---

## 🎯 Best Practices

### 8.1 Invoice Creation

**Best Practices:**

- **Clear descriptions**: Detailed line item descriptions
- **Consistent numbering**: Sequential invoice numbers
- **Professional appearance**: Use templates and branding
- **Accurate calculations**: Double-check all math
- **Complete information**: All required fields filled

**Common Mistakes to Avoid:**

- **Vague descriptions**: "Services rendered" vs. "Web development - 40 hours"
- **Missing information**: Incomplete client details
- **Calculation errors**: Wrong totals or tax amounts
- **Poor formatting**: Hard to read or unprofessional
- **Late sending**: Send invoices promptly

### 8.2 Payment Follow-up

**Follow-up Strategy:**

- **Send promptly**: Invoice within 24 hours of service
- **Follow up consistently**: Regular reminder schedule
- **Be professional**: Maintain good client relationships
- **Offer flexibility**: Payment plans for large amounts
- **Document everything**: Keep records of all communications

**Communication Tips:**

- **Be polite but firm**: Professional tone
- **Provide options**: Multiple payment methods
- **Explain consequences**: Late payment policies
- **Show appreciation**: Thank clients for prompt payment
- **Resolve disputes**: Address concerns quickly

### 8.3 Record Keeping

**Documentation Requirements:**

- **Invoice copies**: Keep all sent invoices
- **Payment records**: Track all received payments
- **Communication logs**: Record all client interactions
- **Tax documentation**: Maintain for tax purposes
- **Audit trail**: Complete transaction history

**Storage and Organization:**

- **Digital filing**: Cloud-based storage
- **Naming conventions**: Consistent file naming
- **Backup systems**: Regular data backups
- **Access controls**: Secure client information
- **Retention policies**: Legal compliance requirements

---

## 🚨 Troubleshooting

### 9.1 Common Issues

**Issue: Invoice not sending**
**Solutions:**

- Check email address format
- Verify client email is correct
- Check spam/junk folders
- Test with different email address
- Contact support if issue persists

**Issue: Payment not recording**
**Solutions:**

- Verify payment amount matches invoice
- Check payment date is correct
- Ensure payment method is selected
- Try refreshing the page
- Clear browser cache

**Issue: Client can't access invoice**
**Solutions:**

- Check invoice link is correct
- Verify client has internet access
- Try sending different format (PDF vs. portal)
- Check if client email is blocked
- Provide alternative access method

### 9.2 Data Issues

**Issue: Missing invoice data**
**Solutions:**

- Check date range filters
- Verify user permissions
- Refresh data connection
- Check for system updates
- Contact administrator

**Issue: Incorrect calculations**
**Solutions:**

- Review tax rate settings
- Check line item amounts
- Verify currency conversion
- Update system settings
- Recalculate manually

---

## 🎓 Practice Exercises

### Exercise 1: Create Your First Invoice

1. **Create** a new invoice for a sample client
2. **Add** 3 line items with different services
3. **Apply** appropriate tax rates
4. **Customize** the template with your logo
5. **Save** as draft and review

### Exercise 2: Client Management

1. **Add** 5 new clients with complete information
2. **Categorize** clients by type
3. **Set** different payment terms for each
4. **Create** client communication templates
5. **Test** email delivery to yourself

### Exercise 3: Payment Processing

1. **Create** an invoice and mark as sent
2. **Record** a partial payment
3. **Generate** a payment receipt
4. **Update** invoice status to paid
5. **Generate** an aging report

---

## ✅ Knowledge Check

**Test your understanding:**

1. **What is the first step in creating an invoice?**
   - [ ] Add line items
   - [ ] Select client and basic information
   - [ ] Choose template
   - [ ] Set payment terms

2. **How do you handle partial payments?**
   - [ ] Create a new invoice for the remaining amount
   - [ ] Record the actual amount received and track remaining balance
   - [ ] Void the original invoice and create a new one
   - [ ] Only accept full payments

3. **What should you do if an invoice is overdue?**
   - [ ] Wait for the client to pay
   - [ ] Send automated reminders and follow up professionally
   - [ ] Cancel the invoice
   - [ ] Reduce the amount

**Answers:** 1-B, 2-B, 3-B

---

## 🎉 Congratulations

You've mastered invoice management in Financbase! You now understand:

✅ How to create professional invoices  
✅ How to manage client relationships  
✅ How to track payments and status  
✅ How to use analytics and reporting  
✅ How to set up automated workflows  

**Next steps:**

- **For expense management**: [Expense Training](./expense-training.md)
- **For reporting**: [Reports Training](./reports-training.md)
- **For AI assistance**: [AI Assistant Guide](./ai-assistant-training.md)

---

*Need help? Use the in-app AI assistant or contact our support team.*
