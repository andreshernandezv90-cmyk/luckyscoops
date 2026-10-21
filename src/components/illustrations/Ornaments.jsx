/**
 * Adornos del grimorio: esquinas, separadores de capítulo y el sigilo de la marca.
 * Todos son decorativos (aria-hidden) y usan currentColor para heredar el tono.
 */

export function CornerFlourish({ className = '', style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 80 80" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        <path d="M4 76 V20 Q4 4 20 4 H76" strokeWidth="1.6" />
        <path d="M10 76 V24 Q10 10 24 10 H76" strokeWidth="0.8" opacity="0.7" />
        <path d="M18 18 Q30 22 30 34 Q30 44 22 44 Q16 44 16 38 Q16 33 21 33" strokeWidth="1.2" />
        <path d="M18 18 Q22 30 34 30 Q44 30 44 22 Q44 16 38 16 Q33 16 33 21" strokeWidth="1.2" />
        <path d="M44 22 Q56 22 62 12" strokeWidth="1" />
        <path d="M22 44 Q22 56 12 62" strokeWidth="1" />
      </g>
      <circle cx="18" cy="18" r="3" fill="currentColor" />
      <circle cx="62" cy="12" r="1.6" fill="currentColor" />
      <circle cx="12" cy="62" r="1.6" fill="currentColor" />
    </svg>
  )
}

export function ChapterDivider({ className = '' }) {
  return (
    <svg className={`chapter-divider ${className}`} viewBox="0 0 240 20" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        <path d="M4 10 H96" strokeWidth="1" />
        <path d="M144 10 H236" strokeWidth="1" />
        <path d="M96 10 Q104 2 112 10 Q104 18 96 10" strokeWidth="1" />
        <path d="M144 10 Q136 2 128 10 Q136 18 144 10" strokeWidth="1" />
      </g>
      <path d="M120 2 L122.5 7.5 L128 10 L122.5 12.5 L120 18 L117.5 12.5 L112 10 L117.5 7.5 Z" fill="currentColor" />
      <circle cx="4" cy="10" r="1.5" fill="currentColor" />
      <circle cx="236" cy="10" r="1.5" fill="currentColor" />
    </svg>
  )
}

/** Sigilo de la marca: luna creciente dentro de un círculo con estrella. */
export function BrandSigil({ className = '', title }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : 'true'}
      focusable="false"
    >
      <g fill="none" stroke="currentColor">
        <circle cx="32" cy="32" r="29" strokeWidth="1.5" />
        <circle cx="32" cy="32" r="24.5" strokeWidth="0.75" strokeDasharray="1.5 3" />
      </g>
      <path d="M38 13 A20.6 20.6 0 1 0 38 51 A22 22 0 0 1 38 13 Z" fill="currentColor" />
      <path
        d="M42 22 L43.6 27.4 L49 29 L43.6 30.6 L42 36 L40.4 30.6 L35 29 L40.4 27.4 Z"
        fill="currentColor"
      />
      <circle cx="47" cy="41" r="1.4" fill="currentColor" />
    </svg>
  )
}

/** Mancha de tinta irregular para ensuciar con gracia las páginas. */
export function InkBlot({ className = '', variant = 0 }) {
  const shapes = [
    'M30 6 C42 4 52 14 50 26 C56 32 52 44 40 46 C34 54 20 52 16 44 C6 42 4 30 10 24 C8 14 18 6 30 6 Z',
    'M24 8 C34 2 48 8 48 20 C58 26 50 40 38 40 C32 50 14 48 12 36 C2 30 8 14 24 8 Z',
  ]
  return (
    <svg className={`ink-blot ${className}`} viewBox="0 0 60 60" aria-hidden="true" focusable="false">
      <path d={shapes[variant % shapes.length]} fill="currentColor" />
      <circle cx="54" cy="12" r="2.4" fill="currentColor" />
      <circle cx="8" cy="52" r="1.6" fill="currentColor" />
    </svg>
  )
}

/**
 * Trazo de tinta a mano alzada bajo un título. Con pathLength=1 el CSS puede
 * dibujarlo de izquierda a derecha animando stroke-dashoffset (ver styles/vela/base.css).
 */
export function InkStroke({ className = '' }) {
  return (
    <svg className={`ink-stroke ${className}`} viewBox="0 0 320 22" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        <path pathLength="1" d="M4 14 C44 8 86 17 134 11 S232 6 280 12 Q298 14 316 8" strokeWidth="2.6" />
        <path pathLength="1" d="M58 18 C118 15 188 19 248 15" strokeWidth="1" opacity="0.55" />
      </g>
    </svg>
  )
}

/** Anotaciones alquímicas del margen: sol, luna, sal, azufre y mercurio. */
export function AlchemyNotes({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 136 22" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="11" r="7" />
        <path d="M45 4 A7 7 0 1 0 45 18 A5.5 5.5 0 1 1 45 4 Z" />
        <circle cx="72" cy="11" r="7" />
        <path d="M65 11 H79" />
        <path d="M100 3 L107 13 H93 Z M100 13 V20 M96 17 H104" />
        <path d="M122 2 Q126 6 130 2" />
        <circle cx="126" cy="10" r="4" />
        <path d="M126 14 V20 M123 17.5 H129" />
      </g>
      <circle cx="10" cy="11" r="1.4" fill="currentColor" />
    </svg>
  )
}

/** Pequeña estrella de cuatro puntas para viñetas y detalles. */
export function Sparkle({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill="currentColor" />
    </svg>
  )
}

export function CheckMark({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path d="M4 10.5 L8.2 14.5 L16 5.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ArrowIcon({ className = '', direction = 'right' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      aria-hidden="true"
      focusable="false"
      style={direction === 'left' ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path d="M3 10 H16 M11 5 L16 10 L11 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function CartIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {/* Pequeño caldero como icono del carrito */}
      <path d="M3 9 H21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4.5 9 C4.5 15 7.5 19 12 19 C16.5 19 19.5 15 19.5 9" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 19 L7 21.5 M16 19 L17 21.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 6 Q9 3.5 11 4 M13.5 6.2 Q14 3 16 3.4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
    </svg>
  )
}

export function MenuIcon({ open }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" width="24" height="24">
      {open ? (
        <path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <path d="M4 7 H20 M4 12 H20 M4 17 H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  )
}

export function TrashIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path
        d="M4 6 H16 M8 6 V4 H12 V6 M5.5 6 L6.3 16.5 H13.7 L14.5 6 M8.5 9 V14 M11.5 9 V14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
