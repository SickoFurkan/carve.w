# Supabase Authentication - Context & Decisions

**Last Updated:** 2025-11-08
**Project:** Carve Wiki Authentication System

---

## Key Context

### Project Background
Carve Wiki is a health and fitness knowledge platform with:
- **Public wiki content** (no auth required)
- **Protected dashboard** (requires authentication)
- **Shared Supabase database** with iOS mobile app
- **Modern tech stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4

### Design Philosophy
- **User Experience First:** Beautiful, intuitive auth UI matching brand aesthetics
- **Security by Default:** Industry-standard practices (HTTPS, RLS, CSRF protection)
- **Cross-Platform:** Seamless experience between web and iOS app
- **Progressive Enhancement:** Start with core features, add advanced features later

---

## Critical File Locations

### Existing Files (Do Not Modify Structure)
```
app/
├── layout.tsx                              # Root layout with header/sidebar
├── page.tsx                                # Homepage (public)
├── dashboard/page.tsx                      # Dashboard (to be protected)
├── wiki/page.tsx                           # Wiki (public)

components/
├── app/
│   ├── app-header.tsx                      # Has isAuthenticated prop (currently false)
│   ├── app-sidebar.tsx                     # Navigation system
│   └── app-shell.tsx                       # Layout shell

lib/
├── utils.ts                                # cn() utility
└── navigation/                             # Navigation configs
    ├── carve-navigation.ts
    ├── wiki-navigation.ts
    └── dashboard-navigation.ts

public/
└── loginscreen.png                         # Hero image for auth pages
```

### Files to Create
```
lib/
├── supabase/
│   ├── client.ts                           # Browser Supabase client
│   ├── server.ts                           # Server Component client
│   └── middleware.ts                       # Middleware client
│
└── auth/
    ├── session.ts                          # Session management utilities
    ├── hooks.ts                            # useAuth, useUser hooks
    └── profile.ts                          # Profile CRUD operations

app/
├── (auth)/                                 # Auth layout group
│   ├── layout.tsx                          # Auth-specific layout
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── forgot-password/page.tsx
│   └── reset-password/page.tsx
│
├── (protected)/                            # Protected layout group
│   ├── layout.tsx                          # Auth check + redirect
│   └── dashboard/page.tsx                  # Move from app/dashboard/
│
├── auth/
│   └── callback/route.ts                   # OAuth callback handler
│
└── api/
    └── auth/
        └── logout/route.ts                 # Logout endpoint

components/
└── auth/
    ├── login-form.tsx                      # Email/password form
    ├── signup-form.tsx                     # Registration form
    ├── oauth-buttons.tsx                   # Google/Apple buttons
    ├── password-reset-form.tsx             # Reset request form
    └── auth-error.tsx                      # Error display component

middleware.ts                               # Route protection (root level)
```

---

## Key Technical Decisions

### 1. Authentication Method
**Decision:** Multi-method authentication
- Email/password (primary)
- Google OAuth
- Apple OAuth

**Rationale:**
- Email/password: Universal, no external dependencies
- Google: Most users have Google accounts
- Apple: Required for iOS app (Apple policy)

**Alternatives Considered:**
- ❌ Email/password only: Too limiting
- ❌ OAuth only: Excludes users without social accounts
- ❌ Magic links: Less familiar UX

---

### 2. Session Management Strategy
**Decision:** 30-day cookie-based sessions with "Remember Me" option
- Checked: 30-day persistent cookie
- Unchecked: Session-only cookie (expires on browser close)

**Rationale:**
- Users expect to stay logged in
- Security option for shared devices
- Industry standard pattern

**Technical Implementation:**
```typescript
// In Supabase client options
{
  auth: {
    persistSession: true,
    storageKey: 'carve-auth',
    storage: cookies, // Server-side
    detectSessionInUrl: true, // For OAuth callbacks
  }
}
```

---

### 3. Route Protection Strategy
**Decision:** Next.js Middleware with edge runtime

**Protected Routes:**
- `/dashboard/*` - All dashboard pages

**Public Routes:**
- `/` - Homepage
- `/wiki/*` - All wiki content
- `/(auth)/*` - Auth pages

