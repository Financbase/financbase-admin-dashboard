# API Performance Audit

**Generated:** 2025-11-29T10:46:51.074Z

## Summary

- **Total Routes:** 407
- **High Risk Routes:** 29
- **Medium Risk Routes:** 62
- **Low Risk Routes:** 316
- **Routes with Pagination:** 142
- **Routes with Caching:** 1
- **Routes with Database Queries:** 100
- **Routes with Complex Queries:** 70

## Performance Risk by Category

| Category | Total | High Risk | Medium Risk | With Pagination | With Caching |
|----------|-------|-----------|-------------|-----------------|--------------|
| financial | 32 | 4 | 7 | 11 | 0 |
| admin | 66 | 10 | 4 | 18 | 0 |
| analytics | 39 | 2 | 6 | 11 | 0 |
| ai | 36 | 0 | 1 | 8 | 0 |
| core | 33 | 3 | 2 | 10 | 0 |
| other | 167 | 9 | 36 | 67 | 1 |
| integrations | 34 | 1 | 6 | 17 | 0 |

## High Risk Routes (29)

These routes may have performance issues and should be prioritized for optimization:

| Route | Category | Methods | Issues |
|-------|----------|---------|--------|
| `/admin/careers` | careers | GET, POST | Missing pagination, No caching, Complex queries |
| `/admin/feature-flags/{key}` | feature-flags | GET, PATCH, DELETE | Missing pagination, No caching |
| `/admin/users` | users | GET | Missing pagination, No caching |
| `/analytics` | root | GET | Missing pagination, No caching, Complex queries |
| `/careers` | root | GET | Missing pagination, No caching |
| `/clients/{id}` | {id} | GET, PUT, DELETE | Missing pagination, No caching |
| `/compliance/incident-response/communication-templates` | incident-response | GET, POST | Missing pagination, No caching |
| `/customers/{id}` | {id} | GET, PATCH, DELETE | Missing pagination, No caching |
| `/employees/{id}` | {id} | GET, PATCH, DELETE | Missing pagination, No caching |
| `/expenses/{id}` | {id} | GET, PUT, DELETE | Missing pagination, No caching |
| `/gallery/{id}` | {id} | GET, PATCH, DELETE | Missing pagination, No caching |
| `/hr/contractors/{id}` | contractors | GET, PATCH, DELETE | Missing pagination, No caching |
| `/hr/payroll/benefits` | payroll | GET, POST | Missing pagination, No caching |
| `/hr/payroll/deductions` | payroll | GET, POST | Missing pagination, No caching |
| `/hr/payroll/taxes` | payroll | GET, POST | Missing pagination, No caching |
| `/marketplace/stats` | stats | GET | Missing pagination, No caching, Complex queries |
| `/orders/{id}` | {id} | GET, PATCH | Missing pagination, No caching |
| `/products/{id}` | {id} | GET, PATCH, DELETE | Missing pagination, No caching |
| `/real-estate/buyer/stats` | buyer | GET | Missing pagination, No caching, Complex queries |
| `/real-estate/investor/cash-flow` | investor | GET | Missing pagination, No caching, Complex queries |
| `/real-estate/realtor/stats` | realtor | GET | Missing pagination, No caching, Complex queries |
| `/real-estate/stats` | stats | GET | Missing pagination, No caching, Complex queries |
| `/reconciliation/match` | match | GET, POST | Missing pagination, No caching |
| `/reconciliation/sessions` | sessions | GET, POST | Missing pagination, No caching |
| `/reports/{id}` | {id} | GET, PUT, DELETE | Missing pagination, No caching |
| `/settings/billing/payment-methods` | billing | GET, POST | Missing pagination, No caching |
| `/settings/notifications` | notifications | GET, PUT | Missing pagination, No caching |
| `/tax/direct-file/exports` | direct-file | GET, POST | Missing pagination, No caching |
| `/transactions/{id}` | {id} | GET, PUT, DELETE | Missing pagination, No caching |

## Medium Risk Routes (62)

These routes should be monitored and may benefit from optimization:

| Route | Category | Methods | Recommendations |
|-------|----------|---------|-----------------|
| `/accounts/{id}` | {id} | GET, PUT, DELETE | Consider caching |
| `/accounts/reconcile` | reconcile | GET, POST | Consider caching |
| `/accounts` | root | GET, POST | Consider caching |
| `/admin/careers/{id}` | careers | GET, PUT, DELETE | Consider caching |
| `/admin/subscription-rbac-mappings` | subscription-rbac-mappings | GET, POST, PUT, DELETE | Consider caching |
| `/analytics/upload` | upload | GET | Consider caching |
| `/auth/validate-token` | validate-token | GET, POST | Consider caching |
| `/blog/{id}/like` | {id} | POST | Consider caching |
| `/blog/{id}` | {id} | GET, PUT, DELETE | Consider caching |
| `/clients` | root | GET, POST | Consider caching |
| `/compliance/gdpr/data-subject-requests` | gdpr | GET, POST | Consider caching |
| `/contact` | root | POST | Consider caching |
| `/dashboard/ai-insights` | ai-insights | GET | Consider caching |
| `/dashboard/executive-metrics` | executive-metrics | GET | Consider caching |
| `/dashboard/export` | export | GET | Consider caching |
| `/dashboard/top-products` | top-products | GET | Consider caching |
| `/developer/api-keys/{id}` | api-keys | GET, POST, PATCH, DELETE | Consider caching |
| `/developer/endpoints` | endpoints | GET, POST, PUT, PATCH, DELETE | Consider caching |
| `/developer` | root | GET, POST, PUT, PATCH | Consider caching |
| `/direct-file/{...path}` | {...path} | GET, POST, PUT, PATCH, DELETE | Consider caching |

*... and 42 more medium risk routes*

## Recommendations

1. **Add Pagination**: 29 GET routes with database queries are missing pagination
2. **Implement Caching**: 69 routes with complex queries could benefit from caching
3. **Optimize Queries**: Review complex queries for N+1 problems and missing indexes
4. **Load Testing**: Run load tests on high-risk routes to identify bottlenecks
