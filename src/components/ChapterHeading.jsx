import { useEffect, useRef } from 'react'

/**
 * Título de capítulo. Cuando la persona cambia de capítulo, recibe el foco para
 * que lectores de pantalla y teclado continúen desde el inicio de la página nueva.
 */
export function ChapterHeading({ autoFocus = false, className = '', children }) {
  const ref = useRef(null)
  useEffect(() => {
    if (autoFocus) ref.current?.focus({ preventScroll: true })
    // Solo al montar: cada capítulo monta su propio título.
  }, [])
  return (
    <h2 ref={ref} tabIndex={-1} className={`chapter-heading ${className}`}>
      {children}
    </h2>
  )
}
