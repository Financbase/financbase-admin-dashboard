# IRS Direct File Backend Setup Guide

## Overview

This guide covers setting up the IRS Direct File backend services required for full functionality. The Direct File application consists of multiple Java Spring Boot services that need to be configured and running.

## Prerequisites

- Java 21 (OpenJDK)
- Maven 3.8+
- Docker and Docker Compose
- PostgreSQL database
- Scala and SBT (for fact graph compilation)
- Coursier (for dependency management)

## Backend Services

The Direct File system consists of the following services:

### 1. Backend API (`/direct-file/backend`)
- Main API service
- Handles authentication, user data, tax return storage
- Port: 8080
- Database: Direct File database

### 2. State API (`/direct-file/state-api`)
- State tax filing handoff API
- Transfers federal return data to state tax software
- Port: 8081
- Database: State API database

### 3. Email Service (`/direct-file/email-service`)
- SMTP relay for email notifications
- Sends emails on various system events
- Port: 8082

### 4. Submit Service (`/direct-file/submit`)
- Submits tax returns to MeF (Modernized e-File)
- Reads from dispatch queue
- Requires MeF credentials (EFIN, ETIN, ASID)

### 5. Status Service (`/direct-file/status`)
- Polls MeF for tax return acknowledgements
- Updates return status
- Requires MeF credentials

## Setup Steps

### 1. Environment Variables

Create a `.env.local` file in the `direct-file` directory with the following variables:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/directfile
STATE_API_DATABASE_URL=postgresql://user:password@localhost:5432/stateapi

# MeF Configuration (for submit/status services)
MEF_REPO=~
INSTALL_MEF=0
LOCAL_WRAPPING_KEY="<generated-key>"
MEF_SOFTWARE_ID="<mef-software-id>"
MEF_SOFTWARE_VERSION_NUM="2024.0.1"
STATUS_ASID="<status-asid>"
STATUS_EFIN="<status-efin>"
STATUS_ETIN="<status-etin>"
SUBMIT_ASID=$STATUS_ASID
SUBMIT_EFIN=$STATUS_EFIN
SUBMIT_ETIN=$STATUS_ETIN

# Validation (set to false for local development)
DF_TIN_VALIDATION_ENABLED=false
DF_EMAIL_VALIDATION_ENABLED=false

# Keystore (for MeF communication)
STATUS_KEYSTOREALIAS="<keystore-alias>"
STATUS_KEYSTOREBASE64="<base64-encoded-keystore>"
STATUS_KEYSTOREPASSWORD="<keystore-password>"
SUBMIT_KEYSTORE_KEYSTOREALIAS=$STATUS_KEYSTOREALIAS
SUBMIT_KEYSTORE_KEYSTOREBASE64=$STATUS_KEYSTOREBASE64
SUBMIT_KEYSTORE_KEYSTOREPASSWORD=$STATUS_KEYSTOREPASSWORD

# Other
SUBMIT_ID_VAR_CHARS="zz"
GIT_COMMIT_HASH="$(cd /path/to/direct-file && git rev-parse --short main)"
```

### 2. Generate Local Wrapping Key

Run the setup script to generate a local wrapping key:

```bash
cd lib/irs-direct-file
./direct-file/scripts/local-setup.sh
```

This will output a `LOCAL_WRAPPING_KEY` value to add to your `.env.local`.

### 3. Build Shared Dependencies

Navigate to the libs directory and build shared dependencies:

```bash
cd lib/irs-direct-file/direct-file/libs
INSTALL_MEF=1 ../scripts/build-dependencies.sh
```

### 4. Start Development Containers

Start the required Docker containers:

```bash
cd lib/irs-direct-file/direct-file
docker compose up -d db mef-apps-db localstack
```

This starts:
- PostgreSQL database for Direct File
- PostgreSQL database for MeF apps
- LocalStack (AWS services mock)

### 5. Build and Run Services

#### Backend API

```bash
cd lib/irs-direct-file/direct-file/backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=development
```

#### State API

```bash
cd lib/irs-direct-file/direct-file/state-api
./mvnw spring-boot:run -Dspring-boot.run.profiles=development
```

#### Email Service

```bash
cd lib/irs-direct-file/direct-file/email-service
./mvnw spring-boot:run -Dspring-boot.run.profiles=blackhole
```

(Use `blackhole` profile to log emails instead of sending, or `send-email` to actually send)

### 6. Compile Fact Graph

The fact graph needs to be compiled from Scala to JavaScript:

```bash
cd lib/irs-direct-file/fact-graph-scala
sbt fastOptJS
```

Then copy the compiled files:

```bash
cd lib/irs-direct-file/df-client/df-client-app
npm run copy-transpiled-js
```

### 7. Configure Frontend Environment

In the Direct File client app, set environment variables:

```bash
cd lib/irs-direct-file/df-client/df-client-app
```

Create `.env.development`:

```bash
VITE_PUBLIC_PATH=
VITE_ALLOW_LOADING_TEST_DATA=true
VITE_API_URL=http://localhost:8080
VITE_STATE_API_URL=http://localhost:8081
```

## Integration with Financbase

### API Proxy Setup

To integrate with Financbase, you'll need to proxy Direct File API requests. Create API routes in Next.js:

```typescript
// app/api/direct-file/[...path]/route.ts
export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/direct-file', '');
  const apiUrl = `${process.env.DIRECT_FILE_API_URL}${path}`;
  
  const response = await fetch(apiUrl, {
    headers: {
      ...request.headers,
      'Authorization': request.headers.get('Authorization') || '',
    },
  });
  
  return response;
}
```

### Environment Variables in Financbase

Add to your Financbase `.env.local`:

```bash
DIRECT_FILE_API_URL=http://localhost:8080
DIRECT_FILE_STATE_API_URL=http://localhost:8081
```

## Testing

### Test Submission Flow

1. Start all services
2. Navigate to `/tax/direct-file` in Financbase
3. Complete the tax filing interview
4. Submit the return (will go to MeF in production, localstack in development)

### Check Logs

- Backend API logs: Check console output
- Database: Connect to PostgreSQL and query tables
- LocalStack: Check S3 buckets at http://localhost:4566

## Troubleshooting

### Services Won't Start

- Check Java version: `java -version` (should be 21)
- Check Maven: `./mvnw --version`
- Check database connection
- Check port availability

### Fact Graph Not Loading

- Ensure Scala compilation completed
- Check that compiled JS files are in the correct location
- Verify `copy-transpiled-js` script ran successfully

### API Connection Issues

- Verify services are running on correct ports
- Check CORS settings in backend services
- Verify environment variables are set correctly

## Production Considerations

1. **Security**: Use proper MeF credentials (not test values)
2. **Database**: Use production-grade PostgreSQL
3. **Scaling**: Consider container orchestration (Kubernetes, ECS)
4. **Monitoring**: Set up logging and monitoring
5. **Backups**: Configure database backups
6. **SSL/TLS**: Use HTTPS for all services

## References

- [IRS Direct File ONBOARDING.md](https://github.com/IRS-Public/direct-file/blob/main/ONBOARDING.md)
- [Direct File Backend README](https://github.com/IRS-Public/direct-file/tree/main/direct-file/backend/README.md)
- [State API README](https://github.com/IRS-Public/direct-file/tree/main/direct-file/state-api/README.md)

---

**Last Updated**: 2025-01-28

