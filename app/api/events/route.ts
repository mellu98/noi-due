import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { notifyPartner } from '@/lib/utils/notifications';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, type, start_date, end_date, location, budget, description, checklist, couple_id, user_id } = body;

    if (!title || !start_date || !couple_id || !user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .insert({
        couple_id,
        title,
        type: type || 'date',
        start_date,
        end_date: end_date || null,
        location: location || null,
        budget: budget ? parseFloat(budget) : null,
        description: description || null,
        status: 'planned',
        created_by: user_id,
      })
      .select()
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: eventError?.message || 'Failed to create event' }, { status: 500 });
    }

    const validItems = (checklist || []).map((t: string) => t.trim()).filter(Boolean);
    if (validItems.length > 0) {
      await supabaseAdmin.from('event_checklist_items').insert(
        validItems.map((text: string) => ({ event_id: event.id, text }))
      );
    }

    await notifyPartner(
      supabaseAdmin,
      couple_id,
      user_id,
      'event_created',
      '{name} ha pianificato un nuovo evento',
      `"${event.title}" è stato aggiunto al calendario.`
    );

    return NextResponse.json({ success: true, event });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
