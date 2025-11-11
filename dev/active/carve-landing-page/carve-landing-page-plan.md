# Carve Landing Page: Marketing Website Implementation Plan

**Last Updated: 2025-01-11**

---

## Executive Summary

Transform the current placeholder homepage (`app/page.tsx`) into a high-converting marketing website for the Carve mobile fitness app. The landing page will showcase the app's unique features (tracking + gamification + social), provide live social proof via public leaderboards, and drive conversions to app downloads (waitlist → store links when launched).

**Core Vision**: Modern, energetic marketing page with "track everything" positioning, featuring live hiscores as social proof and interactive demo.

**Key Features**:
- Hero section with app download CTA (flexible: waitlist → store links)
- Live "hiscores" widget (top 5 + real-time activity feed)
- Core features showcase (tracking, gamification, social)
- Interactive demo at `/demo` (standalone route, no auth)
- Dedicated `/hiscores` page (full leaderboards, multiple tabs, filters)
- GDPR-compliant consent model for public leaderboards
- Multi-layer anti-abuse protection for waitlist
- Conversion-focused (app download primary, web dashboard secondary)

**Revised Approach**: Ship in **3 iterative releases**, not one monolithic MVP.

---

## Release Strategy: Ship Early, Ship Often

### ⚡ Release 1: Lean MVP (Week 1-2) → **SHIP THIS**

**Goal**: Get a functional waitlist live ASAP, even without hiscores

**Scope** (MUST have):
- ✅ Hero section with headline + CTA
- ✅ Waitlist form (double opt-in + Turnstile bot protection)
- ✅ Basic navigation (responsive)
- ✅ SEO metadata (title, description, OG tags)
- ✅ Privacy Policy + Terms of Service pages
- ✅ Email verification flow
- ✅ Analytics setup (Plausible)

**Success Criteria**:
- [ ] Landing page live at carve.wiki
- [ ] Waitlist accepting verified emails
- [ ] Lighthouse score >90
- [ ] Mobile responsive (375px+)

**Timeline**: 10-15 hours (1-2 weeks part-time)

---

### 🏆 Release 2: Social Proof (Week 3) → **SHIP v1.1**

**Goal**: Add live hiscores widget for social proof

**Scope** (SHOULD have):
- ✅ Top 5 hiscores widget (SSR + client polling)
- ✅ Live activity feed (scrolling)
- ✅ Edge caching (30s revalidation)
- ✅ Empty state handling (seed data if <10 users)
- ✅ Leaderboard consent migration (opt-in)

**Success Criteria**:
- [ ] Hiscores widget displays live data
- [ ] Caching reduces DB load
- [ ] Empty states graceful
- [ ] Privacy policies enforced

**Timeline**: 8-12 hours (1 week part-time)

---

### 🎨 Release 3: Showcase + Demo (Week 4-5) → **SHIP v1.2**

**Goal**: Full feature showcase and interactive demo

**Scope** (SHOULD have):
- ✅ Feature sections (3 cards: Tracking, Gamification, Social)
- ✅ `/demo` route (standalone, no auth)
- ✅ Demo banner + CTAs
- ✅ App screenshots/mockups

**Success Criteria**:
- [ ] Feature sections tell compelling story
- [ ] Demo works independently of auth
- [ ] Professional visuals

**Timeline**: 12-16 hours (1.5-2 weeks part-time)

---

### 🚀 Post-MVP (Week 6+) → **Future Releases**

**Scope** (COULD have):
- Full `/hiscores` page with all tabs (Overall, Workouts, Streaks, PRs)
- Gamification showcase section
- Performance optimizations (code splitting, image optimization)
- A/B testing framework
- Testimonials section

**Timeline**: TBD based on priorities

---

## Current State Analysis

### Existing Infrastructure
- **Framework**: Next.js 16 with React 19, TypeScript ✅
- **Database**: Supabase with user_stats, profiles, activity_feed tables ✅
- **Styling**: Tailwind CSS 4 ✅
- **Icons**: Lucide React ✅
- **Dashboard**: Being built 🚧

### Gaps to Address
1. ❌ No app-specific marketing content
2. ❌ No waitlist system (double opt-in, anti-abuse)
3. ❌ No privacy policy/terms pages
4. ❌ No live hiscores/social proof
5. ❌ No feature showcase
6. ❌ No interactive demo route
7. ❌ No full `/hiscores` page

