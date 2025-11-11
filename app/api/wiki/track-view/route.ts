import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json(
        { error: 'Missing article slug' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Call database functions to increment view counts
    // These are atomic operations that handle concurrency
    await Promise.all([
      // Increment total view count
      supabase.rpc('increment_view_count', { article_slug: slug }),

      // Upsert daily view count for "Populair Vandaag"
      supabase.rpc('upsert_daily_view', { article_slug: slug }),
    ]);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error tracking view:', error);
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    );
  }
}
