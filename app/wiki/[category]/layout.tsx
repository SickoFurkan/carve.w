const VALID_CATEGORIES = [
  'nutrition',
  'exercise-science',
  'physiology',
  'training-methods',
  'psychology',
  'injury-health',
];

export default async function WikiCategoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  // Only render for valid wiki categories
  const isWikiCategory = VALID_CATEGORIES.includes(category);

  if (!isWikiCategory) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      {children}
    </div>
  );
}
