# Plausible Analytics Setup Guide

## Overview
Carve uses **Plausible Analytics** - a privacy-first, cookie-free analytics platform that is fully GDPR compliant.

**Why Plausible?**
- ✅ No cookies (no annoying cookie banners needed)
- ✅ GDPR compliant by default
- ✅ Lightweight script (< 1KB)
- ✅ No cross-site tracking
- ✅ All data owned by you
- ✅ Beautiful, simple dashboard

---

## Step 1: Create Plausible Account

1. Go to [https://plausible.io](https://plausible.io)
2. Click "Start your free trial" (30 days free, no credit card required)
3. Create account with your email

**Pricing (after trial):**
- Up to 10k pageviews/month: €9/month
- Up to 100k pageviews/month: €19/month
- See full pricing: https://plausible.io/pricing

---

## Step 2: Add Your Domain

1. After signup, click **"+ Add a website"**
2. Enter your domain:
   - Production: `carve.wiki`
   - Staging: `staging.carve.wiki` (if you have one)
3. Select your timezone (Europe/Amsterdam recommended)
4. Click **"Add site"**

---

## Step 3: Configure Environment Variable

Add the following to your `.env.local` file:

```bash
# Plausible Analytics
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=carve.wiki
```

**Important:** Replace `carve.wiki` with your actual domain.

For local development, you can use:
```bash
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=localhost
```

But note that Plausible won't track localhost events by default (which is good for dev).

---

## Step 4: Verify Installation

### Option A: Use Plausible's Built-in Check
1. Go to your Plausible dashboard
2. Click on your site
3. Look for the green "We're receiving data" message

### Option B: Manual Check
1. Open your site in a browser
2. Open DevTools → Network tab
3. Look for a request to `plausible.io/api/event`
4. If you see it, analytics is working!

### Option C: Check in Dashboard
1. Visit your site
2. Wait 1-2 minutes
3. Refresh your Plausible dashboard
4. You should see your visit appear in real-time

---

## Step 5: Set Up Custom Events (Optional)

Our app already tracks these custom events:
- `waitlist_signup_initiated` - When user starts signup
- `waitlist_signup_success` - When signup succeeds
- `waitlist_signup_failed` - When signup fails
- `waitlist_email_verified` - When user clicks verification link

To view these in Plausible:
1. Go to your site settings
2. Click **"Goals"** in the sidebar
3. Click **"+ Add goal"**
4. Select **"Custom event"**
5. Add each event name above

Now you'll see these events in your dashboard!

---

## Tracked Events

### Current (Release 1)
```typescript
track('waitlist_signup_initiated', { source: 'hero' | 'footer' | 'demo' })
track('waitlist_signup_success', { source: 'hero' | 'footer' | 'demo' })
track('waitlist_signup_failed', { source: 'hero' | 'footer' | 'demo', error_type: string })
```

### Future (Release 2+)
```typescript
track('wiki_article_view', { article_slug: string, category: string })
track('wiki_search', { search_query: string })
track('dashboard_view')
track('workout_logged', { workout_type: string })
track('achievement_unlocked', { achievement_type: string })
```

---

## Development vs Production

### Development (localhost)
- Analytics is **stubbed** - events are logged to console instead
- No data sent to Plausible (to avoid polluting production data)
- Check browser console for: `📊 Analytics Event: [event_name]`

### Production (carve.wiki)
- Analytics is **live** - events sent to Plausible
- Real-time dashboard updates
- All events tracked with properties

---

## Privacy Compliance

✅ **GDPR Compliant:** No personal data collected, no cookies
✅ **No Consent Banner Needed:** Plausible is exempt from cookie consent requirements
✅ **User-Owned Data:** All analytics data is owned by you, not Plausible
✅ **EU Hosting:** Data stored in EU (Frankfurt, Germany)
✅ **No Cross-Site Tracking:** Each site is isolated

---

## Troubleshooting

### Events Not Showing Up?

1. **Check environment variable:**
   ```bash
   echo $NEXT_PUBLIC_PLAUSIBLE_DOMAIN
   ```
   Should output your domain (e.g., `carve.wiki`)

2. **Check browser console:**
   - Any errors mentioning "plausible"?
   - Ad blockers might block Plausible (expected behavior)

3. **Check Network tab:**
   - Do you see requests to `plausible.io/api/event`?
   - If not, the script might not be loading

4. **Verify script in HTML:**
   - View page source
   - Search for `plausible.io/js/script.js`
   - Should be in `<head>` section

### Ad Blockers Blocking Analytics?

**This is normal and expected!** Privacy-conscious users use ad blockers that block analytics.

- uBlock Origin blocks Plausible by default
- Privacy Badger blocks it
- Brave browser blocks it

**Don't worry:** This is better than being blocked as invasive (like Google Analytics). Most users don't use ad blockers, so you'll still get good data.

**Optional:** You can proxy Plausible through your domain to bypass blockers:
https://plausible.io/docs/proxy/introduction

---

## Dashboard Overview

Your Plausible dashboard shows:
- **Real-time visitors** - Currently active users
- **Top pages** - Most visited pages
- **Top sources** - Where traffic comes from
- **Countries** - Geographic distribution
- **Devices** - Desktop vs mobile vs tablet
- **Browsers** - Chrome, Safari, Firefox, etc.
- **Goals** - Custom events (waitlist signups, etc.)

---

## Cost Estimation

Based on expected traffic:

| Phase | Monthly Pageviews | Plausible Cost |
|-------|------------------|----------------|
| Launch (waitlist only) | ~1,000 | €9/month |
| Early access | ~10,000 | €9/month |
| Public beta | ~50,000 | €19/month |
| Full launch | ~100,000 | €19/month |

**Note:** These are estimates. Plausible is very affordable compared to alternatives.

---

## Alternative: Self-Hosted Plausible (Advanced)

If you want to save costs long-term, you can self-host Plausible:

- GitHub: https://github.com/plausible/analytics
- Docs: https://plausible.io/docs/self-hosting

**Pros:**
- Free (except server costs)
- Full control

**Cons:**
- Requires Docker setup
- You manage backups/updates
- Need a server (€5-10/month)

For most projects, the hosted version is recommended for simplicity.

---

## Next Steps

1. ✅ Create Plausible account
2. ✅ Add your domain
3. ✅ Set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` env var
4. ✅ Deploy to production
5. ✅ Verify analytics working
6. ✅ Set up custom goals (optional)
7. ✅ Check dashboard daily for insights!

---

## Support

- Plausible Docs: https://plausible.io/docs
- Plausible Support: support@plausible.io
- Our Analytics Code: `lib/analytics.ts`

Happy tracking! 📊
