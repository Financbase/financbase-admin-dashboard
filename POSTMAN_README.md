# 🚀 Financbase Postman Collection

Complete Postman collection for testing the Financbase API endpoints, including AI services, financial management, OCR processing, and real-time collaboration features.

## 📁 Files Included

- **`Financbase_API_Collection.postman_collection.json`** - Main API collection with all endpoints
- **`Financbase_Environment.postman_environment.json`** - Environment variables for easy configuration

## 🛠️ Setup Instructions

### 1. Import into Postman

1. **Open Postman** (Desktop or Web version)
2. **Import Collection**:
   - Click "Import" button
   - Select "File"
   - Choose `Financbase_API_Collection.postman_collection.json`
3. **Import Environment**:
   - Click "Import" button again
   - Choose `Financbase_Environment.postman_environment.json`
   - Select the environment in the top-right dropdown

### 2. Configure Authentication

#### Get Clerk Session Token

1. **Login to Financbase** in your browser
2. **Open Developer Tools** (F12)
3. **Go to Application/Storage** tab
4. **Find Cookies/Local Storage** for your domain (localhost:3000)
5. **Copy the Clerk session token** (usually starts with `__session=`)
6. **Set Environment Variable**:
   - In Postman, click on "Environments" in the left sidebar
   - Select "Financbase Environment"
   - Set `clerk_session_token` to your token value

### 3. Test Connection

1. **Run Health Check**:
   - Expand "Health Check" folder
   - Click "System Health" request
   - Click "Send"
   - Should return system status

## 📚 API Endpoints Overview

### 🔍 **Health Check**

- **System Health**: Check API availability and service status

### 🤖 **AI Services**

- **Financial Analysis**: Get AI-powered financial insights
- **Transaction Categorization**: Auto-categorize transactions with AI

### 🔎 **Search Services**

- **Universal Search**: Search across all financial data
- **Search Suggestions**: Get autocomplete suggestions

### 📁 **File Upload**

- **Upload File**: Upload documents using UploadThing service

### 📧 **Email Services**

- **Send Invoice Email**: Send professional invoice emails

### 💰 **Bills Management**

- **Get Bills**: Retrieve bills with filtering options
- **Create Bill**: Create new bills and invoices

### 🏢 **Vendors Management**

- **Get Vendors**: List vendors with filtering
- **Create Vendor**: Add new vendor relationships

### ✅ **Approval Workflows**

- **Get Approval Workflows**: List approval processes
- **Create Approval Workflow**: Set up approval chains
- **Process Approval Decision**: Approve or reject requests

### 📄 **OCR Processing**

- **Process Document**: AI-powered document processing (PDF, images)

### 💳 **Payment Processing**

- **Schedule Payment**: Schedule future payments
- **Process Payment**: Execute immediate payments

### 👥 **Real-time Collaboration**

- **Connect to Workspace**: WebSocket for real-time features

## 🔑 Authentication Setup

All API endpoints (except health check) require Bearer token authentication:

```
Authorization: Bearer <clerk_session_token>
```

### How to Get Token

1. **Login to Financbase** web application
2. **Open Browser Dev Tools** (F12 → Application tab)
3. **Copy session cookie** or use this JavaScript in console:

   ```javascript
   // In browser console on Financbase site:
   document.cookie.split(';').find(c => c.includes('__session'))
   ```

4. **Set in Postman environment** as `clerk_session_token`

## 📝 Usage Examples

### 1. Create a Vendor

```bash
# Request
POST {{baseUrl}}/vendors
Authorization: Bearer {{clerk_session_token}}
Content-Type: application/json

{
  "name": "Acme Software Inc.",
  "email": "billing@acmesoft.com",
  "phone": "+1-555-0123",
  "address": {
    "street": "123 Tech Street",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94105",
    "country": "USA"
  },
  "taxId": "12-3456789",
  "paymentTerms": 30,
  "category": "software"
}
```

### 2. Upload Document for OCR

```bash
# Request
POST {{baseUrl}}/bills/process-document
Authorization: Bearer {{clerk_session_token}}
Content-Type: multipart/form-data

file: [PDF or image file]
documentType: "invoice"
```

### 3. Get Financial Analysis

```bash
curl -X POST http://localhost:3010/api/ai/financial-analysis \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{
    "revenue": [45000, 52000, 48000, 55000],
    "expenses": [32000, 35000, 31000, 36000],
    "transactions": [],
    "budget": {
      "total": 60000,
      "categories": [
        {"name": "Marketing", "budgeted": 15000, "spent": 12000},
        {"name": "Operations", "budgeted": 25000, "spent": 22000}
      ]
    }
  }'
```

### Search Example

```bash
curl "http://localhost:3010/api/search?q=office%20supplies&index=invoices&page=0&hitsPerPage=10"
```

### File Upload Example

```bash
curl -X POST http://localhost:3010/api/uploadthing \\
  -F "file=@invoice.pdf" \\
  -H "Authorization: Bearer <token>"
```

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `baseUrl` | API base URL | `http://localhost:3010/api` |
| `productionUrl` | Production API URL | `https://financbase.com/api/v1` |
| `clerk_session_token` | Authentication token | `eyJ...` |
| `workspace_id` | Workspace for collaboration | `ws_123` |
| `user_id` | User ID for requests | `user_456` |

## 🚨 Common Issues

### 401 Unauthorized

- Check if `clerk_session_token` is set correctly
- Ensure you're logged in to Financbase in browser
- Token might have expired - refresh and get new token

### 404 Not Found

- Verify `baseUrl` is correct (localhost:3000 for development)
- Check if endpoint path is correct

### 429 Too Many Requests

- API has rate limiting (100 req/min general, 50 req/min uploads)
- Wait a minute before retrying

### CORS Issues

- Ensure requests are coming from allowed origins
- Check if you're running the API locally

## 📊 Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

### Error Response

```json
{
  "success": false,
  "data": null,
  "error": "Error message"
}
```

## 🔄 Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| General API | 100 requests | per minute |
| Authentication | 10 requests | per minute |
| File uploads | 50 requests | per minute |
| WebSocket messages | 1000 messages | per minute |

## 🧪 Testing Workflow

1. **Start with Health Check** to verify API connectivity
2. **Test AI services** with sample financial data
3. **Create test vendor** for bill management
4. **Upload sample document** for OCR testing
5. **Test search functionality** with various queries
6. **Set up approval workflows** for business processes
7. **Test real-time collaboration** features

## 📞 Support

For API issues:

- Check the [API Documentation](../../docs/api/)
- Review [GitHub Issues](https://github.com/your-org/financbase-admin-dashboard/issues)
- Contact <support@financbase.com>

---

**Happy Testing! 🎉**

This Postman collection provides comprehensive coverage of all Financbase API features. Start with the health check and work your way through the different services to understand the full capabilities of the platform.
