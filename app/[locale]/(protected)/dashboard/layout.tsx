export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout wrapper handles shell and sidebar
  return <>{children}</>;
}
