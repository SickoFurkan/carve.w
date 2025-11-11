import { Suspense } from "react";
import { CarveSidebar } from "@/components/app/sidebars/carve-sidebar";
import { SidebarSkeleton } from "@/components/app/sidebars/sidebar-skeleton";
import { AppContent } from "@/components/app/app-shell";

export default function CarveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<SidebarSkeleton />}>
        <CarveSidebar />
      </Suspense>
      <AppContent padded={false}>
        {children}
      </AppContent>
    </>
  );
}
