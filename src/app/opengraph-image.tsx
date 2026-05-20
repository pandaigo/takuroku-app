import { ImageResponse } from 'next/og'

export const alt = 'Takuroku — Your group history, written in ink'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Satori は外部フォント取得が不安定なので、Latin中心の堅牢な OG を返す。
// トーンは和の年鑑帳：紙＋墨＋朱。
export default async function OG() {
  const paper = '#fbf7f0'
  const paper2 = '#f3ecdd'
  const ink = '#1a1815'
  const ink2 = '#56504a'
  const vermilion = '#a8322d'
  const rule = '#a8957d'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: paper,
          color: ink,
          display: 'flex',
          flexDirection: 'column',
          padding: 64,
          fontFamily: 'sans-serif',
          // 紙の縦縞
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent 0, transparent 40px, rgba(168,149,125,0.08) 40px, rgba(168,149,125,0.08) 41px)',
        }}
      >
        {/* 外枠（墨の罫） */}
        <div
          style={{
            position: 'absolute',
            top: 28,
            left: 28,
            right: 28,
            bottom: 28,
            borderWidth: 3,
            borderStyle: 'double',
            borderColor: rule,
            pointerEvents: 'none',
          }}
        />

        {/* 上部：朱の角印＋ワードマーク */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 28,
            marginTop: 30,
          }}
        >
          <div
            style={{
              width: 110,
              height: 110,
              borderWidth: 4,
              borderStyle: 'solid',
              borderColor: vermilion,
              color: vermilion,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 70,
              fontWeight: 800,
              background: paper2,
              fontFamily: 'serif',
            }}
          >
            T
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                fontSize: 92,
                fontWeight: 800,
                letterSpacing: 18,
                color: ink,
                fontFamily: 'serif',
                display: 'flex',
              }}
            >
              TAKUROKU
            </div>
            <div
              style={{
                fontSize: 22,
                color: ink2,
                letterSpacing: 8,
                marginTop: 8,
                display: 'flex',
              }}
            >
              Your group history, written in ink.
            </div>
          </div>
        </div>

        {/* 中央：印鑑風の小カード3つ */}
        <div
          style={{
            marginTop: 64,
            display: 'flex',
            gap: 24,
          }}
        >
          {[
            { mark: 'T', label: 'TRPG' },
            { mark: 'M', label: 'Mystery' },
            { mark: 'W', label: 'Werewolf' },
            { mark: 'B', label: 'Boardgame' },
          ].map((g) => (
            <div
              key={g.mark}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                borderWidth: 2,
                borderStyle: 'solid',
                borderColor: ink,
                background: paper,
                padding: '12px 18px',
              }}
            >
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderWidth: 2,
                  borderStyle: 'solid',
                  borderColor: vermilion,
                  color: vermilion,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'serif',
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                {g.mark}
              </span>
              <span
                style={{
                  fontSize: 22,
                  color: ink,
                  letterSpacing: 2,
                  display: 'flex',
                }}
              >
                {g.label}
              </span>
            </div>
          ))}
        </div>

        {/* 下部：見出し */}
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              fontSize: 30,
              color: ink,
              fontFamily: 'serif',
              letterSpacing: 6,
              display: 'flex',
            }}
          >
            The yearbook of your table.
          </div>
          <div
            style={{
              marginTop: 10,
              fontSize: 20,
              color: ink2,
              letterSpacing: 4,
              display: 'flex',
            }}
          >
            takuroku　 ／ 　 卓 録　 ／ 　 卓 ・ 会 の 年 鑑 帳
          </div>
        </div>
      </div>
    ),
    size,
  )
}
