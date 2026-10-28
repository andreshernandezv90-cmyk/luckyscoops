import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { EXTRAS, getExtra } from '../data/extras.js'
import { getIntention } from '../data/intentions.js'
import { recommendExtra } from '../data/recommendations.js'
import { formatExtraPrice } from '../lib/format.js'
import { useShop } from '../state/ShopContext.jsx'
import { SelectionSeal } from './SelectionSeal.jsx'
import { playSound } from '../lib/sound.js'
import { ExtraIcon } from './illustrations/Sigils.jsx'
import { BrandSigil, InkCheckbox, InkStroke } from './illustrations/Ornaments.jsx'
import { BurstOverlay } from './ParticleBurst.jsx'

const NOTE_ID = 'herbario-recomendacion'

/**
 * Capítulo IV: ingredientes adicionales. Opcionales; se pueden añadir varios y quitarlos.
 * «Luz de vela»: una lámina de herbario. Cada ingrediente es una casilla nativa y
 * toda la entrada es su etiqueta. La recomendación del Grimorio es una nota al
 * margen del ingrediente recomendado (aria-describedby), sin botón propio.
 */
export function ExtrasSelector() {
  const { builder, actions } = useShop()
  const [added, setAdded] = useState({ id: null, n: 0 })
  const recommendation = recommendExtra(builder)
  const recommended = recommendation ? getExtra(recommendation.extra) : null
  const intention = getIntention(builder.intention)

  const toggle = (id) => {
    const wasAdded = builder.extras.includes(id)
    actions.toggleExtra(id)
    if (!wasAdded) {
      setAdded((a) => ({ id, n: a.n + 1 }))
      playSound('select')
    }
  }

  return (
    <fieldset className="vela-herbario" style={intention ? { '--accent-deep': intention.colors.deep } : undefined}>
      <legend className="sr-only">Ingredientes adicionales para tu ritual</legend>
      {EXTRAS.map((extra) => (
        <Specimen
          key={extra.id}
          extra={extra}
          added={builder.extras.includes(extra.id)}
          reason={recommended?.id === extra.id ? recommendation.reason : null}
          justAdded={added.id === extra.id ? added.n : 0}
          onToggle={() => toggle(extra.id)}
        />
      ))}
    </fieldset>
  )
}

function Specimen({ extra, added, reason, justAdded, onToggle }) {
  const reduce = useReducedMotion()
  return (
    <div
      className={`vela-especimen${added ? ' is-selected' : ''}${reason ? ' is-recommended' : ''}`}
      style={{ '--accent': extra.color, '--accent-glow': extra.color }}
    >
      <label className={`vela-especimen__entrada${added ? ' is-selected' : ''}`}>
        <span className="vela-especimen__arte" aria-hidden="true">
          <span className="vela-luz vela-especimen__luz" />
          {/* Tinta del sello: se extiende detrás del símbolo y queda como mancha tenue */}
          {added && (
            <motion.span
              key={`ink-${justAdded}`}
              className="vela-especimen__tinta"
              initial={reduce || !justAdded ? false : { scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          )}
          <motion.span
            key={`icon-${added ? justAdded : 'off'}`}
            className="vela-especimen__estampa"
            initial={added && justAdded && !reduce ? { scale: 1.35, rotate: -10, opacity: 0.4 } : false}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ duration: 0.32, ease: [0.3, 1.5, 0.5, 1] }}
          >
            <ExtraIcon id={extra.id} color={extra.color} className="vela-especimen__icono" />
          </motion.span>
          {/* Al añadirlo, una copia del ingrediente cae hacia el ritual */}
          {added && justAdded > 0 && !reduce && (
            <motion.span
              key={justAdded}
              className="vela-especimen__caida"
              initial={{ y: 0, scale: 1, opacity: 0.9, rotate: 0 }}
              animate={{ y: 70, scale: 0.25, opacity: 0, rotate: 40 }}
              transition={{ duration: 0.6, ease: 'easeIn' }}
            >
              <ExtraIcon id={extra.id} color={extra.color} />
            </motion.span>
          )}
        </span>
        <span className="vela-especimen__texto">
          <span className="vela-especimen__nombre">
            {/* La casilla nativa va junto a su dibujo: al recibir el foco, el navegador muestra esta zona */}
              <input
                type="checkbox"
                name="extras"
                value={extra.id}
                checked={added}
                onChange={onToggle}
                aria-describedby={reason ? NOTE_ID : undefined}
                className="sr-only"
              />
            <InkCheckbox className="vela-casilla" />
            {extra.name}
          </span>
          <InkStroke className="vela-trazo vela-especimen__trazo" />
          <span className="vela-especimen__desc">{extra.description}</span>
        </span>
        <span className="vela-especimen__precio">{formatExtraPrice(extra.price)}</span>
        <SelectionSeal show={added} className="vela-sello vela-especimen__sello" glyph="star" rotate={12} />
        {added && justAdded > 0 && <BurstOverlay key={justAdded} effect="sparkles" colors={[extra.color, '#fff4d6']} />}
      </label>
      {reason && (
        <p className="vela-especimen__nota" id={NOTE_ID}>
          <BrandSigil className="vela-especimen__nota-sigilo" />
          <span>
            <span className="vela-especimen__nota-titulo">El Grimorio lo recomienda: </span>
            {reason}
          </span>
        </p>
      )}
    </div>
  )
}
