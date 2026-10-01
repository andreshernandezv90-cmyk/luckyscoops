import { BRAND } from '../../config/brand.js'
import { linkTo, ROUTES } from '../../lib/router.js'
import { PotionBottle } from '../illustrations/PotionBottle.jsx'
import { ArrowIcon } from '../illustrations/Ornaments.jsx'
import { SectionTitle } from './SectionTitle.jsx'

/** "¿Qué es una Scoop?": el concepto en pocas líneas. */
export function CraftIntro() {
  return (
    <section className="section craft" id="que-es" aria-labelledby="craft-title">
      <div className="craft__art" aria-hidden="true">
        <PotionBottle className="craft__bottle craft__bottle--1" color="#e0558f" deep="#7a1d52" glow="#ffa3cf" shape="round" />
        <PotionBottle className="craft__bottle craft__bottle--2" color="#d4a72c" deep="#2f5e2a" glow="#f8df7c" shape="flask" />
        <PotionBottle className="craft__bottle craft__bottle--3" color="#6a4fd8" deep="#2a1766" glow="#b3a6ff" shape="tall" />
      </div>
      <div className="craft__copy">
        <SectionTitle id="craft-title" kicker={BRAND.motto}>
          ¿Qué es una {BRAND.productNoun}?
        </SectionTitle>
        <p>
          Una {BRAND.productNoun} es una selección de artículos esotéricos (como cristales, hierbas y amuletos) que{' '}
          {BRAND.witch} prepara especialmente para la intención que tú elijas.
        </p>
        <ul className="craft__points">
          <li><strong>Tú eliges</strong> qué deseas atraer, el tamaño y los extras.</li>
          <li><strong>Ella prepara</strong> tu {BRAND.productNoun}, con un toque de sorpresa en cada una.</li>
          <li><strong>Te la enviamos</strong> a cualquier parte de la República Mexicana.</li>
        </ul>
        <a className="btn btn--primary btn--lg" {...linkTo(ROUTES.grimorio)}>
          Abrir el Grimorio <ArrowIcon className="btn__icon" />
        </a>
      </div>
    </section>
  )
}
