import { useEffect, useState } from 'react'
import { Plane, X } from 'lucide-react'

const MEMORY_MESSAGES = (dest: string) => [
  `Reading what you told us about ${dest}…`,
  'Writing small captions in your voice…',
  'Matching your photographs to their pages…',
  'Leaving blank what you left blank…',
  'Binding the pages together…',
]

const MESSAGES = (dest: string) => [
  `Sketching the map of ${dest}…`,
  'Choosing places worth a detour…',
  'Finding cafés and local dishes…',
  'Folding the route into days…',
  'Writing the little handwritten notes…',
  'Taping in the stamps and tickets…',
]

/** Full-screen "your journal is being made" state, with a cancel button. */
export default function Generating({ destination, days, onCancel, mode = 'plan' }: { destination: string; days: number; onCancel: () => void; mode?: 'plan' | 'memory' }) {
  const [i, setI] = useState(0)
  const [secs, setSecs] = useState(0)
  const msgs = mode === 'memory' ? MEMORY_MESSAGES(destination) : MESSAGES(destination)

  useEffect(() => {
    const a = window.setInterval(() => setI((v) => (v + 1) % msgs.length), 3200)
    const b = window.setInterval(() => setSecs((v) => v + 1), 1000)
    return () => { window.clearInterval(a); window.clearInterval(b) }
  }, [msgs.length])

  return (
    <div className="gen-overlay" role="alertdialog" aria-modal="true" aria-labelledby="gen-title" aria-describedby="gen-msg">
      <div className="gen-card">
        <p className="eyebrow">now writing</p>
        <h2 id="gen-title" className="mt-2 font-display text-3xl leading-tight text-ink">
          {mode === 'memory' ? `Your ${destination} memory book` : `Your ${days}-day ${destination} journal`}
        </h2>
        <svg className="gen-route mt-3" viewBox="0 0 400 90" aria-hidden>
          <path className="path" d="M10 70C70 10 120 90 200 45S330 10 385 40" fill="none" stroke="#e2483d" strokeWidth="5" strokeLinecap="round" />
          <circle cx="10" cy="70" r="9" fill="#e2483d" /><circle cx="385" cy="40" r="9" fill="#1d2766" />
        </svg>
        <div className="bob -mt-2 flex justify-center text-navy" aria-hidden><Plane size={34} /></div>
        <p id="gen-msg" className="mt-3 min-h-[2.2rem] font-hand text-[1.7rem] font-bold leading-none text-brick" aria-live="polite">
          {msgs[i]}
        </p>
        <p className="mt-2 font-type text-sm text-ink/70">
          {secs < 45 ? `This usually takes 20–60 seconds · ${secs}s` : `Still working — longer trips take a little more time · ${secs}s`}
        </p>
        <button type="button" className="btn btn-ghost btn-sm mt-6" onClick={onCancel}>
          <X size={15} aria-hidden /> Cancel
        </button>
      </div>
    </div>
  )
}
