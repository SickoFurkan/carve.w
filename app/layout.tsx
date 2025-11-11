import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppShell, AppBody } from "@/components/app/app-shell";
import { AppHeader } from "@/components/app/app-header";
import { createClient } from "@/lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Carve Wiki - Your Health & Fitness Knowledge Base",
  description: "Evidence-based information on nutrition, fitness, and health. Track your progress with personalized dashboards.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
    <html lang="en">
      <head>
        {/* Plausible Analytics - Privacy-first, no cookies */}
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
          />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#ececf1]`}
      >
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
      </body>
    </html>
  );
}
