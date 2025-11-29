# Incident Response API - Quick Start Guide

## ✅ System Status

- ✅ **3 Runbooks** seeded and ready
- ✅ **5 Team Members** configured
- ✅ **2 Drills** scheduled
- ✅ **All API Endpoints** operational

## 🚀 Quick Test Commands

### 1. View Team Members
```bash
GET /api/incident-response/team
```

### 2. View Runbooks
```bash
GET /api/incident-response/runbooks?isActive=true
```

### 3. View Scheduled Drills
```bash
GET /api/incident-response/drills?status=scheduled
```

### 4. Get Metrics
```bash
GET /api/incident-response/metrics
```

### 5. Create Test Incident
```bash
POST /api/incident-response/incidents
Content-Type: application/json

{
  "incidentType": "unauthorized_access",
  "severity": "high",
  "title": "Test Incident - API Verification",
  "description": "Testing the incident response API endpoints",
  "affectedSystems": ["api-server-01"],
  "affectedData": []
}
```

## 📋 Current Configuration

### Runbooks Available
1. **Data Breach Response** (Critical)
2. **Unauthorized Access Response** (High)
3. **System Outage Response** (High)

### Team Structure
- 1x Incident Commander (Primary)
- 1x Technical Lead
- 1x Communications Lead
- 2x Team Members

### Scheduled Drills
- **Q1 2025 Tabletop Exercise** - December 2025
- **Q2 2025 Full-Scale Drill** - February 2026

## 🔗 Full Documentation

- [Complete API Reference](./INCIDENT_RESPONSE_API.md)
- [System Overview](./INCIDENT_RESPONSE.md)
- [Setup Guide](./INCIDENT_RESPONSE_SETUP.md)

---

**Ready for Production Use** ✅

