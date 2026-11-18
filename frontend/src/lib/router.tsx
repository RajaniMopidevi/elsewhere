import { useCallback, useEffect, useState } from 'react'
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react'

/** A tiny History-API router (no dependency). Routes: /  /create  /journal  /sample */
const EVT = 'elsewhere:navigate'

export function navigate(to: string, opts: { replace?: boolean } = {}) {
  if (to === window.location.pathname + window.location.search) {
    window.scrollTo({ top: 0 })
    return
  }
  if (opts.replace) window.history.replaceState({}, '', to)
  else window.history.pushState({}, '', to)
  window.dispatchEvent(new Event(EVT))
  window.scrollTo({ top: 0 })
}

export function usePath(): string {
  const [path, setPath] = useState(window.location.pathname)
  useEffect(() => {
    const on = () => setPath(window.location.pathname)
    window.addEventListener('popstate', on)
    window.addEventListener(EVT, on)
    return () => {
      window.removeEventListener('popstate', on)
      window.removeEventListener(EVT, on)
    }
  }, [])
  return path
}

export function Link({ to, children, onClick, ...rest }: { to: string; children: ReactNode } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const handle = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e)
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      e.preventDefault()
      navigate(to)
    },
    [to, onClick],
  )
  return (
    <a href={to} onClick={handle} {...rest}>
      {children}
    </a>
  )
}