---

## Architecture Overview

### Page Structure (Post All Releases)

```
/ (Landing Page)
├── Hero Section
│   ├── Headline + Subheadline
│   ├── App mockup/screenshot
│   └── Waitlist Form (or Store Links)
├── Live Hiscores Widget [Release 2]
│   ├── Top 5 global rankings
│   ├── Live activity feed
│   └── Link to /hiscores
├── Core Features [Release 3]
│   ├── Workout Tracking
│   ├── Gamification
│   └── Social Features
├── Demo CTA [Release 3]
│   └── "Try Demo Dashboard" → /demo
└── Final CTA
    └── Waitlist count social proof

/demo (Standalone Demo - No Auth) [Release 3]
├── DemoBanner ("This is demo data")
├── DashboardLayout (reused components)
└── Sample data (client-side only)

/hiscores (Public Leaderboards) [Post-MVP]
├── Tabs (Overall, Workouts, Streaks, PRs)
├── Filters (timeframe)
├── Leaderboard table
└── Live activity feed

/privacy (Privacy Policy) [Release 1]
/terms (Terms of Service) [Release 1]
```

### Component Reuse Strategy

**Landing Page Components** (new):
- `components/landing/HeroSection.tsx`
- `components/landing/HiscoresWidget.tsx` [Release 2]
- `components/landing/FeatureCard.tsx` [Release 3]
- `components/landing/WaitlistForm.tsx` [Release 1]

**Demo Route** (new):
- `app/demo/page.tsx` [Release 3]
- `lib/demo/sample-data.ts` [Release 3]
- `components/dashboard/DemoBanner.tsx` [Release 3]

**Dashboard Components** (reuse):
- `components/dashboard/*` → Used in `/demo` with sample data
- NO duplication → same components, different data source

---

## 🎯 Release 1: Lean MVP (MUST Have)

**Timeline**: Week 1-2 (10-15 hours)

### R1.1: Enhanced Waitlist Database [Effort: M]

**Create Migration**: `YYYYMMDDHHMMSS_create_waitlist.sql`

```sql
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT, -- 'hero', 'footer', 'demo'

  -- ✅ Consent tracking (GDPR)
  consent_given BOOLEAN DEFAULT FALSE,
  consent_version TEXT DEFAULT 'privacy-v1.0',
  consent_timestamp TIMESTAMPTZ,
  verification_token UUID DEFAULT gen_random_uuid(),
  verified_at TIMESTAMPTZ,

  -- ✅ Lifecycle
  notified BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ, -- Soft delete
  opt_out_reason TEXT,

  -- ✅ Anti-abuse
  ip_address INET,
  user_agent TEXT,

  CONSTRAINT email_verified_check CHECK (
    verified_at IS NULL OR consent_given = TRUE
  )
);

CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_verification ON waitlist(verification_token)
  WHERE verified_at IS NULL;
CREATE INDEX idx_waitlist_verified ON waitlist(verified_at DESC)
  WHERE verified_at IS NOT NULL;

-- RLS
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waitlist"
  ON waitlist FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only service role can read"
  ON waitlist FOR SELECT
  USING (false); -- Only via service role key
```

**Acceptance**:
- [ ] Migration runs successfully
- [ ] Can insert emails
- [ ] Verification token auto-generated
- [ ] Email uniqueness enforced

---

### R1.2: Install Dependencies [Effort: S]

```bash
pnpm add zod                           # Email validation
pnpm add @marsidev/react-turnstile     # Bot protection
```

**Rationale**:
- `zod`: Schema validation (email format, required fields)
- `@marsidev/react-turnstile`: Cloudflare Turnstile (free, no captcha UX)

**Acceptance**:
- [ ] Dependencies installed
- [ ] No conflicts

---

### R1.3: Waitlist API Route (Multi-Layer Protection) [Effort: L]

**Create**: `app/api/waitlist/route.ts`

