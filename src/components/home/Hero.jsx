import { useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { BRAND } from '../../config/brand.js'
import { linkTo, navigate, ROUTES } from '../../lib/router.js'
import { BOOK_OPEN_NAVIGATE_MS } from '../../lib/motion.js'
import { playSound } from '../../lib/sound.js'
import { TableScene } from '../TableScene.jsx'

/**
 * Pantalla inicial («Luz de vela», ver DESIGN.md): el Grimorio cerrado a la luz
 * de las velas, el nombre, el lema y el botón para abrirlo. Con ratón, la luz
 * sigue al puntero muy despacio; con movimiento reducido queda quieta.
 */
export function Hero() {
  const [opening, setOpening] = useState(false)
  const reduce = useReducedMotion()

  const openGrimoire = () => {
    if (opening) return
    if (reduce) {
      navigate(ROUTES.grimorio)
      return
    }
    setOpening(true)
    playSound('bookOpen')
    window.setTimeout(() => navigate(ROUTES.grimorio), BOOK_OPEN_NAVIGATE_MS)
  }

  // Posición del puntero de -1 a 1; el CSS desplaza la luz unos pocos puntos con una transición larga.
  const followLight = (event) => {
    if (reduce || event.pointerType !== 'mouse') return
    const box = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--light-dx', (((event.clientX - box.left) / box.width) * 2 - 1).toFixed(3))
    event.currentTarget.style.setProperty('--light-dy', (((event.clientY - box.top) / box.height) * 2 - 1).toFixed(3))
  }

  return (
    <section className="hero vela vela--hero" aria-labelledby="hero-title" onPointerMove={followLight}>
      <div className="hero__light" aria-hidden="true" />
      <TableScene open={opening} onOpen={openGrimoire} />
      <div className="hero__heading">
        <h1 id="hero-title" className="hero__title">
          {BRAND.name}
        </h1>
        <p className="hero__motto">{BRAND.motto}</p>
      </div>
      <p className="hero__lead">{BRAND.heroText}</p>
      <div className="hero__actions">
        <button type="button" className="btn btn--primary btn--xl" onClick={openGrimoire} disabled={opening}>
          {opening ? 'Abriendo el Grimorio…' : 'Abrir el Grimorio'}
        </button>
        <a className="btn btn--text btn--on-dark" {...linkTo(ROUTES.productos)}>
          o elige una {BRAND.productNoun} ya preparada
        </a>
      </div>
    </section>
  )
}
