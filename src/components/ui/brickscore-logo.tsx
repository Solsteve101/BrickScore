interface BrickScoreLogoProps {
  height?: number
  color?: string
  className?: string
  style?: React.CSSProperties
}

export function BrickScoreLogo({ height = 14, color = '#1C1C1C', className = '', style }: BrickScoreLogoProps) {
  const viewBox = '0 0 332 249'
  const aspectRatio = 332 / 249
  const width = Math.round(height * aspectRatio)
  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <rect x="0" y="172" width="57" height="76" fill={color} />
      <path d="M0 166.122V172.245L57.29 185L128 138.571L84.129 110L0 166.122Z" fill={color} />
      <path d="M1.5 56V111L84 56L277 184.5V248.5H332V166L84 0L1.5 56Z" fill={color} />
    </svg>
  )
}
