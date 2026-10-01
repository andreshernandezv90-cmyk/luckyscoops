import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { SIZES } from '../data/sizes.js'
import { getIntention } from '../data/intentions.js'
import { formatPrice } from '../lib/format.js'
import { useShop } from '../state/ShopContext.jsx'
import { PotionBottle } from './illustrations/PotionBottle.jsx'
import { MoonPhase, WaxSeal } from './illustrations/Sigils.jsx'
import { BurstOverlay } from './ParticleBurst.jsx'

/** Capítulo II: tres tamaños presentados como niveles de intensidad. */
export function SizeSelector() {
  const { builder, actions } = useShop()
  const [burst, setBurst] = useState(0)
  const intention = getIntention(builder.intention)
  const colors = intention?.colors ?? { liquid: '#c9a24a', deep: '#5a3a22', glow: '#f6dc7a' }

  return (
    <fieldset className="choice-grid choice-grid--sizes">
      <legend className="sr-only">Elige el tamaño</legend>
      {SIZES.map((size, index) => {
        const selected = builder.size === size.id
        return (
          <label key={size.id} className={`size-card${selected ? ' is-selected' : ''}`} style={{ '--essence': size.essence }}>
            <input
              type="radio"
              name="size"
              value={size.id}
              checked={selected}
              onChange={() => {
                actions.setSize(size.id)
                setBurst((b) => b + 1)
              }}
              className="sr-only"
            />
            <span className="size-card__art">
              <MoonPhase phase={size.moon} className="size-card__moon" />
              <PotionBottle
                className="size-card__bottle"
                color={colors.liquid}
                deep={colors.deep}
                glow={size.essence}
                fill={size.fill}
                shape="round"
              />
            </span>
            <span className="size-card__body">
              <span className="size-card__level">
                {size.level} · {size.label}
              </span>
              <span className={`size-card__name${selected ? ' ink-gild' : ''}`}>{size.name}</span>
              <span className="size-card__desc">{size.description}</span>
              <span className="size-card__meta">{size.contents}</span>
            </span>
            <span className="size-card__price">{formatPrice(size.price)}</span>
            <span className="size-card__intensity" aria-hidden="true">
              {Array.from({ length: 3 }, (_, i) => (
                <span key={i} className={i <= index ? 'is-on' : ''} />
              ))}
            </span>
            <AnimatePresence>
              {selected && (
                <motion.span
                  className="size-card__seal"
                  initial={{ scale: 1.8, opacity: 0, rotate: -30 }}
                  animate={{ scale: 1, opacity: 1, rotate: -8 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.3, 1.4, 0.5, 1] }}
                >
                  <WaxSeal color="#7a5a1c" glyph="check" />
                </motion.span>
              )}
            </AnimatePresence>
            {selected && burst > 0 && <BurstOverlay key={burst} effect="sparkles" colors={[size.essence, '#fff4d6']} />}
          </label>
        )
      })}
    </fieldset>
  )
}
