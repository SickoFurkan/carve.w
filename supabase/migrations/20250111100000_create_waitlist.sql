-- Create waitlist table with GDPR-compliant consent tracking and anti-abuse measures
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
  deleted_at TIMESTAMPTZ, -- Soft delete (right to be forgotten)
  opt_out_reason TEXT,

  -- ✅ Anti-abuse
  ip_address INET,
  user_agent TEXT,

  CONSTRAINT email_verified_check CHECK (
    verified_at IS NULL OR consent_given = TRUE
  )
);

-- Indexes for performance
CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_verification ON waitlist(verification_token)
  WHERE verified_at IS NULL;
CREATE INDEX idx_waitlist_verified ON waitlist(verified_at DESC)
  WHERE verified_at IS NOT NULL;

-- RLS policies
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone can join the waitlist (public insert)
CREATE POLICY "Anyone can join waitlist"
  ON waitlist FOR INSERT
  WITH CHECK (true);

-- Only service role can read waitlist data (admin only)
CREATE POLICY "Only service role can read"
  ON waitlist FOR SELECT
  USING (false); -- Only via service role key

-- Comments for documentation
COMMENT ON TABLE waitlist IS 'Pre-launch email waitlist with GDPR-compliant consent tracking';
COMMENT ON COLUMN waitlist.verification_token IS 'Single-use token for email verification';
COMMENT ON COLUMN waitlist.consent_timestamp IS 'When user explicitly consented to privacy policy';
COMMENT ON COLUMN waitlist.ip_address IS 'For anti-abuse tracking only';
