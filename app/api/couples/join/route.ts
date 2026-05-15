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
    const { invite_code, user_id } = body;

    if (!invite_code || !user_id) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const { data: couple, error: findError } = await supabaseAdmin
      .from('couples')
      .select('id, created_by')
      .eq('invite_code', invite_code.trim().toUpperCase())
      .single();

    if (findError || !couple) {
      return NextResponse.json({ error: 'Codice invito non valido.' }, { status: 404 });
    }

    const { error: memberError } = await supabaseAdmin
      .from('couple_members')
      .insert({ couple_id: couple.id, user_id, role: 'member' });

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 });
    }

    // Notifica il creatore della coppia
    if (couple.created_by && couple.created_by !== user_id) {
      const { data: newUserProfile } = await supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('id', user_id)
        .single();

      const partnerName = newUserProfile?.full_name || 'Il tuo partner';

      await supabaseAdmin.from('notifications').insert({
        user_id: couple.created_by,
        type: 'partner_joined',
        title: `${partnerName} si è unito alla coppia!`,
        message: 'Ora potete iniziare a pianificare insieme su NoiDue.',
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
