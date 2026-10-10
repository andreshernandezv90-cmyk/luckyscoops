import { useState } from 'react'
import { motion } from 'motion/react'
import { SIZES } from '../data/sizes.js'
import { getIntention } from '../data/intentions.js'
import { formatPrice } from '../lib/format.js'
import { useShop } from '../state/ShopContext.jsx'
import { SelectionSeal } from './SelectionSeal.jsx'
import { playSound } from '../lib/sound.js'
import { PotionBottle } from './illustrations/PotionBottle.jsx'
import { MoonPhase } from './illustrations/Sigils.jsx'
import { BurstOverlay } from './ParticleBurst.jsx'

/** Capítulo III: tres tamaños presentados como niveles de intensidad. */
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
                playSound('select')
              }}
              className="sr-only"
            />
            <span className="size-card__art">
              <MoonPhase phase={size.moon} className="size-card__moon" />
              {selected && (
                <svg className="size-card__ring" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
                  <motion.circle
                    cx="32"
                    cy="32"
                    r="29"
                    initial={{ pathLength: 0, opacity: 0, rotate: -90 }}
                    animate={{ pathLength: 1, opacity: 1, rotate: -90 }}
                    transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                    style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                  />
                </svg>
              )}
              <PotionBottle
                className="size-card__bottle"
                color={colors.liquid}
                deep={colors.deep}
                glow={size.essence}
                fill={size.fill}
                shape={intention?.bottle ?? 'round'}
                sloshKey={selected ? burst : 0}
              />
            </span>
            <span className="size-card__body">
              <span className="size-card__level">
                {size.level} · {size.label}
              </span>
              <span className={`size-card__name${selected ? ' ink-gild' : ''}`}>{size.name}</span>
              <span className="size-card__desc">{size.description}</span>
              {size.contents && <span className="size-card__meta">{size.contents}</span>}
            </span>
            <span className="size-card__price">{formatPrice(size.price)}</span>
            <span className="size-card__intensity" aria-hidden="true">
              {Array.from({ length: 3 }, (_, i) => (
                <span key={i} className={i <= index ? 'is-on' : ''} />
              ))}
            </span>
            <SelectionSeal show={selected} className="size-card__seal" color="#7a5a1c" glyph="check" rotate={-8} />
            {selected && burst > 0 && <BurstOverlay key={burst} effect="sparkles" colors={[size.essence, '#fff4d6']} />}
          </label>
        )
      })}
    </fieldset>
  )
}
