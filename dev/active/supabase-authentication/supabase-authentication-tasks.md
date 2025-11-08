# Supabase Authentication - Task Checklist

**Last Updated:** 2025-11-08
**Status:** Ready to Start

---

## Phase 1: Foundation & Dependencies ⏱️ 2-3 hours

### Setup
- [ ] 1.1 Install `@supabase/supabase-js` package
- [ ] 1.2 Install `@supabase/ssr` package
- [ ] 1.3 Verify `pnpm install` completes successfully
- [ ] 1.4 Check packages appear in package.json dependencies

### Supabase Clients
- [ ] 2.1 Create `lib/supabase/client.ts` (browser client)
- [ ] 2.2 Create `lib/supabase/server.ts` (server component client)
- [ ] 2.3 Create `lib/supabase/middleware.ts` (middleware client)
- [ ] 2.4 Add TypeScript types for clients
- [ ] 2.5 Test connection to Supabase from server

### Environment
- [ ] 3.1 Create `.env.local` file (if not exists)
- [ ] 3.2 Copy values from `.env.example`
- [ ] 3.3 Verify `.env.local` in `.gitignore`
- [ ] 3.4 Test environment variables load correctly

---

## Phase 2: Database Setup ⏱️ 1-2 hours

### Profiles Table
- [ ] 4.1 Access Supabase SQL Editor
- [ ] 4.2 Run CREATE TABLE statement for profiles
- [ ] 4.3 Enable Row Level Security (RLS)
- [ ] 4.4 Create "Users can view own profile" policy
- [ ] 4.5 Create "Users can update own profile" policy
- [ ] 4.6 Verify table visible in Supabase dashboard

### Triggers
- [ ] 5.1 Create `handle_new_user()` function
- [ ] 5.2 Create `on_auth_user_created` trigger
- [ ] 5.3 Test trigger with manual user creation
- [ ] 5.4 Verify profile auto-created
- [ ] 5.5 Check Supabase logs for errors

### Profile Utilities
- [ ] 6.1 Create `lib/auth/types.ts` with TypeScript types
- [ ] 6.2 Create `lib/auth/profile.ts`
- [ ] 6.3 Implement `getProfile()` function
- [ ] 6.4 Implement `updateProfile()` function
- [ ] 6.5 Add error handling

---

## Phase 3: Authentication Infrastructure ⏱️ 3-4 hours

### Session Utilities
- [ ] 7.1 Create `lib/auth/session.ts`
- [ ] 7.2 Implement `getSession()` function
- [ ] 7.3 Implement `getUser()` function
- [ ] 7.4 Implement `requireAuth()` function
- [ ] 7.5 Add TypeScript types for session data

### Client Hooks
- [ ] 8.1 Create `lib/auth/hooks.ts`
- [ ] 8.2 Implement `useAuth()` hook (user + loading)
- [ ] 8.3 Implement `useUser()` hook (user profile)
- [ ] 8.4 Implement `useSignOut()` hook (logout)
- [ ] 8.5 Test hooks in Client Component

### Middleware
- [ ] 9.1 Create `middleware.ts` at project root
- [ ] 9.2 Implement session check
- [ ] 9.3 Protect `/dashboard/*` routes
- [ ] 9.4 Redirect unauthenticated users to `/login`
- [ ] 9.5 Redirect authenticated users from `/login` to `/dashboard`
- [ ] 9.6 Preserve redirect destination in query params
- [ ] 9.7 Test protected route access
- [ ] 9.8 Test redirect loops don't occur

---

## Phase 4: Login/Signup Pages ⏱️ 4-5 hours

