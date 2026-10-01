import { useEffect, useState } from 'react'

/**
 * Enrutador mínimo basado en el hash (#/ruta). No requiere configuración del
 * servidor, así que el sitio puede publicarse en cualquier hosting estático.
 */
export const ROUTES = {
  inicio: '/',
  grimorio: '/grimorio',
  productos: '/scoops',
  significados: '/significados',
  bruja: '/la-bruja-sabia',
  videos: '/videos',
  envios: '/envios-y-pagos',
  faq: '/preguntas',
  contacto: '/contacto',
  carrito: '/carrito',
  pago: '/pago',
  confirmacion: '/confirmacion',
}

/** Rutas que muestran la página de inicio desplazada a una sección (valor = id de la sección). */
export const HOME_SECTIONS = {
  [ROUTES.productos]: 'scoops',
  [ROUTES.significados]: 'significados',
  [ROUTES.bruja]: 'bruja-sabia',
  [ROUTES.videos]: 'videos',
  [ROUTES.envios]: 'envios-y-pagos',
  [ROUTES.faq]: 'preguntas',
  [ROUTES.contacto]: 'contacto',
}

const currentPath = () => window.location.hash.replace(/^#/, '') || '/'

export function navigate(path) {
  if (currentPath() === path) {
    // Misma ruta: volvemos a disparar el evento para que se repita el desplazamiento.
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  } else {
    window.location.hash = path
  }
}

export function useRoute() {
  const [route, setRoute] = useState(() => ({ path: currentPath(), stamp: 0 }))
  useEffect(() => {
    const onChange = () => setRoute((r) => ({ path: currentPath(), stamp: r.stamp + 1 }))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

/** Props para un <a> que navega con el enrutador. */
export const linkTo = (path) => ({
  href: `#${path}`,
  onClick: (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
    event.preventDefault()
    navigate(path)
  },
})
