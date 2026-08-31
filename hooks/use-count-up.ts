import * as React from "react"

import { useReducedMotion } from "@/hooks/use-reduced-motion"

type Options = {
  delay?: number
  duration?: number
  format?: (value: number) => string
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

const defaultFormat = (value: number) => Math.round(value).toLocaleString("pt-BR")

// Conta de 0 até `target` uma única vez, na primeira vez que `target` deixa de ser
// null/undefined. Qualquer atualização depois disso (refetch em background) só
// atualiza o valor exibido direto, sem repetir a animação.
export function useCountUp(target: number | null | undefined, options: Options = {}) {
  const { delay = 0, duration = 1050, format = defaultFormat } = options
  const reducedMotion = useReducedMotion()
  const hasPlayedRef = React.useRef(false)
  const [display, setDisplay] = React.useState(() => format(0))

  React.useEffect(() => {
    if (target == null) return

    if (hasPlayedRef.current || reducedMotion) {
      hasPlayedRef.current = true
      setDisplay(format(target))
      return
    }

    hasPlayedRef.current = true
    const targetValue = target
    let rafId: number
    const timeoutId = setTimeout(() => {
      const start = performance.now()
      function tick(now: number) {
        const progress = Math.min(1, (now - start) / duration)
        setDisplay(format(targetValue * easeOutCubic(progress)))
        if (progress < 1) {
          rafId = requestAnimationFrame(tick)
        }
      }
      rafId = requestAnimationFrame(tick)
    }, delay)

    return () => {
      clearTimeout(timeoutId)
      if (rafId) cancelAnimationFrame(rafId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])

  return display
}
