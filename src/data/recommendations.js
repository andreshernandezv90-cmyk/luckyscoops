/**
 * Recomendaciones del Grimorio (Capítulo III).
 * Para cada intención se sugiere un extra con una frase breve. Se pueden editar libremente.
 */
export const RECOMMENDATIONS = {
  amor: { extra: 'cristal', reason: 'Un cristal extra para acompañar tu intención de amor.' },
  proteccion: { extra: 'amuleto', reason: 'Un amuleto para llevar tu protección a todas partes.' },
  abundancia: { extra: 'amuleto', reason: 'Un amuleto para acompañar tu prosperidad.' },
  limpieza: { extra: 'cristal', reason: 'Un cristal extra para acompañar tu renovación.' },
}

/** Devuelve { extra, reason } para la receta, o null si no hay intención. */
export function recommendExtra({ intention } = {}) {
  return RECOMMENDATIONS[intention] ?? null
}
