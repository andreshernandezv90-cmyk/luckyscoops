/**
 * Marca visible para datos del negocio que aún no existen (contacto, historia,
 * fotos…). Búscala en el código con "PendingTag" o "PENDIENTE" para completarlos.
 */
export function PendingTag({ children = 'Pendiente' }) {
  return <span className="pending-tag">{children}</span>
}
