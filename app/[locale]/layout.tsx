import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { AppShell, AppBody } from "@/components/app/app-shell";
import { AppHeader } from "@/components/app/app-header";
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
      <div className="min-h-screen bg-[#ececf1]">
        {/* Fixed header */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <AppHeader
            isAuthenticated={!!user}
            userEmail={user?.email}
            userName={profile?.display_name || profile?.username || undefined}
            userAvatar={profile?.avatar_image_url || undefined}
          />
        </div>

        {/* Main content with padding */}
        <div className="fixed top-16 left-0 right-2 bottom-2 md:right-2 md:bottom-2 lg:right-3 lg:bottom-3">
          <AppShell>
            <AppBody>
              {children}
            </AppBody>
          </AppShell>
        </div>
      </div>
    </NextIntlClientProvider>
  );
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
