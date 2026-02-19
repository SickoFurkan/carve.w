import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { getCategoryColor } from '@/lib/wiki/category-colors';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { EvidenceRating } from './EvidenceRating';
import { TableOfContents } from './TableOfContents';
import { SourcesList } from './SourcesList';
import { RelatedArticles } from './RelatedArticles';
import { CitationEnhancer } from './CitationEnhancer';
import { ExpertReviewBadge } from './ExpertReviewBadge';
import { UpdateAlert } from './UpdateAlert';

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
  needs_update?: boolean;
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
  const colors = getCategoryColor(category);

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <ScrollReveal animation="fade">
          <nav className="mb-6 text-sm text-white/40">
            <Link href="/wiki" className="hover:text-white/60">
              Wiki
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/wiki/${category}`} className={`hover:text-white/60 capitalize ${colors.text}`}>
              {category.replace('-', ' ')}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">{article.title}</span>
          </nav>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <ScrollReveal animation="fade-up" delay={0.1}>
              <article className="bg-[rgba(28,31,39,0.7)] backdrop-blur-xl border border-white/[0.08] rounded-xl p-8 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
                {/* Article Header */}
                <header className="mb-8 border-b border-white/[0.06] pb-6">
                  <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
                    {article.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] uppercase tracking-[0.15em] text-white/30">
                    {/* Evidence Rating */}
                    <EvidenceRating rating={article.evidence_rating} />

                    {/* Author */}
                    <div>
                      By <span className="font-medium text-white/60">{article.author}</span>
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
                          className="px-3 py-1 bg-white/[0.04] border border-white/[0.08] text-white/60 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </header>

                {/* Update Alert (if article needs review) */}
                {article.needs_update && (
                  <UpdateAlert />
                )}

                {/* Expert Review Badge */}
                {article.reviewers && article.reviewers.length > 0 && (
                  <div className="mb-6">
                    <ExpertReviewBadge reviewers={article.reviewers} />
                  </div>
                )}

                {/* Article Summary */}
                {article.summary && (
                  <div className="mb-8 p-4 bg-white/[0.03] border-l-4 rounded-lg" style={{ borderLeftColor: colors.hex }}>
                    <p className="text-white/70 leading-relaxed">{article.summary}</p>
                  </div>
                )}

                {/* Article Content */}
                <div
                  className="prose prose-invert max-w-none
                    prose-headings:text-white prose-headings:font-bold
                    prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                    prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                    prose-p:text-white/70 prose-p:leading-relaxed prose-p:mb-4
                    prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-white prose-strong:font-semibold
                    prose-ul:my-4 prose-ol:my-4
                    prose-li:text-white/70
                    prose-code:text-sm prose-code:bg-white/[0.04] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-white/[0.08]
                    prose-pre:bg-[rgba(28,31,39,0.7)] prose-pre:border prose-pre:border-white/[0.08]"
                  dangerouslySetInnerHTML={{ __html: html }}
                />

                {/* Citation Hover Previews (Client-side enhancement) */}
                <CitationEnhancer citations={citations} />

                {/* Sources */}
                {citations.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-white/[0.06]">
                    <h2 className="text-2xl font-bold text-white mb-6">Sources</h2>
                    <SourcesList citations={citations} />
                  </div>
                )}

                {/* Related Articles */}
                <div className="mt-12 pt-8 border-t border-white/[0.06]">
                  <RelatedArticles currentSlug={article.slug} category={category} />
                </div>
              </article>
            </ScrollReveal>
          </div>

          {/* Sidebar (Table of Contents) */}
          <div className="lg:col-span-1">
            <ScrollReveal animation="fade" delay={0.2}>
              <aside>
                <div className="sticky top-8">
                  <TableOfContents html={html} category={category} />
                </div>
              </aside>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
