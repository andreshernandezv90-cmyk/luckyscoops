import { BRAND } from '../config/brand.js'
import { PRICES } from './prices.js'

export const FAQ = [
  {
    q: `¿Qué es una ${BRAND.productNoun}?`,
    a: `Es un frasco con una mezcla artesanal de cristales, hierbas secas, sales y pequeños amuletos, seleccionada a mano según la intención que elijas. Cada ${BRAND.productNoun} es distinta: ningún frasco sale igual a otro.`,
  },
  {
    q: '¿Tengo que hacer el ritual del grimorio para comprar?',
    a: `No. El grimorio es una forma divertida de armar tu ${BRAND.productNoun}, pero también puedes comprar una de nuestras ${BRAND.productNounPlural} preparadas directamente, en un solo clic.`,
  },
  {
    q: '¿Cuánto tarda en llegar mi pedido?',
    a: 'Preparamos cada pedido en 1 a 2 días hábiles. El envío a domicilio tarda de 3 a 6 días hábiles según tu ciudad. Si eliges recoger en el taller, te avisamos por WhatsApp cuando esté listo.',
  },
  {
    q: '¿Cuánto cuesta el envío?',
    a: `El envío a todo México cuesta $${PRICES.shipping.standard} MXN y es gratis en pedidos desde $${PRICES.shipping.freeFrom} MXN. Recoger en el taller no tiene costo.`,
  },
  {
    q: '¿Cómo puedo pagar?',
    a: 'Por transferencia bancaria, con tarjeta mediante un enlace de pago seguro o en efectivo en tiendas OXXO. Al confirmar tu pedido te enviamos las instrucciones.',
  },
  {
    q: '¿Los productos tienen efectos garantizados?',
    a: 'Nuestras mezclas son objetos de uso simbólico y decorativo que acompañan tus rituales e intenciones personales. No sustituyen la atención médica, psicológica ni ningún consejo profesional.',
  },
]
