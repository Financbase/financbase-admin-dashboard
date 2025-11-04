# Debugging Notifications System

## Steps to Debug

1. **Open Browser Console** (F12 or Cmd+Option+I)
   - Look for `[Notifications]` prefixed logs
   - Check for any error messages

2. **Check Component Visibility**
   - The notification bell icon should appear in the header
   - It's located between the search and theme toggle

3. **Verify Authentication**
   - Make sure you're logged in
   - Check if `user` object is available in console logs

4. **Check API Response**
   - Open Network tab in DevTools
   - Look for `/api/notifications` request
   - Check if it returns 200 or an error (401, 500, etc.)
   - View the response body

5. **Database Check**
   - Verify notifications exist in the database
   - Check if `is_read` field exists (not `read`)
   - Verify user ID matches your Clerk user ID

## Common Issues

### Issue: Component not visible
- **Check**: Is `EnhancedNotificationsPanel` imported in `enhanced-top-nav.tsx`?
- **Check**: Is the component rendered in the JSX?

### Issue: API returns 401
- **Cause**: Not authenticated or session expired
- **Fix**: Log out and log back in

### Issue: API returns 500
- **Cause**: Database schema mismatch or query error
- **Check**: Console logs for detailed error
- **Verify**: Database has `is_read` column (not `read`)

### Issue: No notifications showing
- **Check**: Are there notifications in the database for your user?
- **Check**: Are notifications marked as `is_read = false`?
- **Check**: Does user ID in database match your Clerk user ID?

### Issue: Badge not showing
- **Check**: Is `unreadCount > 0`?
- **Check**: Console logs show the actual count
- **Check**: CSS might be hiding the badge (z-index, positioning)

## Test Commands

```bash
# Check if API endpoint is accessible (requires auth)
curl http://localhost:3000/api/notifications

# Check database directly (if you have access)
# SELECT * FROM notifications WHERE user_id = 'your-clerk-user-id';
```

## Expected Console Output

When working correctly, you should see:
```
[Notifications] State: {
  userLoaded: true,
  userId: "user_xxx",
  isLoading: false,
  error: null,
  unreadCount: 3,
  notificationsCount: 3
}
[Notifications] Fetched: {
  notifications: [...],
  unreadCount: 3
}
```