```typescript
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const disposableDomains = [
  'tempmail.com', 'guerrillamail.com', '10minutemail.com',
  'mailinator.com', 'throwaway.email'
];

const schema = z.object({
  email: z.string()
    .email('Invalid email format')
    .refine(email => {
      const domain = email.split('@')[1];
      return !disposableDomains.includes(domain);
    }, 'Disposable email addresses not allowed'),
  turnstileToken: z.string().min(1, 'Bot verification required'),
  consentGiven: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the privacy policy' })
  }),
  source: z.enum(['hero', 'footer', 'demo']).default('hero')
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, turnstileToken, source } = parsed.data;

    // Layer 1: Verify Turnstile token
    const verifyRes = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: turnstileToken
        })
      }
    );

    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      return Response.json(
        { error: 'Bot verification failed' },
        { status: 403 }
      );
    }

    // Layer 2: Insert to waitlist
    const supabase = createClient();
    const { data, error } = await supabase
      .from('waitlist')
      .insert({
        email,
        source,
        consent_version: 'privacy-v1.0',
        consent_timestamp: new Date().toISOString(),
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      })
      .select('id, verification_token')
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return Response.json(
          { error: 'This email is already on the waitlist' },
          { status: 409 }
        );
      }
      throw error;
    }

    // Layer 3: Send verification email
    await sendVerificationEmail(email, data.verification_token);

    // Layer 4: Track analytics
    // await track('waitlist_signup_initiated', { source });

    return Response.json({
      success: true,
      message: 'Check your inbox to verify your email'
    });

  } catch (error) {
    console.error('Waitlist signup error:', error);
    return Response.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

async function sendVerificationEmail(email: string, token: string) {
  // TODO: Implement with Resend or SendGrid
  // For now, just log
  console.log(`Verification link: ${process.env.NEXT_PUBLIC_URL}/api/waitlist/verify?token=${token}`);
}
```

**Create**: `app/api/waitlist/verify/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return Response.json({ error: 'Missing token' }, { status: 400 });
  }

  const supabase = createClient();

  // Update waitlist entry
  const { error } = await supabase
    .from('waitlist')
    .update({
      verified_at: new Date().toISOString(),
      consent_given: true
    })
    .eq('verification_token', token)
    .is('verified_at', null); // Only verify once

  if (error) {
    redirect('/?verify=error');
  }

  redirect('/?verify=success');
}
```

**Acceptance**:
- [ ] API validates email format
- [ ] Blocks disposable email domains
- [ ] Verifies Turnstile token
- [ ] Prevents duplicate signups
- [ ] Sends verification email
- [ ] Verification link works

---

### R1.4: Waitlist Form Component [Effort: M]

**Create**: `components/landing/WaitlistForm.tsx`

```tsx
'use client'

import { useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

type FormState = 'idle' | 'loading' | 'success' | 'error';

export function WaitlistForm({ source = 'hero' }: { source?: string }) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [state, setState] = useState<FormState>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('loading');
    setError('');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          turnstileToken,
          consentGiven: consent,
          source
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setState('error');
        return;
      }

      setState('success');
      setEmail('');
      setConsent(false);
    } catch (err) {
      setError('Network error. Please try again.');
      setState('error');
    }
  };

  if (state === 'success') {
    return (
      <div className="rounded-lg bg-green-50 p-6 text-center">
        <h3 className="text-lg font-semibold text-green-900">
          You're almost there! 🎉
        </h3>
        <p className="mt-2 text-sm text-green-700">
          Check your inbox and click the verification link to confirm your spot.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        disabled={state === 'loading'}
      />

      <div className="flex items-start gap-2">
        <Checkbox
          checked={consent}
          onCheckedChange={checked => setConsent(!!checked)}
          disabled={state === 'loading'}
        />
        <label className="text-sm text-gray-600">
          I agree to receive launch updates and accept the{' '}
          <a href="/privacy" className="underline">Privacy Policy</a>
        </label>
      </div>

      <Turnstile
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        onSuccess={setTurnstileToken}
      />

      <Button
        type="submit"
        disabled={!email || !consent || !turnstileToken || state === 'loading'}
        className="w-full"
      >
        {state === 'loading' ? 'Joining...' : 'Join Waitlist'}
      </Button>

      {state === 'error' && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </form>
  );
}
```

**Acceptance**:
- [ ] Form validates email
- [ ] Consent checkbox required
- [ ] Turnstile widget renders
- [ ] Loading state shows
- [ ] Success message displays
- [ ] Error messages clear

---

### R1.5: Hero Section Component [Effort: M]

**Create**: `components/landing/HeroSection.tsx`

