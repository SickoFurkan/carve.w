# OAuth Provider Setup Guide

**Last Updated:** 2025-11-08
**Status:** Ready to Configure
**Reference:** [Supabase Social Login Docs](https://supabase.com/docs/guides/auth/social-login)

---

## Overview

This guide walks you through setting up Google and Apple OAuth providers for your Carve.wiki application. The UI is already built - you just need to configure the providers in Supabase and the external platforms.

### What's Already Done ✅
- OAuth callback handler (`/auth/callback`)
- Google/Apple buttons in UI (login + signup pages)
- Sign-in with provider functions (ready to activate)
- Error handling and loading states

### What You Need To Do 📋
1. Set up Google OAuth credentials
2. Set up Apple OAuth credentials
3. Configure providers in Supabase dashboard
4. Test the OAuth flows

---

## Part 1: Google OAuth Setup

### Step 1: Google Cloud Console

1. **Go to Google Cloud Console**
   - URL: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create or Select a Project**
   - Click project dropdown (top left)
   - Click "New Project"
   - Name: "Carve Wiki" (or your preferred name)
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" > "OAuth consent screen"
   - Select "External" (for public app)
   - Click "Create"

   **Fill in:**
   - App name: `Carve Wiki`
   - User support email: `your-email@example.com`
   - Developer contact: `your-email@example.com`
   - Click "Save and Continue"

   **Scopes (Step 2):**
   - Click "Add or Remove Scopes"
   - Add: `userinfo.email` and `userinfo.profile`
   - Click "Save and Continue"

   **Test Users (Step 3):**
   - Add your email for testing
   - Click "Save and Continue"

5. **Create OAuth 2.0 Client ID**
   - Go to "APIs & Services" > "Credentials"
   - Click "+ Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Name: "Carve Wiki Web Client"

   **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://your-domain.com
   ```

   **Authorized redirect URIs:**
   ```
   http://localhost:3000/auth/callback
   https://your-supabase-project.supabase.co/auth/v1/callback
   https://your-domain.com/auth/callback
   ```

   - Click "Create"

6. **Copy Credentials**
   - You'll see a popup with:
     - **Client ID**: `123456789-xxxxx.apps.googleusercontent.com`
     - **Client Secret**: `GOCSPX-xxxxx`
   - **SAVE THESE!** You'll need them in the next step

### Step 2: Configure in Supabase

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com
   - Select your project

2. **Navigate to Authentication**
   - Click "Authentication" (left sidebar)
   - Click "Providers"
   - Find "Google" in the list

3. **Enable Google Provider**
   - Toggle "Google" to ON
   - Paste your **Client ID**
   - Paste your **Client Secret**
   - Click "Save"

4. **Get Callback URL**
   - Copy the callback URL shown (something like):
     ```
     https://xxxxx.supabase.co/auth/v1/callback
     ```
   - Make sure this is in your Google OAuth redirect URIs (from Step 1.5)

### Step 3: Update Environment Variables

Add to your `.env.local`:
```env
# Google OAuth (optional - handled by Supabase)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

**Note:** The client secret stays in Supabase - never put it in frontend code!

---

## Part 2: Apple Sign In Setup

### Step 1: Apple Developer Account

**Prerequisites:**
- Apple Developer account ($99/year)
- Access to App Store Connect

1. **Sign in to Apple Developer**
   - URL: https://developer.apple.com/account
   - Sign in with your Apple ID

2. **Register an App ID**
   - Go to "Certificates, Identifiers & Profiles"
   - Click "Identifiers" > "+" button
   - Select "App IDs" > "Continue"

   **Configuration:**
   - Description: `Carve Wiki`
   - Bundle ID: `com.yourcompany.carvewiki`
   - Capabilities: Check "Sign in with Apple"
   - Click "Continue" > "Register"

3. **Create a Services ID**
   - Go back to "Identifiers"
   - Click "+" > Select "Services IDs" > "Continue"

   **Configuration:**
   - Description: `Carve Wiki Web`
   - Identifier: `com.yourcompany.carvewiki.web`
   - Check "Sign in with Apple"
   - Click "Configure" next to "Sign in with Apple"

   **Web Authentication Configuration:**
   - Primary App ID: Select your App ID from step 2
   - Domains: `your-domain.com` (without https://)
   - Return URLs:
     ```
     https://your-supabase-project.supabase.co/auth/v1/callback
     https://your-domain.com/auth/callback
     ```
   - Click "Save" > "Continue" > "Register"

4. **Create a Private Key**
   - Go to "Keys" > "+" button
   - Key Name: `Carve Wiki Sign in with Apple Key`
   - Check "Sign in with Apple"
   - Click "Configure" > Select your Primary App ID
   - Click "Save" > "Continue" > "Register"

   **Download the Key:**
   - Click "Download" (you can only do this ONCE!)
   - Save as `AuthKey_XXXXXXXXXX.p8`
   - Note the **Key ID** (shown on the page)

5. **Get Your Team ID**
   - Go to "Membership" in the sidebar
   - Copy your **Team ID** (looks like: `XXXXXXXXXX`)

### Step 2: Generate Client Secret (Advanced)

Apple requires a JWT token as the client secret. You have two options:

**Option A: Use Supabase's Built-in Generator (Easiest)**
1. Go to Supabase Dashboard > Authentication > Providers > Apple
2. Enter your Key ID and Team ID
3. Upload the .p8 file
4. Supabase will generate the secret for you

**Option B: Generate Manually (Advanced)**
If you prefer to generate it yourself:
```bash
# Install jose library
npm install jose

# Create generate-apple-secret.js:
const { SignJWT } = require('jose')
const fs = require('fs')

async function generateClientSecret() {
  const keyId = 'YOUR_KEY_ID'
  const teamId = 'YOUR_TEAM_ID'
  const clientId = 'com.yourcompany.carvewiki.web' // Services ID
  const privateKey = fs.readFileSync('./AuthKey_XXXXXXXXXX.p8', 'utf8')

  const secret = await new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: keyId })
    .setIssuedAt()
    .setIssuer(teamId)
    .setAudience('https://appleid.apple.com')
    .setSubject(clientId)
    .setExpirationTime('180d')
    .sign(await crypto.subtle.importKey(
      'pkcs8',
      Buffer.from(privateKey.replace(/-----[^-]+-----/g, ''), 'base64'),
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign']
    ))

  console.log('Client Secret:', secret)
}

generateClientSecret()
```

### Step 3: Configure in Supabase

1. **Open Supabase Dashboard**
   - Authentication > Providers > Apple

2. **Enable Apple Provider**
   - Toggle "Apple" to ON
   - Enter **Services ID**: `com.yourcompany.carvewiki.web`
   - Enter **Team ID**: `XXXXXXXXXX`
   - Enter **Key ID**: `XXXXXXXXXX`
   - Upload **Private Key** (.p8 file) OR paste client secret
   - Click "Save"

3. **Verify Callback URL**
   - Make sure the Supabase callback URL matches what you entered in Apple Developer Console

### Step 4: Update Environment Variables

Add to your `.env.local`:
```env
# Apple OAuth (optional - handled by Supabase)
NEXT_PUBLIC_APPLE_CLIENT_ID=com.yourcompany.carvewiki.web
```

---

## Part 3: Update Code (Make OAuth Buttons Work)

The OAuth buttons are currently placeholders. Let's make them functional:

### File: `app/(auth)/login/page.tsx`

Find the OAuth buttons section and update the `onClick` handlers:

```typescript
// Google Sign In
<button
  type="button"
  onClick={async () => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }}
  className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
  disabled={loading}
>
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    {/* Google icon */}
  </svg>
  Continue with Google
</button>

// Apple Sign In
<button
  type="button"
  onClick={async () => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }}
  className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-black rounded-md shadow-sm bg-black text-sm font-medium text-white hover:bg-gray-900 transition-colors"
  disabled={loading}
>
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    {/* Apple icon */}
  </svg>
  Continue with Apple
</button>
```

Do the same for `signup/page.tsx`!

---

## Part 4: Testing OAuth Flows

### Test Google OAuth

1. **Start Development Server**
   ```bash
   pnpm dev
   ```

2. **Navigate to Login**
   - Go to http://localhost:3000/login

3. **Click "Continue with Google"**
   - Should redirect to Google login
   - Select your Google account
   - Approve permissions
   - Should redirect back to `/auth/callback`
   - Should then redirect to `/dashboard`

4. **Verify in Supabase**
   - Go to Authentication > Users
   - Should see new user with provider "google"
   - Check that profile was created

### Test Apple Sign In

1. **Navigate to Login**
   - Go to http://localhost:3000/login

2. **Click "Continue with Apple"**
   - Should redirect to Apple ID login
   - Enter Apple ID
   - Approve permissions
   - Should redirect back to dashboard

3. **Verify in Supabase**
   - Check Authentication > Users
   - Should see user with provider "apple"

### Common Issues & Solutions

**Google OAuth:**
- ❌ "redirect_uri_mismatch" → Check redirect URIs in Google Console
- ❌ "access_denied" → User cancelled or app not verified
- ❌ "invalid_client" → Check client ID and secret in Supabase

**Apple Sign In:**
- ❌ "invalid_client" → Check Services ID matches Supabase config
- ❌ "invalid_grant" → Client secret expired (regenerate JWT)
- ❌ "redirect_uri_mismatch" → Check return URLs in Apple Developer

**General:**
- ❌ User stuck on callback → Check callback handler logs
- ❌ Profile not created → Check Supabase trigger is enabled
- ❌ Session not set → Check cookie configuration

---

## Part 5: Production Deployment

### Before Going Live:

1. **Update Redirect URIs**
   - Add production domain to Google Console
   - Add production domain to Apple Developer
   - Format: `https://carve.wiki/auth/callback`

2. **Verify SSL Certificate**
   - Both Google and Apple require HTTPS in production
   - Localhost can use HTTP for development

3. **Test from Production Domain**
   - Don't just test on localhost!
   - Test the full flow from your live domain

4. **Update Google Consent Screen**
   - Remove "Testing" status
   - Publish the app
   - May require verification if requesting sensitive scopes

5. **Monitor Auth Logs**
   - Check Supabase Authentication logs
   - Monitor for failed attempts
   - Set up error alerting

---

## Summary Checklist

### Google OAuth ☐
- [ ] Created Google Cloud project
- [ ] Configured OAuth consent screen
- [ ] Created OAuth 2.0 credentials
- [ ] Added redirect URIs
- [ ] Enabled in Supabase
- [ ] Updated login/signup code
- [ ] Tested login flow
- [ ] Verified user created

### Apple Sign In ☐
- [ ] Created App ID
- [ ] Created Services ID
- [ ] Generated private key
- [ ] Generated client secret (or uploaded to Supabase)
- [ ] Added return URLs
- [ ] Enabled in Supabase
- [ ] Updated login/signup code
- [ ] Tested login flow
- [ ] Verified user created

### Production ☐
- [ ] Added production domains to all providers
- [ ] Verified SSL/HTTPS working
- [ ] Tested from production URL
- [ ] Published Google OAuth app
- [ ] Monitoring enabled

---

## Next Steps

After OAuth is set up:
1. Test with real users
2. Monitor auth success/failure rates
3. Consider adding more providers (GitHub, Microsoft, etc.)
4. Implement email verification
5. Add 2FA support

---

**Ready to start? Begin with Google OAuth (easier) then move to Apple!**

**Need help?** Check Supabase docs: https://supabase.com/docs/guides/auth/social-login
