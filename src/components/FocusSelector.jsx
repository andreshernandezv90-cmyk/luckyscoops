import { useState } from 'react'
import { getIntention, WITCH_CHOICE } from '../data/intentions.js'
import { useShop } from '../state/ShopContext.jsx'
import { SelectionSeal } from './SelectionSeal.jsx'
import { playSound } from '../lib/sound.js'
import { BrandMark } from './BrandMark.jsx'
import { IntentionSigil } from './illustrations/Sigils.jsx'
import { InkStroke } from './illustrations/Ornaments.jsx'
import { BurstOverlay } from './ParticleBurst.jsx'

/**
 * Capítulo II: personaliza tu intención.
 * Las opciones dependen de la intención elegida. Elegir es opcional:
 * "Déjalo en manos de la Bruja Sabia" viene marcado de inicio.
 * «Luz de vela»: un índice manuscrito de matices, sin tarjetas. La Bruja Sabia
 * cierra la lista como una posdata.
 */
export function FocusSelector() {
  const { builder, actions } = useShop()
  const [burst, setBurst] = useState(0)
  const intention = getIntention(builder.intention)
  if (!intention) return null
  const current = builder.focus ?? WITCH_CHOICE.id

  return (
    <fieldset
      className="vela-indice"
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
          <label key={focus.id} className={`vela-matiz${selected ? ' is-selected' : ''}${isWitch ? ' vela-matiz--posdata' : ''}`}>
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
            <span className="vela-matiz__marca" aria-hidden="true">
              <span className="vela-luz vela-matiz__luz" />
              {isWitch ? (
                <BrandMark className="vela-matiz__logo" />
              ) : (
                <IntentionSigil id={intention.id} className="vela-matiz__sigilo" />
              )}
            </span>
            <span className="vela-matiz__texto">
              <span className="vela-matiz__nombre">{focus.name}</span>
              <InkStroke className="vela-trazo vela-matiz__trazo" />
              <span className="vela-matiz__desc">{focus.description}</span>
            </span>
            <SelectionSeal show={selected} className="vela-sello vela-matiz__sello" glyph="check" rotate={-10} />
            {selected && burst > 0 && (
              <BurstOverlay key={burst} effect={intention.effect} colors={[intention.colors.glow, intention.colors.liquid, '#fff4d6']} />
            )}
          </label>
        )
      })}
    </fieldset>
  )
}
