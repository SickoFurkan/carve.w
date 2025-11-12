import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { LayoutWrapper } from '@/components/app/layout-wrapper';
import { createClient } from "@/lib/supabase/server";

const locales = ['en', 'nl'];

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) {
    notFound();
  }

  // Providing all messages to the client side is the easiest way to get started
  const messages = await getMessages();

  // Get user and profile data
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LayoutWrapper
        isAuthenticated={!!user}
        userEmail={user?.email}
        userName={profile?.display_name || profile?.username || undefined}
        userAvatar={profile?.avatar_image_url || undefined}
        userRole={profile?.role || undefined}
      >
        {children}
      </LayoutWrapper>
    </NextIntlClientProvider>
  );
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
