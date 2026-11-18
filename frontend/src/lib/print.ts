/** Wait for web fonts and every image inside the print root (max ~5s), then open the print dialog. */
export async function printJournal(): Promise<void> {
  const root = document.querySelector('.print-root')
  const waits: Promise<unknown>[] = []
  try { if (document.fonts?.ready) waits.push(document.fonts.ready) } catch { /* ignore */ }
  root?.querySelectorAll('img').forEach((img) => {
    if (!img.complete) waits.push(new Promise((r) => { img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true }) }))
  })
  await Promise.race([Promise.all(waits), new Promise((r) => setTimeout(r, 5000))])
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  window.print()
}