```tsx
import { WaitlistForm } from './WaitlistForm';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-[#ececf1] px-4">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Left: Text + CTA */}
        <div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            Track Everything.
            <br />
            Level Up.
            <br />
            Win.
          </h1>

          <p className="mt-6 text-xl text-gray-600">
            The fitness app that gamifies your progress. Track PRs, earn XP, compete with friends.
          </p>

          <div className="mt-8 max-w-md">
            <WaitlistForm source="hero" />
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Join <strong>1,247 athletes</strong> waiting for launch
          </p>
        </div>

        {/* Right: App Mockup */}
        <div className="relative">
          {/* TODO: Replace with actual app screenshot */}
          <div className="aspect-[9/19] bg-gray-200 rounded-3xl shadow-2xl" />
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
```

**Acceptance**:
- [ ] Hero displays full viewport height
- [ ] Responsive (mobile/desktop)
- [ ] Waitlist form integrated
- [ ] Scroll indicator animates

---

### R1.6: Update Homepage [Effort: S]

**Update**: `app/page.tsx`

```tsx
import { HeroSection } from '@/components/landing/HeroSection';

export const metadata = {
  title: 'Carve - Track Workouts. Level Up. Win.',
  description: 'The fitness app that gamifies your progress. Track PRs, earn XP, compete with friends. Join the waitlist today.',
  openGraph: {
    title: 'Carve - Track Workouts. Level Up. Win.',
    description: 'The fitness app that gamifies your progress.',
    // TODO: Add og:image
  }
};

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      {/* More sections in Release 2+ */}
    </main>
  );
}
```

**Acceptance**:
- [ ] New homepage displays
- [ ] Metadata correct
- [ ] Old placeholder removed

---

### R1.7: Privacy Policy & Terms Pages [Effort: M]

**Create**: `app/privacy/page.tsx`

```tsx
export const metadata = {
  title: 'Privacy Policy - Carve',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 prose">
      <h1>Privacy Policy</h1>
      <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

      <h2>1. Information We Collect</h2>
      <p>
        When you join our waitlist, we collect your email address and consent timestamp.
        We also collect IP address and user agent for anti-abuse purposes.
      </p>

      <h2>2. How We Use Your Information</h2>
      <p>
        We use your email to notify you when Carve launches. You can unsubscribe anytime.
      </p>

      <h2>3. Data Retention</h2>
      <p>
        We retain your email until you request deletion or 1 year after launch notification.
      </p>

      <h2>4. Your Rights (GDPR)</h2>
      <ul>
        <li>Right to access your data</li>
        <li>Right to deletion (right to be forgotten)</li>
        <li>Right to withdraw consent</li>
      </ul>

      <p>Contact: privacy@carve.com</p>
    </div>
  );
}
```

**Create**: `app/terms/page.tsx`

```tsx
export const metadata = {
  title: 'Terms of Service - Carve',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 prose">
      <h1>Terms of Service</h1>
      <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

      <h2>1. Acceptance</h2>
      <p>
        By joining the waitlist, you agree to these terms.
      </p>

      {/* TODO: Add full terms */}
    </div>
  );
}
```

**Acceptance**:
- [ ] Privacy policy page accessible
- [ ] Terms page accessible
- [ ] Links from waitlist form work

---

### R1.8: Analytics Setup [Effort: S]

**Install**: Plausible (privacy-friendly, no cookie banner needed)

**Create**: `lib/analytics.ts`

```typescript
export const track = (event: string, props?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(event, { props });
  }
};

// Usage:
// track('waitlist_signup_initiated', { source: 'hero' });
// track('waitlist_verified', { source: 'hero' });
```

**Add to**: `app/layout.tsx`

```tsx
<Script
  defer
  data-domain="carve.wiki"
  src="https://plausible.io/js/script.js"
/>
```

**Acceptance**:
- [ ] Plausible script loaded
- [ ] Events tracked

---

## 🏆 Release 2: Social Proof (SHOULD Have)

**Timeline**: Week 3 (8-12 hours)

### R2.1: Add Leaderboard Consent Column [Effort: S]

**Create Migration**: `YYYYMMDDHHMMSS_add_leaderboard_consent.sql`

```sql
ALTER TABLE profiles
  ADD COLUMN leaderboard_consent_at TIMESTAMPTZ;

CREATE INDEX idx_profiles_leaderboard_consent
  ON profiles(leaderboard_consent_at)
  WHERE leaderboard_consent_at IS NOT NULL;

-- Update existing users: set to NULL (opt-in required)
-- Or migrate to TRUE with consent_at = NOW() if grandfathering
```

