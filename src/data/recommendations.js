/**
 * Recomendaciones del Grimorio (Capítulo IV).
 * Para cada intención (y, si se quiere, para un enfoque concreto) se sugiere
 * un extra con una frase breve. Se pueden editar libremente.
 */
export const RECOMMENDATIONS = {
  amor: {
    default: { extra: 'cristal', reason: 'Un cristal extra para acompañar tu intención de amor.' },
    pareja: { extra: 'regalo', reason: 'Si vas a compartirla, una presentación especial para regalar.' },
    atraccion: { extra: 'amuleto', reason: 'Un amuleto para llevar contigo tu intención.' },
  },
  proteccion: {
    default: { extra: 'amuleto', reason: 'Un amuleto para llevar tu protección a todas partes.' },
    tranquilidad: { extra: 'cristal', reason: 'Un cristal extra para acompañar tu calma.' },
  },
  abundancia: {
    default: { extra: 'amuleto', reason: 'Un amuleto para acompañar tu prosperidad.' },
    trabajo: { extra: 'cristal', reason: 'Un cristal extra para tu espacio de trabajo.' },
    negocio: { extra: 'cristal', reason: 'Un cristal extra para tu negocio o tu caja.' },
  },
  limpieza: {
    default: { extra: 'cristal', reason: 'Un cristal extra para acompañar tu renovación.' },
    nuevos_comienzos: { extra: 'video', reason: 'Mira cómo se prepara el ritual de tu nuevo comienzo.' },
  },
}

/** Devuelve { extra, reason } para la receta, o null si no hay intención. */
export function recommendExtra({ intention, focus } = {}) {
  const table = RECOMMENDATIONS[intention]
  if (!table) return null
  return table[focus] ?? table.default ?? null
}
