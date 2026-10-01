import { useMemo } from 'react'
import { motion, useReducedMotion } from 'motion/react'

/**
 * Explosión breve de partículas (corazones, runas, monedas, humo, destellos).
 * `ParticleBurst` es un <g> para usar dentro de un SVG; `BurstOverlay` es una
 * capa absoluta para tarjetas HTML. Cambia la `key` del componente para
 * repetir la explosión. Con movimiento reducido no se dibuja nada.
 */

const SHAPES = {
  heart: { d: 'M0 3.2 C-6.5 -1.8 -4.2 -7.4 0 -4.2 C4.2 -7.4 6.5 -1.8 0 3.2 Z' },
  spark: { d: 'M0 -5 L1.2 -1.2 L5 0 L1.2 1.2 L0 5 L-1.2 1.2 L-5 0 L-1.2 -1.2 Z' },
  rune: { d: 'M0 5 V-5 M0 0 L-4 -4.5 M0 0 L4 -4.5', stroke: true },
  shield: { d: 'M0 -5 L4.2 -3.4 V0 C4.2 3 2.2 4.6 0 5.6 C-2.2 4.6 -4.2 3 -4.2 0 V-3.4 Z' },
  coin: { circle: 3.8 },
  leaf: { d: 'M0 5 C-4 1 -3 -4 0 -5.5 C3 -4 4 1 0 5 Z' },
  smoke: { circle: 6, soft: true },
  dot: { circle: 1.6 },
}

const EFFECT_SHAPES = {
  hearts: ['heart', 'spark', 'heart', 'dot'],
  runes: ['rune', 'shield', 'spark', 'dot'],
  coins: ['coin', 'spark', 'leaf', 'spark'],
  smoke: ['smoke', 'spark', 'smoke', 'dot'],
  sparkles: ['spark', 'dot', 'spark'],
}

function Shape({ name, color }) {
  const shape = SHAPES[name]
  if (shape.circle) {
    return (
      <circle
        r={shape.circle}
        fill={color}
        opacity={shape.soft ? 0.5 : 1}
        stroke={name === 'coin' ? '#7a5a1c' : undefined}
        strokeWidth={name === 'coin' ? 0.8 : undefined}
      />
    )
  }
  if (shape.stroke) {
    return <path d={shape.d} fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
  }
  return <path d={shape.d} fill={color} />
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
  duration = 1.1,
}) {
  const reduce = useReducedMotion()
  const particles = useMemo(() => {
    const shapes = EFFECT_SHAPES[effect] ?? EFFECT_SHAPES.sparkles
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.6
      const distance = spread * (0.45 + Math.random() * 0.55)
      return {
        id: i,
        shape: shapes[i % shapes.length],
        color: colors[i % colors.length],
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance * 0.7 - rise * (0.5 + Math.random()),
        s: scale * (0.7 + Math.random() * 0.6),
        r: (Math.random() - 0.5) * 120,
        d: duration * (0.8 + Math.random() * 0.4),
        delay: Math.random() * 0.15,
      }
    })
    // Los valores aleatorios se fijan al montar; para repetir, cambia la key.
  }, [])

  if (reduce) return null

  return (
    <g aria-hidden="true" className="particle-burst">
      {particles.map((p) => (
        <motion.g
          key={p.id}
          initial={{ x: cx, y: cy, opacity: 0, scale: 0.3, rotate: 0 }}
          animate={{
            x: cx + p.tx,
            y: cy + p.ty,
            opacity: [0, 1, 0],
            scale: [0.3, p.s, p.s * 0.6],
            rotate: p.r,
          }}
          transition={{ duration: p.d, delay: p.delay, ease: 'easeOut' }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          <Shape name={p.shape} color={p.color} />
        </motion.g>
      ))}
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
