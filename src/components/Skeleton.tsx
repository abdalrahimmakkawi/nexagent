export function Skeleton({ 
  width = '100%', 
  height = 20, 
  borderRadius = 8,
  style = {} 
}: { 
  width?: string | number
  height?: number
  borderRadius?: number
  style?: React.CSSProperties
}) {
  return (
    <div style={{
      width,
      height,
      borderRadius,
      background: 'linear-gradient(90deg, #1c1c2e 25%, #252538 50%, #1c1c2e 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      ...style,
    }} />
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: 16,
          padding: '14px 16px',
          background: '#0d0d18',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <Skeleton height={14} borderRadius={4} />
          <Skeleton height={14} borderRadius={4} />
          <Skeleton height={14} borderRadius={4} />
          <Skeleton height={14} borderRadius={4} width="60%" />
        </div>
      ))}
    </div>
  )
}
