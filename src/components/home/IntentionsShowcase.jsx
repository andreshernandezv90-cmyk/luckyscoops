import { INTENTIONS } from '../../data/intentions.js'
import { navigate, ROUTES } from '../../lib/router.js'
import { CHAPTER, useShop } from '../../state/ShopContext.jsx'
import { PotionBottle } from '../illustrations/PotionBottle.jsx'
import { IntentionSigil } from '../illustrations/Sigils.jsx'
import { SectionTitle } from './SectionTitle.jsx'

export function IntentionsShowcase() {
  const { actions } = useShop()
  const start = (id) => {
    actions.loadRecipe({ intention: id }, CHAPTER.ENFOQUE)
    navigate(ROUTES.grimorio)
  }
  return (
    <section className="section" id="intenciones" aria-labelledby="intentions-title">
      <SectionTitle id="intentions-title" kicker="Las cuatro intenciones">
        ¿Qué deseas atraer?
      </SectionTitle>
      <ul className="intention-showcase">
        {INTENTIONS.map((i) => (
          <li
            key={i.id}
            className="intention-tile"
            style={{ '--accent': i.colors.liquid, '--accent-glow': i.colors.glow, '--accent-deep': i.colors.deep }}
          >
            <div className="intention-tile__art" aria-hidden="true">
              <PotionBottle color={i.colors.liquid} deep={i.colors.deep} glow={i.colors.glow} shape={i.bottle} fill={0.7} className="intention-tile__bottle" />
              <IntentionSigil id={i.id} className="intention-tile__sigil" />
            </div>
            <h3 className="intention-tile__name">{i.name}</h3>
            <p className="intention-tile__text">{i.description}</p>
            <p className="intention-tile__themes">{i.themes.join(' · ')}</p>
            <button type="button" className="btn btn--ghost" onClick={() => start(i.id)}>
              Preparar con {i.name}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
