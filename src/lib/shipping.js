import { PRICES } from '../data/prices.js'
import { getSize } from '../data/sizes.js'

/**
 * Envíos a toda la República Mexicana.
 *
 * Hoy solo se estima el RANGO del paquete (pequeño, mediano o grande) según
 * los tamaños de Scoop en el carrito. El precio de cada rango vive en
 * PRICES.shipping.tiers y está pendiente (null = "por cotizar").
 *
 * TODO / PENDIENTE: cuando haya tarifas reales o una paquetería, calcula aquí
 * el costo usando el código postal (`zip`), el peso y las dimensiones.
 */
export const SHIPPING_TIERS = ['pequeno', 'mediano', 'grande']

/** Unidades de paquete del carrito (Aprendiz = 1, Hechicera = 2, Gran Bruja = 3). */
export function packageUnits(items = []) {
  return items.reduce((sum, item) => sum + (getSize(item.size)?.shippingUnits ?? 1) * item.quantity, 0)
}

/** Rango del paquete según las unidades. Ajusta los límites cuando conozcas tus cajas reales. */
export function shippingTier(items = []) {
  const units = packageUnits(items)
  if (units === 0) return null
  if (units <= 1) return 'pequeno'
  if (units <= 3) return 'mediano'
  return 'grande'
}

/**
 * Estimación de envío.
 * @returns {{ tier: string|null, label: string|null, price: number|null, pending: boolean }}
 */
export function estimateShipping(items = [], options = {}) {
  // `options.zip` (código postal) se usará cuando exista una tarifa real o una paquetería.
  void options
  const tier = shippingTier(items)
  if (!tier) return { tier: null, label: null, price: 0, pending: false }
  const { label, price } = PRICES.shipping.tiers[tier]
  return { tier, label, price, pending: price === null }
}
