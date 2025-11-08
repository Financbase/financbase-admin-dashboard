# IRS Direct File Integration - Next Steps

## ✅ Completed Setup

All infrastructure setup is complete:

1. ✅ Development environment (Java 21, Maven, Scala, SBT, Coursier)
2. ✅ Environment configuration (LOCAL_WRAPPING_KEY generated)
3. ✅ Shared dependencies built
4. ✅ Docker containers running
5. ✅ Fact graph compiled and integrated
6. ✅ All backend services built
7. ✅ Client app configured and built
8. ✅ API proxy routes created
9. ✅ Startup scripts created
10. ✅ Documentation complete

## 🚀 Services Status

### Currently Running

- ✅ **Docker Containers**: Database and LocalStack
- ✅ **Backend API**: Port 8080 (may need a few minutes to fully initialize)
- ✅ **Next.js Dev Server**: Port 3000 (after dependency fix)

### Still Starting

- ⏳ **State API**: Port 8081 (may take 1-2 minutes)
- ⏳ **Email Service**: Port 8082 (may take 1-2 minutes)

## 📋 Testing Checklist

### 1. Verify All Services Are Running

```bash
cd lib/irs-direct-file/direct-file
./scripts/health-check.sh
```

Expected output should show all services as "Running".

### 2. Test the Integration Page

Navigate to: **http://localhost:3000/tax/direct-file**

**What to check:**
- [ ] Page loads without errors
- [ ] Legal disclosures are displayed
- [ ] Direct File app initializes
- [ ] No console errors in browser
- [ ] MemoryRouter works correctly (no Next.js routing conflicts)

### 3. Test API Proxy

Test the proxy endpoints (requires authentication):

```bash
# You'll need to be authenticated first
# Test Backend API proxy
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/direct-file/v1/health

# Test State API proxy
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/direct-file/state-api/v1/health
```

### 4. Test Backend Services Directly

```bash
# Backend API Swagger UI
open http://localhost:8080/swagger-ui/index.html

# Health endpoints
curl http://localhost:8080/actuator/health
curl http://localhost:8081/actuator/health
curl http://localhost:8082/actuator/health
```

### 5. Test Fact Graph

Open browser console on the Direct File page and verify:
- [ ] No errors related to fact graph loading
- [ ] `debugFactGraph` available in console
- [ ] Fact graph functions working

## 🔧 Troubleshooting

### Services Not Starting

**If Backend API won't start:**
- Check Java version: `java -version` (should be 21)
- Check port 8080 is available: `lsof -i :8080`
- Check database connection in `.env.local`
- Review logs in terminal where service was started

**If State API or Email Service won't start:**
- Check ports 8081 and 8082 are available
- Verify database connections
- Check application logs

### Next.js Server Issues

**If server won't start:**
- Verify `@paralleldrive/cuid2` is installed: `pnpm list @paralleldrive/cuid2`
- Check for other missing dependencies
- Review Next.js console output

**If page shows errors:**
- Check browser console for specific errors
- Verify API proxy routes are working
- Check that backend services are running

### API Proxy Issues

**401 Unauthorized:**
- Verify Clerk authentication is working
- Check that user is logged in
- Verify `auth()` function returns userId

**502 Bad Gateway:**
- Verify backend services are running
- Check environment variables are set
- Review Next.js server logs

## 📝 Manual Service Startup

If services need to be restarted manually:

### Terminal 1 - Backend API
```bash
cd lib/irs-direct-file/direct-file/backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=development
```

### Terminal 2 - State API
```bash
cd lib/irs-direct-file/direct-file/state-api
./mvnw spring-boot:run -Dspring-boot.run.profiles=development
```

### Terminal 3 - Email Service
```bash
cd lib/irs-direct-file/direct-file/email-service
./mvnw spring-boot:run -Dspring-boot.run.profiles=blackhole
```

### Terminal 4 - Next.js
```bash
npm run dev
```

## 🎯 E2E Testing

Once all services are running:

1. **Authentication Flow**
   - [ ] User can access `/tax/direct-file` when authenticated
   - [ ] Unauthenticated users are redirected to login

2. **Direct File App**
   - [ ] App loads and initializes
   - [ ] No routing conflicts
   - [ ] All components render correctly

3. **API Integration**
   - [ ] API proxy routes work
   - [ ] Authentication is passed through
   - [ ] CORS headers are set correctly

4. **Export Functionality**
   - [ ] Export to MeF XML works
   - [ ] Export to JSON works
   - [ ] Export metadata is stored (no PII/FTI)

## 📚 Documentation

- **Setup Complete**: `docs/integrations/irs-direct-file-backend-setup-complete.md`
- **Testing Guide**: `docs/integrations/irs-direct-file-testing-guide.md`
- **Service Status**: `docs/integrations/irs-direct-file-service-status.md`

## 🎉 Success Criteria

All of the following should be true:

- ✅ All services running and healthy
- ✅ Integration page loads without errors
- ✅ API proxy routes working
- ✅ Authentication integrated
- ✅ Fact graph loading correctly
- ✅ Export functionality working
- ✅ No PII/FTI stored in Financbase database

---

**Last Updated**: 2025-11-08
**Status**: Setup Complete - Ready for Testing

