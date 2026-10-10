import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { EXTRAS, getExtra } from '../data/extras.js'
import { recommendExtra } from '../data/recommendations.js'
import { formatExtraPrice } from '../lib/format.js'
import { useShop } from '../state/ShopContext.jsx'
import { SelectionSeal } from './SelectionSeal.jsx'
import { playSound } from '../lib/sound.js'
import { ExtraIcon } from './illustrations/Sigils.jsx'
import { BrandSigil, CheckMark } from './illustrations/Ornaments.jsx'
import { BurstOverlay } from './ParticleBurst.jsx'

/** Capítulo IV: ingredientes adicionales. Opcionales; se pueden añadir varios y quitarlos. */
export function ExtrasSelector() {
  const { builder, actions } = useShop()
  const [added, setAdded] = useState({ id: null, n: 0 })
  const recommendation = recommendExtra(builder)
  const recommended = recommendation ? getExtra(recommendation.extra) : null

  const toggle = (id) => {
    const wasAdded = builder.extras.includes(id)
    actions.toggleExtra(id)
    if (!wasAdded) {
      setAdded((a) => ({ id, n: a.n + 1 }))
      playSound('select')
    }
  }

  return (
    <div className="extras">
      {recommended && (
        <aside className="recommendation" aria-label="Recomendación del Grimorio" style={{ '--accent': recommended.color }}>
          <BrandSigil className="recommendation__sigil" />
          <div className="recommendation__body">
            <p className="recommendation__kicker">El Grimorio tiene una recomendación para tu receta…</p>
            <p className="recommendation__name">
              {recommended.name} <span className="recommendation__price">{formatExtraPrice(recommended.price)}</span>
            </p>
            <p className="recommendation__reason">{recommendation.reason}</p>
          </div>
          {builder.extras.includes(recommended.id) ? (
            <p className="recommendation__done">
              <CheckMark className="btn__icon" /> Ya está en tu ritual
            </p>
          ) : (
            <button type="button" className="btn btn--ink recommendation__button" onClick={() => toggle(recommended.id)}>
              Añadir al ritual
            </button>
          )}
        </aside>
      )}

      <ul className="choice-grid choice-grid--two ingredient-list">
        {EXTRAS.map((extra) => (
          <IngredientCard
            key={extra.id}
            extra={extra}
            added={builder.extras.includes(extra.id)}
            recommended={recommended?.id === extra.id}
            justAdded={added.id === extra.id ? added.n : 0}
            onToggle={() => toggle(extra.id)}
          />
        ))}
      </ul>
    </div>
  )
}

function IngredientCard({ extra, added, recommended, justAdded, onToggle }) {
  const reduce = useReducedMotion()
  return (
    <li className={`ingredient-card${added ? ' is-added' : ''}`} style={{ '--accent': extra.color }}>
      {recommended && <span className="ingredient-card__ribbon">Recomendado</span>}
      <span className="ingredient-card__art">
        {/* Tinta del sello: se extiende detrás del símbolo y queda como mancha tenue */}
        {added && (
          <motion.span
            key={`ink-${justAdded}`}
            className="ingredient-card__ink"
            initial={reduce || !justAdded ? false : { scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            aria-hidden="true"
          />
        )}
        <motion.span
          key={`icon-${added ? justAdded : 'off'}`}
          className="ingredient-card__stamp"
          initial={added && justAdded && !reduce ? { scale: 1.35, rotate: -10, opacity: 0.4 } : false}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ duration: 0.32, ease: [0.3, 1.5, 0.5, 1] }}
        >
          <ExtraIcon id={extra.id} color={extra.color} className="ingredient-card__icon" />
        </motion.span>
        {/* Al añadirlo, una copia del ingrediente cae hacia el ritual */}
        {added && justAdded > 0 && !reduce && (
          <motion.span
            key={justAdded}
            className="ingredient-card__drop"
            initial={{ y: 0, scale: 1, opacity: 0.9, rotate: 0 }}
            animate={{ y: 70, scale: 0.25, opacity: 0, rotate: 40 }}
            transition={{ duration: 0.6, ease: 'easeIn' }}
            aria-hidden="true"
          >
            <ExtraIcon id={extra.id} color={extra.color} />
          </motion.span>
        )}
      </span>
      <h3 className="ingredient-card__name">{extra.name}</h3>
      <p className="ingredient-card__desc">{extra.description}</p>
      <p className="ingredient-card__price">{formatExtraPrice(extra.price)}</p>
      <button
        type="button"
        className={`btn ${added ? 'btn--ghost-ink' : 'btn--ink'} ingredient-card__button`}
        aria-pressed={added}
        onClick={onToggle}
      >
        {added ? (
          <>
            <CheckMark className="btn__icon" /> En el ritual · Quitar
          </>
        ) : (
          'Añadir ingrediente al ritual'
        )}
      </button>
      <SelectionSeal show={added} className="ingredient-card__seal" color="#5a2591" glyph="star" rotate={12} />
      {added && justAdded > 0 && <BurstOverlay key={justAdded} effect="sparkles" colors={[extra.color, '#fff4d6']} />}
    </li>
  )
}
