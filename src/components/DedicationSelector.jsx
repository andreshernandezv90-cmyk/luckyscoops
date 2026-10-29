import { AnimatePresence, motion } from 'motion/react'
import { getExtra } from '../data/extras.js'
import { getIntention } from '../data/intentions.js'
import { formatExtraPrice } from '../lib/format.js'
import { useShop } from '../state/ShopContext.jsx'
import { SelectionSeal } from './SelectionSeal.jsx'
import { playSound } from '../lib/sound.js'
import { ExtraIcon, IntentionSigil } from './illustrations/Sigils.jsx'
import { InkCheckbox, InkStroke } from './illustrations/Ornaments.jsx'

const MAX_LENGTH = 200

const OPTIONS = [
  { id: 'me', name: 'Es para mí', description: 'Una Scoop para acompañar tu propia intención.' },
  { id: 'gift', name: 'Es un regalo', description: 'Puedes escribir una dedicatoria para quien la reciba.' },
]

/**
 * Capítulo IV: ¿para quién es la Scoop? Dedicatoria opcional si es un regalo.
 * «Luz de vela»: una carta. Las dos opciones son el destinatario del sobre; si es
 * un regalo se despliega la hoja con renglones para la dedicatoria y una posdata
 * con la casilla del empaque (el mismo extra que en el Capítulo III).
 */
export function DedicationSelector() {
  const { builder, actions } = useShop()
  const { forWhom, message } = builder.dedication
  const intention = getIntention(builder.intention)
  const giftWrap = getExtra('regalo')
  const hasGiftWrap = builder.extras.includes('regalo')

  return (
    <div
      className="vela-carta"
      style={intention ? { '--accent-glow': intention.colors.glow, '--accent-deep': intention.colors.deep } : undefined}
    >
      <fieldset className="vela-destinatarios">
        <legend className="sr-only">¿Esta Scoop es para alguien especial?</legend>
        {OPTIONS.map((option) => {
          const selected = forWhom === option.id
          return (
            <label key={option.id} className={`vela-destinatario${selected ? ' is-selected' : ''}`}>
              <input
                type="radio"
                name="forWhom"
                value={option.id}
                checked={selected}
                onChange={() => {
                  actions.setDedication({ forWhom: option.id })
                  playSound('select')
                }}
                className="sr-only"
              />
              <span className="vela-destinatario__marca" aria-hidden="true">
                <span className="vela-luz vela-destinatario__luz" />
                {option.id === 'gift' ? (
                  <ExtraIcon id="regalo" color={giftWrap?.color} className="vela-destinatario__icono" />
                ) : (
                  <IntentionSigil id={intention?.id} className="vela-destinatario__icono vela-destinatario__icono--sigilo" />
                )}
              </span>
              <span className="vela-destinatario__nombre">{option.name}</span>
              <InkStroke className="vela-trazo vela-destinatario__trazo" />
              <span className="vela-destinatario__desc">{option.description}</span>
              <SelectionSeal show={selected} className="vela-sello vela-destinatario__sello" glyph="check" rotate={-10} />
            </label>
          )
        })}
      </fieldset>

      <AnimatePresence initial={false}>
        {forWhom === 'gift' && (
          <motion.div
            className="vela-carta__hoja"
            initial={{ opacity: 0, height: 0, rotateX: -70 }}
            animate={{ opacity: 1, height: 'auto', rotateX: 0 }}
            exit={{ opacity: 0, height: 0, rotateX: -40 }}
            transition={{ duration: 0.42, ease: [0.25, 0.8, 0.3, 1], opacity: { duration: 0.25 } }}
          >
            <div className="vela-carta__campo">
              <label className="vela-carta__etiqueta" htmlFor="dedication-message">
                Dedicatoria <span className="vela-carta__opcional">(opcional)</span>
              </label>
              <textarea
                id="dedication-message"
                className="vela-carta__texto"
                rows="4"
                maxLength={MAX_LENGTH}
                value={message}
                onChange={(e) => actions.setDedication({ message: e.target.value })}
                // Al enfocar, el navegador solo muestra el renglón del cursor: que se vea todo el campo sobre la barra
                onFocus={(e) => e.currentTarget.scrollIntoView({ block: 'nearest' })}
                placeholder="Que nunca te falte magia en tus nuevos comienzos."
                aria-describedby="dedication-help"
              />
              <p className="vela-carta__ayuda" id="dedication-help">
                Se incluirá en tu pedido. {message.length}/{MAX_LENGTH} caracteres.
              </p>
            </div>
            {giftWrap && (
              <label className={`vela-posdata${hasGiftWrap ? ' is-selected' : ''}`}>
                <span className="vela-posdata__pd" aria-hidden="true">
                  P. D.
                </span>
                <span className="vela-posdata__texto">
                  <span className="vela-posdata__nombre">
                    <input
                      type="checkbox"
                      name="giftWrap"
                      value="regalo"
                      checked={hasGiftWrap}
                      onChange={() => {
                        actions.toggleExtra('regalo')
                        if (!hasGiftWrap) playSound('select')
                      }}
                      className="sr-only"
                    />
                    <InkCheckbox className="vela-casilla" />
                    Añadir {giftWrap.name.toLowerCase()}
                  </span>
                  <span className="vela-posdata__desc">{giftWrap.description}</span>
                </span>
                <span className="vela-posdata__precio">{formatExtraPrice(giftWrap.price)}</span>
              </label>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
