import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return Response.json({ error: 'Missing token' }, { status: 400 });
  }

  const supabase = await createClient();

  // Update waitlist entry
  const { data, error } = await supabase
    .from('waitlist')
    .update({
      verified_at: new Date().toISOString(),
      consent_given: true
    })
    .eq('verification_token', token)
    .is('verified_at', null) // Only verify once
    .select('source')
    .single();

  if (error) {
    console.error('Verification error:', error);
    redirect('/?verify=error');
  }

  // Note: We can't use client-side analytics tracking here since this is a server route
  // The ?verify=success parameter will be used by the homepage to show success message
  // and could trigger client-side analytics there if needed

  redirect('/?verify=success');
}
