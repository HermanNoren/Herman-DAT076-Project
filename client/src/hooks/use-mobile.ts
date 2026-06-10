import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * Tracks whether the viewport is below the mobile breakpoint (768px),
 * updating on resize. Used by the sidebar to switch layouts.
 *
 * @returns `true` on mobile-sized viewports.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
