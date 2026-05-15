import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { notifyPartner } from '@/lib/utils/notifications';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data: event, error } = await supabaseAdmin.from('events').select('*').eq('id', id).single();
    if (error || !event) {
      return NextResponse.json({ error: error?.message || 'Event not found' }, { status: 404 });
    }
    const { data: items } = await supabaseAdmin.from('event_checklist_items').select('*').eq('event_id', id).order('created_at', { ascending: true });
    const { data: memory } = await supabaseAdmin.from('memories').select('*').eq('event_id', id).maybeSingle();
    return NextResponse.json({ event, checklist: items || [], memory });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, user_id } = body;

    const { error } = await supabaseAdmin.from('events').update({ status }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (status === 'done' && user_id) {
      const { data: event } = await supabaseAdmin
        .from('events')
        .select('couple_id, title')
        .eq('id', id)
        .single();

      if (event) {
        await notifyPartner(
          supabaseAdmin,
          event.couple_id,
          user_id,
          'event_completed',
          '{name} ha completato un evento',
          `"${event.title}" è stato segnato come completato.`
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { error } = await supabaseAdmin.from('events').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
