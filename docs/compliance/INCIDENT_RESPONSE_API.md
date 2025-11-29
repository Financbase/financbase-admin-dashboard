# Incident Response System - API Reference

## Base URL
All endpoints are prefixed with `/api/incident-response`

## Authentication
All endpoints require Clerk authentication. Include the session token in your requests.

---

## 🔴 Incidents

### Create Incident
**POST** `/api/incident-response/incidents`

Create a new security incident.

**Request Body:**
```json
{
  "incidentType": "data_breach",
  "severity": "critical",
  "title": "Unauthorized Database Access Detected",
  "description": "Multiple failed authentication attempts followed by successful database access",
  "detectedAt": "2025-01-15T10:30:00Z",
  "affectedSystems": ["database-01", "api-server-02"],
  "affectedData": ["customer_pii", "payment_data"],
  "tags": ["data_breach", "unauthorized_access"],
  "metadata": {
    "source": "siem_alert",
    "alertId": "ALERT-2025-001"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "incidentNumber": "IR-2025-0115-001",
    "status": "detected",
    "assignedTo": "user-id",
    ...
  },
  "requestId": "req-xxx"
}
```

**Incident Types:**
- `security_breach`
- `data_breach`
- `malware`
- `phishing`
- `ddos`
- `unauthorized_access`
- `system_outage`
- `data_loss`
- `service_degradation`
- `compliance_violation`
- `other`

**Severity Levels:**
- `low`
- `medium`
- `high`
- `critical`

---

### List Incidents
**GET** `/api/incident-response/incidents`

Retrieve incidents with optional filters.

**Query Parameters:**
- `status` - Filter by status (detected, analyzing, contained, eradicated, recovered, post_incident_review, closed)
- `severity` - Filter by severity (low, medium, high, critical)
- `incidentType` - Filter by incident type
- `assignedTo` - Filter by assigned user ID
- `dateFrom` - Filter incidents from date (ISO 8601)
- `dateTo` - Filter incidents to date (ISO 8601)
- `limit` - Limit results (default: 100)
- `offset` - Pagination offset

**Example:**
```
GET /api/incident-response/incidents?status=detected&severity=critical&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "incidentNumber": "IR-2025-0115-001",
      "title": "Unauthorized Database Access",
      "status": "analyzing",
      "severity": "critical",
      ...
    }
  ],
  "requestId": "req-xxx"
}
```

---

### Get Incident
**GET** `/api/incident-response/incidents/[id]`

Get details of a specific incident.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "incidentNumber": "IR-2025-0115-001",
    "title": "Unauthorized Database Access",
    "description": "...",
    "status": "analyzing",
    "severity": "critical",
    "detectedAt": "2025-01-15T10:30:00Z",
    "analyzedAt": "2025-01-15T10:35:00Z",
    "affectedSystems": ["database-01"],
    "containmentActions": [],
    "rootCause": null,
    ...
  },
  "requestId": "req-xxx"
}
```

---

### Update Incident
**PATCH** `/api/incident-response/incidents/[id]`

Update incident status and details.

**Request Body:**
```json
{
  "status": "contained",
  "assignedTo": "user-id",
  "incidentCoordinator": "user-id",
  "containmentActions": [
    {
      "action": "Isolated affected database",
      "timestamp": "2025-01-15T11:00:00Z",
      "performedBy": "user-id"
    }
  ],
  "rootCause": "Compromised API key",
  "forensicAnalysis": "Analysis shows API key was exposed in public repository"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "contained",
    "containedAt": "2025-01-15T11:00:00Z",
    ...
  },
  "requestId": "req-xxx"
}
```

---

## 👥 Team Management

### Add Team Member
**POST** `/api/incident-response/team`

Add a user to the IR team.

**Request Body:**
```json
{
  "userId": "user-id",
  "role": "incident_commander",
  "isPrimary": true,
  "isOnCall": true,
  "contactInfo": {
    "email": "commander@example.com",
    "phone": "+1-555-0100",
    "slack": "@commander"
  },
  "expertise": ["incident_response", "forensics"],
  "certifications": ["CISSP", "GCIH"]
}
```

**Roles:**
- `incident_commander`
- `technical_lead`
- `communications_lead`
- `legal_lead`
- `executive_sponsor`
- `team_member`
- `observer`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": "user-id",
    "role": "incident_commander",
    "isPrimary": true,
    ...
  },
  "requestId": "req-xxx"
}
```

