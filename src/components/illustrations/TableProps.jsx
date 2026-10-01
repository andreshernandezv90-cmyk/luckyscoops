import { useId } from 'react'

/**
 * Objetos de la mesa que rodean al grimorio: velas, cristales, hierbas y frascos.
 * La llama de las velas parpadea con CSS (se detiene con prefers-reduced-motion).
 */

export function Candle({ height = 90, className = '', style }) {
  const uid = useId().replace(/:/g, '')
  const top = 140 - height
  return (
    <svg className={`candle ${className}`} style={style} viewBox="0 0 60 160" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`halo-${uid}`}>
          <stop offset="0" stopColor="#ffcf6b" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffcf6b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`wax-${uid}`} x1="0" x2="1">
          <stop offset="0" stopColor="#cdbb98" />
          <stop offset="0.45" stopColor="#f3e7cc" />
          <stop offset="1" stopColor="#b8a37e" />
        </linearGradient>
        <linearGradient id={`flame-${uid}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ff8a1f" />
          <stop offset="0.5" stopColor="#ffd25a" />
          <stop offset="1" stopColor="#fff6d6" />
        </linearGradient>
      </defs>
      <circle className="candle__halo" cx="30" cy={top - 14} r="30" fill={`url(#halo-${uid})`} />
      <rect x="18" y={top} width="24" height={height} rx="3" fill={`url(#wax-${uid})`} />
      <path d={`M18 ${top + 6} Q22 ${top + 22} 20 ${top + 30} Q24 ${top + 26} 25 ${top + 8}`} fill="#e9dcbd" />
      <ellipse cx="30" cy={top} rx="12" ry="3" fill="#f8efd9" />
      <path d={`M30 ${top} V${top - 6}`} stroke="#2a1a10" strokeWidth="1.4" />
      <g className="candle__flame" style={{ transformOrigin: `30px ${top - 4}px` }}>
        <path
          d={`M30 ${top - 30} C36 ${top - 18} 37 ${top - 8} 30 ${top - 4} C23 ${top - 8} 24 ${top - 18} 30 ${top - 30} Z`}
          fill={`url(#flame-${uid})`}
        />
        <ellipse cx="30" cy={top - 9} rx="2.4" ry="4" fill="#6fa8ff" opacity="0.55" />
      </g>
      {/* Platito de latón */}
      <ellipse cx="30" cy="142" rx="26" ry="6" fill="#7a5a28" />
      <ellipse cx="30" cy="140" rx="24" ry="4.5" fill="#b08a43" />
    </svg>
  )
}

export function CrystalCluster({ className = '', style, color = '#8a5bd0' }) {
  return (
    <svg className={className} style={style} viewBox="0 0 120 90" aria-hidden="true" focusable="false">
      <ellipse cx="60" cy="82" rx="54" ry="6" fill="#000" opacity="0.45" />
      <g stroke="#f1e6cc" strokeOpacity="0.35" strokeWidth="1" strokeLinejoin="round">
        <path d="M30 82 L22 46 L32 26 L42 46 L40 82 Z" fill={color} opacity="0.75" />
        <path d="M44 84 L42 30 L56 4 L70 30 L66 84 Z" fill={color} />
        <path d="M66 84 L72 44 L84 28 L92 48 L86 84 Z" fill={color} opacity="0.8" />
        <path d="M86 84 L92 60 L100 54 L106 66 L102 84 Z" fill={color} opacity="0.6" />
        <path d="M14 84 L16 66 L22 60 L28 70 L26 84 Z" fill={color} opacity="0.55" />
      </g>
      <g stroke="#fff" strokeOpacity="0.5" strokeWidth="1.2" fill="none">
        <path d="M56 4 L54 30 L56 84" />
        <path d="M84 28 L80 46" />
      </g>
      <path d="M48 34 L52 22" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </svg>
  )
}

export function HerbSprig({ className = '', style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 140 70" aria-hidden="true" focusable="false">
      <g fill="none" stroke="#5f7d4f" strokeWidth="1.6" strokeLinecap="round">
        <path d="M6 62 Q60 50 132 14" />
        <path d="M14 60 Q50 46 108 32" opacity="0.8" />
      </g>
      <g fill="#7b9a63">
        {[
          [30, 56, -30],
          [44, 52, 30],
          [58, 47, -35],
          [72, 41, 25],
          [86, 35, -40],
          [100, 28, 20],
          [114, 22, -45],
        ].map(([x, y, r]) => (
          <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="9" ry="3.2" transform={`rotate(${r} ${x} ${y})`} />
        ))}
      </g>
      {/* Lavanda */}
      <g fill="#8c6bbd">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <ellipse key={i} cx={112 + i * 3.6} cy={20 - i * 2} rx="2.6" ry="1.8" />
        ))}
      </g>
    </svg>
  )
}

export function ApothecaryJar({ className = '', style, color = '#1f5a36', label = true }) {
  const uid = useId().replace(/:/g, '')
  return (
    <svg className={className} style={style} viewBox="0 0 70 100" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`jar-${uid}`} x1="0" x2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.95" />
          <stop offset="0.4" stopColor={color} stopOpacity="0.55" />
          <stop offset="1" stopColor={color} stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <ellipse cx="35" cy="96" rx="30" ry="4" fill="#000" opacity="0.45" />
      <path d="M14 30 Q8 34 8 44 V86 Q8 94 18 94 H52 Q62 94 62 86 V44 Q62 34 56 30 Z" fill={`url(#jar-${uid})`} stroke="#f1e6cc" strokeOpacity="0.35" />
      <rect x="16" y="18" width="38" height="13" rx="3" fill="#3b2617" />
      <path d="M20 18 Q35 4 50 18 Z" fill="#5a3a22" />
      <circle cx="35" cy="8" r="4" fill="#c9a24a" />
      {label && (
        <g>
          <rect x="18" y="52" width="34" height="22" rx="2" fill="#efe3c6" />
          <path d="M23 59 H47 M23 64 H43 M23 69 H45" stroke="#6b4f33" strokeWidth="1.2" />
        </g>
      )}
      <path d="M14 42 V80" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.25" />
    </svg>
  )
}
