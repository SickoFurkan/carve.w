# Carve Wiki Content

This directory contains the markdown source files for all Carve Wiki articles.

## Directory Structure

Articles are organized into 6 knowledge domain categories:

- **nutrition/** - Articles about macronutrients, micronutrients, meal timing, supplements, diets
- **exercise-science/** - Articles about biomechanics, exercise types, programming, periodization
- **physiology/** - Articles about muscle growth, fat loss, energy systems, recovery, adaptation
- **training-methods/** - Articles about strength training, cardio, mobility, sport-specific training
- **psychology/** - Articles about motivation, habits, goal setting, mindset
- **injury-health/** - Articles about injury prevention, rehab, common issues, medical topics

## Article Format

All articles follow a consistent format with YAML frontmatter. See `_template.md` for the complete template.

### Required Frontmatter Fields

```yaml
---
title: "Article Title"
category: "nutrition" | "exercise-science" | "physiology" | "training-methods" | "psychology" | "injury-health"
tags: ["tag1", "tag2", "tag3"]
evidence_rating: "well-established" | "emerging-research" | "expert-consensus"
author: "Author Name"
created_at: "YYYY-MM-DD"
updated_at: "YYYY-MM-DD"
---
```

### Optional Frontmatter Fields

```yaml
reviewers: ["Expert 1", "Expert 2"]  # Expert reviewers
related: ["slug-1", "slug-2"]        # Related article slugs
summary: "Brief summary"              # Override auto-extracted summary
```

## Article Structure

Every article should follow this structure:

```markdown
# Article Title

## Summary
[2-3 sentence overview]

## Table of Contents
- [Section 1](#section-1)
- [Section 2](#section-2)
- [Sources](#sources)
- [Related Articles](#related-articles)

## Main Content

### Section 1
[Content with inline citations^1]

### Section 2
[More content^2]

## Sources
1. Author et al. (Year). "Title." Journal Name. [URL]
2. Another Author (Year). "Title." Publication. [URL]

## Related Articles
- [Related Article 1](/wiki/category/article-slug)
- [Related Article 2](/wiki/category/article-slug)
```

## Evidence Ratings

Choose the appropriate evidence rating for each article:

- **well-established**: Strong peer-reviewed consensus, multiple meta-analyses, widely accepted
- **emerging-research**: Promising research findings, needs more replication studies
- **expert-consensus**: Based on practitioner experience, limited research but widely practiced

## Citation Guidelines

1. Every factual claim must have an inline citation (^1, ^2, etc.)
2. Prefer peer-reviewed journal articles
3. Include meta-analyses and systematic reviews when available
4. Use APA format for citations in the Sources section
5. Include DOI or URL when available

## Syncing Content

After adding or updating articles, run the sync script to update the database:

```bash
pnpm sync-wiki
```

This script:
1. Scans all .md files in this directory
2. Parses frontmatter and content
3. Converts markdown to HTML
4. Updates the Supabase database

## File Naming

Use kebab-case for filenames, matching the article slug:

- ✅ `protein-requirements.md`
- ✅ `progressive-overload.md`
- ❌ `Protein Requirements.md`
- ❌ `protein_requirements.md`

The filename (without .md) becomes the article slug in URLs.
