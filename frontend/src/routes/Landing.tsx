import { useMemo } from 'react'
import { ArrowRight, BookOpen, Download, MapPinned, Sparkles } from 'lucide-react'
import { SiteFooter, SiteHeader } from '../components/site/Site'
import { Link, navigate } from '../lib/router'
import { useStore } from '../store'
import { SAMPLE } from '../data/sample'
import { buildPages } from '../lib/pages'
import type { PageSpec } from '../lib/pages'
import { JournalProvider, PageView } from '../components/pages/Provider'
import { FitBox, ScaledPage } from '../components/scrap/ScaledPage'
import { Illo } from '../components/scrap/Illustrations'
import { Compass, RoundStamp } from '../components/scrap/Decor'
import type { IlloName } from '../lib/art'

const STEPS: { title: string; text: string; note: string; illo: IlloName; icon: typeof MapPinned }[] = [
  { title: 'Tell us where you want to go', text: 'A destination and how many days — that is all we need to begin.', note: 'kyoto? lisbon? you pick!', illo: 'plane', icon: MapPinned },
  { title: 'Personalise your preferences', text: 'Add interests, budget, pace and any must-haves. Skip whatever you like.', note: 'cafés > crowds, obviously', illo: 'cup', icon: Sparkles },
  { title: 'Let AI create your travel journal', text: 'Gemini writes the places, food, route and day-by-day story; we arrange it into pages.', note: 'about a minute of magic', illo: 'sun', icon: BookOpen },
  { title: 'Explore and download your scrapbook', text: 'Flip through every page, then save the whole journal as a PDF to print or take along.', note: 'tuck it in your bag', illo: 'camera', icon: Download },
]

