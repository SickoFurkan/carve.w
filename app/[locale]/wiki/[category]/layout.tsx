import { Suspense } from "react";
import { WikiSidebar } from "@/components/app/sidebars/wiki-sidebar";
import { SidebarSkeleton } from "@/components/app/sidebars/sidebar-skeleton";
import { AppContent } from "@/components/app/app-shell";

const VALID_CATEGORIES = [
  'nutrition',
  'exercise-science',
  'physiology',
  'training-methods',
  'psychology',
  'injury-health',
];

export default async function WikiLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  // Only render wiki layout for valid wiki categories
  // For other routes (like /admin), just pass through children without wiki sidebar
  const isWikiCategory = VALID_CATEGORIES.includes(category);

  if (!isWikiCategory) {
    // Not a wiki category - pass through children without wiki chrome
    // This allows (protected) routes to render with their own layouts
    return <>{children}</>;
  }

  return (
    <>
      <Suspense fallback={<SidebarSkeleton />}>
        <WikiSidebar />
      </Suspense>
      <AppContent padded={false}>
        {children}
      </AppContent>
    </>
  );
}
