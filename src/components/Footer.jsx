import { BRAND, contactLinks } from '../config/brand.js'
import { SHOW_PENDING } from '../config/env.js'
import { linkTo, ROUTES } from '../lib/router.js'
import { BrandMark } from './BrandMark.jsx'
import { ChapterDivider } from './illustrations/Ornaments.jsx'
import { PendingTag } from './PendingTag.jsx'

export function Footer() {
  const year = new Date().getFullYear()
  const links = contactLinks()
  return (
    <footer className="site-footer">
      <ChapterDivider className="site-footer__divider" />
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          {BRAND.logo ? (
            <>
              <BrandMark variant="full" className="site-footer__logo" />
              <p className="sr-only">{BRAND.name}</p>
            </>
          ) : (
            <>
              <BrandMark className="site-footer__sigil" />
              <p className="site-footer__name">{BRAND.name}</p>
            </>
          )}
          <p className="site-footer__tagline">{BRAND.motto}</p>
        </div>
        <nav aria-label="Pie de página">
          <h2 className="site-footer__title">La tienda</h2>
          <ul>
            <li><a {...linkTo(ROUTES.grimorio)}>Abrir el Grimorio</a></li>
            <li><a {...linkTo(ROUTES.productos)}>{BRAND.productNounPlural} preparadas</a></li>
            <li><a {...linkTo(ROUTES.significados)}>Significados</a></li>
            <li><a {...linkTo(ROUTES.envios)}>Envíos y pagos</a></li>
            <li><a {...linkTo(ROUTES.faq)}>Preguntas frecuentes</a></li>
            <li><a {...linkTo(ROUTES.carrito)}>Tu pedido</a></li>
          </ul>
        </nav>
        {/* En la versión publicada, la columna solo aparece si hay algún dato de contacto real. */}
        {(SHOW_PENDING || Object.values(links).some(Boolean)) && (
          <div>
            <h2 className="site-footer__title">Síguenos y escríbenos</h2>
            <ul>
              {links.whatsapp ? (
                <li><a href={links.whatsapp} target="_blank" rel="noreferrer">WhatsApp</a></li>
              ) : (
                SHOW_PENDING && <li>WhatsApp <PendingTag /></li>
              )}
              {links.tiktok ? (
                <li><a href={links.tiktok} target="_blank" rel="noreferrer">TikTok @{BRAND.contact.tiktok}</a></li>
              ) : (
                SHOW_PENDING && <li>TikTok <PendingTag /></li>
              )}
              {links.instagram && <li><a href={links.instagram} target="_blank" rel="noreferrer">Instagram @{BRAND.contact.instagram}</a></li>}
              {links.email && <li><a href={links.email}>{BRAND.contact.email}</a></li>}
            </ul>
          </div>
        )}
      </div>
      <p className="site-footer__legal">
        © {year} {BRAND.name}. Nuestros productos son de uso simbólico y decorativo.
      </p>
    </footer>
  )
}
