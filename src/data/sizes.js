import { PRICES } from './prices.js'

/**
 * Tamaños (Capítulo II): se presentan como niveles de intensidad.
 * `essence` es el color de la segunda poción que se añade durante el ritual.
 */
export const SIZES = [
  {
    id: 'aprendiz',
    name: 'Aprendiz',
    level: 'Primer círculo',
    label: 'Chica',
    description: 'Una mezcla ligera para comenzar tu práctica.',
    contents: 'Frasco de 120 g · 5 a 7 piezas',
    moon: 'crescent',
    fill: 0.4,
    essence: '#cfd6e0',
    essenceName: 'plata lunar',
  },
  {
    id: 'hechicera',
    name: 'Hechicera',
    level: 'Segundo círculo',
    label: 'Mediana',
    description: 'El equilibrio justo entre cantidad e intensidad.',
    contents: 'Frasco de 250 g · 9 a 12 piezas',
    moon: 'half',
    fill: 0.68,
    essence: '#d98a3d',
    essenceName: 'cobre ardiente',
  },
  {
    id: 'gran_bruja',
    name: 'Gran Bruja',
    level: 'Tercer círculo',
    label: 'Grande',
    description: 'Una mezcla más poderosa, abundante y completa.',
    contents: 'Frasco de 450 g · 15 a 20 piezas',
    moon: 'full',
    fill: 0.95,
    essence: '#e8b934',
    essenceName: 'oro antiguo',
  },
].map((size) => ({ ...size, price: PRICES.sizes[size.id] }))

export const getSize = (id) => SIZES.find((s) => s.id === id) ?? null
