import { motion, useReducedMotion } from 'motion/react'
import { BRAND } from '../config/brand.js'
import { BrandSigil, ChapterDivider, CornerFlourish } from './illustrations/Ornaments.jsx'

/**
 * Grimorio cerrado (portada de cuero con detalles dorados).
 * - `open`: la tapa gira y deja ver la primera página.
 * - `startOpen`: empieza abierto y se cierra (pantalla de pedido completado).
 * Es decorativo: los botones reales están fuera, junto al libro.
 */
export function BookCover({ open = false, startOpen = false, onClick, className = '', children }) {
  const reduce = useReducedMotion()
  return (
    <div
      className={`closed-book${open ? ' is-open' : ''} ${className}`}
      onClick={onClick}
      aria-hidden="true"
    >
      <div className="closed-book__shadow" />
      <div className="closed-book__pages">
        <div className="closed-book__first-page">
          <p className="closed-book__page-kicker">Capítulo I</p>
          <p className="closed-book__page-title">¿Qué quieres atraer?</p>
          <ChapterDivider />
        </div>
      </div>
      <motion.div
        className="closed-book__cover"
        initial={startOpen ? { rotateY: -160 } : false}
        animate={{ rotateY: open ? -160 : 0 }}
        transition={{ duration: reduce ? 0 : 0.9, ease: [0.55, 0.05, 0.3, 1] }}
      >
        <div className="closed-book__front">
          <CornerFlourish className="closed-book__corner closed-book__corner--tl" />
          <CornerFlourish className="closed-book__corner closed-book__corner--tr" />
          <CornerFlourish className="closed-book__corner closed-book__corner--bl" />
          <CornerFlourish className="closed-book__corner closed-book__corner--br" />
          <div className="closed-book__emblem">
            <p className="closed-book__brand">{BRAND.name}</p>
            <BrandSigil className="closed-book__sigil" />
            <p className="closed-book__title">{BRAND.grimoireTitle}</p>
            <ChapterDivider className="closed-book__divider" />
          </div>
          <span className="closed-book__clasp" />
        </div>
        <div className="closed-book__inside" />
      </motion.div>
      {children}
    </div>
  )
}
