import { useRef, useState } from 'react'
import { BRAND } from '../config/brand.js'
import { getSize } from '../data/sizes.js'
import { cartTotals, itemUnitPrice, recipeExtras } from '../lib/pricing.js'
import { formatPrice } from '../lib/format.js'
import {
  DELIVERY_METHODS,
  FIELD_MAX,
  MIN_BIRTH_DATE,
  natalChartSlots,
  PAYMENT_METHODS,
  submitOrder,
  todayISO,
  validateNatalChart,
  whatsappReady,
} from '../lib/order.js'
import { linkTo, navigate, ROUTES } from '../lib/router.js'
import { useShop } from '../state/ShopContext.jsx'
import { dedicationLabel, OrderTotals } from './OrderSummary.jsx'
import { PendingTag } from './PendingTag.jsx'
import { ChapterDivider } from './illustrations/Ornaments.jsx'

const EMPTY_FORM = {
  name: '',
  phone: '',
  email: '',
  street: '',
  neighborhood: '',
  city: '',
  state: '',
  zip: '',
  notes: '',
  deliveryMethod: 'envio',
  paymentMethod: 'transferencia',
}

function validate(form) {
  const errors = {}
  if (form.name.trim().length < 3) errors.name = 'Escribe tu nombre completo.'
  const phoneDigits = form.phone.replace(/\D/g, '').length
  if (phoneDigits < 10 || phoneDigits > 13) errors.phone = 'Escribe un teléfono de 10 dígitos (puede llevar lada internacional).'
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Revisa tu correo; parece incompleto.'
  if (form.deliveryMethod === 'envio') {
    if (!form.street.trim()) errors.street = 'Escribe la calle y el número.'
    if (!form.neighborhood.trim()) errors.neighborhood = 'Escribe tu colonia.'
    if (!form.city.trim()) errors.city = 'Escribe tu ciudad o municipio.'
    if (!form.state.trim()) errors.state = 'Escribe tu estado.'
    if (!/^\d{5}$/.test(form.zip.trim())) errors.zip = 'El código postal tiene 5 números.'
  }
  return errors
}

const FIELD_ORDER = ['name', 'phone', 'email', 'street', 'neighborhood', 'zip', 'city', 'state']

/** Nombre de los campos de la Carta natal número `i` (en el formulario y en `errors`). */
const natalField = (i, part) => `natal-${i}-${part}`

/** Errores de todas las Cartas natales del carrito, con las claves de natalField. */
function validateNatal(slots, natal) {
  const errors = {}
  slots.forEach((slot, i) => {
    const found = validateNatalChart(natal[slot.id])
    if (found.name) errors[natalField(i, 'name')] = found.name
    if (found.birthDate) errors[natalField(i, 'birthDate')] = found.birthDate
  })
  return errors
}

/** Enlace a una página legal: se abre en otra pestaña para no perder lo escrito en el formulario. */
function LegalLink({ route, children }) {
  return (
    <a href={`#${route}`} target="_blank" rel="noopener">
      {children}
      <span className="sr-only"> (se abre en otra pestaña)</span>
    </a>
  )
}

