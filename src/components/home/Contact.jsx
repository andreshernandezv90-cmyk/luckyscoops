import { BRAND, contactLinks } from '../../config/brand.js'
import { PendingTag } from '../PendingTag.jsx'
import { SectionTitle } from './SectionTitle.jsx'

/** Contacto. Solo muestra enlaces de los datos que ya existen en src/config/brand.js. */
export function Contact() {
  const { contact } = BRAND
  const links = contactLinks(`Hola, ${BRAND.witch}. Tengo una pregunta sobre las ${BRAND.productNounPlural}.`)
  const rows = [
    { label: 'WhatsApp', value: contact.whatsappDisplay ?? (links.whatsapp ? 'Escríbenos' : null), href: links.whatsapp },
    { label: 'TikTok', value: contact.tiktok && `@${contact.tiktok}`, href: links.tiktok },
    { label: 'Instagram', value: contact.instagram && `@${contact.instagram}`, href: links.instagram, optional: true },
    { label: 'Correo', value: contact.email, href: links.email, optional: true },
  ]
  return (
    <section className="section" id="contacto" aria-labelledby="contact-title">
      <SectionTitle id="contact-title" kicker="Escríbenos">
        Contacto
      </SectionTitle>
      <div className="contact">
        <div className="contact__card parchment-panel">
          <h3>¿Tienes una duda?</h3>
          <p>Escríbenos y la Bruja Sabia te responderá con gusto.</p>
          {links.whatsapp ? (
            <a className="btn btn--primary btn--lg" href={links.whatsapp} target="_blank" rel="noreferrer">
              Escribir por WhatsApp
            </a>
          ) : (
            <p className="pending-line">
              WhatsApp oficial <PendingTag />
            </p>
          )}
          {contact.hours && <p className="contact__muted">{contact.hours}</p>}
        </div>
        <dl className="contact__list">
          {rows
            .filter((row) => row.value || !row.optional)
            .map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>
                  {row.value && row.href ? (
                    <a href={row.href} target="_blank" rel="noreferrer">
                      {row.value}
                    </a>
                  ) : (
                    <PendingTag />
                  )}
                </dd>
              </div>
            ))}
        </dl>
      </div>
    </section>
  )
}
