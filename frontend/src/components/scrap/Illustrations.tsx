import type { ReactNode } from 'react'
import type { IlloName } from '../../lib/art'

/**
 * Original hand-drawn-style line illustrations (SVG). Ink/fill colours come from the page theme via CSS variables,
 * and the shared #rough filter (see RoughDefs) gives the lines their wobbly pen feel.
 * Classes: f = themed fill, a = accent fill, p = paper fill.
 */
export function RoughDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden focusable="false">
      <defs>
        <filter id="rough" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="rough-lg" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="9" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  )
}

const ART: Record<IlloName, ReactNode> = {
  temple: (
    <>
      <path d="M60 6v14" />
      <path className="a" d="M60 20l-5 8h10z" />
      <path className="f" d="M34 42q26-14 52 0l8 8H26z" />
      <path className="p" d="M42 50h36v14H42z" />
      <path d="M50 50v14M60 50v14M70 50v14" />
      <path className="f" d="M22 66q38-18 76 0l9 9H13z" />
      <path className="p" d="M32 75h56v14H32z" />
      <path d="M44 75v14M76 75v14" />
      <path className="a" d="M54 89V78h12v11z" />
      <path className="f" d="M12 92q48-20 96 0l9 9H3z" />
      <path className="p" d="M20 101h80v10H20z" />
      <path d="M32 101v10M48 101v10M72 101v10M88 101v10" />
    </>
  ),
  church: (
    <>
      <path d="M60 4v14M54 9h12" />
      <path className="a" d="M50 38l10-22 10 22z" />
      <path className="p" d="M50 38h20v30H50z" />
      <path className="f" d="M55 46a5 5 0 0 1 10 0v8H55z" />
      <path className="f" d="M16 70l30-14v14M104 70L74 56v14" />
      <path className="p" d="M20 70h80v40H20z" />
      <path className="f" d="M60 80a9 9 0 0 1 9 9v21H51V89a9 9 0 0 1 9-9z" />
      <path className="a" d="M30 84a4 4 0 0 1 8 0v8h-8zM82 84a4 4 0 0 1 8 0v8h-8z" />
      <path d="M12 110h96" />
    </>
  ),
  tower: (
    <>
      <path d="M60 4v16" />
      <path className="a" d="M56 20h8l3 16H53z" />
      <path className="f" d="M53 36h14l5 34H48z" />
      <path className="p" d="M40 70h40v8H40z" />
      <path className="f" d="M46 78h28l13 32H33z" />
      <path d="M52 78l-8 32M68 78l8 32M49 94h22M45 104h30" />
      <path d="M57 44h6M56 56h8" />
    </>
  ),
  museum: (
    <>
      <path className="a" d="M60 12l46 24H14z" />
      <path className="p" d="M14 36h92v8H14z" />
      <path className="f" d="M24 44h10v50H24zM44 44h10v50H44zM66 44h10v50H66zM86 44h10v50H86z" />
      <path className="p" d="M16 94h88v8H16z" />
      <path className="f" d="M10 102h100v8H10z" />
      <circle cx="60" cy="27" r="4" />
    </>
  ),
  castle: (
    <>
      <path className="f" d="M14 50h18V26h-4v-6h6v4h6v-4h6v4h6V20h-4v30" />
      <path className="f" d="M14 20h8v6H14zM26 20h8v6h-8z" />
      <path className="p" d="M10 52h100v58H10z" />
      <path className="f" d="M42 36h36v16H42zM46 24v12M54 24v12M62 24v12M70 24v12" />
      <path className="f" d="M88 50V24h-6v-6h8v4h6v-4h8v6h-6v26" />
      <path className="a" d="M50 110V88a10 10 0 0 1 20 0v22z" />
      <path d="M24 72h8v10h-8zM88 72h8v10h-8z" />
    </>
  ),
  market: (
    <>
      <path className="a" d="M12 36h96l-8 22H20z" />
      <path className="p" d="M32 36l-4 22M52 36l-2 22M72 36l2 22M92 36l4 22" />
      <path d="M16 58q6 8 12 0 6 8 12 0 6 8 12 0 6 8 12 0 6 8 12 0 6 8 12 0" />
      <path d="M20 60v48M100 60v48" />
      <path className="f" d="M26 88h68v22H26z" />
      <circle className="a" cx="40" cy="82" r="6" />
      <circle className="f" cx="56" cy="83" r="6" />
      <circle className="a" cx="72" cy="82" r="6" />
      <circle className="f" cx="86" cy="83" r="5" />
    </>
  ),
  mountain: (
    <>
      <circle className="a" cx="92" cy="26" r="11" />
      <path className="f" d="M4 104L42 32l22 38 14-22 38 56z" />
      <path className="p" d="M42 32l-10 19 8-4 7 6 6-8z" />
      <path d="M64 70l-8 12 10-4M78 48l-6 10 8-3" />
      <path d="M4 110h112" />
    </>
  ),
  tree: (
    <>
      <path className="f" d="M60 14c-18 0-30 12-28 26-10 4-12 22 2 26 4 10 22 12 28 4 12 6 28-4 26-16 10-8 6-28-10-28-4-10-14-12-18-12z" />
      <path className="p" d="M54 110c1-16 1-30-6-42M60 110V56M66 110c-1-16 2-26 8-36" />
      <path d="M40 110h40M20 100q4-8 8 0M92 102q4-8 8 0" />
    </>
  ),
  houses: (
    <>
      <path className="f" d="M8 110V50l12-12 12 12v60z" />
      <path className="a" d="M36 110V40l14-14 14 14v70z" />
      <path className="p" d="M68 110V56l12-12 12 12v54z" />
      <path className="f" d="M96 110V62l10-10 10 10v48z" />
      <path d="M14 62h12M14 78h12M14 94h12M42 54h16M42 70h16M42 86h16M74 68h12M74 84h12M74 100h12M101 74h10M101 90h10" />
      <path d="M50 26v-8M4 110h112" />
    </>
  ),
  boat: (
    <>
      <path d="M60 10v66" />
      <path className="f" d="M64 14l30 52H64z" />
      <path className="a" d="M56 22L30 66h26z" />
      <path className="p" d="M20 78h80l-12 20H34z" />
      <path d="M6 108q8-8 16 0t16 0 16 0 16 0 16 0 14 0" />
    </>
  ),
  bridge: (
    <>
      <path className="f" d="M4 50h112v10H4z" />
      <path className="p" d="M12 60v50h18V60M46 60v50h18V60M82 60v50h18V60" />
      <path d="M30 110a16 36 0 0 1 16 0M64 110a18 36 0 0 1 18 0" />
      <path d="M12 50V36M30 50V36M48 50V36M66 50V36M84 50V36M102 50V36M12 38h96" />
      <path d="M4 110h112" />
    </>
  ),
  bowl: (
    <>
      <path d="M44 24q-6 8 0 16M60 18q-6 10 0 20M76 24q-6 8 0 16" />
      <path className="f" d="M16 56h88a44 44 0 0 1-88 0z" />
      <path className="p" d="M26 56c6-10 14-10 20 0 6-10 14-10 20 0 6-10 14-10 20 0" />
      <path d="M88 20L66 58M96 24L74 58" />
      <path d="M44 106h32" />
    </>
  ),
  cup: (
    <>
      <path d="M44 18q-6 8 0 16M58 12q-6 10 0 20M72 18q-6 8 0 16" />
      <path className="p" d="M28 44h58v28a24 24 0 0 1-24 24H52a24 24 0 0 1-24-24z" />
      <path className="a" d="M30 50h54v8H30z" />
      <path d="M86 52h8a10 10 0 0 1 0 22h-9" />
      <path className="f" d="M16 102q44 14 88 0-4 8-44 10T16 102z" />
    </>
  ),
  plate: (
    <>
      <circle className="p" cx="60" cy="62" r="40" />
      <circle className="f" cx="60" cy="62" r="26" />
      <path className="a" d="M48 58q12-14 24 0-6 14-12 14t-12-14z" />
      <path d="M12 30v32q0 6 4 6t4-6V30M16 68v30M104 30c-6 6-8 20-4 34h-2v34" />
    </>
  ),
  cake: (
    <>
      <path className="f" d="M16 96l80-50 8 18-80 40z" />
      <path className="a" d="M16 96l80-50 8 18-40 24z" />
      <path className="p" d="M24 82l52-32M30 96l52-32" />
      <circle className="a" cx="84" cy="36" r="6" />
      <path d="M84 30c2-6 6-8 10-8" />
      <path d="M10 110h100" />
    </>
  ),
  bed: (
    <>
      <path className="f" d="M10 46h8v62h-8zM102 62h8v46h-8z" />
      <path className="p" d="M18 74h84v18H18z" />
      <path className="a" d="M22 56h30a8 8 0 0 1 8 8v10H22z" />
      <path className="f" d="M60 66h42v8H60z" />
      <path d="M18 92v16M102 92v16" />
      <path d="M72 30l4 6-4 6M86 24l3 5-3 5" />
    </>
  ),
  hotel: (
    <>
      <path className="f" d="M22 110V24h76v86z" />
      <path className="a" d="M44 12h32v10H44z" />
      <path className="p" d="M32 36h14v12H32zM53 36h14v12H53zM74 36h14v12H74zM32 58h14v12H32zM53 58h14v12H53zM74 58h14v12H74z" />
      <path className="a" d="M50 110V88h20v22z" />
      <path d="M12 110h96M50 17h20" />
    </>
  ),
  camera: (
    <>
      <path className="f" d="M12 38h28l6-10h28l6 10h28v66H12z" />
      <circle className="p" cx="60" cy="68" r="24" />
      <circle className="a" cx="60" cy="68" r="12" />
      <path d="M26 30h10M88 52h8M54 62q4-4 8-2" />
    </>
  ),
  plane: (
    <>
      <path className="p" d="M8 62l40-10L24 18h12l44 30 28-8c8-2 10 6 2 10l-28 10 4 44H70L56 64 24 74l-8 12H8l6-18z" />
      <path d="M58 56l8 4M92 50l8-2" />
    </>
  ),
  train: (
    <>
      <path className="f" d="M16 30h74a14 14 0 0 1 14 14v46H16z" />
      <path className="p" d="M26 40h20v22H26zM54 40h20v22H54z" />
      <path className="a" d="M82 40h14v22H82z" />
      <path d="M16 78h88" />
      <circle className="p" cx="38" cy="98" r="10" />
      <circle className="p" cx="78" cy="98" r="10" />
      <path d="M8 110h104M28 24h20" />
    </>
  ),
  sun: (
    <>
      <circle className="a" cx="60" cy="60" r="22" />
      <path d="M60 14v14M60 92v14M14 60h14M92 60h14M28 28l10 10M82 82l10 10M92 28L82 38M38 82L28 92" />
    </>
  ),
  fish: (
    <>
      <path className="f" d="M10 60q28-36 66-10l28-18v56L76 70q-38 26-66-10z" />
      <circle className="p" cx="34" cy="56" r="4" />
      <path d="M52 44q6 16 0 32M62 46q6 14 0 28" />
    </>
  ),
  palm: (
    <>
      <path className="f" d="M58 112c2-26 0-46-6-62h10c4 18 6 38 4 62z" />
      <path className="a" d="M60 48C44 30 22 34 12 50c16-6 30-4 48-2zM60 48C76 28 98 32 108 48c-16-6-30-4-48 0zM60 46C58 28 44 14 28 12c12 8 20 18 32 34zM60 46C64 28 78 14 94 14c-12 6-22 18-34 32z" />
      <circle className="p" cx="56" cy="52" r="4" /><circle className="p" cx="66" cy="54" r="4" />
      <path d="M16 112h88" />
    </>
  ),
  pine: (
    <>
      <path className="f" d="M60 6L36 40h14L28 70h18L22 100h76L74 70h18L70 40h14z" />
      <path className="a" d="M54 100h12v14H54z" />
      <path d="M60 40v28M46 70l14 14 14-14" />
    </>
  ),
  windmill: (
    <>
      <path className="p" d="M44 112l6-52h20l6 52z" />
      <path className="a" d="M50 60l10-14 10 14z" />
      <circle className="f" cx="60" cy="46" r="5" />
      <path className="f" d="M60 46L24 28l-4 8zM60 46l36 18 4-8zM60 46L44 8l-8 4zM60 46l16 38 8-4z" />
      <path d="M54 112V92h12v20" />
    </>
  ),
  lantern: (
    <>
      <path d="M60 4v16M44 20h32" />
      <path className="a" d="M44 20c-14 14-14 56 0 70h32c14-14 14-56 0-70z" />
      <path className="p" d="M50 34c-6 10-6 36 0 46M70 34c6 10 6 36 0 46" />
      <path d="M44 90h32M52 90v8M68 90v8M60 98v14M54 112h12" />
    </>
  ),
  dome: (
    <>
      <path d="M60 4v14" />
      <path className="a" d="M60 18c-26 0-38 20-38 40h76c0-20-12-40-38-40z" />
      <path className="p" d="M26 58h68v44H26z" />
      <path className="f" d="M50 102V80a10 10 0 0 1 20 0v22z" />
      <path d="M16 102h88M16 58h88M12 58v44M108 58v44" />
    </>
  ),
  lotus: (
    <>
      <path className="a" d="M60 24c-14 14-14 40 0 54 14-14 14-40 0-54z" />
      <path className="f" d="M60 80c-26-2-42-18-46-40 22 0 38 12 46 40zM60 80c26-2 42-18 46-40-22 0-38 12-46 40z" />
      <path className="p" d="M60 82C40 78 22 84 12 98c22 6 36 4 48-16zM60 82c20-4 38 2 48 16-22 6-36 4-48-16z" />
      <path d="M20 108q20 8 40 0t40 0" />
    </>
  ),
}

export function Illo({ name, className = '' }: { name: IlloName; className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={`illo ${className}`} aria-hidden focusable="false">
      <g className="il" filter="url(#rough)">{ART[name] ?? ART.houses}</g>
    </svg>
  )
}
