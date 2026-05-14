import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, couple_id, event_id, title, note, photo_url, user_id } = body;

    if (!couple_id || !event_id || !title || !user_id) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    if (id) {
      const { data, error } = await supabaseAdmin
        .from('memories')
        .update({ title, note, photo_url })
        .eq('id', id)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, memory: data });
    }

    const { data, error } = await supabaseAdmin
      .from('memories')
      .insert({ couple_id, event_id, title, note, photo_url, created_by: user_id })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, memory: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
