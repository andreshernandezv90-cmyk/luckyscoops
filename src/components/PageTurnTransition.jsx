import { useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { leafKeyframes, PAGE_TURN, pageTurnPlan } from '../lib/motion.js'
import { useMediaQuery } from '../hooks/useMediaQuery.js'

/**
 * Pasar página del Grimorio.
 *
 * La página vieja sale del flujo (popLayout) y se apaga encima de la nueva,
 * así el libro nunca se queda vacío ni cambia de golpe de altura. Mientras, una hoja de pergamino se levanta,
 * se curva, cruza el lomo y se asienta del otro lado. El contenido nuevo
 * aparece por partes: primero en la página que la hoja deja libre y luego
 * en la página donde la hoja aterriza (ver estilos .book__spread[data-turn]).
 *
 *   escritorio  hoja completa de una página a la otra (pageTurnPlan → 'leaf')
 *   celular     la hoja gira sobre el lomo y se desvanece ('flip')
 *   movimiento reducido: solo un fundido ('fade')
 *
 * No bloquea: si se cambia de capítulo a mitad del giro, la hoja vuelve a empezar.
 * Debe ir dentro de un contenedor con position: relative y perspective (.book).
 */
export function PageTurnTransition({ pageKey, direction, className = '', children }) {
  const reduce = useReducedMotion()
  const compact = useMediaQuery('(max-width: 899px)')
  const plan = pageTurnPlan(direction, { compact, reduce })
  // En la primera carga no se pasa ninguna página.
  const initialKey = useRef(pageKey)
  const turned = useRef(false)
  if (pageKey !== initialKey.current) turned.current = true
  const turn = !turned.current ? 'none' : plan.mode === 'fade' ? 'fade' : `${plan.mode}-${plan.forward ? 'next' : 'prev'}`

  return (
    <>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={pageKey}
          className={className}
          data-turn={turn}
          initial={{ opacity: plan.mode === 'fade' ? 0 : 1 }}
          animate={{ opacity: 1 }}
          // La página vieja queda encima mientras se apaga.
          exit={{ opacity: 0, zIndex: 3 }}
          transition={{ duration: plan.mode === 'fade' ? PAGE_TURN.fade : plan.mode === 'leaf' ? PAGE_TURN.exit : PAGE_TURN.exit * 0.6, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
      {turned.current && <PageLeaf key={`leaf-${pageKey}`} plan={plan} />}
    </>
  )
}

/** Hoja que cruza el libro. Se monta con cada cambio de página; en la primera carga no se ve. */
function PageLeaf({ plan }) {
  if (plan.mode === 'fade') return null
  const ease = [0.45, 0.05, 0.35, 1]

  if (plan.mode === 'flip') {
    const forward = plan.forward
    return (
      <motion.div
        className="page-leaf page-leaf--compact"
        initial={{ rotateY: plan.from, opacity: 0 }}
        animate={{
          rotateY: forward ? [0, 0, -40, plan.to] : [plan.from, -40, 0, 0],
          opacity: [0, 1, 1, 0],
        }}
        transition={{ duration: plan.duration, times: forward ? [0, 0.15, 0.55, 1] : [0, 0.4, 0.75, 1], ease }}
        aria-hidden="true"
      >
        <span className="page-leaf__face page-leaf__face--front" />
      </motion.div>
    )
  }

  const kf = leafKeyframes(plan.forward)
  const transition = { duration: plan.duration, times: kf.times, ease }
  return (
    <>
      <motion.span
        className="page-spine-shadow"
        initial={{ opacity: 0 }}
        animate={{ opacity: kf.spine }}
        transition={transition}
        aria-hidden="true"
      />
      <motion.div
        className={`page-leaf page-leaf--${plan.forward ? 'next' : 'prev'}`}
        initial={{ rotateY: 0, opacity: 0 }}
        animate={{ rotateY: kf.rotateY, scaleX: kf.scaleX, skewY: kf.skewY, opacity: kf.opacity }}
        transition={transition}
        aria-hidden="true"
      >
        <span className="page-leaf__face page-leaf__face--front">
          <motion.span className="page-leaf__shade" initial={{ opacity: 0 }} animate={{ opacity: kf.frontShade }} transition={transition} />
        </span>
        <span className="page-leaf__face page-leaf__face--back">
          <motion.span className="page-leaf__shade" initial={{ opacity: 0.45 }} animate={{ opacity: kf.backShade }} transition={transition} />
        </span>
      </motion.div>
    </>
  )
}
