# API Test Coverage Gap Analysis

**Generated:** 2025-11-30T01:57:27.330Z

## Summary

- **Total Routes:** 407
- **Tested Routes:** 86
- **Untested Routes:** 321
- **Coverage:** 21.1%
- **Total Operations:** 641
- **Tested Operations:** 130

## Coverage by Category

| Category | Total | Tested | Untested | Coverage |
|----------|-------|--------|----------|----------|
| financial | 32 | 18 | 14 | 56.3% |
| admin | 66 | 10 | 56 | 15.2% |
| analytics | 39 | 8 | 31 | 20.5% |
| ai | 36 | 2 | 34 | 5.6% |
| core | 33 | 11 | 22 | 33.3% |
| other | 167 | 23 | 144 | 13.8% |
| integrations | 34 | 14 | 20 | 41.2% |

## Coverage by Priority

| Priority | Total | Tested | Untested | Coverage |
|----------|-------|--------|----------|----------|
| high | 65 | 29 | 36 | 44.6% |
| low | 269 | 35 | 234 | 13.0% |
| medium | 73 | 22 | 51 | 30.1% |

## Untested Routes (321)

### High Priority (36)

| Route | Category | Methods | Expected Test File |
|-------|----------|---------|-------------------|
| `/accounts/{id}` | {id} | GET, PUT, DELETE | `accounts-{id}-api.test.ts` |
| `/accounts` | root | GET, POST | `accounts-api.test.ts` |
| `/budgets/{id}` | {id} | GET, PATCH, DELETE | `budgets-{id}-api.test.ts` |
| `/clients/{id}` | {id} | GET, PUT, DELETE | `clients-{id}-api.test.ts` |
| `/compliance/baa/vendors` | baa | GET, POST | `compliance-baa-vendors-api.test.ts` |
| `/dashboard/top-products` | top-products | GET | `dashboard-top-products-api.test.ts` |
| `/expenses/{id}/approve` | {id} | POST | `expenses-{id}-approve-api.test.ts` |
| `/expenses/{id}/reject` | {id} | POST | `expenses-{id}-reject-api.test.ts` |
| `/expenses/{id}` | {id} | GET, PUT, DELETE | `expenses-{id}-api.test.ts` |
| `/expenses/categories` | categories | GET, POST | `expenses-categories-api.test.ts` |
| `/expenses` | root | GET, POST | `expenses-api.test.ts` |
| `/orders/{id}/fulfill` | {id} | POST | `orders-{id}-fulfill-api.test.ts` |
| `/orders/{id}` | {id} | GET, PATCH | `orders-{id}-api.test.ts` |
| `/orders` | root | GET, POST | `orders-api.test.ts` |
| `/products/{id}` | {id} | GET, PATCH, DELETE | `products-{id}-api.test.ts` |
| `/products/{id}/stock` | {id} | PATCH | `products-{id}-stock-api.test.ts` |
| `/products/categories` | categories | GET, POST | `products-categories-api.test.ts` |
| `/products` | root | GET, POST | `products-api.test.ts` |
| `/projects/{id}` | {id} | GET, PUT | `projects-{id}-api.test.ts` |
| `/projects` | root | GET, POST | `projects-api.test.ts` |
| `/real-estate/investor/expenses` | investor | GET | `real-estate-investor-expenses-api.test.ts` |
| `/reconciliation/match` | match | GET, POST | `reconciliation-match-api.test.ts` |
| `/reconciliation/rules` | rules | GET, POST | `reconciliation-rules-api.test.ts` |
| `/reconciliation/sessions` | sessions | GET, POST | `reconciliation-sessions-api.test.ts` |
| `/reconciliation/statement-transactions/{sessionId}` | statement-transactions | GET | `reconciliation-statement-transactions-{sessionId}-api.test.ts` |
| `/transactions/{id}` | {id} | GET, PUT, DELETE | `transactions-{id}-api.test.ts` |
| `/workflows/{id}/duplicate` | {id} | POST | `workflows-{id}-duplicate-api.test.ts` |
| `/workflows/{id}/execute` | {id} | POST | `workflows-{id}-execute-api.test.ts` |
| `/workflows/{id}/executions` | {id} | GET | `workflows-{id}-executions-api.test.ts` |
| `/workflows/{id}/logs` | {id} | GET | `workflows-{id}-logs-api.test.ts` |
| `/workflows/{id}` | {id} | GET, PUT, DELETE | `workflows-{id}-api.test.ts` |
| `/workflows/{id}/test` | {id} | POST | `workflows-{id}-test-api.test.ts` |
| `/workflows/executions/{id}/rerun` | executions | POST | `workflows-executions-{id}-rerun-api.test.ts` |
| `/workflows/templates/{id}/instantiate` | templates | POST | `workflows-templates-{id}-instantiate-api.test.ts` |
| `/workflows/templates` | templates | GET, POST | `workflows-templates-api.test.ts` |
| `/workflows/triggers` | triggers | GET | `workflows-triggers-api.test.ts` |

### Medium Priority (51)

