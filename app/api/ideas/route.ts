import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');
    if (!userId) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }
    const { data: member } = await supabaseAdmin
      .from('couple_members')
      .select('couple_id')
      .eq('user_id', userId)
      .single();
    if (!member) {
      return NextResponse.json({ ideas: [] });
    }
    const { data, error } = await supabaseAdmin
      .from('date_ideas')
      .select('*')
      .eq('couple_id', member.couple_id)
      .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ideas: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { couple_id, title, category, level, estimated_budget, estimated_duration, location, description, user_id } = body;

    if (!couple_id || !title || !user_id) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('date_ideas')
      .insert({
        couple_id,
        title,
        category: category || 'Cena',
        level: level || 'romantic',
        estimated_budget: estimated_budget ? parseFloat(estimated_budget) : null,
        estimated_duration: estimated_duration || null,
        location: location || null,
        description: description || null,
        created_by: user_id,
      })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, idea: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
