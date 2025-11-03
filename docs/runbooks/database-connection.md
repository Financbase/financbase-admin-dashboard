# Database Connection Issues

**Severity**: Critical (P0)  
**Last Updated**: 2024-01-XX  
**Related**: [Database Performance](./database-performance.md), [Build and Deployment](./build-deployment.md)

## Symptoms

- Application fails to start
- API endpoints return 500 errors with database-related messages
- Health check endpoint returns `database: unhealthy`
- Error logs show connection timeouts or refused connections
- Users cannot access data or save changes

## Common Error Messages

```
Error: connect ECONNREFUSED
Error: Connection timeout
Error: password authentication failed
Error: database "financbase" does not exist
Error: too many connections
```

## Root Causes

1. **Invalid DATABASE_URL**: Connection string is incorrect or missing
2. **Database server down**: PostgreSQL server is not running
3. **Network issues**: Firewall blocking connection or network problems
4. **Authentication failure**: Wrong credentials
5. **Database doesn't exist**: Database name incorrect
6. **Connection pool exhausted**: Too many active connections
7. **SSL/TLS configuration**: SSL mode mismatch

## Resolution Steps

### Step 1: Verify Environment Variables

```bash
# Check DATABASE_URL is set
echo $DATABASE_URL

# Should output: postgresql://user:password@host:port/database
```

If not set:
```bash
# Load from .env.local
source .env.local
# Or
export DATABASE_URL="postgresql://user:password@host:port/database"
```

### Step 2: Test Database Connection

```bash
# Test connection with psql
psql "$DATABASE_URL" -c "SELECT 1;"

# If successful, you should see:
#  ?column?
# ----------
#         1
```

**If connection fails**, proceed to Step 3.

### Step 3: Check Database Server Status

#### For Neon (Cloud PostgreSQL)

1. **Check Neon Dashboard**:
   - Log into https://console.neon.tech
   - Verify project is active
   - Check database status
   - Verify IP allowlist (if enabled)

2. **Check Connection String**:
   - Verify connection string in Neon dashboard
   - Ensure SSL mode is correct (usually `require` for Neon)

#### For Local PostgreSQL

```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Check PostgreSQL service status
# macOS
brew services list | grep postgresql

# Linux
systemctl status postgresql
```

**If PostgreSQL is not running**:
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

### Step 4: Verify Database Exists

```bash
# List databases
psql "$DATABASE_URL" -l

# If database doesn't exist, create it
createdb financbase

# Or via psql
psql "$DATABASE_URL" -c "CREATE DATABASE financbase;"
```

### Step 5: Check Connection Pool Settings

If you see "too many connections":

```sql
-- Check current connections
SELECT count(*) FROM pg_stat_activity;

-- Check max connections
SHOW max_connections;

-- Terminate idle connections (if needed)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'financbase' 
  AND state = 'idle'
  AND state_change < now() - interval '5 minutes';
```

### Step 6: Verify SSL Configuration

For Neon and most cloud providers, SSL is required:

```bash
# Test with SSL
psql "$DATABASE_URL?sslmode=require" -c "SELECT 1;"

# If SSL mode is incorrect, update DATABASE_URL
export DATABASE_URL="${DATABASE_URL}?sslmode=require"
```

### Step 7: Check Firewall/Network

```bash
# Test network connectivity
telnet <database-host> 5432

# Or
nc -zv <database-host> 5432
```

If connection refused:
- Check firewall rules
- Verify IP allowlist (for cloud databases)
- Check VPN connection (if required)

### Step 8: Verify Credentials

```bash
# Test with explicit credentials
psql -h <host> -p <port> -U <username> -d <database>

# Enter password when prompted
```

If authentication fails:
- Verify username and password
- Check for special characters in password (may need URL encoding)
- Reset password if needed

## Verification

After resolving the issue:

1. **Test Application**:
   ```bash
   npm run dev
   # Visit http://localhost:3000/api/health
   # Should show: "database": "healthy"
   ```

2. **Test Database Queries**:
   ```bash
   psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM users;"
   ```

3. **Check Logs**:
   ```bash
   # Check application logs for database errors
   tail -f logs/app.log | grep -i database
   ```

## Prevention

1. **Monitor Database Health**:
   - Set up monitoring alerts for connection failures
   - Monitor connection pool usage
   - Track database server uptime

2. **Use Connection Pooling**:
   - Configure appropriate pool size
   - Use connection pooling library (already implemented)

3. **Database Backups**:
   - Regular automated backups (see `scripts/backup-database.sh`)
   - Test restore procedures

4. **Environment Management**:
   - Use secrets management (Vercel, AWS Secrets Manager)
   - Rotate credentials regularly
   - Never commit credentials to version control

5. **Network Security**:
   - Use IP allowlists for cloud databases
   - Enable SSL/TLS for all connections
   - Use VPN for production databases if required

## Related Documentation

- [Database Configuration](../configuration/ENVIRONMENT_VARIABLES.md)
- [Database Backup Scripts](../../scripts/backup-database.sh)
- [Database Performance Runbook](./database-performance.md)
- [Deployment Guide](../deployment/README.md)

## Escalation

If issue persists after following all steps:

1. **Check Status Pages**:
   - Neon: https://status.neon.tech
   - AWS RDS: https://status.aws.amazon.com

2. **Contact Database Provider Support**:
   - Neon: support@neon.tech
   - AWS: AWS Support

3. **Check Application Logs**:
   ```bash
   # Full error logs
   grep -i "database\|connection\|postgres" logs/app.log
   ```

4. **Escalate to Team Lead**:
   - Document all steps taken
   - Include error logs and connection test results
