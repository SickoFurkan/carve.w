import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppShell, AppBody, AppContent } from "@/components/app/app-shell";
import { AppHeader } from "@/components/app/app-header";
import { AppSidebar } from "@/components/app/app-sidebar";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#ececf1]`}
      >
        <div className="min-h-screen bg-[#ececf1]">
          {/* Fixed header */}
          <div className="fixed top-0 left-0 right-0 z-50">
            <AppHeader isAuthenticated={false} />
          </div>

          {/* Main content with padding */}
          <div className="fixed top-16 left-0 right-2 bottom-2 md:right-2 md:bottom-2 lg:right-3 lg:bottom-3">
            <AppShell>
              <AppBody>
                <AppSidebar />
                <AppContent padded={false}>
                  {children}
                </AppContent>
              </AppBody>
            </AppShell>
          </div>
        </div>
      </body>
    </html>
  );
}
