'use client'

const TESTIMONIALS = [
  {
    quote: 'Hab vorher alles in Excel gemacht. Jetzt paste ich den Link rein und hab sofort alle Zahlen. Spart mir locker eine Stunde pro Objekt.',
    name: 'Markus R.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    fallback: 'https://randomuser.me/api/portraits/men/75.jpg',
  },
  {
    quote: 'Kaufnebenkosten werden automatisch nach Bundesland berechnet. Das zeigt, dass das Tool für den deutschen Markt gebaut ist.',
    name: 'Sandra K.',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
    fallback: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
  {
    quote: 'Der Deal Score gibt mir eine schnelle Einschätzung, bevor ich mich tiefer in ein Objekt reinarbeite. Sehr praktisch bei vielen Inseraten.',
    name: 'Thomas W.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    fallback: 'https://randomuser.me/api/portraits/men/52.jpg',
  },
  {
    quote: 'Ich schick meinem Bankberater jetzt einfach die Cashflow-Analyse aus BrickScore mit. Spart beiden Seiten Zeit.',
    name: 'Julia M.',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face',
    fallback: 'https://randomuser.me/api/portraits/women/90.jpg',
  },
]

export default function Testimonials() {
  return (
    <section className="bs-testimonials-section" style={{ padding: '96px 5%', background: '#fafafa' }}>
      <div style={{ marginBottom: 56 }}>
        <h2
          style={{
            margin: '0 0 4px',
            font: '700 clamp(28px, 3vw, 40px)/1.1 var(--font-dm-sans), sans-serif',
            letterSpacing: '-0.025em',
            color: '#0a0a0a',
          }}
        >
          Was unsere Nutzer
        </h2>
        <h2
          style={{
            margin: '0 0 16px',
            font: '400 clamp(28px, 3vw, 40px)/1.1 var(--font-dm-sans), sans-serif',
            letterSpacing: '-0.025em',
            color: '#b0b0b0',
          }}
        >
          über BrickScore sagen
        </h2>
        <p style={{ margin: 0, font: '400 15px/1 var(--font-dm-sans), sans-serif', color: '#8a8a8a' }}>
          Echtes Feedback von Immobilien-Investoren aus ganz Deutschland.
        </p>
      </div>

      <div
        className="bs-testimonials-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 20,
          alignItems: 'stretch',
        }}
      >
        {TESTIMONIALS.map((t) => (
          <div
            key={t.name}
            style={{
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.07)',
              borderRadius: 16,
              padding: '32px 24px 28px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 16,
              height: '100%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.06)',
              transform: 'translateY(0)',
              transition: 'box-shadow 200ms ease, transform 200ms ease',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLDivElement
              el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.10)'
              el.style.transform = 'translateY(-4px)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLDivElement
              el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.06)'
              el.style.transform = 'translateY(0)'
            }}
          >
            {/* Avatar */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={t.avatar}
              alt={t.name}
              onError={(e) => { e.currentTarget.src = t.fallback }}
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid rgba(0,0,0,0.06)',
                display: 'block',
              }}
            />

            {/* Name */}
            <div style={{ font: '600 15px/1 var(--font-dm-sans), sans-serif', color: '#0a0a0a' }}>
              {t.name}
            </div>

            {/* Quote */}
            <p
              style={{
                margin: 0,
                font: '400 14px/1.6 var(--font-dm-sans), sans-serif',
                color: '#7a7a7a',
              }}
            >
              &ldquo;{t.quote}&rdquo;
            </p>
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 1023px) {
          .bs-testimonials-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 767px) {
          .bs-testimonials-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
