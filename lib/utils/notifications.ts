import { SupabaseClient } from '@supabase/supabase-js';

export async function notifyPartner(
  supabaseAdmin: SupabaseClient,
  coupleId: string,
  senderId: string,
  type: string,
  titleTemplate: string,
  messageTemplate?: string
) {
  const { data: senderProfile } = await supabaseAdmin
    .from('profiles')
    .select('full_name')
    .eq('id', senderId)
    .single();

  const senderName = senderProfile?.full_name || 'Il tuo partner';
  const title = titleTemplate.replace('{name}', senderName);
  const message = messageTemplate ? messageTemplate.replace('{name}', senderName) : undefined;

  const { data: members } = await supabaseAdmin
    .from('couple_members')
    .select('user_id')
    .eq('couple_id', coupleId)
    .neq('user_id', senderId);

  if (!members || members.length === 0) return;

  const notifications = members.map((m) => ({
    user_id: m.user_id,
    type,
    title,
    message,
  }));

  try {
    await supabaseAdmin.from('notifications').insert(notifications);
  } catch {
    // Tabella notifications potrebbe non esistere ancora; ignora silenziosamente
  }
}
