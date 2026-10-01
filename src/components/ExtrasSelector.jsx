import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { EXTRAS } from '../data/extras.js'
import { formatPrice } from '../lib/format.js'
import { useShop } from '../state/ShopContext.jsx'
import { ExtraIcon, WaxSeal } from './illustrations/Sigils.jsx'
import { CheckMark } from './illustrations/Ornaments.jsx'
import { BurstOverlay } from './ParticleBurst.jsx'

/** Capítulo III: ingredientes adicionales. Se pueden añadir varios y quitar cuando quieras. */
export function ExtrasSelector() {
  const { builder, actions } = useShop()
  const [burst, setBurst] = useState({ id: null, n: 0 })

  return (
    <ul className="choice-grid choice-grid--two ingredient-list">
      {EXTRAS.map((extra) => {
        const added = builder.extras.includes(extra.id)
        return (
          <li key={extra.id} className={`ingredient-card${added ? ' is-added' : ''}`} style={{ '--accent': extra.color }}>
            <ExtraIcon id={extra.id} color={extra.color} className="ingredient-card__icon" />
            <h3 className="ingredient-card__name">{extra.name}</h3>
            <p className="ingredient-card__desc">{extra.description}</p>
            <p className="ingredient-card__price">+{formatPrice(extra.price)}</p>
            <button
              type="button"
              className={`btn ${added ? 'btn--ghost-ink' : 'btn--ink'} ingredient-card__button`}
              aria-pressed={added}
              onClick={() => {
                actions.toggleExtra(extra.id)
                if (!added) setBurst((b) => ({ id: extra.id, n: b.n + 1 }))
              }}
            >
              {added ? (
                <>
                  <CheckMark className="btn__icon" /> En el ritual · Quitar
                </>
              ) : (
                'Añadir ingrediente al ritual'
              )}
            </button>
            <AnimatePresence>
              {added && (
                <motion.span
                  className="ingredient-card__seal"
                  initial={{ scale: 1.8, opacity: 0, rotate: -30 }}
                  animate={{ scale: 1, opacity: 1, rotate: 12 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.3, 1.4, 0.5, 1] }}
                >
                  <WaxSeal color="#5c1a2c" glyph="star" />
                </motion.span>
              )}
            </AnimatePresence>
            {added && burst.id === extra.id && (
              <BurstOverlay key={burst.n} effect="sparkles" colors={[extra.color, '#fff4d6']} />
            )}
          </li>
        )
      })}
    </ul>
  )
}
