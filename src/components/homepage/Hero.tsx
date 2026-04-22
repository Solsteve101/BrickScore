'use client'

import { useState, useEffect } from 'react'

const WORDS = ['Investoren', 'Eigennutzer', 'Vermieter', 'Käufer', 'Analysten']

/* ─── City map — shown only in upper-right corner ─── */
function CityMap() {
  return (
    <svg
      viewBox="0 0 640 460"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', display: 'block' }}
      preserveAspectRatio="xMaxYMin slice"
      aria-hidden="true"
    >
      <rect width="640" height="460" fill="#f0f0f0" />

      {/* Main diagonal */}
      <line x1="-20" y1="50"  x2="660" y2="380" stroke="#b0b0b0" strokeWidth="13" />
      <line x1="-20" y1="64"  x2="660" y2="394" stroke="#c8c8c8" strokeWidth="2" />
      <line x1="-20" y1="36"  x2="660" y2="366" stroke="#c8c8c8" strokeWidth="2" />

      {/* Secondary diagonal */}
      <line x1="660" y1="65"  x2="-20" y2="360" stroke="#b8b8b8" strokeWidth="8" />

      {/* Horizontal */}
      <line x1="-20" y1="130" x2="660" y2="130" stroke="#b4b4b4" strokeWidth="7" />
      <line x1="-20" y1="255" x2="660" y2="255" stroke="#b4b4b4" strokeWidth="7" />
      <line x1="-20" y1="380" x2="660" y2="380" stroke="#b4b4b4" strokeWidth="5" />
      <line x1="-20" y1="183" x2="660" y2="183" stroke="#c8c8c8" strokeWidth="3" />
      <line x1="-20" y1="318" x2="660" y2="318" stroke="#c8c8c8" strokeWidth="3" />
      <line x1="-20" y1="72"  x2="660" y2="72"  stroke="#d0d0d0" strokeWidth="2" />
      <line x1="-20" y1="435" x2="660" y2="435" stroke="#d0d0d0" strokeWidth="1.5" />

      {/* Vertical */}
      <line x1="95"  y1="-20" x2="95"  y2="480" stroke="#b4b4b4" strokeWidth="7" />
      <line x1="270" y1="-20" x2="270" y2="480" stroke="#b4b4b4" strokeWidth="7" />
      <line x1="445" y1="-20" x2="445" y2="480" stroke="#b4b4b4" strokeWidth="5" />
      <line x1="565" y1="-20" x2="565" y2="480" stroke="#c8c8c8" strokeWidth="3" />
      <line x1="168" y1="-20" x2="168" y2="480" stroke="#c8c8c8" strokeWidth="3" />
      <line x1="355" y1="-20" x2="355" y2="480" stroke="#c8c8c8" strokeWidth="3" />
      <line x1="28"  y1="-20" x2="28"  y2="480" stroke="#d0d0d0" strokeWidth="2" />
      <line x1="524" y1="-20" x2="524" y2="480" stroke="#d0d0d0" strokeWidth="1.5" />
      <line x1="615" y1="-20" x2="615" y2="480" stroke="#d8d8d8" strokeWidth="1" />

      {/* Roundabout */}
      <circle cx="270" cy="130" r="18" fill="none" stroke="#b4b4b4" strokeWidth="6" />
      <circle cx="270" cy="130" r="10" fill="#dcdcdc" />

      {/* Building blocks */}
      <rect x="33"  y="79"  width="52" height="40" fill="#e0e0e0" stroke="#b8b8b8" strokeWidth="1.5" />
      <rect x="37"  y="83"  width="20" height="15" fill="#eaeaea" />
      <rect x="60"  y="83"  width="21" height="30" fill="#e8e8e8" />

      <rect x="33"  y="137" width="52" height="37" fill="#e0e0e0" stroke="#b8b8b8" strokeWidth="1.5" />
      <rect x="37"  y="141" width="44" height="14" fill="#eaeaea" />
      <rect x="37"  y="158" width="20" height="13" fill="#e4e4e4" />
      <rect x="60"  y="158" width="21" height="13" fill="#e8e8e8" />

      <rect x="33"  y="190" width="52" height="55" fill="#e0e0e0" stroke="#b8b8b8" strokeWidth="1.5" />
      <rect x="37"  y="194" width="20" height="22" fill="#eaeaea" />
      <rect x="60"  y="194" width="21" height="22" fill="#e4e4e4" />
      <rect x="37"  y="219" width="44" height="22" fill="#e8e8e8" />

      <rect x="275" y="6"   width="80" height="48" fill="#e0e0e0" stroke="#b8b8b8" strokeWidth="1.5" />
      <rect x="279" y="10"  width="34" height="38" fill="#eaeaea" />
      <rect x="316" y="10"  width="35" height="18" fill="#e4e4e4" />
      <rect x="316" y="31"  width="35" height="17" fill="#e8e8e8" />

      <rect x="275" y="79"  width="80" height="41" fill="#e0e0e0" stroke="#b8b8b8" strokeWidth="1.5" />
      <rect x="279" y="83"  width="72" height="14" fill="#eaeaea" />
      <rect x="279" y="100" width="34" height="17" fill="#e4e4e4" />
      <rect x="316" y="100" width="35" height="17" fill="#e8e8e8" />

      <rect x="174" y="79"  width="88" height="42" fill="#e0e0e0" stroke="#b8b8b8" strokeWidth="1.5" />
      <rect x="178" y="83"  width="38" height="32" fill="#eaeaea" />
      <rect x="219" y="83"  width="39" height="16" fill="#e4e4e4" />
      <rect x="219" y="102" width="39" height="16" fill="#e8e8e8" />

      <rect x="100" y="137" width="58" height="37" fill="#e0e0e0" stroke="#b8b8b8" strokeWidth="1.5" />
      <rect x="104" y="141" width="50" height="14" fill="#eaeaea" />
      <rect x="104" y="158" width="23" height="13" fill="#e4e4e4" />
      <rect x="130" y="158" width="24" height="13" fill="#e8e8e8" />

      <rect x="100" y="190" width="58" height="55" fill="#e0e0e0" stroke="#b8b8b8" strokeWidth="1.5" />
      <rect x="104" y="194" width="50" height="22" fill="#eaeaea" />
      <rect x="104" y="219" width="23" height="23" fill="#e4e4e4" />
      <rect x="130" y="219" width="24" height="23" fill="#e8e8e8" />

      <rect x="100" y="262" width="160" height="52" fill="#e0e0e0" stroke="#b8b8b8" strokeWidth="1.5" />
      <line x1="100" y1="284" x2="260" y2="284" stroke="#c8c8c8" strokeWidth="1" />
      <rect x="104" y="267" width="40" height="14" fill="#eaeaea" />
      <rect x="147" y="267" width="40" height="14" fill="#e4e4e4" />
      <rect x="190" y="267" width="38" height="14" fill="#e8e8e8" />
      <rect x="104" y="290" width="60" height="20" fill="#e0e0e0" />
      <rect x="168" y="290" width="58" height="20" fill="#e4e4e4" />

      <rect x="362" y="137" width="72" height="37" fill="#e0e0e0" stroke="#b8b8b8" strokeWidth="1.5" />
      <rect x="366" y="141" width="30" height="27" fill="#eaeaea" />
      <rect x="399" y="141" width="31" height="27" fill="#e4e4e4" />

      <rect x="362" y="190" width="72" height="55" fill="#e0e0e0" stroke="#b8b8b8" strokeWidth="1.5" />
      <rect x="366" y="194" width="64" height="22" fill="#eaeaea" />
      <rect x="366" y="219" width="30" height="23" fill="#e4e4e4" />
      <rect x="399" y="219" width="31" height="23" fill="#e8e8e8" />

      <rect x="452" y="137" width="64" height="58" fill="#e0e0e0" stroke="#b8b8b8" strokeWidth="1.5" />
      <rect x="456" y="141" width="56" height="24" fill="#eaeaea" />
      <rect x="456" y="168" width="26" height="24" fill="#e4e4e4" />
      <rect x="485" y="168" width="27" height="24" fill="#e8e8e8" />

      <rect x="452" y="262" width="64" height="52" fill="#e0e0e0" stroke="#b8b8b8" strokeWidth="1.5" />
      <rect x="456" y="266" width="56" height="20" fill="#eaeaea" />
      <rect x="456" y="290" width="26" height="22" fill="#e4e4e4" />
      <rect x="485" y="290" width="27" height="22" fill="#e8e8e8" />

      <rect x="534" y="137" width="52" height="106" fill="#e0e0e0" stroke="#b8b8b8" strokeWidth="1.5" />
      <rect x="538" y="141" width="44" height="24" fill="#eaeaea" />
      <rect x="538" y="168" width="44" height="24" fill="#e4e4e4" />
      <rect x="538" y="195" width="44" height="44" fill="#e8e8e8" />

      {/* Tree clusters */}
      {([
        [142,102],[157,108],[150,118],
        [325,46],[339,40],[332,56],
        [398,216],[412,222],
        [216,298],[230,292],[224,308],
        [500,68],[514,62],
        [58,408],[72,414],
        [304,406],[318,400],[311,416],
      ] as [number,number][]).map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="5" fill="#c0c0c0" opacity="0.6" />
      ))}

      {/* Minor lanes */}
      <line x1="33"  y1="172" x2="87"  y2="172" stroke="#d4d4d4" strokeWidth="1" />
      <line x1="174" y1="137" x2="174" y2="250" stroke="#d4d4d4" strokeWidth="1" />
      <line x1="362" y1="262" x2="436" y2="262" stroke="#d4d4d4" strokeWidth="1" />
      <line x1="530" y1="137" x2="530" y2="325" stroke="#d4d4d4" strokeWidth="1" />
      <line x1="362" y1="325" x2="518" y2="325" stroke="#d4d4d4" strokeWidth="1" />
      <line x1="100" y1="325" x2="260" y2="325" stroke="#d4d4d4" strokeWidth="1" />
    </svg>
  )
}