| Route | Category | Methods | Expected Test File |
|-------|----------|---------|-------------------|
| `/admin/seed-dashboard` | seed-dashboard | GET, POST | `admin-seed-dashboard-api.test.ts` |
| `/analytics/performance` | performance | GET | `analytics-performance-api.test.ts` |
| `/analytics` | root | GET | `analytics-api.test.ts` |
| `/campaigns/performance` | performance | GET | `campaigns-performance-api.test.ts` |
| `/compliance/monitoring/siem/integrations` | monitoring | GET, POST | `compliance-monitoring-siem-integrations-api.test.ts` |
| `/compliance/reports/{id}` | reports | GET | `compliance-reports-{id}-api.test.ts` |
| `/compliance/reports/dashboard` | reports | GET | `compliance-reports-dashboard-api.test.ts` |
| `/compliance/reports` | reports | GET, POST | `compliance-reports-api.test.ts` |
| `/dashboard/ai-insights` | ai-insights | GET | `dashboard-ai-insights-api.test.ts` |
| `/dashboard/chart-data` | chart-data | GET | `dashboard-chart-data-api.test.ts` |
| `/dashboard/executive-metrics` | executive-metrics | GET | `dashboard-executive-metrics-api.test.ts` |
| `/dashboard/overview` | overview | GET | `dashboard-overview-api.test.ts` |
| `/dashboard/recent-activity` | recent-activity | GET | `dashboard-recent-activity-api.test.ts` |
| `/dashboards/{id}` | {id} | GET, PATCH, DELETE | `dashboards-{id}-api.test.ts` |
| `/dashboards` | root | GET, POST | `dashboards-api.test.ts` |
| `/dashboards/widgets/templates` | widgets | GET | `dashboards-widgets-templates-api.test.ts` |
| `/hr/contractors/{id}/performance` | contractors | GET | `hr-contractors-{id}-performance-api.test.ts` |
| `/integrations/{id}` | {id} | GET | `integrations-{id}-api.test.ts` |
| `/integrations/oauth/{service}/authorize` | oauth | GET | `integrations-oauth-{service}-authorize-api.test.ts` |
| `/integrations/oauth/{service}/callback` | oauth | GET | `integrations-oauth-{service}-callback-api.test.ts` |
| `/integrations/oauth/{service}/refresh` | oauth | POST | `integrations-oauth-{service}-refresh-api.test.ts` |
| `/integrations/providers` | providers | GET | `integrations-providers-api.test.ts` |
| `/marketplace/plugins/{id}/approve` | plugins | POST | `marketplace-plugins-{id}-approve-api.test.ts` |
| `/marketplace/plugins/{id}/install` | plugins | POST | `marketplace-plugins-{id}-install-api.test.ts` |
| `/marketplace/plugins/{id}/reject` | plugins | POST | `marketplace-plugins-{id}-reject-api.test.ts` |
| `/marketplace/plugins/{id}` | plugins | GET | `marketplace-plugins-{id}-api.test.ts` |
| `/marketplace/plugins/{id}/uninstall` | plugins | DELETE | `marketplace-plugins-{id}-uninstall-api.test.ts` |
| `/marketplace/plugins/installed` | plugins | GET | `marketplace-plugins-installed-api.test.ts` |
| `/marketplace/plugins/my-plugins` | plugins | GET | `marketplace-plugins-my-plugins-api.test.ts` |
| `/marketplace/plugins/pending` | plugins | GET | `marketplace-plugins-pending-api.test.ts` |
| `/marketplace/plugins` | plugins | GET | `marketplace-plugins-api.test.ts` |
| `/marketplace/plugins/submit` | plugins | POST | `marketplace-plugins-submit-api.test.ts` |
| `/performance/database-size` | database-size | GET | `performance-database-size-api.test.ts` |
| `/performance/health` | health | GET | `performance-health-api.test.ts` |
| `/performance/slow-queries` | slow-queries | GET | `performance-slow-queries-api.test.ts` |
| `/reports/{id}` | {id} | GET, PUT, DELETE | `reports-{id}-api.test.ts` |
| `/reports/{id}/run` | {id} | POST | `reports-{id}-run-api.test.ts` |
| `/reports` | root | GET, POST, PATCH, DELETE | `reports-api.test.ts` |
| `/reports/templates` | templates | GET, POST | `reports-templates-api.test.ts` |
| `/test-dashboard/ai-insights` | ai-insights | GET | `test-dashboard-ai-insights-api.test.ts` |
| `/test-dashboard/overview` | overview | GET | `test-dashboard-overview-api.test.ts` |
| `/test-dashboard/recent-activity` | recent-activity | GET | `test-dashboard-recent-activity-api.test.ts` |
| `/test-dashboard-activity` | root | GET | `test-dashboard-activity-api.test.ts` |
| `/test-dashboard-insights` | root | GET | `test-dashboard-insights-api.test.ts` |
| `/test-dashboard-overview` | root | GET | `test-dashboard-overview-api.test.ts` |
| `/unified-dashboard/metrics` | metrics | GET | `unified-dashboard-metrics-api.test.ts` |
| `/unified-dashboard/widgets` | widgets | GET | `unified-dashboard-widgets-api.test.ts` |
| `/webhooks/{id}/deliveries` | {id} | GET | `webhooks-{id}-deliveries-api.test.ts` |
| `/webhooks/{id}/retry` | {id} | POST | `webhooks-{id}-retry-api.test.ts` |
| `/webhooks/{id}` | {id} | GET, PUT, DELETE | `webhooks-{id}-api.test.ts` |

*... and 1 more medium priority routes*

### Low Priority (234)

*234 low priority routes need tests*

