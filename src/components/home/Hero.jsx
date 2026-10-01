import { useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { BRAND } from '../../config/brand.js'
import { linkTo, navigate, ROUTES } from '../../lib/router.js'
import { TableScene } from '../TableScene.jsx'

/** Pantalla inicial: el grimorio cerrado sobre la mesa y el botón para abrirlo. */
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
    window.setTimeout(() => navigate(ROUTES.grimorio), 1000)
  }

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__heading">
        <p className="hero__brand">{BRAND.name}</p>
        <h1 id="hero-title" className="hero__title">
          Prepara tu propia {BRAND.productNoun}
        </h1>
      </div>
      <TableScene open={opening} onOpen={openGrimoire} />
      <div className="hero__actions">
        <button type="button" className="btn btn--primary btn--xl" onClick={openGrimoire} disabled={opening}>
          {opening ? 'Abriendo el grimorio…' : 'Abrir grimorio'}
        </button>
        <a className="btn btn--text btn--on-dark" {...linkTo(ROUTES.productos)}>
          o compra una {BRAND.productNoun} ya preparada
        </a>
      </div>
      <p className="hero__lead">{BRAND.tagline}</p>
    </section>
  )
}
