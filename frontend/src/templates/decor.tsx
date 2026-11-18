import type { CSSProperties } from 'react'

type P = { className?: string; style?: CSSProperties }
const S = (p: P, vb: string, children: React.ReactNode) => (
  <svg viewBox={vb} className={`dc ${p.className ?? ''}`} style={p.style} aria-hidden focusable="false">{children}</svg>
)

// ------------------------------------------------------------------------------------------ botanical (nature)
export const Fern = (p: P) => S(p, '0 0 120 260',
  <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M60 256C58 190 64 110 60 6" />
    {Array.from({ length: 12 }, (_, i) => { const y = 30 + i * 18, w = 46 - i * 2.4; return <g key={i}><path d={`M60 ${y}c-${w * 0.5} -6 -${w} -2 -${w} 10c${w * 0.5} 0 ${w * 0.9} -3 ${w} -10z`} fill="currentColor" fillOpacity=".14" /><path d={`M60 ${y}c${w * 0.5} -6 ${w} -2 ${w} 10c-${w * 0.5} 0 -${w * 0.9} -3 -${w} -10z`} fill="currentColor" fillOpacity=".14" /></g> })}
  </g>)

export const Sprig = (p: P) => S(p, '0 0 160 120',
  <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M6 112C40 96 82 70 150 14" />
    {[[24, 100, -40], [44, 90, 30], [58, 78, -40], [76, 64, 30], [92, 50, -40], [110, 36, 30], [128, 24, -40]].map(([x, y, r], i) => (
      <path key={i} d="M0 0c8-14 22-16 30-10-6 12-18 18-30 10z" transform={`translate(${x} ${y}) rotate(${r})`} fill="currentColor" fillOpacity=".16" />
    ))}
  </g>)

export const Pressed = (p: P) => S(p, '0 0 120 140',
  <g strokeLinecap="round">
    <path d="M60 138C58 100 62 76 60 52" fill="none" stroke="currentColor" strokeWidth="1.6" />
    <path d="M60 110c-14-4-26 0-30 10 12 6 24 2 30-10zM60 96c14-6 28-2 32 8-12 8-26 4-32-8z" fill="currentColor" fillOpacity=".2" stroke="currentColor" strokeWidth="1.2" />
    {Array.from({ length: 7 }, (_, i) => <ellipse key={i} cx="60" cy="30" rx="9" ry="22" transform={`rotate(${i * 51.4} 60 46)`} fill="var(--petal, #e0b9ae)" fillOpacity=".7" stroke="currentColor" strokeWidth="1" />)}
    <circle cx="60" cy="46" r="8" fill="var(--bud, #d9b86c)" stroke="currentColor" strokeWidth="1" />
  </g>)

export const Daisy = (p: P) => S(p, '0 0 80 80',
  <g strokeLinecap="round">
    {Array.from({ length: 10 }, (_, i) => <ellipse key={i} cx="40" cy="18" rx="6" ry="15" transform={`rotate(${i * 36} 40 40)`} fill="#fbf6ea" fillOpacity=".85" stroke="currentColor" strokeWidth="1" />)}
    <circle cx="40" cy="40" r="8" fill="var(--bud, #d9b86c)" stroke="currentColor" strokeWidth="1" />
  </g>)

export const Wreath = (p: P) => S(p, '0 0 400 400',
  <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <circle cx="200" cy="200" r="178" strokeDasharray="1 7" />
    {Array.from({ length: 28 }, (_, i) => { const a = (i / 28) * Math.PI * 2, r = 178; const x = 200 + Math.cos(a) * r, y = 200 + Math.sin(a) * r; return <path key={i} d="M0 0c7-12 20-14 27-8-5 10-16 16-27 8z" transform={`translate(${x} ${y}) rotate(${(a * 180) / Math.PI + (i % 2 ? 40 : -40)})`} fill="currentColor" fillOpacity=".18" /> })}
  </g>)

