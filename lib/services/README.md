# Business Services

This directory contains domain-specific business logic and services organized by functional area.

## Directory Structure

### Financial Services (`financial/`)
Billing, expense management, invoicing, payment processing, and financial reconciliation.

### Marketing Services (`marketing/`)
Advertising campaigns, landing pages, lead scoring, proposal management, and marketing analytics.

### Property Services (`property/`)
Real estate management, property ROI tracking, rental income, and tenant management.

### HR Services (`hr/`)
Employee management, time tracking, contractor management, and HR analytics.

### Analytics Services (`analytics/`)
Business intelligence, reporting, data analysis, and performance metrics.

### Communication Services (`communication/`)
CRM communication, webhook handling, and voice chat functionality.

### Platform Services (`platform/`)
Platform integration, workspace management, capacity planning, and resource optimization.

### Content Services (`content/`)
Author management, search functionality, and content analytics.

## Service Types

Each subdirectory contains services that handle:
- **Business logic** for specific domains
- **Data processing** and transformations
- **External integrations** with third-party services
- **Workflow automation** and business rules

## Usage

```typescript
// Import from specific service domains
import { billingService } from '@/lib/services/financial';
import { campaignService } from '@/lib/services/marketing';
import { propertyService } from '@/lib/services/property';

// Use services in your application logic
const invoice = await billingService.createInvoice(orderData);
const campaign = await campaignService.launchCampaign(campaignData);
```
