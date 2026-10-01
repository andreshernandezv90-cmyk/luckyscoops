import { useId, useMemo } from 'react'
import { motion, useReducedMotion } from 'motion/react'

/**
 * Caldero dibujado en capas SVG (debe ir dentro de un <svg viewBox="0 0 400 400">):
 *   resplandor · fuego · interior · líquido · burbujas · cuchara · cuerpo · borde · humo
 *
 * El aspecto se controla solo con props, así el ritual y la revelación
 * únicamente cambian estados:
 *   liquid   { base, glow, swirl, flecks[] }  colores del contenido
 *   activity 'idle' | 'simmer' | 'boil'       intensidad de burbujas y humo
 *   stirKey  número que, al cambiar, hace girar la cuchara
 *   spoon    'stir' | 'rest' | 'dip' | 'lift' | 'none'
 *   scoop    colores de la Scoop que sale en la cuchara (revelación)
 */

const CX = 200
const SURFACE_Y = 204
const EMPTY_LIQUID = '#1d1613'

export function Cauldron({ liquid = {}, activity = 'idle', stirKey = 0, spoon = 'stir', scoop = null }) {
  const uid = useId().replace(/:/g, '')
  const ids = {
    body: `c-body-${uid}`,
    rim: `c-rim-${uid}`,
    glow: `c-glow-${uid}`,
    liquidClip: `c-liquid-${uid}`,
    spoonClip: `c-spoon-${uid}`,
    sheen: `c-sheen-${uid}`,
    blur: `c-blur-${uid}`,
    flame: `c-flame-${uid}`,
  }
  const glow = liquid.glow ?? '#ffb347'

  return (
    <g className="cauldron">
      <defs>
        <linearGradient id={ids.body} x1="0" x2="1">
          <stop offset="0" stopColor="#060505" />
          <stop offset="0.3" stopColor="#2b2523" />
          <stop offset="0.55" stopColor="#1a1615" />
          <stop offset="1" stopColor="#050404" />
        </linearGradient>
        <linearGradient id={ids.rim} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5b524c" />
          <stop offset="1" stopColor="#1d1917" />
        </linearGradient>
        <radialGradient id={ids.glow}>
          <stop offset="0" stopColor={glow} stopOpacity="0.5" />
          <stop offset="1" stopColor={glow} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={ids.sheen} cx="0.45" cy="0.35" r="0.6">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={ids.flame} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#d9480f" />
          <stop offset="0.45" stopColor="#ff9f1c" />
          <stop offset="1" stopColor="#ffe8a3" />
        </linearGradient>
        <clipPath id={ids.liquidClip}>
          <ellipse cx={CX} cy={SURFACE_Y} rx="99" ry="24" />
        </clipPath>
        <clipPath id={ids.spoonClip}>
          <rect x="0" y="-200" width="400" height={SURFACE_Y + 200} />
        </clipPath>
        <filter id={ids.blur} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      <motion.circle
        cx={CX}
        cy="220"
        r="170"
        fill={`url(#${ids.glow})`}
        animate={{ opacity: liquid.base ? (activity === 'boil' ? 0.95 : 0.7) : 0.35 }}
        transition={{ duration: 0.5 }}
      />

      <Fire flameId={ids.flame} activity={activity} />

      {/* Interior oscuro y líquido */}
      <ellipse cx={CX} cy="200" rx="110" ry="32" fill="#0b0908" />
      <Liquid liquid={liquid} clipId={ids.liquidClip} sheenId={ids.sheen} />
      <Bubbles active={Boolean(liquid.base)} activity={activity} color={liquid.glow ?? '#ffffff'} />

      {spoon !== 'none' && (
        <g clipPath={`url(#${ids.spoonClip})`}>
          <Ladle mode={spoon} stirKey={stirKey} scoop={scoop} />
        </g>
      )}

      {/* Cuerpo frontal, patas y asas */}
      <path d="M150 316 L138 344 L152 344 L162 320 Z M250 316 L262 344 L248 344 L238 320 Z" fill="#141110" />
      <path
        d="M90 200 C86 270 128 322 200 324 C272 322 314 270 310 200 A110 32 0 0 1 90 200 Z"
        fill={`url(#${ids.body})`}
      />
      <path
        d="M104 232 C112 280 146 308 196 314"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.08"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <motion.path
        d="M92 214 C92 270 130 318 200 320 C270 318 308 270 308 214"
        fill="none"
        stroke={glow}
        strokeWidth="2"
        animate={{ strokeOpacity: liquid.base ? 0.35 : 0.1 }}
        transition={{ duration: 0.5 }}
      />
      <g fill="none" stroke="#2c2624" strokeWidth="6">
        <path d="M92 214 Q72 214 74 232 Q76 248 96 244" />
        <path d="M308 214 Q328 214 326 232 Q324 248 304 244" />
      </g>
      <ellipse cx={CX} cy="200" rx="110" ry="32" fill="none" stroke={`url(#${ids.rim})`} strokeWidth="10" />
      <path d="M98 192 Q200 158 302 192" fill="none" stroke="#8a7f76" strokeWidth="1.5" strokeOpacity="0.5" />

      <Smoke blurId={ids.blur} color={liquid.base ? glow : '#bdb3a6'} activity={activity} />
    </g>
  )
}

