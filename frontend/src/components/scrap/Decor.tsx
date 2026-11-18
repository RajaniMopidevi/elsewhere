import { useId } from 'react'
import type { CSSProperties, ReactNode } from 'react'

export const Tape = ({ className = '', style }: { className?: string; style?: CSSProperties }) => (
  <span className={`tape ${className}`} style={style} aria-hidden />
)

/** Round rubber stamp with text running around the edge. */
export function RoundStamp({ top, bottom, center, className = '', style }: { top: string; bottom?: string; center?: ReactNode; className?: string; style?: CSSProperties }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 140 140" className={`stamp-round ${className}`} style={style} aria-hidden focusable="false">
      <defs>
        <path id={`${id}t`} d="M70 70 m-50 0 a50 50 0 1 1 100 0" />
        <path id={`${id}b`} d="M70 70 m-50 0 a50 50 0 1 0 100 0" />
      </defs>
      <g filter="url(#rough)" fill="currentColor" stroke="currentColor">
        <circle cx="70" cy="70" r="64" fill="none" strokeWidth="3" />
        <circle cx="70" cy="70" r="36" fill="none" strokeWidth="1.5" />
        <text fontSize="13" fontFamily="'Special Elite', monospace" stroke="none" letterSpacing="2.5" textAnchor="middle">
          <textPath href={`#${id}t`} startOffset="50%">{top.toUpperCase().slice(0, 22)}</textPath>
        </text>
        {bottom && (
          <text fontSize="13" fontFamily="'Special Elite', monospace" stroke="none" letterSpacing="2.5" textAnchor="middle">
            <textPath href={`#${id}b`} startOffset="50%" dominantBaseline="hanging">{bottom.toUpperCase().slice(0, 22)}</textPath>
          </text>
        )}
        <text x="70" y="76" textAnchor="middle" fontSize="20" fontFamily="'Special Elite', monospace" stroke="none">{center}</text>
      </g>
    </svg>
  )
}

/** Perforated postage stamp. */
export function Postage({ children, value, className = '', style }: { children: ReactNode; value: string; className?: string; style?: CSSProperties }) {
  return (
    <div className={`postage ${className}`} style={style}>
      <div className="postage-in">
        {children}
        <span className="postage-val">{value}</span>
      </div>
    </div>
  )
}

export function Ticket({ title, lines, className = '', style }: { title: string; lines: string[]; className?: string; style?: CSSProperties }) {
  return (
    <div className={`ticket ${className}`} style={style}>
      <div className="ticket-main">
        <b>{title}</b>
        {lines.map((l, i) => <span key={i}>{l}</span>)}
      </div>
      <div className="ticket-stub">№{String(7000 + (title.length * 37 + lines.join('').length * 11) % 2999)}</div>
    </div>
  )
}

export function Compass({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={`compass ${className}`} aria-hidden focusable="false">
      <g filter="url(#rough)" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
        <circle cx="60" cy="60" r="8" />
        <path d="M60 14l9 37-9 9-9-9z" fill="var(--accent)" />
        <path d="M60 106l-9-37 9-9 9 9z" />
        <path d="M14 60l37-9 9 9-9 9z" />
        <path d="M106 60l-37 9-9-9 9-9z" />
        <path d="M30 30l14 14M90 30L76 44M30 90l14-14M90 90L76 76" />
      </g>
      <g fill="currentColor" fontFamily="'DM Serif Display', serif" fontSize="12" textAnchor="middle">
        <text x="60" y="10">N</text><text x="60" y="118">S</text><text x="8" y="64">W</text><text x="112" y="64">E</text>
      </g>
    </svg>
  )
}

/** Hand-drawn curly arrow. */
export function Arrow({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 90 60" className={`doodle ${className}`} style={style} aria-hidden focusable="false">
      <g filter="url(#rough)" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 12c24-8 54-2 62 24" />
        <path d="M58 30l10 8 6-12" />
      </g>
    </svg>
  )
}

export function Squiggle({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 160 14" preserveAspectRatio="none" className={`doodle ${className}`} style={style} aria-hidden focusable="false">
      <path filter="url(#rough)" d="M3 8q10-9 20 0t20 0 20 0 20 0 20 0 20 0 20 0 14 0" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

export function Star({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 40 40" className={`doodle ${className}`} style={style} aria-hidden focusable="false">
      <path filter="url(#rough)" d="M20 3l4.5 11.5L37 15l-9.5 8 3 12.5L20 28l-10.5 7.5 3-12.5L3 15l12.5-.5z" fill="var(--accent)" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

/** Tiny wavy-looking "needs verification" tag. */
export const VerifyTag = () => <span className="verify" title="Not verified — please check before you go">✱ verify first</span>

/** Gingham patch like the fabric scrap in the journal reference. */
export const Gingham = ({ className = '', style }: { className?: string; style?: CSSProperties }) => (
  <span className={`gingham ${className}`} style={style} aria-hidden />
)
