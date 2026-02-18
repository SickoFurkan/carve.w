export const metadata = {
  title: 'Support - Carve',
  description: 'Get help with Carve. FAQ, contact support, and resources.',
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout wrapper handles shell and sidebar
  return <>{children}</>;
}
