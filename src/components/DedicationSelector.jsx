import { AnimatePresence, motion } from 'motion/react'
import { getExtra } from '../data/extras.js'
import { formatExtraPrice } from '../lib/format.js'
import { useShop } from '../state/ShopContext.jsx'
import { ExtraIcon, WaxSeal } from './illustrations/Sigils.jsx'
import { CheckMark } from './illustrations/Ornaments.jsx'

const MAX_LENGTH = 200

const OPTIONS = [
  { id: 'me', name: 'Es para mí', description: 'Una Scoop para acompañar tu propia intención.' },
  { id: 'gift', name: 'Es un regalo', description: 'Puedes escribir una dedicatoria para quien la reciba.' },
]

/** Capítulo V: ¿para quién es la Scoop? Dedicatoria opcional si es un regalo. */
export function DedicationSelector() {
  const { builder, actions } = useShop()
  const { forWhom, message } = builder.dedication
  const giftWrap = getExtra('regalo')
  const hasGiftWrap = builder.extras.includes('regalo')

  return (
    <div className="dedication">
      <fieldset className="choice-grid choice-grid--two">
        <legend className="sr-only">¿Esta Scoop es para alguien especial?</legend>
        {OPTIONS.map((option) => {
          const selected = forWhom === option.id
          return (
            <label key={option.id} className={`focus-card dedication-card${selected ? ' is-selected' : ''}`}>
              <input
                type="radio"
                name="forWhom"
                value={option.id}
                checked={selected}
                onChange={() => actions.setDedication({ forWhom: option.id })}
                className="sr-only"
              />
              <span className="focus-card__icon" aria-hidden="true">
                {option.id === 'gift' ? <ExtraIcon id="regalo" color="#ec5fa6" /> : <ExtraIcon id="cristal" color="#a35ee8" />}
              </span>
              <span className="focus-card__body">
                <span className="focus-card__name">{option.name}</span>
                <span className="focus-card__desc">{option.description}</span>
              </span>
              <AnimatePresence>
                {selected && (
                  <motion.span
                    className="focus-card__seal"
                    initial={{ scale: 1.8, opacity: 0, rotate: -30 }}
                    animate={{ scale: 1, opacity: 1, rotate: -10 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.3, 1.4, 0.5, 1] }}
                  >
                    <WaxSeal color="#6a1f5c" glyph="check" />
                  </motion.span>
                )}
              </AnimatePresence>
            </label>
          )
        })}
      </fieldset>

      <AnimatePresence initial={false}>
        {forWhom === 'gift' && (
          <motion.div
            className="dedication__gift"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="field dedication__field">
              <label htmlFor="dedication-message">
                Dedicatoria <span className="field__optional">(opcional)</span>
              </label>
              <textarea
                id="dedication-message"
                rows="4"
                maxLength={MAX_LENGTH}
                value={message}
                onChange={(e) => actions.setDedication({ message: e.target.value })}
                placeholder="Que nunca te falte magia en tus nuevos comienzos."
                aria-describedby="dedication-help"
              />
              <p className="field__help" id="dedication-help">
                Se incluirá en tu pedido. {message.length}/{MAX_LENGTH} caracteres.
              </p>
            </div>
            {giftWrap &&
              (hasGiftWrap ? (
                <p className="dedication__wrap is-added">
                  <CheckMark className="btn__icon" /> Tu pedido incluye {giftWrap.name.toLowerCase()}.
                </p>
              ) : (
                <div className="dedication__wrap">
                  <p>¿Quieres una presentación especial para regalar?</p>
                  <button type="button" className="btn btn--ghost-ink" onClick={() => actions.toggleExtra('regalo')}>
                    Añadir {giftWrap.name.toLowerCase()} ({formatExtraPrice(giftWrap.price)})
                  </button>
                </div>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
