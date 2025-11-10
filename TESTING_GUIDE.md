# Authentication System Testing Guide

## Prerequisites

Before testing, ensure both backend and frontend are running:

### 1. Start Backend
```bash
cd finances-api
make start
```

Verify backend is running:
- API Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

### 2. Start Frontend
```bash
cd finances-app
yarn dev
```

Frontend will open at: http://localhost:5173

## Manual Testing Checklist

### ✅ Registration Flow

1. Navigate to http://localhost:5173/register
2. Test validation:
   - Submit empty form → Should show "Email is required"
   - Enter invalid email → Should show "Please enter a valid email address"
   - Enter short username (< 3 chars) → Should show "Username must be at least 3 characters"
   - Enter short password (< 8 chars) → Should show "Password must be at least 8 characters"
   - Enter non-matching passwords → Should show "Passwords do not match"
3. Create valid account:
   - Email: `test@example.com`
   - Username: `testuser`
   - Password: `password123`
   - Confirm Password: `password123`
4. Click "Sign Up"
5. ✅ Expected: Auto-login and redirect to /dashboard
6. ✅ Expected: Header shows email and user icon

### ✅ Login Flow

1. Logout if already logged in (click user icon → Logout)
2. Navigate to http://localhost:5173/login
3. Test validation:
   - Submit empty form → Should show "Email or username is required"
   - Enter username without password → Should show "Password is required"
4. Test invalid credentials:
   - Username: `wrong@example.com`
   - Password: `wrongpassword`
   - ✅ Expected: Error message "Invalid credentials" or similar
5. Test valid login:
   - Username: `test@example.com` (or the email you registered with)
   - Password: `password123`
   - Click "Sign In"
   - ✅ Expected: Redirect to /dashboard
   - ✅ Expected: Header shows email and user icon

### ✅ Protected Route

1. Ensure you're logged out
2. Try to access http://localhost:5173/dashboard directly
3. ✅ Expected: Redirect to /login
4. After login, should redirect back to /dashboard

### ✅ Logout Flow

1. Ensure you're logged in
2. Click user icon in header (top-right)
3. Click "Logout" in menu
4. ✅ Expected: Redirect to /login
5. ✅ Expected: Header shows "Login" and "Register" buttons
6. Try to access /dashboard → Should redirect to /login

### ✅ Forgot Password Flow

1. Navigate to http://localhost:5173/forgot-password
2. Test validation:
   - Submit empty form → Should show "Email is required"
   - Enter invalid email → Should show "Please enter a valid email address"
3. Enter valid email: `test@example.com`
4. Click "Send Reset Link"
5. ✅ Expected: Success message appears
6. ✅ Expected: Check backend logs for reset token

**Note**: In development mode, the reset token will be logged to backend console. In production, it would be sent via email.

### ✅ Reset Password Flow

1. Get reset token from backend logs (or use a test token)
2. Navigate to: http://localhost:5173/reset-password?token=YOUR_TOKEN
3. Test validation:
   - Submit with short password → Should show "Password must be at least 8 characters"
   - Enter non-matching passwords → Should show "Passwords do not match"
4. Enter valid passwords:
   - New Password: `newpassword123`
   - Confirm Password: `newpassword123`
5. Click "Reset Password"
6. ✅ Expected: Success message with login link
7. Click "Click here to login"
8. ✅ Expected: Navigate to /login
9. Test login with new password

### ✅ Token Persistence

1. Login to the application
2. ✅ Expected: Redirect to /dashboard
3. Refresh the page (F5)
4. ✅ Expected: Still on /dashboard, still authenticated
5. Open DevTools → Application → Local Storage → http://localhost:5173
6. ✅ Expected: See `auth_token` and `refresh_token` keys
7. Close browser tab and reopen http://localhost:5173
8. ✅ Expected: Auto-redirect to /dashboard (still authenticated)

### ✅ Navigation Links

1. When logged out:
   - From /login → Click "Forgot password?" → Navigate to /forgot-password
   - From /login → Click "Sign up" → Navigate to /register
   - From /register → Click "Sign in" → Navigate to /login
   - From /forgot-password → Click "Back to login" → Navigate to /login
   - Header "Login" button → Navigate to /login
   - Header "Register" button → Navigate to /register

2. When logged in:
   - Header shows user email
   - Clicking user icon shows dropdown menu
   - "Logout" option in menu

