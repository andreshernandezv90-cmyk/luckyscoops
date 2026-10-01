import { useId } from 'react'

/**
 * Frasco de poción dibujado en SVG.
 * `BottleShape` devuelve un <g> centrado en (0,0) para usarlo dentro de otros
 * SVG (el caldero); `PotionBottle` lo envuelve en su propio <svg>.
 *
 * shape: 'round' (matraz de intención) · 'vial' (esencia de tamaño)
 */
const OUTLINES = {
  round: 'M24 14 V34.8 A24 24 0 1 0 36 34.8 V14 Z',
  vial: 'M25 14 V28 Q16 28 16 38 V74 Q16 82 24 82 H36 Q44 82 44 74 V38 Q44 28 35 28 V14 Z',
}

export function BottleShape({ color, deep, glow = '#fff', fill = 0.7, shape = 'round', showGlow = true }) {
  const uid = useId().replace(/:/g, '')
  const clipId = `bottle-clip-${uid}`
  const liquidId = `bottle-liquid-${uid}`
  const glowId = `bottle-glow-${uid}`
  const outline = OUTLINES[shape] ?? OUTLINES.round
  // El cuerpo va de y≈30 a y=82; el nivel 1 llena hasta el cuello.
  const liquidTop = 82 - Math.min(1, Math.max(0, fill)) * 58

  return (
    <g transform="translate(-30 -45)">
      <defs>
        <clipPath id={clipId}>
          <path d={outline} />
        </clipPath>
        <linearGradient id={liquidId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} />
          <stop offset="1" stopColor={deep ?? color} />
        </linearGradient>
        <radialGradient id={glowId}>
          <stop offset="0" stopColor={glow} stopOpacity="0.55" />
          <stop offset="1" stopColor={glow} stopOpacity="0" />
        </radialGradient>
      </defs>
      {showGlow && <circle cx="30" cy="56" r="34" fill={`url(#${glowId})`} />}
      {/* Vidrio */}
      <path d={outline} fill="rgba(240, 230, 210, 0.16)" />
      <g clipPath={`url(#${clipId})`}>
        <rect x="0" y={liquidTop} width="60" height="90" fill={`url(#${liquidId})`} />
        <ellipse cx="30" cy={liquidTop} rx="30" ry="2.4" fill={glow} opacity="0.45" />
        <circle cx="24" cy={Math.max(liquidTop + 10, 60)} r="2" fill="#fff" opacity="0.35" />
        <circle cx="35" cy={Math.max(liquidTop + 18, 68)} r="1.4" fill="#fff" opacity="0.3" />
      </g>
      <path d={outline} fill="none" stroke="rgba(250, 240, 220, 0.75)" strokeWidth="1.6" />
      {/* Reflejo */}
      <path
        d={shape === 'vial' ? 'M21 40 V70' : 'M15 52 Q14 64 21 72'}
        fill="none"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.35"
      />
      {/* Boca y corcho */}
      <rect x="21" y="11" width="18" height="4.5" rx="2" fill="#d8c7a3" stroke="#6b5236" strokeWidth="0.8" />
      <path d="M24 11 L23 3.5 Q30 1 37 3.5 L36 11 Z" fill="#9a6b3f" stroke="#5c3d22" strokeWidth="0.8" />
      <path d="M26 5 H34 M25.5 8 H34.5" stroke="#6e4a2a" strokeWidth="0.7" />
      {/* Hilo y etiqueta */}
      <path d="M23 18 Q30 21 37 18" fill="none" stroke="#c9a24a" strokeWidth="1.1" />
      <path d="M36.5 18.5 Q42 24 40 30" fill="none" stroke="#c9a24a" strokeWidth="0.9" />
      <rect x="37.5" y="29" width="7" height="9" rx="1" fill="#efe3c6" stroke="#8a6a3a" strokeWidth="0.6" transform="rotate(12 41 33)" />
    </g>
  )
}

export function PotionBottle({ className = '', label, ...shapeProps }) {
  return (
    <svg
      className={className}
      viewBox="-34 -50 68 100"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : 'true'}
      focusable="false"
    >
      <BottleShape {...shapeProps} />
    </svg>
  )
}
