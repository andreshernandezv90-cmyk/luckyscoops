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
import { InkStroke } from './illustrations/Ornaments.jsx'
import { BurstOverlay } from './ParticleBurst.jsx'

/** Altura de cada botella respecto a la mayor: la escala de los tres círculos se ve sin leerla. */
const TALLAS = [0.66, 0.83, 1]

/**
 * Capítulo III: tres tamaños presentados como niveles de intensidad.
 * «Luz de vela»: los tres círculos. Tres botellas de la intención, de menor a
 * mayor, sobre una misma línea de tinta; en el celular, una tabla manuscrita
 * con el precio a la derecha.
 */
export function SizeSelector() {
  const { builder, actions } = useShop()
  const [burst, setBurst] = useState(0)
  const intention = getIntention(builder.intention)
  const colors = intention?.colors ?? { liquid: '#c9a24a', deep: '#5a3a22', glow: '#f6dc7a' }

  return (
    <fieldset
      className="vela-circulos"
      style={{ '--accent-glow': colors.glow, '--accent-deep': colors.deep }}
    >
      <legend className="sr-only">Elige el tamaño</legend>
      <InkStroke className="vela-circulos__linea" />
      {SIZES.map((size, index) => {
        const selected = builder.size === size.id
        return (
          <label key={size.id} className={`vela-circulo${selected ? ' is-selected' : ''}`} style={{ '--talla': TALLAS[index] }}>
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
            <span className="vela-circulo__arte" aria-hidden="true">
              <span className="vela-circulo__luna">
                <MoonPhase phase={size.moon} />
                {selected && (
                  <svg className="vela-circulo__anillo" viewBox="0 0 64 64" focusable="false">
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
              </span>
              <span className="vela-circulo__frasco">
                <span className="vela-luz vela-circulo__luz" />
                <PotionBottle
                  className="vela-circulo__botella"
                  color={colors.liquid}
                  deep={colors.deep}
                  glow={size.essence}
                  fill={size.fill}
                  shape={intention?.bottle ?? 'round'}
                  sloshKey={selected ? burst : 0}
                />
              </span>
            </span>
            <span className="vela-circulo__texto">
              <span className="vela-circulo__nombre">{size.name}</span>
              <InkStroke className="vela-trazo vela-circulo__trazo" />
              <span className="vela-circulo__nivel">
                {size.level}
                <span className="vela-circulo__sep"> · </span>
                <span className="vela-circulo__etiqueta">{size.label}</span>
              </span>
              <span className="vela-circulo__desc">{size.description}</span>
              {size.contents && <span className="vela-circulo__meta">{size.contents}</span>}
            </span>
            <span className="vela-circulo__precio">{formatPrice(size.price)}</span>
            <SelectionSeal show={selected} className="vela-sello vela-circulo__sello" glyph="check" rotate={-8} />
            {selected && burst > 0 && <BurstOverlay key={burst} effect="sparkles" colors={[size.essence, '#fff4d6']} />}
          </label>
        )
      })}
    </fieldset>
  )
}
