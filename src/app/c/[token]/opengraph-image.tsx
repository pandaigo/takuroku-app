import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'
import { monthsBetween } from '@/lib/genre'

export const alt = 'Takuroku — Group yearbook card'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// 仮説検証フェーズ（2026-05-20）：日本語フォント無し・Latin only で
// Cloudflare Workers Free plan の CPU 制限を超えないことを先に確認する。
// 卓名等の日本語は表示できないが、まず Satori が動くかを切り分ける。
const PAPER = '#fbf7f0'
const INK = '#1a1815'
const INK_2 = '#56504a'
const INK_3 = '#8a8378'
const RULE = '#a8957d'
const VERMILION = '#a8322d'

const KIND_EN: Record<string, string> = {
  trpg: 'TRPG',
  mystery: 'Mystery',
  werewolf: 'Werewolf',
  boardgame: 'Boardgame',
  other: 'Other',
}

const KIND_HEX: Record<string, string> = {
  trpg: '#1e3a5f',
  mystery: '#1a1815',
  werewolf: '#7a1f1f',
  boardgame: '#3d7068',
  other: '#5c5247',
}

const KIND_MARK: Record<string, string> = {
  trpg: 'T',
  mystery: 'M',
  werewolf: 'W',
  boardgame: 'B',
  other: 'O',
}

type CardData = {
  group: {
    id: string
    name: string
    category: string
    system_name: string | null
    started_on: string | null
  }
  members: { id: string; display_name: string }[]
  sessions: { id: string; played_on: string }[]
  last_played_on: string | null
}

export default async function OG({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  )
  const { data } = await supabase.rpc('get_public_card', { p_token: token })

  // fallback：無効トークン
  if (!data) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: PAPER,
            color: INK,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'serif',
          }}
        >
          <div
            style={{
              borderWidth: 4,
              borderStyle: 'solid',
              borderColor: VERMILION,
              color: VERMILION,
              width: 110,
              height: 110,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 64,
              fontWeight: 800,
            }}
          >
            T
          </div>
          <div
            style={{
              fontSize: 56,
              letterSpacing: 24,
              marginTop: 32,
              fontWeight: 700,
              display: 'flex',
            }}
          >
            TAKUROKU
          </div>
          <div
            style={{
              fontSize: 22,
              color: INK_2,
              letterSpacing: 8,
              marginTop: 16,
              display: 'flex',
            }}
          >
            card unavailable
          </div>
        </div>
      ),
      size,
    )
  }

  const c = data as CardData
  const total = c.sessions.length
  const dates = c.sessions.map((s) => s.played_on).filter(Boolean)
  const earliest = c.group.started_on || dates[dates.length - 1] || null
  const now = new Date()
  const from = earliest ? new Date(earliest) : now
  const months = monthsBetween(from, now)
  const pace = total > 0 ? (total / months).toFixed(1) : '0'
  const periodY = Math.floor(months / 12)
  const periodM = months % 12
  const periodStr =
    total === 0
      ? 'NEW'
      : periodY > 0
        ? `${periodY}y ${periodM}m`
        : `${months}m`

  const kindLabel = KIND_EN[c.group.category] ?? 'Other'
  const kindHex = KIND_HEX[c.group.category] ?? KIND_HEX.other
  const kindMark = KIND_MARK[c.group.category] ?? 'O'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: PAPER,
          color: INK,
          display: 'flex',
          flexDirection: 'column',
          padding: 56,
          fontFamily: 'serif',
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent 0, transparent 40px, rgba(168,149,125,0.08) 40px, rgba(168,149,125,0.08) 41px)',
        }}
      >
        {/* 外枠 */}
        <div
          style={{
            position: 'absolute',
            top: 24,
            left: 24,
            right: 24,
            bottom: 24,
            borderWidth: 3,
            borderStyle: 'double',
            borderColor: RULE,
            pointerEvents: 'none',
          }}
        />

        {/* ヘッダ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginTop: 18,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: 20,
                color: INK_2,
                letterSpacing: 20,
                display: 'flex',
              }}
            >
              TAKUROKU CARD
            </div>
            <div
              style={{
                fontSize: 56,
                color: INK,
                letterSpacing: 6,
                marginTop: 16,
                display: 'flex',
                fontWeight: 700,
              }}
            >
              {kindLabel}
            </div>
            <div
              style={{
                fontSize: 22,
                color: INK_2,
                marginTop: 12,
                letterSpacing: 4,
                display: 'flex',
              }}
            >
              {c.members.length} members
            </div>
          </div>
          <div
            style={{
              width: 110,
              height: 110,
              borderWidth: 3,
              borderStyle: 'solid',
              borderColor: kindHex,
              color: kindHex,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 64,
              fontWeight: 800,
              background: 'rgba(255,255,255,0.4)',
            }}
          >
            {kindMark}
          </div>
        </div>

        {/* 罫線 */}
        <div style={{ marginTop: 32, height: 1, background: RULE }} />

        {/* 3列：通算 / 継続 / ペース */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            marginTop: 36,
          }}
        >
          {[
            { value: String(total), label: 'SESSIONS' },
            { value: periodStr, label: 'DURATION' },
            { value: total > 0 ? `${pace}/mo` : '—', label: 'PACE' },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                borderRight: i < 2 ? `1px solid ${RULE}` : 'none',
              }}
            >
              <div
                style={{
                  fontSize: 72,
                  fontWeight: 700,
                  color: INK,
                  display: 'flex',
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 18,
                  color: INK_2,
                  letterSpacing: 6,
                  marginTop: 10,
                  display: 'flex',
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* フッタ */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: 20,
            borderTopWidth: 2,
            borderTopStyle: 'double',
            borderTopColor: RULE,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              borderWidth: 2,
              borderStyle: 'solid',
              borderColor: VERMILION,
              color: VERMILION,
              padding: '8px 20px',
              fontSize: 22,
              letterSpacing: 8,
              background: 'rgba(168,50,45,0.05)',
              fontWeight: 700,
              display: 'flex',
            }}
          >
            TAKUROKU
          </div>
          <div
            style={{
              fontSize: 16,
              color: INK_3,
              letterSpacing: 3,
              display: 'flex',
            }}
          >
            {c.last_played_on
              ? `last played ${c.last_played_on}`
              : 'takuroku'}
          </div>
        </div>
      </div>
    ),
    size,
  )
}
