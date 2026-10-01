import { BRAND } from '../config/brand.js'
import { linkTo, ROUTES } from '../lib/router.js'
import { BrandSigil, ChapterDivider } from './illustrations/Ornaments.jsx'

export function Footer() {
  const year = new Date().getFullYear()
  const { contact } = BRAND
  return (
    <footer className="site-footer">
      <ChapterDivider className="site-footer__divider" />
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <BrandSigil className="site-footer__sigil" />
          <p className="site-footer__name">{BRAND.name}</p>
          <p className="site-footer__tagline">{BRAND.tagline}</p>
        </div>
        <nav aria-label="Pie de página">
          <h2 className="site-footer__title">La tienda</h2>
          <ul>
            <li><a {...linkTo(ROUTES.grimorio)}>Prepara tu {BRAND.productNoun}</a></li>
            <li><a {...linkTo(ROUTES.productos)}>{BRAND.productNounPlural} preparadas</a></li>
            <li><a {...linkTo(ROUTES.faq)}>Preguntas frecuentes</a></li>
            <li><a {...linkTo(ROUTES.carrito)}>Carrito</a></li>
          </ul>
        </nav>
        <div>
          <h2 className="site-footer__title">Contacto</h2>
          <ul>
            <li><a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp {contact.whatsappDisplay}</a></li>
            <li><a href={`mailto:${contact.email}`}>{contact.email}</a></li>
            <li><a href={`https://instagram.com/${contact.instagram}`} target="_blank" rel="noreferrer">Instagram @{contact.instagram}</a></li>
            <li>{contact.hours}</li>
          </ul>
        </div>
      </div>
      <p className="site-footer__legal">
        © {year} {BRAND.name}. Hecho a mano en {BRAND.foundedIn}. Nuestros productos son de uso simbólico y decorativo.
      </p>
    </footer>
  )
}
