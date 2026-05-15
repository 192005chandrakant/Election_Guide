# Firebase Authentication Issues - Resolution Summary

## Issues Identified

### 1. Content Security Policy (CSP) Violations
**Error:**
```
Framing 'https://promptwar-cddf1.firebaseapp.com/' violates the following Content Security Policy directive: 
"default-src 'self'". The request has been blocked. Note that 'frame-src' was not explicitly set, 
so 'default-src' is used as a fallback.
```

**Cause:** Firebase authentication requires framing from Firebase domains (e.g., for popup auth and iframe-based flows), but the CSP policy was too restrictive.

**Fix:** Updated `web/next.config.ts` to explicitly allow Firebase domains in CSP directives:
- `frame-src`: Allows Firebase popups and iframes
- `script-src`: Allows Google analytics and Firebase scripts
- `connect-src`: Allows Firebase connections (including WebSocket for real-time features)

### 2. Cross-Origin-Opener-Policy (COOP) Errors
**Error:**
```
Cross-Origin-Opener-Policy policy would block the window.closed call.
```

**Cause:** Firebase popup authentication needs to check if the popup was closed by the user. The strict COOP policy was preventing this.

**Fix:** Set `Cross-Origin-Opener-Policy: same-origin-allow-popups` to permit popup-based authentication flows while maintaining security.

### 3. Popup Blocked / Not Allowed
**Error:**
```
auth/popup-blocked: The popup window was blocked by the browser.
auth/operation-not-allowed: The popup method is not available for this provider.
```

**Cause:** Many browsers block popups by default, or popup authentication may be disabled in Firebase console.

**Fix:** 
- Created `web/src/lib/auth-utils.ts` with automatic fallback to redirect-based authentication
- If popup is blocked, the system gracefully falls back to `signInWithRedirect`
- Better error messaging for users

### 4. Firebase 400 Bad Request on Signup
**Error:**
```
POST https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=... 400 (Bad Request)
```

**Cause:** Could be due to:
- Missing or invalid Firebase configuration
- Recaptcha misconfiguration
- Invalid email/password format
- Firebase project not properly configured in Console

**Fix:**
- Enhanced error handling with specific error codes
- Added better logging for debugging
- User-friendly error messages that guide users on what went wrong

### 5. Permissions-Policy Warning
**Error:**
```
Unrecognized feature: 'ambient-light-sensor'
```

**Cause:** Invalid feature names in Permissions-Policy header.

**Fix:** Updated `Permissions-Policy` header to only include valid features:
- `camera=()` - Deny camera access
- `microphone=()` - Deny microphone access  
- `geolocation=(self)` - Allow geolocation for same-origin only
- `payment=()` - Deny payment API access

## Files Modified

### 1. `web/next.config.ts`
**Changes:**
- Added comprehensive security headers
- CSP: Allows Firebase domains, Google services, and necessary external scripts
- COOP: Set to `same-origin-allow-popups` for popup auth support
- CORP: Set to `require-corp` for security
- Permissions-Policy: Fixed with valid feature names
- Added X-Frame-Options, X-Content-Type-Options, and other security headers

### 2. `web/src/lib/auth-utils.ts` (NEW)
**Features:**
- `signInWithGoogle()`: Enhanced Google Sign-In with popup-to-redirect fallback
- `checkRedirectResult()`: Handles redirect-based auth completion
- `formatAuthError()`: User-friendly error messages for all Firebase error codes
- `logAuthError()`: Better error logging for debugging
- Automatic detection of popup-blocked scenarios

### 3. `web/src/app/login/page.tsx`
**Changes:**
- Now uses `signInWithGoogle()` from auth-utils
- Better error handling with `formatAuthError()`
- Enhanced logging with `logAuthError()`
- Improved user experience with specific error messages

### 4. `web/src/lib/auth-context.tsx`
**Changes:**
- Added check for redirect results on initialization
- Better error handling and logging
- Supports both popup and redirect-based authentication flows

## Environment Variables Required

Ensure the following environment variables are set in `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=<your-api-key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=promptwar-cddf1.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=promptwar-cddf1
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=promptwar-cddf1.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<your-app-id>
```

## Firebase Console Configuration

### Enable Authentication Methods
1. Go to Firebase Console → Authentication → Sign-in method
2. Enable "Email/Password"
3. Enable "Google" and configure OAuth consent screen
4. Ensure "Authorized JavaScript origins" includes your domain

### Configure Authorized Domains
In Firebase Console → Authentication → Settings:
- Add `localhost:3000` for local development
- Add your production domain (e.g., `election-guide.example.com`)

## Testing the Fixes

### 1. Test Email/Password Authentication
- Try signup with weak password → should see "Password is too weak" message
- Try signup with existing email → should see "Email already in use" message
- Try login with wrong password → should see "Incorrect password" message

### 2. Test Google Sign-In
- Click "Sign in with Google" button
- If popup is blocked:
  - Should see "Popup was blocked" message
  - Browser will show popup permission request
  - Allow popups and try again
- After allowing popups, should successfully sign in

### 3. Verify Security Headers
```bash
curl -I https://your-domain.com
```

Should see:
- `Content-Security-Policy: ...`
- `Cross-Origin-Opener-Policy: same-origin-allow-popups`
- `Cross-Origin-Embedder-Policy: require-corp`

## Deployment Considerations

1. **Update authorized domains** in Firebase Console before deploying to production
2. **Test authentication flows** in staging environment
3. **Monitor browser console** for any remaining CSP violations or errors
4. **Check Firebase quota usage** after deployment, especially for authentication API calls
5. **Enable reCAPTCHA Enterprise** in Firebase for additional security if needed

## Troubleshooting

### Still seeing popup-blocked errors?
1. Clear browser cache and cookies
2. Try in incognito/private mode
3. Check browser popup blocker settings
4. Verify Firebase configuration is correct

### Getting "Operation not allowed" error?
1. Check Firebase Console → Authentication → Sign-in methods
2. Ensure Google sign-in is enabled
3. Verify OAuth credentials are configured
4. Check if reCAPTCHA is properly configured

### CSP violations still appearing?
1. Check browser console for specific blocked resources
2. Update CSP in `next.config.ts` if new external services are added
3. Use report-uri for monitoring CSP violations
4. Test with Firefox Developer Edition's CSP header checking

## Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Cross-Origin-Opener-Policy](https://developer.chrome.com/blog/cross-origin-opener-policy/)
- [Firebase Error Codes](https://firebase.google.com/docs/auth/admin/errors)
