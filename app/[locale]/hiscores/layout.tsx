import { Suspense } from "react";
import { HiscoresSidebar } from "@/components/app/sidebars/hiscores-sidebar";
import { SidebarSkeleton } from "@/components/app/sidebars/sidebar-skeleton";
import { AppContent } from "@/components/app/app-shell";

export default function HiscoresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<SidebarSkeleton />}>
        <HiscoresSidebar />
      </Suspense>
      <AppContent padded={false}>
        {children}
      </AppContent>
    </>
  );
}