**Acceptance**:
- [ ] Column added
- [ ] Index created

---

### R2.2: Create Leaderboard Query Functions [Effort: M]

**Create Migration**: `YYYYMMDDHHMMSS_create_leaderboard_functions.sql`

```sql
CREATE OR REPLACE FUNCTION get_global_leaderboard(
  limit_count INT DEFAULT 50
)
RETURNS TABLE (
  rank INT,
  username TEXT,
  avatar_url TEXT,
  level INT,
  total_xp INT,
  current_streak INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (
      ORDER BY us.level DESC, us.total_xp DESC, p.created_at ASC
    )::INT AS rank,
    p.username,
    p.avatar_url,
    us.level,
    us.total_xp,
    us.current_streak
  FROM user_stats us
  JOIN profiles p ON p.id = us.user_id
  WHERE
    p.show_on_leaderboard = TRUE
    AND p.leaderboard_consent_at IS NOT NULL
    AND p.deleted_at IS NULL
  ORDER BY us.level DESC, us.total_xp DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_live_activity_feed(
  limit_count INT DEFAULT 20
)
RETURNS TABLE (
  username TEXT,
  avatar_url TEXT,
  activity_type TEXT,
  activity_data JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.username,
    p.avatar_url,
    af.activity_type,
    af.activity_data,
    af.created_at
  FROM activity_feed af
  JOIN profiles p ON p.id = af.user_id
  WHERE
    p.show_on_leaderboard = TRUE
    AND p.leaderboard_consent_at IS NOT NULL
    AND af.activity_type IN ('pr', 'level_up', 'achievement')
    AND af.is_public = TRUE
  ORDER BY af.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
```

**Acceptance**:
- [ ] Functions created
- [ ] Return correct data
- [ ] Respect consent flags
- [ ] Fast queries (<100ms)

---

### R2.3: Leaderboard API Route (with Caching) [Effort: M]

**Create**: `app/api/leaderboard/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') || '5');

  const supabase = createClient();
  const { data, error } = await supabase.rpc('get_global_leaderboard', {
    limit_count: limit
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data || [], {
    headers: {
      'Cache-Control': 's-maxage=30, stale-while-revalidate=60',
    }
  });
}
```

**Acceptance**:
- [ ] API returns leaderboard data
- [ ] Caching headers set
- [ ] Respects limit parameter

---

### R2.4: Hiscores Widget Component [Effort: L]

**Create**: `components/landing/HiscoresWidget.tsx`

```tsx
'use client'

import { useState, useEffect } from 'react';
import { Avatar } from '@/components/ui/avatar';
import Link from 'next/link';

type LeaderboardEntry = {
  rank: number;
  username: string;
  avatar_url: string;
  level: number;
  total_xp: number;
  current_streak: number;
};

const DEMO_USERS: LeaderboardEntry[] = [
  { rank: 1, username: 'DemoChamp', avatar_url: '', level: 25, total_xp: 5000, current_streak: 30 },
  { rank: 2, username: 'SeedUser2', avatar_url: '', level: 20, total_xp: 3500, current_streak: 15 },
];

export function HiscoresWidget({ initialData }: { initialData: LeaderboardEntry[] }) {
  const [data, setData] = useState<LeaderboardEntry[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/leaderboard?limit=5');
        const newData = await res.json();
        setData(newData);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      }
    };

    const interval = setInterval(fetchData, 30000); // 30s
    return () => clearInterval(interval);
  }, []);

  // Handle empty states
  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-2xl font-bold">Be the First Champion</h3>
        <p className="mt-2 text-gray-600">Start tracking to claim the #1 spot</p>
      </div>
    );
  }

  // Show seed data if too few users
  const displayData = data.length < 5
    ? [...data, ...DEMO_USERS.slice(data.length)].slice(0, 5)
    : data;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">See Who's Winning Right Now</h2>
          <p className="mt-2 text-gray-600">Top athletes on Carve</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Top 5 */}
          <div className="space-y-4">
            {displayData.map((user, i) => {
              const isDemo = i >= data.length;
              return (
                <div
                  key={user.username}
                  className={`flex items-center gap-4 p-4 rounded-lg border ${
                    i === 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50'
                  } ${isDemo ? 'opacity-60' : ''}`}
                >
                  <span className="text-2xl font-bold text-gray-400">#{user.rank}</span>
                  <Avatar src={user.avatar_url} alt={user.username} />
                  <div className="flex-1">
                    <p className="font-semibold">{user.username}</p>
                    <p className="text-sm text-gray-600">
                      Level {user.level} • {user.total_xp.toLocaleString()} XP
                    </p>
                  </div>
                  {isDemo && <span className="text-xs text-gray-400">Demo</span>}
                </div>
              );
            })}
          </div>

          {/* Right: Activity Feed (placeholder) */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold mb-4">Recent Achievements</h3>
            <p className="text-sm text-gray-500">Activity feed coming soon...</p>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link href="/hiscores" className="text-blue-600 hover:underline">
            View Full Leaderboards →
          </Link>
        </div>
      </div>
    </section>
  );
}
```