/** Espiral de dos brazos para el remolino de la esencia (en coordenadas circulares). */
function spiralPath(turns = 1.6, radius = 92) {
  const arm = (offset) => {
    const pts = []
    for (let i = 0; i <= 48; i++) {
      const t = i / 48
      const a = offset + t * turns * Math.PI * 2
      const r = 8 + t * (radius - 8)
      pts.push(`${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`)
    }
    return `M${pts.join(' L')}`
  }
  return `${arm(0)} ${arm(Math.PI)}`
}

function Liquid({ liquid, clipId, sheenId }) {
  const reduce = useReducedMotion()
  const uid = useId().replace(/:/g, '')
  const essenceId = `c-essence-${uid}`
  const spiral = useMemo(() => spiralPath(), [])
  // Destellos de los extras: se reparten sobre la superficie (en perspectiva).
  const flecks = useMemo(() => {
    const colors = liquid.flecks ?? []
    return colors.flatMap((color, c) =>
      Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2 + c * 1.3
        const r = 22 + ((i * 41 + c * 29) % 62)
        return {
          id: `${c}-${i}`,
          color,
          x: CX + Math.cos(a) * r,
          y: SURFACE_Y + Math.sin(a) * r * 0.23,
          s: 0.8 + ((i + c) % 3) * 0.25,
          delay: (i * 0.23 + c * 0.17) % 1.2,
        }
      }),
    )
  }, [liquid.flecks])

  return (
    <g clipPath={`url(#${clipId})`}>
      <defs>
        <radialGradient id={essenceId}>
          <stop offset="0" stopColor={liquid.swirl ?? '#000'} stopOpacity="0.95" />
          <stop offset="0.55" stopColor={liquid.swirl ?? '#000'} stopOpacity="0.45" />
          <stop offset="1" stopColor={liquid.swirl ?? '#000'} stopOpacity="0" />
        </radialGradient>
      </defs>
      <motion.ellipse
        cx={CX}
        cy={SURFACE_Y}
        rx="100"
        ry="25"
        initial={false}
        animate={{ fill: liquid.base ?? EMPTY_LIQUID }}
        transition={{ duration: 0.5 }}
      />
      {/* Esencia del tamaño: un corazón de color que se mezcla con la intención */}
      <motion.ellipse
        cx={CX}
        cy={SURFACE_Y}
        rx="58"
        ry="13"
        fill={`url(#${essenceId})`}
        initial={false}
        animate={{ opacity: liquid.swirl ? 0.6 : 0 }}
        transition={{ duration: 0.5 }}
      />
      <g transform={`translate(${CX} ${SURFACE_Y}) scale(1 0.24)`}>
        <g>
          {!reduce && (
            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="9s" repeatCount="indefinite" />
          )}
          <motion.path
            d={spiral}
            fill="none"
            stroke={liquid.swirl ?? 'transparent'}
            strokeWidth="26"
            strokeLinecap="round"
            initial={false}
            animate={{ opacity: liquid.swirl ? 0.9 : 0 }}
            transition={{ duration: 0.5 }}
          />
        </g>
      </g>
      {flecks.map((f) => (
        <motion.path
          key={f.id}
          d="M0 -4 L1 -1 L4 0 L1 1 L0 4 L-1 1 L-4 0 L-1 -1 Z"
          transform={`translate(${f.x.toFixed(1)} ${f.y.toFixed(1)}) scale(${f.s})`}
          fill={f.color}
          stroke="#fff"
          strokeWidth="0.4"
          initial={{ opacity: 0 }}
          animate={reduce ? { opacity: 1 } : { opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 1.3, repeat: reduce ? 0 : Infinity, delay: f.delay }}
        />
      ))}
      <ellipse cx={CX - 10} cy={SURFACE_Y - 5} rx="80" ry="14" fill={`url(#${sheenId})`} />
    </g>
  )
}