/** Finalizar compra: datos de contacto, entrega y forma de pago. */
export function Checkout() {
  const { cart, actions } = useShop()
  const [form, setForm] = useState(EMPTY_FORM)
  // Datos de cada Carta natal: { [slot.id]: { name, birthDate } }. Solo en memoria:
  // no se guardan en el navegador hasta que forman parte del pedido (sessionStorage).
  const [natal, setNatal] = useState({})
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | error | done
  const formRef = useRef(null)

  // Pedido enviado: el carrito ya se vació y estamos por pasar a la confirmación.
  if (status === 'done') return null

  if (cart.length === 0) {
    return (
      <section className="page page--narrow" aria-labelledby="checkout-title">
        <h1 id="checkout-title" className="page__title">No hay nada que pagar todavía</h1>
        <p className="page__lead">Tu pedido está vacío. Prepara una {BRAND.productNoun} o elige una ya preparada.</p>
        <div className="page__actions">
          <a className="btn btn--primary btn--lg" {...linkTo(ROUTES.grimorio)}>Abrir el Grimorio</a>
          <a className="btn btn--ghost" {...linkTo(ROUTES.productos)}>Ver {BRAND.productNounPlural} preparadas</a>
        </div>
      </section>
    )
  }

  const totals = cartTotals(cart, { zip: form.zip })
  const natalSlots = natalChartSlots(cart)
  const setNatalField = (slot, i, part) => (e) => {
    const value = e.target.value
    setNatal((n) => ({ ...n, [slot.id]: { ...n[slot.id], [part]: value } }))
    const key = natalField(i, part)
    if (errors[key]) setErrors((errs) => ({ ...errs, [key]: undefined }))
  }
  const set = (field) => (e) => {
    const value = e.target.value
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((errs) => ({ ...errs, [field]: undefined }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const found = { ...validate(form), ...validateNatal(natalSlots, natal) }
    setErrors(found)
    // En el orden del formulario: contacto, envío y después las Cartas natales.
    const order = [...FIELD_ORDER, ...natalSlots.flatMap((_, i) => [natalField(i, 'name'), natalField(i, 'birthDate')])]
    const first = order.find((f) => found[f])
    if (first) {
      formRef.current?.querySelector(`[name="${first}"]`)?.focus()
      return
    }
    setStatus('sending')
    try {
      const customer = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        notes: form.notes.trim(),
        address:
          form.deliveryMethod === 'envio'
            ? { street: form.street.trim(), neighborhood: form.neighborhood.trim(), city: form.city.trim(), state: form.state.trim(), zip: form.zip.trim() }
            : null,
      }
      const placed = await submitOrder({
        items: cart,
        customer,
        deliveryMethod: form.deliveryMethod,
        paymentMethod: form.paymentMethod,
        natalCharts: natal,
      })
      setStatus('done')
      actions.orderPlaced(placed)
      navigate(ROUTES.confirmacion)
    } catch {
      setStatus('error')
    }
  }

  const field = (name, label, props = {}) => (
    <div className={`field${errors[name] ? ' has-error' : ''}`}>
      <label htmlFor={`f-${name}`}>
        {label}
        {props.optional && <span className="field__optional"> (opcional)</span>}
      </label>
      <input
        id={`f-${name}`}
        name={name}
        value={form[name]}
        onChange={set(name)}
        aria-invalid={errors[name] ? 'true' : undefined}
        aria-describedby={errors[name] ? `e-${name}` : props.help ? `h-${name}` : undefined}
        required={!props.optional}
        type={props.type ?? 'text'}
        autoComplete={props.autoComplete}
        inputMode={props.inputMode}
        maxLength={FIELD_MAX[name]}
      />
      {props.help && !errors[name] && (
        <p className="field__help" id={`h-${name}`}>
          {props.help}
        </p>
      )}
      {errors[name] && (
        <p className="field__error" id={`e-${name}`}>
          {errors[name]}
        </p>
      )}
    </div>
  )

  const errorCount = Object.values(errors).filter(Boolean).length
  const today = todayISO()
  // La sección de la Carta natal solo existe si el pedido la lleva: la numeración se ajusta.
  const paymentNumber = natalSlots.length > 0 ? 4 : 3

  return (
    <section className="page" aria-labelledby="checkout-title">
      <header className="page__header">
        <p className="page__kicker">Último paso</p>
        <h1 id="checkout-title" className="page__title">Sella tu pedido</h1>
        <p className="page__lead">Completa tus datos. Los campos marcados como opcionales puedes dejarlos vacíos.</p>
        <ol className="checkout-steps" aria-label="Pasos de la compra">
          <li className="is-done">Tu pedido</li>
          <li className="is-current" aria-current="step">Datos y envío</li>
          <li>{whatsappReady() ? 'Enviar por WhatsApp' : 'Resumen'}</li>
        </ol>
        <ChapterDivider className="page__divider" />
      </header>

      <div className="checkout">
        <form ref={formRef} className="checkout__form" onSubmit={onSubmit} noValidate>
          {errorCount > 0 && (
            <p className="form-alert" role="alert">
              Revisa {errorCount === 1 ? 'un dato marcado' : `${errorCount} datos marcados`} en rojo para continuar.
            </p>
          )}

          <fieldset className="parchment-panel form-section">
            <legend className="panel-title">1. ¿Quién recibe?</legend>
            {field('name', 'Nombre completo', { autoComplete: 'name' })}
            <div className="field-row">
              {field('phone', 'Teléfono / WhatsApp', { type: 'tel', autoComplete: 'tel', inputMode: 'tel', help: 'Te escribiremos aquí para confirmar.' })}
              {field('email', 'Correo electrónico', { type: 'email', autoComplete: 'email', optional: true })}
            </div>
          </fieldset>

          <fieldset className="parchment-panel form-section">
            <legend className="panel-title">2. ¿Cómo lo recibes?</legend>
            {DELIVERY_METHODS.map((m) => (
              <div key={m.id} className="shipping-box">
                <p className="option__title">{m.name}</p>
                <p className="option__detail">{m.detail}</p>
                <p className="shipping-box__tier">
                  Tamaño estimado del paquete: <strong>{totals.shipping.label}</strong> ·{' '}
                  {totals.shipping.pending ? 'costo por cotizar' : formatPrice(totals.shipping.price)}
                </p>
              </div>
            ))}
            {form.deliveryMethod === 'envio' && (
              <div className="address">
                {field('street', 'Calle y número', { autoComplete: 'address-line1' })}
                <div className="field-row">
                  {field('neighborhood', 'Colonia', { autoComplete: 'address-line2' })}
                  {field('zip', 'Código postal', { autoComplete: 'postal-code', inputMode: 'numeric' })}
                </div>
                <div className="field-row">
                  {field('city', 'Ciudad o municipio', { autoComplete: 'address-level2' })}
                  {field('state', 'Estado', { autoComplete: 'address-level1' })}
                </div>
              </div>
            )}
          </fieldset>

          {natalSlots.length > 0 && (
            <fieldset className="parchment-panel form-section">
              <legend className="panel-title">3. Datos para tu Carta natal</legend>
              <p className="form-section__help">
                Escribe los datos de la persona para quien se hará la Carta natal. Puede ser alguien distinto de quien
                compra o recibe el paquete. Se incluirán en tu pedido para preparar la carta.
              </p>
              {natalSlots.map((slot, i) => {
                const data = natal[slot.id] ?? {}
                const nameKey = natalField(i, 'name')
                const dateKey = natalField(i, 'birthDate')
                const included = recipeExtras(slot.item).find((e) => e.needsBirthData)?.included
                return (
                  <div key={slot.id} className="natal-chart" role="group" aria-labelledby={`natal-${i}-title`}>
                    <p className="natal-chart__title" id={`natal-${i}-title`}>
                      Carta natal{natalSlots.length > 1 ? ` ${i + 1}` : ''}
                      <span className="natal-chart__for">
                        {slot.item.name}
                        {slot.of > 1 && ` (pieza ${slot.index} de ${slot.of})`}
                        {included && ` · incluida con ${getSize(slot.item.size)?.name}`}
                      </span>
                    </p>
                    <div className={`field${errors[nameKey] ? ' has-error' : ''}`}>
                      <label htmlFor={`f-${nameKey}`}>Nombre completo para la Carta natal</label>
                      <input
                        id={`f-${nameKey}`}
                        name={nameKey}
                        type="text"
                        value={data.name ?? ''}
                        onChange={setNatalField(slot, i, 'name')}
                        required
                        autoComplete="off"
                        maxLength={FIELD_MAX.natalName}
                        aria-invalid={errors[nameKey] ? 'true' : undefined}
                        aria-describedby={errors[nameKey] ? `e-${nameKey}` : undefined}
                      />
                      {errors[nameKey] && (
                        <p className="field__error" id={`e-${nameKey}`}>
                          {errors[nameKey]}
                        </p>
                      )}
                    </div>
                    <div className={`field field--date${errors[dateKey] ? ' has-error' : ''}`}>
                      <label htmlFor={`f-${dateKey}`}>Fecha de nacimiento</label>
                      <input
                        id={`f-${dateKey}`}
                        name={dateKey}
                        type="date"
                        value={data.birthDate ?? ''}
                        onChange={setNatalField(slot, i, 'birthDate')}
                        required
                        autoComplete="off"
                        min={MIN_BIRTH_DATE}
                        max={today}
                        aria-invalid={errors[dateKey] ? 'true' : undefined}
                        aria-describedby={errors[dateKey] ? `e-${dateKey}` : undefined}
                      />
                      {errors[dateKey] && (
                        <p className="field__error" id={`e-${dateKey}`}>
                          {errors[dateKey]}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </fieldset>
          )}

          <fieldset className="parchment-panel form-section">
            <legend className="panel-title">{paymentNumber}. ¿Cómo prefieres pagar?</legend>
            <p className="form-section__help">
              Estamos configurando las formas de pago. Elige tu preferencia y te confirmaremos cómo pagar.
            </p>
            <div className="option-list">
              {PAYMENT_METHODS.map((m) => (
                <label key={m.id} className={`option${form.paymentMethod === m.id ? ' is-selected' : ''}`}>
                  <input type="radio" name="paymentMethod" value={m.id} checked={form.paymentMethod === m.id} onChange={set('paymentMethod')} />
                  <span className="option__body">
                    <span className="option__title">
                      {m.name} {!m.ready && <PendingTag status="Por confirmar">Por confirmar</PendingTag>}
                    </span>
                    <span className="option__detail">{m.detail}</span>
                  </span>
                </label>
              ))}
            </div>
            <div className="field">
              <label htmlFor="f-notes">
                Notas para tu pedido <span className="field__optional">(opcional)</span>
              </label>
              <textarea id="f-notes" name="notes" rows="3" maxLength={FIELD_MAX.notes} value={form.notes} onChange={set('notes')} placeholder="Por ejemplo: un horario para recibir o alguna preferencia." />
            </div>
          </fieldset>

          {status === 'error' && (
            <p className="form-alert" role="alert">
              No pudimos registrar tu pedido. Inténtalo de nuevo en unos minutos.
            </p>
          )}

          <p className="checkout__legal">
            Antes de continuar, consulta nuestro <LegalLink route={ROUTES.privacidad}>Aviso de Privacidad</LegalLink> y
            los <LegalLink route={ROUTES.terminos}>Términos y Condiciones</LegalLink>.
          </p>

          <button type="submit" className="btn btn--primary btn--xl btn--block" disabled={status === 'sending'}>
            {status === 'sending' ? 'Preparando tu resumen…' : `Continuar · ${formatPrice(totals.total)}`}
          </button>
          <p className="checkout__fineprint">
            <strong>
              {whatsappReady()
                ? `Al continuar, tu pedido aún no se envía: en el siguiente paso lo mandarás por WhatsApp a ${BRAND.witch}.`
                : `Al continuar verás el resumen de tu pedido. Todavía no se enviará ni lo recibirá ${BRAND.witch}.`}
            </strong>{' '}
            Aún no se hace ningún cargo. Te confirmaremos el costo de envío y la forma de pago antes de preparar tu{' '}
            {BRAND.productNoun}.
          </p>
        </form>

        <aside className="checkout__summary parchment-panel" aria-labelledby="checkout-summary-title">
          <h2 id="checkout-summary-title" className="panel-title">Tu pedido</h2>
          <ul className="mini-summary">
            {cart.map((item) => (
              <li key={item.key}>
                <span className="mini-summary__name">
                  {item.quantity} × {item.name}
                  <span className="mini-summary__extras">
                    {formatPrice(itemUnitPrice(item))} c/u
                    {recipeExtras(item).length > 0 &&
                      ` · Con ${recipeExtras(item).map((e) => (e.included ? `${e.name} (incluida)` : e.name)).join(', ')}`}
                    {item.dedication?.forWhom === 'gift' && ` · Regalo (dedicatoria: ${dedicationLabel(item.dedication).toLowerCase()})`}
                  </span>
                </span>
                <span>{formatPrice(itemUnitPrice(item) * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <OrderTotals totals={totals} />
          <a className="btn btn--text" {...linkTo(ROUTES.carrito)}>
            Modificar mi pedido
          </a>
        </aside>
      </div>
    </section>
  )
}
