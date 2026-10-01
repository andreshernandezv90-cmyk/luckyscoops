import { PRICES } from './prices.js'

/**
 * Tamaños (Capítulo III), presentados como niveles de intensidad.
 * - `essence`: color de la segunda poción que se añade durante el ritual.
 * - `shippingUnits`: cuánto "ocupa" en un paquete; sirve para estimar el rango
 *   de envío (ver src/lib/shipping.js).
 * - `contents`: TODO / PENDIENTE: contenido o medidas reales (null = no se muestra).
 */
export const SIZES = [
  {
    id: 'aprendiz',
    name: 'Aprendiz',
    level: 'Primer círculo',
    label: 'Scoop pequeña',
    description: 'Una forma sencilla de conocer la experiencia de la Bruja Sabia.',
    contents: null,
    moon: 'crescent',
    fill: 0.4,
    essence: '#d6dbe6',
    essenceName: 'plata lunar',
    shippingUnits: 1,
  },
  {
    id: 'hechicera',
    name: 'Hechicera',
    level: 'Segundo círculo',
    label: 'Scoop intermedia',
    description: 'Una selección más completa con mayor variedad de artículos.',
    contents: null,
    moon: 'half',
    fill: 0.68,
    essence: '#f08ac0',
    essenceName: 'rosa encendido',
    shippingUnits: 2,
  },
  {
    id: 'gran_bruja',
    name: 'Gran Bruja',
    level: 'Tercer círculo',
    label: 'Scoop grande',
    description: 'La experiencia más completa del Grimorio.',
    contents: null,
    moon: 'full',
    fill: 0.95,
    essence: '#e8b934',
    essenceName: 'oro antiguo',
    shippingUnits: 3,
  },
].map((size) => ({ ...size, price: PRICES.sizes[size.id] }))

export const getSize = (id) => SIZES.find((s) => s.id === id) ?? null
