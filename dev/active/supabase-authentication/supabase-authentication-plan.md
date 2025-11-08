# Supabase Authentication Implementation Plan

**Last Updated:** 2025-11-08
**Status:** Planning Phase
**Project:** Carve Wiki
**Scope:** Full authentication system with email/password + OAuth (Google & Apple)

---

## Executive Summary

This plan outlines the comprehensive implementation of a production-ready authentication system for Carve Wiki using Supabase Auth. The system will support multiple authentication methods (email/password, Google OAuth, Apple OAuth), implement secure session management with a 30-day expiry, and protect the dashboard routes while keeping wiki content publicly accessible.

**Key Objectives:**
- ✅ Implement multi-method authentication (email/password + OAuth)
- ✅ Create beautiful split-screen login/signup UI matching provided design
- ✅ Secure route protection with Next.js 16 middleware
- ✅ Cross-platform session synchronization (web + iOS app)
- ✅ Production-ready security standards

**Timeline Estimate:** 2-3 days for full implementation and testing
**Risk Level:** Medium (OAuth configuration complexity)

---

## Current State Analysis

### Existing Infrastructure
**Next.js Setup:**
- ✅ Next.js 16.0.1 with App Router
- ✅ React 19.2.0 with Server Components
- ✅ TypeScript 5 with strict mode
- ✅ Tailwind CSS 4 for styling
- ✅ Custom app shell with sidebar/header layout

**Supabase Configuration:**
- ✅ Supabase project exists (ref: erkvljuxjjfgemkovamv)
- ✅ Environment variables configured in .env.example
- ✅ Shared database with iOS app
- ⚠️ Supabase packages NOT yet installed
- ⚠️ No auth infrastructure exists yet

**Current Components:**
- `components/app/app-header.tsx` - Has `isAuthenticated` prop but hardcoded to `false`
- `components/app/app-sidebar.tsx` - Navigation system ready
- `app/dashboard/page.tsx` - Dashboard exists but unprotected
- `app/layout.tsx` - Root layout with header/sidebar shell

