# Lead System Testing Guide

## 🧪 **Testing Checklist**

### **1. Test Contact Form Lead Creation**

#### Steps:
1. Navigate to `/contact` page
2. Fill out the contact form with test data
3. Submit the form
4. Verify lead is created in database
5. Check lead appears in lead management system

#### Test Data:
```json
{
  "name": "John Doe",
  "email": "john.doe@test.com", 
  "company": "Test Company Inc",
  "message": "I'm interested in learning more about your financial management platform. Can you provide more information about pricing and features?"
}
```

#### Expected Results:
- ✅ Form submission successful
- ✅ Lead created with `source: "website"`
- ✅ Lead priority set to `"medium"`
- ✅ Lead score calculated automatically
- ✅ Lead appears in lead management dashboard

---

### **2. Test User Signup Lead Creation**

#### Steps:
1. Navigate to `/auth/sign-up`
2. Create a new user account
3. Complete the signup process
4. Verify lead is created in database
5. Check lead appears in lead management system

#### Test Data:
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@test.com"
}
```

#### Expected Results:
- ✅ User signup successful
- ✅ Lead created with `source: "signup"`
- ✅ Lead priority set to `"high"`
- ✅ Lead includes Clerk user ID in metadata
- ✅ Lead appears in lead management dashboard

---

### **3. Test Lead Management System**

#### Steps:
1. Access the lead management dashboard
2. Verify leads appear in the system
3. Check lead details and scoring
4. Test lead activities and tasks
5. Verify notifications are sent

#### Expected Results:
- ✅ Leads visible in dashboard
- ✅ Lead scoring working correctly
- ✅ Lead activities tracked
- ✅ Notifications sent for new leads
- ✅ Lead pipeline functioning

---

## 🔍 **Database Verification**

### **Check Leads Table:**
```sql
SELECT 
  id,
  first_name,
  last_name,
  email,
  source,
  priority,
  lead_score,
  notes,
  metadata,
  created_at
FROM leads 
ORDER BY created_at DESC 
LIMIT 10;
```

### **Check Lead Activities:**
```sql
SELECT 
  la.id,
  la.lead_id,
  la.type,
  la.subject,
  la.description,
  la.status,
  la.created_at
FROM lead_activities la
JOIN leads l ON la.lead_id = l.id
ORDER BY la.created_at DESC 
LIMIT 10;
```

---

## 🚨 **Troubleshooting**

### **Contact Form Issues:**
- Check browser console for JavaScript errors
- Verify `/api/contact` endpoint is responding
- Check server logs for lead creation errors
- Ensure database connection is working

### **Signup Lead Issues:**
- Verify Clerk webhook is configured correctly
- Check `CLERK_WEBHOOK_SECRET` environment variable
- Verify webhook endpoint is accessible
- Check webhook signature verification

### **Lead Management Issues:**
- Verify lead management service is working
- Check database permissions
- Ensure notification service is configured
- Verify lead scoring logic

---

## 📊 **Expected Lead Data**

### **Contact Form Lead:**
```json
{
  "userId": "system-lead-manager",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@test.com",
  "company": "Test Company Inc",
  "source": "website",
  "priority": "medium",
  "leadScore": "45",
  "notes": "Contact form submission: I'm interested in learning more...",
  "metadata": {
    "formType": "contact",
    "originalMessage": "I'm interested in learning more...",
    "submittedAt": "2025-01-21T10:30:00.000Z"
  }
}
```

### **Signup Lead:**
```json
{
  "userId": "user_2abc123def456",
  "firstName": "Jane",
  "lastName": "Smith", 
  "email": "jane.smith@test.com",
  "source": "signup",
  "priority": "high",
  "leadScore": "60",
  "notes": "Lead created from user signup",
  "metadata": {
    "clerkUserId": "user_2abc123def456",
    "signupMethod": "email",
    "createdAt": "2025-01-21T10:30:00.000Z",
    "webhookEvent": "user.created"
  }
}
```

---

## ✅ **Success Criteria**

- [ ] Contact form submissions create leads automatically
- [ ] User signups create leads automatically  
- [ ] Leads appear in lead management dashboard
- [ ] Lead scoring works correctly
- [ ] Lead activities are tracked
- [ ] Notifications are sent for new leads
- [ ] All data is properly stored in database
- [ ] No errors in console or server logs

---

## 🎯 **Next Steps After Testing**

1. **Configure Clerk Webhook** (if not already done)
2. **Set up Email Notifications** for new leads
3. **Configure Lead Assignment** rules
4. **Set up Lead Scoring** criteria
5. **Create Lead Dashboards** for sales team
6. **Test Lead Conversion** tracking

The lead system should now be fully operational! 🚀
