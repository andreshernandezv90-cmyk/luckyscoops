import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { WaxSeal } from './illustrations/Sigils.jsx'

/** Lacre del Grimorio: el mismo sello en todos los capítulos (DESIGN.md). */
export const LACRE = '#9e2350'

/**
 * Sello de lacre que confirma una elección: cae como un sello estampado
 * (golpe, pequeño rebote) y deja un anillo de tinta que se expande.
 * Dura ~0.4 s. Con movimiento reducido solo aparece.
 */
export function SelectionSeal({ show, className, color = LACRE, glyph = 'check', rotate = -10 }) {
  const reduce = useReducedMotion()
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          className={className}
          initial={reduce ? { opacity: 0 } : { scale: 1.7, opacity: 0, rotate: rotate - 24 }}
          animate={reduce ? { opacity: 1, rotate } : { scale: [1.7, 0.9, 1.04, 1], opacity: 1, rotate }}
          exit={{ scale: 0.6, opacity: 0, transition: { duration: 0.15 } }}
          transition={reduce ? { duration: 0.15 } : { duration: 0.42, times: [0, 0.55, 0.8, 1], ease: 'easeOut' }}
        >
          {!reduce && (
            <motion.span
              className="seal-ink"
              style={{ '--seal-ink': color }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 1.9], opacity: [0.6, 0] }}
              transition={{ duration: 0.45, delay: 0.2, ease: 'easeOut' }}
            />
          )}
          <WaxSeal color={color} glyph={glyph} />
        </motion.span>
      )}
    </AnimatePresence>
  )
}
