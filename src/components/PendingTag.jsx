import { SHOW_PENDING } from '../config/env.js'

/**
 * Marca visible para datos del negocio que aún no existen (contacto, historia,
 * fotos…). Búscala en el código con "PendingTag" o "PENDIENTE" para completarlos.
 *
 * Solo se ve en desarrollo. En la versión publicada no se muestra nada, salvo
 * que `status` traiga un texto que sí informa al cliente (p. ej. "Por cotizar"):
 * entonces se muestra ese texto como nota discreta, no como etiqueta pendiente.
 */
export function PendingTag({ children = 'Pendiente', status = null }) {
  if (SHOW_PENDING) return <span className="pending-tag">{children}</span>
  return status ? <span className="status-note">{status}</span> : null
}
