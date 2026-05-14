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
    const { name, invite_code, user_id } = body;

    if (!name || !invite_code || !user_id) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const { data: couple, error: coupleError } = await supabaseAdmin
      .from('couples')
      .insert({ name, invite_code, created_by: user_id })
      .select()
      .single();

    if (coupleError || !couple) {
      return NextResponse.json({ error: coupleError?.message || 'Failed to create couple' }, { status: 500 });
    }

    const { error: memberError } = await supabaseAdmin
      .from('couple_members')
      .insert({ couple_id: couple.id, user_id, role: 'admin' });

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, couple });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
