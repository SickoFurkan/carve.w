import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, type, message } = body;

    // Validate input
    if (!name || !email || !type || !message) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['bug', 'feature', 'wiki', 'other'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { message: 'Invalid feedback type' },
        { status: 400 }
      );
    }

    // Save to Supabase
    const supabase = await createClient();
    const { error: dbError } = await supabase
      .from('feedback')
      .insert({
        name,
        email,
        type,
        message,
        status: 'new'
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { message: 'Failed to save feedback' },
        { status: 500 }
      );
    }

    // TODO: Send email notification
    // This would use a service like Resend, SendGrid, or Supabase Edge Functions
    // For now, we'll just save to the database

    return NextResponse.json(
      { message: 'Feedback submitted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
