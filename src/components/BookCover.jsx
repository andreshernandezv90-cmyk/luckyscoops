import { motion, useReducedMotion } from 'motion/react'
import { BRAND } from '../config/brand.js'
import { BOOK_CLOSE, BOOK_OPEN } from '../lib/motion.js'
import { ChapterDivider, CornerFlourish } from './illustrations/Ornaments.jsx'
import { BrandMark } from './BrandMark.jsx'

/**
 * Grimorio cerrado (portada de cuero con el logo estampado en oro).
 * - `open`: la tapa se abre como una tapa pesada (ver BOOK_OPEN).
 * - `startOpen`: empieza abierto y se cierra (pantalla de pedido completado).
 * Es decorativo: los botones reales están fuera, junto al libro.
 *
 * Capas: sombra sobre la mesa · bloque de páginas (con la sombra que proyecta
 * la tapa) · dos hojas sueltas que se mueven con el aire · tapa (frente e interior).
 */
export function BookCover({ open = false, startOpen = false, onClick, className = '', children }) {
  const reduce = useReducedMotion()
  const plan = startOpen ? BOOK_CLOSE : BOOK_OPEN
  const playing = startOpen || open
  // Cada capa recibe sus fotogramas desde BOOK_OPEN / BOOK_CLOSE (mismos tiempos para todas).
  const layer = (map) => {
    const first = {}
    const target = {}
    for (const [prop, key] of Object.entries(map)) {
      first[prop] = plan[key][0]
      target[prop] = !playing ? plan[key][0] : reduce ? plan[key].at(-1) : plan[key]
    }
    return {
      initial: reduce ? false : first,
      animate: target,
      transition:
        playing && !reduce
          ? { duration: plan.duration, delay: plan.delay, times: plan.times, ease: plan.ease }
          : { duration: 0 },
    }
  }

  return (
    <div className={`closed-book${open ? ' is-open' : ''} ${className}`} onClick={onClick} aria-hidden="true">
      <span className="closed-book__aura" />
      <motion.div
        className="closed-book__body"
        {...layer({ y: 'bookY', x: 'bookX', scale: 'bookScale' })}
      >
        <motion.div
          className="closed-book__shadow"
          {...layer({ scaleX: 'shadow', x: 'shadowX' })}
        />
        <div className="closed-book__pages">
          <div className="closed-book__first-page">
            <p className="closed-book__page-kicker">Capítulo I</p>
            <p className="closed-book__page-title">¿Qué deseas atraer?</p>
            <ChapterDivider />
          </div>
          <motion.div
            className="closed-book__page-shade"
            {...layer({ opacity: 'pageShade' })}
          />
        </div>
        {!reduce && (
          <>
            <motion.div className="closed-book__leaf" {...layer({ rotateY: 'leafA' })} />
            <motion.div className="closed-book__leaf closed-book__leaf--late" {...layer({ rotateY: 'leafB' })} />
          </>
        )}
        <motion.div
          className="closed-book__cover"
          {...layer({ rotateY: 'cover' })}
        >
          <div className="closed-book__front">
            <CornerFlourish className="closed-book__corner closed-book__corner--tl" />
            <CornerFlourish className="closed-book__corner closed-book__corner--tr" />
            <CornerFlourish className="closed-book__corner closed-book__corner--bl" />
            <CornerFlourish className="closed-book__corner closed-book__corner--br" />
            <div className="closed-book__emblem">
              {BRAND.logo ? (
                <span className="emboss closed-book__logo">
                  <BrandMark variant="full" className="emboss__shadow" />
                  <BrandMark variant="full" className="emboss__light" />
                  <BrandMark variant="full" className="emboss__gold" />
                </span>
              ) : (
                <BrandMark className="closed-book__sigil" />
              )}
              <p className="closed-book__title">{BRAND.grimoireTitle}</p>
              <ChapterDivider className="closed-book__divider" />
              <p className="closed-book__brand">{BRAND.motto}</p>
            </div>
            <span className="closed-book__clasp" />
            {/* Luz que recorre el cuero y los bordes dorados al levantar la tapa */}
            <motion.span
              className="closed-book__glint"
              {...layer({ x: 'glint' })}
            />
            <motion.span
              className="closed-book__face-shade"
              {...layer({ opacity: 'frontShade' })}
            />
          </div>
          <div className="closed-book__inside">
            <motion.span
              className="closed-book__face-shade"
              {...layer({ opacity: 'insideShade' })}
            />
          </div>
        </motion.div>
      </motion.div>
      {children}
    </div>
  )
}