---

### List Team Members
**GET** `/api/incident-response/team`

Get IR team members.

**Query Parameters:**
- `role` - Filter by role
- `isActive` - Filter by active status (true/false)
- `isOnCall` - Filter by on-call status (true/false)

**Example:**
```
GET /api/incident-response/team?role=incident_commander&isActive=true
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": "user-id",
      "role": "incident_commander",
      "isPrimary": true,
      "contactInfo": {...},
      "certifications": ["CISSP"],
      ...
    }
  ],
  "requestId": "req-xxx"
}
```

---

## 📋 Runbooks

### Create Runbook
**POST** `/api/incident-response/runbooks`

Create a new incident response runbook.

**Request Body:**
```json
{
  "name": "Phishing Attack Response",
  "description": "Procedures for responding to phishing attacks",
  "incidentType": "phishing",
  "severity": "high",
  "detectionProcedures": [
    "Monitor email security alerts",
    "Review suspicious email reports"
  ],
  "triageProcedures": [
    "Identify affected users",
    "Assess scope of compromise"
  ],
  "containmentProcedures": [
    "Disable compromised accounts",
    "Block malicious email domains"
  ],
  "eradicationProcedures": [
    "Remove malicious emails",
    "Update email filters"
  ],
  "recoveryProcedures": [
    "Reset affected passwords",
    "Restore email access"
  ],
  "communicationTemplates": {
    "internal": {
      "subject": "Phishing Incident Detected",
      "body": "A phishing attack has been detected..."
    }
  },
  "escalationCriteria": [
    {
      "condition": "affectedUsers > 50",
      "action": "Escalate to executive sponsor"
    }
  ],
  "tools": ["Email security platform", "SIEM"],
  "references": ["Phishing response policy"],
  "tags": ["phishing", "email_security"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Phishing Attack Response",
    "status": "draft",
    "version": 1,
    ...
  },
  "requestId": "req-xxx"
}
```

---

### List Runbooks
**GET** `/api/incident-response/runbooks`

Get available runbooks.

**Query Parameters:**
- `incidentType` - Filter by incident type
- `severity` - Filter by severity
- `isActive` - Filter by active status (true/false)

**Example:**
```
GET /api/incident-response/runbooks?incidentType=data_breach&isActive=true
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Data Breach Response",
      "incidentType": "data_breach",
      "severity": "critical",
      "status": "active",
      ...
    }
  ],
  "requestId": "req-xxx"
}
```

---

## 🎯 Drills

### Schedule Drill
**POST** `/api/incident-response/drills`

Schedule an incident response drill.

**Request Body:**
```json
{
  "drillName": "Q1 2025 Tabletop Exercise",
  "drillType": "tabletop",
  "scenario": "Simulated data breach affecting 10,000 customer records",
  "objectives": [
    "Test incident detection procedures",
    "Practice communication protocols",
    "Validate regulatory reporting"
  ],
  "scheduledDate": "2025-02-01T10:00:00Z",
  "participants": ["user-id-1", "user-id-2", "user-id-3"],
  "observers": ["user-id-4"],
  "tags": ["tabletop", "data_breach", "q1_2025"]
}
```

