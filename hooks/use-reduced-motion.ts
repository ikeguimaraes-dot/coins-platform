import * as React from "react"

export function useReducedMotion() {
  const [reduced, setReduced] = React.useState(false)

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(query.matches)

    const listener = (event: MediaQueryListEvent) => setReduced(event.matches)
    query.addEventListener("change", listener)
    return () => query.removeEventListener("change", listener)
  }, [])

  return reduced
}
