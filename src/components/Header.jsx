import { useEffect, useRef, useState } from 'react'
import { BRAND } from '../config/brand.js'
import { cycleFocus, inertOutside } from '../lib/focus.js'
import { linkTo, ROUTES } from '../lib/router.js'
import { useShop } from '../state/ShopContext.jsx'
import { CartIcon, MenuIcon } from './illustrations/Ornaments.jsx'
import { BrandMark } from './BrandMark.jsx'
import { SoundToggle } from './SoundToggle.jsx'

const LINKS = [
  // En escritorio "Inicio" se oculta: el logo ya lleva al inicio. Sigue en el menú del celular.
  { path: ROUTES.inicio, label: 'Inicio', mobileOnly: true },
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

  const headerRef = useRef(null)
  const navRef = useRef(null)
  const toggleRef = useRef(null)

  // Cierra el menú del celular al navegar.
  useEffect(() => setOpen(false), [path])

  // Con el menú abierto, la página de detrás queda inerte y Tab recorre solo
  // el botón del menú y sus enlaces. Escape lo cierra y devuelve el foco al botón.
  useEffect(() => {
    if (!open) return undefined
    const restore = inertOutside(headerRef.current)
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
        return
      }
      cycleFocus(e, [toggleRef.current, ...navRef.current.querySelectorAll('a[href]')])
    }
    // Si la ventana se ensancha hasta el menú de escritorio (1240 px, layout.css), el menú se cierra.
    const desktop = window.matchMedia('(min-width: 1240px)')
    const onWide = () => desktop.matches && setOpen(false)
    window.addEventListener('keydown', onKey)
    desktop.addEventListener('change', onWide)
    return () => {
      restore()
      window.removeEventListener('keydown', onKey)
      desktop.removeEventListener('change', onWide)
    }
  }, [open])

  return (
    <header className="site-header" ref={headerRef}>
      <div className="site-header__inner">
        <a
          className="brand"
          aria-label={`${BRAND.name}: ir al inicio`}
          aria-current={path === ROUTES.inicio ? 'page' : undefined}
          {...linkTo(ROUTES.inicio)}
        >
          <BrandMark className="brand__sigil" />
          <span className="brand__name">{BRAND.name}</span>
        </a>

        <nav
          ref={navRef}
          className={`site-nav${open ? ' is-open' : ''}`}
          id="site-nav"
          aria-label="Principal"
          // Elegir un enlace cierra el menú, también si lleva a la página en la que ya estás.
          onClick={(e) => e.target.closest('a') && setOpen(false)}
        >
          <ul>
            {LINKS.map((link) => (
              <li key={link.path} className={link.mobileOnly ? 'site-nav__item--mobile' : undefined}>
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
            ref={toggleRef}
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
