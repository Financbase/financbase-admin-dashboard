# Clerk Configuration for Onboarding System

## 1. Configure Post-Signup Redirect

### In Clerk Dashboard:
1. Go to your Clerk Dashboard
2. Navigate to **User & Authentication** → **Email, Phone, Username**
3. Find the **Redirect URLs** section
4. Add the following redirect URL:
   ```
   http://localhost:3000/onboarding
   ```
   For production, use:
   ```
   https://your-domain.com/onboarding
   ```

### Alternative: Configure in Clerk Dashboard → Paths
1. Go to **User & Authentication** → **Paths**
2. Set **After sign up** to: `/onboarding`
3. Set **After sign in** to: `/dashboard` (or your default dashboard path)

## 2. Configure User Metadata

### In Clerk Dashboard:
1. Go to **User & Authentication** → **User metadata**
2. Add the following custom fields:
   - **persona**: `string` (optional)
   - **onboardingCompleted**: `boolean` (optional)

## 3. Environment Variables

Make sure your `.env.local` file includes:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 4. Test the Configuration

1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000`
3. Click "Sign Up" and create a new account
4. You should be redirected to `/onboarding` after signup
5. Complete the onboarding flow
6. You should be redirected to `/dashboard` after completion

## 5. Production Configuration

For production deployment:
1. Update the redirect URLs in Clerk Dashboard to use your production domain
2. Ensure `NEXT_PUBLIC_APP_URL` is set to your production URL
3. Test the complete flow in production

## Troubleshooting

### If users aren't redirected to onboarding:
1. Check that the redirect URL is correctly configured in Clerk
2. Verify that `middleware.ts` is properly checking onboarding status
3. Check browser console for any JavaScript errors

### If onboarding status isn't being tracked:
1. Verify database tables were created successfully
2. Check that the onboarding service is working
3. Ensure API routes are accessible

### If emails aren't being sent:
1. Verify Resend API key is configured
2. Check that email service is working
3. Test email sending manually
