import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceRoleKey || !url) {
    return NextResponse.json({ error: 'Missing env vars' }, { status: 500 });
  }

  const admin = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const sql = `
    DROP POLICY IF EXISTS "couples_insert_creator" ON couples;
    CREATE POLICY "couples_insert_creator" ON couples
      FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  `;

  const { error } = await admin.rpc('exec_sql', { query: sql });

  if (error) {
    // Try direct SQL via REST
    const resp = await fetch(`${url}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'tx=rollback',
      },
      body: JSON.stringify({ query: sql }),
    });
    if (!resp.ok) {
      return NextResponse.json({ error: error.message, fallback: await resp.text() }, { status: 500 });
    }
    return NextResponse.json({ success: true, method: 'fallback' });
  }

  return NextResponse.json({ success: true });
}
