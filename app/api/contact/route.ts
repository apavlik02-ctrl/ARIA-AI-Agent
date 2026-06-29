import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

export async function POST(request: NextRequest) {
  const sb = getSupabase();
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !String(name).trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!email || !String(email).trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    if (!message || !String(message).trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Rate limit: check if same email submitted in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recent } = await sb
      .from('contact_submissions')
      .select('id')
      .eq('email', String(email).trim().toLowerCase())
      .gte('created_at', oneHourAgo)
      .limit(1);

    if (recent && recent.length > 0) {
      return NextResponse.json(
        { error: 'You have already submitted a message recently. Please wait before submitting again.' },
        { status: 429 }
      );
    }

    const { error } = await sb.from('contact_submissions').insert({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      message: String(message).trim(),
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to save your message. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Contact API error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
