import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

export const PAGE_W = 794
export const PAGE_H = 1123

/** Shows a fixed-size page at a fixed scale. */
export function ScaledPage({ scale, children, className = '' }: { scale: number; children: ReactNode; className?: string }) {
  return (
    <div className={className} style={{ width: PAGE_W * scale, height: PAGE_H * scale, position: 'relative', overflow: 'hidden' }}>
      <div style={{ width: PAGE_W, height: PAGE_H, transform: `scale(${scale})`, transformOrigin: 'top left' }}>{children}</div>
    </div>
  )
}

const useIsoLayout = typeof window === 'undefined' ? useEffect : useLayoutEffect

/** Scales a fixed-size page to fit its container (optionally also limited by viewport height). */
export function FitPage({ children, fitHeight = 0, maxScale = 1.2 }: { children: ReactNode; fitHeight?: number; maxScale?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.6)
  useIsoLayout(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      const w = el.clientWidth || PAGE_W
      let s = w / PAGE_W
      if (fitHeight) s = Math.min(s, Math.max(0.3, (window.innerHeight - fitHeight) / PAGE_H))
      setScale(Math.min(maxScale, s))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [fitHeight, maxScale])
  return (
    <div ref={ref} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <ScaledPage scale={scale} className="page-shadow">{children}</ScaledPage>
    </div>
  )
}

/** Scales an arbitrary fixed-size composition down to fit its container's width. */
export function FitBox({ width, height, children }: { width: number; height: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  useIsoLayout(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setScale(Math.min(1, (el.clientWidth || width) / width))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [width])
  return (
    <div ref={ref} style={{ width: '100%' }}>
      <div style={{ width: width * scale, height: height * scale, position: 'relative', margin: '0 auto' }}>
        <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', left: 0, top: 0 }}>{children}</div>
      </div>
    </div>
  )
}
