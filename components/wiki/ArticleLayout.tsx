import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { EvidenceRating } from './EvidenceRating';
import { TableOfContents } from './TableOfContents';
import { SourcesList } from './SourcesList';
import { RelatedArticles } from './RelatedArticles';

interface Article {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  evidence_rating: string;
  author: string;
  reviewers?: string[];
  summary: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  content_html: string;
}

interface Citation {
  citation_number: number;
  authors: string;
  year: number | null;
  title: string;
  publication: string;
  url: string | null;
}

interface ArticleLayoutProps {
  article: Article;
  citations: Citation[];
  html: string;
  category: string;
}

export function ArticleLayout({ article, citations, html, category }: ArticleLayoutProps) {
  const updatedDate = new Date(article.updated_at);
  const timeAgo = formatDistanceToNow(updatedDate, { addSuffix: true });

  return (
    <div className="min-h-screen bg-[#ececf1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm text-zinc-600">
          <Link href="/wiki" className="hover:text-zinc-900">
            Wiki
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/wiki/${category}`} className="hover:text-zinc-900 capitalize">
            {category.replace('-', ' ')}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-900">{article.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <article className="lg:col-span-3 bg-white rounded-lg shadow-sm p-8">
            {/* Article Header */}
            <header className="mb-8 border-b pb-6">
              <h1 className="text-4xl font-bold text-zinc-900 mb-4">
                {article.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600">
                {/* Evidence Rating */}
                <EvidenceRating rating={article.evidence_rating} />

                {/* Author */}
                <div>
                  By <span className="font-medium text-zinc-900">{article.author}</span>
                </div>

                {/* Updated Date */}
                <div>Updated {timeAgo}</div>

                {/* View Count */}
                <div>{article.view_count.toLocaleString()} views</div>
              </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-zinc-100 text-zinc-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {/* Article Summary */}
            {article.summary && (
              <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="text-zinc-700 leading-relaxed">{article.summary}</p>
              </div>
            )}

            {/* Article Content */}
            <div
              className="prose prose-zinc max-w-none
                prose-headings:font-bold prose-headings:text-zinc-900
                prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                prose-p:text-zinc-700 prose-p:leading-relaxed prose-p:mb-4
                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-zinc-900 prose-strong:font-semibold
                prose-ul:my-4 prose-ol:my-4
                prose-li:text-zinc-700
                prose-code:text-sm prose-code:bg-zinc-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                prose-pre:bg-zinc-900 prose-pre:text-zinc-100"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            {/* Sources */}
            {citations.length > 0 && (
              <div className="mt-12 pt-8 border-t">
                <h2 className="text-2xl font-bold text-zinc-900 mb-6">Sources</h2>
                <SourcesList citations={citations} />
              </div>
            )}

            {/* Related Articles */}
            <div className="mt-12 pt-8 border-t">
              <RelatedArticles currentSlug={article.slug} category={category} />
            </div>
          </article>

          {/* Sidebar (Table of Contents) */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8">
              <TableOfContents html={html} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
