import { useId } from 'react'
import { motion, useReducedMotion } from 'motion/react'

/**
 * La Scoop invocada sobre la cuchara (Capítulo VI).
 *
 * Una cucharada de cristales —como la cuchara del logo— que nace de la luz:
 * se abre un orbe, un anillo de halo se expande, los cristales crecen uno a
 * uno desde el cazo, aparecen hojas y destellos, y unas motas de color giran
 * alrededor. Los colores vienen de scoopColors(ritual): intención, tamaño y extras.
 *
 *   x, y    centro del cazo de la cuchara (coordenadas del lienzo 400×400)
 *   colors  colores de la receta
 *   glow    color de la luz principal
 */
const CRYSTALS = [
  { dx: -15, w: 9, h: 24, tilt: -24 },
  { dx: -5, w: 11, h: 36, tilt: -8 },
  { dx: 6, w: 10, h: 30, tilt: 10 },
  { dx: 15, w: 8, h: 20, tilt: 26 },
  { dx: 0, w: 7, h: 16, tilt: 2 },
]

function crystalPoints(w, h) {
  const half = w / 2
  return {
    body: `M${-half} 0 L${-half} ${-h * 0.72} L0 ${-h} L${half} ${-h * 0.72} L${half} 0 Z`,
    facet: `M0 0 L0 ${-h} L${half} ${-h * 0.72} L${half} 0 Z`,
  }
}

export function ScoopReveal({ x, y, colors = [], glow = '#fff4d6' }) {
  const reduce = useReducedMotion()
  const uid = useId().replace(/:/g, '')
  const palette = colors.length ? colors : [glow]
  const baseY = y - 3
  const anim = (props, transition) => (reduce ? { initial: false, animate: props.animate } : { ...props, transition })

  return (
    <g className="scoop-reveal" aria-hidden="true">
      <defs>
        <radialGradient id={`orb-${uid}`}>
          <stop offset="0" stopColor="#fffaf0" stopOpacity="0.95" />
          <stop offset="0.3" stopColor={glow} stopOpacity="0.6" />
          <stop offset="1" stopColor={glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`beam-${uid}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={glow} stopOpacity="0.7" />
          <stop offset="1" stopColor={glow} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Columna de luz que sube desde la cucharada */}
      <motion.rect
        x={x - 16}
        y={y - 130}
        width="32"
        height="128"
        rx="16"
        fill={`url(#beam-${uid})`}
        style={{ transformBox: 'fill-box', transformOrigin: '50% 100%', mixBlendMode: 'screen' }}
        {...anim({ initial: { scaleY: 0, opacity: 0 }, animate: { scaleY: 1, opacity: reduce ? 0.25 : [0, 0.8, 0.25] } }, { duration: 0.9, ease: 'easeOut' })}
      />

      {/* Orbe de luz: queda respirando detrás de la Scoop */}
      <motion.circle
        className="scoop-reveal__orb"
        cx={x}
        cy={y - 18}
        r="54"
        fill={`url(#orb-${uid})`}
        style={{ transformBox: 'fill-box', transformOrigin: 'center', mixBlendMode: 'screen' }}
        {...anim({ initial: { scale: 0, opacity: 0 }, animate: { scale: 1, opacity: 0.85 } }, { duration: 0.6, ease: [0.2, 0.8, 0.3, 1] })}
      />

      {/* Halo que se expande una vez */}
      {!reduce &&
        [0, 0.22].map((lag) => (
          <motion.circle
            key={lag}
            cx={x}
            cy={y - 18}
            r="40"
            fill="none"
            stroke={lag ? '#fff4d6' : glow}
            strokeWidth={lag ? 1 : 2}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: [0.3, 1.9], opacity: [0.9, 0] }}
            transition={{ duration: 1.1, delay: 0.15 + lag, ease: 'easeOut' }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          />
        ))}

      {/* Cristales que crecen uno a uno desde el cazo */}
      {CRYSTALS.map((c, i) => {
        const { body, facet } = crystalPoints(c.w, c.h)
        const color = palette[i % palette.length]
        return (
          <g key={i} transform={`translate(${x + c.dx} ${baseY}) rotate(${c.tilt})`}>
            <motion.g
              style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}
              {...anim(
                { initial: { scaleY: 0, scaleX: 0.6, opacity: 0 }, animate: { scaleY: 1, scaleX: 1, opacity: 1 } },
                { duration: 0.45, delay: 0.25 + i * 0.09, ease: [0.3, 1.4, 0.5, 1] },
              )}
            >
              <path d={body} fill={color} stroke="rgba(255,255,255,0.7)" strokeWidth="0.8" strokeLinejoin="round" />
              <path d={facet} fill="#fff" opacity="0.28" />
              <path d={`M0 0 L0 ${-c.h}`} stroke="#fff" strokeWidth="0.5" opacity="0.6" />
            </motion.g>
          </g>
        )
      })}

      {/* Hojas de hierbas a los lados */}
      <motion.g
        fill="#8fb36f"
        {...anim({ initial: { opacity: 0 }, animate: { opacity: 1 } }, { duration: 0.4, delay: 0.6 })}
      >
        <ellipse cx={x - 22} cy={baseY - 2} rx="6" ry="2.2" transform={`rotate(-24 ${x - 22} ${baseY - 2})`} />
        <ellipse cx={x + 23} cy={baseY - 3} rx="6" ry="2.2" transform={`rotate(28 ${x + 23} ${baseY - 3})`} />
      </motion.g>

      {/* Destellos que titilan sobre la Scoop */}
      {[
        [x - 26, y - 44, 1.2],
        [x + 24, y - 52, 1],
        [x + 2, y - 62, 1.4],
      ].map(([sx, sy, s], i) => (
        <motion.path
          key={i}
          className="scoop-reveal__star"
          d="M0 -5 L1.2 -1.2 L5 0 L1.2 1.2 L0 5 L-1.2 1.2 L-5 0 L-1.2 -1.2 Z"
          transform={`translate(${sx} ${sy}) scale(${s})`}
          fill="#fff4d6"
          style={{ animationDelay: `${-i * 0.5}s` }}
          {...anim({ initial: { opacity: 0 }, animate: { opacity: 1 } }, { duration: 0.3, delay: 0.7 + i * 0.12 })}
        />
      ))}

      {/* Motas de la receta que giran alrededor (una por ingrediente) */}
      <g>
        {!reduce && (
          <animateTransform attributeName="transform" type="rotate" from={`0 ${x} ${y - 18}`} to={`360 ${x} ${y - 18}`} dur="7s" repeatCount="indefinite" />
        )}
        {palette.slice(0, 6).map((color, i) => {
          const a = (i / Math.min(palette.length, 6)) * Math.PI * 2
          return (
            <motion.circle
              key={i}
              cx={x + Math.cos(a) * 46}
              cy={y - 18 + Math.sin(a) * 18}
              r="2.6"
              fill={color}
              stroke="#fff"
              strokeWidth="0.6"
              {...anim({ initial: { opacity: 0 }, animate: { opacity: 0.95 } }, { duration: 0.4, delay: 0.5 + i * 0.08 })}
            />
          )
        })}
      </g>
    </g>
  )
}