export default function Landing() {
  const { openSample } = useStore()
  const pages = useMemo(() => buildPages(SAMPLE.journal), [])
  const at = (pred: (p: PageSpec) => boolean) => {
    const i = pages.findIndex(pred)
    return { spec: pages[i], n: i + 1 }
  }
  const cover = at((p) => p.kind === 'cover')
  const map = at((p) => p.kind === 'map')
  const day = at((p) => p.kind === 'day')
  const peek = [
    at((p) => p.kind === 'destination'),
    at((p) => p.kind === 'map'),
    at((p) => p.kind === 'places'),
    at((p) => p.kind === 'food'),
    at((p) => p.kind === 'day'),
    at((p) => p.kind === 'notes'),
  ]
  const rot = [-2.2, 1.6, -1.2, 2, -1.8, 1.2]

  const openSampleJournal = () => {
    openSample()
    navigate('/sample')
  }

  return (
    <div className="min-h-screen">
      <JournalProvider data={SAMPLE} photos={{}}>
        {/* ============================== HERO ============================== */}
        <section className="paper-bg overflow-hidden" aria-labelledby="hero-h">
          <svg className="lp-river" style={{ left: '-5%', top: '34%', width: '110%', height: 160 }} viewBox="0 0 1000 160" preserveAspectRatio="none" aria-hidden>
            <path d="M0 70C140 10 260 130 420 80S700 20 860 90 960 70 1000 50V120C950 140 880 150 820 130S560 100 420 140 120 170 0 120Z" fill="currentColor" />
          </svg>
          <SiteHeader />
          <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] items-center gap-6 px-5 pb-16 pt-4 md:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)] lg:gap-4 lg:pb-24">
            <div className="relative z-10 max-w-xl">
              <p className="eyebrow mb-5">an ai travel scrapbook · made just for you</p>
              <h1 id="hero-h" className="font-display text-[3.1rem] leading-[1.02] text-ink sm:text-6xl lg:text-[4.6rem]">
                Your trip, kept like a <span className="hl-red">diary</span>.
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink/80">
                Tell us where you are headed. We write, draw and arrange a hand-crafted travel journal — an illustrated map, places worth
                wandering to, cafés, a day-by-day route — ready to flip through and save as a PDF.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link to="/create" className="btn btn-primary">
                  Start creating <ArrowRight size={18} aria-hidden />
                </Link>
                <Link to="/memories" className="btn btn-ghost">
                  Turn memories into a book
                </Link>
                <button type="button" className="btn btn-ghost" onClick={openSampleJournal}>
                  Peek at a sample
                </button>
              </div>
              <p className="note-hand mt-5 flex items-center gap-2 text-[1.5rem]">
                <span aria-hidden>✎</span> one minute · no sign-up · yours to keep
              </p>
              <div className="mt-8 hidden items-end gap-5 sm:flex" aria-hidden>
                {(['temple', 'cup', 'tower'] as IlloName[]).map((n, i) => (
                  <div key={n} className="t-greige stk h-[74px] w-[74px]" style={{ transform: `rotate(${[-6, 4, -3][i]}deg)` }}>
                    <Illo name={n} />
                  </div>
                ))}
                <Compass className="h-20 w-20 text-ink/70" />
              </div>
            </div>

            <div className="relative z-10 mx-auto w-full max-w-[640px]" aria-label="A sample travel journal, three pages fanned out">
              <FitBox width={640} height={720}>
                <svg className="absolute inset-0" width="640" height="720" viewBox="0 0 640 720" aria-hidden style={{ zIndex: 1 }}>
                  <path d="M8 660C80 690 150 640 200 668S330 700 400 650 470 560 540 520 640 440 600 380 500 330 560 260 628 150 596 60" fill="none" stroke="#e2483d" strokeWidth="9" strokeLinecap="round" strokeDasharray="1 17" opacity=".95" />
                  {[[40, 664], [330, 686], [586, 484], [596, 70]].map(([x, y], i) => (
                    <g key={i}>
                      <circle cx={x} cy={y} r="17" fill="#e2483d" stroke="#fffaf0" strokeWidth="3" />
                      <text x={x} y={y + 6} textAnchor="middle" fontFamily="'Permanent Marker', cursive" fontSize="17" fill="#fff">{i + 1}</text>
                    </g>
                  ))}
                </svg>
                <div className="lp-page-wrap" style={{ left: -6, top: 118, transform: 'rotate(-7deg)', zIndex: 2 }}>
                  <ScaledPage scale={0.46}><PageView spec={map.spec} n={map.n} /></ScaledPage>
                </div>
                <div className="lp-page-wrap" style={{ left: 262, top: 96, transform: 'rotate(6deg)', zIndex: 3 }}>
                  <ScaledPage scale={0.46}><PageView spec={day.spec} n={day.n} /></ScaledPage>
                </div>
                <div className="lp-page-wrap" style={{ left: 104, top: 16, transform: 'rotate(-1.5deg)', zIndex: 4 }}>
                  <ScaledPage scale={0.54}><PageView spec={cover.spec} n={cover.n} /></ScaledPage>
                </div>
                <span className="lp-tape" style={{ left: 262, top: 6, transform: 'rotate(-5deg)', zIndex: 8 }} aria-hidden />
                <span className="lp-tape" style={{ left: 18, top: 108, transform: 'rotate(-34deg)', zIndex: 8 }} aria-hidden />
                <span className="lp-tape" style={{ left: 558, top: 98, transform: 'rotate(38deg)', zIndex: 8 }} aria-hidden />
                <RoundStamp top="kyoto · japan" bottom="sample journal" center="✈" style={{ right: -6, top: 482, width: 128, height: 128, zIndex: 9, color: '#1d2766' }} />
                <div className="note-hand absolute flex items-center gap-1 text-[1.7rem]" style={{ left: 6, top: 30, zIndex: 9, transform: 'rotate(-5deg)', maxWidth: 150 }}>
                  <span>a real sample, page by page</span>
                </div>
              </FitBox>
            </div>
          </div>
        </section>

        {/* ============================== HOW IT WORKS ============================== */}
        <section id="how" className="paper-bg border-y-2 border-ink/80 px-5 py-20 md:px-10" aria-labelledby="how-h" style={{ scrollMarginTop: 0 }}>
          <div className="mx-auto max-w-7xl">
            <div className="mb-14 flex flex-wrap items-end gap-x-6 gap-y-2">
              <h2 id="how-h" className="font-display text-4xl text-ink md:text-5xl">How it works</h2>
              <span className="note-hand text-3xl" style={{ transform: 'rotate(-3deg)' }}>four little steps →</span>
            </div>
            <ol className="lp-steps grid gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {STEPS.map((s, i) => (
                <li key={s.title} className="relative flex flex-col items-start" style={{ transform: `rotate(${[-0.8, 0.6, -0.5, 0.9][i]}deg)` }}>
                  <span className="lp-num" aria-hidden>{i + 1}</span>
                  <div className="lp-card mt-6 w-full p-5 pt-6">
                    <div className="t-greige stk mb-4 h-24 w-24" style={{ transform: `rotate(${[-5, 4, -3, 5][i]}deg)` }} aria-hidden>
                      <Illo name={s.illo} />
                    </div>
                    <h3 className="font-display text-[1.45rem] leading-tight text-ink">
                      <span className="sr-only">Step {i + 1}: </span>{s.title}
                    </h3>
                    <p className="mt-2 text-[0.98rem] leading-relaxed text-ink/80">{s.text}</p>
                    <p className="note-hand mt-3 text-[1.45rem]">{s.note}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ============================== TWO WAYS ============================== */}
        <section id="two-ways" className="px-5 py-20 md:px-10" aria-labelledby="two-h" style={{ background: '#f1e6cd', scrollMarginTop: 0 }}>
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-wrap items-end gap-x-6 gap-y-2">
              <h2 id="two-h" className="font-display text-4xl text-ink md:text-5xl">Two ways to make a book</h2>
              <span className="note-hand text-3xl" style={{ transform: 'rotate(-3deg)' }}>before the trip, or after →</span>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <article className="lp-card relative p-7">
                <p className="font-type text-xs uppercase tracking-[.2em] text-maroon">option a · plan a future trip</p>
                <h3 className="mt-2 font-display text-3xl leading-tight text-ink">A journal for the trip you are about to take</h3>
                <p className="mt-3 text-[1.02rem] leading-relaxed text-ink/80">Tell us where and for how long. Gemini writes the places, food, route and a day-by-day plan.</p>
                <Link to="/create" className="btn btn-primary mt-6">Plan a trip <ArrowRight size={18} aria-hidden /></Link>
              </article>
              <article className="lp-card relative p-7">
                <p className="font-type text-xs uppercase tracking-[.2em] text-maroon">option b · remember a trip you took</p>
                <h3 className="mt-2 font-display text-3xl leading-tight text-ink">Turn your memories into a travel book</h3>
                <p className="mt-3 text-[1.02rem] leading-relaxed text-ink/80">Answer eight easy questions, add your own photographs, and we arrange them into a keepsake — without inventing a single memory.</p>
                <Link to="/memories" className="btn btn-primary mt-6">Make a memory book <ArrowRight size={18} aria-hidden /></Link>
              </article>
            </div>
            <p className="mt-8 text-center font-type text-xs uppercase tracking-[.18em] text-ink/65">five scrapbook styles · saved in your browser · PDF for both · <Link to="/collection" className="underline decoration-dotted underline-offset-4">open My Travel Collection</Link></p>
          </div>
        </section>

        {/* ============================== SAMPLE PREVIEW ============================== */}
        <section id="sample" className="lp-peek relative py-20" aria-labelledby="peek-h">
          <div className="mx-auto mb-4 flex max-w-7xl flex-wrap items-end justify-between gap-6 px-5 md:px-10">
            <div>
              <p className="eyebrow" style={{ color: '#d98a1f' }}>a peek inside · sample: Kyoto, 3 days</p>
              <h2 id="peek-h" className="mt-3 font-display text-4xl md:text-5xl" style={{ color: '#1d2766' }}>
                Not a list. A <span style={{ fontStyle: 'italic' }}>publication.</span>
              </h2>
              <p className="mt-3 max-w-xl text-lg leading-relaxed" style={{ color: '#1d2766cc' }}>
                Every journal gets a cover, an illustrated route, place pages, a food guide, a page for each day and a notes page of its own. Scroll sideways.
              </p>
            </div>
            <button type="button" className="btn btn-mustard" onClick={openSampleJournal}>
              Flip through the sample <ArrowRight size={18} aria-hidden />
            </button>
          </div>
          <div className="lp-peek-row" tabIndex={0} role="region" aria-label="Sample journal pages, scrollable">
            {peek.map(({ spec, n }, i) => (
              <figure key={spec.id} className="lp-peek-item m-0" style={{ transform: `rotate(${rot[i]}deg)` }}>
                <div className="relative" style={{ filter: 'drop-shadow(0 12px 16px rgba(29,39,102,.3))' }}>
                  <ScaledPage scale={0.42}><PageView spec={spec} n={n} /></ScaledPage>
                </div>
                <figcaption className="mt-4 font-type text-sm uppercase tracking-[.18em]" style={{ color: '#1d2766' }}>
                  {String(n).padStart(2, '0')} · {spec.label}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* ============================== CTA ============================== */}
        <section className="lp-cta px-5 py-20 text-center md:px-10" aria-labelledby="cta-h">
          <p className="eyebrow" style={{ color: '#7b2a3d' }}>your turn</p>
          <h2 id="cta-h" className="mx-auto mt-3 max-w-3xl font-display text-5xl leading-[1.02] md:text-7xl">
            Where to <span style={{ color: '#e2483d', WebkitTextStroke: '0' }}>next?</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-lg text-ink/80">Give us a place and a few days. We will start the first page.</p>
          <Link to="/create" className="btn btn-primary mt-9">
            Start creating <ArrowRight size={18} aria-hidden />
          </Link>
        </section>
      </JournalProvider>
      <SiteFooter />
    </div>
  )
}
