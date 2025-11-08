# IRS Direct File Integration - Testing Guide

## Service Startup

### Quick Start

All services can be started using the provided scripts:

```bash
# Start Docker containers
cd lib/irs-direct-file/direct-file
./scripts/start-services.sh

# In separate terminals, start backend services:
# Terminal 1 - Backend API
cd lib/irs-direct-file/direct-file/backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=development

# Terminal 2 - State API
cd lib/irs-direct-file/direct-file/state-api
./mvnw spring-boot:run -Dspring-boot.run.profiles=development

# Terminal 3 - Email Service
cd lib/irs-direct-file/direct-file/email-service
./mvnw spring-boot:run -Dspring-boot.run.profiles=blackhole

# Terminal 4 - Next.js Dev Server
npm run dev
```

### Health Check

Verify all services are running:

```bash
cd lib/irs-direct-file/direct-file
./scripts/health-check.sh
```

Expected output:
- ✓ Direct File database: Running
- ✓ LocalStack: Running
- ✓ Backend API (port 8080): Running
- ✓ State API (port 8081): Running
- ✓ Email Service (port 8082): Running

## Testing the Integration

### 1. Access the Direct File Page

Navigate to: http://localhost:3000/tax/direct-file

**Expected Behavior:**
- Page loads without errors
- Legal disclosures are displayed
- Direct File app initializes
- No console errors

### 2. Test API Proxy

Test the API proxy endpoints:

```bash
# Test Backend API proxy (requires authentication)
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/direct-file/v1/health

# Test State API proxy (requires authentication)
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/direct-file/state-api/v1/health
```

### 3. Test Backend Services Directly

```bash
# Backend API Health
curl http://localhost:8080/actuator/health

# State API Health
curl http://localhost:8081/actuator/health

# Email Service Health
curl http://localhost:8082/actuator/health

# Backend API Swagger UI
open http://localhost:8080/swagger-ui/index.html
```

### 4. Test Fact Graph

The fact graph should be loaded in the client app. Check browser console for:
- No errors related to fact graph loading
- `debugFactGraph` available in console
- Fact graph functions working

### 5. Test Client App Build

```bash
cd lib/irs-direct-file/df-client/df-client-app
npm run build:development
```

Verify:
- Build completes successfully
- No TypeScript errors
- All imports resolve
- Fact dictionary files are generated

## E2E Testing Checklist

### Authentication Flow
- [ ] User can access `/tax/direct-file` when authenticated
- [ ] Unauthenticated users are redirected to login
- [ ] Session management works correctly

### Direct File App Integration
- [ ] Direct File app loads in the page
- [ ] No routing conflicts with Next.js
- [ ] MemoryRouter works correctly
- [ ] All Direct File components render

### API Integration
- [ ] API proxy routes work correctly
- [ ] Authentication is passed through
- [ ] CORS headers are set correctly
- [ ] Error handling works

### Fact Graph
- [ ] Fact graph JavaScript loads
- [ ] Fact graph functions are accessible
- [ ] Validation works correctly

### Export Functionality
- [ ] Export to MeF XML works
- [ ] Export to JSON works
- [ ] Export metadata is stored
- [ ] Export history is displayed

## Troubleshooting

### Services Not Starting

**Backend API won't start:**
- Check Java version: `java -version` (should be 21)
- Check port 8080 is available: `lsof -i :8080`
- Check database connection in `.env.local`
- Review logs in `backend/target/spring-boot.log`

**State API won't start:**
- Check port 8081 is available: `lsof -i :8081`
- Check database connection
- Review application logs

**Email Service won't start:**
- Check port 8082 is available: `lsof -i :8082`
- Verify blackhole profile is set

### Database Issues

**Connection errors:**
- Verify Docker containers are running: `docker ps`
- Check database credentials in `.env.local`
- Test connection: `docker exec direct-file-db psql -U postgres -l`

**Schema not created:**
- Check if migrations ran automatically
- Manually run migrations if needed
- Verify tables exist: `docker exec direct-file-db psql -U postgres -d directfile -c "\dt"`

### API Proxy Issues

**401 Unauthorized:**
- Verify Clerk authentication is working
- Check that user is logged in
- Verify `auth()` function returns userId

**502 Bad Gateway:**
- Verify backend services are running
- Check environment variables are set
- Review Next.js server logs

**CORS errors:**
- Verify CORS headers are set in proxy routes
- Check browser console for specific CORS errors
- Verify backend services allow CORS from Next.js origin

### Client App Issues

**Build errors:**
- Run `npm install` in `df-client/df-client-app`
- Check Node version (should be 18.20.4, but 20.x works)
- Verify fact dictionary is generated
- Check TypeScript errors

**Runtime errors:**
- Check browser console for errors
- Verify fact graph files are loaded
- Check that environment variables are set
- Verify API URLs are correct

## Performance Testing

### Load Testing

Test API endpoints under load:

```bash
# Install k6 if not already installed
brew install k6

# Run load test
k6 run --vus 10 --duration 30s load-test.js
```

### Memory Usage

Monitor service memory usage:

```bash
# Backend services
ps aux | grep java | grep directfile

# Docker containers
docker stats
```

## Security Testing

### Authentication
- [ ] Verify all API routes require authentication
- [ ] Test with invalid tokens
- [ ] Test with expired sessions

### Data Privacy
- [ ] Verify no PII/FTI is stored in Financbase database
- [ ] Verify session cleanup on unmount
- [ ] Check that export metadata only contains non-sensitive data

### CORS
- [ ] Verify CORS headers are set correctly
- [ ] Test from different origins
- [ ] Verify preflight requests work

## Next Steps After Testing

1. **Fix any issues found** during testing
2. **Document any custom configurations** needed
3. **Create production deployment guide** if needed
4. **Set up monitoring** for production services
5. **Configure backup strategy** for databases

---

**Last Updated**: 2025-11-08

