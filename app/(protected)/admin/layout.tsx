import { requireAdminOrRedirect } from "@/lib/admin/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminOrRedirect();
  return <>{children}</>;
}
