import { BRAND } from '../../config/brand.js'
import { SectionTitle } from './SectionTitle.jsx'

export function Contact() {
  const { contact } = BRAND
  const waText = encodeURIComponent(`Hola, ${BRAND.name}. Tengo una pregunta sobre las ${BRAND.productNounPlural}.`)
  return (
    <section className="section" id="contacto" aria-labelledby="contact-title">
      <SectionTitle id="contact-title" kicker="Escríbenos">
        Contacto
      </SectionTitle>
      <div className="contact">
        <div className="contact__card parchment-panel">
          <h3>¿Tienes una duda?</h3>
          <p>La forma más rápida de hablar con nosotros es por WhatsApp. Respondemos en horario de taller.</p>
          <a className="btn btn--primary btn--lg" href={`https://wa.me/${contact.whatsapp}?text=${waText}`} target="_blank" rel="noreferrer">
            Escribir por WhatsApp
          </a>
          <p className="contact__muted">{contact.hours}</p>
        </div>
        <dl className="contact__list">
          <div>
            <dt>WhatsApp</dt>
            <dd><a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noreferrer">{contact.whatsappDisplay}</a></dd>
          </div>
          <div>
            <dt>Correo</dt>
            <dd><a href={`mailto:${contact.email}`}>{contact.email}</a></dd>
          </div>
          <div>
            <dt>Instagram</dt>
            <dd><a href={`https://instagram.com/${contact.instagram}`} target="_blank" rel="noreferrer">@{contact.instagram}</a></dd>
          </div>
          <div>
            <dt>Taller (recoger pedidos)</dt>
            <dd>{contact.pickupAddress}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
