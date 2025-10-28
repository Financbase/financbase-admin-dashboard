# 🚀 Platform Services Testing Guide

## 📋 **Prerequisites**
- Development server running on `http://localhost:3000`
- Browser access to sign in
- Sample data loaded in database

## 🔐 **Step 1: Authentication**

### **Sign In to the Application**
1. Open your browser and navigate to: `http://localhost:3000/auth/sign-in`
2. Sign in with your Clerk account
3. You'll be redirected to the dashboard after successful authentication

### **Verify Authentication**
After signing in, you can test authenticated endpoints using browser developer tools or API testing tools.

## 🧪 **Step 2: Test Platform Services APIs**

### **Platform Services Overview**
```bash
# Test the main Platform Services endpoint
GET http://localhost:3000/api/platform/services
```

**Expected Response:**
- List of all Platform Services with their details
- Instance counts and health status
- Recent logs and metrics summary

### **Platform Hub Management**
```bash
# Get Platform Hub overview
GET http://localhost:3000/api/platform/hub

# List all connections
GET http://localhost:3000/api/platform/hub/connections

# Create a new connection
POST http://localhost:3000/api/platform/hub/connections
Content-Type: application/json
{
  "serviceId": 1,
  "name": "My Workflow Connection",
  "organizationId": "1",
  "configuration": {
    "apiKey": "your-api-key",
    "endpoint": "https://api.example.com"
  }
}

# Get available integrations
GET http://localhost:3000/api/platform/hub/integrations
```

### **Workflows API Testing**
```bash
# List workflows
GET http://localhost:3000/api/workflows

# Create a new workflow
POST http://localhost:3000/api/workflows
Content-Type: application/json
{
  "name": "Test Workflow",
  "description": "A test workflow for demonstration",
  "steps": [
    {
      "type": "webhook",
      "name": "Send Data",
      "config": {
        "url": "https://api.example.com/webhook",
        "method": "POST"
      }
    }
  ],
  "triggers": [
    {
      "type": "manual",
      "name": "Manual Trigger"
    }
  ]
}

# Get workflow templates
GET http://localhost:3000/api/workflows/templates
```

### **Webhooks API Testing**
```bash
# List webhooks
GET http://localhost:3000/api/webhooks

# Create a new webhook
POST http://localhost:3000/api/webhooks
Content-Type: application/json
{
  "name": "Test Webhook",
  "url": "https://api.example.com/webhook",
  "events": ["user.created", "user.updated"],
  "secret": "your-webhook-secret"
}

# Test webhook delivery
POST http://localhost:3000/api/webhooks/[id]/test
```

### **Monitoring API Testing**
```bash
# Check system health
GET http://localhost:3000/api/monitoring/health

# Get system metrics
GET http://localhost:3000/api/monitoring/metrics

# Get error logs
GET http://localhost:3000/api/monitoring/errors

# Get metric trends
GET http://localhost:3000/api/monitoring/metrics/trends
```

### **Alerts & Notifications Testing**
```bash
# Get alert summary
GET http://localhost:3000/api/monitoring/alerts/summary

# List alert rules
GET http://localhost:3000/api/monitoring/alerts/rules

# Create an alert rule
POST http://localhost:3000/api/monitoring/alerts/rules
Content-Type: application/json
{
  "name": "High Error Rate Alert",
  "description": "Alert when error rate exceeds 5%",
  "condition": {
    "metric": "error_rate",
    "operator": ">",
    "threshold": 0.05
  },
  "channels": ["email", "webhook"],
  "enabled": true
}
```

## 📊 **Step 3: Verify Sample Data**

### **Check Database Content**
The following sample data has been loaded:

**Platform Services:**
- Workflow Engine (ID: 1)
- Webhook Service (ID: 2) 
- System Monitoring (ID: 3)
- Platform Hub (ID: 4)
- Alerts & Notifications (ID: 5)

**Service Instances:**
- Production instances for each service
- Health status: All healthy
- Performance metrics loaded

**Metrics:**
- Execution counts
- Response times
- Success/failure rates
- Health check results

## 🔧 **Step 4: Browser Testing**

### **Using Browser Developer Tools**
1. Open browser developer tools (F12)
2. Go to the Network tab
3. Navigate to the dashboard or any protected page
4. Look for API calls to Platform Services endpoints
5. Check the responses and status codes

### **Using Browser Console**
```javascript
// Test API calls from browser console
fetch('/api/platform/services')
  .then(response => response.json())
  .then(data => console.log('Platform Services:', data));

fetch('/api/platform/hub')
  .then(response => response.json())
  .then(data => console.log('Platform Hub:', data));
```

## 🚨 **Step 5: Error Testing**

### **Test Error Handling**
```bash
# Test with invalid service ID
GET http://localhost:3000/api/platform/hub/connections/999

# Test with malformed request
POST http://localhost:3000/api/platform/hub/connections
Content-Type: application/json
{
  "invalid": "data"
}
```

**Expected Behavior:**
- Proper error responses with status codes
- Error details logged to database
- User-friendly error messages

## 📈 **Step 6: Performance Testing**

### **Load Testing**
```bash
# Test multiple concurrent requests
for i in {1..10}; do
  curl -X GET "http://localhost:3000/api/platform/services" &
done
wait
```

### **Monitor Performance**
- Check response times in browser dev tools
- Monitor database query performance
- Verify indexes are being used effectively

## ✅ **Success Criteria**

### **Authentication**
- ✅ Can sign in successfully
- ✅ Protected routes redirect to sign-in when not authenticated
- ✅ Authenticated requests work properly

### **API Endpoints**
- ✅ All Platform Services endpoints respond correctly
- ✅ CRUD operations work for all services
- ✅ Error handling returns proper status codes
- ✅ Data is properly stored and retrieved

### **Database Integration**
- ✅ Sample data is visible in API responses
- ✅ New data can be created and persisted
- ✅ Relationships between tables work correctly
- ✅ Indexes improve query performance

### **Error Handling**
- ✅ Validation errors return 400 status
- ✅ Not found errors return 404 status
- ✅ Server errors return 500 status
- ✅ Errors are logged to database

## 🎯 **Next Steps After Testing**

1. **Create Real Platform Services** - Use the APIs to create actual services
2. **Set Up Monitoring** - Configure alert rules for your environment
3. **Configure Integrations** - Connect external services through Platform Hub
4. **Deploy to Production** - When ready, deploy the complete system

## 🆘 **Troubleshooting**

### **Common Issues**
- **401 Unauthorized**: Not signed in or session expired
- **500 Internal Server Error**: Check server logs for database connection issues
- **404 Not Found**: Verify the endpoint URL is correct
- **CORS Issues**: Ensure requests are made from the same origin

### **Debug Steps**
1. Check browser console for JavaScript errors
2. Check server logs for backend errors
3. Verify database connectivity
4. Check environment variables are set correctly

---

**Happy Testing! 🚀**
