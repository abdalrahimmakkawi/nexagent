interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({ width = '100%', height = 20, 
  borderRadius = 8, className, style }: SkeletonProps) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, #1c1c2e 25%, #252538 50%, #1c1c2e 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        ...style
      }}
    />
  )
}

export function SkeletonCard() {
  return (
    <div style={{ 
      padding: 24, 
      background: '#0d0d18',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 16,
    }}>
      <Skeleton height={20} width="60%" borderRadius={6} />
      <div style={{ marginTop: 12 }}>
        <Skeleton height={14} borderRadius={4} />
        <Skeleton height={14} borderRadius={4} 
          width="80%" style={{ marginTop: 8 }} />
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ 
          display: 'grid', 
          gridTemplateColumns: '2fr 1fr 1fr',
          gap: 16, padding: '12px 16px',
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
