import { BRAND } from '../../config/brand.js'
import { linkTo, ROUTES } from '../../lib/router.js'
import { PotionBottle } from '../illustrations/PotionBottle.jsx'
import { ArrowIcon } from '../illustrations/Ornaments.jsx'
import { SectionTitle } from './SectionTitle.jsx'

/** "Prepara tu propia Scoop": la promesa de la marca en pocas líneas. */
export function CraftIntro() {
  return (
    <section className="section craft" aria-labelledby="craft-title">
      <div className="craft__art" aria-hidden="true">
        <PotionBottle className="craft__bottle craft__bottle--1" color="#d9577a" deep="#7d1d3a" glow="#ff9fbc" />
        <PotionBottle className="craft__bottle craft__bottle--2" color="#c9a227" deep="#1f5a36" glow="#f6dc7a" shape="vial" />
        <PotionBottle className="craft__bottle craft__bottle--3" color="#5a4fcf" deep="#2a1b5e" glow="#a9a3ff" />
      </div>
      <div className="craft__copy">
        <SectionTitle id="craft-title" kicker="Una tienda escondida en un libro">
          Prepara tu propia {BRAND.productNoun}
        </SectionTitle>
        <p>
          Cada {BRAND.productNoun} es un frasco de cristales, hierbas secas y pequeños amuletos que mezclamos a mano
          según tu intención. En lugar de llenar un formulario, la preparas tú: pasas las páginas del grimorio, eliges
          tus ingredientes y los ves caer en el caldero.
        </p>
        <p>Nosotros la preparamos de verdad y te la enviamos a casa.</p>
        <a className="btn btn--primary btn--lg" {...linkTo(ROUTES.grimorio)}>
          Comenzar mi {BRAND.productNoun} <ArrowIcon className="btn__icon" />
        </a>
      </div>
    </section>
  )
}