**Update**: `app/page.tsx`

```tsx
export default async function HomePage() {
  // Fetch initial data server-side
  const initialLeaderboard = await fetch(
    `${process.env.NEXT_PUBLIC_URL}/api/leaderboard?limit=5`,
    { next: { revalidate: 30 } }
  ).then(r => r.json()).catch(() => []);

  return (
    <main>
      <HeroSection />
      <HiscoresWidget initialData={initialLeaderboard} />
    </main>
  );
}
```

**Acceptance**:
- [ ] Widget displays top 5
- [ ] SSR initial data (no flash)
- [ ] Client polls every 30s
- [ ] Empty states handled
- [ ] Seed data shown if <5 users

---

## 🎨 Release 3: Showcase + Demo (SHOULD Have)

**Timeline**: Week 4-5 (12-16 hours)

### R3.1: Demo Data Generator [Effort: M]

**Create**: `lib/demo/sample-data.ts`

```typescript
export function getDemoData() {
  return {
    profile: {
      username: 'DemoUser',
      avatar_url: '',
      level: 15,
      total_xp: 2500
    },
    stats: {
      workouts_count: 42,
      meals_count: 89,
      current_streak: 7,
      max_streak: 14
    },
    workouts: [
      {
        id: '1',
        name: 'Upper Body Power',
        date: '2025-01-10',
        exercises: [
          { name: 'Bench Press', sets: 4, reps: 8, weight: 100 },
          { name: 'Pull-ups', sets: 3, reps: 10, weight: 0 }
        ]
      },
      // ... more workouts
    ],
    achievements: [
      { id: '1', name: 'First Workout', unlocked: true },
      { id: '2', name: 'Week Warrior', unlocked: true },
      // ... more
    ],
    activityFeed: [
      { type: 'pr', data: { exercise: 'Bench Press', weight: 100 }, created_at: '2025-01-10' },
      // ... more
    ]
  };
}
```

**Acceptance**:
- [ ] Realistic demo data
- [ ] Matches real schema

---

### R3.2: Demo Route [Effort: M]

**Create**: `app/demo/page.tsx`

```tsx
import { getDemoData } from '@/lib/demo/sample-data';
import { DemoBanner } from '@/components/dashboard/DemoBanner';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export const metadata = {
  title: 'Demo Dashboard - Carve',
  robots: 'noindex', // Don't index demo page
};

export default function DemoPage() {
  const data = getDemoData();

  return (
    <>
      <DemoBanner />
      <DashboardLayout data={data} mode="demo" />
    </>
  );
}
```

**Create**: `components/dashboard/DemoBanner.tsx`

```tsx
'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('demo-banner-dismissed');
    setDismissed(!!isDismissed);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('demo-banner-dismissed', 'true');
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div className="sticky top-0 z-50 bg-yellow-50 border-b border-yellow-200 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <p className="text-sm text-yellow-900">
          <strong>Demo Mode:</strong> You're viewing sample data.{' '}
          <a href="/signup" className="underline font-semibold">
            Sign up to track for real
          </a>
        </p>
        <button onClick={handleDismiss} className="text-yellow-600 hover:text-yellow-900">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
```

**Acceptance**:
- [ ] `/demo` route loads
- [ ] Banner displays
- [ ] Demo data renders
- [ ] No auth errors
- [ ] Banner dismissible

---

### R3.3: Feature Sections [Effort: L]

