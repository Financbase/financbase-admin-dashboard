# API Documentation Guide

This guide explains how to view and work with the Financbase Admin Dashboard API documentation.

## 📚 Generated Files

After running `npm run openapi:generate`, the following files are generated:

- **`public/openapi.json`** - OpenAPI 3.0 specification in JSON format
- **`public/openapi.yaml`** - OpenAPI 3.0 specification in YAML format

## 🚀 Viewing Options

### Option 1: Next.js App (Recommended)

The easiest way to view the documentation is through the built-in Swagger UI in the Next.js app:

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Navigate to: **<http://localhost:3000/api-docs>**

This will display an interactive Swagger UI where you can:

- Browse all API endpoints
- Test endpoints directly from the browser
- View request/response schemas
- Authenticate with your Bearer token

### Option 2: Swagger Editor (Online)

1. Go to: **<https://editor.swagger.io/>**
2. Click **File > Import File**
3. Select `public/openapi.json` or `public/openapi.yaml`
4. View and edit the documentation online

### Option 3: Helper Script

Use the provided helper script for an interactive menu:

```bash
./scripts/view-api-docs.sh
```

This script provides options to:

- Open Swagger Editor in your browser
- Start a local Swagger UI server
- Copy the file path to clipboard
- Open the Next.js API docs page

### Option 4: API Clients

Import the OpenAPI specification into your favorite API client:

#### Postman

1. Open Postman
2. Click **Import**
3. Select `public/openapi.json`
4. All endpoints will be imported with their schemas

#### Insomnia

1. Open Insomnia
2. Click **Create > Import from File**
3. Select `public/openapi.json`

#### VS Code REST Client

1. Install the "REST Client" extension
2. The OpenAPI spec can be used to generate requests

## 📝 Adding Documentation

To document a new API endpoint, add Swagger/OpenAPI annotations in your route file:

```typescript
/**
 * @swagger
 * /api/your-endpoint:
 *   get:
 *     summary: Your endpoint summary
 *     description: Detailed description of what this endpoint does
 *     tags:
 *       - YourTag
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: string
 */
export async function GET(request: NextRequest) {
  // Your endpoint implementation
}
```

## 🔄 Regenerating Documentation

Whenever you add or modify API endpoints with Swagger annotations, regenerate the documentation:

```bash
npm run openapi:generate
```

Or use the alias:

```bash
npm run api:docs
```

## 📊 Current Documentation Status

- **Total Endpoints**: 25 API paths documented
- **Total Operations**: 38 operations (GET, POST, PUT, PATCH, DELETE)
- **Coverage**: All major API endpoints are now fully documented including:
  - Authentication endpoints
  - Dashboard & Analytics
  - Financial operations (Invoices, Expenses, Transactions, Bills, Payments, Accounts)
  - Client & Vendor management
  - Projects & Workflows
  - Integrations & Webhooks
  - AI-powered features
  - Reports & Notifications

## 🔐 Authentication

Most endpoints require Bearer token authentication:

1. Get your Clerk session token using `getToken()` from `@clerk/nextjs`
2. Include it in the `Authorization` header:

   ```
   Authorization: Bearer <your-token>
   ```

In Swagger UI, you can click the "Authorize" button at the top and enter your token to test authenticated endpoints.

## 🚀 Quick Start Guide

### 1. View the Documentation

**Option A: Interactive Swagger UI (Recommended)**

```bash
# Start your Next.js dev server
npm run dev

# Then navigate to:
# http://localhost:3000/api-docs
```

**Option B: Helper Script**

```bash
npm run openapi:view
# Choose option 4 to open in Next.js app
```

**Option C: Local Swagger UI Server**

```bash
npm run openapi:view
# Choose option 2 for standalone Swagger UI on port 3001
```

### 2. Test Endpoints in Swagger UI

1. Navigate to `http://localhost:3000/api-docs`
2. Click the **"Authorize"** button (🔒) at the top
3. Enter your Clerk session token:

   ```javascript
   // In your browser console or app:
   const token = await getToken();
   // Copy and paste into the "BearerAuth" field
   ```

4. Click **"Try it out"** on any endpoint
5. Fill in parameters and click **"Execute"**
6. View the response below

### 3. Share with Your Team

**For Postman/Insomnia:**

- Import `public/openapi.json` directly
- All endpoints, schemas, and authentication will be configured automatically

**For API Documentation Site:**

- Use `public/openapi.yaml` with tools like Redoc or Swagger UI
- Deploy to your documentation site

### 4. Keep Documentation Updated

When adding new endpoints:

1. Add `@swagger` annotations above your route handler
2. Run `npm run openapi:generate`
3. The documentation will automatically update

## 🛠️ Troubleshooting

### Documentation not updating?

1. Ensure you've run `npm run openapi:generate`
2. Clear your browser cache (Cmd+Shift+R / Ctrl+Shift+R)
3. Check that Swagger annotations are correctly formatted
4. Verify the static file exists: `ls public/openapi.json`

### Swagger UI not loading?

1. Verify the Next.js dev server is running: `npm run dev`
2. Check browser console for errors
3. Ensure `swagger-ui-react` is installed: `npm install swagger-ui-react`
4. Try accessing `/api/docs` directly to see the raw JSON

### Missing endpoints?

- Add `@swagger` annotations to your route files
- Run `npm run openapi:generate` again
- Check that your route files are in `app/api/**/*.ts`
- Verify annotations are placed directly above the function export

### Authentication not working in Swagger UI?

1. Get your token from Clerk: `await getToken()` in your app
2. Click "Authorize" in Swagger UI
3. Enter: `Bearer <your-token>` or just `<your-token>`
4. Click "Authorize" and "Close"
5. All authenticated requests will now include the token

## 📖 Additional Resources

- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [Swagger Editor](https://editor.swagger.io/)