function Bubbles({ active, activity, color }) {
  const reduce = useReducedMotion()
  const bubbles = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        id: i,
        x: CX - 78 + ((i * 53) % 156),
        y: SURFACE_Y - 8 + ((i * 7) % 17),
        r: 3 + (i % 3) * 1.6,
        delay: (i * 0.23) % 1.2,
      })),
    [],
  )
  if (!active || reduce) return null
  const speed = activity === 'boil' ? 0.55 : activity === 'simmer' ? 1 : 1.6
  const visible = activity === 'idle' ? bubbles.slice(0, 4) : bubbles
  return (
    <g aria-hidden="true">
      {visible.map((b) => (
        <motion.circle
          key={b.id}
          cx={b.x}
          cy={b.y}
          r={b.r}
          fill={color}
          fillOpacity="0.35"
          stroke="#fff"
          strokeOpacity="0.6"
          strokeWidth="0.8"
          animate={{ y: [0, -14], scale: [0.3, 1.1, 1.3], opacity: [0, 1, 0] }}
          transition={{ duration: speed, repeat: Infinity, delay: b.delay * speed, ease: 'easeOut' }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />
      ))}
    </g>
  )
}

function Smoke({ blurId, color, activity }) {
  const reduce = useReducedMotion()
  if (reduce) return null
  const strength = activity === 'boil' ? 0.6 : activity === 'simmer' ? 0.4 : 0.22
  const wisps = [
    { x: 160, delay: 0, dur: 3.2 },
    { x: 205, delay: 1.1, dur: 3.6 },
    { x: 245, delay: 2.0, dur: 3 },
  ]
  return (
    <g filter={`url(#${blurId})`} aria-hidden="true">
      {wisps.map((w) => (
        <motion.path
          key={w.x}
          d={`M${w.x} 190 C${w.x - 14} 170 ${w.x + 14} 150 ${w.x} 130 C${w.x - 14} 110 ${w.x + 10} 92 ${w.x} 76`}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          animate={{ y: [10, -40], opacity: [0, strength, 0] }}
          transition={{ duration: w.dur, repeat: Infinity, delay: w.delay, ease: 'easeOut' }}
        />
      ))}
    </g>
  )
}

