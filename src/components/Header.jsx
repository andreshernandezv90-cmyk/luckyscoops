import { useEffect, useState } from 'react'
import { BRAND } from '../config/brand.js'
import { linkTo, ROUTES } from '../lib/router.js'
import { useShop } from '../state/ShopContext.jsx'
import { CartIcon, MenuIcon } from './illustrations/Ornaments.jsx'
import { BrandMark } from './BrandMark.jsx'
import { SoundToggle } from './SoundToggle.jsx'

const LINKS = [
  { path: ROUTES.inicio, label: 'Inicio' },
  { path: ROUTES.grimorio, label: 'Abrir Grimorio', featured: true },
  { path: ROUTES.productos, label: BRAND.productNounPlural },
  { path: ROUTES.significados, label: 'Significados' },
  { path: ROUTES.bruja, label: 'La Bruja Sabia' },
  { path: ROUTES.videos, label: 'Videos' },
  { path: ROUTES.faq, label: 'Preguntas' },
  { path: ROUTES.contacto, label: 'Contacto' },
]

export function Header({ path }) {
  const { totals } = useShop()
  const [open, setOpen] = useState(false)

  // Cierra el menú del celular al navegar o con Escape.
  useEffect(() => setOpen(false), [path])
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="brand" {...linkTo(ROUTES.inicio)}>
          <BrandMark className="brand__sigil" />
          <span className="brand__name">{BRAND.name}</span>
        </a>

        <nav className={`site-nav${open ? ' is-open' : ''}`} id="site-nav" aria-label="Principal">
          <ul>
            {LINKS.map((link) => (
              <li key={link.path}>
                <a
                  className={`site-nav__link${link.featured ? ' site-nav__link--featured' : ''}`}
                  aria-current={path === link.path ? 'page' : undefined}
                  {...linkTo(link.path)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__actions">
          <SoundToggle />
          <a
            className="cart-link"
            aria-current={path === ROUTES.carrito ? 'page' : undefined}
            aria-label={`Carrito: tu pedido, ${totals.count} ${totals.count === 1 ? 'producto' : 'productos'}`}
            {...linkTo(ROUTES.carrito)}
          >
            <CartIcon className="cart-link__icon" />
            <span className="cart-link__label">Tu pedido</span>
            {totals.count > 0 && (
              <span key={totals.count} className="cart-link__badge" aria-hidden="true">
                {totals.count}
              </span>
            )}
          </a>
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="site-nav"
            onClick={() => setOpen((o) => !o)}
          >
            <MenuIcon open={open} />
            <span className="sr-only">{open ? 'Cerrar menú' : 'Abrir menú'}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