### Auth Layout
- [ ] 10.1 Create `app/(auth)` directory
- [ ] 10.2 Create `app/(auth)/layout.tsx`
- [ ] 10.3 Implement split-screen container
- [ ] 10.4 Remove sidebar/header from auth layout
- [ ] 10.5 Add background styling (#ececf1)

### Login Page
- [ ] 11.1 Create `app/(auth)/login/page.tsx`
- [ ] 11.2 Build left column (form container)
- [ ] 11.3 Build right column (image display)
- [ ] 11.4 Create email input with validation
- [ ] 11.5 Create password input with show/hide toggle
- [ ] 11.6 Add "Remember me" checkbox
- [ ] 11.7 Add "Forgot password?" link
- [ ] 11.8 Add "Don't have an account? Sign up" link
- [ ] 11.9 Implement form submission handler
- [ ] 11.10 Add loading state
- [ ] 11.11 Add error display
- [ ] 11.12 Test login flow end-to-end
- [ ] 11.13 Verify redirect to dashboard on success

### Signup Page
- [ ] 12.1 Create `app/(auth)/signup/page.tsx`
- [ ] 12.2 Reuse split-screen layout from login
- [ ] 12.3 Create email input
- [ ] 12.4 Create password input
- [ ] 12.5 Create confirm password input
- [ ] 12.6 Add password strength indicator
- [ ] 12.7 Add password mismatch validation
- [ ] 12.8 Add Terms & Privacy checkboxes
- [ ] 12.9 Implement signup handler
- [ ] 12.10 Add auto-login after signup
- [ ] 12.11 Test signup flow end-to-end

### OAuth Buttons
- [ ] 13.1 Create `components/auth/oauth-buttons.tsx`
- [ ] 13.2 Create Google button component (white with logo)
- [ ] 13.3 Create Apple button component (black with logo)
- [ ] 13.4 Implement Google OAuth redirect
- [ ] 13.5 Implement Apple OAuth redirect
- [ ] 13.6 Add loading states
- [ ] 13.7 Add to login page
- [ ] 13.8 Add to signup page

### Password Reset
- [ ] 14.1 Create `app/(auth)/forgot-password/page.tsx`
- [ ] 14.2 Build email input form
- [ ] 14.3 Implement reset request handler
- [ ] 14.4 Add success message
- [ ] 14.5 Create `app/(auth)/reset-password/page.tsx`
- [ ] 14.6 Implement token validation
- [ ] 14.7 Create new password form
- [ ] 14.8 Implement password update handler
- [ ] 14.9 Add redirect to login after success
- [ ] 14.10 Test complete reset flow

---

## Phase 5: OAuth Provider Configuration ⏱️ 2-3 hours

### Google OAuth
- [ ] 15.1 Access Google Cloud Console
- [ ] 15.2 Create new OAuth 2.0 Client ID
- [ ] 15.3 Configure authorized redirect URIs
- [ ] 15.4 Copy Client ID and Secret
- [ ] 15.5 Add credentials to Supabase dashboard
- [ ] 15.6 Add to `.env.local`
- [ ] 15.7 Test Google sign-in button
- [ ] 15.8 Verify redirect to Google
- [ ] 15.9 Verify callback and session creation
- [ ] 15.10 Test end-to-end Google login

### Apple OAuth
- [ ] 16.1 Access Apple Developer portal
- [ ] 16.2 Create new Service ID
- [ ] 16.3 Configure domain and redirect URLs
- [ ] 16.4 Create signing key
- [ ] 16.5 Generate client secret (JWT)
- [ ] 16.6 Add credentials to Supabase dashboard
- [ ] 16.7 Add to `.env.local`
- [ ] 16.8 Test Apple sign-in button
- [ ] 16.9 Verify Apple ID flow
- [ ] 16.10 Test end-to-end Apple login

### Callback Handler
- [ ] 17.1 Create `app/auth/callback/route.ts`
- [ ] 17.2 Implement OAuth code exchange
- [ ] 17.3 Handle both Google and Apple
- [ ] 17.4 Set session cookie
- [ ] 17.5 Redirect to dashboard
- [ ] 17.6 Add error handling
- [ ] 17.7 Log errors appropriately
- [ ] 17.8 Test with both providers

---

## Phase 6: Dashboard Integration ⏱️ 2-3 hours

### Header Updates
- [ ] 18.1 Open `components/app/app-header.tsx`
- [ ] 18.2 Make `isAuthenticated` dynamic (get from session)
- [ ] 18.3 Fetch user data when authenticated
- [ ] 18.4 Display user name/email
- [ ] 18.5 Add user avatar (if available)
- [ ] 18.6 Add logout button
- [ ] 18.7 Test header updates on login/logout

### Protected Layout
- [ ] 19.1 Create `app/(protected)` directory
- [ ] 19.2 Create `app/(protected)/layout.tsx`
- [ ] 19.3 Add server-side auth check
- [ ] 19.4 Redirect to login if not authenticated
- [ ] 19.5 Move `app/dashboard` to `app/(protected)/dashboard`
- [ ] 19.6 Test dashboard requires auth

### Logout
- [ ] 20.1 Create `app/api/auth/logout/route.ts`
- [ ] 20.2 Implement Supabase sign out
- [ ] 20.3 Clear session cookies
- [ ] 20.4 Return redirect to homepage
- [ ] 20.5 Test logout clears session
- [ ] 20.6 Verify cannot access dashboard after logout

### Root Layout
- [ ] 21.1 Open `app/layout.tsx`
- [ ] 21.2 Fetch session server-side
- [ ] 21.3 Pass auth state to header
- [ ] 21.4 Test session loads on page refresh
- [ ] 21.5 Check for hydration errors

---

## Phase 7: Testing & Polish ⏱️ 3-4 hours

### End-to-End Testing
- [ ] 22.1 Test email/password signup
- [ ] 22.2 Test email/password login
- [ ] 22.3 Test "Remember me" = true (30-day cookie)
- [ ] 22.4 Test "Remember me" = false (session cookie)
- [ ] 22.5 Test Google OAuth full flow
- [ ] 22.6 Test Apple OAuth full flow
- [ ] 22.7 Test password reset request
- [ ] 22.8 Test password reset completion
- [ ] 22.9 Test logout
- [ ] 22.10 Test protected route blocks unauth users
- [ ] 22.11 Test login redirects back to intended page

### Error Handling
- [ ] 23.1 Test login with wrong password
- [ ] 23.2 Test login with non-existent email
- [ ] 23.3 Test signup with existing email
- [ ] 23.4 Test weak password rejection
- [ ] 23.5 Test network error during auth
- [ ] 23.6 Test expired token
- [ ] 23.7 Test OAuth cancellation
- [ ] 23.8 Verify all errors show friendly messages
- [ ] 23.9 Check no errors in console

### Responsive Design
- [ ] 24.1 Test on mobile (320px width)
- [ ] 24.2 Test on mobile (375px width)
- [ ] 24.3 Test on tablet (768px width)
- [ ] 24.4 Test on desktop (1024px width)
- [ ] 24.5 Test on large desktop (1440px+ width)
- [ ] 24.6 Verify split-screen stacks on mobile
- [ ] 24.7 Verify forms usable on small screens
- [ ] 24.8 Verify no horizontal scroll
- [ ] 24.9 Test image display on all sizes

### Security Audit
- [ ] 25.1 Verify all cookies are `httpOnly`
- [ ] 25.2 Verify all cookies are `secure`
- [ ] 25.3 Verify cookies use `SameSite=Lax`
- [ ] 25.4 Test RLS policies block unauthorized access
- [ ] 25.5 Verify service role key not in client code
- [ ] 25.6 Check session timeout works (30 days)
- [ ] 25.7 Test CSRF protection
- [ ] 25.8 Verify no sensitive data in URLs
- [ ] 25.9 Check password not logged anywhere

### Performance
- [ ] 26.1 Measure login page load time (target <2s)
- [ ] 26.2 Measure dashboard page load time
- [ ] 26.3 Check middleware overhead (target <100ms)
- [ ] 26.4 Optimize images (loginscreen.png)
- [ ] 26.5 Add loading skeletons
- [ ] 26.6 Test auth state persistence (no re-fetch)
- [ ] 26.7 Check bundle size impact (<50KB increase)

---

## Final Checklist ✅

### Documentation
- [ ] Update README with auth setup instructions
- [ ] Document OAuth credential setup process
- [ ] Add troubleshooting guide
- [ ] Document environment variables

### Code Quality
- [ ] Run TypeScript compiler (no errors)
- [ ] Run ESLint (no warnings)
- [ ] Format all files
- [ ] Remove console.logs
- [ ] Remove commented code
- [ ] Add JSDoc comments to public functions

### Deployment Prep
- [ ] Verify `.env.local` NOT committed
- [ ] Verify `.env.example` has placeholders
- [ ] Test with production Supabase project
- [ ] Coordinate with iOS team
- [ ] Create feature branch PR
- [ ] Request code review

---

## Success Criteria ✨

**Must Have (MVP):**
- ✅ Users can sign up with email/password
- ✅ Users can log in with email/password
- ✅ Users can sign in with Google
- ✅ Users can sign in with Apple
- ✅ Users can reset password
- ✅ Dashboard is protected (requires auth)
- ✅ Sessions persist for 30 days
- ✅ UI matches design mockup
- ✅ Works on mobile and desktop
- ✅ No security vulnerabilities

**Nice to Have (Polish):**
- ✅ Smooth animations
- ✅ Loading states everywhere
- ✅ Helpful error messages
- ✅ Fast page loads
- ✅ Perfect responsive design

**Future (Post-Launch):**
- ⏳ Email verification
- ⏳ 2FA support
- ⏳ Profile editing
- ⏳ Avatar upload
- ⏳ Social profile enrichment

---

**Task List Status:** ✅ Ready for Execution
**Total Tasks:** 200+
**Estimated Completion:** 2-3 days
**Last Updated:** 2025-11-08