export default function Hero() {
  const [activeIdx, setActiveIdx] = useState(0)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  useEffect(() => {
    const t = setInterval(() => setActiveIdx(i => (i + 1) % WORDS.length), 3500)
    return () => clearInterval(t)
  }, [])

  return (
    <section style={{ position: 'relative', padding: '40px 5% 24px', background: '#fff', overflow: 'hidden' }}>
      {/* Map — absolute inside section, flush top-right corner */}
      <div style={{
        position: 'absolute',
        top: 0, right: 0,
        width: 600, height: 600,
        pointerEvents: 'none',
        zIndex: 1,
      }}>
        <div style={{ width: '100%', height: '100%', opacity: 0.10 }}>
          <CityMap />
        </div>
        {/* Fade left */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, #ffffff 0%, rgba(255,255,255,0.75) 25%, rgba(255,255,255,0.2) 55%, transparent 80%)',
        }} />
        {/* Fade down */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 35%, rgba(255,255,255,0.65) 65%, #ffffff 100%)',
        }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center', position: 'relative', zIndex: 2 }}>

        {/* ── Left: headline + CTA ── */}
        <div style={{ alignSelf: 'center' }}>
          <h1 style={{
            margin: 0,
            font: '700 clamp(38px, 4.2vw, 52px)/1.04 var(--font-dm-sans), sans-serif',
            letterSpacing: '-0.03em',
            color: '#0a0a0a',
          }}>
            Rendite berechnen für
          </h1>

          <div style={{ margin: '12px 0 0', display: 'flex', flexDirection: 'column', gap: 0 }}>
            {WORDS.map((word, i) => {
              const isGold = hoveredIdx === i || (hoveredIdx === null && i === activeIdx)
              return (
                <span
                  key={word}
                  onClick={() => setActiveIdx(i)}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{
                    display: 'block',
                    font: `${isGold ? '700' : '400'} clamp(28px, 3vw, 36px)/1.6 var(--font-dm-sans), sans-serif`,
                    letterSpacing: '-0.03em',
                    color: isGold ? '#b8921a' : '#888888',
                    cursor: 'pointer',
                    transition: 'color 300ms ease',
                    userSelect: 'none',
                  }}
                >
                  {word}
                </span>
              )
            })}
          </div>

          <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 10 }}>
            <a href="#calculator" className="cp-cta-pill" style={{ padding: '12px 26px', fontSize: 15 }}>
              Jetzt starten
            </a>
            <a href="#features" className="cp-cta-ghost" style={{ padding: '12px 26px', fontSize: 15 }}>
              Demo ansehen
            </a>
          </div>

          <p style={{
            margin: '18px 0 0',
            font: '400 12.5px/1 var(--font-dm-sans), sans-serif',
            color: '#9a9a9a',
          }}>
            Kostenlos · fertig in 30 Sekunden
          </p>
        </div>

        {/* ── Right: photo collage ── */}
        <div style={{ position: 'relative', height: 630, marginLeft: 75 }}>

          {/* Photo 1 — large portrait, top-left */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero-person-1.png"
            alt="Investorin"
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: 270, height: 330,
              objectFit: 'cover',
              objectPosition: 'center 45%',
              zIndex: 2,
              display: 'block',
              boxShadow: '0 1px 4px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.06)',
            }}
          />

          {/* Photo 2 — right of photo 1, only corner contact */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero-person-2.png"
            alt="Investor"
            style={{
              position: 'absolute',
              top: 195, left: 240,
              width: 225, height: 225,
              objectFit: 'cover',
              objectPosition: 'center top',
              zIndex: 3,
              display: 'block',
              boxShadow: '0 1px 4px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.06)',
            }}
          />

          {/* Photo 3 — below, loose grouping */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero-person-3.png"
            alt="Junge Investorin"
            style={{
              position: 'absolute',
              top: 390, left: 80,
              width: 260, height: 200,
              objectFit: 'cover',
              objectPosition: 'center top',
              zIndex: 1,
              display: 'block',
              boxShadow: '0 1px 4px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.06)',
            }}
          />

        </div>

      </div>
    </section>
  )
}
