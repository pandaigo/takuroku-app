import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 自分の全データを JSON でエクスポート（F13・離脱可能性の保証）。
export async function GET() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims
  if (!claims) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  const uid = typeof claims.sub === 'string' ? claims.sub : null
  if (!uid) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // RLS により自分のデータのみが返る
  const [profile, groups, members, sessions, attendees, events, links] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', uid).maybeSingle(),
      supabase.from('groups').select('*'),
      supabase.from('members').select('*'),
      supabase.from('sessions').select('*'),
      supabase.from('session_attendees').select('*'),
      supabase.from('events').select('*'),
      supabase.from('public_links').select('*'),
    ])

  const payload = {
    exported_at: new Date().toISOString(),
    user_id: uid,
    profile: profile.data,
    groups: groups.data ?? [],
    members: members.data ?? [],
    sessions: sessions.data ?? [],
    session_attendees: attendees.data ?? [],
    events: events.data ?? [],
    public_links: links.data ?? [],
  }

  // エクスポート計測
  await supabase.from('events').insert({
    user_id: uid,
    type: 'data_exported',
  })

  const filename = `takuroku-export-${new Date()
    .toISOString()
    .slice(0, 10)}.json`

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
