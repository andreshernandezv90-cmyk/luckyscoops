import { useState } from 'react'
import { INTENTIONS } from '../data/intentions.js'
import { useShop } from '../state/ShopContext.jsx'
import { SelectionSeal } from './SelectionSeal.jsx'
import { playSound } from '../lib/sound.js'
import { PotionBottle } from './illustrations/PotionBottle.jsx'
import { IntentionSigil } from './illustrations/Sigils.jsx'
import { InkStroke } from './illustrations/Ornaments.jsx'
import { BurstOverlay } from './ParticleBurst.jsx'

/**
 * Capítulo I: cuatro intenciones, cada una con su propia botella (grupo de radio).
 * «Luz de vela»: las botellas están sobre la página, sin tarjetas; la elegida se
 * ilumina con la luz de su color, recibe el sello y su nombre se subraya con tinta.
 */
export function PotionSelector() {
  const { builder, actions } = useShop()
  const [burst, setBurst] = useState(0)

  return (
    <fieldset className="vela-options">
      <legend className="sr-only">Elige tu intención</legend>
      {INTENTIONS.map((intention) => {
        const selected = builder.intention === intention.id
        return (
          <label
            key={intention.id}
            className={`vela-option${selected ? ' is-selected' : ''}`}
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
                playSound('select')
              }}
              className="sr-only"
            />
            <span className="vela-option__art">
              <span className="vela-option__light" aria-hidden="true" />
              <IntentionSigil id={intention.id} className="vela-option__sigil" />
              <PotionBottle
                className="vela-option__bottle"
                color={intention.colors.liquid}
                deep={intention.colors.deep}
                glow={intention.colors.glow}
                shape={intention.bottle}
                fill={0.72}
                sloshKey={selected ? burst : 0}
              />
            </span>
            <span className="vela-option__body">
              <span className="vela-option__title">{intention.name}</span>
              <InkStroke className="vela-option__stroke" />
              <span className="vela-option__desc">{intention.description}</span>
              <span className="vela-option__meta">{intention.themes.join(' · ')}</span>
            </span>
            <SelectionSeal show={selected} className="vela-option__seal" color="#9e2350" glyph="check" rotate={-10} />
            {selected && burst > 0 && (
              <BurstOverlay key={burst} effect={intention.effect} colors={[intention.colors.glow, intention.colors.liquid, '#fff4d6']} />
            )}
          </label>
        )
      })}
    </fieldset>
  )
}