**Drill Types:**
- `tabletop`
- `simulation`
- `full_scale`
- `red_team`
- `blue_team`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "drillName": "Q1 2025 Tabletop Exercise",
    "status": "scheduled",
    "scheduledDate": "2025-02-01T10:00:00Z",
    ...
  },
  "requestId": "req-xxx"
}
```

---

### List Drills
**GET** `/api/incident-response/drills`

Get scheduled and completed drills.

**Query Parameters:**
- `status` - Filter by status (scheduled, in_progress, completed, cancelled)
- `drillType` - Filter by drill type
- `dateFrom` - Filter drills from date (ISO 8601)
- `dateTo` - Filter drills to date (ISO 8601)

**Example:**
```
GET /api/incident-response/drills?status=scheduled&drillType=tabletop
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "drillName": "Q1 2025 Tabletop Exercise",
      "drillType": "tabletop",
      "status": "scheduled",
      "scheduledDate": "2025-02-01T10:00:00Z",
      ...
    }
  ],
  "requestId": "req-xxx"
}
```

---

### Complete Drill
**POST** `/api/incident-response/drills/[id]/complete`

Mark a drill as completed and record results.

**Request Body:**
```json
{
  "findings": [
    "Communication protocols worked well",
    "Response time was within target"
  ],
  "strengths": [
    "Team coordination was excellent",
    "Runbooks were followed correctly"
  ],
  "weaknesses": [
    "Initial triage took longer than expected",
    "Regulatory reporting process needs improvement"
  ],
  "recommendations": [
    "Update triage procedures",
    "Create regulatory reporting checklist"
  ],
  "actionItems": [
    {
      "item": "Update triage procedures",
      "assignedTo": "user-id",
      "dueDate": "2025-02-15"
    }
  ],
  "responseTime": 15,
  "containmentTime": 30,
  "recoveryTime": 45,
  "score": 85,
  "lessonsLearned": "Overall drill was successful with minor improvements needed",
  "reportUrl": "https://docs.example.com/drills/q1-2025-report.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Drill completed successfully",
  "requestId": "req-xxx"
}
```

---

## 📊 Metrics

### Get Metrics
**GET** `/api/incident-response/metrics`

Get incident response metrics and statistics.

**Query Parameters:**
- `dateFrom` - Start date for metrics (ISO 8601)
- `dateTo` - End date for metrics (ISO 8601)

**Example:**
```
GET /api/incident-response/metrics?dateFrom=2025-01-01&dateTo=2025-01-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalIncidents": 15,
    "byStatus": {
      "detected": 2,
      "analyzing": 1,
      "contained": 3,
      "closed": 9
    },
    "bySeverity": {
      "low": 5,
      "medium": 6,
      "high": 3,
      "critical": 1
    },
    "byType": {
      "unauthorized_access": 8,
      "data_breach": 2,
      "system_outage": 5
    },
    "avgResolutionTime": 4.5,
    "openIncidents": 6,
    "criticalIncidents": 1
  },
  "requestId": "req-xxx"
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "requestId": "req-xxx"
  }
}
```

**Error Codes:**
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `BAD_REQUEST` - Invalid request data
- `INTERNAL_ERROR` - Server error

---

## Example Usage

### Complete Incident Lifecycle

1. **Create Incident:**
```bash
POST /api/incident-response/incidents
{
  "incidentType": "data_breach",
  "severity": "critical",
  "title": "Database Breach Detected",
  "description": "..."
}
```

2. **Update to Analyzing:**
```bash
PATCH /api/incident-response/incidents/1
{
  "status": "analyzing"
}
```

3. **Contain Incident:**
```bash
PATCH /api/incident-response/incidents/1
{
  "status": "contained",
  "containmentActions": [...]
}
```

4. **Eradicate Threat:**
```bash
PATCH /api/incident-response/incidents/1
{
  "status": "eradicated",
  "eradicationActions": [...],
  "rootCause": "..."
}
```

5. **Recover Systems:**
```bash
PATCH /api/incident-response/incidents/1
{
  "status": "recovered",
  "recoveryActions": [...]
}
```

6. **Close Incident:**
```bash
PATCH /api/incident-response/incidents/1
{
  "status": "closed"
}
```

---

## Testing

You can test the endpoints using:

- **cURL:**
```bash
curl -X GET https://your-domain.com/api/incident-response/incidents \
  -H "Authorization: Bearer YOUR_TOKEN"
```

- **Postman/Insomnia:**
Import the endpoints and configure authentication

- **Frontend:**
Use the API routes in your React components with `fetch` or your HTTP client

---

**Last Updated:** January 2025  
**API Version:** 1.0

