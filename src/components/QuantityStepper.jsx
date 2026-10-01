/** Selector de cantidad con botones grandes de − y +. */
export function QuantityStepper({ value, onChange, label = 'Cantidad', min = 1, max = 20 }) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button
        type="button"
        className="stepper__button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Quitar una"
      >
        <span aria-hidden="true">−</span>
      </button>
      <output className="stepper__value" aria-live="polite" aria-atomic="true">
        {value}
      </output>
      <button
        type="button"
        className="stepper__button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Agregar una"
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  )
}
