/**
 * Ayudas de foco para capas que se abren encima de la página (el menú del celular).
 */

/**
 * Vuelve inerte todo lo que está fuera de `keep`: no recibe foco, clics ni
 * lectura de pantalla. Recorre los antepasados de `keep` hasta <body> y marca
 * sus hermanos. Devuelve la función que lo deshace; respeta lo que ya era inerte.
 */
export function inertOutside(keep) {
  const marked = []
  for (let node = keep; node && node !== document.body; node = node.parentElement) {
    for (const sibling of node.parentElement?.children ?? []) {
      if (sibling === node || sibling.inert) continue
      sibling.inert = true
      marked.push(sibling)
    }
  }
  return () => marked.forEach((el) => (el.inert = false))
}

/**
 * Mantiene Tab y Mayús+Tab dentro de `items` (en ese orden), dando la vuelta
 * al llegar a un extremo. Pensado para usarse en un manejador de keydown.
 */
export function cycleFocus(event, items) {
  const visible = items.filter((el) => el && el.getClientRects().length > 0)
  if (event.key !== 'Tab' || visible.length === 0) return
  const i = visible.indexOf(document.activeElement)
  const next = event.shiftKey ? (i <= 0 ? visible.length - 1 : i - 1) : i === visible.length - 1 ? 0 : i + 1
  event.preventDefault()
  visible[next].focus()
}
