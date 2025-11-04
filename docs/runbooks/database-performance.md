# Database Performance Runbook

**Severity**: Medium (P2)  
**Status**: Active

## Overview

This runbook provides procedures for diagnosing and resolving database performance issues in the Financbase Admin Dashboard.

## Symptoms

- Slow query execution times
- High database CPU usage
- Connection pool exhaustion
- Timeout errors in application
- Degraded application performance
- Database connection errors

## Root Causes

1. **Inefficient Queries**
   - Missing indexes
   - Full table scans
   - N+1 query problems
   - Complex joins without optimization

2. **High Load**
   - Too many concurrent connections
   - Large result sets
   - Long-running transactions
   - Lock contention

3. **Resource Constraints**
   - Insufficient database resources
   - Connection pool too small
   - Memory limits reached

4. **Schema Issues**
   - Missing indexes on frequently queried columns
   - Inefficient data types
   - Large tables without partitioning

## Resolution Steps

### Step 1: Identify Performance Bottlenecks

1. **Check Database Metrics**

   ```sql
   -- Check active connections
   SELECT count(*) FROM pg_stat_activity;
   
   -- Check slow queries
   SELECT query, mean_exec_time, calls 
   FROM pg_stat_statements 
   ORDER BY mean_exec_time DESC 
   LIMIT 10;
   ```

2. **Monitor Application Logs**

   ```bash
   grep "database.*timeout" /var/log/app.log
   grep "slow query" /var/log/app.log
   ```

3. **Check Database Performance**
   - CPU usage should be < 80%
   - Connection pool usage should be < 90%
   - Query execution time should be < 1 second for most queries

### Step 2: Analyze Slow Queries

1. **Identify Slow Queries**

   ```sql
   -- Enable slow query logging (if not already enabled)
   SET log_min_duration_statement = 1000; -- Log queries > 1 second
   
   -- View slow queries
   SELECT query, mean_exec_time, calls, total_exec_time
   FROM pg_stat_statements
   WHERE mean_exec_time > 1000
   ORDER BY mean_exec_time DESC;
   ```

2. **Analyze Query Plans**

   ```sql
   EXPLAIN ANALYZE SELECT * FROM transactions WHERE user_id = 'xxx';
   ```

   Look for:
   - Sequential scans (missing indexes)
   - High execution times
   - Large result sets

### Step 3: Optimize Queries

1. **Add Missing Indexes**

   ```sql
   -- Identify columns needing indexes
   SELECT schemaname, tablename, attname, n_distinct
   FROM pg_stats
   WHERE schemaname = 'public'
   AND n_distinct > 100;
   
   -- Create index
   CREATE INDEX idx_transactions_user_id ON transactions(user_id);
   ```

2. **Optimize Query Structure**
   - Use LIMIT for large result sets
   - Add WHERE clauses to filter early
   - Use JOINs instead of subqueries when possible
   - Avoid SELECT * when not needed

3. **Review Query Patterns**
   - Check for N+1 query problems
   - Use eager loading where appropriate
   - Implement query result caching

### Step 4: Optimize Connection Pooling

1. **Check Connection Pool Settings**

   ```typescript
   // Verify connection pool configuration
   const poolConfig = {
     max: 20, // Maximum connections
     min: 5,  // Minimum connections
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 2000
   };
   ```

2. **Monitor Connection Usage**

   ```sql
   SELECT count(*) as active_connections,
          max_conn as max_connections
   FROM pg_stat_activity,
        (SELECT setting::int as max_conn FROM pg_settings WHERE name = 'max_connections') as mc;
   ```

3. **Adjust Connection Pool**
   - Increase pool size if needed
   - Ensure proper connection cleanup
   - Implement connection timeout

### Step 5: Database Maintenance

1. **Run ANALYZE**

   ```sql
   ANALYZE transactions;
   ANALYZE users;
   -- Run for all frequently queried tables
   ```

2. **Update Statistics**

   ```sql
   -- PostgreSQL auto-analyze should handle this, but can run manually
   ANALYZE VERBOSE;
   ```

3. **Vacuum if Needed**

   ```sql
   -- Check for bloat
   SELECT schemaname, tablename, 
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
   FROM pg_tables
   WHERE schemaname = 'public'
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
   
   -- Run VACUUM if needed (usually auto-vacuum handles this)
   VACUUM ANALYZE transactions;
   ```

### Step 6: Monitor and Verify

1. **Track Performance Metrics**
   - Query execution times
   - Connection pool usage
   - Database CPU and memory usage
   - Application response times

2. **Set Up Alerts**
   - Alert on slow queries (> 1 second)
   - Alert on high connection pool usage (> 90%)
   - Alert on database CPU usage (> 80%)

## Prevention

### Best Practices

1. **Index Strategy**
   - Index frequently queried columns
   - Index foreign keys
   - Use composite indexes for multi-column queries
   - Review index usage regularly

2. **Query Optimization**
   - Use EXPLAIN ANALYZE for new queries
   - Review slow query logs regularly
   - Implement query result caching
   - Use pagination for large result sets

3. **Connection Management**
   - Use connection pooling
   - Close connections properly
   - Set appropriate timeouts
   - Monitor connection usage

4. **Monitoring**
   - Set up database performance monitoring
   - Track query execution times
   - Monitor connection pool usage
   - Review slow query logs weekly

### Index Guidelines

```sql
-- Index foreign keys
CREATE INDEX idx_transactions_user_id ON transactions(user_id);

-- Index frequently filtered columns
CREATE INDEX idx_transactions_status ON transactions(status);

-- Composite index for multi-column queries
CREATE INDEX idx_transactions_user_status ON transactions(user_id, status);

-- Index for date range queries
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
```

## Related Runbooks

- [Database Connection Issues](./database-connection.md) - Connection problems
- [Build and Deployment](./build-deployment.md) - Deployment issues

## References

- [Database Architecture](../architecture/DATABASE_ARCHITECTURE.md)
- [PostgreSQL Performance Tuning](https://www.postgresql.org/docs/current/performance-tips.html)
- [Query Optimization Guide](../database/quick-reference.md)

## Emergency Contacts

- **Database Admin**: [Contact Info]
- **On-Call Engineer**: [Contact Info]
- **DevOps Team**: [Contact Info]
