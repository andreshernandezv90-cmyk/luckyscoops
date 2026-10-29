import { useId } from 'react'
import { BRAND } from '../../config/brand.js'

/**
 * Iconografía de la tienda: sigilos de intención, fases lunares (tamaños)
 * e ilustraciones de los ingredientes extra. Trazo dorado estilo grabado.
 */

const SIGIL_PATHS = {
  // Corazón atravesado por una pequeña llama
  amor: (
    <>
      <path d="M32 52 C14 40 8 30 12 21 C16 12 27 12 32 21 C37 12 48 12 52 21 C56 30 50 40 32 52 Z" />
      <path d="M32 21 V44" />
      <path d="M26 30 Q32 26 38 30" />
      <path d="M32 6 Q36 11 32 15 Q28 11 32 6 Z" />
    </>
  ),
  // Escudo con la runa Algiz
  proteccion: (
    <>
      <path d="M32 6 L52 13 V30 C52 42 43 51 32 57 C21 51 12 42 12 30 V13 Z" />
      <path d="M32 18 V48 M32 32 L23 21 M32 32 L41 21" />
      <path d="M17 16 L32 11 L47 16" opacity="0.6" />
    </>
  ),
  // Moneda con hojas de laurel
  abundancia: (
    <>
      <circle cx="32" cy="34" r="15" />
      <circle cx="32" cy="34" r="10.5" strokeDasharray="2 2.5" />
      <path d="M32 27 L34 32 L39 34 L34 36 L32 41 L30 36 L25 34 L30 32 Z" />
      <path d="M14 26 C8 18 12 10 20 9 C22 16 20 22 14 26 Z" />
      <path d="M50 26 C56 18 52 10 44 9 C42 16 44 22 50 26 Z" />
      <path d="M20 54 Q32 60 44 54" />
    </>
  ),
  // Luna creciente con volutas de humo y estrella
  limpieza: (
    <>
      <path d="M38 10 A22 22 0 1 0 50 44 A17 17 0 1 1 38 10 Z" />
      <path d="M44 56 Q38 50 44 46 Q50 42 44 36" />
      <path d="M52 52 Q48 48 52 44" opacity="0.7" />
      <path d="M48 14 L49.5 18.5 L54 20 L49.5 21.5 L48 26 L46.5 21.5 L42 20 L46.5 18.5 Z" />
    </>
  ),
}

export function IntentionSigil({ id, className = '', title }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : 'true'}
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {SIGIL_PATHS[id]}
      </g>
    </svg>
  )
}

/** Fase lunar: crescent (Aprendiz) · half (Hechicera) · full (Gran Bruja). */
export function MoonPhase({ phase, className = '' }) {
  const uid = useId().replace(/:/g, '')
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`moon-${uid}`} cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#fff6dc" />
          <stop offset="1" stopColor="#d9b762" />
        </radialGradient>
        <clipPath id={`moon-clip-${uid}`}>
          <circle cx="32" cy="32" r="20" />
        </clipPath>
      </defs>
      <circle cx="32" cy="32" r="27" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="1 3.2" />
      <circle cx="32" cy="32" r="20" fill="rgba(20, 14, 10, 0.55)" stroke="currentColor" strokeWidth="1.2" />
      <g clipPath={`url(#moon-clip-${uid})`}>
        {phase === 'full' && <circle cx="32" cy="32" r="20" fill={`url(#moon-${uid})`} />}
        {phase === 'half' && <rect x="32" y="10" width="22" height="44" fill={`url(#moon-${uid})`} />}
        {phase === 'crescent' && (
          <path d="M32 12 A20 20 0 0 1 32 52 A13 20 0 0 0 32 12 Z" fill={`url(#moon-${uid})`} />
        )}
        {phase === 'full' && (
          <g fill="#c4a050" opacity="0.5">
            <circle cx="26" cy="27" r="3" />
            <circle cx="38" cy="38" r="2.2" />
            <circle cx="35" cy="24" r="1.4" />
          </g>
        )}
      </g>
    </svg>
  )
}

