import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Reproduce una lista de pasos con duración ({ duration } en ms).
 *
 *   index = -1            aún no empieza
 *   0 … steps.length-1    paso en curso
 *   index = steps.length  terminado (también al saltar)
 *
 * Los componentes solo leen `step` y pintan el estado correspondiente,
 * así que saltar la animación es tan simple como ir al final.
 */
export function useSequence(steps, { startFinished = false, onComplete } = {}) {
  const [index, setIndex] = useState(startFinished ? steps.length : -1)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete
  const completedRef = useRef(startFinished)

  useEffect(() => {
    if (index < 0 || index >= steps.length) return undefined
    const timer = setTimeout(() => setIndex((i) => i + 1), steps[index].duration)
    return () => clearTimeout(timer)
  }, [index, steps])

  useEffect(() => {
    if (index >= steps.length && !completedRef.current) {
      completedRef.current = true
      onCompleteRef.current?.()
    }
  }, [index, steps.length])

  const start = useCallback(() => {
    completedRef.current = false
    setIndex(0)
  }, [])
  const skip = useCallback(() => setIndex(steps.length), [steps.length])

  return {
    index,
    step: index >= 0 && index < steps.length ? steps[index] : null,
    started: index >= 0,
    playing: index >= 0 && index < steps.length,
    finished: index >= steps.length,
    start,
    skip,
  }
}