### ✅ Error Handling

1. **Backend Down**:
   - Stop backend: `cd finances-api && make stop`
   - Try to login
   - ✅ Expected: Error message "Failed to connect to the server"
   - Restart backend: `make start`

2. **Invalid Token**:
   - Manually edit localStorage token to invalid value
   - Refresh page
   - ✅ Expected: Redirect to /login, token cleared

3. **Network Errors**:
   - Use browser DevTools → Network tab → Throttle to "Offline"
   - Try to login
   - ✅ Expected: Error message displayed

## Browser DevTools Checks

### Redux State (Redux DevTools Extension)

If you have Redux DevTools installed:
1. Open Redux DevTools
2. Check state shape:
   ```json
   {
     "auth": {
       "user": {
         "id": "...",
         "email": "test@example.com",
         "username": "testuser",
         "is_active": true,
         "is_superuser": false
       },
       "token": "eyJ...",
       "refreshToken": "eyJ...",
       "isAuthenticated": true,
       "isLoading": false,
       "error": null
     }
   }
   ```

### Local Storage

1. Open DevTools → Application → Local Storage → http://localhost:5173
2. After login, should see:
   - `auth_token`: JWT access token
   - `refresh_token`: JWT refresh token

### Network Requests

1. Open DevTools → Network tab
2. Login with credentials
3. Check request to `/auth/login/tokens`:
   - Method: POST
   - Request Content-Type: `application/x-www-form-urlencoded`
   - Request Payload: `username=...&password=...`
   - Response: JSON with `access_token`, `refresh_token`, `token_type`
4. Check subsequent requests:
   - Should include `Authorization: Bearer <token>` header

### Console Errors

1. Open DevTools → Console
2. Should see no errors during normal operation
3. If you see errors, they should be handled gracefully (e.g., network errors show in UI)

## API Testing with curl

You can also test the backend directly:

### Register
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login/tokens \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=password123"
```

### Get Current User
```bash
# Save token from login response
TOKEN="your_access_token_here"

curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Forgot Password
```bash
curl -X POST http://localhost:8000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### Reset Password
```bash
curl -X POST http://localhost:8000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "reset_token_from_backend_logs",
    "new_password": "newpassword123"
  }'
```

## Common Issues & Solutions

### Issue: "Cannot connect to backend"
**Solution**:
- Ensure backend is running: `cd finances-api && make start`
- Check backend logs: `make logs-app`
- Verify backend URL in `.env`: `VITE_API_BASE_URL=http://localhost:8000/api/v1`

### Issue: "CORS error"
**Solution**:
- Backend should be configured to allow http://localhost:5173
- Check backend CORS settings in FastAPI

### Issue: "Token not persisting"
**Solution**:
- Check browser console for localStorage errors
- Clear localStorage and try again: DevTools → Application → Local Storage → Clear All
- Try incognito/private window

### Issue: "Infinite redirect loop"
**Solution**:
- Clear localStorage
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check Redux state in DevTools

### Issue: "TypeScript errors"
**Solution**:
```bash
yarn type-check
```
Should show 0 errors. If errors exist, they need to be fixed.

### Issue: "Build fails"
**Solution**:
```bash
yarn build
```
Should complete successfully. Check error messages for details.

## Performance Checks

1. **Initial Load**: Should be < 2 seconds on fast connection
2. **Login Response**: Should be < 500ms (depends on backend)
3. **Page Transitions**: Should be smooth, no lag
4. **Bundle Size**: Check build output, should be reasonable (<500KB total)

## Accessibility Checks

1. **Keyboard Navigation**:
   - Tab through all form fields
   - Enter/Space should submit forms or activate buttons
   - Escape should close menus

2. **Screen Reader**:
   - Test with screen reader (VoiceOver, NVDA, JAWS)
   - All form fields should be announced
   - Error messages should be announced

3. **Focus Indicators**:
   - All interactive elements should show focus state
   - Focus should be visible and clear

## Responsive Design Checks

1. **Desktop**: Test at 1920x1080, 1440x900, 1280x720
2. **Tablet**: Test at 768x1024 (iPad)
3. **Mobile**: Test at 375x667 (iPhone SE), 414x896 (iPhone 11)

All auth pages should be responsive and usable on all screen sizes.

---

**Last Updated**: January 9, 2025
**Status**: Ready for Testing