// ------------------------------------------------------------------------------------------ playful
export const Burst = (p: P & { text?: string }) => (
  <svg viewBox="0 0 160 160" className={`dc ${p.className ?? ''}`} style={p.style} aria-hidden focusable="false">
    <path d={Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2, r = i % 2 ? 62 : 78; return `${i ? 'L' : 'M'}${80 + Math.cos(a) * r} ${80 + Math.sin(a) * r}` }).join('') + 'Z'} fill="currentColor" stroke="#2b2118" strokeWidth="4" strokeLinejoin="round" />
    {p.text && (() => { const parts = p.text.split(/\s*·\s*/).slice(0, 2); const fs = Math.min(22, Math.floor(104 / Math.max(...parts.map((x) => x.length), 4) * 1.55)); return <text textAnchor="middle" fontFamily="'Bowlby One', 'Arial Black', sans-serif" fontSize={fs} fill="#2b2118">{parts.map((t, i) => <tspan key={i} x="80" y={parts.length > 1 ? 74 + i * (fs + 4) : 88}>{t}</tspan>)}</text> })()}
  </svg>
)
export const Squig = (p: P) => S(p, '0 0 140 20', <path d="M4 12q12-14 24 0t24 0 24 0 24 0 24 0 12-2" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />)
export const Heart = (p: P) => S(p, '0 0 40 40', <path d="M20 35C4 24 2 12 10 7c5-3 9 0 10 4 1-4 5-7 10-4 8 5 6 17-10 28z" fill="currentColor" stroke="#2b2118" strokeWidth="3" strokeLinejoin="round" />)
export const Cloud = (p: P) => S(p, '0 0 100 60', <path d="M22 52c-14 0-20-18-6-24 0-14 18-20 28-10 8-10 28-6 30 10 14 0 18 22 2 24z" fill="currentColor" stroke="#2b2118" strokeWidth="3" strokeLinejoin="round" />)
export const SunDoodle = (p: P) => S(p, '0 0 100 100', <g stroke="#2b2118" strokeWidth="3.5" strokeLinecap="round"><circle cx="50" cy="50" r="20" fill="currentColor" />{Array.from({ length: 10 }, (_, i) => <path key={i} d="M50 12v12" transform={`rotate(${i * 36} 50 50)`} />)}<path d="M42 50q8 8 16 0" fill="none" /><circle cx="43" cy="44" r="1.6" fill="#2b2118" /><circle cx="57" cy="44" r="1.6" fill="#2b2118" /></g>)
export const DoodleArrow = (p: P) => S(p, '0 0 120 70', <g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 50C30 10 70 6 108 36" /><path d="M88 22l22 14-4 -26" /></g>)
export const Zig = (p: P) => S(p, '0 0 140 16', <path d="M4 12l10-8 10 8 10-8 10 8 10-8 10 8 10-8 10 8 10-8 10 8 10-8 10 8" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />)
export const Confetti = ({ seed = 1 }: { seed?: number }) => {
  const cols = ['#ff6b6b', '#2ec4b6', '#7b5cff', '#ff9f1c', '#4cc9f0']
  let s = seed * 9301 + 49297
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280)
  return (
    <svg className="dc confetti" viewBox="0 0 794 1123" aria-hidden focusable="false">
      {Array.from({ length: 34 }, (_, i) => { const x = r() * 794, y = r() * 1123, k = i % 3, c = cols[i % cols.length], rot = r() * 360; return k === 0 ? <circle key={i} cx={x} cy={y} r={3 + r() * 4} fill={c} /> : k === 1 ? <rect key={i} x={x} y={y} width="10" height="5" rx="2" fill={c} transform={`rotate(${rot} ${x} ${y})`} /> : <path key={i} d={`M${x} ${y}l6 10 6-10`} fill="none" stroke={c} strokeWidth="2.6" strokeLinecap="round" /> })}
    </svg>
  )
}

// ------------------------------------------------------------------------------------------ editorial
export const Fleuron = (p: P) => S(p, '0 0 120 24', <g fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M4 12h38M78 12h38" /><path d="M60 3c6 6 6 12 0 18-6-6-6-12 0-18zM48 12c4-5 8-5 12 0-4 5-8 5-12 0zM60 12c4-5 8-5 12 0-4 5-8 5-12 0z" fill="currentColor" fillOpacity=".25" /></g>)
export const CropMarks = ({ className = '' }: { className?: string }) => (
  <svg className={`dc crop ${className}`} viewBox="0 0 794 1123" aria-hidden focusable="false"><g stroke="currentColor" strokeWidth="1" fill="none">{[[24, 24], [770, 24], [24, 1099], [770, 1099]].map(([x, y], i) => <path key={i} d={`M${x - 10} ${y}h20M${x} ${y - 10}v20`} />)}</g></svg>
)
export const Compass = (p: P) => S(p, '0 0 100 100', <g fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="50" cy="50" r="40" /><circle cx="50" cy="50" r="3" fill="currentColor" /><path d="M50 8l7 38-7 6-7-6zM50 92l-7-38 7-6 7 6z" fill="currentColor" fillOpacity=".15" /><path d="M8 50h84" /><text x="50" y="6" fontSize="8" textAnchor="middle" fill="currentColor" stroke="none" fontFamily="serif">N</text></g>)
