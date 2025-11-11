import { Suspense } from "react";
import Link from "next/link";
import { WikiSidebar } from "@/components/app/sidebars/wiki-sidebar";
import { SidebarSkeleton } from "@/components/app/sidebars/sidebar-skeleton";
import { AppContent } from "@/components/app/app-shell";

export default function NotFound() {
  return (
    <>
      <Suspense fallback={<SidebarSkeleton />}>
        <WikiSidebar />
      </Suspense>
      <AppContent padded={true}>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
          <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
          <Link href="/" className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">
            Go Home
          </Link>
        </div>
      </AppContent>
    </>
  );
}
