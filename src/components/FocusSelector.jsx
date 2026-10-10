import { useState } from 'react'
import { getIntention, WITCH_CHOICE } from '../data/intentions.js'
import { useShop } from '../state/ShopContext.jsx'
import { SelectionSeal } from './SelectionSeal.jsx'
import { playSound } from '../lib/sound.js'
import { BrandMark } from './BrandMark.jsx'
import { IntentionSigil } from './illustrations/Sigils.jsx'
import { BurstOverlay } from './ParticleBurst.jsx'

/**
 * Capítulo II: personaliza tu intención.
 * Las opciones dependen de la intención elegida. Elegir es opcional:
 * "Déjalo en manos de la Bruja Sabia" viene marcado de inicio.
 */
export function FocusSelector() {
  const { builder, actions } = useShop()
  const [burst, setBurst] = useState(0)
  const intention = getIntention(builder.intention)
  if (!intention) return null
  const current = builder.focus ?? WITCH_CHOICE.id

  return (
    <fieldset
      className="choice-grid choice-grid--two focus-grid"
      style={{
        '--accent': intention.colors.liquid,
        '--accent-glow': intention.colors.glow,
        '--accent-deep': intention.colors.deep,
      }}
    >
      <legend className="sr-only">¿Qué buscas específicamente en {intention.name}?</legend>
      {intention.focuses.map((focus) => {
        const selected = current === focus.id
        const isWitch = focus.id === WITCH_CHOICE.id
        return (
          <label key={focus.id} className={`focus-card${selected ? ' is-selected' : ''}${isWitch ? ' focus-card--witch' : ''}`}>
            <input
              type="radio"
              name="focus"
              value={focus.id}
              checked={selected}
              onChange={() => {
                actions.setFocus(focus.id)
                setBurst((b) => b + 1)
                playSound('select')
              }}
              className="sr-only"
            />
            <span className="focus-card__icon" aria-hidden="true">
              {isWitch ? <BrandMark className="focus-card__logo" /> : <IntentionSigil id={intention.id} />}
            </span>
            <span className="focus-card__body">
              <span className="focus-card__name">{focus.name}</span>
              <span className="focus-card__desc">{focus.description}</span>
            </span>
            <SelectionSeal show={selected} className="focus-card__seal" color={intention.colors.deep} glyph="check" rotate={-10} />
            {selected && burst > 0 && (
              <BurstOverlay key={burst} effect={intention.effect} colors={[intention.colors.glow, intention.colors.liquid, '#fff4d6']} />
            )}
          </label>
        )
      })}
    </fieldset>
  )
}
