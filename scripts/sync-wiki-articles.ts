#!/usr/bin/env tsx

/**
 * Wiki Article Sync Script
 *
 * Syncs markdown articles from content/wiki/ to Supabase database
 * - Scans for .md files
 * - Parses frontmatter and content
 * - Stores full markdown + rendered HTML + search text
 * - Extracts and stores citations
 * - Database becomes single source of truth at runtime
 */

import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { parseMarkdown, generateSlug } from '../lib/wiki/markdown-parser';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Content directory
const CONTENT_DIR = path.join(process.cwd(), 'content/wiki');

// Statistics
const stats = {
  total: 0,
  added: 0,
  updated: 0,
  errors: 0,
  skipped: 0,
};

/**
 * Recursively find all .md files in directory
 */
async function findMarkdownFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip directories starting with _ or .
      if (!entry.name.startsWith('_') && !entry.name.startsWith('.')) {
        const subFiles = await findMarkdownFiles(fullPath);
        files.push(...subFiles);
      }
    } else if (entry.isFile() && entry.name.endsWith('.md') && !entry.name.startsWith('_')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Extract citations from markdown content
 * Looks for "## Sources" section and parses citations
 */
function extractCitations(markdown: string): Array<{
  citation_number: number;
  authors: string;
  year: number | null;
  title: string;
  publication: string;
  url: string | null;
}> {
  const citations: Array<any> = [];

  // Find the Sources section
  const sourcesMatch = markdown.match(/^##\s+Sources?\s*$([\s\S]*?)(?=^##|\z)/m);
  if (!sourcesMatch) return citations;

  const sourcesSection = sourcesMatch[1];

  // Parse numbered citations (1., 2., etc.)
  const citationRegex = /^(\d+)\.\s+(.+?)$/gm;
  let match;

  while ((match = citationRegex.exec(sourcesSection)) !== null) {
    const number = parseInt(match[1]);
    const citationText = match[2].trim();

    // Try to parse citation components
    // Format: Author et al. (Year). "Title." Publication. [URL]
    const authorMatch = citationText.match(/^([^(]+)/);
    const yearMatch = citationText.match(/\((\d{4})\)/);
    const titleMatch = citationText.match(/"([^"]+)"/);
    const publicationMatch = citationText.match(/\.\s+"[^"]+"\.\s+([^.\[]+)/);
    const urlMatch = citationText.match(/https?:\/\/[^\s\]]+/);

    citations.push({
      citation_number: number,
      authors: authorMatch ? authorMatch[1].trim() : 'Unknown',
      year: yearMatch ? parseInt(yearMatch[1]) : null,
      title: titleMatch ? titleMatch[1] : citationText.substring(0, 100),
      publication: publicationMatch ? publicationMatch[1].trim() : 'Unknown',
      url: urlMatch ? urlMatch[0] : null,
    });
  }

  return citations;
}

/**
 * Sync a single article to database
 */
async function syncArticle(filePath: string): Promise<void> {
  stats.total++;

  try {
    // Read file
    const rawContent = await fs.readFile(filePath, 'utf-8');

    // Parse markdown
    const parsed = await parseMarkdown(rawContent);

    // Generate slug from filename
    const filename = path.basename(filePath);
    const category = path.basename(path.dirname(filePath));
    const slug = generateSlug(filename);

    // Validate category
    const validCategories = ['nutrition', 'exercise-science', 'physiology', 'training-methods', 'psychology', 'injury-health'];
    if (!validCategories.includes(category)) {
      console.log(`⚠️  Skipping ${filename} - invalid category: ${category}`);
      stats.skipped++;
      return;
    }

    // Extract citations
    const citations = extractCitations(parsed.markdown);

    // Prepare article data
    const articleData = {
      slug,
      title: parsed.frontmatter.title,
      category,
      tags: parsed.frontmatter.tags,
      language: parsed.frontmatter.language || 'en',
      content_markdown: parsed.markdown,
      content_html: parsed.html,
      search_text: parsed.searchText,
      evidence_rating: parsed.frontmatter.evidence_rating,
      author: parsed.frontmatter.author,
      reviewers: parsed.frontmatter.reviewers || [],
      summary: parsed.frontmatter.summary || parsed.searchText.substring(0, 300),
      is_published: true,
      created_at: parsed.frontmatter.created_at,
      updated_at: parsed.frontmatter.updated_at,
    };

    // Check if article exists
    const { data: existing } = await supabase
      .from('wiki_articles')
      .select('slug')
      .eq('slug', slug)
      .single();

    // Upsert article
    const { error: articleError } = await supabase
      .from('wiki_articles')
      .upsert(articleData, { onConflict: 'slug' });

    if (articleError) {
      throw new Error(`Failed to upsert article: ${articleError.message}`);
    }

    // Delete old citations for this article
    await supabase
      .from('wiki_citations')
      .delete()
      .eq('article_slug', slug);

    // Insert new citations
    if (citations.length > 0) {
      const citationsData = citations.map(c => ({
        article_slug: slug,
        ...c,
      }));

      const { error: citationsError } = await supabase
        .from('wiki_citations')
        .insert(citationsData);

      if (citationsError) {
        console.log(`⚠️  Warning: Failed to insert citations for ${slug}`);
      }
    }

    if (existing) {
      console.log(`✓ Updated: ${slug} (${citations.length} citations)`);
      stats.updated++;
    } else {
      console.log(`✓ Added: ${slug} (${citations.length} citations)`);
      stats.added++;
    }

  } catch (error) {
    console.error(`❌ Error syncing ${filePath}:`, error);
    stats.errors++;
  }
}

/**
 * Main sync function
 */
async function main() {
  console.log('🚀 Starting wiki article sync...\n');

  // Check if content directory exists
  try {
    await fs.access(CONTENT_DIR);
  } catch {
    console.error(`❌ Content directory not found: ${CONTENT_DIR}`);
    process.exit(1);
  }

  // Find all markdown files
  const files = await findMarkdownFiles(CONTENT_DIR);
  console.log(`📁 Found ${files.length} markdown files\n`);

  if (files.length === 0) {
    console.log('✅ No articles to sync');
    return;
  }

  // Sync each file
  for (const file of files) {
    await syncArticle(file);
  }

  // Print statistics
  console.log('\n📊 Sync Statistics:');
  console.log(`   Total files: ${stats.total}`);
  console.log(`   Added: ${stats.added}`);
  console.log(`   Updated: ${stats.updated}`);
  console.log(`   Skipped: ${stats.skipped}`);
  console.log(`   Errors: ${stats.errors}`);

  if (stats.errors > 0) {
    console.log('\n⚠️  Some articles failed to sync. Check errors above.');
    process.exit(1);
  } else {
    console.log('\n✅ All articles synced successfully!');
  }
}

// Run the script
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
