import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { INTENTIONS } from '../data/intentions.js'
import { useShop } from '../state/ShopContext.jsx'
import { PotionBottle } from './illustrations/PotionBottle.jsx'
import { IntentionSigil, WaxSeal } from './illustrations/Sigils.jsx'
import { BurstOverlay } from './ParticleBurst.jsx'

/** Capítulo I: cuatro intenciones, cada una con su propia botella (grupo de radio). */
export function PotionSelector() {
  const { builder, actions } = useShop()
  const [burst, setBurst] = useState(0)

  return (
    <fieldset className="choice-grid choice-grid--two">
      <legend className="sr-only">Elige tu intención</legend>
      {INTENTIONS.map((intention) => {
        const selected = builder.intention === intention.id
        return (
          <label
            key={intention.id}
            className={`recipe-card${selected ? ' is-selected' : ''}`}
            style={{
              '--accent': intention.colors.liquid,
              '--accent-glow': intention.colors.glow,
              '--accent-deep': intention.colors.deep,
            }}
          >
            <input
              type="radio"
              name="intention"
              value={intention.id}
              checked={selected}
              onChange={() => {
                actions.setIntention(intention.id)
                setBurst((b) => b + 1)
              }}
              className="sr-only"
            />
            <span className="recipe-card__art">
              <PotionBottle
                className="recipe-card__bottle"
                color={intention.colors.liquid}
                deep={intention.colors.deep}
                glow={intention.colors.glow}
                shape={intention.bottle}
                fill={0.72}
              />
              <IntentionSigil id={intention.id} className="recipe-card__sigil" />
            </span>
            <span className="recipe-card__title">{intention.name}</span>
            <span className="recipe-card__desc">{intention.description}</span>
            <span className="recipe-card__meta">{intention.themes.join(' · ')}</span>
            <span className="recipe-card__cta" aria-hidden="true">
              {selected ? 'Elegida' : 'Elegir'}
            </span>
            <AnimatePresence>
              {selected && (
                <motion.span
                  className="recipe-card__seal"
                  initial={{ scale: 1.8, opacity: 0, rotate: -30 }}
                  animate={{ scale: 1, opacity: 1, rotate: -10 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.3, 1.4, 0.5, 1] }}
                >
                  <WaxSeal color={intention.colors.deep} glyph="check" />
                </motion.span>
              )}
            </AnimatePresence>
            {selected && burst > 0 && (
              <BurstOverlay key={burst} effect={intention.effect} colors={[intention.colors.glow, intention.colors.liquid, '#fff4d6']} />
            )}
          </label>
        )
      })}
    </fieldset>
  )
}
