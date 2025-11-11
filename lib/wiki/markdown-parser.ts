import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

// Article frontmatter structure
export interface ArticleFrontmatter {
  title: string;
  category: 'nutrition' | 'exercise-science' | 'physiology' | 'training-methods' | 'psychology' | 'injury-health';
  tags: string[];
  evidence_rating: 'well-established' | 'emerging-research' | 'expert-consensus';
  author: string;
  reviewers?: string[];
  related?: string[]; // Related article slugs
  summary?: string; // Optional custom summary
  language?: 'en' | 'nl';
  created_at: string; // YYYY-MM-DD
  updated_at: string; // YYYY-MM-DD
}

// Table of contents entry
export interface TocEntry {
  level: number;
  text: string;
  id: string;
}

// Parsed article result
export interface ParsedArticle {
  frontmatter: ArticleFrontmatter;
  markdown: string; // Raw markdown content (without frontmatter)
  html: string; // Rendered HTML
  searchText: string; // Plain text for search indexing
  toc: TocEntry[]; // Table of contents
}

/**
 * Strip HTML tags from a string to create plain text
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
}

/**
 * Extract headings from markdown to build table of contents
 */
function extractToc(markdown: string): TocEntry[] {
  const headingRegex = /^(#{2,6})\s+(.+)$/gm;
  const toc: TocEntry[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length; // Number of # characters
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

    toc.push({ level, text, id });
  }

  return toc;
}

/**
 * Extract summary from markdown (first paragraph after title)
 */
function extractSummary(markdown: string): string {
  // Find the first paragraph that's not a heading
  const paragraphRegex = /^(?!#)(.+)$/m;
  const match = markdown.match(paragraphRegex);

  if (match) {
    return match[1].trim().substring(0, 300); // Limit to 300 characters
  }

  return '';
}

/**
 * Convert inline citations (^1, ^2) to superscript HTML links
 */
function processInlineCitations(html: string): string {
  // Match ^1, ^2, etc. and convert to <sup><a href="#cite-1">[1]</a></sup>
  return html.replace(/\^(\d+)/g, '<sup><a href="#cite-$1" class="citation-link">[$1]</a></sup>');
}

/**
 * Add IDs to headings for TOC linking
 */
function addHeadingIds(html: string): string {
  return html.replace(/<h([2-6])>(.+?)<\/h\1>/g, (match, level, text) => {
    const id = text
      .toLowerCase()
      .replace(/<[^>]*>/g, '') // Remove any HTML tags in heading
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return `<h${level} id="${id}">${text}</h${level}>`;
  });
}

/**
 * Parse a markdown article with frontmatter
 * @param rawMarkdown - Full markdown content including frontmatter
 * @returns Parsed article with HTML, metadata, and search text
 */
export async function parseMarkdown(rawMarkdown: string): Promise<ParsedArticle> {
  // Parse frontmatter and content
  const { data: frontmatter, content: markdown } = matter(rawMarkdown);

  // Validate required frontmatter fields
  if (!frontmatter.title || !frontmatter.category || !frontmatter.tags) {
    throw new Error('Missing required frontmatter fields: title, category, tags');
  }

  // Extract table of contents from markdown
  const toc = extractToc(markdown);

  // Extract summary (use custom summary from frontmatter or auto-extract)
  const summary = frontmatter.summary || extractSummary(markdown);

  // Convert markdown to HTML
  const processedMarkdown = await remark()
    .use(html, { sanitize: false }) // Don't sanitize - we control the content
    .process(markdown);

  let htmlContent = processedMarkdown.toString();

  // Post-process HTML
  htmlContent = processInlineCitations(htmlContent); // Convert ^1 to superscript links
  htmlContent = addHeadingIds(htmlContent); // Add IDs to headings for TOC

  // Strip HTML to create search text
  const searchText = stripHtml(htmlContent);

  return {
    frontmatter: {
      ...frontmatter,
      summary, // Add extracted/custom summary
    } as ArticleFrontmatter,
    markdown,
    html: htmlContent,
    searchText,
    toc,
  };
}

/**
 * Generate slug from filename
 * Example: "protein-requirements.md" -> "protein-requirements"
 */
export function generateSlug(filename: string): string {
  return filename
    .replace(/\.md$/, '') // Remove .md extension
    .toLowerCase()
    .trim();
}