function Fire({ flameId, activity }) {
  const reduce = useReducedMotion()
  const flames = [
    { x: 168, s: 0.75, d: 0.9 },
    { x: 186, s: 1, d: 0.7 },
    { x: 200, s: 1.2, d: 0.8 },
    { x: 216, s: 0.95, d: 0.65 },
    { x: 232, s: 0.7, d: 0.85 },
  ]
  const boost = activity === 'boil' ? 1.25 : 1
  return (
    <g aria-hidden="true">
      <ellipse cx={CX} cy="368" rx="80" ry="14" fill="#ff8a1f" opacity="0.25" />
      {flames.map((f) => (
        <motion.path
          key={f.x}
          d={`M${f.x} 368 C${f.x - 14} 356 ${f.x - 10} 334 ${f.x} ${368 - 48 * f.s * boost} C${f.x + 10} 334 ${f.x + 14} 356 ${f.x} 368 Z`}
          fill={`url(#${flameId})`}
          animate={reduce ? undefined : { scaleY: [1, 1.18, 0.9, 1], scaleX: [1, 0.92, 1.05, 1] }}
          transition={{ duration: f.d, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}
        />
      ))}
      <g stroke="#2a1a10" strokeWidth="2">
        <rect x="140" y="364" width="120" height="13" rx="6" fill="#5a3a22" transform="rotate(-6 200 370)" />
        <rect x="140" y="364" width="120" height="13" rx="6" fill="#4a2f1b" transform="rotate(7 200 370)" />
      </g>
    </g>
  )
}

/** Cucharón de madera. Su cazo está en (0,0); el mango sube hacia la derecha. */
function Ladle({ mode, stirKey, scoop }) {
  const reduce = useReducedMotion()
  const baseX = 208
  const baseY = 214

  let animate = { x: 0, y: 0, rotate: 0 }
  let transition = { duration: 0.4 }
  if (mode === 'stir' && stirKey > 0 && !reduce) {
    animate = { x: [0, -36, 0, 36, 0], y: 0, rotate: [0, -8, 0, 8, 0] }
    transition = { duration: 0.6, ease: 'easeInOut' }
  } else if (mode === 'dip') {
    animate = { x: -12, y: 26, rotate: 4 }
    transition = { duration: reduce ? 0 : 0.6, ease: 'easeInOut' }
  } else if (mode === 'lift') {
    animate = { x: -10, y: -86, rotate: -8, scale: 1.3 }
    transition = { duration: reduce ? 0 : 0.9, ease: [0.2, 0.8, 0.2, 1] }
  }

  return (
    <g>
      {/* Sin transformaciones en los ancestros: el origen (el cazo) queda en coordenadas del lienzo. */}
      <motion.g
        key={mode === 'stir' ? `stir-${stirKey}` : 'ladle'}
        initial={false}
        animate={animate}
        transition={transition}
        style={{ transformBox: 'view-box', transformOrigin: `${baseX}px ${baseY}px` }}
      >
        <g transform={`translate(${baseX} ${baseY})`}>
        {/* Mango */}
        <path d="M8 -6 L56 -128" stroke="#3b2414" strokeWidth="9" strokeLinecap="round" />
        <path d="M8 -6 L56 -128" stroke="#7a5432" strokeWidth="6" strokeLinecap="round" />
        <path d="M14 -20 L50 -112" stroke="#a37a4c" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
        <circle cx="56" cy="-128" r="4" fill="#c9a24a" />
        {/* Cazo */}
        {scoop && <ScoopMound colors={scoop} />}
        <path d="M-24 -2 A24 14 0 0 0 24 -2 Z" fill="#5a3a22" stroke="#2a1a10" strokeWidth="1.5" />
        <path d="M-18 4 Q0 10 18 4" fill="none" stroke="#8a6440" strokeWidth="1.2" opacity="0.7" />
        <ellipse cx="0" cy="-2" rx="24" ry="5" fill="none" stroke="#2a1a10" strokeWidth="1.5" />
        </g>
      </motion.g>
      {mode === 'stir' && stirKey > 0 && !reduce && (
        <motion.ellipse
          key={`ripple-${stirKey}`}
          cx={baseX}
          cy={SURFACE_Y}
          rx="16"
          ry="3.5"
          fill="none"
          stroke="#fff"
          strokeOpacity="0.5"
          strokeWidth="1.2"
          initial={{ x: 0, opacity: 0 }}
          animate={{ x: [0, -36, 0, 36, 0], opacity: [0, 0.8, 0.8, 0.8, 0] }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
      )}
    </g>
  )
}

/** Montoncito de cristales, hierbas y destellos que sale en el cucharón. */
function ScoopMound({ colors }) {
  const [c1, c2, ...rest] = colors
  const c3 = rest[0] ?? c2
  return (
    <g>
      <circle cx="0" cy="-14" r="30" fill={c1} opacity="0.25" />
      <g stroke="rgba(255,255,255,0.55)" strokeWidth="0.8" strokeLinejoin="round">
        <path d="M-20 -2 L-14 -16 L-6 -2 Z" fill={c1} />
        <path d="M-8 -2 L-2 -26 L6 -4 Z" fill={c2} />
        <path d="M2 -2 L10 -20 L18 -2 Z" fill={c1} />
        <path d="M-14 -4 L-10 -12 L-4 -4 Z" fill={c3} />
        <path d="M8 -6 L13 -13 L16 -5 Z" fill={c3} />
        <path d="M-4 -8 L1 -16 L4 -7 Z" fill="#f4ecd8" opacity="0.9" />
      </g>
      <g fill="#7b9a63">
        <ellipse cx="-16" cy="-5" rx="4" ry="1.6" transform="rotate(-20 -16 -5)" />
        <ellipse cx="17" cy="-6" rx="4" ry="1.6" transform="rotate(25 17 -6)" />
      </g>
      {rest.map((color, i) => (
        <path
          key={color + i}
          d="M0 -4 L1 -1 L4 0 L1 1 L0 4 L-1 1 L-4 0 L-1 -1 Z"
          fill={color}
          transform={`translate(${-12 + i * 12} ${-28 - (i % 2) * 6}) scale(1.4)`}
        />
      ))}
    </g>
  )
}
