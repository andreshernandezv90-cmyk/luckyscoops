import { useMemo } from 'react'
import { motion, useReducedMotion } from 'motion/react'

/**
 * Partículas breves con identidad propia por intención (nada de confeti):
 *   hearts    Amor: corazones pequeños y destellos rosas que flotan y se mecen
 *   runes     Protección: runas y escudos que giran en un anillo, azul y morado
 *   coins     Abundancia: brillos dorados y monedas que giran mientras suben
 *   smoke     Limpieza: bocanadas blancas y violetas con estrellas
 *   sparkles  destellos genéricos que se abren y titilan
 *
 * `ParticleBurst` es un <g> para usar dentro de un SVG; `BurstOverlay` es una
 * capa absoluta para tarjetas HTML. Cambia la `key` del componente para
 * repetir la explosión. Con movimiento reducido no se dibuja nada.
 */

const SHAPES = {
  heart: { d: 'M0 3.2 C-6.5 -1.8 -4.2 -7.4 0 -4.2 C4.2 -7.4 6.5 -1.8 0 3.2 Z' },
  spark: { d: 'M0 -5 L1.2 -1.2 L5 0 L1.2 1.2 L0 5 L-1.2 1.2 L-5 0 L-1.2 -1.2 Z' },
  glint: { d: 'M0 -7 L0.7 -0.7 L4 0 L0.7 0.7 L0 7 L-0.7 0.7 L-4 0 L-0.7 -0.7 Z' },
  rune: { d: 'M0 5 V-5 M0 0 L-4 -4.5 M0 0 L4 -4.5', stroke: true },
  runeB: { d: 'M-3 5 V-5 L3 -1 L-3 2', stroke: true },
  shield: { d: 'M0 -5 L4.2 -3.4 V0 C4.2 3 2.2 4.6 0 5.6 C-2.2 4.6 -4.2 3 -4.2 0 V-3.4 Z' },
  coin: { circle: 3.8 },
  smoke: { circle: 6, soft: true },
  dot: { circle: 1.6 },
}

/** Cómo se mueve y de qué colores es cada familia de partículas. */
const EFFECTS = {
  hearts: { shapes: ['heart', 'spark', 'heart', 'dot'], palette: ['#ff8fc4', '#ffd1e6', '#e0558f', '#fff4d6'], motion: 'float', duration: 1.5 },
  runes: { shapes: ['rune', 'shield', 'runeB', 'spark'], palette: ['#b3a6ff', '#7f6cf0', '#9fc6ff', '#efeaff'], motion: 'orbit', duration: 1.45 },
  coins: { shapes: ['coin', 'glint', 'spark', 'glint'], palette: ['#f8df7c', '#e8b934', '#fff4d6', '#d4a72c'], motion: 'rise', duration: 1.45 },
  smoke: { shapes: ['smoke', 'spark', 'smoke', 'dot'], palette: ['#ffffff', '#ddd2f6', '#b9a3ec', '#f4f0ff'], motion: 'puff', duration: 1.75 },
  sparkles: { shapes: ['spark', 'dot', 'glint'], palette: null, motion: 'burst', duration: 1.1 },
}

function Shape({ name, color }) {
  const shape = SHAPES[name]
  if (shape.circle) {
    return (
      <circle
        r={shape.circle}
        fill={color}
        opacity={shape.soft ? 0.45 : 1}
        stroke={name === 'coin' ? '#7a5a1c' : undefined}
        strokeWidth={name === 'coin' ? 0.8 : undefined}
      />
    )
  }
  if (shape.stroke) {
    return <path d={shape.d} fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  }
  return <path d={shape.d} fill={color} />
}

/** Valor aleatorio estable dentro de un rango. */
const rand = (min, max) => min + Math.random() * (max - min)

