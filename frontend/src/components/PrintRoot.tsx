import { createPortal } from 'react-dom'
import type { BookPages } from './book/BookRenderer'

/**
 * Every book page, stacked at full size, rendered straight into <body>.
 * Hidden on screen; the @media print rules in scrapbook.css show ONLY this and put each page on its own A4 sheet.
 */
export default function PrintRoot({ book }: { book: BookPages }) {
  return createPortal(
    <div className="print-root" aria-hidden>
      <book.Provider>
        {book.pages.map((p, i) => <div className="print-page" key={p.id}>{p.node(i + 1)}</div>)}
      </book.Provider>
    </div>,
    document.body,
  )
}
