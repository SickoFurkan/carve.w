export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Note: The login page at /dashboard/login will handle auth check client-side
  // All other dashboard pages have their own auth checks
  return <>{children}</>
}