**Implementation Pattern:**
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)
  const { data: { session } } = await supabase.auth.getSession()

  // Protect /dashboard/*
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect('/login?redirect=' + request.nextUrl.pathname)
    }
  }

  // Redirect authenticated users away from auth pages
  if (request.nextUrl.pathname.startsWith('/login') ||
      request.nextUrl.pathname.startsWith('/signup')) {
    if (session) {
      return NextResponse.redirect('/dashboard')
    }
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup']
}
```

**Rationale:**
- Edge runtime = fast auth checks
- Middleware runs before page renders (no flash)
- Redirect preservation maintains user intent

---

### 4. Email Verification
**Decision:** NO email verification required

**Rationale:**
- User explicitly requested direct access
- Reduces signup friction
- Wiki is not handling sensitive health data
- Can add later if needed

**Security Mitigation:**
- Rate limiting on signups (Supabase built-in)
- Captcha can be added if spam becomes issue

---

### 5. Database Schema Design
**Decision:** Minimal profiles table, extend as needed

**Schema:**
```sql
public.profiles (
  id UUID PRIMARY KEY,           -- Matches auth.users.id
  email TEXT NOT NULL,           -- Synced from auth.users
  full_name TEXT,                -- Optional, can fill later
  avatar_url TEXT,               -- Optional, can fill later
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

**Rationale:**
- User requested minimal signup (just email/password)
- Additional fields can be filled later in dashboard
- Keeps signup flow fast and simple
- Aligns with "direct access" requirement

**Future Extensions:**
- Health metrics
- Fitness goals
- Notification preferences

---

### 6. OAuth Provider Priority
**Decision:** Implement Google and Apple simultaneously

**Rationale:**
- User explicitly requested both
- Google is easier (validates Apple setup process)
- Apple required for iOS app anyway
- Better to complete OAuth fully in one phase

**Implementation Order:**
1. Setup Google OAuth first (simpler, faster feedback)
2. Use Google as template for Apple
3. Test both flows thoroughly

---

### 7. Error Handling Strategy
**Decision:** Inline errors with toast for system errors

**Patterns:**
- **Form validation errors:** Show under field
- **Auth errors (wrong password):** Show under form
- **Network errors:** Toast notification
- **OAuth errors:** Redirect to error page with message

**Example:**
```typescript
// Login form error display
{errors.email && (
  <p className="text-sm text-red-600 mt-1">{errors.email}</p>
)}

// System error toast
if (error.type === 'network') {
  toast.error('Connection failed. Please try again.')
}
```

---

### 8. UI Layout Decision
**Decision:** Split-screen layout for auth pages (40/60 split)

**Specifications:**
- **Left 40%:** Form content
  - White background
  - Centered vertically
  - Max width 400px
  - Padding: 3rem

- **Right 60%:** Hero image
  - `public/loginscreen.png`
  - Object-fit: cover
  - Fixed background on scroll (if long form)

**Responsive Behavior:**
- **Desktop (>1024px):** Side-by-side split
- **Tablet (768-1024px):** 50/50 split
- **Mobile (<768px):** Stack vertically, form on top, shorter image below

**Rationale:**
- Matches user-provided design mockup
- Visually appealing
- Common pattern (Stripe, Linear, Notion)

---

### 9. TypeScript Strategy
**Decision:** Strict typing for all auth functions

**Type Definitions:**
```typescript
// lib/auth/types.ts
export type User = {
  id: string
  email: string
  created_at: string
}

export type Profile = {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export type AuthState = {
  user: User | null
  profile: Profile | null
  loading: boolean
  error: Error | null
}

export type SignUpData = {
  email: string
  password: string
}

export type SignInData = {
  email: string
  password: string
  remember?: boolean
}
```

**Rationale:**
- Prevents auth-related bugs
- Better IDE autocomplete
- Easier refactoring
- Self-documenting code

---

### 10. Shared Database Considerations
**Decision:** Additive-only changes, coordinate with iOS team

**Rules:**
1. **NEVER modify auth.users table** (managed by Supabase)
2. **Only ADD tables** (never alter existing)
3. **Use RLS policies** for all custom tables
4. **Version migrations** for rollback safety
5. **Test with iOS team** before production deploy

**Communication Protocol:**
- Share schema changes in advance
- Document new tables in shared docs
- Test iOS app after web deployment
- Have rollback plan ready

---

## Environment Variables

### Required Variables
```bash
# .env.local (NOT committed to git)

# Supabase Connection
NEXT_PUBLIC_SUPABASE_URL=https://erkvljuxjjfgemkovamv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server-only (for API routes, server actions)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OAuth Credentials (to be added after provider setup)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

APPLE_CLIENT_ID=com.carve.wiki.signin
APPLE_CLIENT_SECRET=xxx  # Generated JWT, expires every 6 months
```

### Variable Usage
- `NEXT_PUBLIC_*` = Client-side accessible (browser)
- Others = Server-side only (API routes, Server Components)

---

## Dependencies

### NPM Packages to Install
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",  // Supabase client
    "@supabase/ssr": "^0.1.0"             // SSR helpers for Next.js
  }
}
```

### Existing Dependencies (Already Installed)
- `next`: 16.0.1
- `react`: 19.2.0
- `typescript`: ^5
- `tailwindcss`: ^4
- `clsx`: ^2.1.1

---

## Integration Points

### 1. Header Component Update
**File:** `components/app/app-header.tsx`
**Changes:**
- Make `isAuthenticated` prop dynamic (from session)
- Add user avatar/name display when logged in
- Add logout button
- Keep current UI structure

### 2. Dashboard Protection
**File:** `app/dashboard/page.tsx`
**Changes:**
- Move to `app/(protected)/dashboard/page.tsx`
- Add server-side auth check in layout
- Keep current dashboard content

### 3. Root Layout
**File:** `app/layout.tsx`
**Changes:**
- Fetch session server-side
- Pass `isAuthenticated` to header
- Keep current shell structure

---

## Testing Strategy

### Manual Testing Checklist
- [ ] Sign up with new email/password
- [ ] Log in with existing credentials
- [ ] Log in with "Remember me" checked
- [ ] Log in with "Remember me" unchecked
- [ ] Access protected route while logged out (should redirect)
- [ ] Access /login while logged in (should redirect to dashboard)
- [ ] Sign in with Google
- [ ] Sign in with Apple
- [ ] Request password reset
- [ ] Complete password reset flow
- [ ] Log out
- [ ] Try to access dashboard after logout

### Edge Cases to Test
- [ ] Submit empty form
- [ ] Submit invalid email format
- [ ] Submit weak password
- [ ] Submit mismatched password confirmation
- [ ] Network failure during auth
- [ ] Expired session token
- [ ] Concurrent sessions (multiple tabs/devices)
- [ ] OAuth cancellation (user declines)
- [ ] OAuth error (provider down)

---

## Rollback Plan

### If Critical Issue Found

**Step 1:** Disable auth middleware
```typescript
// middleware.ts - Comment out protection
export async function middleware(request: NextRequest) {
  // Temporarily allow all access
  return NextResponse.next()
}
```

**Step 2:** Revert to hardcoded `isAuthenticated={false}`
```typescript
// app/layout.tsx
<AppHeader isAuthenticated={false} />
```

**Step 3:** Hide auth UI
```typescript
// Temporarily redirect auth pages to homepage
if (pathname.startsWith('/login')) {
  redirect('/')
}
```

**Step 4:** Fix issue in branch, test, redeploy

---

## Future Enhancements (Out of Scope)

### Phase 2 Features (Post-Launch)
- [ ] Social profile enrichment (pull name/avatar from OAuth)
- [ ] Two-factor authentication (2FA)
- [ ] Session management dashboard (view active sessions)
- [ ] Email verification (if spam becomes issue)
- [ ] Password strength requirements config
- [ ] Account deletion flow
- [ ] Profile editing UI
- [ ] Avatar upload
- [ ] Notification preferences

### Advanced Features (Later)
- [ ] Single Sign-On (SSO) for organizations
- [ ] Role-based access control (RBAC)
- [ ] Audit logging
- [ ] Admin dashboard
- [ ] User analytics
- [ ] A/B testing on auth flows

---

## References

### Documentation
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js 16 App Router](https://nextjs.org/docs/app)
- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)

### Code Examples
- [Supabase Next.js Example](https://github.com/supabase/examples/tree/main/nextjs)
- [Next.js Auth Patterns](https://nextjs.org/docs/app/building-your-application/authentication)

### Design References
- User-provided: `public/loginscreen.png`
- Color scheme: Academie project (#ececf1)

---

**Context Status:** ✅ Complete and Ready
**Last Reviewed:** 2025-11-08
