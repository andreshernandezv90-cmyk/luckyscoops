import { useSyncExternalStore } from 'react'
import { isSoundOn, setSoundOn, subscribeSound } from '../lib/sound.js'

/** Botón global de sonido. Empieza en "Silencio"; nunca suena nada sin que la persona lo active. */
export function SoundToggle() {
  const on = useSyncExternalStore(subscribeSound, isSoundOn, () => false)
  return (
    <button
      type="button"
      className={`sound-toggle${on ? ' is-on' : ''}`}
      aria-pressed={on}
      onClick={() => setSoundOn(!on)}
      title={on ? 'Silenciar efectos de sonido' : 'Activar efectos de sonido sutiles'}
    >
      <svg className="sound-toggle__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 9.5 H7.5 L12 5.5 V18.5 L7.5 14.5 H4 Z" fill="currentColor" />
        {on ? (
          <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M15 9.2 Q16.6 12 15 14.8" />
            <path d="M17.6 7 Q20.8 12 17.6 17" />
          </g>
        ) : (
          <path d="M15.5 9.5 L20 14 M20 9.5 L15.5 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        )}
      </svg>
      {/* El nombre no cambia; el estado lo dan el ícono y aria-pressed. */}
      <span className="sound-toggle__label">Sonido</span>
    </button>
  )
}