/** Ilustraciones de los ingredientes extra. */
export function ExtraIcon({ id, color = 'currentColor', className = '', ...svgProps }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true" focusable="false" {...svgProps}>
      {id === 'cristal' && (
        <g strokeLinejoin="round">
          <path d="M22 54 L16 30 L24 14 L32 30 L28 54 Z" fill={color} opacity="0.55" stroke="currentColor" strokeWidth="1.6" />
          <path d="M30 56 L28 24 L38 6 L48 24 L44 56 Z" fill={color} opacity="0.85" stroke="currentColor" strokeWidth="1.8" />
          <path d="M38 6 L36 24 L38 56 M28 24 L48 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.7" />
          <path d="M44 54 L46 38 L52 32 L56 40 L52 54 Z" fill={color} opacity="0.6" stroke="currentColor" strokeWidth="1.4" />
          <path d="M12 56 H58" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      )}
      {id === 'amuleto' && (
        <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 6 Q32 26 50 6" strokeDasharray="2.5 2.5" />
          <circle cx="32" cy="21" r="3" />
          <circle cx="32" cy="40" r="15" fill={color} fillOpacity="0.35" />
          <circle cx="32" cy="40" r="10.5" />
          <path d="M32 31 L34.6 37.4 L41 40 L34.6 42.6 L32 49 L29.4 42.6 L23 40 L29.4 37.4 Z" fill="currentColor" />
        </g>
      )}
      {id === 'carta_natal' && (
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          {/* Rueda de la carta natal: doce casas, un astro y tres planetas */}
          <circle cx="32" cy="32" r="25" fill={color} fillOpacity="0.3" strokeWidth="1.8" />
          <circle cx="32" cy="32" r="17" strokeWidth="1.4" />
          <circle cx="32" cy="32" r="6" strokeWidth="1.4" />
          <path
            d="M32 7 V15 M32 49 V57 M7 32 H15 M49 32 H57 M19.5 10.3 L23.5 17.3 M40.5 46.7 L44.5 53.7 M10.3 19.5 L17.3 23.5 M46.7 40.5 L53.7 44.5 M44.5 10.3 L40.5 17.3 M23.5 46.7 L19.5 53.7 M53.7 19.5 L46.7 23.5 M17.3 40.5 L10.3 44.5"
            strokeWidth="1.2"
          />
          <path d="M26 30 L38 34 M29 39 L35 25" strokeWidth="1" opacity="0.7" />
          <g fill="currentColor" stroke="none">
            <circle cx="40" cy="22" r="2.2" />
            <circle cx="21" cy="38" r="1.8" />
            <circle cx="43" cy="40" r="1.6" />
          </g>
          <path d="M32 27.5 L33.3 30.7 L36.5 32 L33.3 33.3 L32 36.5 L30.7 33.3 L27.5 32 L30.7 30.7 Z" fill="currentColor" strokeWidth="0.8" />
        </g>
      )}
      {id === 'regalo' && (
        <g strokeLinecap="round" strokeLinejoin="round">
          <rect x="12" y="26" width="40" height="30" rx="2" fill="#a3825a" fillOpacity="0.45" stroke="currentColor" strokeWidth="1.8" />
          <rect x="9" y="19" width="46" height="9" rx="2" fill="#a3825a" fillOpacity="0.6" stroke="currentColor" strokeWidth="1.8" />
          <path d="M32 19 V56" stroke={color} strokeWidth="4.5" />
          <path d="M32 19 C24 6 14 10 20 17 C23 20 30 19 32 19 Z" fill={color} stroke="currentColor" strokeWidth="1.4" />
          <path d="M32 19 C40 6 50 10 44 17 C41 20 34 19 32 19 Z" fill={color} stroke="currentColor" strokeWidth="1.4" />
          <path d="M42 40 H50 V48 H42 Z" fill="#efe3c6" stroke="currentColor" strokeWidth="1" />
        </g>
      )}
    </svg>
  )
}

/** Sello de lacre que aparece al elegir una opción. */
export function WaxSeal({ color = '#7d1d3a', className = '', glyph = 'star' }) {
  const uid = useId().replace(/:/g, '')
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`wax-${uid}`} cx="0.38" cy="0.32" r="0.8">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="0.35" stopColor={color} stopOpacity="1" />
          <stop offset="1" stopColor="#000" stopOpacity="0.45" />
        </radialGradient>
      </defs>
      <path
        d="M32 3 C38 4 41 1 45 5 C49 9 54 7 56 12 C58 17 62 20 60 26 C59 31 63 35 59 40 C56 44 58 50 53 53 C48 56 47 61 41 60 C36 60 33 64 28 61 C23 58 18 61 15 56 C12 51 6 51 5 45 C4 40 0 36 3 31 C5 26 2 21 6 17 C10 13 9 7 15 6 C20 5 24 1 32 3 Z"
        fill={color}
      />
      <path
        d="M32 3 C38 4 41 1 45 5 C49 9 54 7 56 12 C58 17 62 20 60 26 C59 31 63 35 59 40 C56 44 58 50 53 53 C48 56 47 61 41 60 C36 60 33 64 28 61 C23 58 18 61 15 56 C12 51 6 51 5 45 C4 40 0 36 3 31 C5 26 2 21 6 17 C10 13 9 7 15 6 C20 5 24 1 32 3 Z"
        fill={`url(#wax-${uid})`}
      />
      <circle cx="32" cy="32" r="19" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="2" />
      <circle cx="32" cy="32" r="19" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" transform="translate(-0.8 -0.8)" />
      {glyph === 'star' && (
        <path
          d="M32 19 L35 28.5 L45 29 L37 35 L40 45 L32 39 L24 45 L27 35 L19 29 L29 28.5 Z"
          fill="rgba(0,0,0,0.3)"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="0.8"
        />
      )}
      {/* Isotipo de la marca hundido en el lacre (sello del Grimorio) */}
      {glyph === 'brand' && BRAND.logoMark && (
        <>
          <mask id={`seal-mark-${uid}`} maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64" style={{ maskType: 'alpha' }}>
            <image href={BRAND.logoMark} x="17" y="17" width="30" height="30" />
          </mask>
          <rect width="64" height="64" fill="rgba(255,255,255,0.3)" mask={`url(#seal-mark-${uid})`} transform="translate(0.6 0.8)" />
          <rect width="64" height="64" fill="rgba(0,0,0,0.42)" mask={`url(#seal-mark-${uid})`} />
        </>
      )}
      {glyph === 'check' && (
        <path d="M23 32.5 L29.5 39 L42 25" fill="none" stroke="rgba(255,240,220,0.85)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  )
}
