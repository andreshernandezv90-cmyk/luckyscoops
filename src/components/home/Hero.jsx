import { useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { BRAND } from '../../config/brand.js'
import { linkTo, navigate, ROUTES } from '../../lib/router.js'
import { BOOK_OPEN_NAVIGATE_MS } from '../../lib/motion.js'
import { playSound } from '../../lib/sound.js'
import { TableScene } from '../TableScene.jsx'

/** Pantalla inicial: nombre, lema, el Grimorio cerrado sobre la mesa y el botón para abrirlo. */
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

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__heading">
        <h1 id="hero-title" className="hero__title">
          {BRAND.name}
        </h1>
        <p className="hero__motto">{BRAND.motto}</p>
      </div>
      <TableScene open={opening} onOpen={openGrimoire} />
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
