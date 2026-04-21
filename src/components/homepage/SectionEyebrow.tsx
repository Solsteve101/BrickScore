import { ReactNode } from 'react'

interface SectionEyebrowProps {
  num: string
  title: string
  subtitle?: string
  children?: ReactNode
}

export default function SectionEyebrow({ num, title, subtitle, children }: SectionEyebrowProps) {
  return (
    <section
      style={{
        padding: '96px 5% 0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 36 }}>
        <span
          style={{
            font: '500 13px var(--font-jetbrains-mono), monospace',
            color: 'rgba(38,37,30,0.45)',
            letterSpacing: 0,
          }}
        >
          {num}
        </span>
        <div>
          <h2
            style={{
              margin: 0,
              fontFamily: 'var(--font-fraunces), Georgia, serif',
              fontWeight: 400,
              fontSize: 'clamp(34px, 4.4vw, 52px)',
              lineHeight: 1.04,
              letterSpacing: '-0.025em',
              color: '#26251e',
              maxWidth: 720,
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              style={{
                margin: '14px 0 0',
                font: '400 17px/1.5 var(--font-space-grotesk), sans-serif',
                color: 'rgba(38,37,30,0.6)',
                maxWidth: 560,
                letterSpacing: '-0.005em',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children}
    </section>
  )
}
