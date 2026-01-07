import { Suspense } from "react";
import { SupportSidebar } from "@/components/app/sidebars/support-sidebar";
import { SidebarSkeleton } from "@/components/app/sidebars/sidebar-skeleton";
import { AppContent } from "@/components/app/app-shell";

export const metadata = {
  title: 'Support - Carve',
  description: 'Get help with Carve. FAQ, contact support, and resources.',
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<SidebarSkeleton />}>
        <SupportSidebar />
      </Suspense>
      <AppContent padded={false}>
        {children}
      </AppContent>
    </>
  );
}