**Design Assets:**
- ✅ Login screen design provided (`public/loginscreen.png`)
- ✅ Split-screen layout: form left (40%), image right (60%)
- ✅ Academie color scheme (#ececf1 background)

### Gaps & Requirements
❌ No Supabase client configuration
❌ No authentication pages (login/signup/reset)
❌ No route protection middleware
❌ No session management utilities
❌ No OAuth provider setup
❌ No user profile database schema
❌ No auth hooks or context providers

---

## Proposed Future State

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js 16 App Router                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Public Routes          Auth Routes        Protected Routes│
│  ┌──────────┐          ┌──────────┐       ┌──────────────┐│
│  │ /        │          │ /login   │       │ /dashboard/* ││
│  │ /wiki/*  │          │ /signup  │       │              ││
│  └──────────┘          │ /forgot  │       └──────────────┘│
│                        └──────────┘                        │
│                             │                               │
│                             ▼                               │
│                    ┌─────────────────┐                     │
│                    │  Auth Middleware │                     │
│                    │  (middleware.ts) │                     │
│                    └─────────────────┘                     │
│                             │                               │
│                             ▼                               │
│                    ┌─────────────────┐                     │
│                    │ Supabase Client  │                     │
│                    │  - SSR Client    │                     │
│                    │  - Browser Client│                     │
│                    └─────────────────┘                     │
│                             │                               │
└─────────────────────────────┼───────────────────────────────┘
                              ▼
                     ┌──────────────────┐
                     │  Supabase Cloud  │
                     │                  │
                     │  ┌────────────┐  │
                     │  │ auth.users │  │
                     │  └────────────┘  │
                     │  ┌────────────┐  │
                     │  │  profiles  │  │
                     │  └────────────┘  │
                     │                  │
                     │  OAuth Providers:│
                     │  - Google        │
                     │  - Apple         │
                     └──────────────────┘
```

### User Flows

**1. Email/Password Registration:**
```
User visits /signup
  ↓
Fills email + password
  ↓
Submit → Supabase createUser()
  ↓
Account created (no email verification)
  ↓
Auto-login → Session cookie set
  ↓
Redirect to /dashboard
```

**2. Email/Password Login:**
```
User visits /login
  ↓
Enters credentials + checks "Remember me"
  ↓
Submit → Supabase signInWithPassword()
  ↓
Validation successful
  ↓
Set session cookie (30 days if remember, session-only if not)
  ↓
Redirect to /dashboard
```

**3. OAuth Login (Google/Apple):**
```
User clicks "Sign in with Google/Apple"
  ↓
Redirect to provider OAuth page
  ↓
User approves
  ↓
Provider redirects to /auth/callback
  ↓
Exchange code for session
  ↓
Create/update user profile
  ↓
Set session cookie
  ↓
Redirect to /dashboard
```

**4. Password Reset:**
```
User visits /login → clicks "Forgot password"
  ↓
Enters email at /forgot-password
  ↓
Supabase sends reset email
  ↓
User clicks link → /reset-password?token=xxx
  ↓
Enter new password
  ↓
Submit → Supabase updateUser()
  ↓
Redirect to /login with success message
```

**5. Protected Route Access:**
```
User navigates to /dashboard
  ↓
Middleware checks session cookie
  ↓
Valid? → Allow access
  ↓
Invalid? → Redirect to /login?redirect=/dashboard
```

### Database Schema

```sql
-- Supabase automatically creates auth.users
-- We need to create public.profiles table

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only read/update their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger: Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## Implementation Phases

### Phase 1: Foundation & Dependencies
**Goal:** Install packages and configure Supabase clients
**Estimated Time:** 2-3 hours

**Tasks:**

1. **Install Supabase Packages** [Effort: S]
   - Install `@supabase/supabase-js` and `@supabase/ssr`
   - Verify package.json updated correctly
   - **Acceptance Criteria:**
     - Both packages in dependencies
     - `pnpm install` completes successfully

2. **Create Supabase Client Utilities** [Effort: M]
   - Create `lib/supabase/client.ts` (browser client)
   - Create `lib/supabase/server.ts` (server component client)
   - Create `lib/supabase/middleware.ts` (middleware client)
   - **Acceptance Criteria:**
     - Clients use correct environment variables
     - SSR client properly handles cookies
     - Type safety with TypeScript

3. **Verify Environment Variables** [Effort: S]
   - Ensure `.env.local` exists with real values
   - Add `.env.local` to `.gitignore` (if not already)
   - Test connection to Supabase
   - **Acceptance Criteria:**
     - Can connect to Supabase from server
     - No hardcoded credentials in code

**Dependencies:** None
**Deliverables:** Working Supabase client configuration

---

### Phase 2: Database Setup
**Goal:** Create user profiles table and policies
**Estimated Time:** 1-2 hours

**Tasks:**

4. **Create Profiles Table Schema** [Effort: M]
   - Access Supabase SQL Editor
   - Run profiles table creation SQL
   - Enable Row Level Security
   - Create RLS policies
   - **Acceptance Criteria:**
     - Table visible in Supabase dashboard
     - RLS enabled and policies active
     - Test query returns expected results

5. **Setup User Creation Trigger** [Effort: S]
   - Create `handle_new_user()` function
   - Create `on_auth_user_created` trigger
   - Test with manual user creation
   - **Acceptance Criteria:**
     - Trigger fires on new user signup
     - Profile row auto-created
     - No errors in Supabase logs

6. **Create Profile Helper Functions** [Effort: M]
   - Create `lib/auth/profile.ts`
   - Functions: `getProfile()`, `updateProfile()`
   - Add TypeScript types for Profile
   - **Acceptance Criteria:**
     - Functions properly typed
     - Server-side safe
     - Handles errors gracefully

**Dependencies:** Phase 1 complete
**Deliverables:** Profiles database ready for users

---

### Phase 3: Authentication Infrastructure
**Goal:** Build core auth utilities and middleware
**Estimated Time:** 3-4 hours

**Tasks:**

7. **Create Auth Utility Functions** [Effort: M]
   - Create `lib/auth/session.ts`
   - Functions: `getSession()`, `getUser()`, `requireAuth()`
   - Add server-side validation helpers
   - **Acceptance Criteria:**
     - Functions work in Server Components
     - Proper error handling
     - TypeScript types complete

8. **Build Auth Hooks** [Effort: M]
   - Create `lib/auth/hooks.ts`
   - Hook: `useAuth()` - returns user + loading state
   - Hook: `useUser()` - returns user profile
   - Hook: `useSignOut()` - logout function
   - **Acceptance Criteria:**
     - Hooks work in Client Components
     - Reactive to auth state changes
     - Proper loading states

9. **Implement Route Protection Middleware** [Effort: L]
   - Create `middleware.ts` at project root
   - Protect `/dashboard/*` routes
   - Redirect unauthenticated users to `/login`
   - Redirect authenticated users away from `/login`
   - Preserve redirect destination in query params
   - **Acceptance Criteria:**
     - Protected routes block unauth users
     - Login redirect works correctly
     - After login, returns to intended page
     - No infinite redirect loops

**Dependencies:** Phase 1 & 2 complete
**Deliverables:** Auth system core ready

---

### Phase 4: Login/Signup Pages
**Goal:** Build authentication UI matching design
**Estimated Time:** 4-5 hours

**Tasks:**

10. **Create Auth Layout Group** [Effort: M]
    - Create `app/(auth)/layout.tsx`
    - Remove sidebar/header for auth pages
    - Add split-screen container structure
    - **Acceptance Criteria:**
      - Auth pages use different layout
      - No sidebar visible on auth pages
      - Clean, minimal layout

11. **Build Login Page** [Effort: L]
    - Create `app/(auth)/login/page.tsx`
    - Split-screen layout: form left, image right
    - Email/password form with validation
    - "Remember me" checkbox
    - "Forgot password?" link
    - "Sign up" link
    - Loading states and error display
    - **Acceptance Criteria:**
      - Matches design mockup
      - Form validation works
      - Submits to Supabase auth
      - Redirects to dashboard on success
      - Shows errors inline

12. **Build Signup Page** [Effort: M]
    - Create `app/(auth)/signup/page.tsx`
    - Same layout as login
    - Email + password + confirm password
    - Password strength indicator
    - Terms & privacy policy checkboxes
    - **Acceptance Criteria:**
      - Password confirmation matches
      - Strong password validation
      - Creates user in Supabase
      - Auto-login after signup

13. **Create OAuth Button Components** [Effort: M]
    - Create `components/auth/oauth-buttons.tsx`
    - Google Sign-in button (white with logo)
    - Apple Sign-in button (black with logo)
    - Handle OAuth redirects
    - **Acceptance Criteria:**
      - Buttons styled correctly
      - Click initiates OAuth flow
      - Proper loading states

14. **Implement Password Reset Flow** [Effort: M]
    - Create `app/(auth)/forgot-password/page.tsx`
    - Create `app/(auth)/reset-password/page.tsx`
    - Email input form for reset request
    - New password form for reset completion
    - **Acceptance Criteria:**
      - Reset email sent successfully
      - Token validation works
      - Password update succeeds
      - Redirect to login after reset

**Dependencies:** Phase 3 complete
**Deliverables:** Complete authentication UI

---

### Phase 5: OAuth Provider Configuration
**Goal:** Enable Google and Apple OAuth
**Estimated Time:** 2-3 hours

**Tasks:**

15. **Setup Google OAuth** [Effort: L]
    - Create OAuth client in Google Cloud Console
    - Configure redirect URIs in Google
    - Add client ID/secret to Supabase dashboard
    - Add callback route handler
    - Test full OAuth flow
    - **Acceptance Criteria:**
      - Google login button works
      - Redirects to Google correctly
      - Returns to app after approval
      - User created/logged in
      - Session persists

16. **Setup Apple OAuth** [Effort: XL]
    - Create Service ID in Apple Developer
    - Configure domains and redirect URLs
    - Generate client secret (JWT)
    - Add credentials to Supabase dashboard
    - Create callback handler
    - Test full OAuth flow
    - **Acceptance Criteria:**
      - Apple login button works
      - Apple ID flow completes
      - User profile synced
      - Session established

17. **Create OAuth Callback Handler** [Effort: M]
    - Create `app/auth/callback/route.ts`
    - Exchange OAuth code for session
    - Handle both Google and Apple
    - Error handling for failed auth
    - **Acceptance Criteria:**
      - Handles both providers
      - Sets session cookie
      - Redirects to dashboard
      - Logs errors appropriately

**Dependencies:** Phase 4 complete
**Deliverables:** Full OAuth integration

---

### Phase 6: Dashboard Integration
**Goal:** Connect auth to existing dashboard
**Estimated Time:** 2-3 hours

**Tasks:**

18. **Update App Header** [Effort: M]
    - Modify `components/app/app-header.tsx`
    - Make `isAuthenticated` dynamic from session
    - Show user avatar/name when logged in
    - Add logout button
    - **Acceptance Criteria:**
      - Header updates based on auth state
      - User info displays correctly
      - Logout clears session

19. **Create Protected Dashboard Layout** [Effort: S]
    - Create `app/(protected)/layout.tsx`
    - Verify auth server-side
    - Redirect to login if needed
    - **Acceptance Criteria:**
      - Dashboard requires auth
      - Clean redirect for unauth users
      - No flash of content

20. **Implement Logout Functionality** [Effort: S]
    - Create `app/api/auth/logout/route.ts`
    - Clear Supabase session
    - Clear cookies
    - Redirect to homepage
    - **Acceptance Criteria:**
      - Logout clears all session data
      - User redirected to /
      - Cannot access dashboard after logout

21. **Update Root Layout** [Effort: S]
    - Modify `app/layout.tsx`
    - Fetch user session server-side
    - Pass auth state to header
    - **Acceptance Criteria:**
      - Session checked on every page load
      - Header updates correctly
      - No hydration errors

**Dependencies:** Phase 3, 4 complete
**Deliverables:** Fully integrated auth system

---

### Phase 7: Testing & Polish
**Goal:** Ensure production-ready quality
**Estimated Time:** 3-4 hours

**Tasks:**

22. **End-to-End Auth Testing** [Effort: L]
    - Test email/password signup
    - Test email/password login
    - Test "Remember me" functionality
    - Test Google OAuth flow
    - Test Apple OAuth flow
    - Test password reset flow
    - Test logout
    - Test protected route access
    - **Acceptance Criteria:**
      - All flows work without errors
      - Sessions persist correctly
      - Redirects work as expected

23. **Error Handling & Edge Cases** [Effort: M]
    - Test with invalid credentials
    - Test with network errors
    - Test with expired tokens
    - Test concurrent sessions
    - Add friendly error messages
    - **Acceptance Criteria:**
      - All errors handled gracefully
      - User-friendly error messages
      - No console errors
      - Loading states during operations

24. **Responsive Design Testing** [Effort: M]
    - Test on mobile (320px-768px)
    - Test on tablet (768px-1024px)
    - Test on desktop (1024px+)
    - Verify split-screen layout adapts
    - **Acceptance Criteria:**
      - Looks good on all screen sizes
      - Forms usable on mobile
      - Image handling on small screens
      - No horizontal scroll

25. **Security Audit** [Effort: M]
    - Verify HTTPS-only cookies
    - Check CSRF protection
    - Validate RLS policies
    - Test session timeout
    - Review exposed endpoints
    - **Acceptance Criteria:**
      - All cookies secure & httpOnly
      - CSRF tokens in place
      - RLS prevents unauthorized access
      - Sessions expire correctly
      - No sensitive data exposed

26. **Performance Optimization** [Effort: S]
    - Optimize image loading
    - Add loading skeletons
    - Prefetch dashboard route
    - Check bundle size
    - **Acceptance Criteria:**
      - Fast page loads
      - Smooth transitions
      - No layout shift
      - Bundle size acceptable

**Dependencies:** All previous phases
**Deliverables:** Production-ready auth system

---

## Risk Assessment & Mitigation

### High-Risk Items

**1. OAuth Provider Configuration Complexity**
- **Risk:** Apple OAuth is notoriously difficult to configure
- **Impact:** HIGH - Could block entire OAuth implementation
- **Mitigation:**
  - Start with Google OAuth first (simpler)
  - Allocate extra time for Apple setup
  - Follow Supabase docs exactly
  - Test in staging environment first
- **Contingency:** Launch with email/password + Google, add Apple later

**2. Shared Database with iOS App**
- **Risk:** Schema changes could break iOS app
- **Impact:** HIGH - Could affect live mobile users
- **Mitigation:**
  - Review existing iOS app schema
  - Only add new tables, don't modify auth.users
  - Test with iOS team before deploying
  - Use migrations for schema changes
- **Contingency:** Revert schema if iOS breaks

**3. Session Management Across Platforms**
- **Risk:** Web sessions might not sync with iOS app
- **Impact:** MEDIUM - Users log in twice
- **Mitigation:**
  - Use Supabase's built-in session handling
  - Test cross-platform login scenarios
  - Document session refresh flow
- **Contingency:** Accept separate sessions initially

### Medium-Risk Items

**4. Middleware Performance**
- **Risk:** Checking auth on every request could slow site
- **Impact:** MEDIUM - Poor user experience
- **Mitigation:**
  - Use Edge Runtime for middleware
  - Only check protected routes
  - Cache session data
  - Monitor performance metrics

**5. Email Deliverability**
- **Risk:** Password reset emails might go to spam
- **Impact:** MEDIUM - Users can't reset passwords
- **Mitigation:**
  - Configure SPF/DKIM in Supabase
  - Test with multiple email providers
  - Add clear instructions on email page

### Low-Risk Items

**6. UI/UX Consistency**
- **Risk:** Auth pages might not match design exactly
- **Impact:** LOW - Minor visual issues
- **Mitigation:**
  - Reference design mockup frequently
  - Get design approval before finalizing
  - Use exact colors/spacing from design

---

## Success Metrics

### Functional Metrics
✅ **Authentication Works:**
- [ ] Users can sign up with email/password
- [ ] Users can log in with email/password
- [ ] Users can sign in with Google
- [ ] Users can sign in with Apple
- [ ] Users can reset forgotten passwords
- [ ] Users can log out successfully

✅ **Security Standards Met:**
- [ ] All cookies are httpOnly and secure
- [ ] RLS policies prevent unauthorized data access
- [ ] Sessions expire after 30 days
- [ ] CSRF protection enabled
- [ ] No sensitive data in client-side code

✅ **User Experience:**
- [ ] Login/signup forms match design mockup
- [ ] Error messages are clear and helpful
- [ ] Loading states provide feedback
- [ ] Redirects work smoothly
- [ ] Mobile experience is polished

### Technical Metrics
✅ **Performance:**
- [ ] Auth pages load < 2 seconds
- [ ] Middleware adds < 100ms to requests
- [ ] Bundle size increase < 50KB

✅ **Code Quality:**
- [ ] TypeScript types for all auth functions
- [ ] No console errors in browser
- [ ] ESLint passes with no warnings
- [ ] Code follows project conventions

---

## Required Resources & Dependencies

### External Services
- **Supabase Project:** Already exists (erkvljuxjjfgemkovamv.supabase.co)
- **Google Cloud Console:** Need access to create OAuth client
- **Apple Developer Account:** Need access to create Service ID

### NPM Packages
```json
{
  "@supabase/supabase-js": "^2.39.0",
  "@supabase/ssr": "^0.1.0"
}
```

### Design Assets
- ✅ `public/loginscreen.png` - Hero image for auth pages
- ✅ Academie color scheme reference

### Knowledge Requirements
- Next.js 16 App Router (Server Actions, Server Components)
- Supabase Auth API
- OAuth 2.0 flow (Google & Apple)
- Cookie-based session management
- Row Level Security (RLS)

### Team Dependencies
- **iOS Team:** Need to verify shared database schema
- **Design:** Approval on final auth UI
- **DevOps:** Access to Supabase production project

---

## Timeline Estimates

### Aggressive Timeline (2 days)
- **Day 1 Morning:** Phase 1-2 (Foundation + Database)
- **Day 1 Afternoon:** Phase 3 (Auth Infrastructure)
- **Day 2 Morning:** Phase 4 (Login/Signup UI)
- **Day 2 Afternoon:** Phase 5-6 (OAuth + Dashboard)
- **Day 2 Evening:** Phase 7 (Testing)

### Realistic Timeline (3 days)
- **Day 1:** Phase 1-3 (Foundation + Infrastructure)
- **Day 2:** Phase 4-5 (UI + OAuth)
- **Day 3:** Phase 6-7 (Dashboard Integration + Testing)

### Conservative Timeline (4 days)
- **Day 1:** Phase 1-2 (Foundation)
- **Day 2:** Phase 3-4 (Infrastructure + UI)
- **Day 3:** Phase 5 (OAuth - extra time for Apple)
- **Day 4:** Phase 6-7 (Dashboard + Testing)

**Recommendation:** Plan for 3-day timeline with buffer for OAuth complexity.

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Get OAuth credentials** from Google/Apple
3. **Confirm iOS team** aware of database changes
4. **Create feature branch:** `feature/supabase-auth`
5. **Begin Phase 1:** Install Supabase packages

---

## References & Documentation

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js 16 Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign In Setup](https://developer.apple.com/sign-in-with-apple/)

---

**Plan Status:** ✅ Ready for Implementation
**Prepared By:** Claude Code
**Date:** 2025-11-08
