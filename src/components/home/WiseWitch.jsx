import { BRAND } from '../../config/brand.js'
import { ABOUT } from '../../data/about.js'
import { BrandMark } from '../BrandMark.jsx'
import { PendingTag } from '../PendingTag.jsx'
import { SectionTitle } from './SectionTitle.jsx'

/**
 * "Conoce a la Bruja Sabia". Todo el contenido viene de src/data/about.js.
 * TODO / PENDIENTE: fotografía e historia real de la propietaria.
 */
export function WiseWitch() {
  return (
    <section className="section witch" id="bruja-sabia" aria-labelledby="witch-title">
      <SectionTitle id="witch-title" kicker={BRAND.motto}>
        Conoce a la Bruja Sabia
      </SectionTitle>
      <div className="witch__layout">
        <figure className="witch__photo">
          {ABOUT.photo ? (
            <img src={ABOUT.photo} alt={ABOUT.photoAlt} loading="lazy" />
          ) : (
            <div className="witch__photo-placeholder">
              <BrandMark className="witch__photo-sigil" />
              <PendingTag>Fotografía de la Bruja Sabia</PendingTag>
            </div>
          )}
        </figure>
        <div className="witch__story parchment-panel">
          {ABOUT.intro ? (
            <p className="witch__intro">{ABOUT.intro}</p>
          ) : (
            <p className="witch__intro witch__intro--pending">
              Aquí la Bruja Sabia te contará, con sus propias palabras, quién es y por qué prepara cada Scoop con tanto
              cariño. <PendingTag>Texto pendiente</PendingTag>
            </p>
          )}
          <div className="witch__blocks">
            {ABOUT.blocks.map((block) => (
              <div key={block.id} className={`witch__block${block.text ? '' : ' is-pending'}`}>
                <h3>{block.title}</h3>
                {block.text ? <p>{block.text}</p> : <PendingTag>Pendiente de escribir</PendingTag>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
