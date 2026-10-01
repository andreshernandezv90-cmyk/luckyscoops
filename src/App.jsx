import { useEffect, useRef } from 'react'
import { MotionConfig } from 'motion/react'
import { BRAND } from './config/brand.js'
import { HOME_SECTIONS, ROUTES, useRoute } from './lib/router.js'
import { ShopProvider } from './state/ShopContext.jsx'
import { Header } from './components/Header.jsx'
import { Footer } from './components/Footer.jsx'
import { Home } from './components/home/Home.jsx'
import { Grimorio } from './components/Grimorio.jsx'
import { Cart } from './components/Cart.jsx'
import { Checkout } from './components/Checkout.jsx'
import { OrderComplete } from './components/OrderComplete.jsx'

const PAGES = {
  [ROUTES.grimorio]: { title: BRAND.grimoireTitle, Component: Grimorio },
  [ROUTES.carrito]: { title: 'Tu pedido', Component: Cart },
  [ROUTES.pago]: { title: 'Finalizar compra', Component: Checkout },
  [ROUTES.confirmacion]: { title: 'Pedido confirmado', Component: OrderComplete },
}

export default function App() {
  const { path, stamp } = useRoute()
  const page = PAGES[path]
  const mainRef = useRef(null)
  const firstRender = useRef(true)

  useEffect(() => {
    document.title = page ? `${page.title} · ${BRAND.name}` : `${BRAND.name} · ${BRAND.grimoireTitle}`
    if (!HOME_SECTIONS[path]) {
      window.scrollTo(0, 0)
      // Al cambiar de página, el foco va al contenido para lectores de pantalla.
      if (!firstRender.current) mainRef.current?.focus({ preventScroll: true })
    }
    firstRender.current = false
  }, [path, page, stamp])

  return (
    <MotionConfig reducedMotion="user">
      <ShopProvider>
        <a className="skip-link" href="#contenido" onClick={(e) => { e.preventDefault(); mainRef.current?.focus() }}>
          Saltar al contenido
        </a>
        <Header path={path} />
        <main id="contenido" ref={mainRef} tabIndex={-1} className={`site-main${path === ROUTES.grimorio ? ' site-main--grimorio' : ''}`}>
          {page ? <page.Component /> : <Home section={HOME_SECTIONS[path]} stamp={stamp} />}
        </main>
        <Footer />
      </ShopProvider>
    </MotionConfig>
  )
}