/** Fotogramas de una partícula según el tipo de movimiento. */
function particleKeyframes(kind, { i, count, cx, cy, spread, rise, scale, duration }) {
  const a = (i / count) * Math.PI * 2 + rand(-0.3, 0.3)
  const s = scale * rand(0.7, 1.25)
  const d = duration * rand(0.85, 1.15)
  const delay = rand(0, 0.18)
  switch (kind) {
    case 'float': {
      // Suben despacio meciéndose de lado a lado.
      const tx = Math.cos(a) * spread * rand(0.3, 0.7)
      const sway = rand(6, 12) * (i % 2 ? 1 : -1)
      const up = rise * rand(1, 1.8)
      return {
        x: [cx, cx + tx * 0.5 + sway, cx + tx - sway * 0.5, cx + tx + sway * 0.3],
        y: [cy, cy - up * 0.45, cy - up * 0.8, cy - up],
        scale: [0.2, s, s * 0.9, s * 0.6],
        rotate: [0, sway, -sway * 0.6, 0],
        opacity: [0, 1, 0.9, 0],
        d,
        delay,
      }
    }
    case 'orbit': {
      // Anillo protector que gira mientras se abre.
      const r0 = spread * 0.2
      const r1 = spread * rand(0.55, 0.8)
      const turn = 1.1
      const pt = (ang, r) => [cx + Math.cos(ang) * r, cy + Math.sin(ang) * r * 0.55 - rise * 0.25 * (r / r1)]
      const [x0, y0] = pt(a, r0)
      const [x1, y1] = pt(a + turn * 0.5, r1 * 0.85)
      const [x2, y2] = pt(a + turn, r1)
      return {
        x: [x0, x1, x2],
        y: [y0, y1, y2 - rise * 0.2],
        scale: [0.3, s, s * 0.7],
        rotate: [0, 0, 0],
        opacity: [0, 1, 0],
        d,
        delay,
      }
    }
    case 'rise': {
      // Brillos dorados que ascienden; las monedas giran sobre sí mismas.
      const tx = Math.cos(a) * spread * rand(0.25, 0.55)
      const up = rise * rand(1.6, 2.6)
      return {
        x: [cx + tx * 0.2, cx + tx * 0.7, cx + tx],
        y: [cy, cy - up * 0.6, cy - up],
        scale: [0.3, s, s * 0.7],
        rotate: [0, 0, 0],
        opacity: [0, 1, 0],
        d,
        delay,
      }
    }
    case 'puff': {
      // Bocanadas que se expanden y estrellas que se quedan flotando.
      const tx = Math.cos(a) * spread * rand(0.35, 0.75)
      const ty = Math.sin(a) * spread * 0.45 - rise * rand(0.6, 1.2)
      return {
        x: [cx, cx + tx * 0.6, cx + tx],
        y: [cy, cy + ty * 0.6, cy + ty],
        scale: [0.4, s * 1.4, s * 2],
        rotate: [0, 0, 0],
        opacity: [0, 0.9, 0],
        d,
        delay,
      }
    }
    default: {
      // Destellos que se abren y titilan al apagarse.
      const dist = spread * rand(0.45, 1)
      const tx = Math.cos(a) * dist
      const ty = Math.sin(a) * dist * 0.7 - rise * rand(0.5, 1.4)
      return {
        x: [cx, cx + tx * 0.75, cx + tx],
        y: [cy, cy + ty * 0.75, cy + ty],
        scale: [0.2, s, s * 0.4, s * 0.8, 0],
        rotate: [0, rand(-30, 30), rand(-45, 45)],
        opacity: [0, 1, 0.6, 1, 0],
        d,
        delay,
      }
    }
  }
}

export function ParticleBurst({
  effect = 'sparkles',
  colors = ['#fff'],
  cx = 0,
  cy = 0,
  count = 12,
  spread = 60,
  rise = 30,
  scale = 1,
  duration,
}) {
  const reduce = useReducedMotion()
  const particles = useMemo(() => {
    const config = EFFECTS[effect] ?? EFFECTS.sparkles
    // Los colores de la receta mandan; la paleta de la intención les da carácter.
    const palette = config.palette ? [...colors.slice(0, 2), ...config.palette] : colors
    return Array.from({ length: count }, (_, i) => {
      const shape = config.shapes[i % config.shapes.length]
      const motionKind = config.motion === 'rise' && shape !== 'coin' ? 'rise' : config.motion
      return {
        id: i,
        shape,
        color: palette[i % palette.length],
        coin: shape === 'coin',
        ...particleKeyframes(motionKind, { i, count, cx, cy, spread, rise, scale, duration: duration ?? config.duration }),
      }
    })
    // Los valores aleatorios se fijan al montar; para repetir, cambia la key.
  }, [])

  if (reduce) return null

  return (
    <g aria-hidden="true" className="particle-burst">
      {particles.map((p) => {
        const animate = { x: p.x, y: p.y, rotate: p.rotate, opacity: p.opacity }
        if (p.coin) {
          // La moneda gira sobre su eje: se estrecha y vuelve a abrirse.
          const [a, b, c] = p.scale
          animate.scaleY = p.scale
          animate.scaleX = [a, b * 0.15, b, c * 0.15, c]
        } else {
          animate.scale = p.scale
        }
        return (
          <motion.g
            key={p.id}
            initial={{ x: p.x[0], y: p.y[0], opacity: 0, scale: p.scale[0] }}
            animate={animate}
            transition={{ duration: p.d, delay: p.delay, ease: 'easeOut' }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          >
            <Shape name={p.shape} color={p.color} />
          </motion.g>
        )
      })}
    </g>
  )
}

/** Versión HTML: cubre su contenedor (que debe tener position: relative). */
export function BurstOverlay(props) {
  return (
    <svg className="burst-overlay" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <ParticleBurst cx={50} cy={50} spread={42} rise={18} scale={0.9} {...props} />
    </svg>
  )
}
