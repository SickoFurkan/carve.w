import Link from 'next/link';
import { BookOpen, ExternalLink } from 'lucide-react';
import { getRecommendedArticles } from '@/lib/wiki/recommendations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RecommendedArticlesProps {
  userId: string | null;
}

export async function RecommendedArticles({ userId }: RecommendedArticlesProps) {
  const articles = await getRecommendedArticles(userId, 3);

  if (articles.length === 0) {
    return null;
  }

  // Map evidence ratings to colors
  const ratingColors: Record<string, string> = {
    'well-established': 'bg-green-100 text-green-800',
    'emerging-research': 'bg-yellow-100 text-yellow-800',
    'expert-consensus': 'bg-blue-100 text-blue-800',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Recommended Reading</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Expand your knowledge with these articles
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/${article.category}/${article.slug}`}
              className="block group"
            >
              <div className="rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:bg-blue-50/50 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h4 className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors mb-1 line-clamp-1">
                      {article.title}
                    </h4>

                    {/* Summary */}
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {article.summary}
                    </p>

                    {/* Category & Evidence Rating */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-500 capitalize">
                        {article.category.replace('-', ' ')}
                      </span>
                      {article.evidence_rating && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${ratingColors[article.evidence_rating] || 'bg-gray-100 text-gray-800'}`}>
                          {article.evidence_rating.replace('-', ' ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* External link icon */}
                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 mt-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Link */}
        <Link
          href="/wiki"
          className="block mt-4 text-sm text-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          Browse all articles →
        </Link>
      </CardContent>
    </Card>
  );
}
