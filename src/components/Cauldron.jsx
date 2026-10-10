import { useEffect, useId, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { BRAND } from '../config/brand.js'
import { STIR_SECONDS, stirKeyframes } from '../lib/motion.js'

/**
 * Caldero dibujado en capas SVG (debe ir dentro de un <svg viewBox="0 0 400 400">):
 *   resplandor · fuego · interior · líquido · burbujas · cuchara · cuerpo · borde · humo
 *
 * El aspecto se controla solo con props, así el ritual y la revelación
 * únicamente cambian estados:
 *   liquid    { base, glow, swirl, flecks[] }  colores del contenido
 *   activity  'idle' | 'simmer' | 'boil'       intensidad de fuego, burbujas y humo
 *   stirKey   número que, al cambiar, hace revolver la cuchara
 *   spoon     'stir' | 'rest' | 'dip' | 'lift' | 'none'
 *   spoonful  color de la cucharada brillante (revelación)
 *   innerGlow 0–1, luz que nace desde dentro del líquido (revelación)
 *   drips     gotas que caen de la cuchara de vuelta al caldero
 *
 * Los ciclos continuos (fuego, humo, burbujas, destellos) son animaciones CSS
 * (ver motion.css): no generan trabajo en React y se detienen con
 * prefers-reduced-motion.
 */

const CX = 200
export const SURFACE_Y = 204
/** Donde cae el chorro: desde aquí entra cada color nuevo. */
export const IMPACT = { x: 200, y: 206 }
const EMPTY_LIQUID = '#1d1613'

/** Mezcla dos colores hex (t = 0 → a, t = 1 → b). */
export function mixColor(a, b, t) {
  const pa = parseInt(a.slice(1), 16)
  const pb = parseInt(b.slice(1), 16)
  const ch = (p, s) => (p >> s) & 255
  const m = (s) => Math.round(ch(pa, s) + (ch(pb, s) - ch(pa, s)) * t)
  return `#${((1 << 24) | (m(16) << 16) | (m(8) << 8) | m(0)).toString(16).slice(1)}`
}

export function Cauldron({
  liquid = {},
  activity = 'idle',
  stirKey = 0,
  spoon = 'stir',
  spoonful = null,
  innerGlow = 0,
  drips = false,
}) {
  const uid = useId().replace(/:/g, '')
  const ids = {
    body: `c-body-${uid}`,
    rim: `c-rim-${uid}`,
    glow: `c-glow-${uid}`,
    liquidClip: `c-liquid-${uid}`,
    spoonClip: `c-spoon-${uid}`,
    sheen: `c-sheen-${uid}`,
    flame: `c-flame-${uid}`,
    core: `c-core-${uid}`,
    inner: `c-inner-${uid}`,
    mark: `c-mark-${uid}`,
  }
  const glow = liquid.glow ?? '#ffb347'

  return (
    <g className={`cauldron cauldron--${activity}`}>
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
        <radialGradient id={ids.inner}>
          <stop offset="0" stopColor="#fff8e0" stopOpacity="0.8" />
          <stop offset="0.3" stopColor={glow} stopOpacity="0.45" />
          <stop offset="1" stopColor={glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={ids.flame} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#d9480f" />
          <stop offset="0.45" stopColor="#ff9f1c" />
          <stop offset="1" stopColor="#ffe8a3" />
        </linearGradient>
        <linearGradient id={ids.core} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ffb347" />
          <stop offset="1" stopColor="#fff6d6" />
        </linearGradient>
        <clipPath id={ids.liquidClip}>
          <ellipse cx={CX} cy={SURFACE_Y} rx="99" ry="24" />
        </clipPath>
        <clipPath id={ids.spoonClip}>
          <rect x="0" y="-200" width="400" height={SURFACE_Y + 200} />
        </clipPath>
        {BRAND.logoMark && (
          <mask id={ids.mark} maskUnits="userSpaceOnUse" x="160" y="238" width="80" height="80" style={{ maskType: 'alpha' }}>
            <image href={BRAND.logoMark} x="168" y="244" width="64" height="64" />
          </mask>
        )}
      </defs>

      <motion.circle
        cx={CX}
        cy="220"
        r="170"
        fill={`url(#${ids.glow})`}
        initial={false}
        animate={{ opacity: liquid.base ? (activity === 'boil' ? 0.95 : activity === 'idle' ? 0.5 : 0.7) : 0.35 }}
        transition={{ duration: 0.6 }}
      />

      <Fire flameId={ids.flame} coreId={ids.core} activity={activity} />

      {/* Interior oscuro y líquido */}
      <ellipse cx={CX} cy="200" rx="110" ry="32" fill="#0b0908" />
      <Liquid liquid={liquid} clipId={ids.liquidClip} sheenId={ids.sheen} stirKey={stirKey} />
      {/* Luz que nace desde dentro del líquido (revelación) */}
      <motion.ellipse
        cx={CX}
        cy={SURFACE_Y}
        rx="72"
        ry="17"
        fill={`url(#${ids.inner})`}
        initial={false}
        animate={{ opacity: innerGlow, scaleY: innerGlow > 0.6 ? 1.15 : 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ mixBlendMode: 'screen', transformBox: 'fill-box', transformOrigin: 'center' }}
      />
      <Bubbles active={Boolean(liquid.base)} activity={activity} color={liquid.glow ?? '#ffffff'} />

      {spoon !== 'none' && (
        <g clipPath={`url(#${ids.spoonClip})`}>
          <Ladle mode={spoon} stirKey={stirKey} spoonful={spoonful} />
        </g>
      )}
      {drips && <Drips />}

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
      {/* Marca de la Bruja Sabia grabada en el hierro */}
      {BRAND.logoMark && (
        <g aria-hidden="true">
          <rect x="160" y="238" width="80" height="80" fill="#000" fillOpacity="0.55" mask={`url(#${ids.mark})`} transform="translate(0 1)" />
          <motion.rect
            x="160"
            y="238"
            width="80"
            height="80"
            fill={glow}
            mask={`url(#${ids.mark})`}
            initial={false}
            animate={{ fillOpacity: liquid.base ? 0.32 : 0.16 }}
            transition={{ duration: 0.6 }}
          />
        </g>
      )}
      <motion.path
        d="M92 214 C92 270 130 318 200 320 C270 318 308 270 308 214"
        fill="none"
        stroke={glow}
        strokeWidth="2"
        initial={false}
        animate={{ strokeOpacity: liquid.base ? 0.35 : 0.1 }}
        transition={{ duration: 0.5 }}
      />
      <g fill="none" stroke="#2c2624" strokeWidth="6">
        <path d="M92 214 Q72 214 74 232 Q76 248 96 244" />
        <path d="M308 214 Q328 214 326 232 Q324 248 304 244" />
      </g>
      <ellipse cx={CX} cy="200" rx="110" ry="32" fill="none" stroke={`url(#${ids.rim})`} strokeWidth="10" />
      <path d="M98 192 Q200 158 302 192" fill="none" stroke="#8a7f76" strokeWidth="1.5" strokeOpacity="0.5" />

      <Smoke uid={uid} color={liquid.base ? mixColor(glow, '#c9bfb2', 0.45) : '#bdb3a6'} activity={activity} />
    </g>
  )
}

/** Espiral de dos brazos para el remolino de la esencia (en coordenadas circulares). */
function spiralPath(turns = 1.6, radius = 92, offset = 0) {
  const arm = (start) => {
    const pts = []
    for (let i = 0; i <= 48; i++) {
      const t = i / 48
      const a = start + t * turns * Math.PI * 2
      const r = 8 + t * (radius - 8)
      pts.push(`${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`)
    }
    return `M${pts.join(' L')}`
  }
  return `${arm(offset)} ${arm(offset + Math.PI)}`
}

/**
 * Líquido. Cada color nuevo entra desde el punto de impacto y se extiende
 * (no cambia de golpe); deja vetas que giran con el remolino y desaparecen.
 */
function Liquid({ liquid, clipId, sheenId, stirKey }) {
  const reduce = useReducedMotion()
  const uid = useId().replace(/:/g, '')
  const essenceId = `c-essence-${uid}`
  const spiral = useMemo(() => spiralPath(), [])
  const streakPath = useMemo(() => spiralPath(1.1, 88, 0.8), [])
  const base = liquid.base ?? EMPTY_LIQUID

  // Capas de color: la última se expande desde el impacto sobre las anteriores.
  const [layers, setLayers] = useState(() => [{ id: 0, color: base }])
  // Vetas: cada ingrediente nuevo deja un trazo de su color en el remolino.
  const colorsIn = [liquid.base, liquid.swirl, ...(liquid.flecks ?? [])].filter(Boolean)
  const colorsKey = colorsIn.join('|')
  const [streaks, setStreaks] = useState([])

  useEffect(() => {
    setLayers((ls) => (ls.at(-1).color === base ? ls : [...ls.slice(-1), { id: ls.at(-1).id + 1, color: base }]))
  }, [base])
  useEffect(() => {
    const newest = colorsIn.at(-1)
    if (!newest) return
    setStreaks((ss) => [...ss.slice(-1), { id: (ss.at(-1)?.id ?? 0) + 1, color: newest }])
    // Solo cuando entra un color nuevo.
  }, [colorsKey])

  // Destellos de los extras: partículas permanentes y sutiles en la superficie.
  const flecks = useMemo(() => {
    const colors = liquid.flecks ?? []
    return colors.flatMap((color, c) =>
      Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2 + c * 1.3
        const r = 22 + ((i * 41 + c * 29) % 62)
        return {
          id: `${c}-${i}`,
          color,
          x: CX + Math.cos(a) * r,
          y: SURFACE_Y + Math.sin(a) * r * 0.23,
          s: 0.8 + ((i + c) % 3) * 0.25,
          delay: -((i * 0.37 + c * 0.29) % 1.6),
          dur: 1.4 + ((i + c * 2) % 4) * 0.3,
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
        {layers.map((layer) => (
          <radialGradient key={layer.id} id={`${uid}-layer-${layer.id}`}>
            <stop offset="0" stopColor={layer.color} />
            <stop offset="0.72" stopColor={layer.color} />
            <stop offset="1" stopColor={layer.color} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>
      {layers.map((layer, i) =>
        i === 0 ? (
          <ellipse key={layer.id} cx={CX} cy={SURFACE_Y} rx="100" ry="25" fill={layer.color} />
        ) : (
          <motion.ellipse
            key={layer.id}
            cx={IMPACT.x}
            cy={IMPACT.y}
            rx="150"
            ry="40"
            fill={`url(#${uid}-layer-${layer.id})`}
            initial={reduce ? false : { scale: 0.04, opacity: 0.9 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.1, delay: 0.08, ease: [0.2, 0.7, 0.3, 1] }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          />
        ),
      )}
      {/* Esencia del tamaño: un corazón de color que se mezcla con la intención */}
      <motion.ellipse
        cx={CX}
        cy={SURFACE_Y}
        rx="58"
        ry="13"
        fill={`url(#${essenceId})`}
        initial={false}
        animate={{ opacity: liquid.swirl ? 0.6 : 0, scale: liquid.swirl ? 1 : 0.2 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
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
            transition={{ duration: 0.8 }}
          />
          {!reduce &&
            streaks.map((s) => (
              <motion.path
                key={s.id}
                d={streakPath}
                fill="none"
                stroke={s.color}
                strokeWidth="10"
                strokeLinecap="round"
                initial={{ opacity: 0, rotate: -40 }}
                animate={{ opacity: [0, 0.85, 0], rotate: 80 }}
                transition={{ duration: 1.8, ease: 'easeOut' }}
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              />
            ))}
        </g>
        {/* Estela de la cuchara: el líquido gira más rápido mientras se revuelve */}
        {stirKey > 0 && !reduce && (
          <motion.path
            key={`wake-${stirKey}`}
            d={streakPath}
            fill="none"
            stroke="#fff"
            strokeWidth="6"
            strokeLinecap="round"
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: [0, 0.32, 0.2, 0], rotate: 260 }}
            transition={{ duration: STIR_SECONDS, ease: [0.4, 0, 0.3, 1] }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          />
        )}
      </g>
      {flecks.map((f) => (
        <path
          key={f.id}
          className="liquid-fleck"
          d="M0 -4 L1 -1 L4 0 L1 1 L0 4 L-1 1 L-4 0 L-1 -1 Z"
          transform={`translate(${f.x.toFixed(1)} ${f.y.toFixed(1)}) scale(${f.s})`}
          fill={f.color}
          stroke="#fff"
          strokeWidth="0.4"
          style={{ animationDelay: `${f.delay}s`, animationDuration: `${f.dur}s` }}
        />
      ))}
      <ellipse cx={CX - 10} cy={SURFACE_Y - 5} rx="80" ry="14" fill={`url(#${sheenId})`} />
    </g>
  )
}

/**
 * Burbujas con tamaño, lugar, ritmo y velocidad distintos.
 * La intensidad decide cuántas están activas (reposo 3, a fuego lento 6, hirviendo todas).
 */
const BUBBLES = [
  { x: -62, y: -2, r: 3.2, d: 1.35, delay: 0 },
  { x: 28, y: 6, r: 4.6, d: 1.6, delay: -0.5 },
  { x: -10, y: -6, r: 2.6, d: 1.1, delay: -0.9 },
  { x: 58, y: -4, r: 3.8, d: 1.45, delay: -0.2 },
  { x: -34, y: 8, r: 5.2, d: 1.8, delay: -1.1 },
  { x: 12, y: -9, r: 2.2, d: 0.95, delay: -0.35 },
  { x: -80, y: 4, r: 2.8, d: 1.25, delay: -0.75 },
  { x: 76, y: 3, r: 2.4, d: 1.05, delay: -0.6 },
  { x: 40, y: -10, r: 3, d: 1.2, delay: -1.3 },
  { x: -48, y: -8, r: 2.4, d: 0.9, delay: -0.15 },
  { x: 0, y: 4, r: 4, d: 1.5, delay: -0.95 },
  { x: -22, y: 10, r: 3.4, d: 1.3, delay: -1.45 },
]
const ACTIVE_BUBBLES = { idle: 3, simmer: 6, boil: BUBBLES.length }

function Bubbles({ active, activity, color }) {
  const reduce = useReducedMotion()
  if (!active || reduce) return null
  const count = ACTIVE_BUBBLES[activity] ?? 6
  return (
    <g aria-hidden="true">
      {BUBBLES.map((b, i) => (
        <g key={i} className={`bubble${i < count ? '' : ' is-off'}`} transform={`translate(${CX + b.x} ${SURFACE_Y + b.y})`}>
          <circle
            className="bubble__ball"
            r={b.r}
            fill={color}
            fillOpacity="0.35"
            stroke="#fff"
            strokeOpacity="0.6"
            strokeWidth="0.8"
            style={{ animationDuration: `${b.d}s`, animationDelay: `${b.delay}s` }}
          />
        </g>
      ))}
    </g>
  )
}

/**
 * Humo en dos capas de bocanadas con degradado suave (sin filtros de desenfoque):
 * lejano (grande, difuso y lento) y cercano (más definido).
 */
const SMOKE = {
  far: [
    { x: 150, d: 5.2, delay: -1.2, s: 1.3 },
    { x: 214, d: 5.8, delay: -3.4, s: 1.5 },
    { x: 262, d: 4.9, delay: -0.4, s: 1.2 },
  ],
  near: [
    { x: 172, d: 3.3, delay: -0.8, s: 0.8 },
    { x: 204, d: 3.7, delay: -2.1, s: 0.95 },
    { x: 236, d: 3.1, delay: -1.5, s: 0.75 },
  ],
}
const SMOKE_STRENGTH = { idle: 0.35, simmer: 0.65, boil: 1 }

function Smoke({ uid, color, activity }) {
  const reduce = useReducedMotion()
  if (reduce) return null
  const strength = SMOKE_STRENGTH[activity] ?? 0.6
  return (
    <g aria-hidden="true" className="smoke" style={{ opacity: strength }}>
      <defs>
        <radialGradient id={`smoke-far-${uid}`}>
          <stop offset="0" stopColor={color} stopOpacity="0.28" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`smoke-near-${uid}`}>
          <stop offset="0" stopColor={color} stopOpacity="0.5" />
          <stop offset="0.55" stopColor={color} stopOpacity="0.18" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      {['far', 'near'].map((layer) =>
        SMOKE[layer].map((p) => (
          <ellipse
            key={`${layer}-${p.x}`}
            className={`smoke__puff smoke__puff--${layer}`}
            cx={p.x}
            cy="176"
            rx={layer === 'far' ? 44 * p.s : 26 * p.s}
            ry={layer === 'far' ? 30 * p.s : 20 * p.s}
            fill={`url(#smoke-${layer}-${uid})`}
            style={{ animationDuration: `${p.d}s`, animationDelay: `${p.delay}s` }}
          />
        )),
      )}
    </g>
  )
}

/** Fuego: llamas con duraciones y deformaciones distintas, así el conjunto nunca se repite igual. */
const FLAMES = [
  { x: 168, s: 0.75, d: 0.83, v: 'a', delay: -0.2 },
  { x: 186, s: 1, d: 1.07, v: 'b', delay: -0.5 },
  { x: 200, s: 1.2, d: 0.91, v: 'c', delay: 0 },
  { x: 216, s: 0.95, d: 0.71, v: 'a', delay: -0.35 },
  { x: 232, s: 0.7, d: 1.19, v: 'b', delay: -0.8 },
]
const CORES = [
  { x: 190, s: 0.55, d: 0.67, v: 'c', delay: -0.3 },
  { x: 203, s: 0.7, d: 0.79, v: 'a', delay: -0.1 },
  { x: 214, s: 0.5, d: 0.59, v: 'b', delay: -0.45 },
]
const flamePath = (x, h) => `M${x} 368 C${x - 14} 356 ${x - 10} 334 ${x} ${368 - h} C${x + 10} 334 ${x + 14} 356 ${x} 368 Z`

function Fire({ flameId, coreId, activity }) {
  return (
    <g aria-hidden="true" className={`fire fire--${activity}`}>
      <ellipse className="fire__glow" cx={CX} cy="368" rx="80" ry="14" fill="#ff8a1f" />
      <g className="fire__flames">
        {FLAMES.map((f) => (
          <path
            key={f.x}
            className={`flame flame--${f.v}`}
            d={flamePath(f.x, 48 * f.s)}
            fill={`url(#${flameId})`}
            style={{ animationDuration: `${f.d}s`, animationDelay: `${f.delay}s` }}
          />
        ))}
        {/* Núcleo más claro (la animación CSS va en el path; la escala, en el grupo) */}
        {CORES.map((f) => (
          <g key={`core-${f.x}`} transform={`translate(${f.x} 368) scale(0.6) translate(${-f.x} -368)`} opacity="0.9">
            <path
              className={`flame flame--${f.v}`}
              d={flamePath(f.x, 48 * f.s)}
              fill={`url(#${coreId})`}
              style={{ animationDuration: `${f.d}s`, animationDelay: `${f.delay}s` }}
            />
          </g>
        ))}
      </g>
      <g stroke="#2a1a10" strokeWidth="2">
        <rect x="140" y="364" width="120" height="13" rx="6" fill="#5a3a22" transform="rotate(-6 200 370)" />
        <rect x="140" y="364" width="120" height="13" rx="6" fill="#4a2f1b" transform="rotate(7 200 370)" />
      </g>
    </g>
  )
}

/** Gotas que caen de la cuchara al subir y vuelven al caldero. */
function Drips() {
  const reduce = useReducedMotion()
  if (reduce) return null
  const drops = [
    { x: 186, delay: 0.35, r: 2.4 },
    { x: 200, delay: 0.5, r: 1.8 },
    { x: 192, delay: 0.66, r: 2.1 },
  ]
  return (
    <g aria-hidden="true">
      {drops.map((d) => (
        <g key={d.x}>
          <motion.ellipse
            cx={d.x}
            rx={d.r}
            ry={d.r * 1.35}
            fill="#fff4d6"
            initial={{ cy: 150, opacity: 0 }}
            animate={{ cy: [150, 156, SURFACE_Y], opacity: [0, 1, 0.8] }}
            transition={{ duration: 0.42, delay: d.delay, times: [0, 0.25, 1], ease: 'easeIn' }}
          />
          <motion.ellipse
            cx={d.x}
            cy={SURFACE_Y}
            rx="6"
            ry="1.6"
            fill="none"
            stroke="#fff"
            strokeWidth="0.8"
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: [0.2, 2.2], opacity: [0.8, 0] }}
            transition={{ duration: 0.5, delay: d.delay + 0.42 }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          />
        </g>
      ))}
    </g>
  )
}

/**
 * Salpicadura al caer algo en el líquido: anillos concéntricos, corona de
 * gotas que sube y vuelve a caer y un destello breve.
 */
export function Splash({ color, delay = 0, x = IMPACT.x, y = IMPACT.y, size = 1 }) {
  const reduce = useReducedMotion()
  if (reduce) return null
  const crown = [-1, -0.6, -0.25, 0.25, 0.6, 1]
  return (
    <g aria-hidden="true">
      <motion.ellipse
        cx={x}
        cy={y}
        rx={14 * size}
        ry={4 * size}
        fill={color}
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: [0, 0.75, 0], scale: [0.4, 1.6, 2] }}
        transition={{ duration: 0.45, delay, ease: 'easeOut' }}
        style={{ transformBox: 'fill-box', transformOrigin: 'center', mixBlendMode: 'screen' }}
      />
      {[0, 0.16].map((lag) => (
        <motion.ellipse
          key={lag}
          cx={x}
          cy={y}
          rx={12 * size}
          ry={3 * size}
          fill="none"
          stroke={lag ? '#fff' : color}
          strokeWidth={lag ? 0.9 : 1.8}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: [0.3, 3.4 - lag * 3], opacity: [0.9, 0] }}
          transition={{ duration: 0.75, delay: delay + lag, ease: 'easeOut' }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />
      ))}
      {crown.map((c) => (
        <motion.circle
          key={c}
          cx={x}
          cy={y}
          r={1.6 * size}
          fill={color}
          initial={{ opacity: 0 }}
          animate={{
            x: [0, c * 16 * size, c * 22 * size],
            y: [0, -(14 + (1 - Math.abs(c)) * 10) * size, 2],
            opacity: [0, 1, 0],
          }}
          transition={{ duration: 0.5, delay: delay + 0.02, times: [0, 0.45, 1], ease: ['easeOut', 'easeIn'] }}
        />
      ))}
    </g>
  )
}

/** Cucharón de madera. Su cazo está en (0,0); el mango sube hacia la derecha. */
const LADLE_BASE = { x: 208, y: 214 }
const STIR = stirKeyframes()
/** Tramo de la vuelta en el que la cuchara está dentro del líquido (para la estela). */
const STIR_WAKE_OPACITY = STIR.times.map((t) => (t < 0.1 || t > 0.9 ? 0 : 0.75))

function Ladle({ mode, stirKey, spoonful }) {
  const reduce = useReducedMotion()
  const { x: baseX, y: baseY } = LADLE_BASE
  const stirring = mode === 'stir' && stirKey > 0 && !reduce

  let animate = { x: 0, y: 0, rotate: 0, scale: 1 }
  let transition = { duration: 0.5, ease: 'easeInOut' }
  if (stirring) {
    animate = { x: STIR.x, y: STIR.y, rotate: STIR.rotate, scale: 1 }
    transition = { duration: STIR_SECONDS, times: STIR.times, ease: 'linear' }
  } else if (mode === 'dip') {
    // Baja despacio, como si el líquido ofreciera resistencia.
    animate = { x: -12, y: 26, rotate: 4, scale: 1 }
    transition = { duration: reduce ? 0 : 0.7, ease: [0.5, 0, 0.3, 1] }
  } else if (mode === 'lift') {
    // Se tensa un instante por el peso, sube, se pasa un poco y se asienta.
    animate = { x: [-12, -12, -10, -10], y: [26, 21, -95, -86], rotate: [4, 6, -10, -8], scale: [1, 1, 1.33, 1.3] }
    transition = reduce ? { duration: 0 } : { duration: 0.85, times: [0, 0.18, 0.78, 1], ease: [[0.4, 0, 0.6, 1], [0.3, 0, 0.2, 1], [0.4, 0, 0.4, 1]] }
  }

  return (
    <g>
      {/* Sin transformaciones en los ancestros: el origen (el cazo) queda en coordenadas del lienzo. */}
      <motion.g
        key={stirring ? `stir-${stirKey}` : 'ladle'}
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
          {/* Cazo (y la cucharada brillante en la revelación) */}
          <path d="M-24 -2 A24 14 0 0 0 24 -2 Z" fill="#5a3a22" stroke="#2a1a10" strokeWidth="1.5" />
          <path d="M-18 4 Q0 10 18 4" fill="none" stroke="#8a6440" strokeWidth="1.2" opacity="0.7" />
          {spoonful && (
            <motion.g initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.25 }}>
              <ellipse cx="0" cy="-2" rx="22" ry="4.6" fill={spoonful} />
              <ellipse cx="-5" cy="-3.2" rx="9" ry="1.6" fill="#fff" opacity="0.55" />
              <ellipse cx="0" cy="-4" rx="30" ry="12" fill={spoonful} opacity="0.25" style={{ mixBlendMode: 'screen' }} />
            </motion.g>
          )}
          <ellipse cx="0" cy="-2" rx="24" ry="5" fill="none" stroke="#2a1a10" strokeWidth="1.5" />
        </g>
      </motion.g>
      {stirring && (
        <>
          {/* El líquido reacciona: una onda sigue a la cuchara */}
          <motion.ellipse
            key={`ripple-${stirKey}`}
            cx={baseX}
            cy={SURFACE_Y}
            rx="18"
            ry="4"
            fill="none"
            stroke="#fff"
            strokeOpacity="0.55"
            strokeWidth="1.2"
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{ x: STIR.x, y: STIR.y.map((v) => v * 0.25), opacity: STIR_WAKE_OPACITY }}
            transition={{ duration: STIR_SECONDS, times: STIR.times, ease: 'linear' }}
          />
          {/* Gotas al salir parcialmente */}
          {[-6, 5].map((dx, i) => (
            <motion.circle
              key={`drip-${stirKey}-${dx}`}
              cx={baseX + dx}
              r="1.7"
              fill="#fff4d6"
              initial={{ cy: SURFACE_Y - 8, opacity: 0 }}
              animate={{ cy: [SURFACE_Y - 8, SURFACE_Y - 6, SURFACE_Y + 1], opacity: [0, 0.9, 0] }}
              transition={{ duration: 0.3, delay: STIR_SECONDS * 0.9 + i * 0.08, ease: 'easeIn' }}
            />
          ))}
        </>
      )}
    </g>
  )
}
