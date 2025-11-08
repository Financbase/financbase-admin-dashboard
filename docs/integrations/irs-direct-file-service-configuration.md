# IRS Direct File - Service Configuration Issues & Solutions

## Issues Found During Testing

### Issue 1: LOCAL_WRAPPING_KEY Not Set

**Error**: 
```
LOCAL WRAPPING KEY NOT SET: Can't run the application because the local wrapping key isn't set or isn't a valid base64 String.
```

**Affected Services**: State API, Email Service

**Solution**: 
Export the LOCAL_WRAPPING_KEY environment variable before starting services:

```bash
export LOCAL_WRAPPING_KEY=jSp3AV/MlNE8kR000uJjQecU8wCXnuhDPFvVuzUZOkg=
```

**Permanent Fix**: Add to `.env.local` file in each service directory or use a startup script.

### Issue 2: Database Connection Error (Email Service)

**Error**:
```
Connection to localhost:5434 refused. Check that the hostname and port are correct.
```

**Cause**: Email Service is trying to connect to port 5434, but the database is on port 5435.

**Solution**: 
Update Email Service configuration to use correct database port (5435) or ensure mef-apps-db container is running on port 5434.

### Issue 3: Next.js Webpack Module Error

**Error**:
```
TypeError: Cannot read properties of undefined (reading 'call')
```

**Cause**: This appears to be a Next.js development server issue, possibly related to hot reloading or module resolution.

**Note**: This error appears on the sign-in page but may not affect the Direct File integration page directly.

## Configuration Requirements

### Environment Variables Required

For **State API** and **Email Service**:

```bash
export LOCAL_WRAPPING_KEY=jSp3AV/MlNE8kR000uJjQecU8wCXnuhDPFvVuzUZOkg=
```

For **Backend API**:
- Database connection string
- LOCAL_WRAPPING_KEY (if using local encryption)

### Database Ports

- **Direct File Database**: Port 5435 (mapped from container port 5432)
- **MeF Apps Database**: Port 5434 (if needed for Email Service)

## Startup Scripts with Environment Variables

### State API Startup

```bash
cd lib/irs-direct-file/direct-file/state-api
export LOCAL_WRAPPING_KEY=jSp3AV/MlNE8kR000uJjQecU8wCXnuhDPFvVuzUZOkg=
./mvnw spring-boot:run -Dspring-boot.run.profiles=development
```

### Email Service Startup

```bash
cd lib/irs-direct-file/direct-file/email-service
export LOCAL_WRAPPING_KEY=jSp3AV/MlNE8kR000uJjQecU8wCXnuhDPFvVuzUZOkg=
./mvnw spring-boot:run -Dspring-boot.run.profiles=blackhole
```

## Updated Startup Script

Create a startup script that sets environment variables:

```bash
#!/usr/bin/env bash
# start-services-with-env.sh

export LOCAL_WRAPPING_KEY=jSp3AV/MlNE8kR000uJjQecU8wCXnuhDPFvVuzUZOkg=

# Start State API
cd state-api
./mvnw spring-boot:run -Dspring-boot.run.profiles=development &
STATE_API_PID=$!

# Start Email Service
cd ../email-service
./mvnw spring-boot:run -Dspring-boot.run.profiles=blackhole &
EMAIL_SERVICE_PID=$!

echo "State API PID: $STATE_API_PID"
echo "Email Service PID: $EMAIL_SERVICE_PID"
```

## Verification Steps

1. **Check Environment Variable**:
   ```bash
   echo $LOCAL_WRAPPING_KEY
   ```

2. **Check Service Logs**:
   ```bash
   tail -f /tmp/state-api.log
   tail -f /tmp/email-service.log
   ```

3. **Check Service Health**:
   ```bash
   curl http://localhost:8081/actuator/health
   curl http://localhost:8082/actuator/health
   ```

4. **Run Health Check Script**:
   ```bash
   cd lib/irs-direct-file/direct-file
   ./scripts/health-check.sh
   ```

## Next Steps

1. ✅ Fix LOCAL_WRAPPING_KEY environment variable
2. ⏳ Fix database port configuration for Email Service
3. ⏳ Test services with corrected configuration
4. ⏳ Verify all services start successfully
5. ⏳ Complete browser testing

---

**Last Updated**: 2025-11-08