**Create**: `components/landing/FeatureCard.tsx`

```tsx
import { LucideIcon } from 'lucide-react';

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  screenshot?: string;
};

export function FeatureCard({ icon: Icon, title, description, screenshot }: Props) {
  return (
    <div className="bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow">
      <Icon className="w-12 h-12 text-blue-600 mb-4" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
      {screenshot && (
        <div className="mt-4 aspect-video bg-gray-100 rounded" />
      )}
    </div>
  );
}
```

**Update**: `app/page.tsx`

```tsx
import { Dumbbell, Apple, BarChart3 } from 'lucide-react';
import { FeatureCard } from '@/components/landing/FeatureCard';

// In HomePage component:
<section className="py-16 bg-gray-50">
  <div className="max-w-6xl mx-auto px-4">
    <h2 className="text-3xl font-bold text-center mb-12">
      Everything You Need to Track
    </h2>

    <div className="grid md:grid-cols-3 gap-8">
      <FeatureCard
        icon={Dumbbell}
        title="Log Every Rep"
        description="Track sets, reps, weight. See progress. Beat PRs."
      />
      <FeatureCard
        icon={Apple}
        title="Fuel Your Gains"
        description="Log meals with macros. Hit protein goals. Build consistency."
      />
      <FeatureCard
        icon={BarChart3}
        title="Watch Yourself Grow"
        description="Charts, graphs, trends. See what's working."
      />
    </div>
  </div>
</section>
```

**Acceptance**:
- [ ] 3 feature cards display
- [ ] Icons render
- [ ] Responsive grid

---

## 🚀 Post-MVP: Future Releases

### Full Hiscores Page (Post-MVP)

**Scope**:
- Multiple tabs (Overall, Workouts, Streaks, PRs)
- Timeframe filters (All Time, Month, Week)
- Pagination (top 50 per page)
- Full live activity feed sidebar

**Effort**: Large (20+ hours)

---

### Gamification Section (Post-MVP)

**Scope**:
- Level progression visual
- Achievement wall grid
- XP formula explainer
- "How It Works" steps

**Effort**: Medium (8-12 hours)

---

### Performance Optimization (Post-MVP)

**Scope**:
- Code splitting (next/dynamic)
- Image optimization (WebP, responsive sizes)
- Lazy loading below-fold sections
- Lighthouse audit + fixes

**Effort**: Medium (6-10 hours)

---

## Technology Stack

### Core Dependencies (Already Installed)
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase client
- Lucide React icons

### New Dependencies (Release 1)
```bash
pnpm add zod @marsidev/react-turnstile
```

### Optional (Future)
```bash
pnpm add framer-motion                 # Animations
pnpm add react-intersection-observer   # Lazy load
pnpm add @upstash/ratelimit            # Advanced rate limiting
pnpm add @upstash/redis                # Redis for rate limits
```

---

## Success Metrics

### Release 1 (MVP)
- [ ] Landing page live
- [ ] 50+ verified waitlist signups in first week
- [ ] Lighthouse >90
- [ ] Zero critical bugs

### Release 2 (Social Proof)
- [ ] Hiscores widget shows live data
- [ ] 100+ verified signups total
- [ ] <100ms API response time

### Release 3 (Showcase)
- [ ] 10% visitor → demo conversion
- [ ] 500+ verified signups total
- [ ] 15%+ visitor → waitlist conversion

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Spam signups | High | Medium | Multi-layer (Turnstile + double opt-in + rate limit + disposable blocking) |
| GDPR non-compliance | Medium | **Critical** | Explicit consent, audit trail, privacy policy, easy opt-out |
| Empty leaderboards | High | Low | Seed data, hide if <10, "be first" messaging |
| Demo breaks auth | Low | Medium | Separate `/demo` route (never touches protected) |
| Slow queries | Medium | Medium | Indexes + caching + query optimization |

---

## Timeline Summary

**Realistic Part-Time Schedule** (20hr/week):

- **Week 1-2**: Release 1 (MVP) → **SHIP**
- **Week 3**: Release 2 (Social Proof) → **SHIP v1.1**
- **Week 4-5**: Release 3 (Showcase + Demo) → **SHIP v1.2**
- **Week 6+**: Post-MVP features (as needed)

**Total MVP Effort**: 30-40 hours (3 releases)

---

**End of Plan**
