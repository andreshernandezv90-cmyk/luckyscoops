import { CornerFlourish, InkBlot } from './illustrations/Ornaments.jsx'

/**
 * Página del grimorio: pergamino con esquinas ornamentales y alguna mancha de tinta.
 * side: 'left' | 'right' | 'full' (página desplegada para el ritual).
 */
export function BookPage({ side = 'left', tone = 'parchment', className = '', children, ...rest }) {
  return (
    <div className={`book-page book-page--${side} book-page--${tone} ${className}`} {...rest}>
      <CornerFlourish className="book-page__corner book-page__corner--tl" />
      <CornerFlourish className="book-page__corner book-page__corner--tr" />
      <CornerFlourish className="book-page__corner book-page__corner--bl" />
      <CornerFlourish className="book-page__corner book-page__corner--br" />
      {tone === 'parchment' && <InkBlot className={`book-page__blot book-page__blot--${side}`} variant={side === 'right' ? 1 : 0} />}
      <div className="book-page__content">{children}</div>
    </div>
  )
}
